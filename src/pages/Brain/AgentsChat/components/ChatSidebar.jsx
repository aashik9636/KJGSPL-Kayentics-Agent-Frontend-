import React, { useState } from 'react';
import { useAuthStore } from '../../../../store/authStore';

const SearchIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

export default function ChatSidebar({ conversations, activeId, onSelect, onNewChat, loading, refreshConversations }) {
  const [search, setSearch] = useState('');
  const [showAllHistory, setShowAllHistory] = useState(false);

  const totalToShow = 5;
  const displayedConversations = showAllHistory ? conversations : conversations.slice(0, totalToShow);

  const HistoryItem = ({ conv }) => {
    const isActive = activeId === conv.id;
    return (
      <div 
        onClick={() => onSelect(conv.id)}
        className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-[10px] text-[13px] mb-[2px] cursor-pointer transition-colors ${
          isActive ? 'bg-[#EEEDFE] text-[#3730B8] font-semibold' : 'text-[#6D6D7C] hover:bg-[#F0F0F6] hover:text-[#14141D]'
        }`}
      >
        <span className="truncate flex-1 pr-2" style={{ fontFamily: '"Inter", sans-serif' }}>{conv.title || 'Untitled Chat'}</span>
        
        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#149452] flex-shrink-0"></span>}
        {!isActive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Delete this conversation?')) {
                import('../../../../services/chatService').then(({ chatService }) => {
                  chatService.deleteConversation(conv.id)
                    .then(() => {
                      if (refreshConversations) refreshConversations();
                      if (activeId === conv.id) onNewChat();
                    })
                    .catch(err => console.error(err));
                });
              }
            }}
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-0.5 rounded-md hover:bg-red-50"
            title="Delete chat"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-[272px] bg-white border-l border-[#E8E7F1] pt-[22px] pb-4 px-4 font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-[18px]">
        <h2 className="text-[14px] font-semibold m-0 text-gray-900 tracking-[0.01em]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Chat history</h2>
        <button 
          onClick={onNewChat}
          className="flex items-center gap-1.5 bg-gray-900 text-white border-none py-1.5 px-3 rounded-[8px] font-semibold text-[11.5px] cursor-pointer hover:bg-black transition-colors"
        >
          <span>＋</span> New
        </button>
      </div>

      {/* Search Box */}
      <div className="flex items-center gap-2 bg-[#F5F5FA] border border-[#E8E7F1] rounded-[10px] px-3 py-2 mb-4 text-[#9C9CA9] text-[12.5px]">
        <SearchIcon />
        <input 
          type="text" 
          placeholder="Search conversations…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none w-full text-gray-900 placeholder:text-[#9C9CA9]"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 mb-4">
        <div className="text-[11px] font-semibold px-2.5 py-1 rounded-md cursor-pointer bg-[#EEEDFE] text-[#3730B8]">All</div>
        <div className="text-[11px] font-semibold px-2.5 py-1 rounded-md cursor-pointer text-[#6D6D7C] hover:bg-gray-50">Pinned</div>
        <div className="text-[11px] font-semibold px-2.5 py-1 rounded-md cursor-pointer text-[#6D6D7C] hover:bg-gray-50">Shared</div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar group">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <div>
            <div className="text-[11px] font-bold text-gray-400 tracking-[0.05em] mt-4 mx-[4px] mb-2.5 uppercase font-sans">Recent</div>
            <div className="space-y-[2px]">
              {displayedConversations.map(c => <HistoryItem key={c.id} conv={c} />)}
            </div>
            
            {conversations.length > totalToShow && (
              <button 
                onClick={() => setShowAllHistory(!showAllHistory)}
                className="w-full text-center py-2.5 mt-3 text-[12px] font-semibold text-[#4F46E5] hover:bg-[#EEEDFE] rounded-[10px] transition-colors border border-transparent hover:border-[#4F46E5]/20"
              >
                {showAllHistory ? 'Show Less' : `View all ${conversations.length} chats`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
