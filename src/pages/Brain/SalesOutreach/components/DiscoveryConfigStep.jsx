import React, { useState } from 'react';
import { MapPin, Hash, ChevronRight, Search, Target, Users, Globe } from 'lucide-react';

const INTENT_OPTIONS = [
  {
    value: 'find_buyers',
    label: 'Find Buyers',
    description: 'Discover companies actively looking to buy your product type.',
    icon: Target,
  },
  {
    value: 'enrich_leads',
    label: 'Enrich Leads',
    description: 'Enrich and qualify existing leads with company and contact data.',
    icon: Users,
  },
  {
    value: 'competitive_landscape',
    label: 'Competitive Landscape',
    description: 'Map competitors and find prospects switching from alternatives.',
    icon: Globe,
  },
];

export default function DiscoveryConfigStep({ product, onStart, onBack }) {
  const [intent, setIntent] = useState('find_buyers');
  const [location, setLocation] = useState('');
  const [count, setCount] = useState(5);

  const canStart = intent && location.trim() && count > 0;

  return (
    <div className="flex flex-col h-full animate-fade-in w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-[#1a1a1a] flex items-center justify-center">
            <Search className="w-5 h-5 text-[#6c48ff]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">Configure Discovery</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Set discovery parameters for <span className="font-semibold text-neutral-900 dark:text-white">{product?.name}</span></p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto">
        {/* Intent Selection */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
            Discovery Intent
          </label>
          <div className="grid grid-cols-1 gap-3">
            {INTENT_OPTIONS.map(opt => {
              const isActive = intent === opt.value;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setIntent(opt.value)}
                  className={`text-left p-4 rounded-xl border transition-colors flex items-center gap-4 ${
                    isActive
                      ? 'border-[#6c48ff] bg-[#6c48ff]/5'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111111] hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-[#6c48ff] text-white' : 'bg-neutral-100 dark:bg-[#1a1a1a] text-neutral-500'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold mb-0.5 ${isActive ? 'text-[#6c48ff]' : 'text-neutral-900 dark:text-white'}`}>{opt.label}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{opt.description}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                    isActive ? 'border-[#6c48ff] bg-[#6c48ff]' : 'border-neutral-300 dark:border-neutral-600'
                  }`}>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Location & Count */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Target Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. India, United States"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-[#111111] border border-neutral-200 dark:border-neutral-800 rounded-lg outline-none focus:border-[#6c48ff] text-neutral-900 dark:text-white transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Lead Count
            </label>
            <div className="relative">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="number"
                value={count}
                onChange={e => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-[#111111] border border-neutral-200 dark:border-neutral-800 rounded-lg outline-none focus:border-[#6c48ff] text-neutral-900 dark:text-white transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-6 mt-4 border-t border-neutral-200 dark:border-neutral-800 shrink-0">
        <button onClick={onBack} className="px-5 py-2.5 rounded-lg text-neutral-500 dark:text-neutral-400 font-medium text-sm hover:bg-neutral-100 dark:hover:bg-[#1a1a1a] transition-colors">
          Back
        </button>
        <button
          onClick={() => onStart({ intent, location: location.trim(), count })}
          disabled={!canStart}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#6c48ff] hover:bg-[#5b3df5] text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Discovery <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
