import { Route } from 'react-router-dom';
import OnboardingLayout from '../pages/onboarding/OnboardingLayout';
import CreateOrganization from '../pages/onboarding/CreateOrganization';
import CreateWorkspace from '../pages/onboarding/CreateWorkspace';
import BusinessProfile from '../pages/onboarding/BusinessProfile';
import BrandProfile from '../pages/onboarding/BrandProfile';

export const OnboardingRoutes = (
  <Route element={<OnboardingLayout />}>
    <Route path="/onboarding/organization" element={<CreateOrganization />} />
    <Route path="/onboarding/workspace" element={<CreateWorkspace />} />
    <Route path="/onboarding/business-profile" element={<BusinessProfile />} />
    <Route path="/onboarding/brand-profile" element={<BrandProfile />} />
  </Route>
);
