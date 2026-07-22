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
    <div className="flex h-screen w-full bg-[#f4f7fe] overflow-hidden font-sans text-gray-800">
      <Sidebar />
      <div 
        ref={layoutRef}
        className="flex-1 flex flex-col min-w-0 bg-transparent relative"
      >
        {!isChatRoute && <Navbar />}
        <main className={`flex-1 relative flex flex-col ${isChatRoute ? 'p-0 overflow-hidden' : 'p-4 lg:p-8 overflow-y-auto'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
