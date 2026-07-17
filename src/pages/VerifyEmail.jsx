import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'

  useEffect(() => {
    if (!token) {
      setStatus('error');
      toast.error('Invalid or missing verification token.');
      return;
    }

    const verify = async () => {
      try {
        await authService.verifyEmail({ token });
        setStatus('success');
        toast.success('Email verified successfully! You can now log in.');
      } catch (err) {
        setStatus('error');
        // The apiClient response interceptor automatically handles displaying the toast error message
      }
    };

    verify();
  }, [token]);

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-[32px] font-medium text-[#111827] tracking-tight mb-2">Email Verification</h2>
        {status === 'loading' && (
          <p className="text-[#6b7280] text-[15px]">Verifying your email address, please wait...</p>
        )}
        {status === 'success' && (
          <p className="text-green-600 text-[15px] font-medium">Your email has been successfully verified!</p>
        )}
        {status === 'error' && (
          <p className="text-red-600 text-[15px] font-medium">There was an error verifying your email. The link may be expired or invalid.</p>
        )}
      </div>

      <div className="flex flex-col space-y-4">
        {status === 'loading' ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-10 w-10 text-[#1967d2]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-[#1967d2] hover:bg-[#1557b0] text-white font-medium py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none text-[15px]"
          >
            Go to Login
          </button>
        )}
      </div>
      
      {status === 'error' && (
        <div className="mt-8 flex justify-center">
          <Link to="/signup" className="flex items-center text-[14px] font-semibold text-[#1967d2] hover:underline transition-all">
            Need a new link? Sign Up
          </Link>
        </div>
      )}
    </div>
  );
}
