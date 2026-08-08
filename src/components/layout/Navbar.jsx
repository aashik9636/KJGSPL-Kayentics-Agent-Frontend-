import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import gsap from 'gsap';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

export default function Navbar() {
  const location = useLocation();
  const navbarRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const [profileOpen, setProfileOpen] = useState(false);

  const { theme, toggleTheme, initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, []);

  // Entry animation
  useEffect(() => {
    if (navbarRef.current) {
      gsap.fromTo(navbarRef.current.querySelector('.navbar-title'),
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', delay: 0.2 }
      );
    }
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header ref={navbarRef} className="h-20 flex items-center justify-between px-8 shrink-0 z-40">

      {/* Page Title */}
      <div className="navbar-title">
        <h2 className="text-[22px] font-bold text-[#111827] dark:text-white tracking-tight">
          {(() => {
            const p = location.pathname;
            if (p === '/') return 'Dashboard';
            if (p.includes('/chat')) return 'AI Chat Studio';
            if (p.includes('/agents')) return 'AI Agents';
            if (p.includes('/products')) return 'Products';
            if (p.includes('/post-scheduler')) return 'Post Calendar';
            if (p.includes('/knowledge-base')) return 'Knowledge Base';
            if (p.includes('/storage') || p.includes('/content-hub')) return 'Content & Media Hub';
            if (p.includes('/integrations')) return 'Integrations & APIs';
            if (p.includes('/roles')) return 'Role Master (RBAC)';
            if (p.includes('/teams')) return 'Team Master';
            if (p.includes('/pricing')) return 'Plans & Pricing';
            if (p.includes('/subscription')) return 'Subscription & Usage';
            if (p.includes('/audit-logs')) return 'Audit Trail';
            if (p.includes('/profile')) return 'Account Profile';
            if (p.includes('/superadmin')) return 'Superadmin Control Center';
            return 'Dashboard';
          })()}
        </h2>
      </div>

      {/* Right — Search + Theme + User */}
      <div className="flex items-center gap-3">

        {/* Search Bar */}
        <div className="hidden sm:flex items-center">
          <div className="relative w-60 lg:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white rounded-full py-2.5 pl-10 pr-4 text-[14px] font-medium outline-none shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-transparent dark:border-[#333333] focus:border-neutral-200 dark:focus:border-purple-500/50 transition-all placeholder-neutral-400 dark:placeholder-neutral-500"
            />
          </div>
        </div>

        {/* Dark/Light Mode Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white hover:bg-neutral-100 dark:bg-[#1c1f2b] dark:hover:bg-[#282c3c] border border-neutral-200/80 dark:border-[#2e3346] text-neutral-600 dark:text-amber-400 shadow-sm focus:outline-none ml-1 group shrink-0"
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5 transition-transform group-hover:rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 transition-transform group-hover:-rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative ml-2" ref={profileDropdownRef}>
          <button 
            onClick={() => setProfileOpen((v) => !v)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1967d2] to-blue-400 flex items-center justify-center text-white font-bold uppercase shadow-sm border-2 border-white focus:outline-none"
          >
            {useAuthStore.getState().user?.name?.charAt(0) || useAuthStore.getState().user?.email?.charAt(0) || 'U'}
          </button>
          
          {profileOpen && (
            <div className="absolute top-full mt-2 right-0 w-48 bg-white dark:bg-[#111111] rounded-xl border border-neutral-100 dark:border-[#262626] shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-neutral-100 dark:border-[#262626] mb-1">
                <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{useAuthStore.getState().user?.name || 'User'}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{useAuthStore.getState().user?.email}</p>
              </div>
              <Link 
                to="/profile" 
                onClick={() => setProfileOpen(false)} 
                className="w-full flex items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#1c1f2b] transition-colors"
              >
                My Profile
              </Link>
              <button 
                onClick={() => {
                  useAuthStore.getState().logout();
                  window.location.href = '/login';
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}


