import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-screen w-full bg-[#f5f5fa] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white rounded-2xl p-10 max-w-md w-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 flex flex-col items-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight font-['Space_Grotesk'] mb-2">403</h1>
        <h2 className="text-xl font-bold text-neutral-800 mb-3">Access Denied</h2>
        <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
          You do not have permission to view this page or perform this action. Contact your organization administrator if you believe this is an error.
        </p>

        <div className="flex items-center gap-3 w-full">
          <button 
            onClick={() => window.history.back()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-bold hover:bg-neutral-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>

          <Link 
            to="/dashboard"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6c48ff] text-white text-xs font-bold hover:bg-[#5a38eb] transition-colors shadow-md shadow-violet-500/20"
          >
            <Home className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
