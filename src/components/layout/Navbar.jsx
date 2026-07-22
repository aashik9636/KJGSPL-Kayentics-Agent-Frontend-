import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useAuthStore } from '../../store/authStore';
import { workspaceService } from '../../services/workspaceService';
import { rbacService } from '../../services/rbacService';
import { toast } from 'react-toastify';

export default function Navbar() {
  const navbarRef = useRef(null);
  const orgDropdownRef = useRef(null);
  const wsDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const [orgOpen, setOrgOpen] = useState(false);
  const [wsOpen, setWsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const {
    organizations,
    workspaces,
    activeOrganization,
    activeWorkspace,
    setOrganizations,
    setWorkspaces,
    setActiveOrganization,
    setActiveWorkspace,
    setPermissions,
  } = useWorkspaceStore();

  const { setTokens } = useAuthStore();

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
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(e.target)) setOrgOpen(false);
      if (wsDropdownRef.current && !wsDropdownRef.current.contains(e.target)) setWsOpen(false);
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Switch organization — re-fetch workspaces for new org
  const handleOrgSwitch = useCallback(async (org) => {
    if (org.id === activeOrganization?.id) { setOrgOpen(false); return; }
    setSwitching(true);
    setOrgOpen(false);
    try {
      setActiveOrganization(org);
      const workspaces = await workspaceService.getWorkspacesByOrg(org.id);
      const wsList = Array.isArray(workspaces) ? workspaces : [];
      setWorkspaces(wsList);
      // Auto-select first workspace of new org
      if (wsList.length > 0) {
        await handleWorkspaceSwitch(wsList[0], true);
      } else {
        setActiveWorkspace(null);
      }
    } catch {
      toast.error('Failed to switch organization.');
    } finally {
      setSwitching(false);
    }
  }, [activeOrganization]);

  // Switch workspace — MUST call API to get new JWT (org+workspace encoded in token)
  const handleWorkspaceSwitch = useCallback(async (workspace, silent = false) => {
    if (!silent && workspace.id === activeWorkspace?.id) { setWsOpen(false); return; }
    setSwitching(true);
    setWsOpen(false);
    try {
      // Backend returns a new accessToken + refreshToken with the new workspace context baked in
      const result = await workspaceService.switchWorkspace(workspace.id);
      const { accessToken, refreshToken } = result;

      if (!accessToken) throw new Error('No token returned from workspace switch');

      // Replace stored tokens — all future requests will use the new workspace context
      setTokens(accessToken, refreshToken);
      setActiveWorkspace(workspace);

      // Re-fetch permissions for the new workspace context
      try {
        const permissions = await rbacService.getPermissions();
        setPermissions(Array.isArray(permissions) ? permissions : []);
      } catch {
        // Non-critical
      }

      if (!silent) toast.success(`Switched to "${workspace.name}"`);
    } catch {
      if (!silent) toast.error('Failed to switch workspace.');
    } finally {
      setSwitching(false);
    }
  }, [activeWorkspace]);

  return (
    <header ref={navbarRef} className="h-20 flex items-center justify-between px-8 shrink-0 z-10">

      {/* Page Title */}
      <div className="navbar-title">
        <h2 className="text-[22px] font-bold text-[#111827] tracking-tight">
          Dashboard
        </h2>
      </div>

      {/* Right — Context Switcher + Search */}
      <div className="flex items-center gap-3">

        {/* Organization Switcher */}
        {organizations.length > 0 && (
          <div className="relative" ref={orgDropdownRef}>
            <button
              onClick={() => { setOrgOpen((v) => !v); setWsOpen(false); }}
              disabled={switching}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all text-[13px] font-medium text-[#374151] shadow-sm min-w-0 max-w-[160px]"
            >
              <div className="w-5 h-5 rounded-md bg-[#1967d2]/10 flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-[#1967d2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="truncate">{activeOrganization?.name || 'Organization'}</span>
              <svg className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${orgOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {orgOpen && (
              <div className="absolute top-full mt-2 right-0 w-52 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-50">
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Organizations</p>
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => handleOrgSwitch(org)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] hover:bg-gray-50 transition-colors ${org.id === activeOrganization?.id ? 'text-[#1967d2] font-semibold' : 'text-[#374151]'}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${org.id === activeOrganization?.id ? 'bg-[#1967d2]' : 'bg-gray-300'}`} />
                    <span className="truncate">{org.name}</span>
                    {org.id === activeOrganization?.id && (
                      <svg className="w-3.5 h-3.5 text-[#1967d2] ml-auto shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Workspace Switcher */}
        {workspaces.length > 0 && (
          <div className="relative" ref={wsDropdownRef}>
            <button
              onClick={() => { setWsOpen((v) => !v); setOrgOpen(false); }}
              disabled={switching}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all text-[13px] font-medium text-[#374151] shadow-sm min-w-0 max-w-[160px]"
            >
              <div className="w-5 h-5 rounded-md bg-purple-50 flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <span className="truncate">{activeWorkspace?.name || 'Workspace'}</span>
              {switching ? (
                <svg className="animate-spin w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${wsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            {wsOpen && (
              <div className="absolute top-full mt-2 right-0 w-52 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-50">
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Workspaces</p>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => handleWorkspaceSwitch(ws)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13px] hover:bg-gray-50 transition-colors ${ws.id === activeWorkspace?.id ? 'text-purple-600 font-semibold' : 'text-[#374151]'}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${ws.id === activeWorkspace?.id ? 'bg-purple-500' : 'bg-gray-300'}`} />
                    <span className="truncate">{ws.name}</span>
                    {ws.id === activeWorkspace?.id && (
                      <svg className="w-3.5 h-3.5 text-purple-500 ml-auto shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search Bar */}
        <div className="hidden sm:flex items-center">
          <div className="relative w-60 lg:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-white text-gray-900 rounded-full py-2.5 pl-10 pr-4 text-[14px] font-medium outline-none shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-transparent focus:border-gray-200 transition-all placeholder-gray-400"
            />
          </div>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative ml-2" ref={profileDropdownRef}>
          <button 
            onClick={() => { setProfileOpen((v) => !v); setOrgOpen(false); setWsOpen(false); }}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1967d2] to-blue-400 flex items-center justify-center text-white font-bold uppercase shadow-sm border-2 border-white focus:outline-none"
          >
            {useAuthStore.getState().user?.name?.charAt(0) || useAuthStore.getState().user?.email?.charAt(0) || 'U'}
          </button>
          
          {profileOpen && (
            <div className="absolute top-full mt-2 right-0 w-48 bg-white rounded-xl border border-gray-100 shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100 mb-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{useAuthStore.getState().user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{useAuthStore.getState().user?.email}</p>
              </div>
              <a href="/profile" className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                My Profile
              </a>
              <button 
                onClick={() => {
                  useAuthStore.getState().logout();
                  window.location.href = '/login';
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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

