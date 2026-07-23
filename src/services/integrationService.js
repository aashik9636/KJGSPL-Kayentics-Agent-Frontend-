import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const integrationService = {
  getIntegrations: async (params = {}) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/integrations', {
      params: { organizationId, workspaceId, ...params }
    });
    return response.data;
  },

  connectIntegration: async (platform) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/integrations/connect', {
      platform,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  disconnectIntegration: async (id) => {
    const response = await apiClient.post(`/integrations/${id}/disconnect`);
    return response.data;
  },

  refreshIntegration: async (id, data) => {
    const response = await apiClient.post(`/integrations/${id}/refresh`, data);
    return response.data;
  },

  checkHealth: async (id) => {
    const response = await apiClient.get(`/integrations/${id}/health`);
    return response.data;
  }
};
