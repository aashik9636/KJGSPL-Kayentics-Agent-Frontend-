import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { userService } from '../services/userService';
import { businessService } from '../services/businessService';
import { useAuthStore } from '../store/authStore';

// ─── Constants & Master Data ──────────────────────────────────────────────────
const TABS = [
  { id: 'profile',  label: 'Personal Profile',   icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'business', label: 'Business Profile',   icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
];

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'INR', label: 'INR (₹)' },
  { value: 'AUD', label: 'AUD ($)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'SGD', label: 'SGD ($)' },
  { value: 'AED', label: 'AED (د.إ)' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
];

const TIMEZONES = Intl.supportedValuesOf('timeZone').map(tz => ({ value: tz, label: tz }));

// ─── Validation Helpers ────────────────────────────────────────────────────────
const isValidUrl = (str) => !str || /^https?:\/\/[^\s$.?#].[^\s]*$/.test(str);
const isValidEmail = (str) => !str || /^\S+@\S+\.\S+$/.test(str);
const isValidPhone = (str) => !str || /^\+?[0-9\s\-\(\)]+$/.test(str);

const validateProfile = (data) => {
  const errors = {};
  if (!data.firstName?.trim()) errors.firstName = "First name is required";
  if (!data.lastName?.trim()) errors.lastName = "Last name is required";
  if (data.phone && !isValidPhone(data.phone)) errors.phone = "Invalid phone format";
  return errors;
};

const validateBusiness = (data) => {
  const errors = {};
  if (!data.companyName?.trim()) errors.companyName = "Company name is required";
  if (!isValidUrl(data.website)) errors.website = "Must be a valid URL (https://...)";
  if (!isValidEmail(data.email)) errors.email = "Must be a valid email address";
  if (!isValidPhone(data.phone)) errors.phone = "Invalid phone format";
  if (data.foundedYear && (data.foundedYear < 1800 || data.foundedYear > new Date().getFullYear())) errors.foundedYear = "Must be a valid year";
  return errors;
};

// ─── Select Styles (Vercel/Linear-esque) ──────────────────────────────────────
const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '40px',
    borderRadius: '0.5rem',
    backgroundColor: '#ffffff',
    border: state.isFocused ? '1px solid #111827' : '1px solid #e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 4px rgba(17, 24, 39, 0.05)' : '0 1px 2px rgba(0,0,0,0.02)',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    '&:hover': { borderColor: state.isFocused ? '#111827' : '#d1d5db' },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#111827' : state.isFocused ? '#f9fafb' : 'white',
    color: state.isSelected ? 'white' : '#111827',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '8px 12px',
    '&:active': { backgroundColor: '#f3f4f6' }
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.5rem',
    overflow: 'hidden',
    zIndex: 50,
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  }),
};

// ─── UI Components ────────────────────────────────────────────────────────────
function Section({ title, description, children, border = true }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 ${border ? 'border-b border-gray-100 pb-10 mb-10' : ''}`}>
      <div className="col-span-1">
        <h3 className="text-[15px] font-bold text-gray-900">{title}</h3>
        <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">{description}</p>
      </div>
      <div className="col-span-1 md:col-span-2 space-y-5">
        {children}
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 mt-1.5 text-[12px] font-medium text-red-600 animate-fade-in">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </p>
      )}
    </div>
  );
}

const InputCls = (error) => `w-full px-3.5 py-2.5 rounded-lg border bg-white text-[14px] text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all outline-none focus:ring-[4px] placeholder:text-gray-400 ${
  error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' 
    : 'border-gray-200 focus:border-gray-900 focus:ring-gray-900/5 hover:border-gray-300'
}`;

const TextareaCls = (error) => `${InputCls(error)} resize-y min-h-[100px]`;

// ──────────────────────────────────────────────────────────────────────────────
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
          setIndustries(arr.map(i => ({ value: i, label: i.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) })));
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
            currency: b.currency || 'USD', // The new currency master field
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
        await businessService.createOrUpdateBusinessProfile(business);
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
            
            {/* ═════════ MY PROFILE ═════════ */}
            {activeTab === 'profile' && (
              <div className="animate-fade-in">
                <Section title="General" description="Update your personal information and contact details.">
                  <div className="grid grid-cols-2 gap-5">
                    <Field label="First Name *" error={errors.firstName}>
                      <input type="text" value={profile.firstName} onChange={e => handleProfileChange('firstName', e.target.value)} className={InputCls(errors.firstName)} placeholder="Jane" />
                    </Field>
                    <Field label="Last Name *" error={errors.lastName}>
                      <input type="text" value={profile.lastName} onChange={e => handleProfileChange('lastName', e.target.value)} className={InputCls(errors.lastName)} placeholder="Doe" />
                    </Field>
                  </div>
                  <Field label="Email Address">
                    <input type="email" value={profile.email} disabled className="w-full px-3.5 py-2.5 rounded-lg border border-gray-100 bg-gray-50 text-[14px] text-gray-500 cursor-not-allowed" />
                  </Field>
                  <Field label="Phone Number" error={errors.phone}>
                    <input type="tel" value={profile.phone} onChange={e => handleProfileChange('phone', e.target.value)} className={InputCls(errors.phone)} placeholder="+1 (555) 000-0000" />
                  </Field>
                </Section>

                <Section title="Professional Role" description="Your designation within the organization.">
                  <Field label="Job Title">
                    <input type="text" value={profile.jobTitle} onChange={e => handleProfileChange('jobTitle', e.target.value)} className={InputCls(errors.jobTitle)} placeholder="e.g. Marketing Director" />
                  </Field>
                  <Field label="Department">
                    <input type="text" value={profile.department} onChange={e => handleProfileChange('department', e.target.value)} className={InputCls(errors.department)} placeholder="e.g. Demand Generation" />
                  </Field>
                </Section>

                <Section title="Preferences" description="Manage your region and language settings." border={false}>
                  <div className="grid grid-cols-2 gap-5">
                    <Field label="Timezone">
                      <Select options={TIMEZONES} value={TIMEZONES.find(o => o.value === profile.timezone)} onChange={s => handleProfileChange('timezone', s.value)} styles={selectStyles} isSearchable />
                    </Field>
                    <Field label="Language">
                      <Select options={LANGUAGES} value={LANGUAGES.find(o => o.value === profile.language)} onChange={s => handleProfileChange('language', s.value)} styles={selectStyles} isSearchable={false} />
                    </Field>
                  </div>
                </Section>
              </div>
            )}

            {/* ═════════ BUSINESS PROFILE ═════════ */}
            {activeTab === 'business' && (
              <div className="animate-fade-in">
                <Section title="Company Info" description="Basic details about your organization to inform AI contexts.">
                  <Field label="Company Name *" error={errors.companyName}>
                    <input type="text" value={business.companyName} onChange={e => handleBusinessChange('companyName', e.target.value)} className={InputCls(errors.companyName)} placeholder="Acme Corp" />
                  </Field>
                  <Field label="Description" error={errors.description}>
                    <textarea value={business.description} onChange={e => handleBusinessChange('description', e.target.value)} className={TextareaCls(errors.description)} placeholder="A brief overview of your business..." />
                  </Field>
                  <div className="grid grid-cols-2 gap-5">
                    <Field label="Industry Master" error={errors.industry}>
                      <Select 
                        options={industries} 
                        value={industries.find(o => o.value === business.industry) || null} 
                        onChange={s => handleBusinessChange('industry', s.value)} 
                        styles={selectStyles} 
                        placeholder="Select Industry..."
                        isSearchable 
                      />
                    </Field>
                    <Field label="Currency Master" error={errors.currency}>
                      <Select 
                        options={CURRENCIES} 
                        value={CURRENCIES.find(o => o.value === business.currency) || null} 
                        onChange={s => handleBusinessChange('currency', s.value)} 
                        styles={selectStyles} 
                        placeholder="Select Currency..."
                        isSearchable 
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <Field label="Business Type">
                      <input type="text" value={business.businessType} onChange={e => handleBusinessChange('businessType', e.target.value)} className={InputCls(errors.businessType)} placeholder="e.g. B2B SaaS" />
                    </Field>
                    <Field label="Business Model">
                      <input type="text" value={business.businessModel} onChange={e => handleBusinessChange('businessModel', e.target.value)} className={InputCls(errors.businessModel)} placeholder="e.g. Subscription" />
                    </Field>
                  </div>
                </Section>

                <Section title="Contact & Operations" description="Where and how your business operates.">
                  <div className="grid grid-cols-2 gap-5">
                    <Field label="Website" error={errors.website}>
                      <input type="url" value={business.website} onChange={e => handleBusinessChange('website', e.target.value)} className={InputCls(errors.website)} placeholder="https://..." />
                    </Field>
                    <Field label="Public Email" error={errors.email}>
                      <input type="email" value={business.email} onChange={e => handleBusinessChange('email', e.target.value)} className={InputCls(errors.email)} placeholder="hello@company.com" />
                    </Field>
                    <Field label="Phone" error={errors.phone}>
                      <input type="tel" value={business.phone} onChange={e => handleBusinessChange('phone', e.target.value)} className={InputCls(errors.phone)} placeholder="+1 555..." />
                    </Field>
                    <Field label="Founded Year" error={errors.foundedYear}>
                      <input type="number" value={business.foundedYear} onChange={e => handleBusinessChange('foundedYear', parseInt(e.target.value) || '')} className={InputCls(errors.foundedYear)} placeholder="e.g. 2020" min="1800" max={new Date().getFullYear()} />
                    </Field>
                    <Field label="Company Size">
                      <input type="text" value={business.companySize} onChange={e => handleBusinessChange('companySize', e.target.value)} className={InputCls(errors.companySize)} placeholder="e.g. 11-50 employees" />
                    </Field>
                    <Field label="Headquarters">
                      <input type="text" value={business.headquarters} onChange={e => handleBusinessChange('headquarters', e.target.value)} className={InputCls(errors.headquarters)} placeholder="e.g. San Francisco, CA" />
                    </Field>
                  </div>
                  <Field label="Countries Served">
                    <input type="text" value={business.countriesServed} onChange={e => handleBusinessChange('countriesServed', e.target.value)} className={InputCls(errors.countriesServed)} placeholder="e.g. Global, US & Canada" />
                  </Field>
                </Section>

                <Section title="Brand Identity" description="Guides the AI in generating content aligned with your goals." border={false}>
                  <Field label="Mission">
                    <textarea value={business.mission} onChange={e => handleBusinessChange('mission', e.target.value)} className={TextareaCls()} placeholder="Our mission is to..." />
                  </Field>
                  <Field label="Vision">
                    <textarea value={business.vision} onChange={e => handleBusinessChange('vision', e.target.value)} className={TextareaCls()} placeholder="We envision a world where..." />
                  </Field>
                  <Field label="Unique Selling Proposition (USP)">
                    <textarea value={business.usp} onChange={e => handleBusinessChange('usp', e.target.value)} className={TextareaCls()} placeholder="What makes you unique?" />
                  </Field>
                </Section>
              </div>
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
