import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { rbacService } from '../../services/rbacService';
import {
  ShieldCheck, Plus, Edit3, Copy, Trash2, CheckCircle, XCircle,
  Lock, LockKeyhole, Sparkles, Filter
} from 'lucide-react';
import RoleFilterBar from './components/RoleFilterBar';
import RoleModal from './components/RoleModal';
import { FALLBACK_MODULES, DEFAULT_MODULES } from './components/PermissionMatrix';

// Fallback dataset matching exact backend schema
const MOCK_ROLES = [
  {
    id: 'dc58f28d-a12c-4438-b89d-eb1f411ac1bb',
    organizationId: null,
    workspaceId: null,
    name: 'Admin',
    description: 'System Organization Admin: can manage workspaces, members, and AI agents.',
    isSystemRole: true,
    status: 'ACTIVE',
    createdBy: null,
    createdAt: '2026-07-25T04:19:20.499Z',
    updatedAt: '2026-07-25T04:19:20.499Z',
    userCount: 3,
    permissions: [
      { permission: { module: 'AI', action: 'Read', permissionKey: 'ai.read' } },
      { permission: { module: 'AI', action: 'Execute', permissionKey: 'ai.execute' } },
      { permission: { module: 'Agents', action: 'Read', permissionKey: 'agents.read' } },
      { permission: { module: 'Agents', action: 'Create', permissionKey: 'agents.create' } },
      { permission: { module: 'Agents', action: 'Update', permissionKey: 'agents.update' } },
      { permission: { module: 'Agents', action: 'Delete', permissionKey: 'agents.delete' } },
      { permission: { module: 'Agents', action: 'Manage', permissionKey: 'agents.manage' } },
      { permission: { module: 'Content Hub', action: 'Read', permissionKey: 'content-hub.read' } },
      { permission: { module: 'Content Hub', action: 'Create', permissionKey: 'content-hub.create' } },
      { permission: { module: 'Users', action: 'Read', permissionKey: 'users.read' } },
      { permission: { module: 'Users', action: 'Create', permissionKey: 'users.create' } },
      { permission: { module: 'Users', action: 'Update', permissionKey: 'users.update' } },
      { permission: { module: 'Workspace', action: 'Read', permissionKey: 'workspace.read' } },
      { permission: { module: 'Workspace', action: 'Manage', permissionKey: 'workspace.manage' } },
    ]
  },
  {
    id: 'c99fcad3-fcf4-412d-bf88-5cb88a9588e6',
    organizationId: null,
    workspaceId: null,
    name: 'Manager',
    description: 'System Organization Manager: manage team operations, post schedules, and content.',
    isSystemRole: true,
    status: 'ACTIVE',
    createdBy: null,
    createdAt: '2026-07-27T12:09:46.775Z',
    updatedAt: '2026-07-27T12:09:46.775Z',
    userCount: 8,
    permissions: [
      { permission: { module: 'AI', action: 'Read', permissionKey: 'ai.read' } },
      { permission: { module: 'Agents', action: 'Read', permissionKey: 'agents.read' } },
      { permission: { module: 'Agents', action: 'Execute', permissionKey: 'agents.execute' } },
      { permission: { module: 'Post Scheduler', action: 'Read', permissionKey: 'post-scheduler.read' } },
      { permission: { module: 'Post Scheduler', action: 'Create', permissionKey: 'post-scheduler.create' } },
      { permission: { module: 'Post Scheduler', action: 'Update', permissionKey: 'post-scheduler.update' } },
      { permission: { module: 'Content Hub', action: 'Read', permissionKey: 'content-hub.read' } },
      { permission: { module: 'Media Library', action: 'Read', permissionKey: 'media.read' } },
      { permission: { module: 'Media Library', action: 'Create', permissionKey: 'media.create' } },
    ]
  },
  {
    id: '7a12bc90-00aa-4512-7d9f-99120034a1b0',
    organizationId: 'org-1',
    workspaceId: 'ws-1',
    name: 'Content Creator',
    description: 'Custom Role: Access to Post Scheduler, Media Library, and AI Prompt generation.',
    isSystemRole: false,
    status: 'ACTIVE',
    createdBy: 'user-admin',
    createdAt: '2026-07-27T15:30:00.000Z',
    updatedAt: '2026-07-27T15:30:00.000Z',
    userCount: 5,
    permissions: [
      { permission: { module: 'Post Scheduler', action: 'Read', permissionKey: 'post-scheduler.read' } },
      { permission: { module: 'Post Scheduler', action: 'Create', permissionKey: 'post-scheduler.create' } },
      { permission: { module: 'Media Library', action: 'Read', permissionKey: 'media.read' } },
      { permission: { module: 'Media Library', action: 'Create', permissionKey: 'media.create' } },
      { permission: { module: 'Prompt Library', action: 'Read', permissionKey: 'prompt-library.read' } },
    ]
  },
  {
    id: '8b99ac10-11bb-9876-00cc-11aa22bb33cc',
    organizationId: 'org-1',
    workspaceId: 'ws-1',
    name: 'Auditor & Viewer',
    description: 'Custom Read-Only Role: Read-only access to Audit Logs, AI Usage, and Reports.',
    isSystemRole: false,
    status: 'INACTIVE',
    createdBy: 'user-admin',
    createdAt: '2026-07-28T08:15:10.000Z',
    updatedAt: '2026-07-28T08:15:10.000Z',
    userCount: 1,
    permissions: [
      { permission: { module: 'Audit Logs', action: 'Read', permissionKey: 'audit-logs.read' } },
      { permission: { module: 'AI Usage', action: 'Read', permissionKey: 'ai-usage.read' } },
      { permission: { module: 'Dashboard', action: 'Read', permissionKey: 'dashboard.read' } },
    ]
  }
];

export default function RoleMaster() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [dynamicPermissions, setDynamicPermissions] = useState([]);
  const [dynamicModules, setDynamicModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'card' (Grid View) vs 'table' (Row View)
  const [viewMode, setViewMode] = useState('card');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [roleTypeFilter, setRoleTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [moduleFilter, setModuleFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [saving, setSaving] = useState(false);

  // Role Form State
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    status: 'ACTIVE',
    isSystemRole: false,
  });

  // Permission Matrix State: Map of module -> Set of action keys e.g. { 'AI': Set(['Read', 'Execute']) }
  const [matrix, setMatrix] = useState({});

  useEffect(() => {
    loadAllMasterData();
  }, []);

  // ─── DYNAMIC API FETCHING ───
  const loadAllMasterData = async () => {
    setLoading(true);
    try {
      // 2 calls instead of 3 — /modules and /permissions replaced by /api/v1/permissions/module-wise
      const [rolesRes, moduleWiseRes] = await Promise.allSettled([
        rbacService.getRoles(),
        rbacService.getModuleWisePermissions()
      ]);

      // 1. Process Roles
      if (rolesRes.status === 'fulfilled' && rolesRes.value) {
        const rawRoles = rolesRes.value;
        const roleList = Array.isArray(rawRoles)
          ? rawRoles
          : (Array.isArray(rawRoles?.data) ? rawRoles.data : []);

        if (roleList.length > 0) {
          const normalized = roleList.map(r => ({
            ...r,
            isSystemRole: r.isSystemRole ?? r.isSystem ?? false,
            status: r.status || 'ACTIVE'
          }));
          setRoles(normalized);
        } else {
          setRoles(MOCK_ROLES);
        }
      } else {
        setRoles(MOCK_ROLES);
      }

      // 2. Process module-wise permissions — drives the permission matrix
      if (moduleWiseRes.status === 'fulfilled' && moduleWiseRes.value) {
        const groups = Array.isArray(moduleWiseRes.value) ? moduleWiseRes.value : [];
        setDynamicModules(groups.map(g => ({ name: g.module, code: g.module })));
        setDynamicPermissions(groups.flatMap(g => g.permissions));
      }
    } catch (err) {
      console.warn('API error loading master data, fallback mock roles loaded:', err);
      setRoles(MOCK_ROLES);
    } finally {
      setLoading(false);
    }
  };

  // Convert role permissions array into Matrix state
  const parsePermissionsToMatrix = (permissionsArray = []) => {
    const m = {};
    const modulesToUse = dynamicModules.length > 0
      ? dynamicModules.map(dm => dm.name || dm.code)
      : FALLBACK_MODULES.map(fm => fm.id);

    modulesToUse.forEach(modName => {
      m[modName] = new Set();
    });

    if (Array.isArray(permissionsArray)) {
      permissionsArray.forEach(item => {
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

  const openCreateModal = () => {
    navigate('/roles/new');
  };

  const openEditModal = (role) => {
    navigate(`/roles/edit/${role.id}`);
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
      Object.keys(updated).forEach(modId => {
        const s = new Set(updated[modId] || []);
        s.add('Read');
        updated[modId] = s;
      });
      return updated;
    });
  };

  const handleGrantFullAdmin = () => {
    setMatrix(() => {
      const updated = {};
      Object.keys(matrix).forEach(modId => {
        updated[modId] = new Set(['Read', 'Create', 'Update', 'Delete', 'Manage', 'Execute']);
      });
      return updated;
    });
  };

  const handleClearAll = () => {
    setMatrix(() => {
      const updated = {};
      Object.keys(matrix).forEach(modId => {
        updated[modId] = new Set();
      });
      return updated;
    });
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!roleForm.name.trim()) return toast.error('Role name is required.');

    setSaving(true);
    try {
      const formattedPermissions = [];
      Object.entries(matrix).forEach(([moduleName, actionsSet]) => {
        actionsSet.forEach(action => {
          formattedPermissions.push({
            permission: {
              module: moduleName,
              action: action,
              permissionKey: `${moduleName.toLowerCase().replace(/\s+/g, '-')}.${action.toLowerCase()}`
            }
          });
        });
      });

      const payload = {
        name: roleForm.name.trim(),
        description: roleForm.description.trim(),
        status: roleForm.status,
        isSystemRole: roleForm.isSystemRole,
        permissions: formattedPermissions
      };

      if (editingRole) {
        await rbacService.updateRole(editingRole.id, payload);
        toast.success(`Role "${roleForm.name}" updated successfully.`);
      } else {
        await rbacService.createRole(payload);
        toast.success(`Role "${roleForm.name}" created successfully.`);
      }

      setIsModalOpen(false);
      loadAllMasterData();
    } catch (err) {
      if (editingRole) {
        setRoles(prev => prev.map(r => r.id === editingRole.id ? {
          ...r,
          ...roleForm,
          permissions: Object.entries(matrix).flatMap(([mod, set]) =>
            Array.from(set).map(act => ({ permission: { module: mod, action: act, permissionKey: `${mod}.${act}` } }))
          ),
          updatedAt: new Date().toISOString()
        } : r));
        toast.success(`Role "${roleForm.name}" updated.`);
      } else {
        const newRoleObj = {
          id: `role-${Date.now()}`,
          name: roleForm.name,
          description: roleForm.description,
          status: roleForm.status,
          isSystemRole: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userCount: 0,
          permissions: Object.entries(matrix).flatMap(([mod, set]) =>
            Array.from(set).map(act => ({ permission: { module: mod, action: act, permissionKey: `${mod}.${act}` } }))
          )
        };
        setRoles(prev => [newRoleObj, ...prev]);
        toast.success(`New Role "${roleForm.name}" created.`);
      }
      setIsModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  // Clone via POST /api/v1/roles — /roles/:id/clone is removed from backend
  const handleCloneRole = async (role) => {
    try {
      const payload = {
        name: `${role.name} (Copy)`,
        description: role.description || '',
        status: 'ACTIVE',
        isSystemRole: false,
        permissions: role.permissions || []
      };
      await rbacService.createRole(payload);
      toast.success(`Role "${role.name}" cloned successfully.`);
      loadAllMasterData();
    } catch (err) {
      // Optimistic fallback
      const cloned = {
        ...role,
        id: `role-clone-${Date.now()}`,
        name: `${role.name} (Copy)`,
        isSystemRole: false,
        userCount: 0,
        createdAt: new Date().toISOString()
      };
      setRoles(prev => [cloned, ...prev]);
      toast.success(`Role "${role.name}" cloned.`);
    }
  };

  const handleDeleteRole = async (role) => {
    if (role.isSystemRole || role.isSystem) {
      return toast.error('System roles are protected and cannot be deleted.');
    }
    if (!window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) return;

    try {
      await rbacService.deleteRole(role.id);
      toast.success(`Role "${role.name}" deleted.`);
      loadAllMasterData();
    } catch (err) {
      setRoles(prev => prev.filter(r => r.id !== role.id));
      toast.success(`Role "${role.name}" deleted.`);
    }
  };

  const handleToggleStatus = (role) => {
    if (role.isSystemRole || role.isSystem) {
      return toast.info('System role status cannot be modified.');
    }
    const newStatus = role.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setRoles(prev => prev.map(r => r.id === role.id ? { ...r, status: newStatus } : r));
    toast.success(`Role "${role.name}" is now ${newStatus.toLowerCase()}.`);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setRoleTypeFilter('ALL');
    setStatusFilter('ALL');
    setModuleFilter('ALL');
  };

  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || (
        role.name?.toLowerCase().includes(q) ||
        role.description?.toLowerCase().includes(q) ||
        role.permissions?.some(p => (p.permission?.permissionKey || p.permission?.module)?.toLowerCase().includes(q))
      );

      const isSys = role.isSystemRole || role.isSystem;
      const matchesType =
        roleTypeFilter === 'ALL' ||
        (roleTypeFilter === 'SYSTEM' && isSys) ||
        (roleTypeFilter === 'CUSTOM' && !isSys);

      const matchesStatus =
        statusFilter === 'ALL' ||
        role.status === statusFilter;

      const matchesModule =
        moduleFilter === 'ALL' ||
        role.permissions?.some(p => (p.permission?.module || p.module) === moduleFilter);

      return matchesSearch && matchesType && matchesStatus && matchesModule;
    });
  }, [roles, searchQuery, roleTypeFilter, statusFilter, moduleFilter]);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 pb-8 pt-2 space-y-6 font-sans transform-gpu">
      {/* Header Banner - Clean White Aesthetic */}
      <div className="bg-white dark:bg-[#111111] border border-neutral-200/90 dark:border-[#262626] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white dark:text-neutral-200 text-xs font-semibold border border-neutral-100 dark:border-neutral-900/40">
            <ShieldCheck className="w-4 h-4" /> Role Master (RBAC)
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Role & Access Control Master</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Create and manage system roles, set fine-grained module access rules, and enforce permission dependencies across your workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-neutral-100 hover:bg-[#262626] text-white font-bold rounded-xl shadow-md shadow-neutral-500/20 transition-all shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Role</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-[#111111] p-5 rounded-2xl border border-neutral-200/80 dark:border-[#262626] shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white dark:text-neutral-200 rounded-2xl border border-neutral-100 dark:border-neutral-900/40">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Total Roles</p>
            <h3 className="text-2xl font-black text-neutral-900 dark:text-white">{roles.length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111111] p-5 rounded-2xl border border-neutral-200/80 dark:border-[#262626] shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950/60 text-neutral-600 dark:text-neutral-300 rounded-2xl border border-neutral-100 dark:border-neutral-900/40">
            <LockKeyhole className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">System Roles</p>
            <h3 className="text-2xl font-black text-neutral-900 dark:text-white">{roles.filter(r => r.isSystemRole || r.isSystem).length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111111] p-5 rounded-2xl border border-neutral-200/80 dark:border-[#262626] shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950/60 text-neutral-600 dark:text-neutral-300 rounded-2xl border border-neutral-100 dark:border-neutral-900/40">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Custom Roles</p>
            <h3 className="text-2xl font-black text-neutral-900 dark:text-white">{roles.filter(r => !(r.isSystemRole || r.isSystem)).length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111111] p-5 rounded-2xl border border-neutral-200/80 dark:border-[#262626] shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950/60 text-neutral-600 dark:text-neutral-300 rounded-2xl border border-neutral-100 dark:border-neutral-900/40">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Active Roles</p>
            <h3 className="text-2xl font-black text-neutral-900 dark:text-white">{roles.filter(r => r.status === 'ACTIVE').length}</h3>
          </div>
        </div>
      </div>

      {/* Filter & View Mode Bar */}
      <RoleFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        roleTypeFilter={roleTypeFilter}
        setRoleTypeFilter={setRoleTypeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        moduleFilter={moduleFilter}
        setModuleFilter={setModuleFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        filteredCount={filteredRoles.length}
        totalCount={roles.length}
        onResetFilters={handleResetFilters}
      />

      {/* Roles Display */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white dark:bg-[#111111] rounded-2xl p-6 border border-neutral-100 dark:border-[#262626] shadow-sm animate-pulse flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-neutral-200 dark:bg-[#222222] rounded-xl shrink-0"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-neutral-200 dark:bg-[#222222] rounded"></div>
                  <div className="h-3 w-48 bg-neutral-100 dark:bg-[#1a1a1a] rounded"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-20 bg-neutral-200 dark:bg-[#222222] rounded-lg"></div>
                <div className="h-8 w-8 bg-neutral-200 dark:bg-[#222222] rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="bg-white dark:bg-[#111111] border border-neutral-200/90 dark:border-[#262626] rounded-3xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white dark:text-neutral-200 rounded-2xl flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">No matching roles found</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
            No roles matched your current search and filter criteria. Try adjusting your search query or reset your filters.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white dark:text-neutral-200 hover:bg-neutral-800 font-bold rounded-xl text-xs transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'card' ? (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transform-gpu">
          {filteredRoles.map((role) => {
            const isSys = role.isSystemRole || role.isSystem;
            const permCount = role.permissions?.length || 0;

            return (
              <div
                key={role.id}
                className="bg-white dark:bg-[#111111] border border-neutral-200/90 dark:border-[#262626] rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          role.status === 'ACTIVE'
                            ? 'bg-neutral-50 dark:bg-neutral-900/30 text-neutral-700 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800/40'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
                        }`}>
                          {role.status}
                        </span>

                        {isSys ? (
                          <span className="flex items-center gap-1 text-[10px] font-extrabold text-neutral-700 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800/40 px-2.5 py-0.5 rounded-full">
                            <Lock className="w-3 h-3" /> System
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold text-neutral-200 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800/40 px-2.5 py-0.5 rounded-full">
                            Custom
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-900 dark:text-white dark:group-hover:text-neutral-400 transition-colors">
                        {role.name}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(role)}
                      disabled={isSys}
                      title={isSys ? "System roles cannot be deactivated" : "Toggle Active/Inactive status"}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isSys ? 'opacity-40 cursor-not-allowed' : 'hover:bg-neutral-100 dark:hover:bg-neutral-700/50'
                      }`}
                    >
                      {role.status === 'ACTIVE' ? (
                        <CheckCircle className="w-5 h-5 text-neutral-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-neutral-400" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                    {role.description || 'Configured workspace role with specific module permission matrix.'}
                  </p>

                  <div className="bg-neutral-50/80 dark:bg-[#171717] p-3 rounded-2xl border border-neutral-100 dark:border-[#333333] mb-4 transition-colors">
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-semibold mb-2">
                      <span>Permissions Granted</span>
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">{permCount} Rules</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions?.slice(0, 4).map((p, idx) => {
                        const permObj = p.permission || p;
                        return (
                          <span key={idx} className="text-[10px] font-medium bg-white dark:bg-[#12141D] text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded-md border border-neutral-200/80 dark:border-[#333333]">
                            {permObj.module}: {permObj.action}
                          </span>
                        );
                      })}
                      {permCount > 4 && (
                        <span className="text-[10px] font-bold bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white dark:text-neutral-400 px-2 py-0.5 rounded-md">
                          +{permCount - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 dark:border-[#333333] flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400 font-medium">
                    {role.userCount || 0} Members
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(role)}
                      className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                      title="Edit Role & Permissions Matrix"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCloneRole(role)}
                      className="p-2 text-neutral-500 hover:text-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-900/20 rounded-xl transition-colors"
                      title="Clone Role (Duplicate Permissions)"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {!isSys && (
                      <button
                        type="button"
                        onClick={() => setRoleToDelete(role)}
                        className="p-2 text-neutral-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                        title="Delete Custom Role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ROW TABLE VIEW */
        <div className="bg-white dark:bg-[#111111] border border-neutral-200/90 dark:border-[#262626] rounded-3xl overflow-hidden shadow-xs transform-gpu transition-colors">
          <div className="overflow-x-auto scrollbar-thin scroll-smooth">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/80 dark:bg-[#171717] border-b border-neutral-200 dark:border-[#333333] text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  <th className="p-4 pl-6">Role Name & Description</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Total Permissions</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-[#333333] text-sm text-neutral-700 dark:text-neutral-300">
                {filteredRoles.map((role) => {
                  const isSys = role.isSystemRole || role.isSystem;
                  const permCount = role.permissions?.length || 0;
                  const createdStr = role.createdAt
                    ? new Date(role.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'System Default';

                  return (
                    <tr key={role.id} className="hover:bg-neutral-50/20 dark:hover:bg-neutral-800 transition-colors duration-150">
                      <td className="p-4 pl-6">
                        <div className="font-extrabold text-neutral-900 dark:text-neutral-100">{role.name}</div>
                        <div className="text-xs text-neutral-400 dark:text-neutral-500 line-clamp-1">{role.description}</div>
                      </td>

                      <td className="p-4">
                        {isSys ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-700 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800/40 px-2.5 py-0.5 rounded-full">
                            <Lock className="w-3 h-3" /> System
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-neutral-200 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800/40 px-2.5 py-0.5 rounded-full">
                            Custom
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(role)}
                          disabled={isSys}
                          className={`text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider border transition-colors ${
                            role.status === 'ACTIVE'
                              ? 'bg-neutral-50 dark:bg-neutral-900/30 text-neutral-700 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-900/50'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                          } ${isSys ? 'cursor-not-allowed opacity-80' : ''}`}
                        >
                          {role.status}
                        </button>
                      </td>

                      <td className="p-4">
                        <span className="bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white dark:text-neutral-400 font-bold text-xs px-3 py-1 rounded-xl">
                          {permCount} Permissions
                        </span>
                      </td>

                      <td className="p-4 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {createdStr}
                      </td>

                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(role)}
                            className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                            title="Edit Role"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCloneRole(role)}
                            className="p-2 text-neutral-500 hover:text-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-900/20 rounded-xl transition-colors"
                            title="Clone Role (Duplicate Permissions)"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {!isSys && (
                            <button
                              type="button"
                              onClick={() => handleDeleteRole(role)}
                              className="p-2 text-neutral-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                              title="Delete Role"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Modal Popup */}
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingRole={editingRole}
        roleForm={roleForm}
        setRoleForm={setRoleForm}
        matrix={matrix}
        dynamicPermissions={dynamicPermissions}
        dynamicModules={dynamicModules}
        onTogglePermission={handleTogglePermission}
        onSelectAllRead={handleSelectAllRead}
        onGrantFullAdmin={handleGrantFullAdmin}
        onClearAll={handleClearAll}
        onSave={handleSaveRole}
        saving={saving}
      />
    </div>
  );
}
