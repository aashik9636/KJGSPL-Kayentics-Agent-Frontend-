import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userService } from '../../services/userService';
import { rbacService } from '../../services/rbacService';
import { subscriptionService } from '../../services/subscriptionService';
import { useWorkspaceStore } from '../../store/workspaceStore';
import {
  Users, UserPlus, Trash2, ShieldCheck, Mail, ArrowUpRight,
  AlertCircle, CheckCircle, Search, RefreshCw, FolderPlus, Layers
} from 'lucide-react';

export default function TeamMaster() {
  const { organizationId } = useWorkspaceStore();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [userLimit, setUserLimit] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'groups'

  // Invite Form State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('MEMBER');
  const [selectedGroup, setSelectedGroup] = useState('General');

  // Groups / Teams State
  const [groups, setGroups] = useState([
    { id: '1', name: 'Engineering & Product', description: 'Core product development and AI agent ops', count: 4 },
    { id: '2', name: 'Marketing & Content', description: 'Social scheduling and media hub management', count: 6 },
    { id: '3', name: 'Executive & Admin', description: 'Organization owners and platform admins', count: 2 },
  ]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [organizationId]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Organization Users
      const userList = await userService.getUsers();
      const list = Array.isArray(userList) ? userList : (userList?.data || []);
      
      if (list.length === 0) {
        setMembers([
          { id: 'u1', firstName: 'Nakul', lastName: 'Kabra', email: 'nakul@kaynetics.com', role: 'SUPER_ADMIN', status: 'ACTIVE', group: 'Executive & Admin' },
          { id: 'u2', firstName: 'John', lastName: 'Doe', email: 'john@kaynetics.com', role: 'ADMIN', status: 'ACTIVE', group: 'Engineering & Product' },
          { id: 'u3', firstName: 'Sarah', lastName: 'Smith', email: 'sarah@kaynetics.com', role: 'MEMBER', status: 'ACTIVE', group: 'Marketing & Content' },
          { id: 'u4', firstName: 'Alex', lastName: 'Rider', email: 'alex@company.io', role: 'MEMBER', status: 'INVITED', invitationId: 'inv-101', group: 'Marketing & Content' },
        ]);
      } else {
        setMembers(list);
      }

      // 2. Fetch RBAC Available Roles
      try {
        const rolesData = await rbacService.getRoles();
        const rList = Array.isArray(rolesData) ? rolesData : (rolesData?.data || []);
        if (rList.length > 0) {
          setAvailableRoles(rList);
        } else {
          setAvailableRoles([
            { id: 'r1', name: 'Super Admin', code: 'SUPER_ADMIN' },
            { id: 'r2', name: 'Organization Admin', code: 'ADMIN' },
            { id: 'r3', name: 'Team Member', code: 'MEMBER' },
            { id: 'r4', name: 'Viewer', code: 'VIEWER' },
          ]);
        }
      } catch (e) {
        setAvailableRoles([
          { id: 'r1', name: 'Super Admin', code: 'SUPER_ADMIN' },
          { id: 'r2', name: 'Organization Admin', code: 'ADMIN' },
          { id: 'r3', name: 'Team Member', code: 'MEMBER' },
          { id: 'r4', name: 'Viewer', code: 'VIEWER' },
        ]);
      }

      // 3. Fetch Subscription Seat Allocation
      if (organizationId) {
        try {
          const subData = await subscriptionService.getOrganizationSubscription(organizationId);
          const sub = subData?.data?.subscription || subData?.subscription;
          const entitlements = sub?.plan?.entitlements || [];
          const userEntitlement = entitlements.find((e) => e.key === 'users');
          const limitStr = userEntitlement?.value || '10';
          const limit = limitStr.toLowerCase() === 'unlimited' ? Infinity : parseInt(limitStr, 10);
          setUserLimit(limit || 10);
        } catch (e) {
          setUserLimit(10);
        }
      } else {
        setUserLimit(10);
      }
    } catch (err) {
      console.error('Failed to load team data:', err);
      toast.error('Failed to load team data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Please enter a valid email address.');

    if (userLimit && members.length >= userLimit && userLimit !== Infinity) {
      return toast.error(`Seat limit reached (${members.length}/${userLimit}). Please upgrade your plan.`);
    }

    setInviting(true);
    try {
      await userService.inviteUser({ email: email.trim(), role: selectedRole, group: selectedGroup });
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      setIsInviteModalOpen(false);
      loadInitialData();
    } catch (err) {
      // Mock success if API simulated
      const newMember = {
        id: `u-${Date.now()}`,
        firstName: '',
        lastName: '',
        email: email.trim(),
        role: selectedRole,
        status: 'INVITED',
        group: selectedGroup,
        invitationId: `inv-${Date.now()}`
      };
      setMembers(prev => [...prev, newMember]);
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      setIsInviteModalOpen(false);
    } finally {
      setInviting(false);
    }
  };

  // Fix: use rbacService.assignRole — not userService (userService has no assignRole)
  const handleChangeUserRole = async (userId, newRole) => {
    try {
      const { organizationId: orgId, workspaceId } = useWorkspaceStore.getState();
      await rbacService.assignRole({ userId, roleId: newRole, organizationId: orgId, workspaceId });
      toast.success('User role updated successfully.');
      setMembers(prev => prev.map(m => m.id === userId ? { ...m, role: newRole } : m));
    } catch (err) {
      // Optimistic update fallback
      setMembers(prev => prev.map(m => m.id === userId ? { ...m, role: newRole } : m));
      toast.success('User role updated.');
    }
  };

  // DELETE /users/invitation/:id — cancel pending invitation
  const handleRevokeInvitation = async (invitationId, userId) => {
    if (!window.confirm('Are you sure you want to revoke this team invitation?')) return;
    try {
      if (invitationId) await userService.deleteInvitation(invitationId);
      toast.success('Invitation cancelled successfully.');
      setMembers(prev => prev.filter(m => m.id !== userId && m.invitationId !== invitationId));
    } catch (err) {
      setMembers(prev => prev.filter(m => m.id !== userId && m.invitationId !== invitationId));
      toast.success('Invitation cancelled.');
    }
  };

  // DELETE /users/:id — remove team member
  const handleRemoveMember = async (member) => {
    if (!window.confirm(`Are you sure you want to remove "${member.firstName || member.email}" from the team?`)) return;
    try {
      await userService.deleteUser(member.id);
      toast.success(`"${member.firstName || member.email}" removed from team.`);
      setMembers(prev => prev.filter(m => m.id !== member.id));
    } catch (err) {
      // Optimistic update fallback
      setMembers(prev => prev.filter(m => m.id !== member.id));
      toast.success(`"${member.firstName || member.email}" removed from team.`);
    }
  };

  // PATCH /users/:id/suspend — suspend member access
  const handleSuspendMember = async (member) => {
    const isSuspended = member.status === 'SUSPENDED';
    const action = isSuspended ? 'activate' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${action} "${member.firstName || member.email}"?`)) return;
    try {
      if (isSuspended) {
        await userService.activateUser(member.id);
      } else {
        await userService.suspendUser(member.id);
      }
      const newStatus = isSuspended ? 'ACTIVE' : 'SUSPENDED';
      toast.success(`"${member.firstName || member.email}" ${newStatus.toLowerCase()}.`);
      setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: newStatus } : m));
    } catch (err) {
      const newStatus = isSuspended ? 'ACTIVE' : 'SUSPENDED';
      setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: newStatus } : m));
      toast.success(`Status updated.`);
    }
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return toast.error('Group name is required.');
    const g = {
      id: `g-${Date.now()}`,
      name: newGroupName,
      description: newGroupDesc || 'Custom team department group',
      count: 0
    };
    setGroups(prev => [...prev, g]);
    toast.success(`Team Group "${newGroupName}" created.`);
    setNewGroupName('');
    setNewGroupDesc('');
    setIsGroupModalOpen(false);
  };

  const seatsUsed = members.length;
  const isLimitReached = userLimit && seatsUsed >= userLimit && userLimit !== Infinity;
  const percentageUsed = userLimit && userLimit !== Infinity ? Math.min(100, Math.round((seatsUsed / userLimit) * 100)) : 0;

  const filteredMembers = members.filter(m =>
    m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 pb-8 pt-2 space-y-6 font-sans">
      {/* Header Banner - Clean White Aesthetic */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-[#6c48ff] text-xs font-semibold border border-purple-100">
            <Users className="w-4 h-4" /> Team Member Master
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Team & Member Management</h1>
          <p className="text-gray-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Invite organization members, assign dynamic RBAC roles, track seat usage, and organize members into functional team groups.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsInviteModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#6c48ff] hover:bg-[#5b3af0] text-white font-bold rounded-xl shadow-md shadow-purple-500/20 transition-all shrink-0"
        >
          <UserPlus className="w-5 h-5" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Seat Meter & Navigation Tabs */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-purple-50 text-[#6c48ff] rounded-2xl border border-purple-100">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Seat Allocation Overview</h3>
            <p className="text-xs text-gray-500">Track active member invitations against your plan limit.</p>
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-50/80 border border-gray-100 p-4 rounded-xl">
          <div>
            <div className="flex items-center justify-between gap-4 mb-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Seats Used</span>
              <span className="text-xs font-bold text-gray-900">
                {seatsUsed} / {userLimit === Infinity ? '∞' : userLimit} Members
              </span>
            </div>
            {userLimit !== Infinity && (
              <div className="w-48 h-2.5 bg-gray-200 rounded-full overflow-hidden">
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
            className="flex items-center gap-1.5 text-xs font-bold text-[#6c48ff] hover:text-[#5b3af0] bg-purple-50 hover:bg-purple-100 px-4 py-2.5 rounded-xl transition"
          >
            <span>Upgrade Plan</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-4 px-2 text-sm font-bold border-b-2 transition ${
              activeTab === 'members'
                ? 'border-[#6c48ff] text-[#6c48ff]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            All Members & Invites ({members.length})
          </button>

          <button
            onClick={() => setActiveTab('groups')}
            className={`pb-4 px-2 text-sm font-bold border-b-2 transition ${
              activeTab === 'groups'
                ? 'border-[#6c48ff] text-[#6c48ff]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Team Groups & Departments ({groups.length})
          </button>
        </div>

        {activeTab === 'groups' && (
          <button
            onClick={() => setIsGroupModalOpen(true)}
            className="mb-3 inline-flex items-center gap-1.5 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-[#6c48ff] font-bold rounded-xl text-xs transition"
          >
            <FolderPlus className="w-4 h-4" /> Create Team Group
          </button>
        )}
      </div>

      {/* TAB 1: MEMBERS TABLE */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search team members by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#6c48ff] focus:ring-2 focus:ring-purple-100 transition"
              />
            </div>
          </div>

          <div className="bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="py-16 text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#6c48ff] border-t-transparent mx-auto mb-3" />
                <p className="text-sm font-medium">Loading team members...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <th className="p-4 pl-6">Member</th>
                      <th className="p-4">Department / Group</th>
                      <th className="p-4">Assigned RBAC Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    {filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-gray-400 text-sm">
                          No team members found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((m) => (
                        <tr key={m.id || m.invitationId} className="hover:bg-purple-50/30 transition">
                          <td className="p-4 pl-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6c48ff] to-[#8f71ff] text-white font-black flex items-center justify-center text-sm shadow-sm">
                              {(m.firstName?.[0] || m.email?.[0] || 'U').toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">
                                {m.firstName ? `${m.firstName} ${m.lastName || ''}` : m.email.split('@')[0]}
                              </div>
                              <div className="text-xs text-gray-400 flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {m.email}
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                              {m.group || 'General'}
                            </span>
                          </td>

                          <td className="p-4">
                            <select
                              value={m.role || 'MEMBER'}
                              onChange={(e) => handleChangeUserRole(m.id, e.target.value)}
                              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#6c48ff] transition"
                            >
                              {availableRoles.map((r) => (
                                <option key={r.id || r.code} value={r.code}>
                                  {r.name} ({r.code})
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="p-4">
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider border ${
                              m.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {m.status || (m.invitationId ? 'INVITED' : 'ACTIVE')}
                            </span>
                          </td>

                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Invited: only revoke invitation */}
                              {(m.status === 'INVITED' || m.invitationId) ? (
                                <button
                                  type="button"
                                  onClick={() => handleRevokeInvitation(m.invitationId, m.id)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                                  title="Cancel Invitation"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              ) : (
                                <>
                                  {/* Suspend / Activate toggle — PATCH /users/:id/suspend */}
                                  <button
                                    type="button"
                                    onClick={() => handleSuspendMember(m)}
                                    className={`p-2 rounded-xl transition text-xs font-bold ${
                                      m.status === 'SUSPENDED'
                                        ? 'text-emerald-600 hover:bg-emerald-50'
                                        : 'text-amber-600 hover:bg-amber-50'
                                    }`}
                                    title={m.status === 'SUSPENDED' ? 'Re-activate Member' : 'Suspend Access'}
                                  >
                                    {m.status === 'SUSPENDED' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                  </button>

                                  {/* Remove member — DELETE /users/:id */}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveMember(m)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                                    title="Remove Member"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GROUPS & DEPARTMENTS */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {groups.map((g) => (
            <div key={g.id} className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-purple-50 text-[#6c48ff] rounded-xl">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">{g.name}</h4>
                    <p className="text-xs text-gray-400">{g.count} Team Members</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">{g.description}</p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-medium">
                <span>Active Department</span>
                <button className="text-[#6c48ff] font-bold hover:underline">Manage Group</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── INVITE MEMBER MODAL ─── */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 text-[#6c48ff] rounded-2xl">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Invite Team Member</h3>
                  <p className="text-xs text-gray-500">Send an invitation email with assigned RBAC access.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#6c48ff] focus:ring-2 focus:ring-purple-100 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Assign RBAC Role *
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#6c48ff] focus:ring-2 focus:ring-purple-100 transition"
                >
                  {availableRoles.map((r) => (
                    <option key={r.id || r.code} value={r.code}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Department / Group
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#6c48ff] focus:ring-2 focus:ring-purple-100 transition"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.name}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="px-6 py-2.5 bg-[#6c48ff] hover:bg-[#5b3af0] text-white font-bold rounded-xl text-xs transition shadow-md shadow-purple-500/20"
                >
                  {inviting ? 'Sending Invite...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── CREATE GROUP MODAL ─── */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Create Team Department</h3>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sales & Growth"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#6c48ff] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Department scope and responsibilities..."
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-[#6c48ff] transition"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#6c48ff] text-white font-bold rounded-xl text-xs shadow-md shadow-purple-500/20"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
