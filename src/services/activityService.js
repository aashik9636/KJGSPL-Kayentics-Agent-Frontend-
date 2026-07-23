import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const activityService = {
  getActivities: async (params = {}) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/activities', {
      params: { organizationId, workspaceId, ...params }
    });
    return response.data;
  },

  getActivity: async (id) => {
    const response = await apiClient.get(`/activities/${id}`);
    return response.data;
  },

  createActivity: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/activities', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  }
};
