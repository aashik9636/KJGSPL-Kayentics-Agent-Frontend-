import { useState, useEffect, useCallback } from 'react';
import { rbacService } from '../services/rbacService';
import { useWorkspaceStore } from '../store/workspaceStore';

// ─────────────────────────────────────────────────────────────────────────────
// usePermissions — UI Authorization Guard Hook
//
// Usage:
//   const { hasPermission, permissions, loading } = usePermissions();
//   if (hasPermission('agents.create')) { /* show button */ }
//
// Source: GET /api/v1/permissions/me
// Response: { success: true, data: ["organization.read", "agents.create", ...] }
// ─────────────────────────────────────────────────────────────────────────────

export function usePermissions() {
  const { organizationId } = useWorkspaceStore();
  const [permissions, setPermissions] = useState([]); // string[]
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    try {
      // rbacService.getUserPermissions caches for 5 min
      const data = await rbacService.getUserPermissions();
      // Backend returns string[] or { data: string[] }
      const perms = Array.isArray(data) ? data : (data?.data ?? []);
      setPermissions(perms);
    } catch (err) {
      console.warn('[usePermissions] Failed to fetch permissions:', err?.message);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    // Re-fetch when org changes (org switch scenario)
    rbacService.clearCache(); // invalidate stale permissions_me on org switch
    fetchPermissions();
  }, [fetchPermissions]);

  /**
   * Check if the current user has a specific permission key.
   * @param {string} permissionKey — e.g. 'agents.create', 'organization.read'
   * @returns {boolean}
   */
  const hasPermission = useCallback(
    (permissionKey) => permissions.includes(permissionKey),
    [permissions]
  );

  /**
   * Check if user has ALL of the given permission keys.
   * @param {string[]} keys
   * @returns {boolean}
   */
  const hasAllPermissions = useCallback(
    (keys) => keys.every((k) => permissions.includes(k)),
    [permissions]
  );

  /**
   * Check if user has ANY of the given permission keys.
   * @param {string[]} keys
   * @returns {boolean}
   */
  const hasAnyPermission = useCallback(
    (keys) => keys.some((k) => permissions.includes(k)),
    [permissions]
  );

  return {
    permissions,   // string[] — ["agents.create", "organization.read", ...]
    loading,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    refetch: fetchPermissions,
  };
}
