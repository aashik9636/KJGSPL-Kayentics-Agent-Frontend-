import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './guards/ProtectedRoute';
import { AuthRoutes } from './AuthRoutes';
import { OnboardingRoutes } from './OnboardingRoutes';
import { AppRoutes } from './AppRoutes';
import { SuperAdminRoutes } from './SuperAdminRoutes';

export default function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      {AuthRoutes}

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {OnboardingRoutes}
        {AppRoutes}
        {SuperAdminRoutes}
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
