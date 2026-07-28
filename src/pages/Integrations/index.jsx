import React from 'react';
import { Sparkles, Lock } from 'lucide-react';

export default function Integrations() {
  const integrations = [
    { 
      name: 'LINKEDIN', 
      displayName: 'LinkedIn', 
      description: 'Publish posts, sync company pages & analyze post engagement.',
      icon: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z', 
      color: '#0077b5',
      comingSoon: true
    },
    { 
      name: 'TWITTER', 
      displayName: 'Twitter / X', 
      description: 'Auto-tweet updates, schedule threads & auto-reply to audience.',
      icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z', 
      color: '#000000',
      comingSoon: true
    },
    { 
      name: 'META', 
      displayName: 'Facebook & Instagram', 
      description: 'Publish reels, carousels, and manage Meta Ads campaign sync.',
      icon: 'M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z', 
      color: '#1877F2',
      comingSoon: true
    }
  ];

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 font-sans animate-fade-in space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-[#6c48ff] text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>App Integrations</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Channel Integrations
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Connect your social channels to enable automated AI publishing and real-time sync.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div 
            key={integration.name} 
            className="relative rounded-2xl p-7 flex flex-col justify-between bg-gray-50/70 border border-gray-100 transition-all duration-300 opacity-90"
          >
            {/* Coming Soon Badge */}
            <div className="absolute top-5 right-5 z-10">
              <div className="bg-[#6c48ff] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                Coming Soon
              </div>
            </div>

            <div>
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border bg-white border-gray-100 shadow-sm">
                <svg className="w-7 h-7" fill={integration.color} viewBox="0 0 24 24">
                  <path d={integration.icon} />
                </svg>
              </div>
              
              <h3 className="font-bold text-gray-900 mb-1.5 text-base font-['Space_Grotesk']">
                {integration.displayName}
              </h3>
              <p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed min-h-[36px]">
                {integration.description}
              </p>
            </div>

            {/* Lock Button */}
            <div className="pt-2">
              <button 
                disabled 
                className="w-full py-3 px-4 rounded-2xl bg-gray-100 text-gray-400 font-bold text-xs cursor-not-allowed border border-gray-200 flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                <span>Feature Locked • Coming Soon</span>
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
