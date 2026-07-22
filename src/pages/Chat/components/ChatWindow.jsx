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

export default function ChatWindow({ activeConversationId, creatingSession }) {
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
  const callBrainAgent = useCallback(async (userQuery) => {
    setIsSending(true);
    try {
      const brainResponse = await chatService.runBrainAgent(activeConversationId, userQuery);
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

    if (!activeConversationId) {
      toast.warning('Click "+ New Chat" to start a session first.');
      return;
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
        await callBrainAgent(combinedQuery);
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
      await callBrainAgent(trimmed);
    }
  }, [input, isSending, activeConversationId, inClarifyMode, clarifyQueue, clarifyIndex, clarifyAnswers, callBrainAgent]);

  const onFormSubmit  = (e) => { e.preventDefault(); handleSubmit(); };
  const onKeyDown     = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const isInputDisabled = isSending || !activeConversationId || creatingSession;
  const isEmpty = messages.length === 0 && !isSending;

  // Placeholder text changes in clarification mode
  const placeholder = (() => {
    if (creatingSession)       return 'Setting up session…';
    if (!activeConversationId) return 'Click "+ New Chat" to start…';
    if (inClarifyMode) {
      const current = clarifyQueue[clarifyIndex - 1];
      return `Answer: ${current?.question || 'Type your answer…'}`;
    }
    return 'Ask Brain anything…';
  })();

  return (
    <div className="flex flex-col h-full bg-[#f6f7fb] relative">

      {/* ── Message list ─────────────────────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ paddingBottom: '140px' }}>

        {/* ── Empty state ── */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full px-6 py-16 text-center">
            {creatingSession ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6c48ff] to-[#a78bfa] flex items-center justify-center shadow-lg shadow-violet-200">
                  <svg className="w-8 h-8 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-[17px] font-semibold text-gray-700">Starting your session…</p>
                <p className="text-[14px] text-gray-400">Connecting to Brain Agent</p>
              </div>
            ) : activeConversationId ? (
              <div className="flex flex-col items-center gap-6 max-w-lg w-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6c48ff] to-[#a78bfa] flex items-center justify-center shadow-lg shadow-violet-200">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-[22px] font-bold text-gray-900 mb-1 tracking-tight">How can I help you?</h2>
                  <p className="text-[14px] text-gray-400">Powered by Brain Agent — research, scrape, write & more.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full mt-2">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSubmit(s.text)}
                      className="flex items-center gap-3 bg-white hover:bg-violet-50 border border-gray-200 hover:border-violet-200 rounded-2xl px-4 py-3.5 text-left transition-all group shadow-sm"
                    >
                      <span className="text-xl flex-shrink-0">{s.icon}</span>
                      <span className="text-[13px] font-medium text-gray-600 group-hover:text-violet-700 leading-snug">{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-gray-800 mb-1">Welcome to Brain</h2>
                  <p className="text-[14px] text-gray-400">
                    Click <span className="font-semibold text-[#6c48ff]">+ New Chat</span> in the sidebar to begin.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Messages ── */}
        {messages.length > 0 && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 space-y-1">
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} message={msg} />
            ))}

            {/* Thinking indicator */}
            {isSending && (
              <div className="flex items-start gap-3 py-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6c48ff] to-[#a78bfa] flex items-center justify-center flex-shrink-0 shadow-sm shadow-violet-200">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#6c48ff] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#6c48ff] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#6c48ff] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Input bar ──────────────────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-3"
        style={{ background: 'linear-gradient(to top, #f6f7fb 85%, transparent)' }}
      >
        <div className="max-w-3xl mx-auto">

          {/* Clarification progress bar */}
          {inClarifyMode && (
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
            className="flex items-end gap-3 bg-white rounded-[20px] border border-gray-200 shadow-[0_4px_24px_rgba(108,72,255,0.08)] px-4 py-3 transition-all focus-within:border-violet-300 focus-within:shadow-[0_4px_32px_rgba(108,72,255,0.15)]"
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={onKeyDown}
              disabled={isInputDisabled}
              placeholder={placeholder}
              className="flex-1 resize-none bg-transparent text-[15px] text-gray-900 placeholder:text-gray-400 outline-none leading-relaxed py-1 font-medium disabled:opacity-40 min-h-[28px]"
              style={{ overflow: 'hidden' }}
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={isInputDisabled || !input.trim()}
              className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
              style={{
                background: (isInputDisabled || !input.trim())
                  ? '#e5e7eb'
                  : 'linear-gradient(135deg, #6c48ff 0%, #a78bfa 100%)',
              }}
            >
              {isSending ? (
                <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                  stroke={(isInputDisabled || !input.trim()) ? '#9ca3af' : 'white'}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              )}
            </button>
          </form>

          {/* Bottom hint */}
          <p className="text-center text-[11px] text-gray-400 mt-2">
            {inClarifyMode
              ? '💬 Answer each question to continue — answers will be sent together'
              : <>Press <kbd className="bg-gray-100 border border-gray-200 rounded px-1 py-0.5 text-[10px] font-mono">Enter</kbd> to send · <kbd className="bg-gray-100 border border-gray-200 rounded px-1 py-0.5 text-[10px] font-mono">Shift + Enter</kbd> for new line</>
            }
          </p>
        </div>
      </div>
    </div>
  );
}
