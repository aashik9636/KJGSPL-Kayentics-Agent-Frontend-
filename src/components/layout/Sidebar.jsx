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

  const mainRoutes = [
    { name: 'Dashboard', path: '/', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
    { name: 'AI Chat', path: '/chat', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
  ];

  const hubRoutes = [
    { name: 'Business Hub', path: '/business-hub', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
    { name: 'Content Hub', path: '/content', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
    { name: 'Integrations', path: '/integrations', icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg> },
  ];

  useEffect(() => {
    if (sidebarRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(sidebarRef.current.querySelector('.sidebar-logo'),
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out', delay: 0.1 }
      )
      .fromTo(sidebarRef.current.querySelectorAll('.nav-group'),
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.1, ease: 'power2.out' },
        "-=0.2"
      );
    }
  }, []);

  return (
    <aside ref={sidebarRef} className={`bg-white flex flex-col h-full shrink-0 z-10 relative transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? 'w-20' : 'w-64'} pt-2 pb-6 rounded-tr-[40px] rounded-br-[40px] shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}>
      
      {/* Kaynetics Logo */}
      <div className={`h-24 flex items-center sidebar-logo relative ${collapsed ? 'justify-center px-0' : 'px-8'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
             <svg viewBox="0 0 32 32" className="w-full h-full text-[#6c48ff]">
               <circle cx="12" cy="16" r="8" fill="currentColor" />
               <path d="M20 8 A 8 8 0 0 1 20 24 A 12 12 0 0 0 20 8 Z" fill="currentColor" className="opacity-80" />
             </svg>
          </div>
          {!collapsed && <h1 className="text-[22px] font-bold text-gray-900 whitespace-nowrap overflow-hidden tracking-tight">Kaynetics</h1>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {/* Main Routes */}
        <div className={`nav-group mb-6 ${collapsed ? 'px-2' : 'px-6'}`}>
          {!collapsed && <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-3 block px-2">Main</span>}
          <nav className="space-y-1">
            {mainRoutes.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '');
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  title={collapsed ? item.name : ''}
                  className={`flex items-center ${collapsed ? 'justify-center px-0' : 'gap-4 px-4'} py-3 rounded-2xl transition-all duration-300 font-semibold text-[14px] ${
                    isActive 
                      ? 'bg-[#f4f7fe] text-gray-900' 
                      : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                  }`}
                >
                  <span className={isActive ? 'text-[#6c48ff]' : 'text-gray-400'}>{item.icon}</span>
                  {!collapsed && <span className="whitespace-nowrap overflow-hidden">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Hubs Section */}
        <div className={`nav-group ${collapsed ? 'px-2' : 'px-6'}`}>
          {!collapsed && <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-3 block px-2">Workspaces</span>}
          <nav className="space-y-1">
            {hubRoutes.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  title={collapsed ? item.name : ''}
                  className={`flex items-center ${collapsed ? 'justify-center px-0' : 'gap-4 px-4'} py-3 rounded-2xl transition-all duration-300 font-semibold text-[14px] ${
                    isActive 
                      ? 'bg-[#f4f7fe] text-gray-900' 
                      : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                  }`}
                >
                  <span className={isActive ? 'text-[#6c48ff]' : 'text-gray-400'}>{item.icon}</span>
                  {!collapsed && <span className="whitespace-nowrap overflow-hidden flex-1">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Logout / User Profile Card */}
      {!collapsed && (
        <div className="px-6 mt-4">
          <div className="bg-[#f4f7fe] rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6c48ff] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {user ? user.firstName?.charAt(0) : 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-gray-900 leading-tight">
                  {user ? `${user.firstName} ${user.lastName}` : 'User Account'}
                </span>
                <span className="text-[11px] font-medium text-gray-400 mt-0.5">Admin</span>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 mt-1 rounded-xl text-[12px] font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
