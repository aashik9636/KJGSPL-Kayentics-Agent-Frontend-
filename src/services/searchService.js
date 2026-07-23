import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const searchService = {
  search: async (query, params = {}) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/search', {
      params: { organizationId, workspaceId, q: query, ...params }
    });
    return response.data;
  }
};
