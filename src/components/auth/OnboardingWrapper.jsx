import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { businessService } from '../../services/businessService';

export default function OnboardingWrapper() {
  const { organizationId, workspaceId } = useWorkspaceStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [checkingBusinessProfile, setCheckingBusinessProfile] = useState(true);
  const [hasBusinessProfile, setHasBusinessProfile] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const checkBusinessProfile = async () => {
      // Only check if we already have an org and workspace
      if (organizationId && workspaceId) {
        try {
          await businessService.getBusinessProfile();
          if (isMounted) setHasBusinessProfile(true);
        } catch (error) {
          // If 404, they haven't completed this step
          if (error.response?.status === 404) {
            if (isMounted) setHasBusinessProfile(false);
          }
        }
      }
      if (isMounted) setCheckingBusinessProfile(false);
    };

    checkBusinessProfile();

    return () => { isMounted = false; };
  }, [organizationId, workspaceId]);

  // Wait for the business profile check to complete before routing
  if (checkingBusinessProfile) {
    return (
      <div className="min-h-screen bg-[#f4f7fe] flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-8 h-8 text-[#1967d2]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-500 font-medium text-sm">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // 1. Organization Check
  if (!organizationId) {
    return <Navigate to="/onboarding/organization" state={{ from: location }} replace />;
  }

  // 2. Workspace Check (usually bypassed as backend creates a default one)
  if (!workspaceId) {
    return <Navigate to="/onboarding/workspace" state={{ from: location }} replace />;
  }

  // 3. Business Profile Check
  if (!hasBusinessProfile) {
    return <Navigate to="/onboarding/business-profile" state={{ from: location }} replace />;
  }

  // Fully onboarded! Render the dashboard layout
  return <Outlet />;
}
