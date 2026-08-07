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
        ? 'bg-neutral-900 text-white hover:bg-black dark:bg-neutral-600 dark:hover:bg-neutral-700 shadow-md'
        : isActive 
          ? 'bg-gradient-to-br from-[#4F46E5] to-[#7C6BFF] text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)]' 
          : 'bg-white/50 dark:bg-[#171717] text-[#6D6D7C] dark:text-neutral-300 hover:bg-[#F5F5FA] dark:hover:bg-[#282d42] hover:text-[#14141D] dark:hover:text-white shadow-sm border border-neutral-100 dark:border-[#2a2f44]'
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
  const [apiAgents, setApiAgents] = useState([]);

  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent('toggle-sidebar', { detail: { collapse: !!activeTab } }));
  }, [activeTab]);

  React.useEffect(() => {
    import('../../../../services/agentService').then(({ agentService }) => {
      agentService.getAgents().then(res => {
        const list = Array.isArray(res) ? res : res?.data;
        if (Array.isArray(list) && list.length > 0) {
          const defaultMetas = {
            'brain': { image: '/Brain.mp4', isVideo: true, name: 'Brain Agent', agent_name: 'BRAIN', desc: 'Meta-orchestrator & multi-agent planner' },
            'stock-market': { image: '/MARC.mp4', isVideo: true, name: 'Stock Market Agent', agent_name: 'MARC', desc: 'Real-time financial & market data' },
            'research': { image: '/REA.mp4', isVideo: true, name: 'Universal Research Agent', agent_name: 'REA', desc: 'Deep web research & scraping' },
            'market': { image: '/MIA.mp4', isVideo: true, name: 'Competitor Intelligence Agent', agent_name: 'MIA', desc: 'Market & competitor analysis' },
            'lead-generation': { image: '/LEA.mp4', isVideo: true, name: 'Lead Generation Agent', agent_name: 'LEA', desc: 'B2B lead discovery & prospecting' },
            'recruitment': { image: '/JOEY.mp4', isVideo: true, name: 'Recruitment Agent', agent_name: 'JOEY', desc: 'Talent sourcing and outreach' },
            'social-trends': { image: '/BUZZ.mp4', isVideo: true, name: 'Social Trends Agent', agent_name: 'BUZZ', desc: 'Social media trend discovery' },
            'trends': { image: '/BUZZ.mp4', isVideo: true, name: 'Trend Intelligence Agent', agent_name: 'BUZZ', desc: 'Discovers active market trends, search volume, Google/web trends, and industry insights for a given topic or keyword.' },
            'content-writer': { image: '/REA.mp4', isVideo: true, name: 'Content Writer Agent', agent_name: 'QUILL', desc: 'AI content creation & copywriting' },
            'image-query': { image: '/PIXA.mp4', isVideo: true, name: 'Conversational Image Query', agent_name: 'PIXA', desc: 'Interactive visual generation via prompt stream' },
            'social-media-agent': { image: '/NOVA.mp4', isVideo: true, name: 'Social Media Orchestrator Agent', agent_name: 'NOVA', desc: 'Routes a request across the full social media agent pipeline.' },
            'image-generation': { image: '/PIXA.mp4', isVideo: true, name: 'Image Generation Agent', agent_name: 'ART', desc: 'AI visual generation & brand asset design' },
            'campaign-planner': { image: '/REA.mp4', isVideo: true, name: 'Campaign Planner Agent', agent_name: 'STRAT', desc: 'Multi-channel marketing campaign strategy' },
            'post-scheduler': { image: '/MARC.mp4', isVideo: true, name: 'Post Scheduler Agent', agent_name: 'CHRONO', desc: 'Social media calendar & posting automation' },
          };

          const getAvatar = (s, agentName) => {
            if (agentName) {
               if (agentName.toUpperCase() === 'BRAIN') return '/Brain.mp4';
               if (agentName.toUpperCase() === 'PIXA') return '/PIXA.mp4#t=3';
               return `/${agentName.toUpperCase()}.mp4`;
            }
            const slug = (s || '').toLowerCase();
            if (defaultMetas[slug]?.image) return defaultMetas[slug].image;
            return '/Brain.mp4';
          };

          const mapped = list
            .filter(item => item.is_active !== false)
            .map(item => {
              const slug = item.slug || item.id;
              const meta = defaultMetas[slug] || {};
              const agentName = item.agent_name || meta.agent_name || '';
              return {
                id: slug,
                name: item.name || meta.name || slug,
                agent_name: agentName,
                desc: item.description || meta.desc || '',
                image: getAvatar(slug, agentName),
                isVideo: true,
                comingSoon: item.is_coming_soon ?? false
              };
            });
          setApiAgents(mapped);
        }
      }).catch(err => console.warn('Sidebar dynamic agents fetch error:', err));
    });
  }, []);

  const totalToShow = 5;
  const displayedConversations = showAllHistory ? conversations : conversations.slice(0, totalToShow);

  const HistoryItem = ({ conv }) => {
    const isActive = activeId === conv.id;
    return (
    <div className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-[10px] text-[13px] mb-[2px] cursor-pointer transition-colors ${
      isActive 
        ? 'bg-[#EEEDFE] dark:bg-[#222144] text-[#3730B8] dark:text-[#a59ef0] font-semibold' 
        : 'text-[#6D6D7C] dark:text-neutral-300 hover:bg-[#F0F0F6] dark:hover:bg-[#1b1e2c] hover:text-[#14141D] dark:hover:text-white'
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
          className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-opacity p-0.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 flex-shrink-0"
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
    <div className="flex h-full bg-white/40 dark:bg-transparent backdrop-blur-3xl border-l border-white/50 dark:border-white/10 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] font-sans">
      
      {/* Sliding Panel Content Area */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden flex flex-col h-full bg-white dark:bg-[#111111] border-l border-[#E8E7F1] dark:border-[#262626] ${!activeTab ? 'w-0 opacity-0' : 'w-[272px] opacity-100'}`}>
        <div className="w-[272px] flex-shrink-0 flex flex-col h-full pt-[22px] pb-4 px-4">
          
          {/* HISTORY PANEL */}
          {activeTab === 'history' && (
            <>
              <div className="flex items-center justify-between mb-[18px]">
                <h2 className="text-[14px] font-semibold m-0 text-[#14141D] dark:text-white tracking-[0.01em]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Chat history</h2>
                <button onClick={() => setActiveTab(null)} className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="flex items-center gap-2 bg-[#F5F5FA] dark:bg-[#171717] border border-[#E8E7F1] dark:border-[#2b3044] rounded-[10px] px-3 py-2 mb-4 text-[#9C9CA9] text-[12.5px]">
                <SearchIcon />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search conversations…"
                  className="bg-transparent border-none outline-none w-full text-[#14141D] dark:text-white placeholder:text-[#9C9CA9] font-sans"
                />
              </div>

              <div className="flex gap-1.5 mb-4 border-b border-[#E8E7F1] dark:border-[#2b3044] pb-3">
                <div className="text-[11px] font-semibold px-3 py-1.5 rounded-full cursor-pointer bg-[#14141D] text-white dark:bg-white dark:text-black shadow-sm transition-all">All</div>
                <div className="text-[11px] font-semibold px-3 py-1.5 rounded-full cursor-pointer text-[#6D6D7C] dark:text-neutral-400 hover:bg-[#F0F0F6] dark:hover:bg-[#1a1a1a] hover:text-[#14141D] dark:hover:text-white transition-all">Pinned</div>
                <div className="text-[11px] font-semibold px-3 py-1.5 rounded-full cursor-pointer text-[#6D6D7C] dark:text-neutral-400 hover:bg-[#F0F0F6] dark:hover:bg-[#1a1a1a] hover:text-[#14141D] dark:hover:text-white transition-all">Shared</div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar group">
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-8 bg-neutral-100 rounded-lg animate-pulse" />)}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 opacity-40">
                    <p className="text-[12px] font-medium text-center text-neutral-500">No chats yet</p>
                  </div>
                ) : (
                  <div className="space-y-4 pb-4">
                    <div>
                      {(() => {
                        const categories = {
                          'Today': [],
                          'Yesterday': [],
                          'Previous 7 Days': [],
                          'Older': []
                        };

                        const now = new Date();
                        const todayDate = now.getDate();
                        const todayMonth = now.getMonth();
                        const todayYear = now.getFullYear();

                        displayedConversations.forEach(c => {
                          const dStr = c.updatedAt || c.updated_at || c.createdAt || c.created_at;
                          const d = dStr ? new Date(dStr) : new Date();
                          const chatDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                          const today = new Date(todayYear, todayMonth, todayDate);
                          const diffTime = today - chatDate;
                          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                          if (diffDays === 0) categories['Today'].push(c);
                          else if (diffDays === 1) categories['Yesterday'].push(c);
                          else if (diffDays > 1 && diffDays <= 7) categories['Previous 7 Days'].push(c);
                          else categories['Older'].push(c);
                        });

                        return Object.keys(categories).map(cat => {
                          if (categories[cat].length === 0) return null;
                          return (
                            <div key={cat} className="mb-4">
                              <div className="text-[10px] font-bold text-[#9C9CA9] dark:text-neutral-500 tracking-[0.06em] mt-1 mx-[4px] mb-2 uppercase font-sans">
                                {cat}
                              </div>
                              <div className="space-y-[2px]">
                                {categories[cat].map(c => <HistoryItem key={c.id} conv={c} />)}
                              </div>
                            </div>
                          );
                        });
                      })()}
                      
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
                <h2 className="text-[14px] font-semibold m-0 text-[#14141D] dark:text-white tracking-[0.01em]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Agents</h2>
                <button onClick={() => setActiveTab(null)} className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="text-[12px] text-[#6D6D7C] dark:text-neutral-400 mb-4 leading-relaxed font-sans">
                Each agent is tuned for a specific job. Select an agent to specialize this conversation.
              </p>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pb-4 pr-1">
                {(apiAgents.length > 0 ? apiAgents : [
                  { id: 'brain', image: '/brain_avatar.mp4', isVideo: true, name: 'Brain Agent', desc: 'Meta-orchestrator & multi-agent planner', comingSoon: false },
                  { id: 'stock-market', image: '/stock_market_avatar.mp4', isVideo: true, name: 'Stock Market Agent', desc: 'Real-time financial & market data', comingSoon: false },
                  { id: 'research', image: '/research_avatar.mp4', isVideo: true, name: 'Universal Research Agent', desc: 'Deep web research & scraping', comingSoon: false },
                  { id: 'market', image: '/market_avatar.mp4', isVideo: true, name: 'Competitor Intelligence Agent', desc: 'Market & competitor analysis', comingSoon: false },
                  { id: 'lead-generation', image: '/lead_gen_avatar.mp4', isVideo: true, name: 'Lead Generation Agent', desc: 'B2B lead discovery & prospecting', comingSoon: false },
                  { id: 'recruitment', image: '/recruitment_avatar.mp4', isVideo: true, name: 'Recruitment Agent', desc: 'Talent sourcing and outreach', comingSoon: false },
                  { id: 'social-trends', image: '/social_trends_avatar.mp4', isVideo: true, name: 'Social Trends Agent', desc: 'Social media trend discovery', comingSoon: false },
                  { id: 'content-writer', image: '/research_avatar.mp4', isVideo: true, name: 'Content Writer Agent', desc: 'AI content creation & copywriting', comingSoon: false },
                  { id: 'image-query', image: '/market_avatar.mp4', isVideo: true, name: 'Conversational Image Query', desc: 'Interactive visual generation via prompt stream', comingSoon: false },
                  { id: 'image-generation', image: '/market_avatar.mp4', isVideo: true, name: 'Image Generation Agent', desc: 'AI visual generation & brand asset design', comingSoon: false },
                  { id: 'campaign-planner', image: '/research_avatar.mp4', isVideo: true, name: 'Campaign Planner Agent', desc: 'Multi-channel marketing campaign strategy', comingSoon: false },
                  { id: 'post-scheduler', image: '/stock_market_avatar.mp4', isVideo: true, name: 'Post Scheduler Agent', desc: 'Social media calendar & posting automation', comingSoon: false },
                ]).map((agent) => {
                  const isActive = selectedAgent === agent.id;
                  const isLocked = agent.comingSoon;
                  return (
                    <div 
                      key={agent.id} 
                      onClick={() => !isLocked && setSelectedAgent(agent.id)}
                      className={`group relative border rounded-lg p-3 transition-all ${
                        isLocked 
                          ? 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 opacity-75 cursor-not-allowed pointer-events-none'
                          : isActive 
                            ? 'bg-[#EEEDFE] dark:bg-[#222144] border-[#4F46E5]/40 dark:border-[#4F46E5]/50 shadow-sm cursor-pointer' 
                            : 'bg-[#F5F5FA] dark:bg-[#1a1a1a] border-[#E8E7F1] dark:border-[#333333] hover:shadow-sm hover:border-[#D7D5F6] dark:hover:border-neutral-500 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-md overflow-hidden flex items-center justify-center shadow-sm flex-shrink-0 ${isActive ? 'bg-[#D7D5F6] dark:bg-[#2f2c69]' : 'bg-[#E8E7F1] dark:bg-[#262626]'}`}>
                          {agent.isVideo ? (
                            <video 
                              src={agent.image} 
                              autoPlay 
                              loop 
                              muted 
                              playsInline 
                              className="w-full h-full object-cover" 
                              style={{
                                objectPosition: agent.id === 'brain' ? 'center 60%' : 'center 15%',
                                filter: (agent.image?.includes('stock_market') || agent.image?.includes('data_analyst')) ? 'contrast(1.15) brightness(1.06)' : 'none'
                              }}
                            />
                          ) : (
                            <img src={agent.image} alt={agent.name} className="w-[120%] h-[120%] object-cover object-top" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-semibold text-[13px] mb-0.5 flex items-center ${isActive ? 'text-[#3730B8] dark:text-[#a59ef0]' : 'text-[#14141D] dark:text-white'}`} style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                              {agent.agent_name || agent.name}
                            </h4>
                            {isLocked && (
                              <span className="text-[9px] font-extrabold bg-[#1a1a1a] dark:bg-neutral-700 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">Soon</span>
                            )}
                          </div>
                          <p className={`text-[11.5px] leading-snug font-sans m-0 line-clamp-2 ${isActive ? 'text-[#4F46E5]/80 dark:text-[#8881ea]' : 'text-[#6D6D7C] dark:text-neutral-400'}`}>{agent.desc}</p>
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
                <button onClick={() => setActiveTab(null)} className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
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
                    <div className="w-8 h-4.5 bg-neutral-300 rounded-full relative cursor-pointer shadow-inner">
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
      <div className="w-[100px] flex-shrink-0 flex flex-col justify-center items-center py-6 px-3 gap-3 z-20 bg-white dark:bg-[#111111] border-l border-[#E8E7F1] dark:border-[#262626]">
        
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
