import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const promptLibraryService = {
  getPrompts: async (params = {}) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/prompt-library', {
      params: { organizationId, workspaceId, ...params }
    });
    return response.data;
  },

  getPrompt: async (id) => {
    const response = await apiClient.get(`/prompt-library/${id}`);
    return response.data;
  },

  createPrompt: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/prompt-library', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  updatePrompt: async (id, data) => {
    const response = await apiClient.put(`/prompt-library/${id}`, data);
    return response.data;
  },

  deletePrompt: async (id) => {
    const response = await apiClient.delete(`/prompt-library/${id}`);
    return response.data;
  },

  getPromptHistory: async (id) => {
    const response = await apiClient.get(`/prompt-library/${id}/history`);
    return response.data;
  },

  restorePromptVersion: async (id, versionNumber) => {
    const response = await apiClient.post(`/prompt-library/${id}/restore/${versionNumber}`);
    return response.data;
  }
};
