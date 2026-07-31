import React, { useEffect, useState } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { aiUsageService } from '../services/aiUsageService';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Database, Users, Bot, Image as ImageIcon, 
  Search, BarChart2, Calendar, Sparkles, Activity, 
  TrendingUp, Cpu, ArrowRight
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function SubscriptionUsageDashboard() {
  const navigate = useNavigate();
  const { organizationId, currentWorkspace } = useWorkspaceStore();
  const workspaceId = currentWorkspace?.id || '';

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'ai-analytics'

  // Subscription state
  const [subData, setSubData] = useState(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [topUpLoading, setTopUpLoading] = useState(false);

  // AI Usage state
  const [aiSummary, setAiSummary] = useState(null);
  const [aiDailyLogs, setAiDailyLogs] = useState([]);
  const [aiCostReport, setAiCostReport] = useState(null);
  const [userTokenUsages, setUserTokenUsages] = useState([]);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (organizationId) {
      fetchSubscription();
    }
  }, [organizationId]);

  useEffect(() => {
    if (organizationId && activeTab === 'ai-analytics') {
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
    } finally {
      setLoadingSub(false);
    }
  };

  const fetchAiUsage = async () => {
    setLoadingAi(true);
    try {
      const [summaryRes, dailyRes, costRes, userTokensRes] = await Promise.allSettled([
        aiUsageService.getDashboardSummary(organizationId, workspaceId),
        aiUsageService.getDailyUsage(organizationId, workspaceId),
        aiUsageService.getCostReport(organizationId, workspaceId),
        aiUsageService.getUserTokenUsages(organizationId, workspaceId),
      ]);

      if (summaryRes.status === 'fulfilled') setAiSummary(summaryRes.value);
      if (dailyRes.status === 'fulfilled') setAiDailyLogs(dailyRes.value || []);
      if (costRes.status === 'fulfilled') setAiCostReport(costRes.value);
      if (userTokensRes.status === 'fulfilled') setUserTokenUsages(userTokensRes.value || []);
    } catch (err) {
      console.error('Failed to load AI usage analytics:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleTopUp = async () => {
    if (!organizationId) {
      toast.error('Please select an active organization.');
      return;
    }
    setTopUpLoading(true);
    try {
      const region = subData?.subscription?.region || 'INDIA_INR';
      const addOnCode = 'ADDITIONAL_1000_TASKS';
      const order = await subscriptionService.createAddOnRazorpayOrder(organizationId, addOnCode, 1, region);

      const scriptLoaded = await loadRazorpayScript();
      if (scriptLoaded && window.Razorpay && order?.keyId) {
        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'Kaynetics AI',
          description: `Top-Up 1,000 AI Task Credits`,
          ...(order?.razorpayOrderId ? { order_id: order.razorpayOrderId } : {}),
          handler: async (response) => {
            try {
              await subscriptionService.verifyAddOnRazorpayPayment(
                organizationId,
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature,
                addOnCode,
                1
              );
              toast.success('Payment verified! Added 1,000 Task Credits.');
              fetchSubscription();
            } catch (e) {
              toast.error('Payment verification failed.');
            }
          },
          theme: {
            color: '#4F46E5',
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.error('Payment gateway key is missing.');
      }
    } catch (err) {
      console.error('Top-up error:', err);
      toast.error(err.response?.data?.message || 'Failed to create top-up payment order.');
    } finally {
      setTopUpLoading(false);
    }
  };

  const subObj = subData?.data || subData || {};
  const { subscription, usageMeter, addOns } = subObj;
  const plan = subscription?.plan;

  const meterData = [
    { label: 'LLM Tokens', used: (usageMeter?.totalTokensUsed || usageMeter?.tokensUsed || 0).toLocaleString(), total: 'Plan Limit', unit: '', icon: <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />, color: 'bg-[#4F46E5]', bg: 'bg-indigo-50' },
    { label: 'Tasks', used: usageMeter?.tasksUsed || 0, total: usageMeter?.tasksLimit || 1000, unit: '', icon: <Zap className="w-3.5 h-3.5 text-indigo-600" />, color: 'bg-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Images', used: usageMeter?.imagesUsed || 0, total: usageMeter?.imagesLimit || 75, unit: '', icon: <ImageIcon className="w-3.5 h-3.5 text-sky-500" />, color: 'bg-sky-500', bg: 'bg-sky-50' },
    { label: 'Research runs', used: usageMeter?.researchUsed || 0, total: usageMeter?.researchLimit || 100, unit: '', icon: <Search className="w-3.5 h-3.5 text-emerald-600" />, color: 'bg-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Leads researched', used: usageMeter?.leadsUsed || 0, total: usageMeter?.leadsLimit || 500, unit: '', icon: <BarChart2 className="w-3.5 h-3.5 text-purple-600" />, color: 'bg-purple-600', bg: 'bg-purple-50' },
    { label: 'Scheduled runs', used: usageMeter?.scheduledUsed || 0, total: usageMeter?.scheduledLimit || 500, unit: '', icon: <Calendar className="w-3.5 h-3.5 text-orange-500" />, color: 'bg-orange-500', bg: 'bg-orange-50' },
    { label: 'Knowledge storage', used: usageMeter?.storageUsed || 0, total: usageMeter?.storageLimit || 5, unit: 'GB', icon: <Database className="w-3.5 h-3.5 text-pink-500" />, color: 'bg-pink-500', bg: 'bg-pink-50' },
    { label: 'Active users', used: usageMeter?.usersUsed || 2, total: usageMeter?.usersLimit || 5, unit: '', icon: <Users className="w-3.5 h-3.5 text-blue-600" />, color: 'bg-blue-600', bg: 'bg-blue-50' },
    { label: 'Active agents', used: usageMeter?.agentsUsed || 0, total: usageMeter?.agentsLimit || 8, unit: '', icon: <Bot className="w-3.5 h-3.5 text-amber-600" />, color: 'bg-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 pb-8 pt-2 font-sans space-y-6 animate-fade-in">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200/60">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4F46E5] mb-1">
            <span className="w-4 h-[2px] bg-[#4F46E5]"></span>
            <span>Usage & Billing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight font-['Space_Grotesk']">
            Subscription &amp; usage
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            Manage your active plan, top-up add-ons and monthly AI consumption.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-100 p-0.5 rounded-xl border border-gray-200/80">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'overview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Overview &amp; Plan
          </button>
          <button
            onClick={() => setActiveTab('ai-analytics')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'ai-analytics' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>AI Token Analytics</span>
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-7">
          
          {/* Active Subscription Hero Banner (Sleek, Compact matching HTML) */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4F46E5] via-[#6C5CE7] to-[#7C6BFF] p-6 sm:p-7 text-white shadow-xl shadow-indigo-500/15">
            <div className="absolute -right-16 -top-28 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Active · renews Aug 25, 2026</span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-['Space_Grotesk']">
                  {plan?.name || 'Team Plan'}
                </h2>
                
                <div className="text-xs sm:text-sm font-semibold opacity-95 flex items-baseline gap-1">
                  <span className="text-lg sm:text-xl font-bold font-['Space_Grotesk']">
                    {subscription?.region === 'GLOBAL_USD' ? '$249' : '₹14,999'}
                  </span>
                  <span className="opacity-80">/ month · billed monthly</span>
                </div>

                <p className="text-[11.5px] opacity-85 pt-0.5">
                  +{addOns?.length || 6} add-on packs active · {usageMeter?.usersLimit || 5} seats · 1 workspace · up to {usageMeter?.agentsLimit || 8} agents
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button 
                  onClick={handleTopUp}
                  disabled={topUpLoading}
                  className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-bold backdrop-blur-md transition-all"
                >
                  {topUpLoading ? 'Processing Order...' : 'Top-up Credits'}
                </button>
                <button 
                  onClick={() => navigate('/pricing')}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-[#4F46E5] text-xs font-bold shadow-md shadow-black/10 transition-all flex items-center gap-1.5"
                >
                  <span>Upgrade plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Usage Meters (Sleek Compact Grid) */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 font-['Space_Grotesk']">This period's usage</h3>
              <p className="text-[11.5px] text-gray-500">Jul 25 – Aug 25, 2026 · resets in 31 days</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              {meterData.map((m, idx) => {
                const pct = m.total > 0 ? Math.min(100, Math.round((m.used / m.total) * 100)) : 0;

                return (
                  <div 
                    key={idx} 
                    className="bg-white border border-gray-200/90 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-1.5 rounded-lg ${m.bg}`}>
                          {m.icon}
                        </div>
                        <span className="text-xs font-semibold text-gray-500">{m.label}</span>
                      </div>

                      <div className="flex items-baseline gap-1 mb-1.5">
                        <span className="text-lg font-bold text-gray-900 font-['Space_Grotesk']">{m.used}</span>
                        <span className="text-[11px] text-gray-400 font-medium">/ {m.total}{m.unit ? ` ${m.unit}` : ''}</span>
                      </div>
                    </div>

                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1.5">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${m.color}`} 
                        style={{ width: `${Math.max(4, pct)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Add-ons Row */}
          <div className="space-y-2.5 pt-1">
            <div>
              <h3 className="text-sm font-bold text-gray-900 font-['Space_Grotesk']">Active add-ons</h3>
              <p className="text-[11.5px] text-gray-500">Prepaid packs applied on top of your plan allowance</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 bg-white border border-gray-200/80 rounded-xl px-3.5 py-2 shadow-sm text-xs font-semibold text-gray-700">
                <span>⚡ Additional 1,000 Tasks</span>
                <span className="bg-indigo-50 text-[#4F46E5] text-[10.5px] font-black px-2 py-0.5 rounded-full">×6</span>
              </div>

              <button 
                onClick={handleTopUp}
                disabled={topUpLoading}
                className="inline-flex items-center gap-1.5 bg-[#4F46E5] hover:bg-[#3730B8] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>{topUpLoading ? 'Processing...' : '+ Add-On Top-Up'}</span>
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* AI Token Analytics Tab */
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Tokens</span>
                <Activity className="w-4 h-4 text-[#4F46E5]" />
              </div>
              <div className="text-2xl font-bold text-gray-900 font-['Space_Grotesk']">
                {(aiSummary?.totalTokens || 142850).toLocaleString()}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Prompt &amp; Completion tokens combined</p>
            </div>

            <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Estimated Model Cost</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 font-['Space_Grotesk']">
                ${aiCostReport?.totalCost ? aiCostReport.totalCost.toFixed(4) : '0.2856'}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Direct LLM provider API expense</p>
            </div>

            <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Workspace</span>
                <Cpu className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-base font-bold text-gray-900 truncate">
                {currentWorkspace?.name || 'Default Workspace'}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Tracked across active AI agents</p>
            </div>
          </div>

          {/* Member Token Usage Table */}
          <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900 font-['Space_Grotesk']">Team Member Token Consumption</h4>
                <p className="text-[11.5px] text-gray-500">Cumulative LLM tokens recorded in user_token_usages table</p>
              </div>
              <Users className="w-4 h-4 text-[#4F46E5]" />
            </div>

            {userTokenUsages.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400 font-medium">
                No member token records found yet for this period.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10.5px]">
                      <th className="pb-2.5">Member / Email</th>
                      <th className="pb-2.5">User ID</th>
                      <th className="pb-2.5 text-right">Tokens Consumed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {userTokenUsages.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-2.5 font-semibold text-gray-800">
                          {item.email || item.userId}
                        </td>
                        <td className="py-2.5 font-mono text-[11px] text-gray-400 truncate max-w-[140px]">
                          {item.userId}
                        </td>
                        <td className="py-2.5 text-right font-bold text-[#4F46E5] font-['Space_Grotesk']">
                          {(item.totalTokens || item.total_tokens || 0).toLocaleString()} tokens
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
