import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatService } from '../../../services/chatService';
import MessageBubble from './MessageBubble';
import { toast } from 'react-toastify';

// ─── Suggested prompts ────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: '🔍', text: 'Research top AI trends this week' },
  { icon: '📊', text: "Analyze my brand's social media performance" },
  { icon: '✍️', text: 'Draft a LinkedIn post about our product launch' },
  { icon: '🌐', text: 'Scrape and summarize competitor pricing pages' },
];

// ─── Extract clarifying questions from any orchestrator result ────────────────
function extractClarifyingQuestions(executionResults = {}) {
  for (const key of Object.keys(executionResults)) {
    const result = executionResults[key];
    if (result?.needs_clarification && Array.isArray(result?.clarifying_questions) && result.clarifying_questions.length > 0) {
      return result.clarifying_questions; // [{ id, question }, ...]
    }
  }
  return [];
}

// ─── Format collected answers as a single query string ───────────────────────
// Output: "campaign_name: Summer Launch 2026, objective: brand awareness, duration: 1 month"
function formatAnswers(questions, answers) {
  return questions
    .map(q => `${q.id}: ${answers[q.id] || ''}`)
    .join(', ');
}

export default function ChatWindow({ activeConversationId, creatingSession, onNewChat }) {
  const [input, setInput]         = useState('');
  const [messages, setMessages]   = useState([]);
  const [isSending, setIsSending] = useState(false);

  // ── Clarification state machine ───────────────────────────────────────────
  // clarifyQueue: [{ id, question }, ...]  — questions still to ask
  // clarifyIndex: which question we're on (0-based)
  // clarifyAnswers: { id: answer, ... } — collected so far
  const [clarifyQueue,   setClarifyQueue]   = useState([]);
  const [clarifyIndex,   setClarifyIndex]   = useState(0);
  const [clarifyAnswers, setClarifyAnswers] = useState({});
  // inClarifyMode: true as long as there are questions AND we haven't finished answering all of them.
  // Uses <= so the LAST question (clarifyIndex === clarifyQueue.length) is still treated as clarify mode.
  const inClarifyMode = clarifyQueue.length > 0 && clarifyIndex <= clarifyQueue.length;

  const scrollRef = useRef(null);
  const inputRef  = useRef(null);

  // Clear everything when session changes
  useEffect(() => {
    setMessages([]);
    setInput('');
    setClarifyQueue([]);
    setClarifyIndex(0);
    setClarifyAnswers({});
    if (!creatingSession && activeConversationId) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [activeConversationId]);

  // Smooth scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isSending]);

  // ── Main Brain API call ───────────────────────────────────────────────────
  const callBrainAgent = useCallback(async (userQuery, sessionIdOverride) => {
    setIsSending(true);
    try {
      const targetSessionId = sessionIdOverride || activeConversationId;
      const brainResponse = await chatService.runBrainAgent(targetSessionId, userQuery);
      const payload = brainResponse?.data ?? brainResponse;

      const replyText =
        payload?.finalAnswer ||
        payload?.response    ||
        payload?.message     ||
        'No response received.';

      const targetOrchestrators = payload?.targetOrchestrators || [];
      const executionResults    = payload?.executionResults    || {};
      const inScope             = payload?.inScope             ?? true;

      // Detect if we need clarification
      const clarifyingQuestions = extractClarifyingQuestions(executionResults);
      const needsClarification  = clarifyingQuestions.length > 0;

      if (needsClarification) {
        // ── Enter clarification mode ──────────────────────────────────────
        // Don't show the raw "CLARIFICATION REQUIRED" markdown.
        // Instead, ask the FIRST question immediately as an AI message.
        const firstQ = clarifyingQuestions[0];
        setMessages(prev => [...prev, {
          role: 'ASSISTANT',
          content: firstQ.question,
          isClarification: true,
          clarifyStep: 1,
          clarifyTotal: clarifyingQuestions.length,
          targetOrchestrators,
          inScope,
        }]);

        setClarifyQueue(clarifyingQuestions);
        setClarifyIndex(1); // next question to ask after user answers #0
        setClarifyAnswers({});
      } else {
        // ── Normal response ───────────────────────────────────────────────
        setMessages(prev => [...prev, {
          role: 'ASSISTANT',
          content: replyText,
          targetOrchestrators,
          executionResults,
          inScope,
          sources: [],
        }]);
        // Clear any stale clarification state
        setClarifyQueue([]);
        setClarifyIndex(0);
        setClarifyAnswers({});
      }
    } catch (err) {
      console.error('Brain agent request failed', err);
      setMessages(prev => prev.slice(0, -1));
      toast.error(err.response?.data?.message || 'Failed to get a response. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [activeConversationId]);

  // ── Handle user submit (normal OR clarification answer) ──────────────────
  const handleSubmit = useCallback(async (queryText) => {
    const trimmed = (queryText ?? input).trim();
    if (!trimmed || isSending) return;

    let currentSessionId = activeConversationId;
    
    // Auto-create session if this is the first message!
    if (!currentSessionId) {
       currentSessionId = await onNewChat();
       if (!currentSessionId) return; // toast error is handled in onNewChat
    }

    setInput('');

    if (inClarifyMode) {
      // ── Clarification answer ─────────────────────────────────────────────
      const currentQ  = clarifyQueue[clarifyIndex - 1];
      const newAnswers = { ...clarifyAnswers, [currentQ.id]: trimmed };
      setClarifyAnswers(newAnswers);

      // Show user's answer as a message
      setMessages(prev => [...prev, { role: 'USER', content: trimmed }]);

      const isLastQuestion = clarifyIndex >= clarifyQueue.length;

      if (isLastQuestion) {
        // ── All questions answered → format & send to API ─────────────────
        const combinedQuery = formatAnswers(clarifyQueue, newAnswers);

        // Show a "submitting" AI message while we wait
        setMessages(prev => [...prev, {
          role: 'ASSISTANT',
          content: '✅ Got all the details! Processing your request…',
          isSummary: true,
        }]);

        // Reset clarification state before calling API
        setClarifyQueue([]);
        setClarifyIndex(0);
        setClarifyAnswers({});

        // Call the brain API with the combined formatted answer
        await callBrainAgent(combinedQuery, currentSessionId);
      } else {
        // ── More questions remain → ask next one ──────────────────────────
        const nextQ = clarifyQueue[clarifyIndex];
        setMessages(prev => [...prev, {
          role: 'ASSISTANT',
          content: nextQ.question,
          isClarification: true,
          clarifyStep: clarifyIndex + 1,
          clarifyTotal: clarifyQueue.length,
        }]);
        setClarifyIndex(prev => prev + 1);
      }
    } else {
      // ── Normal query ──────────────────────────────────────────────────────
      setMessages(prev => [...prev, { role: 'USER', content: trimmed }]);
      await callBrainAgent(trimmed, currentSessionId);
    }
  }, [input, isSending, activeConversationId, inClarifyMode, clarifyQueue, clarifyIndex, clarifyAnswers, callBrainAgent, onNewChat]);

  const onFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isInputDisabled = isSending || creatingSession;
  const placeholder = inClarifyMode 
    ? `Answering question ${clarifyIndex} of ${clarifyQueue.length}...`
    : 'Ask Brain anything...';

  // Extract the Input Form into a reusable block so we can render it centrally or at the bottom
  const renderInputForm = (isCentral = false) => (
    <div className={`w-full max-w-3xl mx-auto ${isCentral ? 'mt-8 animate-fade-in-up' : ''}`}>
      {/* Clarification progress bar */}
      {inClarifyMode && !isCentral && (
        <div className="mb-2.5 flex items-center gap-3">
          <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6c48ff] to-[#a78bfa] rounded-full transition-all duration-500"
              style={{ width: `${((clarifyIndex) / clarifyQueue.length) * 100}%` }}
            />
          </div>
          <span className="text-[11px] font-semibold text-[#6c48ff] whitespace-nowrap">
            Question {clarifyIndex} of {clarifyQueue.length}
          </span>
        </div>
      )}

      <form
        onSubmit={onFormSubmit}
        className={`bg-white rounded-3xl border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-3 pb-2.5 flex flex-col relative transition-all focus-within:shadow-[0_12px_48px_rgba(168,85,247,0.12)] focus-within:border-purple-200 ${isCentral ? 'shadow-[0_16px_64px_rgba(168,85,247,0.08)] scale-[1.02]' : ''}`}
      >
        <textarea
          ref={isCentral ? null : inputRef}
          rows={1}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
          }}
          onKeyDown={onKeyDown}
          disabled={isInputDisabled}
          placeholder={placeholder}
          className="w-full resize-none bg-transparent text-[16px] text-gray-900 placeholder:text-gray-400 outline-none leading-relaxed px-2 pt-2 pb-3 min-h-[48px] custom-scrollbar"
          style={{ overflow: 'auto' }}
        />

        {/* Actions Bar */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1.5">
            <button type="button" className="flex items-center gap-1.5 text-[12.5px] font-semibold text-purple-600 bg-purple-50/80 hover:bg-purple-100 px-3 py-1.5 rounded-[10px] transition-colors border border-purple-100">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Deeper Research
            </button>
            <button type="button" className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </button>
            <button type="button" className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button type="button" className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </button>
            <button type="button" className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
            </button>
            
            <div className="relative w-8 h-8 ml-1">
              <button
                type="submit"
                disabled={isInputDisabled || (!input.trim() && !inClarifyMode)}
                className="absolute inset-0 flex items-center justify-center rounded-[10px] transition-all disabled:opacity-50"
                style={{
                  background: input.trim() 
                    ? '#000000' 
                    : 'linear-gradient(135deg, #e9d5ff 0%, #c084fc 100%)',
                  color: input.trim() ? '#ffffff' : '#7e22ce'
                }}
              >
                {isSending || creatingSession ? (
                  <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : input.trim() ? (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="flex items-center justify-between mt-3 px-3">
          <div className="flex items-center gap-1.5 text-gray-500/80 text-[12.5px] font-medium cursor-pointer hover:text-purple-600 transition-colors">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Saved prompts
          </div>
          <button className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-600 bg-white/60 backdrop-blur-sm border border-gray-200/60 px-3.5 py-1.5 rounded-full shadow-sm hover:bg-white transition-all">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
            Attach file
          </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0 z-10 bg-white/50 backdrop-blur-sm border-b border-gray-100/30">
        <div className="flex items-center gap-2 text-[15px] font-semibold text-gray-800 bg-gray-50/80 hover:bg-gray-100 px-3 py-1.5 rounded-xl cursor-pointer transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-300 to-purple-400 flex items-center justify-center shadow-inner">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-8m0 0H4m4 0h4m-4-8h8m-4 0v8" />
            </svg>
          </div>
          Brain Agent
          <svg className="w-4 h-4 text-gray-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        <div className="flex items-center gap-3.5">
          <button className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </button>
          <button className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>
          <button className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-700 border border-gray-200/80 px-3.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export chat
          </button>
          <button className="text-[13px] font-semibold text-white bg-[#0f0f0f] px-4 py-1.5 rounded-lg hover:bg-black transition-colors shadow-sm">
            Upgrade
          </button>
        </div>
      </div>

      {/* ── Message list / Empty State ───────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 relative flex flex-col custom-scrollbar">

        {messages.length === 0 && !isSending ? (
          <div className="flex flex-col items-center justify-center flex-1 w-full max-w-4xl mx-auto pt-10 pb-8 text-center animate-fade-in-up">
            
            <div className="relative w-36 h-36 mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-fuchsia-300 to-indigo-400 rounded-full blur-[24px] opacity-40 mix-blend-multiply animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-100 via-white to-purple-50 rounded-full shadow-[inset_0_0_40px_rgba(168,85,247,0.4),inset_0_-10px_20px_rgba(88,28,135,0.2),0_10px_30px_rgba(168,85,247,0.2)] flex items-center justify-center overflow-hidden">
                 <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/70 rounded-full blur-xl" />
                 <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-purple-500/30 rounded-full blur-xl mix-blend-overlay" />
                 <div className="absolute top-4 left-6 w-12 h-6 bg-white/80 rounded-[100%] rotate-[-35deg] blur-[2px]" />
              </div>
            </div>

            <h1 className="text-[28px] md:text-[34px] font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#b392f0] to-[#8d6ee8] mb-1.5 tracking-tight">
              Hello, User
            </h1>
            <h2 className="text-[36px] md:text-[42px] font-bold text-gray-900 tracking-tight leading-none mb-12">
              How can I assist you today?
            </h2>

            {/* Empty state flows */}
            {!activeConversationId ? (
              renderInputForm(true)
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mt-auto opacity-90">
                {[
                  { icon: 'pie-chart', title: 'Synthesize Data', desc: 'Turn my meeting notes into 5 key bullet points for the team.' },
                  { icon: 'lightbulb', title: 'Creative Brainstorm', desc: 'Generate 3 taglines for a new sustainable fashion brand.' },
                  { icon: 'hammer', title: 'Check Facts', desc: 'Compare key differences between GDPR and CCPA.' }
                ].map((item, i) => (
                  <button key={i} onClick={() => handleSubmit(item.title)} className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-5 text-left hover:bg-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:border-purple-100 transition-all group">
                     <div className="w-8 h-8 mb-3 text-gray-400 group-hover:text-purple-500 transition-colors">
                        {item.icon === 'pie-chart' && <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>}
                        {item.icon === 'lightbulb' && <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>}
                        {item.icon === 'hammer' && <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 19h18M5 19V5a2 2 0 012-2h10a2 2 0 012 2v14M8 11h8M8 15h8M8 7h8"/></svg>}
                     </div>
                     <h3 className="text-[14px] font-bold text-gray-900 mb-1 group-hover:text-purple-700">{item.title}</h3>
                     <p className="text-[12px] text-gray-400 leading-relaxed">{item.desc}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full pt-8 space-y-1 pb-4">
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} message={msg} />
            ))}

            {isSending && (
              <div className="flex items-start gap-3 py-4 animate-fade-in">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#b392f0] to-[#8d6ee8] flex items-center justify-center flex-shrink-0 shadow-sm shadow-purple-200">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* ── Floating Input Box (Bottom) ──────────────────────────────────────── */}
      {/* Only render this if there is an active session! */}
      {activeConversationId && (
        <div className="flex-shrink-0 px-4 sm:px-8 pb-8 pt-2">
          {renderInputForm(false)}
        </div>
      )}
    </div>
  );
}
