import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { chatService } from '../../../../services/chatService';
import { useBrainStream } from '../../../../hooks/useBrainStream';
import { useSubAgentStream } from '../../../../hooks/useSubAgentStream';
import MessageBubble from './MessageBubble';
import StepTree from './StepTree';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../../../store/authStore';
import gsap from 'gsap';
// Avatars are loaded directly from public folder

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

const AGENT_TITLE_MAP = {
  'brain': 'Brain Agent',
  'stock-market': 'Stock Market Agent',
  'research': 'Universal Research Agent',
  'market': 'Competitor Intelligence Agent',
  'lead-generation': 'Lead Generation Agent',
  'recruitment': 'Recruitment Agent',
  'social-trends': 'Social Trends Agent',
  'image-generation': 'Image Generation Agent',
  'post-scheduler': 'Post Scheduler Agent',
  'campaign-planner': 'Campaign Planner Agent',
  'campaign-manager': 'Campaign Planner Agent',
  'business-intelligence': 'Business Intelligence Agent',
  'content-writer': 'Content Writer Agent',
};

const getAgentTitle = (slug) => {
  if (!slug || slug === 'brain') return 'Brain Agent';
  if (AGENT_TITLE_MAP[slug]) return AGENT_TITLE_MAP[slug];
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Agent';
};

const getAgentHeroAvatar = (slug) => {
  const s = (slug || '').toLowerCase();
  if (s === 'stock-market' || s === 'post-scheduler') return '/stock_market_avatar.mp4';
  if (s === 'research' || s === 'content-writer' || s === 'campaign-planner') return '/research_avatar.mp4';
  if (s === 'market' || s === 'image-query' || s === 'image-generation') return '/market_avatar.mp4';
  if (s === 'lead-generation') return '/lead_gen_avatar.mp4';
  if (s === 'recruitment') return '/recruitment_avatar.mp4';
  if (s === 'social-trends') return '/social_trends_avatar.mp4';
  return '/brain_avatar.mp4';
};

const getAgentTaglines = (slug, name) => {
  const firstName = name || 'there';
  const s = (slug || '').toLowerCase();
  switch (s) {
    case 'stock-market':
      return [
        `Stock Market Analyst ready, ${firstName}.`,
        `What stock or financial index shall we analyze?`
      ];
    case 'image-query':
    case 'image-generation':
      return [
        `Visual Studio ready, ${firstName}.`,
        `Describe the image or banner graphic you want to generate.`
      ];
    case 'lead-generation':
      return [
        `B2B Lead Prospector ready, ${firstName}.`,
        `Which industry decision-makers shall we find today?`
      ];
    case 'recruitment':
      return [
        `Talent Recruiter ready, ${firstName}.`,
        `Which key role are we sourcing candidates for?`
      ];
    case 'social-trends':
      return [
        `Viral Trend Radar ready, ${firstName}.`,
        `What social platform or viral trend shall we explore?`
      ];
    case 'content-writer':
      return [
        `AI Copywriter ready, ${firstName}.`,
        `What blog post, email, or ad copy shall we write today?`
      ];
    case 'campaign-planner':
      return [
        `Campaign Strategist ready, ${firstName}.`,
        `What marketing campaign strategy shall we architect?`
      ];
    case 'post-scheduler':
      return [
        `Social Publisher ready, ${firstName}.`,
        `What posts shall we schedule to your calendar today?`
      ];
    case 'research':
    case 'market':
      return [
        `Deep Research Analyst ready, ${firstName}.`,
        `What market topic or competitor shall we analyze?`
      ];
    case 'brain':
    default:
      return [
        `Ready when you are, ${firstName}.`,
        `How can I help today, ${firstName}?`,
        `What are we working on, ${firstName}?`
      ];
  }
};

export default function ChatWindow({ activeConversationId, creatingSession, onNewChat, onMessageSent, onMessagesLoaded, selectedAgent }) {
  const [input, setInput]         = useState('');
  const [messages, setMessages]   = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const user = useAuthStore(state => state.user);
  const firstName = user?.firstName || 'there';
  const taglines = React.useMemo(() => {
    return getAgentTaglines(selectedAgent, firstName);
  }, [selectedAgent, firstName]);

  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    setTaglineIndex(0);
    const interval = setInterval(() => {
      setTaglineIndex(prev => (prev + 1) % taglines.length);
    }, 20000);
    return () => clearInterval(interval);
  }, [selectedAgent, taglines.length]);

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

  const subAgent  = useSubAgentStream();
  const subAgentRef = useRef(subAgent);
  useEffect(() => {
    subAgentRef.current = subAgent;
  }, [subAgent]);

  useEffect(() => {
    setMessages([]);
    setInput('');
    setClarifyQueue([]);
    setClarifyIndex(0);
    setClarifyAnswers({});
    brain.reset();

    if (!creatingSession && activeConversationId) {
      setIsLoadingMessages(true);
      chatService.getMessages(activeConversationId)
        .then(msgs => {
          const list = Array.isArray(msgs) ? msgs : msgs?.data || [];
          setMessages(list.map(m => {
            const roleStr = m.role ? m.role.toUpperCase() : (m.senderId ? 'USER' : 'ASSISTANT');
            return {
              role: (roleStr === 'AGENT') ? 'ASSISTANT' : roleStr,
              content: m.content || m.text || '',
            };
          }));
          if (onMessagesLoaded) onMessagesLoaded(list.length);
        })
        .catch(() => {})
        .finally(() => setIsLoadingMessages(false));
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

      let artifacts = brainRef.current.artifacts || brainRef.current.metadata?.artifacts || [];
      const metrics = brainRef.current.metrics || brainRef.current.metadata?.metrics || null;

      if (!finalAnswer) {
        if (artifacts && artifacts.length > 0) {
          finalAnswer = `Generated ${artifacts.length} asset(s).`;
        } else if (brainRef.current.metadata?.summary) {
          finalAnswer = brainRef.current.metadata.summary;
        } else if (brainRef.current.steps && brainRef.current.steps.length > 0) {
          finalAnswer = 'Execution completed successfully.';
        } else {
          throw new Error('No response generated.');
        }
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
        artifacts,
        metrics,
        steps: brainRef.current.steps || [],
        confidence: brainRef.current.metadata?.confidence ?? null,
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

  // ── Sub-Agent direct query handler ─────────────────────────────────────────
  const callSubAgent = useCallback(async (userQuery, sessionIdOverride) => {
    const sessionId = sessionIdOverride || activeConversationId;
    setIsSending(true);

    try {
      subAgent.send(selectedAgent, sessionId, userQuery);

      await new Promise(resolve => {
        const check = setInterval(() => {
          const currentSub = subAgentRef.current;
          if (!currentSub.isStreaming && !currentSub.isPendingBackground) {
            if (currentSub.streamingText || currentSub.error || currentSub.metadata) {
              clearInterval(check);
              resolve();
            } else if (currentSub.error === null && !currentSub.status) {
              clearInterval(check);
              resolve();
            }
          }
        }, 100);
      });

      let finalAnswer = subAgentRef.current.streamingText;
      const sources = subAgentRef.current.sources || subAgentRef.current.metadata?.sources || [];
      const artifacts = subAgentRef.current.artifacts || subAgentRef.current.metadata?.artifacts || [];
      const metrics = subAgentRef.current.metrics || subAgentRef.current.metadata?.metrics || null;
      const tokensUsed = subAgentRef.current.metadata?.tokens_used || null;

      if (!finalAnswer) {
        if (artifacts && artifacts.length > 0) {
          finalAnswer = `Generated ${artifacts.length} asset(s).`;
        } else if (subAgentRef.current.metadata?.summary) {
          finalAnswer = subAgentRef.current.metadata.summary;
        } else if (subAgentRef.current.steps && subAgentRef.current.steps.length > 0) {
          finalAnswer = 'Execution completed successfully.';
        } else {
          throw new Error('No response generated.');
        }
      }

      setMessages(prev => [...prev, {
        role: 'ASSISTANT',
        content: finalAnswer,
        model: selectedAgent,
        sources,
        artifacts,
        metrics,
        tokensUsed,
        steps: subAgentRef.current.steps || [],
        confidence: subAgentRef.current.metadata?.confidence ?? null,
      }]);
    } catch (err) {
      console.error(`${selectedAgent} request failed`, err);
      subAgent.reset();
      toast.error(err.response?.data?.message || 'Failed to get a response from sub-agent. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [activeConversationId, selectedAgent, subAgent]);

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

    const isBrain = !selectedAgent || selectedAgent === 'brain';

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
        if (isBrain) {
          await callBrainAgent(combinedQuery, currentSessionId);
        } else {
          await callSubAgent(combinedQuery, currentSessionId);
        }
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
      if (isBrain) {
        await callBrainAgent(trimmed, currentSessionId);
      } else {
        await callSubAgent(trimmed, currentSessionId);
      }
    }
  }, [input, isSending, activeConversationId, inClarifyMode, clarifyQueue, clarifyIndex, clarifyAnswers, callBrainAgent, callSubAgent, selectedAgent, onNewChat]);

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
  const isCentered = isEmpty && !isSending && (!selectedAgent || selectedAgent === 'brain');

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
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0 z-10 bg-white/60 dark:bg-[#111111]/80 backdrop-blur-xl border-b border-white dark:border-[#262626] shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2.5 text-[15px] font-semibold text-neutral-800 dark:text-neutral-100 bg-white/80 dark:bg-[#111111] hover:bg-white dark:hover:bg-[#262626] px-3 py-1.5 rounded-[14px] cursor-pointer transition-all shadow-sm border border-neutral-100 dark:border-[#262626]">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#1a1a1a] to-[#333333] flex items-center justify-center shadow-inner">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-8m0 0H4m4 0h4m-4-8h8m-4 0v8" />
            </svg>
          </div>
          {getAgentTitle(selectedAgent)}
          <svg className="w-4 h-4 text-neutral-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        <div className="flex items-center gap-3.5">
          {/* Right side empty to maintain flex-between layout */}
        </div>
      </div>

      {/* ── Message list / Empty State ───────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 relative flex flex-col custom-scrollbar">

        {/* Dynamic Agent Landing Hero (Circle Avatar Video + Tooltip + Agent-specific Tagline) */}
        {messages.length === 0 && !creatingSession && !isLoadingMessages && (
          <div className="w-full max-w-4xl mx-auto text-center flex flex-col items-center justify-center pt-8 pb-2">
            <div className="flex items-center justify-center relative group mb-5">
              <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full p-2 bg-white dark:bg-[#171717] ring-[8px] ring-neutral-100/80 dark:ring-neutral-900/40 shadow-[0_0_40px_10px_rgba(255,255,255,0.2)] flex items-center justify-center transition-all duration-300 hover:scale-105">
                <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-b from-neutral-50/70 via-neutral-50/20 to-white dark:from-neutral-950/40 dark:to-neutral-900 flex items-center justify-center relative">
                  <video 
                    key={selectedAgent}
                    src={getAgentHeroAvatar(selectedAgent)}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                      (!selectedAgent || selectedAgent === 'brain') ? 'scale-100' : 'object-top'
                    }`} 
                    style={(!selectedAgent || selectedAgent === 'brain') ? { objectPosition: 'center 60%' } : {}}
                  />
                </div>
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20">
                <div className="bg-neutral-900 text-white text-[11px] font-semibold px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
                  {getAgentTitle(selectedAgent)}
                </div>
              </div>
            </div>

            <div className="min-h-[40px] relative w-full flex items-center justify-center">
              {taglines.map((tagline, idx) => (
                <h1 
                  key={idx}
                  className={`text-xl sm:text-2xl md:text-[28px] font-bold text-neutral-900 dark:text-white tracking-tight transition-all duration-500 font-['Space_Grotesk'] ${
                    idx === taglineIndex 
                      ? 'opacity-100 translate-y-0 relative' 
                      : 'opacity-0 translate-y-3 absolute inset-0 pointer-events-none'
                  }`} 
                >
                  {tagline}
                </h1>
              ))}
            </div>


          </div>
        )}

        {(creatingSession || isLoadingMessages) && (
          <div className="w-full h-full flex flex-col items-center justify-center pt-32 pb-20">
            <div className="flex flex-col items-center gap-4">
              <svg className="animate-spin w-8 h-8 text-neutral-400 dark:text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400">
                {creatingSession ? 'Starting session...' : 'Loading messages...'}
              </span>
            </div>
          </div>
        )}

        {messages.length > 0 && !creatingSession && !isLoadingMessages && (
          <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-4 pb-40 space-y-1">
            {/* Render all FINISHED messages */}
            {messages.map((msg, idx) => (
              <MessageBubble 
                key={idx} 
                message={msg} 
                selectedAgent={selectedAgent}
              />
            ))}

            {/* Live Streaming Message Bubble */}
            {isSending && (brain.streamingText || subAgent.streamingText) && (
              <MessageBubble 
                message={{
                  role: 'ASSISTANT',
                  content: brain.streamingText || subAgent.streamingText,
                  status: brain.status || subAgent.status,
                  nodes: Object.keys(brain.nodes).length > 0 ? brain.nodes : subAgent.nodes,
                  rootOrder: brain.rootOrder.length > 0 ? brain.rootOrder : subAgent.rootOrder,
                  steps: (brain.steps.length > 0 ? brain.steps : subAgent.steps),
                  confidence: (brain.metadata?.confidence ?? subAgent.metadata?.confidence ?? null),
                  metrics: brain.metrics || subAgent.metrics,
                }} 
                isStreaming={true} 
                selectedAgent={selectedAgent}
              />
            )}

            {/* Thinking indicator — show only when sending but no streaming text yet */}
            {isSending && !brain.streamingText && !subAgent.streamingText && (
              <div className="flex items-start gap-3.5 py-4 w-full animate-fade-in">
                {/* Premium AI Avatar (matching MessageBubble) */}
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#333333] flex items-center justify-center shadow-lg shadow-neutral-500/30 border-2 border-white relative mt-1 overflow-hidden">
                  <video
                    key={selectedAgent}
                    src={getAgentHeroAvatar(selectedAgent)}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover scale-100"
                    style={{ objectPosition: selectedAgent === 'brain' ? 'center 60%' : 'center 15%' }}
                  />
                </div>
                {Boolean(
                  (brain.status || subAgent.status)?.toLowerCase().match(/composing scene|rendering|dall-e|generating image|creating visual/) ||
                  (selectedAgent?.includes('image') && (messages.slice().reverse().find(m => m.role === 'USER')?.content || '').length > 8 && !(messages.slice().reverse().find(m => m.role === 'USER')?.content || '').toLowerCase().match(/^(hello|hi|hey|test|how are you|good morning)\b/i)) ||
                  input?.toLowerCase().match(/image|generate|draw|design|picture|photo|logo|banner/)
                ) ? (
                  /* High-End Dynamic Developing Canvas Image Card */
                  <div className="relative w-full aspect-square max-w-[420px] bg-white dark:bg-[#171717]/90 dark:backdrop-blur-xl border border-neutral-100/90 dark:border-[#333333] rounded-2xl p-5 shadow-[0_12px_40px_rgba(255,255,255,0.08)] overflow-hidden flex flex-col justify-between select-none">
                    <style>{`
                      @keyframes plate-swirl-cw {
                        0%, 100% { transform: scale(1.2) rotate(0deg); filter: blur(24px) saturate(130%); }
                        50% { transform: scale(1.35) rotate(10deg); filter: blur(12px) saturate(160%); }
                      }
                      @keyframes laser-sweep-cw {
                        0% { transform: translateY(-110%); }
                        100% { transform: translateY(220%); }
                      }
                      @keyframes fill-bar-cw {
                        0% { width: 4%; }
                        50% { width: 68%; }
                        100% { width: 95%; }
                      }
                    `}</style>

                    <div className="flex items-center justify-between z-10 mb-2">
                      <div className="flex items-center gap-2 font-['Space_Grotesk'] text-[14px] font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1a1a1a]"></span>
                        </span>
                        Generating image
                      </div>
                    </div>

                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black border border-neutral-100 dark:border-[#333333] shadow-inner my-1">
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: 'radial-gradient(circle at 25% 25%, rgba(232, 103, 122, 0.75), transparent 50%), radial-gradient(circle at 75% 65%, rgba(139, 126, 240, 0.7), transparent 55%), radial-gradient(circle at 50% 85%, rgba(240, 168, 96, 0.65), transparent 60%), #000000',
                          animation: 'plate-swirl-cw 8s ease-in-out infinite'
                        }}
                      />
                      <div 
                        className="absolute left-0 right-0 h-2/5 pointer-events-none z-10"
                        style={{
                          background: 'linear-gradient(to bottom, rgba(240, 168, 96, 0) 0%, rgba(240, 168, 96, 0.25) 45%, rgba(240, 168, 96, 0.5) 50%, rgba(240, 168, 96, 0.25) 55%, rgba(240, 168, 96, 0) 100%)',
                          animation: 'laser-sweep-cw 3s cubic-bezier(.65, 0, .35, 1) infinite'
                        }}
                      />
                      <div className="absolute top-2.5 left-2.5 w-3 h-3 opacity-60 pointer-events-none">
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white"></div>
                        <div className="absolute left-1/2 top-0 h-full w-[1px] bg-white"></div>
                      </div>
                      <div className="absolute top-2.5 right-2.5 w-3 h-3 opacity-60 pointer-events-none">
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white"></div>
                        <div className="absolute left-1/2 top-0 h-full w-[1px] bg-white"></div>
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 w-3 h-3 opacity-60 pointer-events-none">
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white"></div>
                        <div className="absolute left-1/2 top-0 h-full w-[1px] bg-white"></div>
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 w-3 h-3 opacity-60 pointer-events-none">
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white"></div>
                        <div className="absolute left-1/2 top-0 h-full w-[1px] bg-white"></div>
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between font-mono text-[10px] text-white/90 z-20 backdrop-blur-md bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                        <span>1024 × 1024</span>
                        <span className="text-amber-300 font-bold animate-pulse">developing…</span>
                      </div>
                    </div>

                    <div className="z-10 mt-1">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-[260px]">
                          {brain.status || subAgent.status || "Composing scene & light..."}
                        </span>
                        <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-400 font-mono">
                          Rendering...
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-neutral-600 via-pink-500 to-amber-500"
                          style={{ animation: 'fill-bar-cw 8s ease-in-out infinite' }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 bg-white/80 dark:bg-[#171717]/90 backdrop-blur-xl border border-white dark:border-[#333333] rounded-xl rounded-tl-sm px-6 py-4 shadow-[0_4px_32px_rgba(0,0,0,0.03)] w-full max-w-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#1a1a1a]/70 dark:bg-white/70 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-[#1a1a1a]/70 dark:bg-white/70 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-[#1a1a1a]/70 dark:bg-white/70 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>

                    <StepTree 
                      nodes={Object.keys(brain.nodes).length > 0 ? brain.nodes : subAgent.nodes} 
                      rootOrder={brain.rootOrder.length > 0 ? brain.rootOrder : subAgent.rootOrder} 
                      steps={brain.steps.length > 0 ? brain.steps : subAgent.steps} 
                      confidence={brain.metadata?.confidence ?? subAgent.metadata?.confidence ?? null} 
                      statusText={brain.status || subAgent.status} 
                      isStreaming={true} 
                      metrics={brain.metrics || subAgent.metrics} 
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Input bar ──────────────────────────────────────────────────────── */}
      <div
        ref={emptyStateRef}
        className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-3 flex flex-col items-center z-30 bg-gradient-to-t from-[#f6f7fb] dark:from-[#111111] via-[#f6f7fb]/80 dark:via-[#111111]/80 to-transparent"
      >
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center">

          {inClarifyMode && (
            <div className="mb-2.5 flex items-center gap-3">
              <div className="flex-1 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#1a1a1a] to-[#333333] rounded-full transition-all duration-500"
                  style={{ width: `${((clarifyIndex) / clarifyQueue.length) * 100}%` }}
                />
              </div>
              <span className="text-[11px] font-semibold text-[#1a1a1a] dark:text-[#333333] whitespace-nowrap">
                Question {clarifyIndex} of {clarifyQueue.length}
              </span>
            </div>
          )}

          <form
            ref={inputFormRef}
            onSubmit={onFormSubmit}
            className="w-full flex items-center gap-3 bg-white/85 dark:bg-[#171717]/90 backdrop-blur-2xl rounded-xl border border-white dark:border-[#262626] shadow-[0_4px_24px_rgba(255,255,255,0.06)] px-4.5 py-2.5 sm:py-3 transition-all focus-within:bg-white dark:focus-within:bg-[#171717] focus-within:border-neutral-50 dark:focus-within:border-[#383e56] focus-within:shadow-[0_8px_32px_rgba(255,255,255,0.12)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-50/30 to-neutral-50/30 pointer-events-none opacity-0 focus-within:opacity-100 transition-opacity duration-500"></div>
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
              className="flex-1 resize-none bg-transparent text-[14px] sm:text-[15px] text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 outline-none leading-normal py-0.5 font-medium disabled:opacity-40 min-h-[24px] z-10"
              style={{ overflow: 'hidden' }}
            />

            <button
              type="submit"
              disabled={isInputDisabled || !input.trim()}
              className="flex-shrink-0 w-9.5 h-9.5 rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-50 z-10 hover:shadow-lg hover:-translate-y-0.5"
              style={{
                background: (isInputDisabled || !input.trim())
                  ? '#f3f4f6'
                  : 'linear-gradient(135deg, #262626 0%, #333333 100%)',
                boxShadow: (isInputDisabled || !input.trim()) ? 'none' : '0 6px 16px rgba(255,255,255,0.3)',
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

          <p className="text-center text-[11px] text-neutral-400 dark:text-neutral-500 mt-2">
            {inClarifyMode
              ? 'Answer each question to continue -- answers will be sent together'
              : brain.isStreaming
                ? 'Streaming response in real-time...'
                : <>Press <kbd className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 dark:text-neutral-300 rounded px-1.5 py-0.5 text-[10px] font-mono shadow-sm">Enter</kbd> to send · <kbd className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 dark:text-neutral-300 rounded px-1.5 py-0.5 text-[10px] font-mono shadow-sm">Shift + Enter</kbd> for new line</>
            }
          </p>
        </div>
      </div>
    </div>
  );
}
