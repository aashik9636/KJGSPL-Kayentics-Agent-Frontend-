import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const productService = {
  getProducts: async (params = {}) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/products', {
      params: { organizationId, workspaceId, ...params }
    });
    return response.data;
  },

  getProduct: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/products', data, {
      params: { organizationId, workspaceId }
    });
    return response.data;
  },

  updateProduct: async (id, data) => {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.delete(`/products/${id}`, {
      params: { organizationId, workspaceId }
    });
    return response.data;
  }
};
