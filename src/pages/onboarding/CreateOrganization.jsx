import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workspaceService } from '../../services/workspaceService';
import { businessService } from '../../services/businessService';
import cc from 'currency-codes';
import Select from 'react-select';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';

export default function CreateOrganization() {
  const { user, refreshToken, setTokens } = useAuthStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [industry, setIndustry] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);

  // Dynamic Data Lists
  const [industriesList, setIndustriesList] = useState([]);
  const timezonesList = Intl.supportedValuesOf('timeZone');
  const currenciesList = cc.data; // Array of { code, currency } objects

  useEffect(() => {
    async function fetchIndustries() {
      try {
        const data = await businessService.getIndustries();
        setIndustriesList(data);
      } catch (e) {
        console.error("Failed to load industries");
      }
    }
    fetchIndustries();
  }, []);

  // Formatted Options for React-Select
  const industryOptions = industriesList.map(ind => {
    if (typeof ind === 'object' && ind !== null) {
      return { value: ind.id || ind.name, label: ind.name || ind.id };
    }
    const strVal = String(ind);
    return { value: strVal, label: strVal.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) };
  });
  const timezoneOptions = timezonesList.map(tz => ({ value: tz, label: tz }));
  const currencyOptions = currenciesList.map(c => ({ value: c.code, label: `${c.code} - ${c.currency}` }));

  // Custom Styles for React-Select to match Kaynetics branding
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      padding: '4px',
      borderRadius: '0.75rem',
      backgroundColor: state.isFocused ? '#ffffff' : '#f9fafb',
      border: state.isFocused ? '1px solid #1967d2' : '1px solid #e5e7eb',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(25, 103, 210, 0.2)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      fontSize: '15px',
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
      fontSize: '15px',
      cursor: 'pointer',
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.75rem',
      overflow: 'hidden',
      zIndex: 50,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    })
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create the organization with all required fields
      await workspaceService.createOrganization({ 
        name, 
        slug, 
        email, 
        industry, 
        timezone, 
        currency 
      });
      toast.success("Organization created successfully!");

      // 2. Refresh token to get new orgId and workspaceId
      if (refreshToken) {
        const refreshResponse = await authService.refresh(refreshToken);
        const newAccessToken = refreshResponse.accessToken;
        const newRefreshToken = refreshResponse.refreshToken || refreshToken;
        
        setTokens(newAccessToken, newRefreshToken);
        window.location.href = '/'; 
      } else {
        toast.error("Session missing. Please log in again.");
        navigate('/login');
      }
    } catch (err) {
      // apiClient interceptor handles errors
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    setSlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  return (
    <div className="w-full">
      <div className="mb-10 text-center">
        <h2 className="text-[36px] font-bold text-[#111827] tracking-tight mb-3">Welcome to Kaynetics</h2>
        <p className="text-[#6b7280] text-[16px]">Let's get started by setting up your organization.</p>
      </div>

      <form className="w-full space-y-6" onSubmit={handleSubmit}>
        
        {/* Row 1: Name and Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-[12px] font-bold text-[#4b5563] mb-2 uppercase tracking-wider">
              Organization Name <span className="text-red-500 ml-1 text-lg leading-none">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Acme AI Corp"
              value={name}
              onChange={handleNameChange}
              required
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 placeholder-gray-400 text-[15px] transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2] shadow-sm"
            />
          </div>

          <div>
            <label className="flex items-center text-[12px] font-bold text-[#4b5563] mb-2 uppercase tracking-wider">
              URL Slug <span className="text-red-500 ml-1 text-lg leading-none">*</span>
            </label>
            <div className="flex items-stretch shadow-sm rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-[#1967d2]/20 focus-within:border-[#1967d2] transition-all">
              <div className="flex items-center px-4 bg-gray-50 border-r border-gray-200 text-gray-500 text-[14px] font-medium whitespace-nowrap">
                kaynetics.com/
              </div>
              <input
                type="text"
                placeholder="acme-ai-corp"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="w-full px-4 py-3.5 bg-[#f9fafb] focus:bg-white text-gray-900 placeholder-gray-400 text-[15px] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Email and Industry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-[12px] font-bold text-[#4b5563] mb-2 uppercase tracking-wider">
              Contact Email <span className="text-red-500 ml-1 text-lg leading-none">*</span>
            </label>
            <input
              type="email"
              placeholder="billing@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 placeholder-gray-400 text-[15px] transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2] shadow-sm"
            />
          </div>

          <div>
            <label className="flex items-center text-[12px] font-bold text-[#4b5563] mb-2 uppercase tracking-wider">
              Industry <span className="text-red-500 ml-1 text-lg leading-none">*</span>
            </label>
            <Select
              options={industryOptions}
              value={industryOptions.find(opt => opt.value === industry) || null}
              onChange={(selected) => setIndustry(selected.value)}
              placeholder="Select or type an industry..."
              styles={selectStyles}
              isSearchable
              required
            />
          </div>
        </div>

        {/* Row 3: Timezone and Currency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-[12px] font-bold text-[#4b5563] mb-2 uppercase tracking-wider">
              Timezone <span className="text-red-500 ml-1 text-lg leading-none">*</span>
            </label>
            <Select
              options={timezoneOptions}
              value={timezoneOptions.find(opt => opt.value === timezone) || null}
              onChange={(selected) => setTimezone(selected.value)}
              placeholder="Search timezone..."
              styles={selectStyles}
              isSearchable
              required
            />
          </div>

          <div>
            <label className="flex items-center text-[12px] font-bold text-[#4b5563] mb-2 uppercase tracking-wider">
              Currency <span className="text-red-500 ml-1 text-lg leading-none">*</span>
            </label>
            <Select
              options={currencyOptions}
              value={currencyOptions.find(opt => opt.value === currency) || null}
              onChange={(selected) => setCurrency(selected.value)}
              placeholder="Search currency..."
              styles={selectStyles}
              isSearchable
              required
            />
          </div>
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            disabled={loading || !name || !slug || !email || !industry || !timezone || !currency} 
            className="w-full bg-[#1967d2] hover:bg-[#1557b0] disabled:bg-blue-300 text-white font-medium py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none text-[16px] flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Organization...
              </>
            ) : (
              'Create Organization'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
