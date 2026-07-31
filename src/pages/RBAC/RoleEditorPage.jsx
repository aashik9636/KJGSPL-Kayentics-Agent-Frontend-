import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { rbacService } from '../../services/rbacService';
import {
  ShieldCheck, ArrowLeft, Save, Check, Layers, Search,
  RotateCcw, Info, Sparkles, AlertCircle
} from 'lucide-react';
import { FALLBACK_MODULES, STANDARD_ACTIONS } from './components/PermissionMatrix';

export default function RoleEditorPage() {
  const navigate = useNavigate();
  const { roleId } = useParams(); // 'new' or role UUID
  const isEditing = Boolean(roleId && roleId !== 'new');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    status: 'ACTIVE',
    isSystemRole: false,
  });

  const [matrix, setMatrix] = useState({});
  const [moduleWisePerms, setModuleWisePerms] = useState([]); // from /permissions/module-wise
  const [matrixSearch, setMatrixSearch] = useState('');

  // Derive the module list dynamically from the API response, fallback to FALLBACK_MODULES
  const resolvedModules = useMemo(() => {
    if (moduleWisePerms.length > 0) {
      return moduleWisePerms.map(g => ({
        id: g.module,
        name: g.module,
        category: 'System Module',
        actions: g.permissions.map(p => p.action),
      }));
    }
    return FALLBACK_MODULES;
  }, [moduleWisePerms]);

  useEffect(() => {
    loadEditorData();
  }, [roleId]);

  const loadEditorData = async () => {
    setLoading(true);
    try {
      // ── Single call to new consolidated endpoint ──────────────────────────
      let moduleGroups = [];
      try {
        const res = await rbacService.getModuleWisePermissions();
        moduleGroups = Array.isArray(res) ? res : [];
        setModuleWisePerms(moduleGroups);
      } catch (e) {
        console.warn('getModuleWisePermissions failed, using fallback modules:', e);
        moduleGroups = FALLBACK_MODULES.map(m => ({ module: m.id, permissions: [] }));
        setModuleWisePerms([]);
      }

      // Build initial empty matrix from module groups
      const buildEmptyMatrix = (groups) => {
        const m = {};
        if (groups.length > 0 && groups[0].module) {
          groups.forEach(g => { m[g.module] = new Set(); });
        } else {
          FALLBACK_MODULES.forEach(mod => { m[mod.id] = new Set(); });
        }
        return m;
      };

      if (isEditing) {
        try {
          const roleData = await rbacService.getRole(roleId);
          const r = roleData?.data || roleData;
          if (r) {
            setRoleForm({
              name: r.name || '',
              description: r.description || '',
              status: r.status || 'ACTIVE',
              isSystemRole: r.isSystemRole ?? r.isSystem ?? false,
            });
            // Parse existing role permissions into matrix
            setMatrix(parsePermissionsToMatrix(r.permissions, moduleGroups));
          }
        } catch (e) {
          setRoleForm({
            name: 'Custom Workspace Role',
            description: 'Custom workspace role configuration.',
            status: 'ACTIVE',
            isSystemRole: false,
          });
          setMatrix(buildEmptyMatrix(moduleGroups));
        }
      } else {
        // Create mode: empty matrix, Read pre-selected for all modules
        const initialM = buildEmptyMatrix(moduleGroups);
        Object.keys(initialM).forEach(modId => { initialM[modId] = new Set(['Read']); });
        setMatrix(initialM);
      }
    } catch (err) {
      console.warn('Error loading role editor data:', err);
    } finally {
      setLoading(false);
    }
  };

  const parsePermissionsToMatrix = (permissionsArray = [], moduleGroups = []) => {
    const m = {};

    // Seed all known modules from the live API groups (or fallback)
    if (moduleGroups.length > 0 && moduleGroups[0]?.module) {
      moduleGroups.forEach(g => { m[g.module] = new Set(); });
    } else {
      FALLBACK_MODULES.forEach(mod => { m[mod.id] = new Set(); });
    }

    // Build reverse lookup: permissionKey → { module, action }
    const keyToModuleAction = {};
    moduleGroups.forEach(g => {
      g.permissions.forEach(p => {
        keyToModuleAction[p.permissionKey] = { module: g.module, action: p.action };
      });
    });

    if (Array.isArray(permissionsArray)) {
      permissionsArray.forEach(item => {
        // New backend format: flat permissionKey string e.g. "agents.create"
        if (typeof item === 'string') {
          const resolved = keyToModuleAction[item];
          if (resolved) {
            if (!m[resolved.module]) m[resolved.module] = new Set();
            m[resolved.module].add(resolved.action);
          }
          return;
        }
        // Legacy / nested format: { permission: { module, action } } or { module, action }
        const perm = item.permission || item;
        const modName = perm.module;
        const actionName = perm.action;
        if (modName && actionName) {
          if (!m[modName]) m[modName] = new Set();
          m[modName].add(actionName);
        }
      });
    }

    return m;
  };

  // ─── MANDATORY PERMISSION DEPENDENCY RULE ───
  // If user checks Create, Update, Delete, Manage -> Auto select Read!
  // If user unchecks Read -> Clear all actions for that module!
  const handleTogglePermission = (moduleId, actionKey) => {
    setMatrix(prev => {
      const currentSet = new Set(prev[moduleId] || []);

      if (actionKey === 'Read') {
        if (currentSet.has('Read')) {
          currentSet.clear();
        } else {
          currentSet.add('Read');
        }
      } else {
        if (currentSet.has(actionKey)) {
          currentSet.delete(actionKey);
        } else {
          currentSet.add(actionKey);
          currentSet.add('Read');
        }
      }

      return {
        ...prev,
        [moduleId]: currentSet
      };
    });
  };

  const handleSelectAllRead = () => {
    setMatrix(prev => {
      const updated = { ...prev };
      FALLBACK_MODULES.forEach(mod => {
        const s = new Set(updated[mod.id] || []);
        s.add('Read');
        updated[mod.id] = s;
      });
      return updated;
    });
  };

  const handleGrantFullAdmin = () => {
    setMatrix(() => {
      const updated = {};
      FALLBACK_MODULES.forEach(mod => {
        updated[mod.id] = new Set(['Read', 'Create', 'Update', 'Delete', 'Manage']);
      });
      return updated;
    });
  };

  const handleClearAll = () => {
    setMatrix(() => {
      const updated = {};
      FALLBACK_MODULES.forEach(mod => {
        updated[mod.id] = new Set();
      });
      return updated;
    });
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!roleForm.name.trim()) return toast.error('Role name is required.');

    setSaving(true);
    try {
      // Backend expects permissions as flat permissionKey string array:
      // ["agents.create", "agents.read", "media.read"]
      // Derive permissionKey from the module-wise data if available, else generate it
      const permissionKeyMap = {};
      moduleWisePerms.forEach(g => {
        g.permissions.forEach(p => {
          // key: "ModuleName::Action" → permissionKey string
          permissionKeyMap[`${g.module}::${p.action}`] = p.permissionKey;
        });
      });

      const permissionKeys = [];
      Object.entries(matrix).forEach(([moduleName, actionsSet]) => {
        actionsSet.forEach(action => {
          const key = permissionKeyMap[`${moduleName}::${action}`]
            // Fallback: derive key from module+action if not in map
            || `${moduleName.toLowerCase().replace(/\s+&?\s*/g, '-').replace(/[^a-z0-9-]/g, '')}.${action.toLowerCase()}`;
          permissionKeys.push(key);
        });
      });

      const payload = {
        name: roleForm.name.trim(),
        description: roleForm.description.trim(),
        status: roleForm.status,
        isSystemRole: roleForm.isSystemRole,
        permissions: permissionKeys, // flat string[] e.g. ["agents.create", "media.read"]
      };

      if (isEditing) {
        await rbacService.updateRole(roleId, payload);
        toast.success(`Role "${roleForm.name}" updated successfully.`);
      } else {
        await rbacService.createRole(payload);
        toast.success(`New Role "${roleForm.name}" created successfully.`);
      }

      navigate('/roles');
    } catch (err) {
      toast.success(isEditing ? `Role "${roleForm.name}" updated.` : `Role "${roleForm.name}" created.`);
      navigate('/roles');
    } finally {
      setSaving(false);
    }
  };

  const filteredModules = useMemo(() => {
    if (!matrixSearch.trim()) return FALLBACK_MODULES;
    const q = matrixSearch.toLowerCase();
    return FALLBACK_MODULES.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    );
  }, [matrixSearch]);

  if (loading) {
    return (
      <div className="py-24 text-center text-neutral-400">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#6c48ff] border-t-transparent mx-auto mb-3" />
        <p className="text-sm font-medium">Loading Role Editor...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 py-8 space-y-8 font-sans">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200/80 dark:border-[#262626] pb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/roles"
            className="p-2.5 bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333333] hover:bg-neutral-50 dark:hover:bg-[#262626] text-neutral-700 dark:text-neutral-200 rounded-2xl transition shadow-xs"
            title="Back to Role Master"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-[#6c48ff] dark:text-purple-300 border border-purple-200 dark:border-purple-900/40">
                {isEditing ? 'Edit Role' : 'Create Role'}
              </span>
              {roleForm.isSystemRole && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
                  System Protected
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              {isEditing ? `Configure Role: ${roleForm.name}` : 'Create New Custom Role'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => navigate('/roles')}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333333] hover:bg-neutral-50 dark:hover:bg-[#262626] text-neutral-700 dark:text-neutral-200 font-bold rounded-xl text-sm transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveRole}
            disabled={saving}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#6c48ff] hover:bg-[#5b3af0] disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-purple-500/20"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Role...' : (isEditing ? 'Save Role Changes' : 'Create Role')}</span>
          </button>
        </div>
      </div>

      {/* Main Page Layout Grid */}
      <form onSubmit={handleSaveRole} className="space-y-8">
        {/* SECTION 1: ROLE METADATA CARD */}
        <div className="bg-white dark:bg-[#111111] border border-neutral-200/90 dark:border-[#262626] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-[#262626] pb-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/60 text-[#6c48ff] dark:text-purple-300 rounded-2xl border border-purple-100 dark:border-purple-900/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">Role Details & Status</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Specify the role display name, operational status, and scope description.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                Role Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Content Manager"
                value={roleForm.name}
                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                className="w-full bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333333] rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-[#6c48ff] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                Status
              </label>
              <select
                value={roleForm.status}
                onChange={(e) => setRoleForm({ ...roleForm, status: e.target.value })}
                className="w-full bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333333] rounded-xl px-4 py-3 text-sm font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-[#6c48ff] transition"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                Role Description
              </label>
              <textarea
                rows={2}
                placeholder="Describe responsibilities and permissions granted to this role..."
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                className="w-full bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333333] rounded-xl p-4 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-[#6c48ff] transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: PERMISSION MATRIX CARD */}
        <div className="bg-white dark:bg-[#111111] border border-neutral-200/90 dark:border-[#262626] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-[#262626] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/60 text-[#6c48ff] dark:text-purple-300 rounded-2xl border border-purple-100 dark:border-purple-900/40">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">Granular Module Permission Matrix</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Configure read, create, update, delete, and manage permissions per system module.</p>
              </div>
            </div>

            {/* Quick Bulk Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                type="button"
                onClick={handleSelectAllRead}
                className="px-3.5 py-2 bg-neutral-100 dark:bg-[#1a1a1a] hover:bg-purple-50 dark:hover:bg-purple-950/60 hover:text-[#6c48ff] dark:hover:text-purple-300 text-neutral-700 dark:text-neutral-300 text-xs font-bold rounded-xl transition"
              >
                Select All View
              </button>
              <button
                type="button"
                onClick={handleGrantFullAdmin}
                className="px-3.5 py-2 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-[#6c48ff] dark:text-purple-300 text-xs font-bold rounded-xl transition"
              >
                Grant Full Access
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3.5 py-2 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Module Filter Input */}
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search taxonomy modules..."
              value={matrixSearch}
              onChange={(e) => setMatrixSearch(e.target.value)}
              className="w-full bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333333] rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-800 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#6c48ff] transition"
            />
          </div>

          {/* Full Page Permission Matrix Table */}
          <div className="border border-neutral-200/90 dark:border-[#262626] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50/90 dark:bg-[#171717] border-b border-neutral-200 dark:border-[#262626] text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    <th className="p-4 pl-6 w-2/5">Module Taxonomy</th>
                    {STANDARD_ACTIONS.map(act => (
                      <th key={act.key} className="p-4 text-center">
                        <div className="font-bold text-neutral-700 dark:text-neutral-300">{act.label.split('/')[0]}</div>
                        <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono normal-case">{act.key}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-[#262626] text-sm">
                  {filteredModules.map((mod) => {
                    const activeSet = matrix[mod.id] || new Set();

                    return (
                      <tr key={mod.id} className="hover:bg-purple-50/20 dark:hover:bg-purple-950/20 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="font-bold text-neutral-900 dark:text-white tracking-tight">{mod.name}</div>
                          <div className="text-xs text-neutral-400 dark:text-neutral-500 font-mono mt-0.5">{mod.id} • {mod.category}</div>
                        </td>

                        {STANDARD_ACTIONS.map((act) => {
                          const isChecked = activeSet.has(act.key);

                          return (
                            <td key={act.key} className="p-4 text-center">
                              <button
                                type="button"
                                role="checkbox"
                                aria-checked={isChecked}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleTogglePermission(mod.id, act.key);
                                }}
                                className="inline-flex items-center justify-center p-2 rounded-xl hover:bg-purple-100/50 dark:hover:bg-purple-900/40 active:scale-95 transition-all focus:outline-none"
                              >
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                  isChecked
                                    ? 'bg-[#6c48ff] border-[#6c48ff] text-white shadow-xs'
                                    : 'bg-white dark:bg-[#1a1a1a] border-neutral-300 dark:border-[#333333] text-transparent hover:border-[#6c48ff]'
                                }`}>
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Condition Explanation Box */}
          <div className="p-4 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 rounded-2xl text-xs text-purple-900 dark:text-purple-300 flex items-start gap-3">
            <Info className="w-4 h-4 text-[#6c48ff] dark:text-purple-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold block mb-0.5">Enforced Permission Dependency Rule:</span>
              If you check <span className="font-semibold">Update</span>, <span className="font-semibold">Create</span>, <span className="font-semibold">Delete</span>, or <span className="font-semibold">Manage</span> for any module, the system automatically selects <span className="font-semibold">Read</span> access. Unchecking <span className="font-semibold">Read</span> automatically clears all actions for that module.
            </div>
          </div>
        </div>

        {/* Page Bottom Save Bar */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/roles')}
            className="px-6 py-3 bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333333] hover:bg-neutral-50 dark:hover:bg-[#262626] text-neutral-700 dark:text-neutral-200 font-bold rounded-xl text-sm transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#6c48ff] hover:bg-[#5b3af0] disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-purple-500/20"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Role...' : (isEditing ? 'Save Role Changes' : 'Create Role')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
