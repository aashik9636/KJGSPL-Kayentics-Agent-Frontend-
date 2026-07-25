import React, { useEffect, useState } from 'react';
import { superAdminService } from '../../services/superAdminService';
import { promptAdminService } from '../../services/promptAdminService';
import { Cpu, RefreshCw, Layers, DollarSign, Activity, FileText, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AiGovernance() {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'prompts'

  // AI Usage Analytics state
  const [aiData, setAiData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Prompt Admin state
  const [catalog, setCatalog] = useState([]);
  const [promptVersions, setPromptVersions] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [selectedPromptKey, setSelectedPromptKey] = useState('');
  const [loadingPrompts, setLoadingPrompts] = useState(false);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAiUsage();
    } else {
      fetchAgentCatalog();
    }
  }, [activeTab]);

  const fetchAiUsage = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await superAdminService.getAiUsage();
      setAiData(res);
    } catch (err) {
      console.error('Failed to load AI usage analytics:', err);
      toast.error('Failed to load AI usage analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchAgentCatalog = async () => {
    setLoadingPrompts(true);
    try {
      const res = await promptAdminService.getAgentCatalog();
      setCatalog(res?.agents || res || []);
    } catch (err) {
      console.error('Failed to load agent catalog from Python service:', err);
      toast.error('Failed to load Python agent prompt catalog');
    } finally {
      setLoadingPrompts(false);
    }
  };

  const handleFetchVersions = async (agentId, promptKey) => {
    setSelectedAgentId(agentId);
    setSelectedPromptKey(promptKey);
    try {
      const versions = await promptAdminService.listPromptVersions(agentId, promptKey);
      setPromptVersions(versions || []);
    } catch (err) {
      toast.error('Failed to fetch prompt versions');
    }
  };

  const handleActivateVersion = async (agentId, promptKey, version) => {
    try {
      await promptAdminService.activatePromptVersion(agentId, promptKey, version);
      toast.success(`Prompt version ${version} activated!`);
      handleFetchVersions(agentId, promptKey);
    } catch (err) {
      toast.error('Failed to activate prompt version');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-6 h-6 text-amber-400" /> AI Governance & Prompt Version Control
        </h2>
        <p className="text-sm text-gray-400">Monitor platform-wide LLM token usage costs and manage versioned sub-agent prompt deployments.</p>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'analytics' ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/10' : 'text-gray-400 hover:text-white bg-gray-900'
          }`}
        >
          <Activity className="w-4 h-4" /> Global Token Usage & Costs
        </button>
        <button
          onClick={() => setActiveTab('prompts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'prompts' ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/10' : 'text-gray-400 hover:text-white bg-gray-900'
          }`}
        >
          <FileText className="w-4 h-4" /> Python Sub-Agent Prompt Catalog
        </button>
      </div>

      {/* TAB 1: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {loadingAnalytics ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
          ) : (
            <>
              {/* Aggregates Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {aiData?.modelAggregates?.slice(0, 3).map((agg, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{agg.provider}</span>
                    <h3 className="text-xl font-bold text-white">{agg.model}</h3>
                    <div className="flex justify-between text-xs font-semibold text-gray-300 pt-2 border-t border-gray-800">
                      <span>Total Tokens: {((agg._sum?.totalTokens || 0) / 1000).toFixed(1)}k</span>
                      <span className="text-amber-400">${Math.round((agg._sum?.estimatedCost || 0) * 100) / 100}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Logs Table */}
              <div className="bg-gray-900/90 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-gray-800/60 text-xs uppercase text-gray-400 font-semibold border-b border-gray-800">
                    <tr>
                      <th className="px-6 py-4">Organization</th>
                      <th className="px-6 py-4">Model & Provider</th>
                      <th className="px-6 py-4">Input / Output Tokens</th>
                      <th className="px-6 py-4">Total Tokens</th>
                      <th className="px-6 py-4">Est. Cost</th>
                      <th className="px-6 py-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {aiData?.items?.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-800/40">
                        <td className="px-6 py-4 font-semibold text-white">{item.organization?.name || '—'}</td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-amber-400 font-bold">{item.model}</span>
                          <span className="text-xs text-gray-500 block">{item.provider}</span>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          In: {item.inputTokens} / Out: {item.outputTokens}
                        </td>
                        <td className="px-6 py-4 font-medium text-white">{item.totalTokens}</td>
                        <td className="px-6 py-4 font-bold text-emerald-400">${item.estimatedCost?.toFixed(4)}</td>
                        <td className="px-6 py-4 text-xs text-gray-400">{new Date(item.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: PROMPTS */}
      {activeTab === 'prompts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent Catalog List */}
          <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-gray-400">Agent Catalog</h3>
            {loadingPrompts ? (
              <RefreshCw className="w-6 h-6 text-amber-400 animate-spin mx-auto my-6" />
            ) : catalog.length === 0 ? (
              <p className="text-xs text-gray-500">No agents found in Python service.</p>
            ) : (
              <div className="space-y-2">
                {catalog.map((ag, idx) => {
                  const isSelected = selectedAgentId === ag.agent_id && selectedPromptKey === ag.prompt_key;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleFetchVersions(ag.agent_id, ag.prompt_key)}
                      className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-gray-800/60 border-gray-700/40 text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <div className="font-bold text-white">{ag.agent_name || ag.agent_id}</div>
                      <div className="font-mono text-gray-400 mt-1">Key: {ag.prompt_key}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Versions List */}
          <div className="lg:col-span-2 bg-gray-900/90 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-gray-400">
              Prompt Version History {selectedPromptKey && `(${selectedPromptKey})`}
            </h3>

            {!selectedAgentId ? (
              <p className="text-sm text-gray-500 py-12 text-center">Select an agent from the catalog to view prompt version history.</p>
            ) : promptVersions.length === 0 ? (
              <p className="text-sm text-gray-500 py-12 text-center">No prompt versions found.</p>
            ) : (
              <div className="space-y-4">
                {promptVersions.map((v, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-gray-800/60 border border-gray-700/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">Version {v.version}</span>
                        {v.is_active && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      {!v.is_active && (
                        <button
                          onClick={() => handleActivateVersion(selectedAgentId, selectedPromptKey, v.version)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs rounded-lg"
                        >
                          Activate Version
                        </button>
                      )}
                    </div>
                    <pre className="text-xs text-gray-300 font-mono bg-gray-950 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-48">
                      {v.prompt}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
