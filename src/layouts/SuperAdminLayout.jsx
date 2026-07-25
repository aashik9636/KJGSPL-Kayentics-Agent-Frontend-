import React, { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import gsap from 'gsap';
import {
  ShieldAlert, LayoutDashboard, Building2, Users, CreditCard,
  Cpu, FileText, Settings, ArrowLeft, LogOut, Sparkles, ChevronRight, Menu, X
} from 'lucide-react';

export default function SuperAdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const refreshToken = useAuthStore((state) => state.refreshToken);

  const [mobileOpen, setMobileOpen] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [location.pathname]);

  const navItems = [
    { name: 'Platform Overview', path: '/superadmin', icon: LayoutDashboard },
    { name: 'Tenants & Orgs', path: '/superadmin/tenants', icon: Building2 },
    { name: 'Billing & Plans', path: '/superadmin/billing', icon: CreditCard },
    { name: 'User Directory', path: '/superadmin/users', icon: Users },
    { name: 'AI Governance', path: '/superadmin/ai', icon: Cpu },
    { name: 'Audit Logs', path: '/superadmin/audit-logs', icon: FileText },
    { name: 'System Settings', path: '/superadmin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } catch (e) {
      console.error(e);
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0b0f19] text-gray-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111827] border-r border-gray-800/80 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header Branding */}
          <div className="p-6 border-b border-gray-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-gray-950 font-bold">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-extrabold text-lg text-white tracking-wide flex items-center gap-1.5">
                  KAYNETICS
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
                    GOD MODE
                  </span>
                </h1>
                <p className="text-xs text-gray-400">Superadmin Control</p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                location.pathname === item.path ||
                (item.path !== '/superadmin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/5'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${active ? 'text-amber-400' : 'text-gray-500'}`} />
                    <span>{item.name}</span>
                  </div>
                  {active && <ChevronRight className="w-4 h-4 text-amber-400" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-800/80 space-y-3">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700/50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to App</span>
          </Link>

          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-900/60 border border-gray-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs shrink-0 border border-amber-500/30">
                {user?.firstName?.[0] || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-200 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-amber-400/90 font-mono truncate">SUPER_ADMIN</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 transition-colors p-1.5"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0b0f19] relative overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-gray-800/80 bg-[#111827]/70 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-gray-300">SaaS Superadmin Control Center</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Platform Live
            </div>
          </div>
        </header>

        {/* Body View */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
