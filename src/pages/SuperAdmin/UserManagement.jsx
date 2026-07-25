import React, { useEffect, useState } from 'react';
import { superAdminService } from '../../services/superAdminService';
import { Users, Search, Shield, CheckCircle, XCircle, RefreshCw, X, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await superAdminService.getUsers({
        page,
        limit: 15,
        search,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      });
      setUsers(res.items || []);
      setPagination(res.pagination || { totalPages: 1 });
    } catch (err) {
      console.error('Failed to load users:', err);
      toast.error('Failed to load users directory');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await superAdminService.updateUserStatus(userId, nextStatus);
      toast.success(`User status updated to ${nextStatus}`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handlePromoteRole = async (userId, newRole) => {
    try {
      await superAdminService.promoteUserRole(userId, newRole);
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user role');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-amber-400" /> Global User Directory & RBAC
        </h2>
        <p className="text-sm text-gray-400">Search, manage account access, and promote accounts to platform Superadmin privileges.</p>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 bg-gray-900/90 p-4 rounded-2xl border border-gray-800">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search by user name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800/80 border border-gray-700/60 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="bg-gray-800/80 border border-gray-700/60 rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-amber-400"
        >
          <option value="">All System Roles</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
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

      {/* Users Table */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-800/60 text-xs uppercase text-gray-400 font-semibold border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Platform Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {users.map((u) => {
                  const isSuperAdmin = u.role === 'SUPER_ADMIN';
                  const isActive = u.status === 'ACTIVE';
                  return (
                    <tr key={u.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="px-6 py-4 text-gray-300">{u.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => handlePromoteRole(u.id, e.target.value)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1 border bg-gray-800 ${
                            isSuperAdmin ? 'text-amber-400 border-amber-500/40' : 'text-gray-300 border-gray-700'
                          }`}
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.status)}
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
    </div>
  );
}
