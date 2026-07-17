import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const contentService = {
  // --- Categories ---
  listCategories: async () => {
    const { workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/content-hub/categories', {
      params: { workspaceId }
    });
    return response.data;
  },
  createCategory: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/content-hub/categories', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },
  updateCategory: async (id, data) => {
    const response = await apiClient.put(`/content-hub/categories/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/content-hub/categories/${id}`);
    return response.data;
  },

  // --- Search & Files ---
  searchFiles: async (searchParams = {}) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/content-hub/search', {
      params: { organizationId, workspaceId, ...searchParams }
    });
    return response.data; // Usually returns { items, meta } or array
  },
  uploadFile: async (file, folderId = null) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const formData = new FormData();
    formData.append('file', file);
    
    let url = `/storage/upload?organizationId=${organizationId}&workspaceId=${workspaceId}`;
    if (folderId) url += `&folderId=${folderId}`;

    // Upload requires multipart/form-data
    const response = await apiClient.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // --- Collections ---
  listCollections: async (type = 'content') => {
    const { workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get(`/content-hub/collections/${type}`, {
      params: { workspaceId }
    });
    return response.data;
  },
  createCollection: async (type, data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post(`/content-hub/collections/${type}`, {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },
  bindFileToCollection: async (type, collectionId, fileId) => {
    const response = await apiClient.post(`/content-hub/collections/${type}/${collectionId}/items`, { fileId });
    return response.data;
  },
  
  // --- Data Extraction ---
  requestReExtraction: async (fileId, payload) => {
    const response = await apiClient.post(`/content-hub/files/${fileId}/re-extract`, payload);
    return response.data;
  },
  
  // --- Relationships & Creative (Legacy) ---
  createRelationship: async (fileId, relatedData) => {
    const response = await apiClient.post(`/content-hub/files/${fileId}/relationships`, relatedData);
    return response.data;
  },
  listRelationships: async (fileId) => {
    const response = await apiClient.get(`/content-hub/files/${fileId}/relationships`);
    return response.data;
  },
  deleteRelationship: async (fileId, relationshipId) => {
    const response = await apiClient.delete(`/content-hub/files/${fileId}/relationships/${relationshipId}`);
    return response.data;
  },
  generateCreativeBrief: async (data) => {
    const response = await apiClient.post('/api/creative/generate', data);
    return response.data;
  },
  generateImage: async (data) => {
    const response = await apiClient.post('/api/content/generate-image', data);
    return response.data;
  }
};
