import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import gsap from 'gsap';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const refreshToken = useAuthStore(state => state.refreshToken);

  const sidebarRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      logout();
      navigate('/login');
    }
  };

  const formatName = (str) => {
    if (!str) return '';
    return str
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getDisplayName = (userObj) => {
    if (!userObj) return 'User Account';
    if (userObj.firstName || userObj.lastName) {
      const full = `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim();
      if (full) return formatName(full);
    }
    if (userObj.name) {
      return formatName(userObj.name);
    }
    if (userObj.email) {
      const nameFromEmail = userObj.email.split('@')[0].replace(/[._-]/g, ' ');
      return formatName(nameFromEmail);
    }
    return 'User Account';
  };

  const getInitial = (userObj) => {
    const name = getDisplayName(userObj);
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const getRoleDisplay = (userObj) => {
    if (!userObj?.role) return 'Admin';
    const roleStr = userObj.role.replace(/_/g, ' ');
    return formatName(roleStr);
  };

  // ─── LOGICALLY CATEGORIZED NAVIGATION SECTIONS ───
  const navSections = [
    {
      title: 'Main',
      items: [
        { name: 'Dashboard', path: '/', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
        { name: 'Brain', path: '/chat', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.002 5.125A3 3 0 0 0 6.401 6.5"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.938 10.5a4 4 0 0 1 .585.396"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18a4 4 0 0 1-1.967-.516"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.967 17.484A4 4 0 0 1 18 18"/></svg> },
        { name: 'All Agents', path: '/agents', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
        { name: 'Products', path: '/products', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
        { name: 'Post Calendar', path: '/post-scheduler', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
      ]
    },
    {
      title: 'Workspaces',
      items: [
        { name: 'Knowledge Base', path: '/knowledge-base', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
        { name: 'Content & Media Hub', path: '/storage', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> },
        { name: 'Integrations', path: '/integrations', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg> },
      ]
    },
    {
      title: 'Management & RBAC',
      items: [
        { name: 'Role Master (RBAC)', path: '/roles', matchPrefix: '/roles', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
        { name: 'Team Master', path: '/teams', matchPrefix: '/teams', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
        { name: 'Audit Trail', path: '/audit-logs', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
      ]
    },
    {
      title: 'Billing & Plans',
      items: [
        { name: 'Pricing Plans', path: '/pricing', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 12v-2m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { name: 'Subscription & Usage', path: '/subscription', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
      ]
    }
  ];

  useEffect(() => {
    const handleToggle = (e) => {
      if (e.detail && typeof e.detail.collapse === 'boolean') {
        setCollapsed(e.detail.collapse);
      }
    };
    window.addEventListener('toggle-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-sidebar', handleToggle);
  }, []);

  useEffect(() => {
    if (sidebarRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(sidebarRef.current.querySelector('.sidebar-logo'),
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out', delay: 0.1 }
      )
        .fromTo(sidebarRef.current.querySelectorAll('.nav-group'),
          { opacity: 0, x: -10 },
          { opacity: 1, x: 0, duration: 0.3, stagger: 0.08, ease: 'power2.out' },
          "-=0.2"
        );
    }
  }, []);

  const displayName = getDisplayName(user);
  const initial = getInitial(user);
  const roleDisplay = getRoleDisplay(user);

  return (
    <aside ref={sidebarRef} className={`bg-white dark:bg-[#111111] flex flex-col h-full shrink-0 z-10 relative transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? 'w-20' : 'w-64'} pt-2 pb-6 rounded-tr-[36px] rounded-br-[36px] shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-neutral-100 dark:border-[#262626]`}>

      {/* Floating Expand/Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-8 -right-3 w-6 h-6 bg-white dark:bg-[#171717] border border-neutral-200 dark:border-[#333333] shadow-sm rounded-full flex items-center justify-center text-neutral-400 dark:text-neutral-300 hover:text-[#6c48ff] hover:border-[#6c48ff] z-50 transition-all duration-200"
        title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
        </svg>
      </button>

      {/* Brand Logo Header */}
      <div className={`h-24 flex items-center sidebar-logo relative ${collapsed ? 'justify-center px-0' : 'px-4 justify-start'}`}>
        <Link to="/" className="flex items-center gap-3 w-full h-full">
          {collapsed ? (
            <img src="/kaynetics-logo-icon.svg" alt="Kaynetics Icon" className="w-8 h-8 object-contain mx-auto" />
          ) : (
            <>
              <img src="/Kaynetics_logo-removebg-preview.png" alt="Kaynetics Logo" className="w-[180px] h-auto object-contain dark:hidden" />
              <img src="/Kaynetics_logo_Dark_-removebg-preview.png" alt="Kaynetics Logo" className="w-[180px] h-auto object-contain hidden dark:block" />
            </>
          )}
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-2 space-y-5">
        {navSections.map((section) => (
          <div key={section.title} className={`nav-group ${collapsed ? 'px-3' : 'px-5'}`}>
            {!collapsed && (
              <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2 block px-3">
                {section.title}
              </span>
            )}
            <nav className="space-y-1">
              {section.items.map((item) => {
                const isActive = item.matchPrefix
                  ? location.pathname.startsWith(item.matchPrefix)
                  : (location.pathname === item.path || (item.path === '/' && location.pathname === ''));

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    state={item.path === '/chat' ? { newChat: Date.now() } : {}}
                    title={collapsed ? item.name : ''}
                    className={`nav-item flex items-center gap-3.5 text-[13.5px] font-medium transition-all ${collapsed ? 'justify-center p-3 rounded-2xl' : 'px-4 py-3 rounded-2xl'} ${
                      isActive
                        ? 'bg-[#f4f2ff] dark:bg-[#232048] text-[#6c48ff] dark:text-[#a78bfa] font-bold shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#1a1a1a] hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <span className={`transition-colors ${isActive ? 'text-[#6c48ff] dark:text-[#a78bfa]' : 'text-neutral-400 dark:text-neutral-500'}`}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis flex-1">
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer Profile & Logout Box */}
      <div className={`mt-2 ${collapsed ? 'px-3' : 'px-5'}`}>
        {user?.role === 'SUPER_ADMIN' && (
          <Link
            to="/superadmin"
            className={`mb-3 flex items-center ${collapsed ? 'justify-center p-2.5' : 'px-3.5 py-2.5'} rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 font-bold text-xs border border-amber-500/30 transition-all`}
            title="Superadmin Control Center"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            {!collapsed && <span className="ml-2 truncate">Superadmin Portal</span>}
          </Link>
        )}

        <div className={`${collapsed ? 'bg-transparent' : 'bg-neutral-50/80 dark:bg-[#171717]/90'} rounded-2xl ${collapsed ? 'p-0' : 'p-3'} flex flex-col gap-2 transition-all border border-neutral-100 dark:border-[#25293b]`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div 
              className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-tr from-[#6c48ff] to-[#8f71ff] text-white flex items-center justify-center font-black text-xs shadow-xs tracking-wider" 
              title={collapsed ? displayName : ""}
            >
              {initial}
            </div>

            {!collapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[13px] font-bold text-neutral-900 dark:text-neutral-100 leading-tight truncate capitalize">
                  {displayName}
                </span>
                <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span>{roleDisplay}</span>
                </span>
              </div>
            )}
          </div>

          {collapsed ? (
            <button
              onClick={handleLogout}
              className="mt-2 w-9 h-9 mx-auto flex items-center justify-center rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Sign Out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-1.5 rounded-xl text-[11px] font-bold text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
            >
              <svg className="w-3.5 h-3.5 text-neutral-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
