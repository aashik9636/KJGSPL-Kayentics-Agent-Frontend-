import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const KnowledgeService = {
  // ─── Upload raw file ──────────────────────────────────────────────────────
  uploadFile: async (file) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    
    const formData = new FormData();
    formData.append('file', file);
    if (organizationId) formData.append('organizationId', organizationId);
    if (workspaceId) formData.append('workspaceId', workspaceId);

    let url = '/storage/upload';
    if (organizationId) {
      url += `?organizationId=${organizationId}`;
      if (workspaceId) url += `&workspaceId=${workspaceId}`;
    }

    const res = await apiClient.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // ─── Trigger extraction ────────────────────────────────────────────────────
  triggerExtraction: async (fileId, overrideType) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const res = await apiClient.post('/knowledge', {
      sourceFileId: fileId,
      documentTypeOverride: overrideType,
      organizationId,
      workspaceId
    });
    return res.data;
  },

  // ─── Check extraction status ───────────────────────────────────────────────
  checkTaskStatus: async (fileId) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const res = await apiClient.get('/knowledge', {
      params: { organizationId, workspaceId, sourceFileId: fileId, limit: 1 }
    });
    const items = res.data || [];
    if (items.length > 0) {
      return { status: 'completed', items };
    }
    return { status: 'processing' };
  },

  // ─── CRUD ─────────────────────────────────────────────────────────────────
  listItems: async (params = {}) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const res = await apiClient.get('/knowledge', { 
      params: { organizationId, workspaceId, ...params } 
    });
    return res.data;
  },

  getItem: async (id) => {
    const res = await apiClient.get(`/knowledge/${id}`);
    return res.data;
  },

  updateItem: async (id, data) => {
    const res = await apiClient.put(`/knowledge/${id}`, data);
    return res.data;
  },

  deleteItem: async (id) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    await apiClient.delete(`/knowledge/${id}`, {
      params: { organizationId, workspaceId }
    });
  },

  deleteFileItems: async (sourceFileId) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    await apiClient.delete('/knowledge', { 
      params: { sourceFileId, organizationId, workspaceId } 
    });
  },

  // ─── Bulk Operations ──────────────────────────────────────────────────────
  bulkCreate: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const res = await apiClient.post('/knowledge/bulk', {
      ...data,
      organizationId,
      workspaceId
    });
    return res.data;
  }
};
