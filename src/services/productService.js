import apiClient from './apiClient';
import { useWorkspaceStore } from '../store/workspaceStore';

export const productService = {
  getProducts: async () => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.get('/products', {
      params: { organizationId, workspaceId }
    });
    return response.data;
  },

  createProduct: async (data) => {
    const { organizationId, workspaceId } = useWorkspaceStore.getState();
    const response = await apiClient.post('/products', data, {
      params: { organizationId, workspaceId }
    });
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
