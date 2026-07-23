import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workspaceService } from '../../services/workspaceService';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { toast } from 'react-toastify';

export default function CreateWorkspace() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setTokens } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create the workspace (apiClient automatically attaches x-organization-id from store)
      const newWorkspace = await workspaceService.createWorkspace({ name, description });
      toast.success("Workspace created successfully!");

      // 2. Set active workspace in store
      if (newWorkspace) {
        useWorkspaceStore.getState().setActiveWorkspace(newWorkspace);
      }

      // 3. Switch to this new workspace to get a fresh token with the workspace context
      const result = await workspaceService.switchWorkspace(newWorkspace.id);
      
      if (result?.accessToken) {
        setTokens(result.accessToken, result.refreshToken);
        
        // Fetch updated user to get the new onboardingStep (PENDING_BUSINESS_PROFILE)
        const updatedUser = await authService.getCurrentUser();
        useAuthStore.getState().setAuth(updatedUser, result.accessToken, result.refreshToken);
      }

      // 4. Navigate to root, allowing ProtectedRoute to dynamically route based on onboardingStep
      navigate('/');
    } catch (err) {
      // apiClient handles toasts
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-[32px] font-medium text-[#111827] tracking-tight mb-2">Create Workspace</h2>
        <p className="text-[#6b7280] text-[15px]">Organize your agents and resources into a workspace.</p>
      </div>

      <form className="w-full space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">
            Workspace Name
          </label>
          <input
            type="text"
            placeholder="Marketing Team"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 placeholder-gray-400 text-[14px] transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]"
          />
        </div>

        <div>
          <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">
            Description
          </label>
          <textarea
            placeholder="Default workspace for social media."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 placeholder-gray-400 text-[14px] transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2] resize-none"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || !name} 
          className="w-full bg-[#1967d2] hover:bg-[#1557b0] disabled:bg-blue-300 text-white font-medium py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none mt-8 text-[15px]"
        >
          {loading ? 'Creating...' : 'Create Workspace'}
        </button>
      </form>
    </div>
  );
}
