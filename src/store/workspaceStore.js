import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWorkspaceStore = create(
  persist(
    (set, get) => ({
      // Active IDs (injected as request headers by apiClient)
      organizationId: null,
      workspaceId: null,

      // Full active objects (for display in Navbar)
      activeOrganization: null,
      activeWorkspace: null,

      // Lists
      organizations: [],
      workspaces: [],

      // Permissions from GET /rbac/permissions
      // Shape: [{ id, module, action, permissionKey, description }, ...]
      permissions: [],

      // --- Setters ---
      setOrganizationId: (organizationId) => set({ organizationId }),
      setWorkspaceId: (workspaceId) => set({ workspaceId }),

      setOrganizations: (organizations) => set({ organizations }),
      setWorkspaces: (workspaces) => set({ workspaces }),
      setPermissions: (permissions) => set({ permissions }),

      setActiveOrganization: (org) => set({ activeOrganization: org, organizationId: org?.id || null }),
      setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace, workspaceId: workspace?.id || null }),

      clearWorkspace: () => set({
        organizationId: null,
        workspaceId: null,
        activeOrganization: null,
        activeWorkspace: null,
        organizations: [],
        workspaces: [],
        permissions: [],
      }),

      /**
       * Check if the current user has a specific permission by its permissionKey.
       * Usage: hasPermission('organization.create')
       * Returns: boolean
       */
      hasPermission: (permissionKey) => {
        const { permissions } = get();
        return permissions.some((p) => p.permissionKey === permissionKey);
      },
    }),
    {
      name: 'workspace-storage',
      // Only persist IDs and active objects — lists are re-fetched on login/switch
      partialize: (state) => ({
        organizationId: state.organizationId,
        workspaceId: state.workspaceId,
        activeOrganization: state.activeOrganization,
        activeWorkspace: state.activeWorkspace,
      }),
    }
  )
);

