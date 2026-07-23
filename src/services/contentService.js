import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const contentService = {
  // ─── Search & List ────────────────────────────────────────────────────────
  getDrafts: async (params = {}) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/content-hub', {
      params: { organizationId, workspaceId, ...params }
    });
    return response.data;
  },

  searchFiles: async (params = {}) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/content-hub/search', {
      params: { organizationId, workspaceId, ...params }
    });
    return response.data;
  },

  // ─── Re-Extract ───────────────────────────────────────────────────────────
  reExtractFile: async (fileId, data = {}) => {
    const response = await apiClient.post(`/content-hub/files/${fileId}/re-extract`, data);
    return response.data;
  },

  // ─── Categories ───────────────────────────────────────────────────────────
  getCategories: async () => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/content-hub/categories', {
      params: { organizationId, workspaceId }
    });
    return response.data;
  },

  getCategory: async (id) => {
    const response = await apiClient.get(`/content-hub/categories/${id}`);
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

  // ─── File Permissions ─────────────────────────────────────────────────────
  getFilePermissions: async (fileId) => {
    const response = await apiClient.get(`/content-hub/files/${fileId}/permissions`);
    return response.data;
  },

  grantFilePermission: async (fileId, data) => {
    const response = await apiClient.post(`/content-hub/files/${fileId}/permissions`, data);
    return response.data;
  },

  revokeFilePermission: async (fileId, permissionId) => {
    const response = await apiClient.delete(`/content-hub/files/${fileId}/permissions/${permissionId}`);
    return response.data;
  },

  // ─── File Relationships ───────────────────────────────────────────────────
  getFileRelationships: async (fileId) => {
    const response = await apiClient.get(`/content-hub/files/${fileId}/relationships`);
    return response.data;
  },

  createFileRelationship: async (fileId, data) => {
    const response = await apiClient.post(`/content-hub/files/${fileId}/relationships`, data);
    return response.data;
  },

  deleteFileRelationship: async (fileId, relationshipId) => {
    const response = await apiClient.delete(`/content-hub/files/${fileId}/relationships/${relationshipId}`);
    return response.data;
  },

  // ─── Content Collections ──────────────────────────────────────────────────
  getContentCollections: async () => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/content-hub/collections/content', {
      params: { organizationId, workspaceId }
    });
    return response.data;
  },

  getContentCollection: async (id) => {
    const response = await apiClient.get(`/content-hub/collections/content/${id}`);
    return response.data;
  },

  createContentCollection: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/content-hub/collections/content', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  updateContentCollection: async (id, data) => {
    const response = await apiClient.put(`/content-hub/collections/content/${id}`, data);
    return response.data;
  },

  deleteContentCollection: async (id) => {
    const response = await apiClient.delete(`/content-hub/collections/content/${id}`);
    return response.data;
  },

  addFileToContentCollection: async (collectionId, data) => {
    const response = await apiClient.post(`/content-hub/collections/content/${collectionId}/items`, data);
    return response.data;
  },

  removeFileFromContentCollection: async (collectionId, fileId) => {
    const response = await apiClient.delete(`/content-hub/collections/content/${collectionId}/items/${fileId}`);
    return response.data;
  },

  // ─── Knowledge Collections ────────────────────────────────────────────────
  getKnowledgeCollections: async () => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/content-hub/collections/knowledge', {
      params: { organizationId, workspaceId }
    });
    return response.data;
  },

  getKnowledgeCollection: async (id) => {
    const response = await apiClient.get(`/content-hub/collections/knowledge/${id}`);
    return response.data;
  },

  createKnowledgeCollection: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/content-hub/collections/knowledge', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  updateKnowledgeCollection: async (id, data) => {
    const response = await apiClient.put(`/content-hub/collections/knowledge/${id}`, data);
    return response.data;
  },

  deleteKnowledgeCollection: async (id) => {
    const response = await apiClient.delete(`/content-hub/collections/knowledge/${id}`);
    return response.data;
  },

  addFileToKnowledgeCollection: async (collectionId, data) => {
    const response = await apiClient.post(`/content-hub/collections/knowledge/${collectionId}/items`, data);
    return response.data;
  },

  removeFileFromKnowledgeCollection: async (collectionId, fileId) => {
    const response = await apiClient.delete(`/content-hub/collections/knowledge/${collectionId}/items/${fileId}`);
    return response.data;
  }
};
