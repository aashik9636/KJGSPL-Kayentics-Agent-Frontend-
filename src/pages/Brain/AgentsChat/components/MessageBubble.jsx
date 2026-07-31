import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getAssetUrl } from '../../../../utils/assetUrl';
import StepTree from './StepTree';

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyButton({ text, light = false }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md transition-all ${
        light
          ? 'bg-white/10 hover:bg-white/20 text-white/80'
          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-500'
      }`}
    >
      {copied
        ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      }
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

// ─── Image with Skeleton Loader ───────────────────────────────────────────────
function ImageWithSkeleton({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const fullUrl = getAssetUrl(src);

  const stages = [
    { title: "Parsing prompt description", sub: "understanding context" },
    { title: "Composing the scene", sub: "laying out structure" },
    { title: "Rendering details & light", sub: "applying textures" },
    { title: "Finishing touches", sub: "sharpening output" }
  ];

  useEffect(() => {
    if (loaded) return;
    const timer = setInterval(() => {
      setStageIndex(prev => (prev + 1) % stages.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [loaded]);

  const handleDownload = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kaynetics-asset-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed, opening in new tab:", err);
      window.open(fullUrl, '_blank');
    }
  };

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-neutral-200 dark:border-[#333333] bg-white dark:bg-[#171717] shadow-sm max-w-[420px] w-full transition-all group">
      <div className="relative w-full aspect-square bg-black overflow-hidden flex items-center justify-center">
        {!loaded && !hasError && (
          <div className="absolute inset-0 z-10 flex flex-col justify-between p-5 bg-white dark:bg-[#171717] select-none">
            <style>{`
              @keyframes plate-swirl-light {
                0%, 100% { transform: scale(1.2) rotate(0deg); filter: blur(24px) saturate(130%); }
                50% { transform: scale(1.35) rotate(10deg); filter: blur(12px) saturate(160%); }
              }
              @keyframes laser-sweep-light {
                0% { transform: translateY(-110%); }
                100% { transform: translateY(220%); }
              }
              @keyframes fill-bar-light {
                0% { width: 4%; }
                50% { width: 68%; }
                100% { width: 95%; }
              }
            `}</style>

            {/* Header */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2 font-['Space_Grotesk'] text-[14px] font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1a1a1a]"></span>
                </span>
                Generating image
              </div>
            </div>

            {/* Developing Canvas Frame */}
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black border border-neutral-100 dark:border-[#333333] shadow-inner my-2">
              <div 
                className="absolute inset-0"
                style={{
                  background: `
                    radial-gradient(circle at 25% 25%, rgba(232, 103, 122, 0.75), transparent 50%),
                    radial-gradient(circle at 75% 65%, rgba(139, 126, 240, 0.7), transparent 55%),
                    radial-gradient(circle at 50% 85%, rgba(240, 168, 96, 0.65), transparent 60%),
                    #000000
                  `,
                  animation: 'plate-swirl-light 8s ease-in-out infinite'
                }}
              />

              <div 
                className="absolute left-0 right-0 h-2/5 pointer-events-none z-10"
                style={{
                  background: `linear-gradient(
                    to bottom,
                    rgba(240, 168, 96, 0) 0%,
                    rgba(240, 168, 96, 0.25) 45%,
                    rgba(240, 168, 96, 0.5) 50%,
                    rgba(240, 168, 96, 0.25) 55%,
                    rgba(240, 168, 96, 0) 100%
                  )`,
                  animation: 'laser-sweep-light 3s cubic-bezier(.65, 0, .35, 1) infinite'
                }}
              />

              {/* Crosshair Viewport Markers */}
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

            {/* Status Footer */}
            <div className="z-10 mt-1">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{stages[stageIndex].title}</span>
                  <span className="text-neutral-400 dark:text-neutral-500 text-[11px]">— {stages[stageIndex].sub}</span>
                </div>
              </div>

              <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-neutral-600 via-pink-500 to-amber-500"
                  style={{ animation: 'fill-bar-light 8s ease-in-out infinite' }}
                />
              </div>
            </div>
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-neutral-900 text-neutral-400 text-xs text-center">
            <svg className="w-8 h-8 text-rose-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Failed to render visual asset</span>
          </div>
        )}

        <img
          src={fullUrl}
          alt={alt || "Generated Visual Asset"}
          onLoad={() => setLoaded(true)}
          onError={() => { setLoaded(true); setHasError(true); }}
          className={`w-full h-full object-cover transition-opacity duration-700 ${loaded && !hasError ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>

      <div className="px-3.5 py-3 bg-neutral-50 dark:bg-[#171717] border-t border-neutral-200 dark:border-[#333333] flex items-center justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400">
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
          <svg className="w-3.5 h-3.5 text-[#1a1a1a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {alt || "AI Visual Asset"}
        </span>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="text-neutral-500 dark:text-neutral-400 hover:text-[#1a1a1a] dark:hover:text-[#1a1a1a] transition-colors flex items-center gap-1 text-[11px] focus:outline-none"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>

          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1a1a1a] hover:text-neutral-800 transition-colors flex items-center gap-1 text-[11px] font-bold"
          >
            Full View ↗
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Markdown components ──────────────────────────────────────────────────────
function makeMarkdownComponents(isUser) {
  const textColor = isUser ? 'text-white' : 'text-neutral-800 dark:text-neutral-100';
  return {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      if (!inline && match) {
        return (
          <div className="rounded-xl overflow-hidden my-3 shadow-sm border border-neutral-800">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#1e1e2e]">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">{match[1]}</span>
              <CopyButton text={codeString} light />
            </div>
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              customStyle={{ margin: 0, padding: '1rem 1.25rem', fontSize: '13px', lineHeight: '1.6', background: '#282c34' }}
              {...props}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        );
      }
      return (
        <code className={`${isUser ? 'bg-white/20 text-white' : 'bg-neutral-50 text-[#1a1a1a]'} px-1.5 py-0.5 rounded-md text-[13px] font-mono`} {...props}>
          {children}
        </code>
      );
    },
    h1: ({ children }) => <h1 className={`text-xl font-bold ${textColor} mt-5 mb-3 border-b border-current border-opacity-10 pb-2`}>{children}</h1>,
    h2: ({ children }) => <h2 className={`text-lg font-bold ${textColor} mt-4 mb-2`}>{children}</h2>,
    h3: ({ children }) => <h3 className={`text-base font-semibold ${textColor} mt-3 mb-1.5`}>{children}</h3>,
    p:  ({ children }) => <p className={`leading-[1.75] ${textColor} my-1.5 text-[15px]`}>{children}</p>,
    ul: ({ children }) => <ul className="my-2 space-y-1.5 pl-0">{children}</ul>,
    ol: ({ children }) => <ol className={`my-2 space-y-1.5 pl-4 list-decimal ${textColor}`}>{children}</ol>,
    li: ({ children }) => (
      <li className={`flex items-start gap-2.5 ${textColor} text-[15px] leading-[1.75]`}>
        <span className={`mt-[10px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${isUser ? 'bg-white/70' : 'bg-[#1a1a1a] dark:bg-neutral-400'}`} />
        <span>{children}</span>
      </li>
    ),
    blockquote: ({ children }) => (
      <blockquote className={`border-l-[3px] ${isUser ? 'border-white/40 bg-white/10' : 'border-[#1a1a1a] bg-neutral-50'} pl-4 py-2 my-3 rounded-r-xl text-[14px] italic`}>
        {children}
      </blockquote>
    ),
    strong: ({ children }) => <strong className={`font-bold ${textColor}`}>{children}</strong>,
    em: ({ children }) => <em className={`italic ${isUser ? 'text-white/90' : 'text-neutral-700'}`}>{children}</em>,
    a: ({ href, children }) => {
      const fullHref = getAssetUrl(href);
      return (
        <a href={fullHref} target="_blank" rel="noopener noreferrer"
          className={`underline underline-offset-2 transition-colors ${isUser ? 'text-white/90 hover:text-white' : 'text-[#1a1a1a] hover:text-neutral-800'}`}>
          {children}
        </a>
      );
    },
    hr: () => <hr className={`my-4 ${isUser ? 'border-white/20' : 'border-neutral-200'}`} />,
    table: ({ children }) => (
      <div className="overflow-x-auto my-3 rounded-xl border border-neutral-200 shadow-sm">
        <table className="w-full text-[13px] border-collapse">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-neutral-50">{children}</thead>,
    th: ({ children }) => <th className="px-4 py-2.5 font-semibold text-neutral-700 text-left border-b border-neutral-200">{children}</th>,
    tr: ({ children }) => <tr className="border-b border-neutral-100 last:border-0">{children}</tr>,
    td: ({ children }) => <td className="px-4 py-2.5 text-neutral-600">{children}</td>,
    img: ({ src, alt }) => <ImageWithSkeleton src={src} alt={alt} />,
  };
}

// ─── Agent badge ──────────────────────────────────────────────────────────────
const AGENT_MAP = {
  scraper: { icon: '🌐', name: 'Web Research' },
  social:  { icon: '📱', name: 'Social Media' },
  recruit: { icon: '🧑‍💼', name: 'Recruiter' },
  finance: { icon: '📈', name: 'Finance' },
  writer:  { icon: '✍️',  name: 'Writer' },
  email:   { icon: '📧', name: 'Email' },
};
function resolveAgent(raw) {
  const k = Object.keys(AGENT_MAP).find(k => raw?.toLowerCase().includes(k));
  return k ? AGENT_MAP[k] : { icon: '🤖', name: raw };
}

// ─── Main component ───────────────────────────────────────────────────────────
function resolveAgentAvatarVideo(message = {}, selectedAgent = 'brain') {
  const m = (
    message.agentSlug ||
    message.agent ||
    message.slug ||
    message.agent_slug ||
    message.model ||
    selectedAgent ||
    'brain'
  ).toLowerCase().trim();

  if (m.includes('stock')) return '/stock_market_avatar.mp4';
  if (m.includes('research') || m.includes('writer') || m.includes('campaign')) return '/research_avatar.mp4';
  if (m.includes('market') || m.includes('image')) return '/market_avatar.mp4';
  if (m.includes('lead')) return '/lead_gen_avatar.mp4';
  if (m.includes('recruit')) return '/recruitment_avatar.mp4';
  if (m.includes('social') || m.includes('trend')) return '/social_trends_avatar.mp4';
  return '/brain_avatar.mp4';
}

export default function MessageBubble({ message, isStreaming = false, selectedAgent = 'brain' }) {
  const bubbleRef = useRef(null);

  useLayoutEffect(() => {
    if (bubbleRef.current) {
      gsap.fromTo(bubbleRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, []);

  const isUser    = message.role === 'USER';
  const isSystem  = message.role === 'SYSTEM';
  const isClarify = Boolean(message.isClarifying || message.clarifying_questions);
  const isSummary = Boolean(message.isSummarySubmit);
  const inScope   = message.inScope !== false && message.in_scope !== false;
  const agents    = message.agents_involved || message.agentsInvolved || [];
  const sources   = message.sources || message.metadata?.sources || [];

  // ── Special: System message ────────────────────────────────────────────────
  if (isSystem) {
    return (
      <div ref={bubbleRef} className="flex justify-center my-3 w-full">
        <div className="bg-neutral-100/80 text-neutral-500 text-xs px-4 py-1.5 rounded-full border border-neutral-200/50 flex items-center gap-2 shadow-sm font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
          {message.content}
        </div>
      </div>
    );
  }

  // ── Special: Clarification question bubble ───────────────────────────────
  if (isClarify) {
    return (
      <div ref={bubbleRef} className="flex gap-3.5 py-4 justify-start group w-full">
        <div className="flex-shrink-0 w-9 h-9 rounded-[14px] bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mt-1 shadow-md shadow-teal-500/20">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex flex-col gap-1.5 items-start max-w-[75%]">
          {message.clarifyStep && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Question {message.clarifyStep} of {message.clarifyTotal}
            </span>
          )}
          <div className="bg-white border border-teal-100 rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm">
            <p className="text-[15px] font-medium text-neutral-800 leading-[1.6]">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Special: Summary / submitting bubble ───────────────────────────────────
  if (isSummary) {
    return (
      <div ref={bubbleRef} className="flex gap-4 py-4 justify-start">
        <div className="flex-shrink-0 w-9 h-9 rounded-[14px] bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mt-1 shadow-md shadow-green-500/20">
          <svg className="w-[18px] h-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="bg-emerald-50 border border-emerald-100/50 rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm max-w-[75%]">
          <p className="text-[15px] font-medium text-emerald-800 leading-[1.6]">{message.content}</p>
        </div>
      </div>
    );
  }

  const avatarVideo = resolveAgentAvatarVideo(message, selectedAgent);

  return (
    <div ref={bubbleRef} className={`flex gap-3.5 py-4 ${isUser ? 'justify-end' : 'justify-start'} group w-full`}>

      {/* AI avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#333333] flex items-center justify-center shadow-md shadow-neutral-500/20 border-2 border-white relative mt-1 overflow-hidden">
          <video
            key={avatarVideo}
            src={avatarVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-100"
            style={{ 
              objectPosition: avatarVideo.includes('brain') ? 'center 60%' : 'center 15%',
            }}
          />
        </div>
      )}

      <div className={`flex flex-col gap-2 relative ${isUser ? 'items-end w-auto max-w-[75%]' : 'items-start flex-1 min-w-0 max-w-full'}`}>

        {/* ── Out of scope warning ── */}
        {!isUser && !inScope && (
          <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200/50 rounded-xl px-3 py-2 text-[13px] font-medium mb-1">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            This query is outside the agent's scope.
          </div>
        )}

        {/* ── Agent pills (above bubble) ── */}
        {!isUser && agents.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1">
            {agents.map(a => {
              const { icon, name } = resolveAgent(a);
              return (
                <span key={a} className="inline-flex items-center gap-1.5 bg-neutral-50/80 text-neutral-700 border border-neutral-100 text-[12px] font-medium px-2.5 py-1 rounded-full shadow-sm">
                  <span className="text-[13px]">{icon}</span> {name}
                </span>
              );
            })}
          </div>
        )}

        {/* ── Message bubble ── */}
        <div className={`relative transition-all ${
          isUser
            ? 'px-6 py-4 bg-gradient-to-br from-[#262626] to-[#333333] text-white rounded-2xl rounded-br-sm shadow-sm border border-white/10'
            : 'py-2 text-neutral-800 dark:text-neutral-100'
        }`}>
          {isUser ? (
            <p className="text-[15px] leading-[1.6] font-medium whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="text-[15px] leading-[1.7] text-neutral-800 dark:text-neutral-100 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 font-normal">
              {/* Execution Step Tree */}
              <StepTree 
                steps={message.steps || []} 
                nodes={message.nodes || {}}
                rootOrder={message.rootOrder || []}
                confidence={message.confidence} 
                statusText={message.status} 
                isStreaming={isStreaming} 
                metrics={message.metrics}
              />
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={makeMarkdownComponents(false)}
              >
                {(() => {
                  let text = message.content || (isStreaming ? '▋' : '');
                  // Fix AI escaping literal \n
                  text = text.replace(/\\n/g, '\n');
                  // Enforce blank lines before headings so ReactMarkdown parses them correctly
                  text = text.replace(/([^\n])\n(#+ )/g, '$1\n\n$2');
                  // Enforce blank lines before lists
                  text = text.replace(/([^\n])\n(-|\*|\d+\.) /g, '$1\n\n$2 ');
                  // Hide markdown images and raw image URLs from text (they are rendered cleanly below)
                  text = text.replace(/!\[.*?\]\([^\)]+\)/g, '');
                  text = text.replace(/`?(?:\/kayneticsagents\/|https?:\/\/[^\s"'`<>]+)[^\s"'`<>]+\.(?:png|jpg|jpeg|gif|webp)`?/ig, '');
                  
                  // Clean up left-behind labels and AI-generated image details
                  text = text.replace(/(\*\*?)?Image URL:(\*\*?)?\s*\n*/ig, '');
                  text = text.replace(/[-*]\s*\*\*?(Provider|Dimensions|Status|Platform|Size):\*\*?.*\n?/ig, '');
                  text = text.replace(/(\*\*?)?Details:\s*(\*\*?)?\n*/ig, '');
                  
                  // Remove excess blank lines created by stripping
                  text = text.replace(/\n{3,}/g, '\n\n');
                  
                  return text.trim();
                })()}
              </ReactMarkdown>
              
              {/* Single Unified & Deduplicated Image Card Renderer */}
              {(() => {
                const collectedUrls = [];
                
                // 1. From artifacts array
                if (Array.isArray(message.artifacts)) {
                  message.artifacts.forEach(art => {
                    if (art?.url && (art.type === 'image' || art.url.match(/\.(png|jpg|jpeg|gif|webp)$/i))) {
                      collectedUrls.push(art.url);
                    }
                  });
                }
                
                // 2. From executionResults metadata
                const imgGenRes1 = message.executionResults?.image_generation;
                const imgGenRes2 = message.executionResults?.social_media_orchestrator?.execution_results?.image_generation;
                const imgGenRes3 = message.executionResults?.social_media_orchestrator?.image_generation;

                const resImgNode = imgGenRes1 || imgGenRes2 || imgGenRes3;
                if (resImgNode?.image_generated && resImgNode?.image_url) {
                  collectedUrls.push(resImgNode.image_url);
                }
                
                // 3. Fallback: match from message.content string
                if (collectedUrls.length === 0 && message.content) {
                  const match = message.content.match(/(?:\/kayneticsagents\/|https?:\/\/[^\s"'`<>]+)[^\s"'`<>]+\.(?:png|jpg|jpeg|gif|webp)/i);
                  if (match) collectedUrls.push(match[0]);
                }

                // Deduplicate URLs
                const uniqueUrls = Array.from(new Set(collectedUrls));
                if (uniqueUrls.length === 0) return null;

                return (
                  <div className="my-3 space-y-3">
                    {uniqueUrls.map((url, idx) => (
                      <ImageWithSkeleton key={idx} src={url} alt="Generated Visual Asset" />
                    ))}
                  </div>
                );
              })()}

              {/* Downloadable File / Export Non-Image Artifacts (CSV/XLSX/PDF) */}
              {Array.isArray(message.artifacts) && message.artifacts.some(a => a && a.type !== 'image' && !a.url?.match(/\.(png|jpg|jpeg|gif|webp)$/i)) && (
                <div className="my-3 flex flex-col gap-2">
                  {message.artifacts.map((art, idx) => {
                    if (!art || art.type === 'image' || art.url?.match(/\.(png|jpg|jpeg|gif|webp)$/i)) return null;
                    const downloadUrl = getAssetUrl(art.url);
                    const filename = art.filename || art.label || `Export_${idx + 1}.${art.type || 'file'}`;
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50/70 border border-neutral-100 rounded-xl">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">📊</span>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-neutral-800">{filename}</span>
                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">{art.type || 'export'}</span>
                          </div>
                        </div>
                        <a
                          href={downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="px-3 py-1.5 bg-[#1a1a1a] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-neutral-700 transition-colors flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Live Streaming Skeleton Loader for Images */}
              {isStreaming && message.status && /image|visual|drawing|generating/i.test(message.status) && (
                <div className="my-3 overflow-hidden rounded-[18px] border border-neutral-200/80 bg-neutral-50 shadow-sm max-w-[400px]">
                  {/* Skeleton Image Area */}
                  <div className="w-full aspect-square bg-neutral-200/50 animate-pulse flex flex-col items-center justify-center gap-3">
                    <svg className="w-8 h-8 text-neutral-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ animationDuration: '2s' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-widest animate-pulse">
                      Creating Visual...
                    </span>
                  </div>
                  {/* Skeleton Footer Area */}
                  <div className="px-3 py-3.5 bg-white border-t border-neutral-100 flex items-center justify-between">
                    <div className="w-32 h-2.5 bg-neutral-200/80 rounded-full animate-pulse" />
                    <div className="w-16 h-2.5 bg-neutral-200/80 rounded-full animate-pulse" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Generation Metadata ── */}
        {!isUser && (message.tokensUsed || message.model) && !isStreaming && (
          <div className="flex items-center gap-2.5 mt-0.5 ml-2 text-[11px] font-semibold text-neutral-400">
            {message.model && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                {message.model}
              </span>
            )}
            {message.tokensUsed && message.model && <span className="opacity-50">•</span>}
            {message.tokensUsed && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                {message.tokensUsed} tokens
              </span>
            )}
          </div>
        )}

        {/* User message copy button on hover */}
        {isUser && (
          <div className="absolute top-1/2 -left-12 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton text={message.content} />
          </div>
        )}

        {/* ── Sources ── */}
        {!isUser && sources.length > 0 && (
          <div className="flex flex-col gap-2 w-full mt-2">
            <span className="text-[12px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              Sources
            </span>
            <div className="flex flex-wrap gap-2">
              {sources.map((src, i) => {
                const url   = src?.url || (typeof src === 'string' ? src : '');
                const label = src?.title || src?.domain || (url ? new URL(url).hostname : `Source ${i + 1}`);
                return (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-600 hover:text-neutral-700 text-[13px] font-medium px-3 py-1.5 rounded-xl transition-all shadow-sm max-w-[250px] truncate"
                  >
                    {label}
                  </a>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-neutral-800 to-black flex items-center justify-center shadow-lg shadow-black/10 border-2 border-white relative mt-1">
          <svg className="w-5 h-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
      )}
    </div>
  );
}
