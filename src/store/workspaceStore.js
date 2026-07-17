import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWorkspaceStore = create(
  persist(
    (set) => ({
      organizationId: null,
      workspaceId: null,
      
      setOrganizationId: (organizationId) => set({ organizationId }),
      setWorkspaceId: (workspaceId) => set({ workspaceId }),
      clearWorkspace: () => set({ organizationId: null, workspaceId: null })
    }),
    {
      name: 'workspace-storage',
    }
  )
);
