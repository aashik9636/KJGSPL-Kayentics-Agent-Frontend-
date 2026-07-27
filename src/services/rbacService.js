import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const rbacService = {
  // ─── Modules ────────────────────────────────────────────────────────────────
  getModules: async () => {
    const response = await apiClient.get('/modules');
    return response.data;
  },

  createModule: async (data) => {
    const response = await apiClient.post('/modules', data);
    return response.data;
  },

  updateModule: async (id, data) => {
    const response = await apiClient.put(`/modules/${id}`, data);
    return response.data;
  },

  deleteModule: async (id) => {
    const response = await apiClient.delete(`/modules/${id}`);
    return response.data;
  },

  // ─── Actions ────────────────────────────────────────────────────────────────
  getActions: async () => {
    const response = await apiClient.get('/actions');
    return response.data;
  },

  createAction: async (data) => {
    const response = await apiClient.post('/actions', data);
    return response.data;
  },

  updateAction: async (id, data) => {
    const response = await apiClient.put(`/actions/${id}`, data);
    return response.data;
  },

  deleteAction: async (id) => {
    const response = await apiClient.delete(`/actions/${id}`);
    return response.data;
  },

  // ─── Permissions ───────────────────────────────────────────────────────────
  getPermissions: async () => {
    const response = await apiClient.get('/permissions');
    return response.data;
  },

  createPermission: async (data) => {
    const response = await apiClient.post('/permissions', data);
    return response.data;
  },

  updatePermission: async (id, data) => {
    const response = await apiClient.put(`/permissions/${id}`, data);
    return response.data;
  },

  deletePermission: async (id) => {
    const response = await apiClient.delete(`/permissions/${id}`);
    return response.data;
  },

  // ─── Roles ────────────────────────────────────────────────────────────────
  getRoles: async () => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/roles', {
      params: { organizationId, workspaceId }
    });
    return response.data;
  },

  getRole: async (id) => {
    const response = await apiClient.get(`/roles/${id}`);
    return response.data;
  },

  createRole: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/roles', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  updateRole: async (id, data) => {
    const response = await apiClient.put(`/roles/${id}`, data);
    return response.data;
  },

  deleteRole: async (id) => {
    const response = await apiClient.delete(`/roles/${id}`);
    return response.data;
  },

  cloneRole: async (id) => {
    const response = await apiClient.post(`/roles/${id}/clone`);
    return response.data;
  },

  assignRole: async (data) => {
    const response = await apiClient.post('/roles/assign', data);
    return response.data;
  },

  removeRole: async (data) => {
    const response = await apiClient.delete('/roles/remove', { data });
    return response.data;
  },

  addPermissionsToRole: async (id, data) => {
    const response = await apiClient.post(`/roles/${id}/permissions`, data);
    return response.data;
  },

  removePermissionFromRole: async (roleId, permissionId) => {
    const response = await apiClient.delete(`/roles/${roleId}/permissions/${permissionId}`);
    return response.data;
  }
};
