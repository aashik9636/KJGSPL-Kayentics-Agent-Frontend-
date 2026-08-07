import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useEventStore } from '../../store/eventStore';

export default function ProtectedRoute() {
  const { accessToken, user } = useAuthStore();
  const { connect, disconnect, isConnected } = useEventStore();
  const location = useLocation();

  useEffect(() => {
    if (accessToken && !isConnected) {
      connect(accessToken);
    }
    // Note: We don't disconnect on unmount here because ProtectedRoute 
    // stays mounted as long as the user navigates inside protected areas.
  }, [accessToken, isConnected, connect]);

  if (!accessToken) {
    // Redirect them to the /login page, but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle onboarding redirection directly in the protected route
  if (user && user.isOnboardingCompleted === false) {
    const currentPath = location.pathname;
    let expectedPath = '/onboarding/organization';

    switch (user.onboardingStep) {
      case 'PENDING_WORKSPACE':
        expectedPath = '/onboarding/workspace';
        break;
      case 'PENDING_BUSINESS_PROFILE':
        expectedPath = '/onboarding/business-profile';
        break;
      case 'PENDING_BRAND_PROFILE':
        expectedPath = '/onboarding/brand-profile';
        break;
      case 'PENDING_ORGANIZATION':
      default:
        expectedPath = '/onboarding/organization';
        break;
    }

    // Only redirect if they are not already on the correct step
    if (currentPath !== expectedPath) {
      return <Navigate to={expectedPath} replace />;
    }
  }

  // Handle Super Admin default route
  if (user && user.role === 'SUPER_ADMIN' && location.pathname === '/') {
    return <Navigate to="/superadmin" replace />;
  }

  return <Outlet />;
}
