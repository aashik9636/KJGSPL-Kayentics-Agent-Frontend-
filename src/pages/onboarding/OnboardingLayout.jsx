import React from 'react';
import { Outlet } from 'react-router-dom';

export default function OnboardingLayout() {
  return (
    <div className="min-h-screen bg-[#f4f7fe] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl w-full space-y-8 bg-white p-10 sm:p-14 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <Outlet />
      </div>
    </div>
  );
}
