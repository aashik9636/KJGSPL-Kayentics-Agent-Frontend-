import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { userService } from '../../services/userService';
import { businessService } from '../../services/businessService';
import { useAuthStore } from '../../store/authStore';
import PersonalProfileTab from './components/PersonalProfileTab';
import BusinessProfileTab from './components/BusinessProfileTab';
import { validateProfile, validateBusiness } from './utils';

const TABS = [
  { id: 'profile',  label: 'Personal Profile',   icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'business', label: 'Business Profile',   icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Masters
  const [industries, setIndustries] = useState([]);

  // States
  const [profile, setProfile] = useState({});
  const [business, setBusiness] = useState({});
  
  // Validation & Tracking
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  
  // Original states for "Cancel"
  const [origProfile, setOrigProfile] = useState({});
  const [origBusiness, setOrigBusiness] = useState({});

  const { setAuth, accessToken, refreshToken } = useAuthStore();

  // Load Data
  useEffect(() => {
    async function load() {
      try {
        const [userData, bizData, indData] = await Promise.allSettled([
          userService.getProfile(),
          businessService.getBusinessProfile(),
          businessService.getIndustries(),
        ]);

        if (indData.status === 'fulfilled') {
          const arr = Array.isArray(indData.value) ? indData.value : indData.value?.data || [];
          setIndustries(arr.map(i => {
            if (typeof i === 'object' && i !== null) {
              return { value: i.id || i.value || i.name, label: i.name || i.label || i.id };
            }
            const strVal = String(i);
            return { value: strVal, label: strVal.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) };
          }));
        }

        if (userData.status === 'fulfilled') {
          const d = userData.value || {};
          const p = {
            firstName: d.firstName || '', lastName: d.lastName || '',
            email: d.email || '', phone: d.phone || '',
            avatar: d.avatar || '', jobTitle: d.jobTitle || '',
            department: d.department || '',
            timezone: d.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            language: d.language || 'en'
          };
          setProfile(p);
          setOrigProfile(p);
        }

        if (bizData.status === 'fulfilled') {
          const b = bizData.value || {};
          const biz = {
            companyName: b.companyName || '', description: b.description || '',
            mission: b.mission || '', vision: b.vision || '', usp: b.usp || '',
            industry: b.industry || '', businessType: b.businessType || '',
            website: b.website || '', email: b.email || '', phone: b.phone || '',
            foundedYear: b.foundedYear || '', companySize: b.companySize || '',
            headquarters: b.headquarters || '', countriesServed: b.countriesServed || '',
            businessModel: b.businessModel || '',
            currency: b.currency || 'USD',
          };
          setBusiness(biz);
          setOrigBusiness(biz);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Change Handlers
  const handleProfileChange = (field, value) => {
    setProfile(p => ({ ...p, [field]: value }));
    setHasChanges(true);
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }));
  };

  const handleBusinessChange = (field, value) => {
    setBusiness(b => ({ ...b, [field]: value }));
    setHasChanges(true);
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }));
  };

  // Save Flow
  const handleSave = async () => {
    setErrors({});
    
    // Validate current tab
    if (activeTab === 'profile') {
      const errs = validateProfile(profile);
      if (Object.keys(errs).length > 0) return setErrors(errs);
      
      setSaving(true);
      try {
        await userService.updateProfile(profile);
        const currentUser = useAuthStore.getState().user;
        setAuth({ ...currentUser, name: `${profile.firstName} ${profile.lastName}`.trim() }, accessToken, refreshToken);
        setOrigProfile(profile);
        setHasChanges(false);
        toast.success('Personal profile saved successfully');
      } catch (err) {
        // Interceptor handles toast
      } finally {
        setSaving(false);
      }
    } else {
      const errs = validateBusiness(business);
      if (Object.keys(errs).length > 0) return setErrors(errs);
      
      setSaving(true);
      try {
        await (origBusiness.companyName
          ? businessService.updateBusinessProfile(business)
          : businessService.createBusinessProfile(business)
        );
        setOrigBusiness(business);
        setHasChanges(false);
        toast.success('Business profile saved successfully');
      } catch (err) {
        // Interceptor handles toast
      } finally {
        setSaving(false);
      }
    }
  };

  const handleCancel = () => {
    setProfile(origProfile);
    setBusiness(origBusiness);
    setErrors({});
    setHasChanges(false);
  };

  // Switch tabs safely
  const handleTabSwitch = (tabId) => {
    if (hasChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to switch tabs? Changes will be lost.')) return;
    }
    setProfile(origProfile);
    setBusiness(origBusiness);
    setErrors({});
    setHasChanges(false);
    setActiveTab(tabId);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <svg className="animate-spin w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-24 relative">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-10">
        
        {/* ── Sidebar Navigation ── */}
        <div className="w-full md:w-56 flex-shrink-0">
          <div className="sticky top-10 space-y-1">
            <h1 className="text-xl font-bold text-gray-900 px-3 mb-6">Settings</h1>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabSwitch(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/60'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
                }`}
              >
                <svg className={`w-4 h-4 ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Form Area ── */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-8 py-8 md:p-10">
            
            {activeTab === 'profile' && (
              <PersonalProfileTab 
                profile={profile} 
                errors={errors} 
                onChange={handleProfileChange} 
              />
            )}

            {activeTab === 'business' && (
              <BusinessProfileTab 
                business={business} 
                errors={errors} 
                onChange={handleBusinessChange} 
                industries={industries} 
              />
            )}
            
          </div>
        </div>
      </div>

      {/* ── Sticky Save Footer ── */}
      <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          hasChanges ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <div className="bg-gray-900 rounded-full px-5 py-3 shadow-2xl flex items-center gap-6 border border-gray-800">
          <span className="text-[13px] font-medium text-gray-300">You have unsaved changes.</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-1.5 rounded-full text-[13px] font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-1.5 rounded-full bg-white text-gray-900 text-[13px] font-bold hover:bg-gray-100 transition-colors shadow-sm flex items-center gap-2"
            >
              {saving ? (
                <><svg className="animate-spin w-3.5 h-3.5 text-gray-900" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Saving...</>
              ) : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
