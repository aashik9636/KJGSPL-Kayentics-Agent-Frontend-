import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { agentService } from '../../services/agentService';

const DEFAULT_SLUG_AVATARS = {
  'brain': '/brain_avatar.mp4',
  'stock-market': '/stock_market_avatar.mp4',
  'research': '/research_avatar.mp4',
  'market': '/market_avatar.mp4',
  'lead-generation': '/lead_gen_avatar.mp4',
  'recruitment': '/recruitment_avatar.mp4',
  'social-trends': '/social_trends_avatar.mp4',
  'content-writer': '/research_avatar.mp4',
  'image-query': '/market_avatar.mp4',
  'image-generation': '/market_avatar.mp4',
  'campaign-planner': '/research_avatar.mp4',
  'post-scheduler': '/stock_market_avatar.mp4',
};

function getAgentAvatarBySlug(slug) {
  const s = (slug || '').toLowerCase().trim();
  if (DEFAULT_SLUG_AVATARS[s]) {
    return DEFAULT_SLUG_AVATARS[s];
  }
  if (s.includes('stock') || s.includes('finance')) return '/MARC.mp4';
  if (s.includes('research') || s.includes('writer') || s.includes('campaign')) return '/REA.mp4';
  if (s.includes('market') || s.includes('intelligence')) return '/MIA.mp4';
  if (s.includes('lead')) return '/LEA.mp4';
  if (s.includes('recruit')) return '/JOEY.mp4';
  if (s.includes('social') || s.includes('trend')) return '/BUZZ.mp4';
  if (s.includes('image')) return '/PIXA.mp4';
  return '/Brain.mp4';
}

const STATIC_FALLBACK_AGENTS = [
  { id: 'brain', name: 'Brain Agent', agent_name: 'BRAIN', role: 'Orchestrator', description: 'Meta-orchestrator and multi-agent planner for complex reasoning and workflow routing.', img: '/Brain.mp4', isVideo: true, bg: 'from-[#e0d4ff] to-[#f4f7fe]', comingSoon: false, objectPos: 'center 60%' },
  { id: 'stock-market', name: 'Stock Market Agent', agent_name: 'MARC', role: 'Specialized Agent', description: 'Stock market research and analysis sub-agent.', img: '/MARC.mp4', isVideo: true, bg: 'from-[#e0ebff] to-[#f4f7fe]', comingSoon: false, objectPos: 'center 15%' },
  { id: 'research', name: 'Research Agent', agent_name: 'REA', role: 'Specialized Agent', description: 'General-purpose research sub-agent.', img: '/REA.mp4', isVideo: true, bg: 'from-[#d4f7e0] to-[#f4f7fe]', comingSoon: false, objectPos: 'center 15%' },
  { id: 'market', name: 'Market Agent', agent_name: 'MIA', role: 'Specialized Agent', description: 'Market intelligence and competitor research sub-agent.', img: '/MIA.mp4', isVideo: true, bg: 'from-[#fce0f4] to-[#f4f7fe]', comingSoon: false, objectPos: 'center 15%' },
  { id: 'lead-generation', name: 'Lead Generation Agent', agent_name: 'LEA', role: 'Specialized Agent', description: 'Prospect and lead-list research sub-agent.', img: '/LEA.mp4', isVideo: true, bg: 'from-[#ffe0e0] to-[#f4f7fe]', comingSoon: false, objectPos: 'center 15%' },
  { id: 'recruitment', name: 'Recruitment Agent', agent_name: 'JOEY', role: 'Specialized Agent', description: 'Candidate sourcing and recruitment research sub-agent.', img: '/JOEY.mp4', isVideo: true, bg: 'from-[#e0ebff] to-[#f4f7fe]', comingSoon: false, objectPos: 'center 15%' },
  { id: 'social-trends', name: 'Trend Intelligence Agent', agent_name: 'BUZZ', role: 'Specialized Agent', description: 'Discovers active market trends, search volume, Google/web trends, and industry insights for a given topic or keyword.', img: '/BUZZ.mp4', isVideo: true, bg: 'from-[#e0f4fc] to-[#f4f7fe]', comingSoon: false, objectPos: 'center 15%' },
  { id: 'trends', name: 'Trend Intelligence Agent', agent_name: 'BUZZ', role: 'Specialized Agent', description: 'Discovers active market trends, search volume, Google/web trends, and industry insights for a given topic or keyword.', img: '/BUZZ.mp4', isVideo: true, bg: 'from-[#e0f4fc] to-[#f4f7fe]', comingSoon: false, objectPos: 'center 15%' },
  { id: 'image-query', name: 'Image Query Agent', agent_name: 'PIXA', role: 'Specialized Agent', description: 'Generates an image from a free-form natural language query, tracked by session_id.', img: '/PIXA.mp4', isVideo: true, bg: 'from-[#fce0f4] to-[#f4f7fe]', comingSoon: false, objectPos: 'center 15%' },
  { id: 'social-media-agent', name: 'Social Media Orchestrator Agent', agent_name: 'NOVA', role: 'Orchestrator', description: 'Routes a request across the full social media agent pipeline.', img: '/NOVA.mp4', isVideo: true, bg: 'from-[#e0d4ff] to-[#f4f7fe]', comingSoon: false, objectPos: 'center 60%' },
  { id: 'content-writer', name: 'Content Writer Agent', agent_name: 'QUILL', role: 'Specialized Agent', description: 'AI content creation & copywriting', img: '/REA.mp4', isVideo: true, bg: 'from-[#d4f7e0] to-[#f4f7fe]', comingSoon: false, objectPos: 'center 15%' },
  { id: 'image-generation', name: 'Image Generation Agent', agent_name: 'ART', role: 'Specialized Agent', description: 'Direct AI visual generation & brand asset design', img: '/PIXA.mp4', isVideo: true, bg: 'from-[#ffe0e0] to-[#f4f7fe]', comingSoon: false, objectPos: 'center 15%' },
  { id: 'campaign-planner', name: 'Campaign Planner Agent', agent_name: 'STRAT', role: 'Specialized Agent', description: 'Multi-channel marketing campaign strategy', img: '/REA.mp4', isVideo: true, bg: 'from-[#d4f7e0] to-[#f4f7fe]', comingSoon: false, objectPos: 'center 15%' },
  { id: 'post-scheduler', name: 'Post Scheduler Agent', agent_name: 'CHRONO', role: 'Specialized Agent', description: 'Social media calendar & posting automation', img: '/MARC.mp4', isVideo: true, bg: 'from-[#e0ebff] to-[#f4f7fe]', comingSoon: false, objectPos: 'center 15%' },
];

export default function AgentsDirectory() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    agentService.getAgents()
      .then((res) => {
        const dataList = Array.isArray(res) ? res : res?.data;
        if (isMounted) {
          if (Array.isArray(dataList) && dataList.length > 0) {
            const mapped = dataList
              .filter(item => item.is_active !== false)
              .map((item) => {
                const slug = item.slug || item.id;
                const fallbackItem = STATIC_FALLBACK_AGENTS.find(s => s.id === slug) || {};
                
                const agentName = item.agent_name || fallbackItem.agent_name || '';
                let imgUrl = '/Brain.mp4';
                if (agentName) {
                  if (agentName.toUpperCase() === 'BRAIN') {
                    imgUrl = '/Brain.mp4';
                  } else if (agentName.toUpperCase() === 'PIXA') {
                    imgUrl = '/PIXA.mp4#t=3';
                  } else {
                    imgUrl = `/${agentName.toUpperCase()}.mp4`;
                  }
                } else {
                  imgUrl = getAgentAvatarBySlug(slug);
                }

                return {
                  id: slug,
                  name: item.name || fallbackItem.name || slug,
                  agent_name: agentName,
                  description: item.description || fallbackItem.description || '',
                  role: item.role || item.description || fallbackItem.role || '',
                  img: imgUrl,
                  isVideo: imgUrl.includes('.mp4'),
                  bg: fallbackItem.bg || 'from-[#e0ebff] to-[#f4f7fe]',
                  comingSoon: item.is_coming_soon ?? false,
                  objectPos: fallbackItem.objectPos || (slug === 'brain' ? 'center 60%' : 'center 15%'),
                };
              });

            if (mapped.length > 0) {
              setAgents(mapped);
            } else {
              setError("No agents found.");
            }
          } else {
            setError("No agents available at the moment.");
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch DB agents:', err);
        if (isMounted) {
          setError("Failed to load agents. Please check your connection and try again.");
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo(containerRef.current.querySelectorAll('.agent-card'),
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' }
      );
    }
  }, [loading, agents]);

  const handleChat = (agent) => {
    if (agent.comingSoon) return;
    
    // Intercept custom agent workflows
    if (agent.slug === 'sales-outreach' || agent.id === 'sales_outreach') {
      navigate('/agents/sales-outreach');
      return;
    }
    
    navigate('/chat', { state: { newChat: Date.now(), selectedAgent: agent.id } });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#f5f5fa] dark:bg-[#000000] overflow-y-auto">
      <div className="max-w-[1200px] w-full mx-auto px-8 py-10" ref={containerRef}>
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight mb-2" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>AI Agents Directory</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-[15px] max-w-lg mx-auto" style={{ fontFamily: '"Inter", sans-serif' }}>
            Meet your dedicated AI workforce. Each agent is highly specialized to handle specific tasks for your business.
          </p>
        </div>

        {/* Grid / Skeleton Loader / Error */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-[#111111] rounded-[24px] border border-neutral-200 dark:border-[#333333] shadow-sm">
            <svg className="w-12 h-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Oops! Something went wrong.</h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-[14.5px]" style={{ fontFamily: '"Inter", sans-serif' }}>{error}</p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white dark:bg-[#111111] rounded-xl overflow-hidden border border-neutral-200 dark:border-[#262626] shadow-sm animate-pulse flex flex-col h-[340px]">
                <div className="h-52 w-full bg-neutral-200/70 dark:bg-neutral-800/60" />
                <div className="p-6 flex flex-col flex-1 bg-white dark:bg-[#111111] space-y-3">
                  <div className="h-5 bg-neutral-200/80 dark:bg-neutral-800/80 rounded w-3/4" />
                  <div className="h-3.5 bg-neutral-200/60 dark:bg-neutral-800/60 rounded w-full" />
                  <div className="h-3.5 bg-neutral-200/60 dark:bg-neutral-800/60 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((agent) => {
              const isLocked = agent.comingSoon;
              return (
                <div 
                key={agent.id}
                className="agent-card group bg-white dark:bg-[#111111] rounded-[24px] overflow-hidden border border-neutral-200 dark:border-[#333333] shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:border-indigo-500/30 transition-all duration-500 flex flex-col h-[380px] relative cursor-pointer"
                onClick={() => handleChat(agent)}
              >
                  {/* Image Container with Gradient Background */}
                  <div className={`h-48 shrink-0 w-full bg-gradient-to-b ${agent.bg} relative flex items-center justify-center overflow-hidden`}>

                    {/* Badge */}
                    {isLocked && (
                      <div className="absolute top-4 right-4 z-20 bg-[#1a1a1a] text-white px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase shadow-md border border-purple-300">
                        Coming Soon
                      </div>
                    )}

                    {/* Subtle Lock Overlay for Coming Soon Agents */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-neutral-900/10 backdrop-blur-[1px] z-10 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-xl bg-white/85 shadow-lg flex items-center justify-center text-neutral-700">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {agent.isVideo ? (
                      <video
                        src={agent.img}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className={`w-full h-full object-cover transition-transform duration-500 ${isLocked ? '' : 'group-hover:scale-105'}`}
                        style={{
                          objectPosition: agent.objectPos || 'center 15%',
                          mixBlendMode: agent.id === 'brain' ? 'normal' : 'multiply',
                          filter: (agent.img?.includes('stock_market') || agent.img?.includes('data_analyst')) ? 'contrast(1.15) brightness(1.06)' : 'none'
                        }}
                      />
                    ) : (
                      <img
                        src={agent.img}
                        alt={agent.name}
                        className={`w-full h-full object-cover transition-transform duration-500 ${isLocked ? '' : 'group-hover:scale-105'}`}
                        style={{ objectPosition: 'center 15%', mixBlendMode: 'multiply' }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1 bg-white dark:bg-gradient-to-b dark:from-[#1a1a1a] dark:to-[#111111] border-t-[2px] border-transparent dark:border-[#4F46E5] shadow-[0_-8px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_-12px_30px_rgba(79,70,229,0.25)] relative z-10 -mt-6 rounded-t-[24px]">
                    <div className="flex items-start justify-between mb-3 min-h-[56px]">
                      <h3 className="text-[17px] leading-tight font-bold text-neutral-900 dark:text-white font-['Space_Grotesk'] flex flex-col items-start gap-1.5 pr-2">
                        <span className="uppercase">{agent.agent_name || agent.name}</span>
                        {agent.agent_name && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 tracking-wider mt-0.5">
                            {agent.name}
                          </span>
                        )}
                      </h3>
                    </div>
                    
                    <div className="min-h-[40px] mb-6 flex-1">
                      <p className="text-[12.5px] leading-relaxed text-neutral-500 dark:text-neutral-400 font-medium line-clamp-2 pr-2">
                        {agent.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-end mt-auto">
                      <button
                        onClick={() => handleChat(agent)}
                        disabled={isLocked}
                        className={`w-10 h-10 rounded-[14px] flex items-center justify-center transition-all ${isLocked
                            ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed pointer-events-none'
                            : 'bg-neutral-50 dark:bg-white text-neutral-600 dark:text-black hover:scale-105 hover:bg-[#1a1a1a] hover:text-white dark:hover:bg-neutral-200 shadow-sm'
                          }`}
                        title={isLocked ? "Coming Soon" : "Chat with Agent"}
                      >
                        {isLocked ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
