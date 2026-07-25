import React, { useEffect, useState } from 'react';
import { superAdminService } from '../../services/superAdminService';
import { FileText, Search, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [page, moduleFilter, actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await superAdminService.getAuditLogs({
        page,
        limit: 20,
        module: moduleFilter || undefined,
        action: actionFilter || undefined,
      });
      setLogs(res.items || []);
    } catch (err) {
      console.error('Failed to load platform audit logs:', err);
      toast.error('Failed to load platform audit logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-amber-400" /> Platform Audit Trail & System Security Logs
        </h2>
        <p className="text-sm text-gray-400">Complete, tamper-evident audit history across all tenant organizations and system modules.</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-gray-900/90 p-4 rounded-2xl border border-gray-800">
        <input
          type="text"
          placeholder="Filter by module name..."
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700/60 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
        />
        <input
          type="text"
          placeholder="Filter by action..."
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700/60 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
        />
        <button onClick={fetchLogs} className="px-4 py-2 bg-amber-500 text-gray-950 font-bold text-sm rounded-xl">
          Refresh Logs
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No audit logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-800/60 text-xs uppercase text-gray-400 font-semibold border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Organization</th>
                  <th className="px-6 py-4">Actor / User</th>
                  <th className="px-6 py-4">Module</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-800/40">
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {log.organization?.name || 'Platform System'}
                    </td>
                    <td className="px-6 py-4">
                      {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-xs font-mono bg-gray-800 text-amber-400 border border-gray-700">
                        {log.module}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{log.action}</td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
