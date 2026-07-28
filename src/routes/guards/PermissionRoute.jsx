import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useWorkspaceStore } from '../../store/workspaceStore';

/**
 * Route-level guard that redirects to /unauthorized if the user lacks the required permission.
 * Usage:
 *   <PermissionRoute permission="products.read">
 *     <ProductsPage />
 *   </PermissionRoute>
 */
export function PermissionRoute({ permission, children }) {
  const hasPermission = useWorkspaceStore((s) => s.hasPermission);
  const location = useLocation();

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children;
}
