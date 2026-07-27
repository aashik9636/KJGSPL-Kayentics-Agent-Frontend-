import React from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

const AGENTS = [
  { id: 'brain', name: 'Brain Agent', role: 'General-purpose assistant', img: '/brain_avatar.mp4', isVideo: true, bg: 'from-[#e0d4ff] to-[#f4f7fe]', comingSoon: false, objectPos: 'center 60%' },
  { id: 'content', name: 'Content Creator', role: 'Briefs and channel plans', img: '/agent 1.mp4', isVideo: true, bg: 'from-[#d4f7e0] to-[#f4f7fe]', comingSoon: true, objectPos: 'center 15%' },
  { id: 'social', name: 'Social Media', role: 'Social strategy and posts', img: '/agent2.mp4', isVideo: true, bg: 'from-[#fce0f4] to-[#f4f7fe]', comingSoon: true, objectPos: 'center 15%' },
  { id: 'recruiter', name: 'Recruiter', role: 'Sourcing and outreach', img: '/agent3.mp4', isVideo: true, bg: 'from-[#e0ebff] to-[#f4f7fe]', comingSoon: true, objectPos: 'center 15%' },
  { id: 'sales', name: 'Sales Rep', role: 'Lead generation', img: '/agent 1.mp4', isVideo: true, bg: 'from-[#ffe0e0] to-[#f4f7fe]', comingSoon: true, objectPos: 'center 15%' },
  { id: 'support', name: 'Customer Support', role: 'Ticketing and FAQs', img: '/customer_support_avatar.mp4', isVideo: true, bg: 'from-[#e0f4fc] to-[#f4f7fe]', comingSoon: true, objectPos: 'center 15%' },
  { id: 'analyst', name: 'Data Analyst', role: 'Reporting and insights', img: '/data_analyst_avatar.mp4', isVideo: true, bg: 'from-[#fff5e0] to-[#f4f7fe]', comingSoon: true, objectPos: 'center 15%' },
];

export default function AgentsDirectory() {
  const navigate = useNavigate();
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current.querySelectorAll('.agent-card'),
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' }
      );
    }
  }, []);

  const handleChat = (agent) => {
    if (agent.comingSoon) return;
    navigate('/chat', { state: { newChat: Date.now(), selectedAgent: agent.id } });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#f5f5fa] overflow-y-auto">
      <div className="max-w-[1200px] w-full mx-auto px-8 py-10" ref={containerRef}>
        
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight font-['Space_Grotesk'] mb-3">All Agents</h1>
          <p className="text-gray-500 text-[15px] max-w-lg mx-auto">
            Meet your dedicated AI workforce. Each agent is highly specialized to handle specific tasks for your business.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {AGENTS.map((agent) => {
            const isLocked = agent.comingSoon;
            return (
              <div 
                key={agent.id} 
                className={`agent-card group relative bg-white rounded-xl overflow-hidden border transition-all duration-300 flex flex-col ${
                  isLocked 
                    ? 'border-gray-200 opacity-90 shadow-sm' 
                    : 'border-[#E8E7F1] hover:border-[#6c48ff]/40 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(108,72,255,0.1)]'
                }`}
              >
                {/* Image Container with Gradient Background */}
                <div className={`h-52 w-full bg-gradient-to-b ${agent.bg} relative flex items-center justify-center overflow-hidden`}>
                  
                  {/* Badge */}
                  {isLocked ? (
                    <div className="absolute top-4 right-4 z-20 bg-[#6c48ff] text-white px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase shadow-md border border-purple-300">
                      Coming Soon
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 z-20 bg-white/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-700 shadow-sm border border-white/50">
                      v1.0
                    </div>
                  )}

                  {/* Subtle Lock Overlay for Coming Soon Agents */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] z-10 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-xl bg-white/85 shadow-lg flex items-center justify-center text-gray-700">
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
                        mixBlendMode: agent.id === 'brain' ? 'normal' : 'multiply'
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
                <div className="p-6 flex flex-col flex-1 bg-white relative z-10 -mt-4 rounded-t-lg">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-gray-900 font-['Space_Grotesk']">{agent.name}</h3>
                  </div>
                  <p className="text-[13px] text-gray-500 font-medium mb-6 flex-1 line-clamp-2">{agent.role}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        0
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        0
                      </div>
                    </div>

                    <button 
                      onClick={() => handleChat(agent)}
                      disabled={isLocked}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        isLocked 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none' 
                          : 'bg-gray-50 text-gray-400 hover:bg-[#6c48ff] hover:text-white shadow-sm'
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
      </div>
    </div>
  );
}
