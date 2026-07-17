import React from 'react';

import ReactMarkdown from 'react-markdown';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user' || message.role === 'USER';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] rounded-[20px] px-6 py-4 ${
        isUser 
          ? 'bg-[#1a1a1a] text-white rounded-tr-[4px] shadow-sm' 
          : 'bg-[#fafbfc] text-[#1a1a1a] rounded-tl-[4px] border border-gray-100 shadow-sm'
      }`}>
        <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:my-1 prose-strong:font-bold prose-strong:text-inherit text-[15px] font-medium">
          <ReactMarkdown>
            {message.content || (!isUser && '...')}
          </ReactMarkdown>
        </div>
        
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
