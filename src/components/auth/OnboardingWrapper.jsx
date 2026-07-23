import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { workspaceService } from '../../services/workspaceService';
import { businessService } from '../../services/businessService';

export default function OnboardingWrapper() {
  const { organizationId, workspaceId, setActiveOrganization, setActiveWorkspace, setOrganizations, setWorkspaces } = useWorkspaceStore();
  const location = useLocation();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [hasBusinessProfile, setHasBusinessProfile] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const resolveContextAndProfile = async () => {
      let currentOrgId = organizationId;
      let currentWsId = workspaceId;

      try {
        // 1. If organizationId is missing in store, try listing user's organizations
        if (!currentOrgId) {
          const orgs = await workspaceService.listOrganizations().catch(() => []);
          const orgList = Array.isArray(orgs) ? orgs : [];
          if (orgList.length > 0) {
            if (isMounted) {
              setOrganizations(orgList);
              setActiveOrganization(orgList[0]);
            }
            currentOrgId = orgList[0].id;
          }
        }

        // 2. If workspaceId is missing in store but org exists, try listing workspaces
        if (currentOrgId && !currentWsId) {
          const workspaces = await workspaceService.getWorkspacesByOrg(currentOrgId).catch(() => []);
          const wsList = Array.isArray(workspaces) ? workspaces : [];
          if (wsList.length > 0) {
            if (isMounted) {
              setWorkspaces(wsList);
              setActiveWorkspace(wsList[0]);
            }
            currentWsId = wsList[0].id;
          }
        }

        // 3. Check business profile if we have org and workspace context
        if (currentOrgId && currentWsId) {
          try {
            const profile = await businessService.getBusinessProfile();
            if (isMounted && profile) {
              setHasBusinessProfile(true);
            }
          } catch (error) {
            if (isMounted) setHasBusinessProfile(false);
          }
        }
      } catch (e) {
        console.error("Error resolving onboarding context", e);
      } finally {
        if (isMounted) setCheckingOnboarding(false);
      }
    };

    resolveContextAndProfile();

    return () => { isMounted = false; };
  }, [organizationId, workspaceId, setActiveOrganization, setActiveWorkspace, setOrganizations, setWorkspaces]);

  // Wait for context & business profile checks before routing
  if (checkingOnboarding) {
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

  // 2. Workspace Check
  if (!workspaceId) {
    return <Navigate to="/onboarding/workspace" state={{ from: location }} replace />;
  }

  // 3. Business Profile Check
  if (!hasBusinessProfile) {
    return <Navigate to="/onboarding/business-profile" state={{ from: location }} replace />;
  }

  // Fully onboarded! Render the main application
  return <Outlet />;
}
