import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const agentService = {
  getAgents: async (params = {}) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/agents', {
      params: { organizationId, workspaceId, ...params }
    });
    return response.data;
  },

  getAgent: async (id) => {
    const response = await apiClient.get(`/agents/${id}`);
    return response.data;
  },

  createAgent: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/agents', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  updateAgent: async (id, data) => {
    const response = await apiClient.put(`/agents/${id}`, data);
    return response.data;
  },

  deleteAgent: async (id) => {
    const response = await apiClient.delete(`/agents/${id}`);
    return response.data;
  },

  enableAgent: async (id) => {
    const response = await apiClient.post(`/agents/${id}/enable`);
    return response.data;
  },

  disableAgent: async (id) => {
    const response = await apiClient.post(`/agents/${id}/disable`);
    return response.data;
  },

  cloneAgent: async (id) => {
    const response = await apiClient.post(`/agents/${id}/clone`);
    return response.data;
  },

  getAgentHistory: async (id) => {
    const response = await apiClient.get(`/agents/${id}/history`);
    return response.data;
  },

  restoreAgentVersion: async (id, versionNumber) => {
    const response = await apiClient.post(`/agents/${id}/restore/${versionNumber}`);
    return response.data;
  }
};
