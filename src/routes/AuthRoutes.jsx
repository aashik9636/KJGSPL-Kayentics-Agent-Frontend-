import { Route } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ResetPassword from '../pages/auth/ResetPassword';
import NewPassword from '../pages/auth/NewPassword';
import VerifyEmail from '../pages/auth/VerifyEmail';

export const AuthRoutes = (
  <Route element={<AuthLayout />}>
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/forgot-password" element={<ResetPassword />} />
    <Route path="/reset-password" element={<NewPassword />} />
    <Route path="/verify-email" element={<VerifyEmail />} />
  </Route>
);
