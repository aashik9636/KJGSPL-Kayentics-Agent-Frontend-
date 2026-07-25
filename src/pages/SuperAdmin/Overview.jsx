import React, { useEffect, useState } from 'react';
import { superAdminService } from '../../services/superAdminService';
import {
  Building2, Users, CreditCard, Cpu, TrendingUp, Sparkles,
  RefreshCw, ArrowUpRight, DollarSign, Activity, Layers, Shield
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function SuperAdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await superAdminService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load platform stats:', err);
      toast.error('Failed to load platform statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  const { overview, organizationBreakdown, aiMetrics } = stats || {};

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-gray-800 shadow-xl">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Platform Command Center <Sparkles className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Real-time SaaS financial performance, organization usage, and AI model consumption metrics.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-amber-400 border border-gray-700 text-sm font-semibold transition-all self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Stats
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* MRR Card */}
        <div className="p-5 rounded-2xl bg-gray-900/90 border border-gray-800 hover:border-amber-500/30 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Monthly Recurring Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-3">${overview?.mrr?.toLocaleString() || 0}</p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>ARR: ${overview?.arr?.toLocaleString() || 0}</span>
          </div>
        </div>

        {/* Organizations Card */}
        <div className="p-5 rounded-2xl bg-gray-900/90 border border-gray-800 hover:border-amber-500/30 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Tenants</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-3">{overview?.totalOrganizations || 0}</p>
          <p className="text-xs text-gray-400 mt-2 font-medium">
            <span className="text-emerald-400 font-semibold">{overview?.activeOrganizations || 0} Active</span> tenants
          </p>
        </div>

        {/* Users Card */}
        <div className="p-5 rounded-2xl bg-gray-900/90 border border-gray-800 hover:border-amber-500/30 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Users</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-3">{overview?.totalUsers || 0}</p>
          <p className="text-xs text-gray-400 mt-2 font-medium">
            <span className="text-purple-400 font-semibold">{overview?.activeUsers || 0} Active</span> accounts
          </p>
        </div>

        {/* AI Tokens Card */}
        <div className="p-5 rounded-2xl bg-gray-900/90 border border-gray-800 hover:border-amber-500/30 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AI Tokens Consumed</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-3">
            {((aiMetrics?.totalTokens || 0) / 1_000_000).toFixed(2)}M
          </p>
          <p className="text-xs text-amber-400 mt-2 font-medium">
            Est. Cost: ${aiMetrics?.totalEstimatedCost || 0}
          </p>
        </div>
      </div>

      {/* Subscription Breakdown & AI Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Tier Distribution */}
        <div className="p-6 rounded-2xl bg-gray-900/90 border border-gray-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" /> Subscription Plan Distribution
            </h3>
          </div>

          <div className="space-y-4">
            {['STARTER', 'TEAM', 'BUSINESS', 'ENTERPRISE'].map((plan) => {
              const count = organizationBreakdown?.[plan] || 0;
              const pct = overview?.totalOrganizations ? Math.round((count / overview.totalOrganizations) * 100) : 0;
              return (
                <div key={plan} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-300">{plan}</span>
                    <span className="text-amber-400">{count} tenants ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Consumption Summary */}
        <div className="p-6 rounded-2xl bg-gray-900/90 border border-gray-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" /> AI Execution Summary
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gray-800/60 border border-gray-700/50">
              <p className="text-xs text-gray-400">Total Executions</p>
              <p className="text-2xl font-bold text-white mt-1">{aiMetrics?.totalExecutions || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-800/60 border border-gray-700/50">
              <p className="text-xs text-gray-400">Input Tokens</p>
              <p className="text-2xl font-bold text-white mt-1">{((aiMetrics?.inputTokens || 0) / 1000).toFixed(1)}k</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-800/60 border border-gray-700/50">
              <p className="text-xs text-gray-400">Output Tokens</p>
              <p className="text-2xl font-bold text-white mt-1">{((aiMetrics?.outputTokens || 0) / 1000).toFixed(1)}k</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-800/60 border border-gray-700/50">
              <p className="text-xs text-gray-400">Total Workspaces</p>
              <p className="text-2xl font-bold text-white mt-1">{overview?.totalWorkspaces || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
