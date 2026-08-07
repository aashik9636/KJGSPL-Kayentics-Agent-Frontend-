import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import gsap from 'gsap';
import {
  ShieldAlert, LayoutDashboard, Building2, Users, CreditCard,
  Cpu, FileText, Settings, ArrowLeft, LogOut
} from 'lucide-react';

export default function SuperAdminSidebar() {
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
    return 'User Account';
  };

  const getInitial = (userObj) => {
    const name = getDisplayName(userObj);
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  // ─── LOGICALLY CATEGORIZED NAVIGATION SECTIONS ───
  const navSections = [
    {
      title: 'Super Admin',
      items: [
        { name: 'Platform Overview', path: '/superadmin', icon: <LayoutDashboard className="w-5 h-5 shrink-0" /> },
        { name: 'Tenants & Orgs', path: '/superadmin/tenants', icon: <Building2 className="w-5 h-5 shrink-0" /> },
        { name: 'User Directory', path: '/superadmin/users', icon: <Users className="w-5 h-5 shrink-0" /> },
      ]
    },
    {
      title: 'Platform Controls',
      items: [
        { name: 'Billing & Plans', path: '/superadmin/billing', icon: <CreditCard className="w-5 h-5 shrink-0" /> },
        { name: 'AI Governance', path: '/superadmin/ai', icon: <Cpu className="w-5 h-5 shrink-0" /> },
        { name: 'Audit Logs', path: '/superadmin/audit-logs', icon: <FileText className="w-5 h-5 shrink-0" /> },
        { name: 'System Settings', path: '/superadmin/settings', icon: <Settings className="w-5 h-5 shrink-0" /> },
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

  return (
    <aside ref={sidebarRef} className={`bg-white dark:bg-[#111111] flex flex-col h-full shrink-0 z-10 relative transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? 'w-20' : 'w-64'} pt-2 pb-6 rounded-tr-[36px] rounded-br-[36px] shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-neutral-100 dark:border-[#262626]`}>

      {/* Floating Expand/Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-8 -right-3 w-6 h-6 bg-white dark:bg-[#171717] border border-neutral-200 dark:border-[#333333] shadow-sm rounded-full flex items-center justify-center text-neutral-400 dark:text-neutral-300 hover:text-amber-500 hover:border-amber-500 z-50 transition-all duration-200"
        title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
        </svg>
      </button>

      {/* Brand Logo Header */}
      <div className={`h-24 flex items-center sidebar-logo relative ${collapsed ? 'justify-center px-0' : 'px-4 justify-start'}`}>
        <Link to="/superadmin" className="flex items-center gap-3 w-full h-full">
          {collapsed ? (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-neutral-950 font-bold mx-auto">
              <ShieldAlert className="w-5 h-5" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-neutral-950 font-bold">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="font-extrabold text-[15px] text-neutral-900 dark:text-white tracking-wide leading-tight">
                  KAYNETICS
                </h1>
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                  Superadmin Center
                </span>
              </div>
            </div>
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
                const isActive = item.path === '/superadmin' 
                  ? location.pathname === '/superadmin' 
                  : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    title={collapsed ? item.name : ''}
                    className={`nav-item flex items-center gap-3.5 text-[13.5px] font-medium transition-all ${collapsed ? 'justify-center p-3 rounded-2xl' : 'px-4 py-3 rounded-2xl'} ${
                      isActive
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#1a1a1a] hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <span className={`transition-colors ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-400 dark:text-neutral-500'}`}>
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
        <Link
          to="/"
          className={`mb-3 flex items-center ${collapsed ? 'justify-center p-2.5' : 'px-3.5 py-2.5'} rounded-xl bg-neutral-100 dark:bg-[#1a1a1a] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 font-bold text-xs border border-neutral-200 dark:border-neutral-800 transition-all`}
          title="Return to App"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="ml-2 truncate">Return to App</span>}
        </Link>

        <div className={`${collapsed ? 'bg-transparent' : 'bg-neutral-50/80 dark:bg-[#171717]/90'} rounded-2xl ${collapsed ? 'p-0' : 'p-3'} flex flex-col gap-2 transition-all border border-neutral-100 dark:border-[#25293b]`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center text-sm shrink-0 border border-amber-500/20">
              {initial}
            </div>
            
            {!collapsed && (
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className="text-[13px] font-bold text-neutral-900 dark:text-white truncate leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate leading-tight mt-0.5">
                  SUPER_ADMIN
                </span>
              </div>
            )}
            
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {collapsed && (
            <button
              onClick={handleLogout}
              className="w-full mt-1 h-9 rounded-xl flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
