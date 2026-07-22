import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const contentService = {
  getDrafts: async () => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/content-hub', {
      params: { organizationId, workspaceId }
    });
    return response.data;
  },

  saveDraft: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/content-hub', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  updateDraft: async (id, data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.patch(`/content-hub/${id}`, {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  }
};
