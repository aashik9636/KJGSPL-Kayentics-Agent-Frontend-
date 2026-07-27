import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { superAdminService } from '../../services/superAdminService';
import { auditLogService } from '../../services/auditLogService';
import { FileText, Search, RefreshCw, User as UserIcon, Globe, Eye, X } from 'lucide-react';
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
  }, [page, moduleFilter, actionFilter, location.pathname]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const queryParams = {
        page,
        limit: 25,
        search: userSearch || undefined,
        module: moduleFilter || undefined,
        action: actionFilter || undefined,
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-bold flex items-center gap-2 ${isSuperAdminPath ? 'text-white' : 'text-gray-900'}`}>
          <FileText className="w-6 h-6 text-amber-500" />
          <span>{isSuperAdminPath ? 'Platform Audit Trail & System Security Logs' : 'Company Audit Trail & Team Activity'}</span>
        </h2>
        <p className={`text-sm mt-1 ${isSuperAdminPath ? 'text-gray-400' : 'text-gray-500'}`}>
          {isSuperAdminPath
            ? 'Complete, tamper-evident audit history across all tenant organizations and system modules.'
            : 'Track actions, logins, role changes, and data mutations performed by users in your company.'}
        </p>
      </div>

      {/* Search & Filter Bar */}
      <form onSubmit={handleSearchSubmit} className={`flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl border ${isSuperAdminPath ? 'bg-gray-900/90 border-gray-800' : 'bg-white border-gray-200/80 shadow-sm'}`}>
        <div className="relative flex-1 w-full">
          <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by user email, user name, or resource..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className={`w-full border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-amber-500 ${
              isSuperAdminPath ? 'bg-gray-800 border-gray-700/60 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
            }`}
          />
        </div>

        <input
          type="text"
          placeholder="Filter by module..."
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className={`w-full sm:w-48 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 ${
            isSuperAdminPath ? 'bg-gray-800 border-gray-700/60 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
          }`}
        />

        <input
          type="text"
          placeholder="Filter by action..."
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className={`w-full sm:w-48 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 ${
            isSuperAdminPath ? 'bg-gray-800 border-gray-700/60 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
          }`}
        />

        <button type="submit" className="w-full sm:w-auto px-5 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm">
          <Search className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </form>

      {/* Table */}
      <div className={`border rounded-2xl overflow-hidden shadow-sm ${isSuperAdminPath ? 'bg-gray-900/90 border-gray-800' : 'bg-white border-gray-200'}`}>
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm font-medium">
            No audit log records found matching your user search or module filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full text-left text-sm ${isSuperAdminPath ? 'text-gray-300' : 'text-gray-700'}`}>
              <thead className={`text-xs uppercase font-semibold border-b ${isSuperAdminPath ? 'bg-gray-800/60 text-gray-400 border-gray-800' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Actor / User</th>
                  <th className="px-6 py-4">Module</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">IP & Device</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isSuperAdminPath ? 'divide-gray-800/60' : 'divide-gray-100'}`}>
                {logs.map((log) => {
                  const actorEmail = log.user?.email || (log.user?.firstName ? `${log.user.firstName} ${log.user.lastName || ''}`.trim() : null) || 'System / Service';
                  return (
                    <tr key={log.id} className={`transition ${isSuperAdminPath ? 'hover:bg-gray-800/40' : 'hover:bg-gray-50/80'}`}>
                      <td className="px-6 py-4 text-xs font-mono text-gray-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-600 font-bold text-xs flex items-center justify-center border border-amber-500/20 shrink-0">
                            {actorEmail[0].toUpperCase()}
                          </div>
                          <div>
                            <div className={`font-semibold text-xs ${isSuperAdminPath ? 'text-white' : 'text-gray-900'}`}>{actorEmail}</div>
                            {log.user?.id && <div className="text-[10px] text-gray-400 font-mono">ID: {log.user.id.substring(0, 8)}...</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded text-xs font-mono bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                          {log.module}
                        </span>
                      </td>
                      <td className={`px-6 py-4 font-medium ${isSuperAdminPath ? 'text-white' : 'text-gray-900'}`}>{log.action}</td>
                      <td className="px-6 py-4 text-xs font-mono text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-gray-400" />
                          <span>{log.ipAddress || '127.0.0.1'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-[#6c48ff] border border-purple-200 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Diff</span>
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

      {/* JSON Diff & Audit Details Drawer Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#6c48ff]" />
                  <span>Audit Entry Details</span>
                </h3>
                <span className="text-xs text-gray-400 font-mono">ID: {selectedLog.id}</span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-400 font-semibold block mb-1">Actor Email</span>
                <span className="text-gray-900 font-bold">{selectedLog.user?.email || 'System'}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-800">
                <span className="text-gray-400 font-semibold block mb-1">IP Address</span>
                <span className="text-gray-900 font-mono">{selectedLog.ipAddress || '127.0.0.1'}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-400 font-semibold block mb-1">Module</span>
                <span className="text-[#6c48ff] font-mono font-bold">{selectedLog.module}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-400 font-semibold block mb-1">Action</span>
                <span className="text-gray-900 font-bold">{selectedLog.action}</span>
              </div>
            </div>

            {/* Old vs New State Diff */}
            {(selectedLog.oldValue || selectedLog.newValue) && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">State Mutation Payload</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedLog.oldValue && (
                    <div>
                      <span className="text-[11px] font-bold text-red-600 block mb-1.5">Previous State (oldValue)</span>
                      <pre className="bg-red-950/10 p-3 rounded-xl text-[11px] font-mono text-red-700 overflow-x-auto border border-red-200 max-h-48">
                        {JSON.stringify(selectedLog.oldValue, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedLog.newValue && (
                    <div>
                      <span className="text-[11px] font-bold text-emerald-600 block mb-1.5">New State (newValue)</span>
                      <pre className="bg-emerald-950/10 p-3 rounded-xl text-[11px] font-mono text-emerald-700 overflow-x-auto border border-emerald-200 max-h-48">
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
