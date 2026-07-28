import React from 'react';
import { ShieldCheck, X } from 'lucide-react';
import PermissionMatrix from './PermissionMatrix';

export default function RoleModal({
  isOpen,
  onClose,
  editingRole,
  roleForm,
  setRoleForm,
  matrix,
  dynamicPermissions = [],
  dynamicModules = [],
  onTogglePermission,
  onSelectAllRead,
  onGrantFullAdmin,
  onClearAll,
  onSave,
  saving
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4 md:p-6 overflow-hidden">
      {/* 
        Modal Dialog Card:
        Fixed viewport height (h-[85vh] max-h-[850px]), perfectly centered, flex-col layout.
      */}
      <div className="relative bg-white rounded-3xl max-w-4xl w-full h-[85vh] max-h-[850px] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* 1. FIXED HEADER (Never scrolls) */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-[#6c48ff] rounded-2xl border border-purple-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                {editingRole ? `Edit Role: ${editingRole.name}` : 'Create Custom Role'}
              </h2>
              <p className="text-xs text-gray-500">Configure role metadata and set granular permission matrix rules.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. SCROLLABLE MIDDLE BODY (ONLY this container scrolls) */}
        <form
          id="role-master-form"
          onSubmit={onSave}
          className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-thin scroll-smooth"
        >
          {/* Metadata Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/60 p-6 rounded-2xl border border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Role Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Content Manager"
                value={roleForm.name}
                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#6c48ff] focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Status
              </label>
              <select
                value={roleForm.status}
                onChange={(e) => setRoleForm({ ...roleForm, status: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:border-[#6c48ff] focus:ring-2 focus:ring-purple-100 transition-all"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                rows={2}
                placeholder="Describe responsibilities and permissions granted to this role..."
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-900 focus:outline-none focus:border-[#6c48ff] focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>
          </div>

          {/* Dynamic Permission Matrix Component */}
          <PermissionMatrix
            matrix={matrix}
            dynamicPermissions={dynamicPermissions}
            dynamicModules={dynamicModules}
            onTogglePermission={onTogglePermission}
            onSelectAllRead={onSelectAllRead}
            onGrantFullAdmin={onGrantFullAdmin}
            onClearAll={onClearAll}
          />
        </form>

        {/* 3. FIXED FOOTER (Outside form scroll container, always visible at bottom) */}
        <div className="px-8 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/90 shrink-0 z-20">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-sm transition-colors shadow-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="role-master-form"
            disabled={saving}
            className="px-8 py-2.5 bg-[#6c48ff] hover:bg-[#5b3af0] disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-purple-500/20"
          >
            {saving ? 'Saving Role...' : (editingRole ? 'Update Role & Matrix' : 'Create Role')}
          </button>
        </div>

      </div>
    </div>
  );
}
