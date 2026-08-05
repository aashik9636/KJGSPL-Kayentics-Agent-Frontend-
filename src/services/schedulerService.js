import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const schedulerService = {
  // ─── Generate Posts ────────────────────────────────────────────────────────
  schedulePost: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/api/post-scheduler/generate/festivals', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  scheduleCustomPost: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/api/post-scheduler/generate/custom', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  // ─── List Posts ────────────────────────────────────────────────────────────
  getScheduledPosts: async (params = {}) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/api/post-scheduler/posts', {
      params: { organizationId, workspaceId, ...params }
    });
    return response.data;
  },

  getPost: async (postId) => {
    const response = await apiClient.get(`/api/post-scheduler/posts/${postId}`);
    return response.data;
  },

  // ─── Approve / Reject ─────────────────────────────────────────────────────
  approvePost: async (postId) => {
    const response = await apiClient.post(`/api/post-scheduler/posts/${postId}/approve`);
    return response.data;
  },

  rejectPost: async (postId, feedback = 'Rejection requested by reviewer') => {
    const response = await apiClient.post(`/api/post-scheduler/posts/${postId}/reject`, {
      feedback
    });
    return response.data;
  },

  // ─── Delete ────────────────────────────────────────────────────────────────
  cancelPost: async (id) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.delete(`/api/post-scheduler/posts/${id}`, {
      params: { organizationId, workspaceId }
    });
    return response.data;
  },

  // ─── Calendar ──────────────────────────────────────────────────────────────
  getCalendarPosts: async (year, month) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get(`/api/post-scheduler/calendar/${year}/${month}`, {
      params: { organizationId, workspaceId }
    });
    return response.data;
  }
};
