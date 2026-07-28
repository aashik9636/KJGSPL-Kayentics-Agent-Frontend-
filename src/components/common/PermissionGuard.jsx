import React from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';

/**
 * Reusable RBAC Permission Guard component.
 * Usage:
 *   <PermissionGuard permissionKey="ai.read">
 *     <ConversationHistory />
 *   </PermissionGuard>
 */
export const PermissionGuard = ({ permissionKey, permission, children, fallback = null }) => {
  const hasPermission = useWorkspaceStore((state) => state.hasPermission);
  const targetKey = permissionKey || permission;

  if (targetKey && !hasPermission(targetKey)) {
    return fallback;
  }

  return <>{children}</>;
};

export default PermissionGuard;
