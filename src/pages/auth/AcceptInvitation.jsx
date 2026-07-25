import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import { toast } from 'react-toastify';
import { UserCheck, Lock, User, ArrowRight } from 'lucide-react';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      return toast.error('Invalid or missing invitation token link.');
    }
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match.');
    }
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters long.');
    }

    setLoading(true);
    try {
      await userService.acceptInvitation({
        token,
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim()
      });
      toast.success('Account setup complete! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to accept invitation. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6c48ff] flex items-center justify-center mb-4 border border-purple-100 shadow-sm">
          <UserCheck className="w-6 h-6" />
        </div>
        <h2 className="text-[32px] font-medium text-[#111827] tracking-tight mb-2">Join Your Team</h2>
        <p className="text-[#6b7280] text-[15px]">Set up your profile to accept the organization invitation.</p>
      </div>

      {!token ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center text-sm mb-6">
          Missing invitation token in URL. Please click the link sent in your email invitation.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">First Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#6c48ff] focus:ring-2 focus:ring-purple-100 transition"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Last Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#6c48ff] focus:ring-2 focus:ring-purple-100 transition"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Create Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#6c48ff] focus:ring-2 focus:ring-purple-100 transition"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#6c48ff] focus:ring-2 focus:ring-purple-100 transition"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#6c48ff] hover:bg-[#5b3af0] disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Setting up Account...' : 'Accept Invitation & Join'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#6c48ff] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
