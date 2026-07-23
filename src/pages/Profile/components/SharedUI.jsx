import React from 'react';

export function Section({ title, description, children, border = true }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 ${border ? 'border-b border-gray-100 pb-10 mb-10' : ''}`}>
      <div className="col-span-1">
        <h3 className="text-[15px] font-bold text-gray-900">{title}</h3>
        <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">{description}</p>
      </div>
      <div className="col-span-1 md:col-span-2 space-y-5">
        {children}
      </div>
    </div>
  );
}

export function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 mt-1.5 text-[12px] font-medium text-red-600 animate-fade-in">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </p>
      )}
    </div>
  );
}

export const InputCls = (error) => `w-full px-3.5 py-2.5 rounded-lg border bg-white text-[14px] text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all outline-none focus:ring-[4px] placeholder:text-gray-400 ${
  error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' 
    : 'border-gray-200 focus:border-gray-900 focus:ring-gray-900/5 hover:border-gray-300'
}`;

export const TextareaCls = (error) => `${InputCls(error)} resize-y min-h-[100px]`;
