import React, { useEffect, useState } from 'react';
import { superAdminService } from '../../services/superAdminService';
import { CreditCard, Edit2, Plus, RefreshCw, Save, Layers, Package, Zap } from 'lucide-react';
import { toast } from 'react-toastify';

export default function BillingAndPlans() {
  const [plans, setPlans] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [taskRules, setTaskRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' | 'addons' | 'rules'

  // Edit State
  const [editingEntitlement, setEditingEntitlement] = useState(null); // { planId, key, value }
  const [editingRule, setEditingRule] = useState(null); // { activityType, taskUnits }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, addOnsRes, rulesRes] = await Promise.all([
        superAdminService.getPlans(),
        superAdminService.getAddOns(),
        superAdminService.getTaskRules(),
      ]);
      setPlans(plansRes || []);
      setAddOns(addOnsRes || []);
      setTaskRules(rulesRes || []);
    } catch (err) {
      console.error('Failed to load billing configuration:', err);
      toast.error('Failed to load billing configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntitlement = async (planId, key, value) => {
    try {
      await superAdminService.upsertEntitlement(planId, key, value);
      toast.success(`Updated ${key} entitlement to ${value}`);
      setEditingEntitlement(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to save entitlement');
    }
  };

  const handleSaveRule = async (activityType, taskUnits) => {
    try {
      await superAdminService.upsertTaskRule(activityType, Number(taskUnits));
      toast.success(`Updated task unit rate for ${activityType}`);
      setEditingRule(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to save task rule');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-amber-400" /> Subscription Tiers & Pricing Governance
        </h2>
        <p className="text-sm text-gray-400">Configure global SaaS subscription plans, plan entitlement limits, add-on top-up packs, and AI activity consumption multipliers.</p>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'plans' ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/10' : 'text-gray-400 hover:text-white bg-gray-900'
          }`}
        >
          <Layers className="w-4 h-4" /> Subscription Plans & Entitlements
        </button>
        <button
          onClick={() => setActiveTab('addons')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'addons' ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/10' : 'text-gray-400 hover:text-white bg-gray-900'
          }`}
        >
          <Package className="w-4 h-4" /> Add-On Packs
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'rules' ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/10' : 'text-gray-400 hover:text-white bg-gray-900'
          }`}
        >
          <Zap className="w-4 h-4" /> Task Consumption Multipliers
        </button>
      </div>

      {/* TAB 1: PLANS */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="p-6 rounded-2xl bg-gray-900/90 border border-gray-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {plan.code}
                  </span>
                  <span className="text-xs text-gray-500">Order: {plan.sortOrder}</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-3">{plan.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{plan.description}</p>
              </div>

              {/* Entitlements */}
              <div className="space-y-3 pt-3 border-t border-gray-800">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Plan Entitlements</h4>
                <div className="space-y-2">
                  {plan.entitlements?.map((ent) => {
                    const isEditing = editingEntitlement?.planId === plan.id && editingEntitlement?.key === ent.key;
                    return (
                      <div key={ent.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-800/60 border border-gray-700/40">
                        <span className="text-gray-300 font-medium truncate">{ent.key}</span>
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editingEntitlement.value}
                              onChange={(e) => setEditingEntitlement({ ...editingEntitlement, value: e.target.value })}
                              className="w-20 bg-gray-900 text-white px-2 py-0.5 rounded border border-amber-400 text-xs"
                            />
                            <button
                              onClick={() => handleSaveEntitlement(plan.id, ent.key, editingEntitlement.value)}
                              className="p-1 text-emerald-400 hover:text-emerald-300"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 font-bold">{ent.value}</span>
                            <button
                              onClick={() => setEditingEntitlement({ planId: plan.id, key: ent.key, value: ent.value })}
                              className="text-gray-500 hover:text-amber-400"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: ADD-ONS */}
      {activeTab === 'addons' && (
        <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 overflow-hidden">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-800/60 text-xs uppercase text-gray-400 font-semibold border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">Add-On Code</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Price INR (₹)</th>
                <th className="px-6 py-4">Price USD ($)</th>
                <th className="px-6 py-4">Basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {addOns.map((addon) => (
                <tr key={addon.id} className="hover:bg-gray-800/40">
                  <td className="px-6 py-4 font-mono text-amber-400 font-bold">{addon.code}</td>
                  <td className="px-6 py-4 text-white font-semibold">{addon.name}</td>
                  <td className="px-6 py-4">₹{addon.priceInr || 0}</td>
                  <td className="px-6 py-4">${addon.priceUsd || 0}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-gray-400">{addon.billingBasis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: TASK RULES */}
      {activeTab === 'rules' && (
        <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 overflow-hidden">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-800/60 text-xs uppercase text-gray-400 font-semibold border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">AI Activity Type</th>
                <th className="px-6 py-4">Task Units Rate</th>
                <th className="px-6 py-4">Customer Explanation</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {taskRules.map((rule) => {
                const isEditing = editingRule?.activityType === rule.activityType;
                return (
                  <tr key={rule.id} className="hover:bg-gray-800/40">
                    <td className="px-6 py-4 font-mono font-semibold text-white">{rule.activityType}</td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.1"
                          value={editingRule.taskUnits}
                          onChange={(e) => setEditingRule({ ...editingRule, taskUnits: e.target.value })}
                          className="w-24 bg-gray-800 text-white px-2 py-1 rounded border border-amber-400 text-xs"
                        />
                      ) : (
                        <span className="text-amber-400 font-bold">{rule.taskUnits} units</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">{rule.customerExplanation || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveRule(rule.activityType, editingRule.taskUnits)}
                          className="px-3 py-1 bg-emerald-500 text-gray-950 font-bold text-xs rounded-lg"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingRule({ activityType: rule.activityType, taskUnits: rule.taskUnits })}
                          className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-amber-400 text-xs rounded-lg border border-gray-700"
                        >
                          Edit Rate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
