import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const auditLogService = {
  getAuditLogs: async (params = {}) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/audit-logs', {
      params: { organizationId, workspaceId, ...params }
    });
    return response.data;
  },

  getAuditLog: async (id) => {
    const response = await apiClient.get(`/audit-logs/${id}`);
    return response.data;
  },

  deleteAuditLog: async (id) => {
    const response = await apiClient.delete(`/audit-logs/${id}`);
    return response.data;
  },

  cleanupAuditLogs: async (data) => {
    const response = await apiClient.post('/audit-logs/cleanup', data);
    return response.data;
  },

  exportAuditLog: async (id) => {
    const response = await apiClient.get(`/audit-logs/${id}/export`);
    return response.data;
  }
};
