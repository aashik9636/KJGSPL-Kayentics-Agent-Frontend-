import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const storageService = {
  getFiles: async () => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/storage/files', {
      params: { organizationId, workspaceId }
    });
    return response.data;
  },

  deleteFile: async (id) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.delete(`/storage/files/${id}`, {
      params: { organizationId, workspaceId }
    });
    return response.data;
  }
};
