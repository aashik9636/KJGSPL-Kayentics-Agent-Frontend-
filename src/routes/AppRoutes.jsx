import { Route } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import Dashboard from '../pages/Dashboard';
import Chat from '../pages/Brain/AgentsChat';
import KnowledgeBase from '../pages/Brain/KnowledgeBase';
import Integrations from '../pages/Integrations';
import Profile from '../pages/Profile';
import Products from '../pages/Products';
import Storage from '../pages/Storage';
import ContentHub from '../pages/ContentHub';
import PostScheduler from '../pages/PostScheduler';
import Agents from '../pages/Agents';

export const AppRoutes = (
  <Route element={<AppLayout />}>
    <Route path="/" element={<Dashboard />} />
    <Route path="/chat" element={<Chat />} />
    <Route path="/agents" element={<Agents />} />
    <Route path="/knowledge-base" element={<KnowledgeBase />} />
    <Route path="/integrations" element={<Integrations />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/products" element={<Products />} />
    <Route path="/storage" element={<Storage />} />
    <Route path="/content-hub" element={<ContentHub />} />
    <Route path="/post-scheduler" element={<PostScheduler />} />
  </Route>
);
