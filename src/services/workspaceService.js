import apiClient from './apiClient';

export const workspaceService = {
  // ─── Organizations ────────────────────────────────────────────────────────
  listOrganizations: async () => {
    const response = await apiClient.get('/organizations');
    return response.data;
  },

  getOrganization: async (id) => {
    const response = await apiClient.get(`/organizations/${id}`);
    return response.data;
  },

  createOrganization: async (data) => {
    const response = await apiClient.post('/organizations', data);
    return response.data;
  },

  updateOrganization: async (id, data) => {
    const response = await apiClient.put(`/organizations/${id}`, data);
    return response.data;
  },

  deleteOrganization: async (id) => {
    const response = await apiClient.delete(`/organizations/${id}`);
    return response.data;
  },

  switchOrganization: async (id) => {
    const response = await apiClient.post(`/organizations/${id}/switch`);
    return response.data;
  },

  archiveOrganization: async (id) => {
    const response = await apiClient.patch(`/organizations/${id}/archive`);
    return response.data;
  },

  activateOrganization: async (id) => {
    const response = await apiClient.patch(`/organizations/${id}/activate`);
    return response.data;
  },

  uploadOrganizationLogo: async (id, logoUrl) => {
    const response = await apiClient.post(`/organizations/${id}/logo`, { logoUrl });
    return response.data;
  },

  // ─── Workspaces ──────────────────────────────────────────────────────────
  createWorkspace: async (data) => {
    const response = await apiClient.post('/workspaces', data);
    return response.data;
  },

  getWorkspacesByOrg: async (organizationId) => {
    const response = await apiClient.get('/workspaces', {
      params: { organizationId }
    });
    return response.data;
  },

  getWorkspace: async (id) => {
    const response = await apiClient.get(`/workspaces/${id}`);
    return response.data;
  },

  updateWorkspace: async (id, data) => {
    const response = await apiClient.put(`/workspaces/${id}`, data);
    return response.data;
  },

  deleteWorkspace: async (id) => {
    const response = await apiClient.delete(`/workspaces/${id}`);
    return response.data;
  },

  archiveWorkspace: async (id) => {
    const response = await apiClient.patch(`/workspaces/${id}/archive`);
    return response.data;
  },

  activateWorkspace: async (id) => {
    const response = await apiClient.patch(`/workspaces/${id}/activate`);
    return response.data;
  },

  switchWorkspace: async (workspaceId) => {
    const response = await apiClient.post(`/workspaces/${workspaceId}/switch`);
    return response.data;
  }
};
