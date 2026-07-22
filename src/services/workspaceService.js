import apiClient from './apiClient';

export const workspaceService = {
  /**
   * List all organizations the current user belongs to.
   * Backend: GET /organizations
   */
  listOrganizations: async () => {
    const response = await apiClient.get('/organizations');
    return response.data;
  },

  /**
   * Create a new organization.
   * Backend: POST /organizations
   */
  createOrganization: async (data) => {
    const response = await apiClient.post('/organizations', data);
    return response.data;
  },

  /**
   * Create a new workspace under the active organization.
   * Backend: POST /workspaces  (x-organization-id header auto-injected by apiClient)
   */
  createWorkspace: async (data) => {
    const response = await apiClient.post('/workspaces', data);
    return response.data;
  },

  /**
   * List workspaces for a specific organization.
   * Backend requires organizationId as a QUERY PARAM (does NOT read x-organization-id header for filtering).
   * Backend: GET /workspaces?organizationId=<uuid>
   */
  getWorkspacesByOrg: async (organizationId) => {
    const response = await apiClient.get('/workspaces', {
      params: { organizationId }
    });
    return response.data;
  },

  /**
   * Switch to a different workspace.
   * Backend encodes org+workspace inside the JWT, so switching requires a new token pair.
   * Backend: POST /workspaces/:workspaceId/switch
   * Returns: { accessToken, refreshToken }
   * Frontend MUST replace stored tokens with the new pair.
   */
  switchWorkspace: async (workspaceId) => {
    const response = await apiClient.post(`/workspaces/${workspaceId}/switch`);
    return response.data;
  },
};

