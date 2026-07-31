import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

export default function AppLayout() {
  const layoutRef = useRef(null);
  const location = useLocation();
  const isChatRoute = location.pathname.includes('/chat');
  
  useEffect(() => {
    // Initial entry animation
    gsap.fromTo(layoutRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: 'power2.out' }
    );
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#f4f7fe] dark:bg-[#000000] overflow-hidden font-sans text-neutral-800 dark:text-neutral-100 transition-colors duration-300">
      <Sidebar />
      <div 
        ref={layoutRef}
        className="flex-1 flex flex-col min-w-0 bg-transparent relative"
      >
        {!isChatRoute && <Navbar />}
        <main className={`flex-1 relative flex flex-col ${isChatRoute ? 'p-0 overflow-hidden' : 'px-4 lg:px-8 pb-6 lg:pb-8 pt-1 overflow-y-auto'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
