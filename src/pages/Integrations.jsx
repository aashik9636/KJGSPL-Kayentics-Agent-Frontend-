import React, { useState } from 'react';
import { integrationService } from '../services/integrationService';
import { toast } from 'react-toastify';

export default function Integrations() {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async (provider) => {
    setConnecting(true);
    try {
      await integrationService.connectIntegration({
        provider,
        accessToken: 'dummy_token',
        scopes: ['read', 'write']
      });
      toast.success(`${provider} connected successfully!`);
    } catch (err) {
      console.error(err);
    } finally {
      setConnecting(false);
    }
  };

  const integrations = [
    { name: 'LinkedIn', icon: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z', color: '#0077b5' },
    { name: 'Twitter / X', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z', color: '#000000' },
    { name: 'Facebook', icon: 'M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z', color: '#1877F2' }
  ];

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/60 p-8 lg:p-10 h-full w-full">
      <h1 className="text-[26px] font-bold text-[#1a1a1a] mb-2">Integrations</h1>
      <p className="text-[#666666] mb-10 font-medium text-[15px]">Connect your third-party tools to enable automated publishing and sync.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div key={integration.name} className="bg-[#fafbfc] rounded-[20px] p-8 border border-gray-100 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 rounded-[16px] bg-white shadow-sm flex items-center justify-center mb-5 border border-gray-50">
              <svg className="w-8 h-8" fill={integration.color} viewBox="0 0 24 24">
                <path d={integration.icon} />
              </svg>
            </div>
            <h3 className="font-bold text-[#1a1a1a] mb-2 text-[16px]">{integration.name}</h3>
            <p className="text-[13px] text-[#666666] mb-8 px-2 font-medium">Connect to sync campaigns and publish content directly.</p>
            <button 
              onClick={() => handleConnect(integration.name)}
              disabled={connecting}
              className="w-full bg-white border border-gray-200 text-[#1a1a1a] font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-[14px]"
            >
              {connecting ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
