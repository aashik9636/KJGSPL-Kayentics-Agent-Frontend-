import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { userService } from '../services/userService';
import { useAuthStore } from '../store/authStore';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { setAuth, accessToken, refreshToken } = useAuthStore();
  
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '',
    jobTitle: '',
    department: '',
    timezone: '',
    language: 'en',
    status: '',
    role: '',
    createdAt: ''
  });

  // Dynamic Options
  const timezonesList = Intl.supportedValuesOf('timeZone');
  const timezoneOptions = timezonesList.map(tz => ({ value: tz, label: tz }));
  
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
  ];

  // Custom Styles for React-Select
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      padding: '2px',
      borderRadius: '0.75rem',
      backgroundColor: state.isFocused ? '#ffffff' : '#f9fafb',
      border: state.isFocused ? '1px solid #1967d2' : '1px solid #e5e7eb',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(25, 103, 210, 0.2)' : 'none',
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
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    })
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await userService.getProfile();
        setProfile({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          avatar: data.avatar || '',
          jobTitle: data.jobTitle || '',
          department: data.department || '',
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          language: data.language || 'en',
          status: data.status || 'ACTIVE',
          role: data.role || 'USER',
          createdAt: data.createdAt || new Date().toISOString()
        });
      } catch (error) {
        // Error is handled by apiClient
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name, value) => {
    setProfile({ ...profile, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        avatar: profile.avatar,
        jobTitle: profile.jobTitle,
        department: profile.department,
        timezone: profile.timezone,
        language: profile.language
      };
      const updatedData = await userService.updateProfile(payload);
      
      // Update global auth store with merged details (useful for navbar avatar)
      const currentUser = useAuthStore.getState().user;
      setAuth({ ...currentUser, name: `${payload.firstName} ${payload.lastName}`.trim() }, accessToken, refreshToken);
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      // Handled by apiClient interceptor
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <svg className="animate-spin w-8 h-8 text-[#1967d2]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>
    );
  }

  // Format the date nicely
  const joinedDate = new Date(profile.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-8 h-full overflow-y-auto">
      
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your personal profile, preferences, and security.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar Menu */}
        <div className="w-full lg:w-64 shrink-0 space-y-1">
          <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-[#eff6ff] text-[#1967d2] font-semibold text-sm transition-colors">
            <span>Profile Details</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>

        {/* Right Form Area */}
        <div className="flex-1 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Card 1: Personal Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-[16px] font-bold text-gray-900">Personal Information</h3>
              </div>
              <div className="p-6">
                
                {/* Avatar Section */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative group cursor-pointer">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover shadow-sm ring-4 ring-white" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1967d2] to-blue-400 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-sm ring-4 ring-white">
                        {profile.firstName ? profile.firstName.charAt(0) : profile.email.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mt-1">Profile image linked to your account.</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">First Name</label>
                    <input type="text" name="firstName" value={profile.firstName} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 text-sm transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Last Name</label>
                    <input type="text" name="lastName" value={profile.lastName} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 text-sm transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Email Address</label>
                    <input type="email" value={profile.email} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 text-sm cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Phone Number</label>
                    <input type="tel" name="phone" value={profile.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 text-sm transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Professional Details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-[16px] font-bold text-gray-900">Professional Details</h3>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Job Title</label>
                  <input type="text" name="jobTitle" value={profile.jobTitle} onChange={handleChange} placeholder="e.g. Product Manager" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 text-sm transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]" />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Department</label>
                  <input type="text" name="department" value={profile.department} onChange={handleChange} placeholder="e.g. Marketing" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 text-sm transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]" />
                </div>
              </div>
            </div>

            {/* Card 3: Preferences */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-[16px] font-bold text-gray-900">Localization</h3>
                <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-md border border-green-100">Role: {profile.role}</span>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Timezone</label>
                  <Select
                    options={timezoneOptions}
                    value={timezoneOptions.find(opt => opt.value === profile.timezone) || null}
                    onChange={(selected) => handleSelectChange('timezone', selected.value)}
                    placeholder="Search timezone..."
                    styles={selectStyles}
                    isSearchable
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Language</label>
                  <Select
                    options={languageOptions}
                    value={languageOptions.find(opt => opt.value === profile.language) || null}
                    onChange={(selected) => handleSelectChange('language', selected.value)}
                    styles={selectStyles}
                    isSearchable={false}
                  />
                </div>
              </div>
            </div>
            
            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 pb-10">
              <p className="text-xs text-gray-400">Account created in {joinedDate}</p>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="px-8 py-3 rounded-xl bg-[#1967d2] hover:bg-[#1557b0] text-white font-medium text-sm shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center gap-2">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
