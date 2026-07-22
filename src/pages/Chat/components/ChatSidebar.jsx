import React, { useState } from 'react';
import { useAuthStore } from '../../../store/authStore';

// Icons
const SearchIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const ExploreIcon = () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const LibraryIcon = () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const FilesIcon = () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>;
const HistoryIcon = () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const CommandIcon = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V6a3 3 0 0 1 6 0v3m-6 0h6m-6 0v6m6-6v6m-6 0v3a3 3 0 0 0 6 0v-3m-6 0h6" /></svg>;

export default function ChatSidebar({ conversations, activeId, onSelect, onNewChat, loading, creatingSession }) {
  const { user, logout } = useAuthStore();
  const [search, setSearch] = useState('');

  // Group conversations logic (mock implementation for Today, Yesterday, 7 days based on data)
  // Since we don't have exact timestamps, we'll just slice them up for aesthetic matching.
  const today = conversations.slice(0, 3);
  const yesterday = conversations.slice(3, 5);
  const last7Days = conversations.slice(5);

  const NavItem = ({ icon: Icon, label, active }) => (
    <button className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all text-[14px] font-medium ${active ? 'bg-gray-100/80 text-gray-900' : 'text-gray-700 hover:bg-gray-100/50'}`}>
      <Icon />
      <span>{label}</span>
    </button>
  );

  const HistoryItem = ({ conv }) => (
    <button
      onClick={() => onSelect(conv.id)}
      className={`w-full text-left px-3 py-2 rounded-lg transition-all text-[13px] truncate ${
        activeId === conv.id ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {conv.title || 'Untitled Chat'}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-[#fdfdfd] pt-5 pb-4 px-4 font-sans border-r border-gray-100">

      {/* ── Header: Logo ── */}
      <div className="flex items-center justify-between px-1 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-300 to-purple-400 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-8m0 0H4m4 0h4m-4-8h8m-4 0v8" />
            </svg>
          </div>
          <span className="text-[17px] font-semibold text-gray-900 tracking-tight">Brain Agent</span>
        </div>
      </div>

      {/* ── New Chat Button ── */}
      <button
        onClick={onNewChat}
        disabled={creatingSession}
        className="w-full bg-[#111111] hover:bg-black text-white rounded-xl py-3 text-[14px] font-medium flex items-center justify-center gap-2 transition-all shadow-sm shadow-gray-900/10 mb-4"
      >
        {creatingSession ? (
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        )}
        New chat
      </button>

      {/* ── Search Bar ── */}
      <div className="relative mb-5 group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon />
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search"
          className="w-full bg-white border border-gray-200 text-gray-900 text-[13px] rounded-xl pl-9 pr-8 py-2.5 outline-none transition-all focus:border-gray-300 focus:shadow-[0_2px_10px_rgba(0,0,0,0.02)] placeholder-gray-400"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <div className="bg-gray-100 text-gray-400 rounded-md p-1">
            <CommandIcon />
          </div>
        </div>
      </div>

      {/* ── Main Navigation ── */}
      <div className="space-y-0.5 mb-6">
        <NavItem icon={ExploreIcon} label="Explore" />
        <NavItem icon={LibraryIcon} label="Library" />
        <NavItem icon={FilesIcon} label="Files" />
        <NavItem icon={HistoryIcon} label="History" active />
      </div>

      {/* ── History List ── */}
      <div className="flex-1 overflow-y-auto -mx-2 px-2 custom-scrollbar">
        {loading ? (
          <div className="space-y-2 pt-2 px-1">
            {[1,2,3,4].map(i => <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-[13px] text-gray-400 px-2 mt-4 text-center">No chats yet</p>
        ) : (
          <div className="space-y-6 pb-4">
            
            {today.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-gray-400 px-3 mb-1.5 uppercase tracking-wider">Today</p>
                <div className="space-y-0.5">
                  {today.map(c => <HistoryItem key={c.id} conv={c} />)}
                </div>
              </div>
            )}

            {yesterday.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-gray-400 px-3 mb-1.5 uppercase tracking-wider">Yesterday</p>
                <div className="space-y-0.5">
                  {yesterday.map(c => <HistoryItem key={c.id} conv={c} />)}
                </div>
              </div>
            )}

            {last7Days.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-gray-400 px-3 mb-1.5 uppercase tracking-wider">7 days</p>
                <div className="space-y-0.5">
                  {last7Days.map(c => <HistoryItem key={c.id} conv={c} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── User Profile Bottom Widget ── */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden flex-shrink-0">
            {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar"/> : (user?.name?.charAt(0) || 'U')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-900 truncate leading-tight">{user?.name || 'User'}</p>
            <p className="text-[12px] text-gray-500 truncate leading-tight">{user?.email}</p>
          </div>
          <button onClick={() => { logout(); window.location.href = '/login'; }} className="text-gray-400 hover:text-gray-900 transition-colors opacity-0 group-hover:opacity-100 p-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
}
