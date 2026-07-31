import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userService } from '../../../services/userService';
import { subscriptionService } from '../../../services/subscriptionService';
import { useWorkspaceStore } from '../../../store/workspaceStore';
import { UserPlus, Trash2, Users, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function TeamManagementTab() {
  const { organizationId } = useWorkspaceStore();
  const navigate = useNavigate();
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [userLimit, setUserLimit] = useState(null);

  // Form State
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');

  useEffect(() => {
    loadTeamData();
  }, [organizationId]);

  const loadTeamData = async () => {
    setLoading(true);
    try {
      // 1. Fetch organization members
      const userList = await userService.getUsers();
      const list = Array.isArray(userList) ? userList : (userList?.data || []);
      setMembers(list);

      // 2. Fetch subscription plan seat limit if org ID exists
      if (organizationId) {
        try {
          const subData = await subscriptionService.getOrganizationSubscription(organizationId);
          const sub = subData?.data?.subscription || subData?.subscription;
          const entitlements = sub?.plan?.entitlements || [];
          const userEntitlement = entitlements.find((e) => e.key === 'users');
          const limitStr = userEntitlement?.value || '2';
          const limit = limitStr.toLowerCase() === 'unlimited' ? Infinity : parseInt(limitStr, 10);
          setUserLimit(limit || 2);
        } catch (e) {
          setUserLimit(2); // Fallback limit
        }
      } else {
        setUserLimit(2);
      }
    } catch (err) {
      console.error('Failed to load team data:', err);
      toast.error('Failed to load team members.');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Please enter an email address');

    // Seat limit check
    if (userLimit && members.length >= userLimit) {
      return toast.error(`Seat limit reached (${members.length}/${userLimit}). Upgrade subscription to invite more team members.`);
    }

    setInviting(true);
    try {
      await userService.inviteUser({ email: email.trim(), role });
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      loadTeamData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send invitation.');
    } finally {
      setInviting(false);
    }
  };

  const handleRevoke = async (invitationId) => {
    if (!window.confirm('Are you sure you want to revoke this invitation?')) return;
    try {
      await userService.deleteInvitation(invitationId);
      toast.success('Invitation revoked.');
      loadTeamData();
    } catch (err) {
      toast.error('Failed to revoke invitation.');
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#6c48ff] border-t-transparent mx-auto mb-3" />
        <p className="text-sm font-medium">Loading team members...</p>
      </div>
    );
  }

  const seatsUsed = members.length;
  const isLimitReached = userLimit && seatsUsed >= userLimit && userLimit !== Infinity;
  const percentageUsed = userLimit && userLimit !== Infinity ? Math.min(100, Math.round((seatsUsed / userLimit) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Seat Meter & Plan Header */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-purple-50 text-[#6c48ff] rounded-2xl border border-purple-100">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Organization Members</h3>
            <p className="text-sm text-gray-500">Manage user access, roles, and invitations for your team.</p>
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-50/80 border border-gray-100 p-4 rounded-xl">
          <div>
            <div className="flex items-center justify-between gap-4 mb-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Seat Allocation</span>
              <span className="text-xs font-bold text-gray-900">
                {seatsUsed} / {userLimit === Infinity ? '∞' : userLimit} Seats
              </span>
            </div>
            {userLimit !== Infinity && (
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    percentageUsed >= 90 ? 'bg-amber-500' : 'bg-[#6c48ff]'
                  }`} 
                  style={{ width: `${percentageUsed}%` }}
                />
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/pricing')}
            className="flex items-center gap-1 text-xs font-bold text-[#6c48ff] hover:text-[#5b3af0] bg-purple-50 hover:bg-purple-100 px-3.5 py-2 rounded-lg transition"
          >
            <span>Upgrade Seats</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Invite Member Form */}
      <form onSubmit={handleInvite} className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#6c48ff]" /> Invite Team Member
          </h4>
        </div>

        {isLimitReached && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>You have reached your subscription seat limit ({userLimit} seats). Upgrade your plan to invite more members.</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/pricing')}
              className="font-bold text-[#6c48ff] underline whitespace-nowrap"
            >
              Upgrade Now
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <input
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLimitReached || inviting}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#6c48ff] focus:ring-2 focus:ring-purple-100 transition disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isLimitReached || inviting}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#6c48ff] focus:ring-2 focus:ring-purple-100 transition disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLimitReached || inviting}
          className="px-6 py-2.5 bg-[#6c48ff] hover:bg-[#5b3af0] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition shadow-md shadow-purple-500/20"
        >
          {inviting ? 'Sending Invite...' : 'Send Invitation'}
        </button>
      </form>

      {/* Members & Invitations Table */}
      <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Members & Pending Invites</h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="p-4 pl-6">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400 text-sm">
                    No team members found. Send your first invitation above.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id || m.invitationId} className="hover:bg-purple-50/30 transition">
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-100 text-[#6c48ff] font-bold flex items-center justify-center text-xs border border-purple-200/50">
                        {(m.firstName?.[0] || m.email?.[0] || 'U').toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {m.firstName ? `${m.firstName} ${m.lastName || ''}` : (m.email ? m.email.split('@')[0] : 'User')}
                        </div>
                        <div className="text-xs text-gray-400">{m.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-lg font-medium">
                        {m.role || 'MEMBER'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase border ${
                        m.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {m.status || (m.invitationId ? 'INVITED' : 'ACTIVE')}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {(m.status === 'INVITED' || m.invitationId) && (
                        <button
                          onClick={() => handleRevoke(m.invitationId || m.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Revoke Invitation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
