import React, { useEffect, useRef, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, AreaChart, Area
} from 'recharts';
import gsap from 'gsap';
import { dashboardService } from '../../services/dashboardService';
import { Bot, Cpu, Zap, CreditCard, HardDrive, Clock, Activity, AlertCircle, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const dashboardRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [costBreakdown, setCostBreakdown] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryRes, costRes] = await Promise.all([
          dashboardService.getDashboardSummary().catch(() => null),
          dashboardService.getCostReports().catch(() => null),
        ]);

        const rawSummary = summaryRes?.data || summaryRes || {};
        const rawCost = costRes?.data || costRes || {};

        setMetrics({
          counts: rawSummary.counts || {},
          credits: rawSummary.credits || {},
          aiUsage: rawSummary.aiUsage || {},
          campaigns: rawSummary.campaigns || {},
          storage: rawSummary.storage || {},
          recentActivities: rawSummary.recentActivities || [],
          topAgents: rawSummary.topAgents || [],
          topUsers: rawSummary.topUsers || [],
          usageGraph: rawSummary.usageGraph || [],
        });

        setCostBreakdown(rawCost);
      } catch (err) {
        console.error('Failed to load dashboard summary:', err);
        setError('Unable to connect to live dashboard API.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Entrance animation
  useEffect(() => {
    if (!loading && dashboardRef.current) {
      gsap.fromTo(dashboardRef.current.querySelectorAll('.stagger-card'),
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="w-full h-[65vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#6c48ff] border-t-transparent"></div>
          <span className="text-xs font-semibold text-gray-500">Loading live analytics...</span>
        </div>
      </div>
    );
  }

  const counts = metrics?.counts || {};
  const credits = metrics?.credits || {};
  const aiUsage = metrics?.aiUsage || {};
  const storage = metrics?.storage || {};
  const topAgents = metrics?.topAgents || [];
  const usageGraph = metrics?.usageGraph || [];
  const activities = metrics?.recentActivities || [];
  const rawByModel = costBreakdown?.byModel || [];
  const parsedModelItems = Array.isArray(rawByModel)
    ? rawByModel.map(item => typeof item === 'object' && item !== null ? { name: item.model || item.name || 'Model', cost: Number(item.cost || 0) } : { name: String(item), cost: 0 })
    : Object.entries(rawByModel).map(([k, v]) => ({ name: k, cost: Number(v) || 0 }));
  const modelItems = parsedModelItems.length > 0 ? parsedModelItems : [
    { name: 'gpt-4.1-mini', cost: 0.00 },
    { name: 'claude-3-5-sonnet', cost: 0.00 }
  ];

  // Formatted Tokens
  const totalTokens = aiUsage.totalTokens || 0;
  const formattedTokens = totalTokens >= 1000000
    ? `${(totalTokens / 1000000).toFixed(2)}M`
    : totalTokens >= 1000
      ? `${(totalTokens / 1000).toFixed(1)}K`
      : String(totalTokens);

  // Formatted Storage Bytes
  const totalBytes = storage.totalBytes || 0;
  const formattedStorage = totalBytes >= 1073741824
    ? `${(totalBytes / 1073741824).toFixed(1)} GB`
    : totalBytes >= 1048576
      ? `${(totalBytes / 1048576).toFixed(1)} MB`
      : `${(totalBytes / 1024).toFixed(1)} KB`;

  // Chart data formatting
  const chartGraphData = usageGraph.map(g => ({
    date: g.date ? new Date(g.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '',
    tokens: Math.round((g.tokens || 0) / 1000), // in K tokens
    cost: parseFloat((g.cost || 0).toFixed(2))
  }));

  const pieAgentData = topAgents.map(a => ({
    name: a.agentName || 'Agent',
    value: a.count || 1
  }));

  return (
    <div ref={dashboardRef} className="w-full h-full pb-12 font-sans">
      
      {error && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => window.location.reload()} className="underline font-bold text-[#6c48ff]">Retry</button>
        </div>
      )}

      {/* ── Top Stat Cards Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        
        {/* Active Agents */}
        <div className="stagger-card bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold text-gray-500">Active Agents</span>
            <div className="p-2.5 bg-purple-50 text-[#6c48ff] rounded-xl">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-bold text-gray-900">{counts.agents || topAgents.length || 0}</h3>
            <span className="text-xs text-gray-400 font-medium">Registered AI</span>
          </div>
        </div>

        {/* Tasks Executed */}
        <div className="stagger-card bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold text-gray-500">Total Requests</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-bold text-gray-900">{(aiUsage.totalRequests || 0).toLocaleString()}</h3>
            <span className="text-xs text-gray-400 font-medium">Completed</span>
          </div>
        </div>

        {/* Tokens Consumed */}
        <div className="stagger-card bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold text-gray-500">Tokens Consumed</span>
            <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-bold text-gray-900">{formattedTokens}</h3>
            <span className="text-xs text-gray-400 font-medium">Total Usage</span>
          </div>
        </div>

        {/* Credits Remaining */}
        <div className="stagger-card bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold text-gray-500">Credits Balance</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <h3 className="text-3xl font-bold text-gray-900">
              {typeof credits.remaining === 'number' ? credits.remaining.toLocaleString() : '0'}
            </h3>
            {typeof credits.total === 'number' && (
              <span className="text-xs text-gray-400 font-medium whitespace-nowrap pb-0.5">
                of {credits.total.toLocaleString()} Credits
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Middle Row: Charts & Analytics ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
        
        {/* Daily Token & Cost Usage Over Time */}
        <div className="stagger-card lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-900">Daily Token & Cost Volume</h3>
              <p className="text-xs text-gray-400">Real-time daily AI activity over time</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6c48ff]" />
                <span className="text-gray-600">Tokens (k)</span>
              </div>
            </div>
          </div>

          <div className="h-[220px] w-full">
            {chartGraphData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartGraphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6c48ff" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#6c48ff" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', padding: '12px' }} 
                  />
                  <Area type="monotone" dataKey="tokens" stroke="#6c48ff" strokeWidth={3} fillOpacity={1} fill="url(#tokenGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs">
                <Activity className="w-8 h-8 stroke-1 text-gray-300 mb-2" />
                No usage volume recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* AI Model Cost Breakdown */}
        <div className="stagger-card bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">AI Model Breakdown</h3>
            <p className="text-xs text-gray-400 mb-4">Cost distribution by active LLMs</p>

            <div className="space-y-3">
              {modelItems.length > 0 ? (
                modelItems.map(({ name: modelName, cost: costVal }) => (
                  <div key={modelName} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-700 font-mono">{modelName}</span>
                      <span className="text-gray-900 font-bold">${costVal.toFixed(2)}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#6c48ff] to-[#a78bfa] rounded-full" 
                        style={{ width: `${Math.min(100, (costVal / (aiUsage.totalCost || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-gray-400">
                  No model cost data available.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">Total AI Cost</span>
            <span className="font-bold text-gray-900 text-sm">
              ${(aiUsage.totalCost || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Top Agents & Recent Logs ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        
        {/* Top Performing Agents */}
        <div className="stagger-card bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Top Performing Agents</h3>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
              {counts.agents || topAgents.length || 0} Agents
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            {topAgents.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                No active agent executions recorded yet.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-gray-400 font-semibold border-b border-gray-100">
                    <th className="pb-3 pl-2">Agent Name</th>
                    <th className="pb-3 text-center">Executions</th>
                    <th className="pb-3 pr-2 text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs font-medium">
                  {topAgents.map((agent) => (
                    <tr key={agent.agentId || agent.agentName} className="hover:bg-purple-50/20 transition">
                      <td className="py-3 pl-2 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-100 text-[#6c48ff] font-bold flex items-center justify-center text-xs">
                          {(agent.agentName || 'A')[0].toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-900">{agent.agentName || 'Agent'}</span>
                      </td>
                      <td className="py-3 text-center font-semibold text-gray-700">{agent.count || 0} runs</td>
                      <td className="py-3 pr-2 text-right font-bold text-gray-900">
                        ${typeof agent.cost === 'number' ? agent.cost.toFixed(2) : '0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="stagger-card bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Recent Activity</h3>
            <span className="text-xs text-gray-400">System Logs</span>
          </div>

          <div className="flex-1 overflow-x-auto">
            {activities.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                No recent activity logged.
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-start justify-between p-3 rounded-2xl bg-gray-50/60 border border-gray-100 hover:bg-gray-50 transition">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-[#6c48ff] font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                        {(act.actor?.email || 'S')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">
                          {act.summary || act.action}
                        </div>
                        <div className="text-[11px] text-gray-400 font-medium">
                          {act.actor?.email || 'System'}
                        </div>
                      </div>
                    </div>
                    {act.createdAt && (
                      <span className="text-[10px] text-gray-400 font-mono shrink-0">
                        {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
