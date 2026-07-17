import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const dashboardService = {
  getDashboardSummary: async () => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/dashboard', {
      params: { organizationId, workspaceId }
    });
    return response.data;
  },

  getCostReports: async () => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/ai-usage/reports/cost', {
      params: { organizationId, workspaceId }
    });
    return response.data;
  }
};
