import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer"
        className={`underline underline-offset-2 transition-colors ${isUser ? 'text-white/90 hover:text-white' : 'text-[#6c48ff] hover:text-violet-800'}`}>
        {children}
      </a>
    ),
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
  const isUser          = message.role === 'user' || message.role === 'USER';
  const isClarification = !isUser && message.isClarification;
  const isSummary       = !isUser && message.isSummary;
  const [metaOpen, setMetaOpen] = useState(false);

  const agents  = message.targetOrchestrators || message.agentsCalled || [];
  const sources = message.sources || [];
  const inScope = message.inScope ?? true;
  const showMeta = !isUser && agents.length > 0;

  // ── Special: Clarification question bubble ─────────────────────────────────
  if (isClarification) {
    return (
      <div className="flex gap-3 py-3 justify-start">
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mt-0.5 shadow-sm shadow-teal-100">
          <svg className="w-[16px] h-[16px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex flex-col gap-1.5 items-start max-w-[72%]">
          {message.clarifyStep && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Question {message.clarifyStep} of {message.clarifyTotal}
            </span>
          )}
          <div className="bg-white border-2 border-teal-100 rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm">
            <p className="text-[15px] font-medium text-gray-800 leading-[1.7]">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Special: Summary / submitting bubble ───────────────────────────────────
  if (isSummary) {
    return (
      <div className="flex gap-3 py-3 justify-start">
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mt-0.5 shadow-sm shadow-green-100">
          <svg className="w-[16px] h-[16px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm max-w-[72%]">
          <p className="text-[14px] font-semibold text-emerald-700 leading-[1.7]">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 py-3 ${isUser ? 'justify-end' : 'justify-start'}`}>

      {/* AI avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-[#6c48ff] to-[#a78bfa] flex items-center justify-center mt-0.5 shadow-sm shadow-violet-100">
          <svg className="w-[18px] h-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      )}

      <div className={`flex flex-col gap-2 ${isUser ? 'items-end max-w-[72%]' : 'items-start flex-1 min-w-0'}`}>

        {/* ── Out of scope warning ── */}
        {!isUser && !inScope && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-[12px] font-medium">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            This query is outside the agent's scope.
          </div>
        )}

        {/* ── Agent pills (above bubble) ── */}
        {!isUser && agents.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {agents.map(a => {
              const { icon, name } = resolveAgent(a);
              return (
                <span key={a} className="inline-flex items-center gap-1 bg-violet-50 text-violet-600 border border-violet-100 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                  {icon} {name}
                </span>
              );
            })}
          </div>
        )}

        {/* ── Message bubble ── */}
        <div className={`relative rounded-2xl px-5 py-3.5 ${
          isUser
            ? 'bg-gradient-to-br from-[#6c48ff] to-[#7c3aed] text-white rounded-tr-sm shadow-md shadow-violet-200'
            : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100 shadow-sm'
        }`}>
          {isUser ? (
            <p className="text-[15px] leading-[1.7] font-medium whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="text-[15px] leading-[1.75] text-gray-800 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={makeMarkdownComponents(false)}
              >
                {message.content || (isStreaming ? '▋' : '')}
              </ReactMarkdown>
            </div>
          )}

          {/* User message copy button on hover */}
          {isUser && (
            <div className="absolute -bottom-6 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton text={message.content} />
            </div>
          )}
        </div>

        {/* ── Sources ── */}
        {!isUser && sources.length > 0 && (
          <div className="flex flex-col gap-1.5 w-full">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Sources</span>
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
                    className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-600 hover:text-violet-700 text-[12px] font-medium px-3 py-1.5 rounded-xl transition-all shadow-sm max-w-[200px] truncate"
                  >
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    {label}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Meta footer — agents used ── */}
        {showMeta && (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            Used: {agents.join(', ')}
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center mt-0.5 shadow-sm">
          <svg className="w-[18px] h-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
      )}
    </div>
  );
}
