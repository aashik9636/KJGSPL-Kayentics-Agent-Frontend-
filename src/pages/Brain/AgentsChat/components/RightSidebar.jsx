import React, { useState } from 'react';
import { useAuthStore } from '../../../../store/authStore';
// Icons

// Icons
const SearchIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

const TabIcon = ({ isActive, onClick, label, isNew }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2.5 rounded-[12px] flex items-center justify-center transition-all group relative text-[12.5px] font-semibold tracking-wide w-full ${
      isNew 
        ? 'bg-gray-900 text-white hover:bg-black shadow-md'
        : isActive 
          ? 'bg-gradient-to-br from-[#4F46E5] to-[#7C6BFF] text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)]' 
          : 'bg-white/50 text-[#6D6D7C] hover:bg-[#F5F5FA] hover:text-[#14141D] shadow-sm border border-gray-100'
    }`}
    style={{ fontFamily: 'Inter' }}
  >
    {label}
  </button>
);

export default function RightSidebar({ 
  conversations, activeId, onSelect, onNewChat, loading, creatingSession, refreshConversations, 
  activeTab, setActiveTab, selectedAgent, setSelectedAgent
}) {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [showAllHistory, setShowAllHistory] = useState(false);

  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent('toggle-sidebar', { detail: { collapse: !!activeTab } }));
  }, [activeTab]);

  const totalToShow = 5;
  const displayedConversations = showAllHistory ? conversations : conversations.slice(0, totalToShow);

  const HistoryItem = ({ conv }) => {
    const isActive = activeId === conv.id;
    return (
    <div className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-[10px] text-[13px] mb-[2px] cursor-pointer transition-colors ${
      isActive 
        ? 'bg-[#EEEDFE] text-[#3730B8] font-semibold' 
        : 'text-[#6D6D7C] hover:bg-[#F0F0F6] hover:text-[#14141D]'
    }`}
    onClick={() => onSelect(conv.id)}
    >
      <span className="flex-1 text-left truncate pr-2" style={{ fontFamily: '"Inter", sans-serif' }}>
        {conv.title || 'Untitled Chat'}
      </span>
      {isActive ? (
        <span className="w-1.5 h-1.5 rounded-full bg-[#149452] flex-shrink-0"></span>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('Delete this conversation?')) {
              import('../../../../services/chatService').then(({ chatService }) => {
                chatService.deleteConversation(conv.id)
                  .then(() => {
                    if (typeof refreshConversations === 'function') refreshConversations();
                    if (activeId === conv.id) onNewChat();
                  })
                  .catch(err => console.error(err));
              });
            }
          }}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-0.5 rounded-md hover:bg-red-50 flex-shrink-0"
          title="Delete chat"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  )};

  return (
    <div className="flex h-full bg-white/40 backdrop-blur-3xl border-l border-white/50 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] font-sans">
      
      {/* Sliding Panel Content Area */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden flex flex-col h-full bg-white border-l border-[#E8E7F1] ${!activeTab ? 'w-0 opacity-0' : 'w-[272px] opacity-100'}`}>
        <div className="w-[272px] flex-shrink-0 flex flex-col h-full pt-[22px] pb-4 px-4">
          
          {/* HISTORY PANEL */}
          {activeTab === 'history' && (
            <>
              <div className="flex items-center justify-between mb-[18px]">
                <h2 className="text-[14px] font-semibold m-0 text-[#14141D] tracking-[0.01em]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Chat history</h2>
                <button onClick={() => setActiveTab(null)} className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="flex items-center gap-2 bg-[#F5F5FA] border border-[#E8E7F1] rounded-[10px] px-3 py-2 mb-4 text-[#9C9CA9] text-[12.5px]">
                <SearchIcon />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search conversations…"
                  className="bg-transparent border-none outline-none w-full text-[#14141D] placeholder:text-[#9C9CA9] font-sans"
                />
              </div>

              <div className="flex gap-1.5 mb-4">
                <div className="text-[11px] font-semibold px-2.5 py-1 rounded-md cursor-pointer bg-[#EEEDFE] text-[#3730B8]">All</div>
                <div className="text-[11px] font-semibold px-2.5 py-1 rounded-md cursor-pointer text-[#6D6D7C] hover:bg-[#F0F0F6]">Pinned</div>
                <div className="text-[11px] font-semibold px-2.5 py-1 rounded-md cursor-pointer text-[#6D6D7C] hover:bg-[#F0F0F6]">Shared</div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar group">
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />)}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 opacity-40">
                    <p className="text-[12px] font-medium text-center text-gray-500">No chats yet</p>
                  </div>
                ) : (
                  <div className="space-y-4 pb-4">
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
                  </div>
                )}
              </div>
            </>
          )}

          {/* AGENTS PANEL */}
          {activeTab === 'agents' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[14px] font-semibold m-0 text-[#14141D] tracking-[0.01em]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Agents</h2>
                <button onClick={() => setActiveTab(null)} className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="text-[12px] text-[#6D6D7C] mb-4 leading-relaxed font-sans">
                Each agent is tuned for a specific job. Select an agent to specialize this conversation.
              </p>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pb-4 pr-1">
                {[
                  { id: 'brain', image: '/premium_3d_brain.png', isVideo: false, name: 'Brain Agent', desc: 'General-purpose assistant' },
                  { id: 'content', image: '/agent 1.mp4', isVideo: true, name: 'Content Creator', desc: 'Briefs and channel plans' },
                  { id: 'social', image: '/agent2.mp4', isVideo: true, name: 'Social Media Agent', desc: 'Social strategy and posts' },
                  { id: 'recruiter', image: '/agent3.mp4', isVideo: true, name: 'Recruiter Agent', desc: 'Sourcing and outreach' },
                ].map((agent, i) => {
                  const isActive = selectedAgent === agent.id;
                  return (
                    <div 
                      key={agent.id} 
                      onClick={() => setSelectedAgent(agent.id)}
                      className={`group relative border rounded-[12px] p-3 cursor-pointer transition-all ${
                        isActive 
                          ? 'bg-[#EEEDFE] border-[#4F46E5]/40 shadow-sm' 
                          : 'bg-[#F5F5FA] border-[#E8E7F1] hover:shadow-sm hover:border-[#D7D5F6]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-[10px] overflow-hidden flex items-center justify-center shadow-sm flex-shrink-0 ${isActive ? 'bg-[#D7D5F6]' : 'bg-[#E8E7F1]'}`}>
                          {agent.isVideo ? (
                            <video src={agent.image} autoPlay loop muted playsInline className="w-[120%] h-[120%] object-cover object-top mix-blend-multiply" />
                          ) : (
                            <img src={agent.image} alt={agent.name} className="w-[120%] h-[120%] object-cover object-top mix-blend-multiply" />
                          )}
                        </div>
                        <div>
                          <h4 className={`font-semibold text-[13px] mb-0.5 ${isActive ? 'text-[#3730B8]' : 'text-[#14141D]'}`} style={{ fontFamily: '"Space Grotesk", sans-serif' }}>{agent.name}</h4>
                          <p className={`text-[11.5px] leading-snug font-sans m-0 ${isActive ? 'text-[#4F46E5]/80' : 'text-[#6D6D7C]'}`}>{agent.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* SETTINGS PANEL */}
          {activeTab === 'settings' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[14px] font-semibold m-0 text-[#14141D] tracking-[0.01em]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Settings</h2>
                <button onClick={() => setActiveTab(null)} className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pb-4 pr-1">
                <div className="bg-[#F5F5FA] border border-[#E8E7F1] rounded-[12px] p-4">
                  <div className="flex justify-between items-center mb-3 border-b border-[#E8E7F1] pb-3">
                    <div>
                      <b className="text-[12.5px] text-[#14141D] block mb-0.5 font-semibold">Web Research</b>
                      <span className="text-[11px] text-[#6D6D7C]">Allow live lookups</span>
                    </div>
                    <div className="w-8 h-4.5 bg-[#4F46E5] rounded-full relative cursor-pointer shadow-inner">
                      <div className="absolute right-[2px] top-[2px] w-3.5 h-3.5 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <b className="text-[12.5px] text-[#14141D] block mb-0.5 font-semibold">Auto-Save</b>
                      <span className="text-[11px] text-[#6D6D7C]">Keep history</span>
                    </div>
                    <div className="w-8 h-4.5 bg-gray-300 rounded-full relative cursor-pointer shadow-inner">
                      <div className="absolute left-[2px] top-[2px] w-3.5 h-3.5 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ── Vertical Nav Bar (Right Edge) ── */}
      <div className="w-[100px] flex-shrink-0 flex flex-col justify-center items-center py-6 px-3 gap-3 z-20 bg-white border-l border-[#E8E7F1]">
        
        <TabIcon 
          label="+ New"
          isNew={true}
          onClick={() => {
            onNewChat();
            setActiveTab(null);
          }} 
        />

        <div className="w-10 h-px bg-[#F0F0F6] my-1"></div>

        <TabIcon 
          label="History"
          isActive={activeTab === 'history'} 
          onClick={() => setActiveTab(activeTab === 'history' ? null : 'history')} 
        />
        <TabIcon 
          label="Agents"
          isActive={activeTab === 'agents'} 
          onClick={() => setActiveTab(activeTab === 'agents' ? null : 'agents')} 
        />
        <TabIcon 
          label="Settings"
          isActive={activeTab === 'settings'} 
          onClick={() => setActiveTab(activeTab === 'settings' ? null : 'settings')} 
        />

      </div>
    </div>
  );
}
