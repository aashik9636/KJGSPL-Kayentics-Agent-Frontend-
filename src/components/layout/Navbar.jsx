import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Navbar() {
  const navbarRef = useRef(null);

  useEffect(() => {
    if (navbarRef.current) {
      const tl = gsap.timeline();
      
      tl.fromTo(navbarRef.current.querySelector('.navbar-title'),
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', delay: 0.2 }
      )
      .fromTo(navbarRef.current.querySelector('.navbar-search'),
        { opacity: 0, y: -5 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
        "-=0.3"
      );
    }
  }, []);

  return (
    <header ref={navbarRef} className="h-24 flex items-center justify-between px-8 shrink-0 z-10">
      
      {/* Page Title */}
      <div className="navbar-title">
        <h2 className="text-[24px] font-bold text-[#111827] tracking-tight">
          Dashboard
        </h2>
      </div>
      
      {/* Right Search Bar */}
      <div className="navbar-search hidden sm:flex items-center">
        <div className="relative w-72 lg:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full bg-white text-gray-900 rounded-full py-3 pl-10 pr-4 text-[14px] font-medium outline-none shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-transparent focus:border-gray-200 transition-all placeholder-gray-400"
          />
        </div>
      </div>
    </header>
  );
}
