import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';

export default function SuperAdminGuard() {
  const user = useAuthStore((state) => state.user);

  if (!user || user.role !== 'SUPER_ADMIN') {
    toast.error('Access denied. Platform Superadmin authorization required.');
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
