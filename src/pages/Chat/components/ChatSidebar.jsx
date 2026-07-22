import React from 'react';

export default function ChatSidebar({ conversations, activeId, onSelect, onNewChat, loading, creatingSession }) {
  const pinned = conversations.filter(c => c.pinned);
  const recent = conversations.filter(c => !c.pinned);

  return (
    <div className="flex flex-col h-full bg-[#fafafa]">

      {/* ── Header ── */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6c48ff] to-[#a78bfa] flex items-center justify-center shadow-sm shadow-violet-100">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-[15px] font-bold text-gray-900 tracking-tight">Brain Agent</span>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          disabled={creatingSession}
          className="w-full flex items-center justify-center gap-2 bg-[#6c48ff] hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-semibold py-2.5 rounded-xl transition-all shadow-sm shadow-violet-200 hover:shadow-md hover:shadow-violet-200"
        >
          {creatingSession ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              New Chat
            </>
          )}
        </button>
      </div>

      {/* ── Conversation list ── */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-4">
        {loading ? (
          <div className="flex flex-col gap-2 px-2 pt-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" style={{ opacity: 1 - i * 0.2 }} />
            ))}
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Pinned</p>
                <div className="space-y-0.5">
                  {pinned.map(conv => (
                    <ConvButton key={conv.id} conv={conv} activeId={activeId} onSelect={onSelect} pinned />
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Recent</p>
              {recent.length === 0 ? (
                <p className="text-[13px] text-gray-400 px-2 py-1">No chats yet.</p>
              ) : (
                <div className="space-y-0.5">
                  {recent.map(conv => (
                    <ConvButton key={conv.id} conv={conv} activeId={activeId} onSelect={onSelect} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ConvButton({ conv, activeId, onSelect, pinned }) {
  const isActive = activeId === conv.id;
  return (
    <button
      onClick={() => onSelect(conv.id)}
      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-2.5 group ${
        isActive
          ? 'bg-violet-50 text-[#6c48ff]'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {pinned && (
        <svg className="w-3.5 h-3.5 flex-shrink-0 text-violet-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
        </svg>
      )}
      <span className={`truncate text-[13px] font-medium flex-1 ${isActive ? 'text-[#6c48ff]' : ''}`}>
        {conv.title || 'Untitled Chat'}
      </span>
      {isActive && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#6c48ff] flex-shrink-0" />
      )}
    </button>
  );
}
