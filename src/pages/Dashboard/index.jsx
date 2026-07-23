import React, { useEffect, useRef, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import gsap from 'gsap';
import { dashboardService } from '../../services/dashboardService';

export default function Dashboard() {
  const dashboardRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summary, costReport, usageDashboard] = await Promise.all([
          dashboardService.getDashboardSummary(),
          dashboardService.getCostReports().catch(() => null),
          dashboardService.getUsageDashboard().catch(() => null),
        ]);

        const s = summary || {};
        const counts = s.counts || {};
        const aiUsage = s.aiUsage || {};
        const credits = s.credits || {};
        const topAgents = s.topAgents || [];
        const usageGraph = s.usageGraph || [];
        const activities = s.recentActivities || [];
        const costData = costReport || {};
        const usageDash = usageDashboard || {};

        setMetrics({
          activeAgents: { value: topAgents.length || counts.users || 0, trend: '', isPositive: true },
          tasksCompleted: { value: aiUsage.totalRequests || usageDash.totalRequests || 0, trend: '', isPositive: true },
          tokensUsed: {
            value: (aiUsage.totalTokens || usageDash.totalTokens || 0) >= 1000000
              ? `${((aiUsage.totalTokens || usageDash.totalTokens || 0) / 1000000).toFixed(1)}M`
              : (aiUsage.totalTokens || usageDash.totalTokens || 0) >= 1000
                ? `${((aiUsage.totalTokens || usageDash.totalTokens || 0) / 1000).toFixed(1)}K`
                : String(aiUsage.totalTokens || usageDash.totalTokens || 0),
            trend: '',
            isPositive: true,
          },
          successRate: {
            value: credits.total ? `${((1 - (credits.consumed || 0) / credits.total) * 100).toFixed(1)}%` : '—',
            trend: '',
            isPositive: true,
          },
        });

        setChartData({
          agentStatus: topAgents.length
            ? topAgents.map(a => ({ name: a.agentName || 'Agent', value: a.count }))
            : [{ name: 'No data', value: 1 }],
          taskExecution: usageGraph.length
            ? usageGraph.map(d => ({
                name: new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' }),
                Success: d.tokens || 0,
                Failed: 0,
              }))
            : [],
          tokenConsumption: usageGraph.length
            ? usageGraph.map(d => ({
                name: new Date(d.date).toLocaleDateString(undefined, { month: 'short' }),
                value: d.tokens || 0,
              }))
            : [],
        });

        setRecentLogs(
          activities.map((a, i) => ({
            id: a.id || i,
            name: a.actor?.email?.split('@')[0] || 'System',
            action: a.summary || a.action,
            status: 'Completed',
            statusColor: 'bg-emerald-500',
          }))
        );
      } catch {
        setMetrics({
          activeAgents: { value: 0, trend: '', isPositive: true },
          tasksCompleted: { value: 0, trend: '', isPositive: true },
          tokensUsed: { value: '0', trend: '', isPositive: true },
          successRate: { value: '—', trend: '', isPositive: true },
        });
        setChartData({
          agentStatus: [{ name: 'No data', value: 1 }],
          taskExecution: [],
          tokenConsumption: [],
        });
        setRecentLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Run entrance animation once data is loaded
  useEffect(() => {
    if (!loading && dashboardRef.current) {
      gsap.fromTo(dashboardRef.current.querySelectorAll('.stagger-card'),
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out', delay: 0.1 }
      );
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6c48ff]"></div>
      </div>
    );
  }

  return (
    <div ref={dashboardRef} className="w-full h-full pb-10">
      
      {/* Top Row: Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        
        <div className="stagger-card bg-white rounded-3xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-center">
          <span className="text-[13px] font-semibold text-gray-500 mb-1">Active Agents</span>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-gray-900">{metrics.activeAgents.value}</h3>
            <div className="flex items-center gap-1 pb-1">
              <svg className={`w-4 h-4 ${metrics.activeAgents.isPositive ? 'text-emerald-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={metrics.activeAgents.isPositive ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
              </svg>
              <span className={`text-[13px] font-bold ${metrics.activeAgents.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>{metrics.activeAgents.trend}</span>
            </div>
          </div>
        </div>

        <div className="stagger-card bg-white rounded-3xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-center">
          <span className="text-[13px] font-semibold text-gray-500 mb-1">Tasks Completed</span>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-gray-900">{metrics.tasksCompleted.value}</h3>
            <div className="flex items-center gap-1 pb-1">
              <svg className={`w-4 h-4 ${metrics.tasksCompleted.isPositive ? 'text-emerald-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={metrics.tasksCompleted.isPositive ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
              </svg>
              <span className={`text-[13px] font-bold ${metrics.tasksCompleted.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>{metrics.tasksCompleted.trend}</span>
            </div>
          </div>
        </div>

        <div className="stagger-card bg-white rounded-3xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-center">
          <span className="text-[13px] font-semibold text-gray-500 mb-1">Tokens Used</span>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-gray-900">{metrics.tokensUsed.value}</h3>
            <div className="flex items-center gap-1 pb-1">
              <svg className={`w-4 h-4 ${metrics.tokensUsed.isPositive ? 'text-emerald-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={metrics.tokensUsed.isPositive ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
              </svg>
              <span className={`text-[13px] font-bold ${metrics.tokensUsed.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>{metrics.tokensUsed.trend}</span>
            </div>
          </div>
        </div>

        <div className="stagger-card bg-white rounded-3xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-center">
          <span className="text-[13px] font-semibold text-gray-500 mb-1">Success Rate</span>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-gray-900">{metrics.successRate.value}</h3>
            <div className="flex items-center gap-1 pb-1">
              <svg className={`w-4 h-4 ${metrics.successRate.isPositive ? 'text-emerald-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={metrics.successRate.isPositive ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
              </svg>
              <span className={`text-[13px] font-bold ${metrics.successRate.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>{metrics.successRate.trend}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        
        {/* Working Format -> Agent Status */}
        <div className="stagger-card bg-white rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col items-center">
          <h3 className="text-[16px] font-bold text-gray-900 self-start mb-2">Agent Status</h3>
          <div className="w-40 h-40 relative my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData.agentStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={70} stroke="none" startAngle={90} endAngle={-270}>
                  <Cell fill="#e0d4ff" /> {/* Active */}
                  <Cell fill="#3b00ff" /> {/* Idle */}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] text-gray-400 font-medium">Total</span>
              <span className="text-[20px] font-bold text-gray-900">12</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 mt-2 w-full">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#e0d4ff]"></div>
              <span className="text-[11px] text-gray-500 font-medium">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#3b00ff]"></div>
              <span className="text-[11px] text-gray-500 font-medium">Idle</span>
            </div>
          </div>
        </div>

        {/* Project Employment -> Task Execution */}
        <div className="stagger-card lg:col-span-2 bg-white rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[16px] font-bold text-gray-900">Task Execution</h3>
            <select className="text-[12px] bg-transparent text-gray-500 font-medium outline-none cursor-pointer">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="flex-1 min-h-[160px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.taskExecution} margin={{ top: 0, right: 0, left: -25, bottom: 0 }} barGap={6}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                <Bar dataKey="Success" fill="#ff7f50" radius={[10, 10, 10, 10]} barSize={10} />
                <Bar dataKey="Failed" fill="#ffccb3" radius={[10, 10, 10, 10]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-8 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#ff7f50]"></div>
              <span className="text-[11px] text-gray-500 font-medium">Success</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#ffccb3]"></div>
              <span className="text-[11px] text-gray-500 font-medium">Failed</span>
            </div>
          </div>
        </div>

        {/* Requests -> Recent Alerts */}
        <div className="stagger-card bg-white rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col">
          <h3 className="text-[16px] font-bold text-gray-900 mb-6">Recent Alerts</h3>
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center text-[13px]">
              <div className="flex items-center gap-3 text-gray-500 font-medium">
                <svg className="w-[18px] h-[18px] opacity-60" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                API Rate Limit
              </div>
              <span className="font-bold text-red-500">2</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <div className="flex items-center gap-3 text-gray-500 font-medium">
                <svg className="w-[18px] h-[18px] opacity-60" fill="currentColor" viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.36 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
                Sync Completed
              </div>
              <span className="font-bold text-emerald-500">14</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <div className="flex items-center gap-3 text-gray-500 font-medium">
                <svg className="w-[18px] h-[18px] opacity-60" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                New Integrations
              </div>
              <span className="font-bold text-gray-900">3</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <div className="flex items-center gap-3 text-gray-500 font-medium">
                <svg className="w-[18px] h-[18px] opacity-60" fill="currentColor" viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>
                Billing Issue
              </div>
              <span className="font-bold text-gray-900">1</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        
        {/* Staff Turnover -> Token Consumption */}
        <div className="stagger-card bg-white rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[16px] font-bold text-gray-900">Token Consumption (M)</h3>
            <select className="text-[12px] bg-transparent text-gray-500 font-medium outline-none cursor-pointer">
              <option>Mar-Nov, 2023</option>
              <option>Mar-Nov, 2024</option>
            </select>
          </div>
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.tokenConsumption} margin={{ top: 0, right: 0, left: -25, bottom: 0 }} barSize={12}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                {/* Background bars to simulate the light gray track */}
                <Bar dataKey="value" fill="#f3f4f6" radius={[10, 10, 10, 10]} />
              </BarChart>
            </ResponsiveContainer>
            
            {/* We overlay the real bars to get the exact pill-in-track look */}
            <div className="absolute inset-0 pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.tokenConsumption} margin={{ top: 0, right: 0, left: -25, bottom: 0 }} barSize={12}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Bar dataKey="value" fill="#6c48ff" radius={[10, 10, 10, 10]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recruitment Progress -> Recent Activity */}
        <div className="stagger-card bg-white rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[16px] font-bold text-gray-900">Recent Agent Activity</h3>
            <button className="text-[13px] font-bold text-[#6c48ff] flex items-center gap-1 hover:underline">
              View logs
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
          
          <div className="flex-1">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[11px] text-gray-400 font-semibold border-b border-gray-100">
                  <th className="pb-3 font-medium">Agent</th>
                  <th className="pb-3 font-medium">Last Action</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {recentLogs.map(log => (
                  <tr key={log.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3.5 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${log.statusColor} flex items-center justify-center text-white font-bold text-[11px]`}>
                        {log.agent ? log.agent.substring(0, 2) : log.name?.substring(0, 2)}
                      </div>
                      <span className="font-semibold text-gray-900">{log.agent || log.name}</span>
                    </td>
                    <td className="py-3.5 text-gray-600 font-medium truncate max-w-[150px]">{log.action}</td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${log.statusColor}`}></div>
                        <span className="font-semibold text-gray-900">{log.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
