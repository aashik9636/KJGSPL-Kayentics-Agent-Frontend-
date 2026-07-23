import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const notificationService = {
  getNotifications: async (params = {}) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/notifications', {
      params: { organizationId, workspaceId, ...params }
    });
    return response.data;
  },

  getUnreadCount: async () => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/notifications/unread', {
      params: { organizationId, workspaceId }
    });
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.patch('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },

  getPreferences: async () => {
    const response = await apiClient.get('/notifications/preferences');
    return response.data;
  },

  updatePreferences: async (data) => {
    const response = await apiClient.put('/notifications/preferences', data);
    return response.data;
  }
};
