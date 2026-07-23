import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { businessService } from '../../services/businessService';
import Select from 'react-select';
import { toast } from 'react-toastify';

export default function BusinessProfile() {
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [vision, setVision] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [industriesList, setIndustriesList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [indData, profileRes] = await Promise.allSettled([
          businessService.getIndustries(),
          businessService.getBusinessProfile()
        ]);

        if (indData.status === 'fulfilled') {
          setIndustriesList(indData.value || []);
        }

        if (profileRes.status === 'fulfilled' && profileRes.value) {
          const profile = profileRes.value;
          if (profile.companyName) setCompanyName(profile.companyName);
          if (profile.industry) setIndustry(profile.industry);
          if (profile.vision) setVision(profile.vision);
          if (profile.targetAudience || profile.description) setTargetAudience(profile.targetAudience || profile.description || '');
          if (profile.websiteUrl || profile.website) setWebsiteUrl(profile.websiteUrl || profile.website || '');
        }
      } catch (e) {
        console.error("Failed to load business profile data", e);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await businessService.createOrUpdateBusinessProfile({
        companyName,
        industry,
        vision,
        description: targetAudience,   // backend field: description
        website: websiteUrl,            // backend field: website
      });
      toast.success("Business profile saved successfully!");
      // Proceed to the next onboarding step (Brand Profile) or dashboard
      navigate('/onboarding/brand-profile');
    } catch (err) {
      // apiClient handles toasts
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-[32px] font-medium text-[#111827] tracking-tight mb-2">Business Context</h2>
        <p className="text-[#6b7280] text-[15px]">Help the AI understand your business goals and audience.</p>
      </div>

      <form className="w-full space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">
            Company Name
          </label>
          <input
            type="text"
            placeholder="Acme AI Corp"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 placeholder-gray-400 text-[14px] transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">
              Industry <span className="text-red-500">*</span>
            </label>
            <Select
              options={industriesList.map(ind => {
                if (typeof ind === 'object' && ind !== null) {
                  return { value: ind.id || ind.name, label: ind.name || ind.id };
                }
                const strVal = String(ind);
                return { value: strVal, label: strVal.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) };
              })}
              value={industriesList.length ? {
                value: industry,
                label: (typeof industriesList[0] === 'object'
                  ? industriesList.find(i => i.id === industry || i.name === industry)?.name
                  : industry) || industry || 'Select an industry...'
              } : null}
              onChange={(selected) => setIndustry(selected?.value || '')}
              placeholder="Select or type an industry..."
              isSearchable
              required
              styles={{
                control: (base, state) => ({
                  ...base,
                  padding: '2px',
                  borderRadius: '0.75rem',
                  backgroundColor: state.isFocused ? '#ffffff' : '#f9fafb',
                  border: state.isFocused ? '1px solid #1967d2' : '1px solid #e5e7eb',
                  boxShadow: state.isFocused ? '0 0 0 2px rgba(25, 103, 210, 0.2)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: state.isFocused ? '#1967d2' : '#d1d5db'
                  }
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected ? '#1967d2' : state.isFocused ? '#eff6ff' : 'white',
                  color: state.isSelected ? 'white' : '#111827',
                  fontSize: '14px',
                  cursor: 'pointer',
                }),
                menu: (base) => ({
                  ...base,
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  zIndex: 50,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                })
              }}
            />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">
              Website URL
            </label>
            <input
              type="url"
              placeholder="https://acme-ai.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 placeholder-gray-400 text-[14px] transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">
            Target Audience
          </label>
          <input
            type="text"
            placeholder="B2B SaaS Founders"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            required
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 placeholder-gray-400 text-[14px] transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]"
          />
        </div>

        <div>
          <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">
            Vision & Goals
          </label>
          <textarea
            placeholder="To automate digital marketing and scale effortlessly."
            value={vision}
            onChange={(e) => setVision(e.target.value)}
            rows="3"
            required
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 placeholder-gray-400 text-[14px] transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2] resize-none"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || !companyName || !industry} 
          className="w-full bg-[#1967d2] hover:bg-[#1557b0] disabled:bg-blue-300 text-white font-medium py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none mt-8 text-[15px]"
        >
          {loading ? 'Saving...' : 'Continue to Brand Profile'}
        </button>
      </form>
    </div>
  );
}
