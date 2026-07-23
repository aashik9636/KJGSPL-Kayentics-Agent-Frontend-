import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const userService = {
  // ─── Current User Profile ─────────────────────────────────────────────────
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  },

  // ─── User Management (Admin) ──────────────────────────────────────────────
  getUsers: async (params = {}) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/users', {
      params: { organizationId, workspaceId, ...params }
    });
    return response.data;
  },

  getUser: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  activateUser: async (id) => {
    const response = await apiClient.patch(`/users/${id}/activate`);
    return response.data;
  },

  suspendUser: async (id) => {
    const response = await apiClient.patch(`/users/${id}/suspend`);
    return response.data;
  },

  // ─── Invitations ──────────────────────────────────────────────────────────
  inviteUser: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/users/invite', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  resendInvitation: async (data) => {
    const response = await apiClient.post('/users/resend-invitation', data);
    return response.data;
  },

  deleteInvitation: async (id) => {
    const response = await apiClient.delete(`/users/invitation/${id}`);
    return response.data;
  },

  acceptInvitation: async (data) => {
    const response = await apiClient.post('/users/accept-invitation', data);
    return response.data;
  },

  rejectInvitation: async (data) => {
    const response = await apiClient.post('/users/reject-invitation', data);
    return response.data;
  }
};
