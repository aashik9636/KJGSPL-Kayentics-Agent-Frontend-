import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { superAdminService } from '../../services/superAdminService';
import { auditLogService } from '../../services/auditLogService';
import { FileText, Search, RefreshCw, User as UserIcon, Globe, Eye, X, ShieldAlert, RotateCcw, Filter } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AuditLogs() {
  const location = useLocation();
  const isSuperAdminPath = location.pathname.startsWith('/superadmin');

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [page, location.pathname]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const queryParams = {
        page,
        limit: 50,
      };

      const res = isSuperAdminPath
        ? await superAdminService.getAuditLogs(queryParams)
        : await auditLogService.getAuditLogs(queryParams);

      const logItems =
        res?.items ||
        res?.data?.items ||
        res?.data ||
        (Array.isArray(res) ? res : []);

      setLogs(Array.isArray(logItems) ? logItems : []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      toast.error('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setUserSearch('');
    setModuleFilter('');
    setActionFilter('');
    setPage(1);
  };

  // ─── SENSIBLE REAL-TIME FILTERING ───
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const q = userSearch.trim().toLowerCase();
      const matchesSearch = !q || (
        log.user?.email?.toLowerCase().includes(q) ||
        log.user?.firstName?.toLowerCase().includes(q) ||
        log.user?.lastName?.toLowerCase().includes(q) ||
        log.action?.toLowerCase().includes(q) ||
        log.module?.toLowerCase().includes(q) ||
        log.ipAddress?.toLowerCase().includes(q)
      );

      const mod = (log.module || '').toUpperCase();
      const matchesModule = !moduleFilter || mod.includes(moduleFilter.toUpperCase());

      const act = (log.action || '').toUpperCase();
      const matchesAction = !actionFilter || act.includes(actionFilter.toUpperCase());

      return matchesSearch && matchesModule && matchesAction;
    });
  }, [logs, userSearch, moduleFilter, actionFilter]);

  const hasActiveFilters = Boolean(userSearch.trim() || moduleFilter || actionFilter);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 pb-8 pt-2 space-y-6 font-sans">
      {/* Header Banner - Clean White Aesthetic */}
      <div className="bg-white dark:bg-[#111111] border border-neutral-200/90 dark:border-[#262626] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-[#6c48ff] dark:text-purple-300 text-xs font-semibold border border-purple-100 dark:border-purple-900/40">
            <FileText className="w-4 h-4" /> Audit Trail & System Security Logs
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {isSuperAdminPath ? 'Platform Audit Trail & Security Logs' : 'Company Audit Trail & Team Activity'}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            {isSuperAdminPath
              ? 'Complete, tamper-evident audit history across all tenant organizations and system modules.'
              : 'Track actions, logins, role changes, and data mutations performed by users in your company.'}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333333] hover:bg-neutral-50 dark:hover:bg-[#262626] text-neutral-700 dark:text-neutral-200 font-bold rounded-xl text-xs transition shadow-xs shrink-0"
        >
          <RefreshCw className={`w-4 h-4 text-neutral-500 dark:text-neutral-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Sensible Search & Filter Bar */}
      <div className="bg-white dark:bg-[#111111] border border-neutral-200/90 dark:border-[#262626] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by user email, actor name, IP, or resource..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-full bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333333] rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#6c48ff] transition"
          />
        </div>

        {/* Module Selector Dropdown */}
        <div className="w-full md:w-56 shrink-0">
          <select
            value={moduleFilter}
            onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }}
            className="w-full bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333333] rounded-xl px-3.5 py-2.5 text-xs font-bold text-neutral-800 dark:text-white focus:outline-none focus:border-[#6c48ff] transition"
          >
            <option value="">All System Modules</option>
            <option value="ROLE">RBAC & Roles</option>
            <option value="TEAM">Teams & Members</option>
            <option value="USER">Users & Auth</option>
            <option value="AGENT">AI Agents</option>
            <option value="KNOWLEDGE">Knowledge Base</option>
            <option value="STORAGE">Content & Media Hub</option>
            <option value="SUBSCRIPTION">Subscriptions & Billing</option>
            <option value="WORKSPACE">Workspace Settings</option>
          </select>
        </div>

        {/* Action Type Selector Dropdown */}
        <div className="w-full md:w-48 shrink-0">
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="w-full bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333333] rounded-xl px-3.5 py-2.5 text-xs font-bold text-neutral-800 dark:text-white focus:outline-none focus:border-[#6c48ff] transition"
          >
            <option value="">All Action Types</option>
            <option value="CREATE">CREATE / ADD</option>
            <option value="UPDATE">UPDATE / EDIT</option>
            <option value="DELETE">DELETE / REMOVE</option>
            <option value="LOGIN">LOGIN / AUTH</option>
            <option value="EXECUTE">EXECUTE / RUN</option>
          </select>
        </div>

        {/* Reset Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="w-full md:w-auto px-4 py-2.5 bg-neutral-100 dark:bg-[#1a1a1a] hover:bg-neutral-200 dark:hover:bg-[#262626] text-neutral-700 dark:text-neutral-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111111] border border-neutral-200/90 dark:border-[#262626] rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="w-full">
            <div className="h-12 bg-neutral-50 dark:bg-[#171717] border-b border-neutral-100 dark:border-[#262626]"></div>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex items-center p-4 border-b border-neutral-100 dark:border-[#262626] animate-pulse">
                <div className="w-[15%] px-4"><div className="h-4 bg-neutral-200 dark:bg-[#222222] rounded w-24"></div></div>
                <div className="w-[15%] px-4"><div className="h-4 bg-neutral-100 dark:bg-[#1a1a1a] rounded w-20"></div></div>
                <div className="w-[15%] px-4"><div className="h-6 bg-neutral-200 dark:bg-[#222222] rounded-full w-16"></div></div>
                <div className="w-[40%] px-4"><div className="h-4 bg-neutral-100 dark:bg-[#1a1a1a] rounded w-3/4"></div></div>
                <div className="w-[15%] px-4"><div className="h-4 bg-neutral-100 dark:bg-[#1a1a1a] rounded w-24"></div></div>
              </div>
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-16 text-center text-neutral-400 dark:text-neutral-500 space-y-3">
            <ShieldAlert className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto" />
            <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">No audit log records found</p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-sm mx-auto mb-3">
              No activity logs matched your current search query or module dropdown filters.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 bg-purple-50 dark:bg-purple-950/60 text-[#6c48ff] dark:text-purple-300 hover:bg-purple-100 font-bold text-xs rounded-xl transition"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-700 dark:text-neutral-300 border-collapse">
              <thead>
                <tr className="bg-neutral-50/90 dark:bg-[#171717] border-b border-neutral-200 dark:border-[#262626] text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Actor / User</th>
                  <th className="px-6 py-4">Module</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">IP & Device</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredLogs.map((log) => {
                  const actorEmail = log.user?.email || (log.user?.firstName ? `${log.user.firstName} ${log.user.lastName || ''}`.trim() : null) || 'System / Service';
                  return (
                    <tr key={log.id || log.createdAt} className="hover:bg-purple-50/20 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-neutral-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#6c48ff] font-extrabold text-xs flex items-center justify-center border border-purple-100 shrink-0">
                            {actorEmail[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-neutral-900">{actorEmail}</div>
                            {log.user?.id && <div className="text-[10px] text-neutral-400 font-mono">ID: {log.user.id.substring(0, 8)}...</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-purple-50 text-[#6c48ff] border border-purple-100 font-bold uppercase">
                          {log.module}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-neutral-900 text-xs uppercase">{log.action}</td>
                      <td className="px-6 py-4 text-xs font-mono text-neutral-500">
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{log.ipAddress || '127.0.0.1'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#6c48ff] border border-purple-100 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
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

      {/* Audit Entry Details Drawer Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fade-in">
          <div className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 text-[#6c48ff] rounded-2xl border border-purple-100">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Audit Entry Details</h3>
                  <span className="text-xs text-neutral-400 font-mono">ID: {selectedLog.id}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-2 text-neutral-400 hover:text-neutral-700 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-neutral-50/80 p-3.5 rounded-2xl border border-neutral-100">
                <span className="text-neutral-400 font-semibold block mb-1">Actor Email</span>
                <span className="text-neutral-900 font-bold">{selectedLog.user?.email || 'System'}</span>
              </div>
              <div className="bg-neutral-50/80 p-3.5 rounded-2xl border border-neutral-100">
                <span className="text-neutral-400 font-semibold block mb-1">IP Address</span>
                <span className="text-neutral-900 font-mono">{selectedLog.ipAddress || '127.0.0.1'}</span>
              </div>
              <div className="bg-neutral-50/80 p-3.5 rounded-2xl border border-neutral-100">
                <span className="text-neutral-400 font-semibold block mb-1">Module</span>
                <span className="text-[#6c48ff] font-mono font-bold uppercase">{selectedLog.module}</span>
              </div>
              <div className="bg-neutral-50/80 p-3.5 rounded-2xl border border-neutral-100">
                <span className="text-neutral-400 font-semibold block mb-1">Action</span>
                <span className="text-neutral-900 font-bold uppercase">{selectedLog.action}</span>
              </div>
            </div>

            {/* Old vs New State Diff */}
            {(selectedLog.oldValue || selectedLog.newValue) && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">State Mutation Payload</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedLog.oldValue && (
                    <div>
                      <span className="text-[11px] font-bold text-red-600 block mb-1.5">Previous State (oldValue)</span>
                      <pre className="bg-red-50 p-3 rounded-2xl text-[11px] font-mono text-red-700 overflow-x-auto border border-red-200 max-h-48">
                        {JSON.stringify(selectedLog.oldValue, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedLog.newValue && (
                    <div>
                      <span className="text-[11px] font-bold text-emerald-600 block mb-1.5">New State (newValue)</span>
                      <pre className="bg-emerald-50 p-3 rounded-2xl text-[11px] font-mono text-emerald-700 overflow-x-auto border border-emerald-200 max-h-48">
                        {JSON.stringify(selectedLog.newValue, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
