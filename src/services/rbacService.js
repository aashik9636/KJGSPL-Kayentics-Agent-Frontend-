import apiClient from './apiClient';

export const rbacService = {
  /**
   * Fetch the active user's permissions for the current org/workspace context.
   * Backend: GET /rbac/permissions
   * Returns an array of Permission objects:
   * [{ id, module, action, permissionKey, description }, ...]
   *
   * Call this after login AND after every workspace switch (new JWT = new context).
   */
  getPermissions: async () => {
    const response = await apiClient.get('/rbac/permissions');
    return response.data;
  },
};
