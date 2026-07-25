import React, { useEffect, useState } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { useWorkspaceStore } from '../store/workspaceStore';
import { 
  Zap, Database, Users, Bot, Image as ImageIcon, 
  ShieldAlert, PlusCircle, Clock
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
      toast.success('Added 1,000 Tasks Top-Up!');
      fetchSubscription();
    } catch (err) {
      toast.error('Top-Up failed.');
    } finally {
      setTopUpLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6c48ff]"></div>
      </div>
    );
  }

  const { subscription, usageMeter } = data || {};
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

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 animate-fade-in space-y-8">
      {/* Quota Warning / Exceeded Alert Banner */}
      {tasksPercent >= 90 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-red-900">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Subscription & Usage</h1>
          <p className="text-gray-500 text-xs mt-1">Monitor your plan status, credit balance, and active resources.</p>
        </div>
        <button
          onClick={handleTopUp}
          disabled={topUpLoading}
          className="inline-flex items-center gap-1.5 bg-[#6c48ff] hover:bg-[#5b3adb] text-white font-bold px-4 py-2.5 rounded-xl shadow-sm text-xs transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{topUpLoading ? 'Processing...' : 'Top Up Tasks'}</span>
        </button>
      </div>

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
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-[#6c48ff]">
              {tasksPercent}% Used
            </span>
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
    </div>
  );
}


