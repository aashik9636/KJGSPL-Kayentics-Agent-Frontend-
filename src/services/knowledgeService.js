import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const KnowledgeService = {
  // 1. Upload raw file
  uploadFile: async (file) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    
    const formData = new FormData();
    formData.append('file', file);
    if (organizationId) formData.append('organizationId', organizationId);
    if (workspaceId) formData.append('workspaceId', workspaceId);

    // Some backends expect this in the query parameters instead for multer compatibility
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

  // 2. Trigger LLM classification & embedding pipeline
  triggerExtraction: async (fileId, overrideType) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const res = await apiClient.post('/extraction/extract', {
      fileId,
      documentTypeOverride: overrideType,
      organizationId,
      workspaceId
    });
    return res.data;
  },

  // 3. Track extraction task progress
  checkTaskStatus: async (taskId) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const res = await apiClient.get(`/extraction/status/${taskId}`, {
      params: { organizationId, workspaceId }
    });
    return res.data;
  },

  // 4. Retrieve semantically indexed items
  listItems: async (params) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const res = await apiClient.get('/knowledge', { 
      params: { organizationId, workspaceId, ...params } 
    });
    return res.data;
  },

  // 5. Delete specific extracted segment
  deleteItem: async (id) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    await apiClient.delete(`/knowledge/${id}`, {
      params: { organizationId, workspaceId }
    });
  },

  // 6. Delete all segments extracted from a specific file
  deleteFileItems: async (sourceFileId) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    await apiClient.delete('/knowledge', { 
      params: { sourceFileId, organizationId, workspaceId } 
    });
  },
};
