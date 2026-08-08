import api from './apiClient';

export const salesOutreachService = {
  // Step 1: Seller Profile (Prefill Context)
  getCompanyContext: async () => {
    try {
      const response = await api.get('/api/sales/company-context');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },

  // Step 2: Product Catalog
  getProducts: async (params = {}) => {
    const response = await api.get('/api/sales/products', { params });
    return response.data;
  },

  createProduct: async (data) => {
    const response = await api.post('/api/sales/products', data);
    return response.data;
  },

  // Step 3: Ideal Customer Profile (ICP)
  getICPs: async (productId) => {
    const response = await api.get('/api/sales/icps', { 
      params: productId ? { product_id: productId } : {} 
    });
    return response.data;
  },

  createICP: async (data) => {
    const response = await api.post('/api/sales/icps', data);
    return response.data;
  },

  updateICP: async (icpId, data) => {
    const response = await api.put(`/api/sales/icps/${icpId}`, data);
    return response.data;
  },

  // Step 4: Lead Discovery & Scraper
  discoverLeads: async (icpId, count = 20) => {
    const response = await api.post(`/api/sales/icps/${icpId}/discover`, { count });
    return response.data;
  },

  importLeads: async (file, icpId) => {
    const formData = new FormData();
    formData.append('file', file);
    if (icpId) formData.append('icp_id', icpId);

    const response = await api.post('/api/sales/leads/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Step 5: Mini CRM (Leads Review)
  getLeads: async (params = {}) => {
    const response = await api.get('/api/sales/leads', { params });
    return response.data;
  },

  // Step 6: Generate Outreach Drafts
  generateDrafts: async (data) => {
    const response = await api.post('/api/outreach/drafts/generate', data);
    return response.data;
  },

  // Step 7: Drafts Review & Inline Edit
  getDrafts: async (params = {}) => {
    const response = await api.get('/api/outreach/drafts', { params });
    return response.data;
  },

  updateDraft: async (draftId, data) => {
    const response = await api.put(`/api/outreach/drafts/${draftId}`, data);
    return response.data;
  },

  updateDraftStatus: async (draftIds, action) => {
    const response = await api.post('/api/outreach/drafts/status', { draft_ids: draftIds, action });
    return response.data;
  },

  // Step 8: Send Outreach
  sendOutreach: async (draftId) => {
    const response = await api.post(`/api/outreach/drafts/${draftId}/send`);
    return response.data;
  },

  // Campaign Launch
  launchCampaign: async (data) => {
    const response = await api.post('/api/sales/outreach/campaign', data);
    return response.data;
  }
};
