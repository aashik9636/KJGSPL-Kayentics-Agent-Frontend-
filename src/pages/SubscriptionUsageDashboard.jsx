import React, { useEffect, useState } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { aiUsageService } from '../services/aiUsageService';
import { useWorkspaceStore } from '../store/workspaceStore';
import { 
  Zap, Database, Users, Bot, Image as ImageIcon, 
  ShieldAlert, PlusCircle, Clock, Coins, BarChart3, 
  Layers, Cpu, Sparkles, Activity, TrendingUp, RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function SubscriptionUsageDashboard() {
  const { organizationId, currentWorkspace } = useWorkspaceStore();
  const workspaceId = currentWorkspace?.id || '';

  const [activeTab, setActiveTab] = useState('subscription'); // 'subscription' | 'ai-credits'

  // Subscription state
  const [subData, setSubData] = useState(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [topUpLoading, setTopUpLoading] = useState(false);

  // AI Usage state
  const [aiSummary, setAiSummary] = useState(null);
  const [aiDailyLogs, setAiDailyLogs] = useState([]);
  const [aiCostReport, setAiCostReport] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (organizationId) {
      fetchSubscription();
    }
  }, [organizationId]);

  useEffect(() => {
    if (organizationId && activeTab === 'ai-credits') {
      fetchAiUsage();
    }
  }, [organizationId, workspaceId, activeTab]);

  const fetchSubscription = async () => {
    setLoadingSub(true);
    try {
      const res = await subscriptionService.getOrganizationSubscription(organizationId);
      setSubData(res);
    } catch (err) {
      console.error('Failed to load subscription status:', err);
      toast.error('Failed to load active subscription.');
    } finally {
      setLoadingSub(false);
    }
  };

  const fetchAiUsage = async () => {
    setLoadingAi(true);
    try {
      const [summaryRes, dailyRes, costRes] = await Promise.allSettled([
        aiUsageService.getDashboardSummary(organizationId, workspaceId),
        aiUsageService.getDailyUsage(organizationId, workspaceId),
        aiUsageService.getCostReport(organizationId, workspaceId),
      ]);

      if (summaryRes.status === 'fulfilled') setAiSummary(summaryRes.value);
      if (dailyRes.status === 'fulfilled') setAiDailyLogs(dailyRes.value || []);
      if (costRes.status === 'fulfilled') setAiCostReport(costRes.value);
    } catch (err) {
      console.error('Failed to load AI usage analytics:', err);
      toast.error('Failed to load AI usage data.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleTopUp = async () => {
    if (!organizationId) return;
    setTopUpLoading(true);
    try {
      await subscriptionService.purchaseAddOn(organizationId, 'ADDITIONAL_1000_TASKS', 1);
      toast.success('Added 1,000 Tasks Top-Up!');
      fetchSubscription();
    } catch (err) {
      toast.error('Top-Up failed.');
    } finally {
      setTopUpLoading(false);
    }
  };

  const { subscription, usageMeter } = subData || {};
  const plan = subscription?.plan;

  const getEntitlementLimit = (key, defaultVal = 100) => {
    if (!plan?.entitlements) return defaultVal;
    const ent = plan.entitlements.find((e) => e.key === key);
    if (!ent) return defaultVal;
    if (ent.value === 'Custom' || ent.value === 'Unlimited') return 999999;
    const parsed = parseFloat(ent.value);
    return isNaN(parsed) ? defaultVal : parsed;
  };

  let addOnTaskBonus = 0;
  if (subscription?.addOns) {
    subscription.addOns.forEach((o) => {
      if (o.status === 'ACTIVE' && o.addOn?.code === 'ADDITIONAL_1000_TASKS') {
        addOnTaskBonus += 1000 * (o.quantity || 1);
      }
    });
  }

  const tasksLimit = getEntitlementLimit('tasks_per_month', 300) + addOnTaskBonus;
  const usersLimit = getEntitlementLimit('users', 2);
  const agentsLimit = getEntitlementLimit('active_agents', 4);
  const storageLimit = getEntitlementLimit('knowledge_storage_gb', 1);
  const imagesLimit = getEntitlementLimit('images_per_month', 20);

  const calculatePercent = (used, limit) => {
    if (!limit || limit === 999999) return 10;
    return Math.min(100, Math.round((used / limit) * 100));
  };

  const tasksPercent = calculatePercent(usageMeter?.tasksUsed || 0, tasksLimit);

  const formatTokens = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString();
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 animate-fade-in space-y-8">
      {/* Quota Warning / Exceeded Alert Banner */}
      {tasksPercent >= 90 && activeTab === 'subscription' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-red-900 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm">{tasksPercent >= 100 ? 'Task Limit Reached' : 'Low Task Balance'}</div>
              <div className="text-xs text-red-700">
                {tasksPercent >= 100
                  ? 'You have used 100% of your task credits. Top up to continue executing agent tasks.'
                  : `You have used ${tasksPercent}% of your monthly task credits.`}
              </div>
            </div>
          </div>
          <button
            onClick={handleTopUp}
            disabled={topUpLoading}
            className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl text-xs hover:bg-red-700 transition shadow-sm whitespace-nowrap"
          >
            {topUpLoading ? 'Processing...' : 'Top Up +1,000 Tasks'}
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Subscription & AI Credits</h1>
          <p className="text-gray-500 text-xs mt-1">Monitor plan entitlements, top-ups, and live AI model token consumption.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200/60 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'subscription'
                ? 'bg-white text-[#6c48ff] shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Subscription & Quotas</span>
          </button>
          <button
            onClick={() => setActiveTab('ai-credits')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ai-credits'
                ? 'bg-white text-[#6c48ff] shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>AI Credits & Token Analytics</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SUBSCRIPTION & QUOTAS */}
      {activeTab === 'subscription' && (
        <>
          {loadingSub ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6c48ff]"></div>
            </div>
          ) : (
            <>
              {/* Active Subscription Overview Card */}
              <div className="bg-gradient-to-r from-purple-50/80 via-indigo-50/50 to-blue-50/60 border border-indigo-100/80 rounded-2xl p-6 sm:p-7 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Active Plan</div>
                    <div className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                      <span>{plan?.name || 'Starter Plan'}</span>
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                        {subscription?.status || 'ACTIVE'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Region & Currency</div>
                    <div className="text-xs font-bold text-gray-800 mt-1">
                      {subscription?.region === 'INDIA_INR' ? '🇮🇳 India (INR ₹)' : '🌐 Global (USD $)'}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Billing Cycle</div>
                    <div className="text-xs font-bold text-gray-800 capitalize mt-1">
                      {subscription?.billingCycle?.toLowerCase() || 'monthly'}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Period End Date</div>
                    <div className="text-xs font-bold text-[#6c48ff] flex items-center gap-1 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Meter Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Task Balance Meter */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-purple-50 text-[#6c48ff]">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-xs">Monthly AI Tasks</h3>
                        <p className="text-[10px] text-gray-400">Resets monthly</p>
                      </div>
                    </div>
                    <button
                      onClick={handleTopUp}
                      disabled={topUpLoading}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#6c48ff] text-white hover:bg-[#5b3adb] transition flex items-center gap-1"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>Top Up</span>
                    </button>
                  </div>

                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-gray-500">Used: <strong className="text-gray-900">{usageMeter?.tasksUsed || 0}</strong></span>
                    <span className="text-gray-500">Limit: <strong className="text-gray-900">{tasksLimit === 999999 ? 'Unlimited' : tasksLimit}</strong></span>
                  </div>

                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        tasksPercent > 80 ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-[#6c48ff]'
                      }`}
                      style={{ width: `${tasksPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Active Agents Meter */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-xs">Active AI Agents</h3>
                        <p className="text-[10px] text-gray-400">Deployed agents</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-gray-500">Active: <strong className="text-gray-900">{usageMeter?.activeAgents || 0}</strong></span>
                    <span className="text-gray-500">Limit: <strong className="text-gray-900">{agentsLimit === 999999 ? 'Unlimited' : agentsLimit}</strong></span>
                  </div>

                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${calculatePercent(usageMeter?.activeAgents || 0, agentsLimit)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Team Seats */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-xs">Team Members</h3>
                        <p className="text-[10px] text-gray-400">Active seats</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-gray-500">Users: <strong className="text-gray-900">{usageMeter?.activeUsers || 0}</strong></span>
                    <span className="text-gray-500">Limit: <strong className="text-gray-900">{usersLimit === 999999 ? 'Unlimited' : usersLimit}</strong></span>
                  </div>

                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${calculatePercent(usageMeter?.activeUsers || 0, usersLimit)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Knowledge Storage */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-xs">Knowledge Storage</h3>
                        <p className="text-[10px] text-gray-400">Vector store space</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-gray-500">Used: <strong className="text-gray-900">{(Number(usageMeter?.knowledgeStorageBytes || 0) / (1024 * 1024 * 1024)).toFixed(2)} GB</strong></span>
                    <span className="text-gray-500">Limit: <strong className="text-gray-900">{storageLimit} GB</strong></span>
                  </div>

                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: '15%' }}></div>
                  </div>
                </div>

                {/* Image Generations */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-pink-50 text-pink-600">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-xs">Image Generations</h3>
                        <p className="text-[10px] text-gray-400">Monthly images</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-gray-500">Generated: <strong className="text-gray-900">{usageMeter?.imagesUsed || 0}</strong></span>
                    <span className="text-gray-500">Limit: <strong className="text-gray-900">{imagesLimit}</strong></span>
                  </div>

                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pink-500 rounded-full transition-all duration-500"
                      style={{ width: `${calculatePercent(usageMeter?.imagesUsed || 0, imagesLimit)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* TAB 2: AI CREDITS & TOKEN ANALYTICS */}
      {activeTab === 'ai-credits' && (
        <>
          {loadingAi ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6c48ff]"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Summary Refresh Bar */}
              <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-50 text-[#6c48ff]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">LLM Token Consumption Summary</h2>
                    <p className="text-xs text-gray-400">Real-time metrics calculated across all connected AI models and agents.</p>
                  </div>
                </div>

                <button
                  onClick={fetchAiUsage}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6c48ff] hover:bg-purple-50 px-3 py-1.5 rounded-xl transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Data</span>
                </button>
              </div>

              {/* High-Level Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {/* Total Tokens */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Tokens</span>
                    <div className="p-1.5 rounded-lg bg-purple-50 text-[#6c48ff]">
                      <Cpu className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900">
                    {formatTokens(aiSummary?.totalTokens || 0)}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-2">
                    <span>In: {formatTokens(aiSummary?.inputTokens || 0)}</span>
                    <span>•</span>
                    <span>Out: {formatTokens(aiSummary?.outputTokens || 0)}</span>
                  </div>
                </div>

                {/* Total Cost */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Est. AI Cost</span>
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                      <Coins className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900">
                    ${(aiSummary?.totalCost || 0).toFixed(4)}
                  </div>
                  <p className="text-[11px] text-emerald-600 font-bold mt-1">
                    API usage rate
                  </p>
                </div>

                {/* Total AI Requests */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">AI Executions</span>
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900">
                    {(aiSummary?.totalRequests || 0).toLocaleString()}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Total API calls</p>
                </div>

                {/* Avg Latency */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Avg Latency</span>
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                      <Activity className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900">
                    {aiSummary?.avgLatency || 0} ms
                  </div>
                  <p className="text-[11px] text-indigo-600 font-bold mt-1">Response speed</p>
                </div>
              </div>

              {/* Breakdown Grid: By LLM Model & By AI Agent */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Consumption by Model */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#6c48ff]" />
                      <span>Consumption by AI Model</span>
                    </h3>
                    <span className="text-[11px] text-gray-400 font-medium">Model Breakdown</span>
                  </div>

                  {aiCostReport?.byModel?.length > 0 ? (
                    <div className="space-y-4 pt-2">
                      {aiCostReport.byModel.map((item, idx) => {
                        const totalCostSum = aiSummary?.totalCost || 1;
                        const pct = Math.min(100, Math.round((item.cost / totalCostSum) * 100));
                        return (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-gray-800 font-mono">{item.model}</span>
                              <span className="text-gray-900">${item.cost.toFixed(4)} <span className="text-gray-400 font-normal">({formatTokens(item.totalTokens)} tokens)</span></span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#6c48ff] rounded-full transition-all duration-500" style={{ width: `${pct || 15}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
                      No model execution data recorded yet.
                    </div>
                  )}
                </div>

                {/* Consumption by Agent */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <Bot className="w-4 h-4 text-indigo-600" />
                      <span>Consumption by AI Agent</span>
                    </h3>
                    <span className="text-[11px] text-gray-400 font-medium">Agent Breakdown</span>
                  </div>

                  {aiCostReport?.byAgent?.length > 0 ? (
                    <div className="space-y-4 pt-2">
                      {aiCostReport.byAgent.map((item, idx) => {
                        const totalCostSum = aiSummary?.totalCost || 1;
                        const pct = Math.min(100, Math.round((item.cost / totalCostSum) * 100));
                        return (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-gray-800">{item.agentName || item.agentId || 'Main AI Agent'}</span>
                              <span className="text-gray-900">${item.cost.toFixed(4)} <span className="text-gray-400 font-normal">({item.count} calls)</span></span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${pct || 20}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
                      No agent execution data recorded yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Daily Log Table */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span>Daily AI Token Activity Log</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Historical breakdown of daily requests and token volume.</p>
                  </div>
                </div>

                {aiDailyLogs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">AI Calls</th>
                          <th className="py-3 px-4">Input Tokens</th>
                          <th className="py-3 px-4">Output Tokens</th>
                          <th className="py-3 px-4">Total Tokens</th>
                          <th className="py-3 px-4 text-right">Cost (USD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {aiDailyLogs.map((log, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-3 px-4 font-bold text-gray-900">{log.date}</td>
                            <td className="py-3 px-4 font-medium text-gray-700">{log.count}</td>
                            <td className="py-3 px-4 text-gray-600">{log.inputTokens.toLocaleString()}</td>
                            <td className="py-3 px-4 text-gray-600">{log.outputTokens.toLocaleString()}</td>
                            <td className="py-3 px-4 font-bold text-gray-900">{log.totalTokens.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                              ${log.cost.toFixed(4)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10 text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
                    No daily token logs available for this workspace yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
