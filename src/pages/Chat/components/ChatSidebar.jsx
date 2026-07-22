import React from 'react';

export default function ChatSidebar({ conversations, activeId, onSelect, onNewChat, loading }) {
  // Sort or group conversations if needed (e.g. pinned vs recent)
  const pinned = conversations.filter(c => c.pinned);
  const recent = conversations.filter(c => !c.pinned);

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-100">
        <button 
          onClick={onNewChat}
          className="w-full bg-[#6c48ff] border border-[#6c48ff] text-white py-3 rounded-[16px] font-bold hover:shadow-lg transition-all text-[14px] shadow-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {loading ? (
          <div className="flex justify-center p-4">
            <svg className="animate-spin h-6 w-6 text-[#6c48ff]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Pinned</h3>
                <div className="space-y-1">
                  {pinned.map(conv => (
                    <button 
                      key={conv.id}
                      onClick={() => onSelect(conv.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-[16px] transition-all text-[14px] truncate font-medium ${activeId === conv.id ? 'bg-[#f4f7fe] text-[#6c48ff] font-bold' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}
                    >
                      {conv.title || 'Untitled Chat'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Recent</h3>
              {recent.length === 0 ? (
                <p className="text-[13px] text-gray-400 px-2">No recent chats.</p>
              ) : (
                <div className="space-y-1">
                  {recent.map(conv => (
                    <button 
                      key={conv.id}
                      onClick={() => onSelect(conv.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-[16px] transition-all text-[14px] truncate font-medium ${activeId === conv.id ? 'bg-[#f4f7fe] text-[#6c48ff] font-bold' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}
                    >
                      {conv.title || 'Untitled Chat'}
                    </button>
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
