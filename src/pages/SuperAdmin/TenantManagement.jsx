import React, { useEffect, useState } from 'react';
import { superAdminService } from '../../services/superAdminService';
import {
  Building2, Search, Filter, ShieldAlert, CheckCircle, XCircle,
  Edit3, Plus, Coins, Zap, RefreshCw, X, ChevronRight, User
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function TenantManagement() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });

  // Modal / Drawer state
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);

  // Form states
  const [overrideData, setOverrideData] = useState({ planCode: 'STARTER', billingCycle: 'MONTHLY', region: 'INDIA_INR' });
  const [creditAmount, setCreditAmount] = useState(100);
  const [creditDesc, setCreditDesc] = useState('');

  useEffect(() => {
    fetchOrganizations();
  }, [page, statusFilter, planFilter]);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const res = await superAdminService.getOrganizations({
        page,
        limit: 10,
        search,
        status: statusFilter || undefined,
        planCode: planFilter || undefined,
      });
      setOrgs(res.items || []);
      setPagination(res.pagination || { totalPages: 1 });
    } catch (err) {
      console.error('Failed to load tenants:', err);
      toast.error('Failed to load organization tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrganizations();
  };

  const handleToggleStatus = async (orgId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await superAdminService.updateOrganizationStatus(orgId, nextStatus);
      toast.success(`Organization status changed to ${nextStatus}`);
      fetchOrganizations();
      if (selectedOrg?.id === orgId) {
        setSelectedOrg((prev) => prev ? { ...prev, status: nextStatus } : null);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleApplyOverride = async (e) => {
    e.preventDefault();
    if (!selectedOrg) return;
    try {
      await superAdminService.overrideSubscription(selectedOrg.id, overrideData);
      toast.success('Subscription plan override applied!');
      setShowOverrideModal(false);
      fetchOrganizations();
    } catch (err) {
      toast.error('Failed to apply override');
    }
  };

  const handleGrantCredits = async (e) => {
    e.preventDefault();
    if (!selectedOrg) return;
    try {
      await superAdminService.grantCreditTopUp(selectedOrg.id, Number(creditAmount), creditDesc);
      toast.success(`Granted ${creditAmount} credits successfully!`);
      setShowCreditModal(false);
      setCreditDesc('');
      fetchOrganizations();
    } catch (err) {
      toast.error('Failed to grant credits');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-400" /> Tenant & Organization Governance
          </h2>
          <p className="text-sm text-gray-400">View, suspend, elevate, and adjust SaaS subscriptions across all platform tenants.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 bg-gray-900/90 p-4 rounded-2xl border border-gray-800">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search organization name, slug, or owner email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800/80 border border-gray-700/60 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <select
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
          className="bg-gray-800/80 border border-gray-700/60 rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-amber-400"
        >
          <option value="">All Plans</option>
          <option value="STARTER">Starter</option>
          <option value="TEAM">Team</option>
          <option value="BUSINESS">Business</option>
          <option value="ENTERPRISE">Enterprise</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-gray-800/80 border border-gray-700/60 rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-amber-400"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <button type="submit" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-xl text-sm transition-all">
          Search
        </button>
      </form>

      {/* Tenants Table */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
        ) : orgs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No tenant organizations found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-800/60 text-xs uppercase text-gray-400 font-semibold border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">Organization</th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4">Plan & Region</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Members</th>
                  <th className="px-6 py-4">Tasks Used</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {orgs.map((org) => {
                  const planCode = org.subscription?.plan?.code || 'STARTER';
                  const isActive = org.status === 'ACTIVE';
                  return (
                    <tr key={org.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">
                        <div>{org.name}</div>
                        <span className="text-xs text-gray-500 font-mono">@{org.slug}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-200">{org.owner?.firstName} {org.owner?.lastName}</div>
                        <div className="text-xs text-gray-400">{org.owner?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {planCode}
                        </span>
                        <span className="text-xs text-gray-400 block mt-1">{org.subscription?.region || 'INR'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {org.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{org._count?.memberships || 0}</td>
                      <td className="px-6 py-4 font-medium text-amber-400">
                        {org.usageMeter?.tasksUsed || 0}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => { setSelectedOrg(org); setOverrideData({ planCode, billingCycle: 'MONTHLY', region: 'INDIA_INR' }); setShowOverrideModal(true); }}
                          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-amber-400 text-xs font-semibold rounded-lg border border-gray-700"
                        >
                          Override Plan
                        </button>
                        <button
                          onClick={() => { setSelectedOrg(org); setShowCreditModal(true); }}
                          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-emerald-400 text-xs font-semibold rounded-lg border border-gray-700"
                        >
                          + Credits
                        </button>
                        <button
                          onClick={() => handleToggleStatus(org.id, org.status)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                            isActive ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30'
                          }`}
                        >
                          {isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Override Plan Modal */}
      {showOverrideModal && selectedOrg && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-white">Override Subscription ({selectedOrg.name})</h3>
              <button onClick={() => setShowOverrideModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleApplyOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Target Plan</label>
                <select
                  value={overrideData.planCode}
                  onChange={(e) => setOverrideData({ ...overrideData, planCode: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white"
                >
                  <option value="STARTER">STARTER</option>
                  <option value="TEAM">TEAM</option>
                  <option value="BUSINESS">BUSINESS</option>
                  <option value="ENTERPRISE">ENTERPRISE</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Billing Cycle</label>
                <select
                  value={overrideData.billingCycle}
                  onChange={(e) => setOverrideData({ ...overrideData, billingCycle: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white"
                >
                  <option value="MONTHLY">MONTHLY</option>
                  <option value="ANNUAL">ANNUAL</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Billing Region</label>
                <select
                  value={overrideData.region}
                  onChange={(e) => setOverrideData({ ...overrideData, region: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white"
                >
                  <option value="INDIA_INR">INDIA_INR</option>
                  <option value="GLOBAL_USD">GLOBAL_USD</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowOverrideModal(false)} className="px-4 py-2 bg-gray-800 text-gray-300 text-sm rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-sm rounded-xl">Apply Override</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grant Credits Modal */}
      {showCreditModal && selectedOrg && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-white">Grant Credits ({selectedOrg.name})</h3>
              <button onClick={() => setShowCreditModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleGrantCredits} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Credit Amount (Task Units)</label>
                <input
                  type="number"
                  min="1"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Reason / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Complimentary top-up for enterprise trial"
                  value={creditDesc}
                  onChange={(e) => setCreditDesc(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowCreditModal(false)} className="px-4 py-2 bg-gray-800 text-gray-300 text-sm rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm rounded-xl">Grant Credits</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
