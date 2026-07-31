import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent! Check your inbox.');
    } catch (err) {
      // apiClient interceptor handles error toasts
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-[32px] font-medium text-[#111827] dark:text-white tracking-tight mb-2">Forgot Password</h2>
        <p className="text-[#6b7280] dark:text-neutral-400 text-[15px]">We'll send you reset instructions to your email</p>
      </div>

      {sent ? (
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/60 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-[15px] text-[#111827] dark:text-white font-medium">Check your inbox!</p>
          <p className="text-[14px] text-[#6b7280] dark:text-neutral-400">
            We sent a password reset link to <span className="font-semibold text-[#111827] dark:text-white">{email}</span>.
          </p>
          <p className="text-[13px] text-[#9ca3af] dark:text-neutral-500">Didn't receive it? Check your spam folder.</p>
        </div>
      ) : (
        <form className="w-full space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[12px] font-bold text-[#6b7280] dark:text-neutral-300 mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 dark:border-[#333333] bg-[#f9fafb] dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#1a1a1a] text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 text-[14px] transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#1967d2] hover:bg-[#1557b0] disabled:bg-blue-300 text-white font-medium py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none mt-8 text-[15px]">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}

      <div className="mt-8 flex justify-center">
        <Link to="/login" className="flex items-center text-[14px] font-semibold text-[#1967d2] hover:underline transition-all">
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to login
        </Link>
      </div>
    </div>
  );
}

