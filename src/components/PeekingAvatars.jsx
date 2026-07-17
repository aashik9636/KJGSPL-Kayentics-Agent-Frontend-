import React, { useEffect } from 'react';
import gsap from 'gsap';

export default function PeekingAvatars() {
  useEffect(() => {
    // Avatars peeking animation
    gsap.fromTo('.avatar-icon', 
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'back.out(1.7)', delay: 0.4 }
    );
    
    // Add subtle hover float effect
    gsap.to('.avatar-icon', {
      y: -5,
      duration: 2,
      stagger: 0.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1.5
    });
  }, []);

  return (
    <div className="absolute -top-16 left-0 right-0 flex justify-center z-0 pointer-events-none">
      <div className="relative flex justify-center items-end">
        {/* Avatar 1 (Left) */}
        <div className="avatar-icon relative w-16 h-16 z-10 translate-x-6">
          <div className="absolute inset-0 rounded-full bg-white border-[3px] border-[#e2ebf6] shadow-sm"></div>
          <img src="/Marketing/Marketing1.png" alt="Marketing Agent 1" className="absolute bottom-0 w-full h-[130%] object-contain object-bottom drop-shadow-md" />
        </div>
        
        {/* Avatar 2 (Center) */}
        <div className="avatar-icon relative w-24 h-24 z-20">
          <div className="absolute inset-0 rounded-full bg-white border-[4px] border-[#e2ebf6] shadow-md"></div>
          <img src="/social media/Atlas – Business Intelligence Agent.png" alt="Atlas Agent" className="absolute bottom-0 w-full h-[140%] object-contain object-bottom drop-shadow-lg" />
        </div>
        
        {/* Avatar 3 (Right) */}
        <div className="avatar-icon relative w-16 h-16 z-10 -translate-x-6">
          <div className="absolute inset-0 rounded-full bg-white border-[3px] border-[#e2ebf6] shadow-sm"></div>
          <img src="/Marketing/Marketing5.png" alt="Marketing Agent 5" className="absolute bottom-0 w-full h-[130%] object-contain object-bottom drop-shadow-md" />
        </div>
      </div>
    </div>
  );
}
