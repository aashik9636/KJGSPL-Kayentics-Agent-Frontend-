import React, { useEffect, useState } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { useWorkspaceStore } from '../store/workspaceStore';
import { 
  Zap, Activity, Database, Users, Briefcase, Bot, Image as ImageIcon, 
  Search, ShieldAlert, ArrowUpRight, PlusCircle, CheckCircle2, Clock
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function SubscriptionUsageDashboard() {
  const { organizationId } = useWorkspaceStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topUpLoading, setTopUpLoading] = useState(false);

  useEffect(() => {
    if (organizationId) {
      fetchSubscription();
    }
  }, [organizationId]);

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      const res = await subscriptionService.getOrganizationSubscription(organizationId);
      setData(res);
    } catch (err) {
      console.error('Failed to load subscription status:', err);
      toast.error('Failed to load active subscription.');
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async () => {
    if (!organizationId) return;
    setTopUpLoading(true);
    try {
      await subscriptionService.purchaseAddOn(organizationId, 'ADDITIONAL_1000_TASKS', 1);
      toast.success('Added 1,000 Tasks Top-Up successfully!');
      fetchSubscription();
    } catch (err) {
      toast.error('Top-Up failed.');
    } finally {
      setTopUpLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const { subscription, usageMeter } = data || {};
  const plan = subscription?.plan;

  // Helper to extract entitlement limit
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
  const workspacesLimit = getEntitlementLimit('workspaces', 1);
  const agentsLimit = getEntitlementLimit('active_agents', 4);
  const storageLimit = getEntitlementLimit('knowledge_storage_gb', 1);
  const imagesLimit = getEntitlementLimit('images_per_month', 20);

  const calculatePercent = (used, limit) => {
    if (!limit || limit === 999999) return 10;
    return Math.min(100, Math.round((used / limit) * 100));
  };

  const tasksPercent = calculatePercent(usageMeter?.tasksUsed || 0, tasksLimit);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      {/* Quota Warning / Exceeded Alert Banner */}
      {tasksPercent >= 90 && (
        <div className="max-w-7xl mx-auto mb-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-rose-200">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0" />
            <div>
              <div className="font-bold text-base">{tasksPercent >= 100 ? 'Task Quota Exceeded!' : 'Task Quota Warning'}</div>
              <div className="text-xs text-rose-300/80">
                {tasksPercent >= 100
                  ? 'You have reached 100% of your task credits. AI Agent task execution is paused until you upgrade or top up.'
                  : `You have consumed ${tasksPercent}% of your monthly task credits. Top up now to prevent disruption.`}
              </div>
            </div>
          </div>
          <button
            onClick={handleTopUp}
            disabled={topUpLoading}
            className="px-4 py-2 bg-rose-500 text-white font-bold rounded-xl text-sm hover:bg-rose-600 transition shadow-lg shadow-rose-500/20 whitespace-nowrap"
          >
            {topUpLoading ? 'Processing...' : 'Top Up +1,000 Tasks'}
          </button>
        </div>
      )}

      {/* Top Banner */}

      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Subscription & Metered Usage</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time task balance, active entity limits, and automated plan renewals.</p>
        </div>
        <button
          onClick={handleTopUp}
          disabled={topUpLoading}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{topUpLoading ? 'Processing...' : 'Buy +1,000 Tasks Top-Up'}</span>
        </button>
      </div>

      {/* Active Subscription Overview Card */}
      <div className="max-w-7xl mx-auto bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/30 rounded-2xl p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Active Plan</div>
            <div className="text-2xl font-black text-white flex items-center gap-2">
              <span>{plan?.name || 'Starter Plan'}</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase border border-emerald-500/30">
                {subscription?.status || 'ACTIVE'}
              </span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Region & Currency</div>
            <div className="text-lg font-bold text-white">
              {subscription?.region === 'INDIA_INR' ? '🇮🇳 India (INR ₹)' : '🌐 Global (USD $)'}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Billing Cycle</div>
            <div className="text-lg font-bold text-white capitalize">
              {subscription?.billingCycle?.toLowerCase() || 'monthly'}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Current Period Ends</div>
            <div className="text-lg font-bold text-indigo-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>{subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Meter Progress Bars */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Task Balance Meter */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">Monthly AI Tasks</h3>
                <p className="text-xs text-slate-400">Resets monthly</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded bg-slate-800 text-indigo-400">
              {tasksPercent}% Used
            </span>
          </div>

          <div className="mb-2 flex justify-between text-sm">
            <span className="text-slate-400">Consumed: <strong className="text-white">{usageMeter?.tasksUsed || 0}</strong></span>
            <span className="text-slate-400">Limit: <strong className="text-white">{tasksLimit === 999999 ? 'Custom' : tasksLimit}</strong></span>
          </div>

          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 ${
                tasksPercent > 80 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
              }`}
              style={{ width: `${tasksPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Active Agents Meter */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">Active Agents</h3>
                <p className="text-xs text-slate-400">Production deployed</p>
              </div>
            </div>
          </div>

          <div className="mb-2 flex justify-between text-sm">
            <span className="text-slate-400">Active: <strong className="text-white">{usageMeter?.activeAgents || 0}</strong></span>
            <span className="text-slate-400">Plan Cap: <strong className="text-white">{agentsLimit === 999999 ? 'Custom' : agentsLimit}</strong></span>
          </div>

          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${calculatePercent(usageMeter?.activeAgents || 0, agentsLimit)}%` }}
            ></div>
          </div>
        </div>

        {/* Active Seats & Users */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">Team Seats</h3>
                <p className="text-xs text-slate-400">Active user accounts</p>
              </div>
            </div>
          </div>

          <div className="mb-2 flex justify-between text-sm">
            <span className="text-slate-400">Users: <strong className="text-white">{usageMeter?.activeUsers || 0}</strong></span>
            <span className="text-slate-400">Seat Cap: <strong className="text-white">{usersLimit === 999999 ? 'Custom' : usersLimit}</strong></span>
          </div>

          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${calculatePercent(usageMeter?.activeUsers || 0, usersLimit)}%` }}
            ></div>
          </div>
        </div>

        {/* Knowledge Vector Storage */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">Knowledge Base GB</h3>
                <p className="text-xs text-slate-400">Vector store capacity</p>
              </div>
            </div>
          </div>

          <div className="mb-2 flex justify-between text-sm">
            <span className="text-slate-400">Used: <strong className="text-white">{(Number(usageMeter?.knowledgeStorageBytes || 0) / (1024 * 1024 * 1024)).toFixed(2)} GB</strong></span>
            <span className="text-slate-400">Limit: <strong className="text-white">{storageLimit} GB</strong></span>
          </div>

          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: '15%' }}></div>
          </div>
        </div>

        {/* Image Generations */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">Image Generations</h3>
                <p className="text-xs text-slate-400">Monthly images</p>
              </div>
            </div>
          </div>

          <div className="mb-2 flex justify-between text-sm">
            <span className="text-slate-400">Generated: <strong className="text-white">{usageMeter?.imagesUsed || 0}</strong></span>
            <span className="text-slate-400">Limit: <strong className="text-white">{imagesLimit}</strong></span>
          </div>

          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-pink-500 transition-all duration-500"
              style={{ width: `${calculatePercent(usageMeter?.imagesUsed || 0, imagesLimit)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
