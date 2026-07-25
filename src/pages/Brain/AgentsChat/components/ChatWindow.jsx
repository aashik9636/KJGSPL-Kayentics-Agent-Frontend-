import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { chatService } from '../../../../services/chatService';
import { useBrainStream } from '../../../../hooks/useBrainStream';
import MessageBubble from './MessageBubble';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../../../store/authStore';
import gsap from 'gsap';
// Avatars are loaded directly from public folder

const SUGGESTIONS = [
  { icon: '🔍', text: 'Research top AI trends this week' },
  { icon: '📊', text: "Analyze my brand's social media performance" },
  { icon: '✍️', text: 'Draft a LinkedIn post about our product launch' },
  { icon: '🌐', text: 'Scrape and summarize competitor pricing pages' },
];

function extractClarifyingQuestions(executionResults = {}) {
  for (const key of Object.keys(executionResults)) {
    const result = executionResults[key];
    if (result?.needs_clarification && Array.isArray(result?.clarifying_questions) && result.clarifying_questions.length > 0) {
      return result.clarifying_questions;
    }
  }
  return [];
}

function formatAnswers(questions, answers) {
  return questions
    .map(q => `${q.id}: ${answers[q.id] || ''}`)
    .join(', ');
}

export default function ChatWindow({ activeConversationId, creatingSession, onNewChat, onMessageSent, onMessagesLoaded, selectedAgent }) {
  const [input, setInput]         = useState('');
  const [messages, setMessages]   = useState([]);
  const [isSending, setIsSending] = useState(false);

  const user = useAuthStore(state => state.user);
  const firstName = user?.firstName || 'there';
  const taglines = [
    `Ready when you are, ${firstName}.`,
    `Let's build something, ${firstName}.`,
    `How can I help today, ${firstName}?`,
    `What are we working on, ${firstName}?`
  ];
  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex(prev => (prev + 1) % taglines.length);
    }, 20000);
    return () => clearInterval(interval);
  }, [taglines.length]);

  const [clarifyQueue,   setClarifyQueue]   = useState([]);
  const [clarifyIndex,   setClarifyIndex]   = useState(0);
  const [clarifyAnswers, setClarifyAnswers] = useState({});
  const inClarifyMode = clarifyQueue.length > 0 && clarifyIndex <= clarifyQueue.length;

  const scrollRef = useRef(null);
  const inputRef  = useRef(null);
  const emptyStateRef = useRef(null);
  const inputFormRef = useRef(null);
  const brain     = useBrainStream();
  const brainRef  = useRef(brain);
  useEffect(() => {
    brainRef.current = brain;
  }, [brain]);

  useEffect(() => {
    setMessages([]);
    setInput('');
    setClarifyQueue([]);
    setClarifyIndex(0);
    setClarifyAnswers({});
    brain.reset();

    if (!creatingSession && activeConversationId) {
      chatService.getMessages(activeConversationId)
        .then(msgs => {
          const list = Array.isArray(msgs) ? msgs : msgs?.data || [];
          setMessages(list.map(m => ({
            role: m.role || (m.senderId ? 'USER' : 'ASSISTANT'),
            content: m.content || m.text || '',
          })));
          if (onMessagesLoaded) onMessagesLoaded(list.length);
        })
        .catch(() => {});
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [activeConversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, brain.streamingText, isSending]);

  // --- GSAP Animations for Empty State ---
  useLayoutEffect(() => {
    const isCentered = messages.length === 0 && !isSending;
    if (isCentered && emptyStateRef.current && inputFormRef.current) {
      const q = gsap.utils.selector(emptyStateRef.current);
      
      const tl = gsap.timeline();
      
      tl.fromTo(q('.gsap-hero-title'), 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      )
      .fromTo(q('.gsap-hero-dock'),
        { y: 20, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' },
        "-=0.6"
      )
      .fromTo(inputFormRef.current,
        { y: 20, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' },
        "-=0.5"
      )
      .fromTo(q('.gsap-hero-sugg'),
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' },
        "-=0.4"
      );
    }
  }, [messages.length, isSending]);

  // ── Brain Agent query: try WebSocket streaming, fall back to REST ────────
  const callBrainAgent = useCallback(async (userQuery, sessionIdOverride) => {
    const sessionId = sessionIdOverride || activeConversationId;
    setIsSending(true);

    try {
      let finalAnswer = '';
      let targetOrchestrators = [];
      let executionResults = {};
      let inScope = true;

      // Attempt WebSocket streaming (auto-falls back to polling inside useBrainStream)
      brain.send(sessionId, userQuery);

      // Wait until both streaming AND background polling are completely finished
      await new Promise(resolve => {
        const check = setInterval(() => {
          const currentBrain = brainRef.current;
          if (!currentBrain.isStreaming && !currentBrain.isPendingBackground) {
            // Also ensure it actually started before resolving
            if (currentBrain.streamingText || currentBrain.error || currentBrain.metadata) {
              clearInterval(check);
              resolve();
            } else if (currentBrain.error === null && !currentBrain.status) {
                // If it just stopped and has no status, it's done.
                clearInterval(check);
                resolve();
            }
          }
        }, 100);
      });

      // Retrieve final data regardless of how it was generated
      finalAnswer = brainRef.current.streamingText;
      targetOrchestrators = brainRef.current.metadata?.target_orchestrators || [];
      inScope = brainRef.current.metadata?.in_scope ?? true;
      executionResults = brainRef.current.metadata?.executionResults || brainRef.current.metadata?.execution_results || {};
      const tokensUsed = brainRef.current.metadata?.tokens_used || null;
      const model = brainRef.current.metadata?.model || null;

      if (!finalAnswer) {
        throw new Error('No response generated.');
      }

      // Append the fully resolved content to the message history
      setMessages(prev => [...prev, {
        role: 'ASSISTANT',
        content: finalAnswer,
        targetOrchestrators,
        executionResults,
        inScope,
        tokensUsed,
        model,
      }]);

      // Check for clarification from execution results
      const clarifyingQuestions = extractClarifyingQuestions(executionResults);
      if (clarifyingQuestions.length > 0) {
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
        setClarifyIndex(1);
        setClarifyAnswers({});
      } else {
        setClarifyQueue([]);
        setClarifyIndex(0);
        setClarifyAnswers({});
      }
    } catch (err) {
      console.error('Brain agent request failed', err);
      brain.reset();
      toast.error(err.response?.data?.message || 'Failed to get a response. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [activeConversationId, brain]);

  // ── Handle user submit ────────────────────────────────────────────────────
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
      const currentQ  = clarifyQueue[clarifyIndex - 1];
      const newAnswers = { ...clarifyAnswers, [currentQ.id]: trimmed };
      setClarifyAnswers(newAnswers);
      setMessages(prev => [...prev, { role: 'USER', content: trimmed }]);
      if (onMessageSent) onMessageSent();

      const isLastQuestion = clarifyIndex >= clarifyQueue.length;

      if (isLastQuestion) {
        const combinedQuery = formatAnswers(clarifyQueue, newAnswers);
        setMessages(prev => [...prev, {
          role: 'ASSISTANT',
          content: 'Got all the details! Processing your request...',
          isSummary: true,
        }]);
        setClarifyQueue([]);
        setClarifyIndex(0);
        setClarifyAnswers({});
        await callBrainAgent(combinedQuery, currentSessionId);
      } else {
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
      setMessages(prev => [...prev, { role: 'USER', content: trimmed }]);
      if (onMessageSent) onMessageSent();
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

  const isInputDisabled = isSending || !activeConversationId || creatingSession;
  const isEmpty = messages.length === 0 && !isSending;
  const isCentered = isEmpty && !isSending;

  const placeholder = (() => {
    if (creatingSession)       return 'Setting up session...';
    if (!activeConversationId) return 'Click "+ New Chat" to start...';
    if (inClarifyMode) {
      const current = clarifyQueue[clarifyIndex - 1];
      return `Answer: ${current?.question || 'Type your answer...'}`;
    }
    return 'Ask Brain anything...';
  })();

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0 z-10 bg-white/60 backdrop-blur-xl border-b border-white shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2.5 text-[15px] font-semibold text-gray-800 bg-white/80 hover:bg-white px-3 py-1.5 rounded-[14px] cursor-pointer transition-all shadow-sm border border-gray-100">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#6c48ff] to-[#a78bfa] flex items-center justify-center shadow-inner">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-8m0 0H4m4 0h4m-4-8h8m-4 0v8" />
            </svg>
          </div>
          Brain Agent
          <svg className="w-4 h-4 text-gray-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        <div className="flex items-center gap-3.5">
          {/* Right side empty to maintain flex-between layout */}
        </div>
      </div>

      {/* ── Message list / Empty State ───────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 relative flex flex-col custom-scrollbar">

        {/* Empty state is handled by the centered absolute input bar now. No overlapping loading block needed here. */}

        {messages.length > 0 && (
          <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 pt-8 pb-40 space-y-1">
            {/* Render all FINISHED messages */}
            {messages.map((msg, idx) => (
              <MessageBubble 
                key={idx} 
                message={msg} 
              />
            ))}

            {/* Live Streaming Message Bubble */}
            {isSending && brain.streamingText && (
              <MessageBubble 
                message={{
                  role: 'ASSISTANT',
                  content: brain.streamingText,
                  status: brain.status
                }} 
                isStreaming={true} 
              />
            )}

            {/* Thinking indicator — show only when sending but no streaming text yet */}
            {isSending && !brain.streamingText && (
              <div className="flex items-start gap-3.5 py-4 w-full">
                {/* Premium AI Avatar (matching MessageBubble) */}
                <div className="flex-shrink-0 w-10 h-10 rounded-[16px] bg-gradient-to-br from-[#6c48ff] to-[#a78bfa] flex items-center justify-center shadow-lg shadow-violet-500/30 border-2 border-white relative mt-1">
                  <div className="absolute inset-0 rounded-[14px] ring-1 ring-white/40 inset-ring"></div>
                  <svg className="w-5 h-5 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                
                {/* Premium Chat Bubble Shape */}
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xl border border-white rounded-[28px] rounded-tl-[8px] px-6 py-4 shadow-[0_4px_32px_rgba(0,0,0,0.03)]">
                  {/* Bouncing dots */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#6c48ff]/70 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#6c48ff]/70 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#6c48ff]/70 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  
                  {/* Dynamic Status Text inside the bubble */}
                  {brain.status && (
                    <span className="text-[14px] font-medium text-gray-500 animate-pulse border-l border-gray-200 pl-3">
                      {brain.status}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Input bar ──────────────────────────────────────────────────────── */}
      <div
        ref={emptyStateRef}
        className={`absolute left-0 right-0 px-4 flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isCentered 
            ? 'top-1/2 -translate-y-1/2' 
            : 'bottom-0 pb-5 pt-3'
        }`}
        style={!isCentered ? { background: 'linear-gradient(to top, #f6f7fb 85%, transparent)' } : {}}
      >
        {/* Title for Centered State */}
        <div className={`transition-all duration-500 w-full max-w-3xl text-center flex flex-col items-center ${isCentered ? 'opacity-100 mb-8' : 'opacity-0 h-0 overflow-hidden mb-0'}`}>
          <div className="h-[48px] md:h-[60px] overflow-hidden mb-8 relative w-full flex justify-center gsap-hero-title">
            {taglines.map((tagline, idx) => (
              <h1 
                key={idx}
                className={`text-[32px] md:text-[40px] font-medium text-gray-900 tracking-tight absolute transition-all duration-500 ease-in-out ${
                  idx === taglineIndex 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-4'
                }`} 
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                {tagline}
              </h1>
            ))}
          </div>

          {/* Dynamic Selected Agent Avatar (Floating 3D) */}
          <div className="flex items-center justify-center gsap-hero-dock relative group mb-4">
            <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center transition-all duration-300 ease-out hover:-translate-y-2">
              <div className="absolute -bottom-1 w-[70%] h-3 bg-black/20 blur-[8px] rounded-[100%] scale-x-125 transition-transform duration-500 group-hover:scale-x-90 group-hover:opacity-60" />
              {(!selectedAgent || selectedAgent === 'brain') ? (
                <img 
                  src="/premium_3d_brain.png" 
                  className="w-full h-full max-w-none object-contain object-bottom transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_15px_15px_rgba(0,0,0,0.15)] mix-blend-multiply z-10" 
                  alt="Brain Agent" 
                />
              ) : (
                <video 
                  src={
                    selectedAgent === 'content' ? '/agent 1.mp4' :
                    selectedAgent === 'social' ? '/agent2.mp4' :
                    '/agent3.mp4'
                  }
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' }}
                  className="w-[120%] h-[120%] max-w-none object-cover object-center scale-[1.1] transition-transform duration-500 group-hover:scale-[1.15] drop-shadow-[0_15px_15px_rgba(0,0,0,0.15)] mix-blend-multiply z-10" 
                />
              )}
            </div>
            {/* Tooltip */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 translate-y-2 group-hover:translate-y-0">
              <div className="bg-gray-900 text-white text-[12px] font-medium px-4 py-1.5 rounded-lg whitespace-nowrap shadow-xl flex flex-col items-center">
                <span>{
                  selectedAgent === 'content' ? 'Content Creator' :
                  selectedAgent === 'social' ? 'Social Media Agent' :
                  selectedAgent === 'recruiter' ? 'Recruiter Agent' :
                  'Brain Agent'
                }</span>
              </div>
              <div className="w-2.5 h-2.5 bg-gray-900 rotate-45 mx-auto -mt-1.5"></div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-3xl mx-auto flex flex-col items-center">

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
            ref={inputFormRef}
            onSubmit={onFormSubmit}
            className="w-full flex items-end gap-3 bg-white/80 backdrop-blur-2xl rounded-[24px] border border-white shadow-[0_8px_32px_rgba(108,72,255,0.08)] px-5 py-4 transition-all focus-within:bg-white focus-within:border-indigo-50 focus-within:shadow-[0_12px_48px_rgba(108,72,255,0.15)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/30 to-purple-50/30 pointer-events-none opacity-0 focus-within:opacity-100 transition-opacity duration-500"></div>
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
              className="flex-1 resize-none bg-transparent text-[15px] text-gray-900 placeholder:text-gray-400 outline-none leading-relaxed py-1.5 font-medium disabled:opacity-40 min-h-[32px] z-10"
              style={{ overflow: 'hidden' }}
            />

            <button
              type="submit"
              disabled={isInputDisabled || !input.trim()}
              className="flex-shrink-0 w-11 h-11 rounded-[16px] flex items-center justify-center transition-all duration-300 disabled:opacity-50 z-10 hover:shadow-lg hover:-translate-y-0.5"
              style={{
                background: (isInputDisabled || !input.trim())
                  ? '#f3f4f6'
                  : 'linear-gradient(135deg, #5030e5 0%, #7b61ff 100%)',
                boxShadow: (isInputDisabled || !input.trim()) ? 'none' : '0 6px 16px rgba(108,72,255,0.3)',
              }}
            >
              {isSending ? (
                <svg className="animate-spin w-4.5 h-4.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24"
                  stroke={(isInputDisabled || !input.trim()) ? '#9ca3af' : 'white'}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              )}
            </button>
          </form>

          <p className="text-center text-[11px] text-gray-400 mt-2">
            {inClarifyMode
              ? 'Answer each question to continue -- answers will be sent together'
              : brain.isStreaming
                ? 'Streaming response in real-time...'
                : <>Press <kbd className="bg-gray-100 border border-gray-200 rounded px-1 py-0.5 text-[10px] font-mono">Enter</kbd> to send · <kbd className="bg-gray-100 border border-gray-200 rounded px-1 py-0.5 text-[10px] font-mono">Shift + Enter</kbd> for new line</>
            }
          </p>

          {/* Suggestions for Centered State */}
          <div className={`transition-all duration-500 w-full max-w-[800px] mt-8 ${isCentered ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden mt-0'}`}>
            <div className="flex flex-wrap justify-center gap-3">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSubmit(s.text)}
                  className="flex items-center gap-2.5 bg-white/60 hover:bg-white border border-gray-200/60 hover:border-gray-300 rounded-full px-5 py-2.5 text-left transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] gsap-hero-sugg"
                >
                  <span className="text-[15px]">{s.icon}</span>
                  <span className="text-[13px] font-medium text-gray-700">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
