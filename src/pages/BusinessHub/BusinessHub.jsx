import React, { useState } from 'react';
import BusinessProfileTab from './components/BusinessProfileTab';
import BrandGuidelinesTab from './components/BrandGuidelinesTab';
import BuyerPersonasTab from './components/BuyerPersonasTab';
import BusinessGoalsTab from './components/BusinessGoalsTab';
import FaqsTab from './components/FaqsTab';

export default function BusinessHub() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Company Profile' },
    { id: 'brand', label: 'Brand Identity' },
    { id: 'personas', label: 'Buyer Personas' },
    { id: 'goals', label: 'Business Goals' },
    { id: 'faqs', label: 'Knowledge Base' },
  ];

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/60 p-8 lg:p-12 h-full w-full max-w-6xl mx-auto flex flex-col">
      <div className="mb-8">
        <h1 className="text-[26px] font-bold text-[#1a1a1a] mb-2">Business Hub</h1>
        <p className="text-[#666666] font-medium text-[15px]">Manage your company's intelligence, brand guidelines, and target audiences for AI context.</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto space-x-2 border-b border-gray-200 mb-8 pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-[14px] font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#1a1a1a] text-white shadow-md'
                : 'text-[#666666] hover:bg-gray-100/50 hover:text-[#1a1a1a]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'profile' && <BusinessProfileTab />}
        {activeTab === 'brand' && <BrandGuidelinesTab />}
        {activeTab === 'personas' && <BuyerPersonasTab />}
        {activeTab === 'goals' && <BusinessGoalsTab />}
        {activeTab === 'faqs' && <FaqsTab />}
      </div>
    </div>
  );
}
