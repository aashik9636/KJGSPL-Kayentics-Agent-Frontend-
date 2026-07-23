import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatService } from '../../../../services/chatService';
import { useBrainStream } from '../../../../hooks/useBrainStream';
import MessageBubble from './MessageBubble';
import { toast } from 'react-toastify';

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

export default function ChatWindow({ activeConversationId, creatingSession, onNewChat }) {
  const [input, setInput]         = useState('');
  const [messages, setMessages]   = useState([]);
  const [isSending, setIsSending] = useState(false);

  const [clarifyQueue,   setClarifyQueue]   = useState([]);
  const [clarifyIndex,   setClarifyIndex]   = useState(0);
  const [clarifyAnswers, setClarifyAnswers] = useState({});
  const inClarifyMode = clarifyQueue.length > 0 && clarifyIndex <= clarifyQueue.length;

  const scrollRef = useRef(null);
  const inputRef  = useRef(null);
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

        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full px-6 py-16 text-center">
            {creatingSession ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6c48ff] to-[#a78bfa] flex items-center justify-center shadow-lg shadow-violet-200">
                  <svg className="w-8 h-8 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-[17px] font-semibold text-gray-700">Starting your session...</p>
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
                  <p className="text-[14px] text-gray-400">Powered by Brain Agent -- research, scrape, write & more.</p>
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
              <div className="flex flex-col items-center justify-center h-full px-6 py-16 text-center">
                <div className="flex flex-col items-center gap-6 max-w-lg w-full">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6c48ff] to-[#a78bfa] flex items-center justify-center shadow-lg shadow-violet-200">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-[22px] font-bold text-gray-900 mb-1 tracking-tight">Welcome to Brain Agent</h2>
                    <p className="text-[14px] text-gray-400">Click below to start a new conversation.</p>
                  </div>
                  <button
                    onClick={onNewChat}
                    disabled={creatingSession}
                    className="flex items-center gap-2 bg-[#111111] hover:bg-black text-white rounded-xl px-6 py-3 text-[14px] font-medium transition-all shadow-sm shadow-gray-900/10"
                  >
                    {creatingSession ? (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    )}
                    Start New Chat
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

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
                <div className="flex-shrink-0 w-9 h-9 rounded-[14px] bg-gradient-to-br from-[#6c48ff] to-[#9d83ff] flex items-center justify-center shadow-md shadow-violet-500/20 mt-1">
                  <svg className="w-[18px] h-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                
                {/* Premium Chat Bubble Shape */}
                <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-[22px] rounded-tl-[6px] px-5 py-3.5 shadow-sm shadow-gray-200/40">
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
        className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-3"
        style={{ background: 'linear-gradient(to top, #f6f7fb 85%, transparent)' }}
      >
        <div className="max-w-3xl mx-auto">

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

          <p className="text-center text-[11px] text-gray-400 mt-2">
            {inClarifyMode
              ? 'Answer each question to continue -- answers will be sent together'
              : brain.isStreaming
                ? 'Streaming response in real-time...'
                : <>Press <kbd className="bg-gray-100 border border-gray-200 rounded px-1 py-0.5 text-[10px] font-mono">Enter</kbd> to send · <kbd className="bg-gray-100 border border-gray-200 rounded px-1 py-0.5 text-[10px] font-mono">Shift + Enter</kbd> for new line</>
            }
          </p>
        </div>
      </div>
    </div>
  );
}
