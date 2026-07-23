import React, { useState, useEffect } from 'react';
import { integrationService } from '../services/integrationService';
import { toast } from 'react-toastify';

export default function Integrations() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(null);

  const fetchIntegrations = async () => {
    try {
      const data = await integrationService.getIntegrations();
      setConnections(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleConnect = async (platform) => {
    setActionInProgress(platform);
    try {
      const response = await integrationService.connectIntegration(platform);
      if (response.oauthUrl) {
        // Normally we'd redirect to OAuth flow: window.location.href = response.oauthUrl;
        toast.success(`Redirecting to ${platform} authorization...`);
        // Mocking a successful connection for now since we don't have the real OAuth backend
        setTimeout(() => fetchIntegrations(), 1000);
      } else {
        toast.success(`${platform} connected successfully!`);
        fetchIntegrations();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Connection failed');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDisconnect = async (id, platform) => {
    setActionInProgress(platform);
    try {
      await integrationService.disconnectIntegration(id);
      toast.success(`${platform} disconnected`);
      fetchIntegrations();
    } catch (err) {
      toast.error('Failed to disconnect');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRefresh = async (id, platform) => {
    setActionInProgress(`refresh-${platform}`);
    try {
      await integrationService.refreshIntegration(id, {});
      toast.success(`${platform} tokens refreshed`);
      fetchIntegrations();
    } catch (err) {
      toast.error('Failed to refresh tokens');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleHealthCheck = async (id, platform) => {
    setActionInProgress(`health-${platform}`);
    try {
      const result = await integrationService.checkHealth(id);
      const healthy = result?.healthy ?? result?.data?.healthy;
      if (healthy) {
        toast.success(`${platform} connection is healthy`);
      } else {
        toast.warning(`${platform} connection may need attention`);
      }
    } catch (err) {
      toast.error('Health check failed');
    } finally {
      setActionInProgress(null);
    }
  };

  const integrations = [
    { name: 'LINKEDIN', displayName: 'LinkedIn', icon: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z', color: '#0077b5' },
    { name: 'TWITTER', displayName: 'Twitter / X', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z', color: '#000000' },
    { name: 'META', displayName: 'Facebook & Instagram', icon: 'M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z', color: '#1877F2' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <svg className="animate-spin w-10 h-10 text-[#1967d2]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 h-full animate-fade-in">
      
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Integrations</h1>
        <p className="text-gray-500 text-sm mt-1">Connect your social media accounts to enable automated publishing and sync.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => {
          // Check if this integration is connected
          const connectionInfo = connections.find(c => c.platform === integration.name);
          const isConnected = !!connectionInfo;
          const isProcessing = actionInProgress === integration.name;

          return (
            <div key={integration.name} className="bg-white rounded-3xl p-8 border border-gray-100 flex flex-col items-center text-center shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-md transition-all relative overflow-hidden group">
              
              {isConnected && (
                <div className="absolute top-4 right-4 bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  Connected
                </div>
              )}

              <div className={`w-16 h-16 rounded-[16px] shadow-sm flex items-center justify-center mb-5 border transition-colors ${isConnected ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-100'}`}>
                <svg className="w-8 h-8" fill={integration.color} viewBox="0 0 24 24">
                  <path d={integration.icon} />
                </svg>
              </div>
              
              <h3 className="font-bold text-gray-900 mb-2 text-[16px]">{integration.displayName}</h3>
              <p className="text-[13px] text-gray-500 mb-8 px-2 font-medium">
                {isConnected 
                  ? `Authorized on ${new Date(connectionInfo.createdAt || Date.now()).toLocaleDateString()}` 
                  : 'Connect to sync campaigns and publish content directly.'}
              </p>
              
              {isConnected ? (
                <div className="w-full space-y-2">
                  <button 
                    onClick={() => handleRefresh(connectionInfo.id, integration.name)}
                    disabled={actionInProgress === `refresh-${integration.name}`}
                    className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-[13px] flex items-center justify-center gap-2"
                  >
                    {actionInProgress === `refresh-${integration.name}` ? 'Refreshing...' : 'Refresh Tokens'}
                  </button>
                  <button 
                    onClick={() => handleHealthCheck(connectionInfo.id, integration.name)}
                    disabled={actionInProgress === `health-${integration.name}`}
                    className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-[13px] flex items-center justify-center gap-2"
                  >
                    {actionInProgress === `health-${integration.name}` ? 'Checking...' : 'Health Check'}
                  </button>
                  <button 
                    onClick={() => handleDisconnect(connectionInfo.id, integration.name)}
                    disabled={actionInProgress === integration.name}
                    className="w-full bg-white border border-red-200 text-red-500 font-bold py-2.5 rounded-xl hover:bg-red-50 transition-colors shadow-sm text-[13px] flex items-center justify-center gap-2"
                  >
                    {actionInProgress === integration.name ? 'Disconnecting...' : 'Disconnect Account'}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => handleConnect(integration.name)}
                  disabled={isProcessing}
                  className="w-full bg-[#1967d2] hover:bg-[#1557b0] text-white font-bold py-3.5 rounded-xl transition-all shadow-sm hover:shadow text-[14px] flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  ) : (
                    `Connect ${integration.displayName}`
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
