import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const settingsService = {
  getSettings: async () => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/settings', {
      params: { organizationId, workspaceId }
    });
    return response.data;
  },

  updateSettings: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/settings', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  }
};
