import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResetPassword from './pages/ResetPassword';
import NewPassword from './pages/NewPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat/index';
import KnowledgeBase from './pages/KnowledgeBase';
import Integrations from './pages/Integrations';

// Onboarding Pages
import OnboardingLayout from './pages/onboarding/OnboardingLayout';
import CreateOrganization from './pages/onboarding/CreateOrganization';
import CreateWorkspace from './pages/onboarding/CreateWorkspace';
import BusinessProfile from './pages/onboarding/BusinessProfile';
import BrandProfile from './pages/onboarding/BrandProfile';
import OnboardingWrapper from './components/auth/OnboardingWrapper';
import Profile from './pages/Profile';
import Products from './pages/Products';
import Storage from './pages/Storage';
import ContentHub from './pages/ContentHub';
import PostScheduler from './pages/PostScheduler';

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ResetPassword />} />
            <Route path="/reset-password" element={<NewPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            
            {/* Onboarding Flow (No Sidebar/Navbar) */}
            <Route element={<OnboardingLayout />}>
              <Route path="/onboarding/organization" element={<CreateOrganization />} />
              <Route path="/onboarding/workspace" element={<CreateWorkspace />} />
              <Route path="/onboarding/business-profile" element={<BusinessProfile />} />
              <Route path="/onboarding/brand-profile" element={<BrandProfile />} />
            </Route>

              {/* Fully Onboarded App (Has Sidebar/Navbar) */}
              <Route element={<OnboardingWrapper />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/knowledge-base" element={<KnowledgeBase />} />
                  <Route path="/integrations" element={<Integrations />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/storage" element={<Storage />} />
                  <Route path="/content-hub" element={<ContentHub />} />
                  <Route path="/post-scheduler" element={<PostScheduler />} />
                </Route>
              </Route>

          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
