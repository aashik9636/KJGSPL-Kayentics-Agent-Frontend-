import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const schedulerService = {
  // ─── Generate Posts ────────────────────────────────────────────────────────
  schedulePost: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/api/scheduler/generate/festivals', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  scheduleCustomPost: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/api/scheduler/generate/custom', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  // ─── List Posts ────────────────────────────────────────────────────────────
  getScheduledPosts: async (params = {}) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/post-scheduler/posts', {
      params: { organizationId, workspaceId, ...params }
    });
    return response.data;
  },

  getPost: async (postId) => {
    const response = await apiClient.get(`/post-scheduler/posts/${postId}`);
    return response.data;
  },

  // ─── Approve / Reject ─────────────────────────────────────────────────────
  approvePost: async (postId) => {
    const response = await apiClient.post(`/post-scheduler/posts/${postId}/approve`);
    return response.data;
  },

  rejectPost: async (postId) => {
    const response = await apiClient.post(`/post-scheduler/posts/${postId}/reject`);
    return response.data;
  },

  // ─── Delete ────────────────────────────────────────────────────────────────
  cancelPost: async (id) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.delete(`/post-scheduler/posts/${id}`, {
      params: { organizationId, workspaceId }
    });
    return response.data;
  },

  // ─── Calendar ──────────────────────────────────────────────────────────────
  getCalendarPosts: async (year, month) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get(`/post-scheduler/calendar/${year}/${month}`, {
      params: { organizationId, workspaceId }
    });
    return response.data;
  }
};
