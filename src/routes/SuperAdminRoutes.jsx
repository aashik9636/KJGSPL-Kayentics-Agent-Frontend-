import React from 'react';
import { Route } from 'react-router-dom';
import SuperAdminGuard from './guards/SuperAdminGuard';
import SuperAdminLayout from '../layouts/SuperAdminLayout';
import Overview from '../pages/SuperAdmin/Overview';
import TenantManagement from '../pages/SuperAdmin/TenantManagement';
import BillingAndPlans from '../pages/SuperAdmin/BillingAndPlans';
import UserManagement from '../pages/SuperAdmin/UserManagement';
import AiGovernance from '../pages/SuperAdmin/AiGovernance';
import AuditLogs from '../pages/SuperAdmin/AuditLogs';
import SystemSettings from '../pages/SuperAdmin/SystemSettings';

export const SuperAdminRoutes = (
  <Route element={<SuperAdminGuard />}>
    <Route element={<SuperAdminLayout />}>
      <Route path="/superadmin" element={<Overview />} />
      <Route path="/superadmin/tenants" element={<TenantManagement />} />
      <Route path="/superadmin/billing" element={<BillingAndPlans />} />
      <Route path="/superadmin/users" element={<UserManagement />} />
      <Route path="/superadmin/ai" element={<AiGovernance />} />
      <Route path="/superadmin/prompts" element={<AiGovernance />} />
      <Route path="/superadmin/audit-logs" element={<AuditLogs />} />
      <Route path="/superadmin/settings" element={<SystemSettings />} />
    </Route>
  </Route>
);
