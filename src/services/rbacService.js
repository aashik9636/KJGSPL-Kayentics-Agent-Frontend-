import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

// In-Memory Cache for static RBAC data (5-min TTL)
const CACHE_TTL_MS = 5 * 60 * 1000;
const apiCache = new Map();

const getCachedData = async (cacheKey, apiCall) => {
  const cached = apiCache.get(cacheKey);
  const now = Date.now();
  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) return cached.data;
  const data = await apiCall();
  apiCache.set(cacheKey, { data, timestamp: now });
  return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// RBAC Service — aligned to 10 active backend endpoints
// ─────────────────────────────────────────────────────────────────────────────
//  ROLES
//    POST   /api/v1/roles                    → createRole
//    GET    /api/v1/roles                    → getRoles
//    GET    /api/v1/roles/:id                → getRole
//    PUT    /api/v1/roles/:id                → updateRole
//    DELETE /api/v1/roles/:id                → deleteRole
//    POST   /api/v1/roles/assign             → assignRole
//    DELETE /api/v1/roles/remove             → removeRole
//    POST   /api/v1/roles/:id/permissions    → addPermissionsToRole
//  PERMISSIONS
//    GET    /api/v1/permissions/me           → getUserPermissions
//    GET    /api/v1/permissions/module-wise  → getModuleWisePermissions
// ─────────────────────────────────────────────────────────────────────────────

export const rbacService = {
  clearCache: () => {
    apiCache.clear();
  },

  // ── GET /api/v1/permissions/me ─────────────────────────────────────────────
  getUserPermissions: async () => {
    return getCachedData('permissions_me', async () => {
      const response = await apiClient.get('/api/v1/permissions/me');
      return response.data;
    });
  },

  // ── GET /api/v1/permissions/module-wise ───────────────────────────────────
  // Returns: [{ module: string, permissions: [{ id, module, action, permissionKey, description }] }]
  getModuleWisePermissions: async () => {
    return getCachedData('permissions_module_wise', async () => {
      const response = await apiClient.get('/api/v1/permissions/module-wise');
      return response.data;
    });
  },

  // ── GET /api/v1/roles ─────────────────────────────────────────────────────
  getRoles: async () => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/api/v1/roles', {
      params: { organizationId, workspaceId }
    });
    return response.data;
  },

  // ── GET /api/v1/roles/:id ─────────────────────────────────────────────────
  getRole: async (id) => {
    const response = await apiClient.get(`/api/v1/roles/${id}`);
    return response.data;
  },

  // ── POST /api/v1/roles ────────────────────────────────────────────────────
  createRole: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/api/v1/roles', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  // ── PUT /api/v1/roles/:id ─────────────────────────────────────────────────
  updateRole: async (id, data) => {
    const response = await apiClient.put(`/api/v1/roles/${id}`, data);
    return response.data;
  },

  // ── DELETE /api/v1/roles/:id ──────────────────────────────────────────────
  deleteRole: async (id) => {
    const response = await apiClient.delete(`/api/v1/roles/${id}`);
    return response.data;
  },

  // ── POST /api/v1/roles/assign ─────────────────────────────────────────────
  // Body: { userId, roleId, organizationId, workspaceId }
  assignRole: async (data) => {
    const response = await apiClient.post('/api/v1/roles/assign', data);
    return response.data;
  },

  // ── DELETE /api/v1/roles/remove ───────────────────────────────────────────
  // Body: { userId, roleId, organizationId, workspaceId }
  removeRole: async (data) => {
    const response = await apiClient.delete('/api/v1/roles/remove', { data });
    return response.data;
  },

  // ── POST /api/v1/roles/:id/permissions ───────────────────────────────────
  // Bulk-assign permissions to a role
  addPermissionsToRole: async (id, data) => {
    const response = await apiClient.post(`/api/v1/roles/${id}/permissions`, data);
    return response.data;
  },
};
