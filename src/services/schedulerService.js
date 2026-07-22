import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const schedulerService = {
  getScheduledPosts: async () => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/post-scheduler/posts', {
      params: { organizationId, workspaceId }
    });
    return response.data;
  },

  schedulePost: async (data) => {
    // data: { contentId, platforms, scheduledAt }
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/post-scheduler/schedule', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  cancelPost: async (id) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.delete(`/post-scheduler/posts/${id}`, {
      params: { organizationId, workspaceId }
    });
    return response.data;
  }
};
