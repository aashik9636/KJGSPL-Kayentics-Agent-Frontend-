import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error("Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.");
      return;
    }
    
    setLoading(true);
    
    try {
      await authService.register({ 
        email, 
        password,
        firstName,
        lastName,
        organizationName
      });
      toast.success("Account created successfully!");
      navigate('/login');
    } catch (err) {
      // apiClient response interceptor automatically handles displaying the toast error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-[32px] font-medium text-[#111827] tracking-tight mb-2">Create Account</h2>
        <p className="text-[#6b7280] text-[15px]">Join Kaynetics to manage your AI agents</p>
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
          <span className="text-[14px] font-medium text-[#111827]">Sign up with Google</span>
        </button>
        <button type="button" className="w-full flex items-center justify-center space-x-3 border border-gray-200 rounded-xl py-3 px-4 hover:bg-gray-50 transition-colors">
          <svg className="w-5 h-5 text-[#0077b5]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          <span className="text-[14px] font-medium text-[#111827]">Sign up with LinkedIn</span>
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

      <form className="w-full space-y-5" onSubmit={handleSignup}>
        {/* Name Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">First Name</label>
            <input
              type="text"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 placeholder-gray-400 text-[14px] transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Last Name</label>
            <input
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 placeholder-gray-400 text-[14px] transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]"
            />
          </div>
        </div>

        {/* Organization */}
        <div>
          <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Organization Name
          </label>
          <input
            type="text"
            placeholder="Acme Corp"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            required
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 placeholder-gray-400 text-[14px] transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]"
          />
        </div>

        {/* Email */}
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
          <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Password
          </label>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
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
          <p className="text-[11px] text-[#6b7280] mt-1.5 ml-1">
            Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol.
          </p>
        </div>

        <div>
          <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Repeat Password
          </label>
          <div className="relative">
            <input 
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 placeholder-gray-400 text-[14px] transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]"
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            >
              {showConfirmPassword ? (
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

        <div className="flex items-center mt-4">
          <input id="terms" type="checkbox" required className="w-4 h-4 rounded border-gray-300 text-[#1967d2] focus:ring-[#1967d2]" />
          <label htmlFor="terms" className="ml-2 block text-[13px] font-medium text-[#6b7280]">
            I accept the <a href="#" className="text-[#1967d2] font-bold hover:underline">Terms of Service</a>
          </label>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-[#1967d2] hover:bg-[#1557b0] disabled:bg-blue-300 text-white font-medium py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none mt-8 text-[15px]">
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-8 text-center text-[14px] text-[#6b7280]">
        Already have an account? <Link to="/login" className="text-[#1967d2] font-semibold hover:underline">Sign In</Link>
      </p>

      <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-center gap-6 text-[11px] font-bold tracking-wider text-[#9ca3af] uppercase">
        <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
        <div className="w-1 h-1 rounded-full bg-gray-300"></div>
        <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
        <div className="w-1 h-1 rounded-full bg-gray-300"></div>
        <a href="#" className="hover:text-gray-600 transition-colors">Help</a>
      </div>
    </div>
  );
}
