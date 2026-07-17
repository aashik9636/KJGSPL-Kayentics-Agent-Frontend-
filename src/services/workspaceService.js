import apiClient from './apiClient';

export const workspaceService = {
  createWorkspace: async (data) => {
    // Note: The apiClient interceptor automatically adds x-organization-id if set in workspaceStore
    const response = await apiClient.post('/workspaces', data);
    return response.data;
  },

  listWorkspaces: async () => {
    // Note: The apiClient interceptor automatically adds x-organization-id if set in workspaceStore
    const response = await apiClient.get('/workspaces');
    return response.data;
  }
};
