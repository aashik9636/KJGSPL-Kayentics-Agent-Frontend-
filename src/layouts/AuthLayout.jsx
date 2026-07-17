import React, { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import gsap from 'gsap';

export default function AuthLayout() {
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    // Left panel slide in and fade
    tl.fromTo(leftPanelRef.current,
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo('.stagger-left-item',
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' },
      "-=0.4"
    )
    // Right panel form fade in
    .fromTo(rightPanelRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      "-=0.6"
    );
  }, []);

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
      
      {/* Left Side: Blue Brand Panel */}
      <div 
        ref={leftPanelRef}
        className="hidden lg:flex lg:w-1/2 bg-[#1967d2] flex-col justify-center px-16 xl:px-24 py-12 relative"
      >
        {/* Subtle background pattern or gradient can go here if needed */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 pointer-events-none"></div>

        <div className="relative z-10 max-w-lg mx-auto w-full">
          
          {/* Logo block */}
          <div className="stagger-left-item bg-white w-24 h-24 rounded-2xl flex flex-col items-center justify-center p-3 mb-10 shadow-lg mx-auto lg:mx-0">
             <img src="/kaynetics_logo_new.png" alt="Kaynetics" className="w-full h-full object-contain" />
          </div>

          <h1 className="stagger-left-item text-4xl lg:text-[42px] font-bold text-white leading-tight mb-8 text-center lg:text-left">
            Build the Best AI Agents, Faster & Smarter
          </h1>
          
          <p className="stagger-left-item text-blue-100 text-[16px] mb-12 text-center lg:text-left leading-relaxed">
            Empower your team with Kaynetics' advanced platform. From initial training to successful deployment, we simplify every step.
          </p>

          {/* Features List */}
          <div className="space-y-8">
            
            {/* Feature 1 */}
            <div className="stagger-left-item flex items-start group">
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 rounded-full border-2 border-blue-300 flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#1967d2] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>
              <div className="ml-5">
                <h3 className="text-white font-bold text-[17px] mb-1">Smart Agent Tracking</h3>
                <p className="text-blue-100 text-[14px] leading-relaxed">
                  Centralize your AI pool and track performance in real-time.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="stagger-left-item flex items-start group">
              <div className="flex-shrink-0 mt-1 relative">
                {/* Connecting line */}
                <div className="absolute -top-10 left-1/2 w-[2px] h-10 bg-blue-400/30 -translate-x-1/2"></div>
                <div className="w-10 h-10 rounded-full border-2 border-blue-300 flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#1967d2] transition-colors relative z-10">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
              </div>
              <div className="ml-5">
                <h3 className="text-white font-bold text-[17px] mb-1">AI-Driven Optimization</h3>
                <p className="text-blue-100 text-[14px] leading-relaxed">
                  Find the perfect model with intelligent screening and fine-tuning.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="stagger-left-item flex items-start group">
              <div className="flex-shrink-0 mt-1 relative">
                 {/* Connecting line */}
                <div className="absolute -top-10 left-1/2 w-[2px] h-10 bg-blue-400/30 -translate-x-1/2"></div>
                <div className="w-10 h-10 rounded-full border-2 border-blue-300 flex items-center justify-center text-white group-hover:bg-white group-hover:text-[#1967d2] transition-colors relative z-10">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
              </div>
              <div className="ml-5">
                <h3 className="text-white font-bold text-[17px] mb-1">Collaborative Deployments</h3>
                <p className="text-blue-100 text-[14px] leading-relaxed">
                  Seamlessly coordinate with your engineering and product teams.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Right Side: White Panel for Forms */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div ref={rightPanelRef} className="w-full max-w-md mx-auto relative z-10">
          {/* Logo for mobile only */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-16 h-16 rounded-xl border border-gray-200 shadow-sm p-2 flex items-center justify-center">
              <img src="/kaynetics_logo_new.png" alt="Kaynetics" className="w-full h-full object-contain" />
            </div>
          </div>
          
          <Outlet />
        </div>
      </div>

    </div>
  );
}
