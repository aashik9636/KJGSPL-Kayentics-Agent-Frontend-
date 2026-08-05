import React, { useState } from 'react';
import { useAuthStore } from '../../../../store/authStore';

const SearchIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

function groupSessionsByDate(sessions) {
  const groups = {
    Today: [],
    Yesterday: [],
    'Previous 7 Days': [],
    'Previous 30 Days': [],
    Older: {},
  };

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  sessions.forEach((session) => {
    // Attempt to use updated_at, created_at, or a fallback date
    const date = new Date(session.updated_at || session.created_at || Date.now());
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    const diffTime = now.getTime() - dateOnly.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      groups['Today'].push(session);
    } else if (diffDays === 1) {
      groups['Yesterday'].push(session);
    } else if (diffDays <= 7 && diffDays > 1) {
      groups['Previous 7 Days'].push(session);
    } else if (diffDays <= 30 && diffDays > 7) {
      groups['Previous 30 Days'].push(session);
    } else {
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      if (!groups.Older[monthYear]) {
        groups.Older[monthYear] = [];
      }
      groups.Older[monthYear].push(session);
    }
  });

  return groups;
}

export default function ChatSidebar({ conversations, activeId, onSelect, onNewChat, loading, refreshConversations }) {
  const [search, setSearch] = useState('');

  // 1. Filter by Search Query
  const filteredConversations = conversations.filter((s) =>
    (s.title || 'New Chat').toLowerCase().includes(search.toLowerCase())
  );

  // 2. Group sessions
  const grouped = groupSessionsByDate(filteredConversations);

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
            className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-opacity p-0.5 rounded-md hover:bg-red-50"
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

  const renderCategoryGroup = (title, items) => {
    if (!items || items.length === 0) return null;
    return (
      <div key={title} className="mb-4">
        <div className="text-[11px] font-bold text-neutral-400 tracking-[0.05em] mx-[4px] mb-2.5 uppercase font-sans">
          {title}
        </div>
        <div className="space-y-[2px]">
          {items.map(c => <HistoryItem key={c.id} conv={c} />)}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-[272px] bg-white border-l border-[#E8E7F1] pt-[22px] pb-4 px-4 font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-[18px]">
        <h2 className="text-[14px] font-semibold m-0 text-neutral-900 tracking-[0.01em]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Chat history</h2>
        <button 
          onClick={onNewChat}
          className="flex items-center gap-1.5 bg-neutral-900 text-white border-none py-1.5 px-3 rounded-[8px] font-semibold text-[11.5px] cursor-pointer hover:bg-black transition-colors"
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
          className="bg-transparent border-none outline-none w-full text-neutral-900 placeholder:text-[#9C9CA9]"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 mb-4">
        <div className="text-[11px] font-semibold px-2.5 py-1 rounded-md cursor-pointer bg-[#EEEDFE] text-[#3730B8]">All</div>
        <div className="text-[11px] font-semibold px-2.5 py-1 rounded-md cursor-pointer text-[#6D6D7C] hover:bg-neutral-50">Pinned</div>
        <div className="text-[11px] font-semibold px-2.5 py-1 rounded-md cursor-pointer text-[#6D6D7C] hover:bg-neutral-50">Shared</div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar group mt-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-8 bg-neutral-100 rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <div>
            {renderCategoryGroup('Today', grouped['Today'])}
            {renderCategoryGroup('Yesterday', grouped['Yesterday'])}
            {renderCategoryGroup('Previous 7 Days', grouped['Previous 7 Days'])}
            {renderCategoryGroup('Previous 30 Days', grouped['Previous 30 Days'])}
            {Object.entries(grouped.Older).map(([month, monthItems]) => 
              renderCategoryGroup(month, monthItems)
            )}
            
            {filteredConversations.length === 0 && (
              <div className="text-center text-[12px] text-[#9C9CA9] mt-8">
                No conversations found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

