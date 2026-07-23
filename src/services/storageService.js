import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const storageService = {
  // ─── Files ────────────────────────────────────────────────────────────────
  getFiles: async (params = {}) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/storage/files', {
      params: { organizationId, workspaceId, ...params }
    });
    return response.data;
  },

  getFile: async (id) => {
    const response = await apiClient.get(`/storage/files/${id}`);
    return response.data;
  },

  deleteFile: async (id) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.delete(`/storage/files/${id}`, {
      params: { organizationId, workspaceId }
    });
    return response.data;
  },

  renameFile: async (id, data) => {
    const response = await apiClient.patch(`/storage/files/${id}/rename`, data);
    return response.data;
  },

  moveFile: async (id, data) => {
    const response = await apiClient.patch(`/storage/files/${id}/move`, data);
    return response.data;
  },

  copyFile: async (id, data) => {
    const response = await apiClient.post(`/storage/files/${id}/copy`, data);
    return response.data;
  },

  restoreFile: async (id) => {
    const response = await apiClient.post(`/storage/files/${id}/restore`);
    return response.data;
  },

  downloadFile: async (id) => {
    const response = await apiClient.get(`/storage/files/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  getFileUrl: async (id) => {
    const response = await apiClient.get(`/storage/files/${id}/url`);
    return response.data;
  },

  getFileVersions: async (id) => {
    const response = await apiClient.get(`/storage/files/${id}/versions`);
    return response.data;
  },

  // ─── Folders ──────────────────────────────────────────────────────────────
  getFolders: async (params = {}) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/storage/folders', {
      params: { organizationId, workspaceId, ...params }
    });
    return response.data;
  },

  createFolder: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/storage/folders', {
      ...data,
      organizationId,
      workspaceId
    });
    return response.data;
  },

  getFolder: async (id) => {
    const response = await apiClient.get(`/storage/folders/${id}`);
    return response.data;
  },

  updateFolder: async (id, data) => {
    const response = await apiClient.put(`/storage/folders/${id}`, data);
    return response.data;
  },

  deleteFolder: async (id) => {
    const response = await apiClient.delete(`/storage/folders/${id}`);
    return response.data;
  }
};
