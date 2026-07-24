import React, { useState, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getAssetUrl } from '../../../../utils/assetUrl';

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyButton({ text, light = false }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md transition-all ${
        light
          ? 'bg-white/10 hover:bg-white/20 text-white/80'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
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

// ─── Markdown components ──────────────────────────────────────────────────────
function makeMarkdownComponents(isUser) {
  const textColor = isUser ? 'text-white' : 'text-gray-800';
  return {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      if (!inline && match) {
        return (
          <div className="rounded-xl overflow-hidden my-3 shadow-sm">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#1e1e2e]">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{match[1]}</span>
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
        <code className={`${isUser ? 'bg-white/20 text-white' : 'bg-violet-50 text-[#6c48ff]'} px-1.5 py-0.5 rounded-md text-[13px] font-mono`} {...props}>
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
        <span className={`mt-[10px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${isUser ? 'bg-white/70' : 'bg-[#6c48ff]'}`} />
        <span>{children}</span>
      </li>
    ),
    blockquote: ({ children }) => (
      <blockquote className={`border-l-[3px] ${isUser ? 'border-white/40 bg-white/10' : 'border-[#6c48ff] bg-violet-50'} pl-4 py-2 my-3 rounded-r-xl text-[14px] italic`}>
        {children}
      </blockquote>
    ),
    strong: ({ children }) => <strong className={`font-bold ${textColor}`}>{children}</strong>,
    em: ({ children }) => <em className={`italic ${isUser ? 'text-white/90' : 'text-gray-700'}`}>{children}</em>,
    a: ({ href, children }) => {
      const fullHref = getAssetUrl(href);
      return (
        <a href={fullHref} target="_blank" rel="noopener noreferrer"
          className={`underline underline-offset-2 transition-colors ${isUser ? 'text-white/90 hover:text-white' : 'text-[#6c48ff] hover:text-violet-800'}`}>
          {children}
        </a>
      );
    },
    hr: () => <hr className={`my-4 ${isUser ? 'border-white/20' : 'border-gray-200'}`} />,
    table: ({ children }) => (
      <div className="overflow-x-auto my-3 rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-[13px] border-collapse">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
    th: ({ children }) => <th className="px-4 py-2.5 font-semibold text-gray-700 text-left border-b border-gray-200">{children}</th>,
    tr: ({ children }) => <tr className="border-b border-gray-100 last:border-0">{children}</tr>,
    td: ({ children }) => <td className="px-4 py-2.5 text-gray-600">{children}</td>,
    img: ({ src, alt, ...props }) => {
      const fullUrl = getAssetUrl(src);
      
      return (
        <div className="my-3 overflow-hidden rounded-[18px] border border-gray-200/80 bg-gray-50 shadow-sm max-w-[400px]">
          <img
            {...props}
            src={fullUrl}
            className="w-full h-auto object-cover hover:opacity-95 transition-opacity"
            alt={alt || "Generated Visual Asset"}
            loading="lazy"
          />
          <div className="px-3 py-2.5 bg-white border-t border-gray-100 flex items-center justify-between text-[11px] font-semibold text-gray-400">
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Generated Asset
            </span>
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-1"
            >
              View Full <span className="text-[14px]">↗</span>
            </a>
          </div>
        </div>
      );
    },
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
export default function MessageBubble({ message, isStreaming }) {
  const bubbleRef = useRef(null);

  useLayoutEffect(() => {
    if (bubbleRef.current) {
      gsap.fromTo(bubbleRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);
  const isUser          = message.role === 'user' || message.role === 'USER';
  const isClarification = !isUser && message.isClarification;
  const isSummary       = !isUser && message.isSummary;

  const agents  = message.targetOrchestrators || message.agentsCalled || [];
  const sources = message.sources || [];
  const inScope = message.inScope ?? true;
  const showMeta = !isUser && agents.length > 0;

  // ── Special: Clarification question bubble ─────────────────────────────────
  if (isClarification) {
    return (
      <div ref={bubbleRef} className="flex gap-4 py-4 justify-start group">
        <div className="flex-shrink-0 w-9 h-9 rounded-[14px] bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center mt-1 shadow-md shadow-teal-500/20">
          <svg className="w-[18px] h-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <p className="text-[15px] font-medium text-gray-800 leading-[1.6]">{message.content}</p>
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

  return (
    <div ref={bubbleRef} className={`flex gap-3.5 py-4 ${isUser ? 'justify-end' : 'justify-start'} group w-full`}>

      {/* AI avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-[16px] bg-gradient-to-br from-[#6c48ff] to-[#a78bfa] flex items-center justify-center shadow-lg shadow-violet-500/30 border-2 border-white relative mt-1">
          <div className="absolute inset-0 rounded-[14px] ring-1 ring-white/40 inset-ring"></div>
          <svg className="w-5 h-5 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      )}

      <div className={`flex flex-col gap-2 relative ${isUser ? 'items-end w-auto max-w-[75%]' : 'items-start flex-1 min-w-0 max-w-[85%]'}`}>

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
                <span key={a} className="inline-flex items-center gap-1.5 bg-violet-50/80 text-violet-700 border border-violet-100 text-[12px] font-medium px-2.5 py-1 rounded-full shadow-sm">
                  <span className="text-[13px]">{icon}</span> {name}
                </span>
              );
            })}
          </div>
        )}

        {/* ── Message bubble ── */}
        <div className={`relative px-6 py-4 transition-all ${
          isUser
            ? 'bg-gradient-to-br from-[#5030e5] to-[#7b61ff] text-white rounded-[28px] rounded-br-[8px] shadow-[0_8px_24px_rgba(108,72,255,0.25)] border border-white/10'
            : 'bg-white/80 backdrop-blur-xl text-gray-800 rounded-[28px] rounded-tl-[8px] border border-white shadow-[0_4px_32px_rgba(0,0,0,0.03)]'
        }`}>
          {isUser ? (
            <p className="text-[15px] leading-[1.6] font-medium whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="text-[15px] leading-[1.7] text-gray-800 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 font-normal">
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
                  // Hide ugly raw image URLs from the text (they are rendered as cards below anyway)
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
              
              {/* Method B: Direct Structured Metadata Image Card */}
              {(() => {
                let rawImageUrl = 
                  message.executionResults?.image_generation?.image_url ||
                  message.executionResults?.social_media_orchestrator?.execution_results?.image_generation?.image_url ||
                  message.executionResults?.social_media_orchestrator?.image_generation?.image_url;
                  
                // Smart Fallback: If metadata is missing or changed, extract from text!
                if (!rawImageUrl && message.content) {
                  const match = message.content.match(/(?:\/kayneticsagents\/|https?:\/\/[^\s"'`<>]+)[^\s"'`<>]+\.(?:png|jpg|jpeg|gif|webp)/i);
                  if (match) {
                    rawImageUrl = match[0];
                  }
                }
                  
                if (!rawImageUrl) return null;
                const imageUrl = getAssetUrl(rawImageUrl);
                  
                // Check if the URL was rendered specifically as a Markdown image tag (![])
                const isRenderedAsImage = message.content && new RegExp(`!\\[.*?\\]\\(.*?${rawImageUrl.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}.*?\\)`).test(message.content);
                  
                // Only render if it exists AND wasn't already rendered as an image by Markdown (Method A)
                if (imageUrl && !isRenderedAsImage) {
                  return (
                    <div className="my-3 overflow-hidden rounded-[18px] border border-gray-200/80 bg-gray-50 shadow-sm max-w-[400px]">
                      <img
                        src={imageUrl}
                        className="w-full h-auto object-cover hover:opacity-95 transition-opacity"
                        alt="Generated Visual Asset"
                        loading="lazy"
                      />
                      <div className="px-3 py-2.5 bg-white border-t border-gray-100 flex items-center justify-between text-[11px] font-semibold text-gray-400">
                        <span className="flex items-center gap-1.5 uppercase tracking-wider">
                          <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Generated Asset
                        </span>
                        <a
                          href={imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-1"
                        >
                          View Full <span className="text-[14px]">↗</span>
                        </a>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              
              {/* Live Streaming Skeleton Loader for Images */}
              {isStreaming && message.status && /image|visual|drawing|generating/i.test(message.status) && (
                <div className="my-3 overflow-hidden rounded-[18px] border border-gray-200/80 bg-gray-50 shadow-sm max-w-[400px]">
                  {/* Skeleton Image Area */}
                  <div className="w-full aspect-square bg-gray-200/50 animate-pulse flex flex-col items-center justify-center gap-3">
                    <svg className="w-8 h-8 text-gray-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ animationDuration: '2s' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-widest animate-pulse">
                      Creating Visual...
                    </span>
                  </div>
                  {/* Skeleton Footer Area */}
                  <div className="px-3 py-3.5 bg-white border-t border-gray-100 flex items-center justify-between">
                    <div className="w-32 h-2.5 bg-gray-200/80 rounded-full animate-pulse" />
                    <div className="w-16 h-2.5 bg-gray-200/80 rounded-full animate-pulse" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Generation Metadata ── */}
        {!isUser && (message.tokensUsed || message.model) && !isStreaming && (
          <div className="flex items-center gap-2.5 mt-0.5 ml-2 text-[11px] font-semibold text-gray-400">
            {message.model && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
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
            <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
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
                    className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-600 hover:text-violet-700 text-[13px] font-medium px-3 py-1.5 rounded-xl transition-all shadow-sm max-w-[250px] truncate"
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
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center shadow-lg shadow-black/10 border-2 border-white relative mt-1">
          <svg className="w-5 h-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
      )}
    </div>
  );
}
