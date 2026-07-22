import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { workspaceService } from '../services/workspaceService';
import { rbacService } from '../services/rbacService';
import { useAuthStore } from '../store/authStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import { toast } from 'react-toastify';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      
      const { user, accessToken, refreshToken, organizationId, workspaceId } = response;
      
      if (!accessToken) {
        toast.error("Failed to retrieve access token.");
        setLoading(false);
        return;
      }

      // Store tokens first so subsequent requests are authenticated
      setAuth(user || null, accessToken, refreshToken);

      // Set org/workspace IDs from login response (if provided)
      if (organizationId) useWorkspaceStore.getState().setOrganizationId(organizationId);
      if (workspaceId) useWorkspaceStore.getState().setWorkspaceId(workspaceId);

      // If login response didn't include user profile, fetch it now via GET /users/me
      if (!user) {
        try {
          const profile = await authService.getCurrentUser();
          useAuthStore.getState().setAuth(profile, accessToken, refreshToken);
        } catch {
          // Non-critical — user is still logged in
        }
      }

      // Load organizations list for the Navbar switcher
      try {
        const orgs = await workspaceService.listOrganizations();
        const orgList = Array.isArray(orgs) ? orgs : [];
        useWorkspaceStore.getState().setOrganizations(orgList);

        // Set the active organization object (for Navbar display)
        const activeOrg = orgList.find((o) => o.id === organizationId) || orgList[0] || null;
        if (activeOrg) {
          useWorkspaceStore.getState().setActiveOrganization(activeOrg);

          // Load workspaces for the active org
          try {
            const workspaces = await workspaceService.getWorkspacesByOrg(activeOrg.id);
            const wsList = Array.isArray(workspaces) ? workspaces : [];
            useWorkspaceStore.getState().setWorkspaces(wsList);

            // Set active workspace object
            const activeWs = wsList.find((w) => w.id === workspaceId) || wsList[0] || null;
            if (activeWs) useWorkspaceStore.getState().setActiveWorkspace(activeWs);
          } catch {
            // Non-critical
          }
        }
      } catch {
        // Non-critical — navbar will show IDs as fallback
      }

      // Load RBAC permissions for the current org/workspace context
      try {
        const permissions = await rbacService.getPermissions();
        useWorkspaceStore.getState().setPermissions(Array.isArray(permissions) ? permissions : []);
      } catch {
        // Non-critical — app still works, just no permission gating
      }

      toast.success("Successfully logged in!");
      navigate('/');
    } catch (err) {
      // apiClient response interceptor automatically handles displaying the toast error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-[32px] font-medium text-[#111827] tracking-tight mb-2">Sign in</h2>
        <p className="text-[#6b7280] text-[15px]">Enter your details to access your Kaynetics account</p>
      </div>

      {/* Social Logins */}
      <div className="space-y-3 mb-8">
        <button type="button" className="w-full flex items-center justify-center space-x-3 border border-gray-200 rounded-xl py-3 px-4 hover:bg-gray-50 transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-[14px] font-medium text-[#111827]">Continue with Google</span>
        </button>
        <button type="button" className="w-full flex items-center justify-center space-x-3 border border-gray-200 rounded-xl py-3 px-4 hover:bg-gray-50 transition-colors">
          <svg className="w-5 h-5 text-[#0077b5]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          <span className="text-[14px] font-medium text-[#111827]">Continue with LinkedIn</span>
        </button>
      </div>

      <div className="relative w-full mb-8 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100"></div>
        </div>
        <span className="relative bg-white px-4 text-[12px] uppercase font-bold tracking-widest text-[#9ca3af]">
          OR USE EMAIL
        </span>
      </div>

      <form className="w-full space-y-5" onSubmit={handleLogin}>
        <div>
          <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Email
          </label>
          <input 
            type="email" 
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 placeholder-gray-400 text-[14px] transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]"
          />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[12px] font-bold text-[#6b7280] uppercase tracking-wide flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Password
            </label>
            <Link to="/forgot-password" className="text-[12px] font-bold text-[#1967d2] hover:underline">
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 placeholder-gray-400 text-[14px] transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-[#1967d2] hover:bg-[#1557b0] disabled:bg-blue-300 text-white font-medium py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none mt-8 text-[15px]">
          {loading ? 'Signing in...' : 'Sign in to Kaynetics'}
        </button>
      </form>

      <p className="mt-8 text-center text-[14px] text-[#6b7280]">
        Don't have an account? <Link to="/signup" className="text-[#1967d2] font-semibold hover:underline">Create account</Link>
      </p>

      <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-center gap-6 text-[11px] font-bold tracking-wider text-[#9ca3af] uppercase">
        <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
        <div className="w-1 h-1 rounded-full bg-gray-300"></div>
        <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
        <div className="w-1 h-1 rounded-full bg-gray-300"></div>
        <a href="#" className="hover:text-gray-600 transition-colors">Help</a>
      </div>
      <p className="text-center text-[11px] text-gray-400 mt-4">
        © 2026 Kaynetics. All rights reserved.
      </p>
    </div>
  );
}
