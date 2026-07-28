import React from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';

/**
 * Renders children only if the user has the required permission.
 * Usage:
 *   <PermissionGate permission="products.create">
 *     <button>Add Product</button>
 *   </PermissionGate>
 */
export function PermissionGate({ permission, children, fallback = null }) {
  const hasPermission = useWorkspaceStore((s) => s.hasPermission);

  if (!permission || hasPermission(permission)) {
    return children;
  }

  return fallback;
}

/**
 * Renders children if user has ANY of the listed permissions.
 * Usage:
 *   <AnyPermissionGate permissions={['products.create', 'products.update']}>
 *     <button>Edit</button>
 *   </AnyPermissionGate>
 */
export function AnyPermissionGate({ permissions = [], children, fallback = null }) {
  const hasPermission = useWorkspaceStore((s) => s.hasPermission);
  const hasAny = permissions.some((p) => hasPermission(p));
  return hasAny ? children : fallback;
}

/**
 * Renders children if user has ALL of the listed permissions.
 */
export function AllPermissionGate({ permissions = [], children, fallback = null }) {
  const hasPermission = useWorkspaceStore((s) => s.hasPermission);
  const hasAll = permissions.every((p) => hasPermission(p));
  return hasAll ? children : fallback;
}
