import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function MessageBubble({ message, isStreaming, onSubmitClarification }) {
  const isUser = message.role === 'user' || message.role === 'USER';
  const [answers, setAnswers] = useState({});

  const handleClarificationSubmit = (e) => {
    e.preventDefault();
    if (onSubmitClarification) {
      onSubmitClarification(answers);
    }
  };

  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full mb-2`}>
      <div className={`max-w-[85%] lg:max-w-[75%] rounded-[24px] px-6 py-4 shadow-sm ${
        isUser 
          ? 'bg-gradient-to-br from-[#6c48ff] to-[#8b5cf6] text-white rounded-br-sm' 
          : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)]'
      }`}>
        {isUser ? (
          <p className="text-[15px] leading-relaxed font-medium whitespace-pre-wrap">
            {message.content}
          </p>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:my-1 prose-strong:font-bold text-[15px] text-gray-800">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  return !inline && match ? (
                    <div className="relative group mt-4 mb-4 rounded-xl overflow-hidden shadow-sm">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleCopyCode(codeString)}
                          className="bg-gray-700 hover:bg-gray-600 text-white text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors"
                          title="Copy Code"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          Copy
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={tomorrow}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ margin: 0, padding: '1.5rem 1rem 1rem 1rem', fontSize: '13px', borderRadius: '0.75rem' }}
                        {...props}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="bg-blue-50 text-[#6c48ff] px-1.5 py-0.5 rounded-md text-[13px] font-mono" {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {message.content || (isStreaming ? '...' : '')}
            </ReactMarkdown>
          </div>
        )}

        {/* Clarifying Questions Form */}
        {message.clarifyingQuestions && message.clarifyingQuestions.length > 0 && !message.clarificationAnswered && (
          <div className="mt-6 pt-5 border-t border-gray-200">
            <p className="text-[13px] font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              I need a bit more info to proceed:
            </p>
            <form onSubmit={handleClarificationSubmit} className="space-y-4">
              {message.clarifyingQuestions.map((q, idx) => (
                <div key={idx}>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">{q}</label>
                  <input
                    type="text"
                    required
                    value={answers[q] || ''}
                    onChange={(e) => setAnswers({ ...answers, [q]: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:bg-white text-gray-900 text-[14px] outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2] transition-all"
                  />
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <button 
                  type="submit"
                  className="bg-[#1a1a1a] hover:bg-black text-white px-5 py-2 rounded-xl text-[13px] font-bold transition-all shadow-sm"
                >
                  Submit Answers
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Render Citations / Sources if they exist in metadata */}
        {!isUser && message.metadata?.sources && message.metadata.sources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Sources Used</p>
            <div className="flex flex-wrap gap-2">
              {message.metadata.sources.map((source, i) => (
                <a 
                  key={i} 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white border border-gray-200 text-[#1a1a1a] text-[12px] px-3 py-1.5 rounded-lg hover:shadow-sm hover:border-[#1a1a1a] transition-all truncate max-w-[200px]"
                >
                  {source.title || source.domain}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
