import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { userService } from '../../services/userService';
import { businessService } from '../../services/businessService';
import { useAuthStore } from '../../store/authStore';
import PersonalProfileTab from './components/PersonalProfileTab';
import BusinessProfileTab from './components/BusinessProfileTab';
import { validateProfile, validateBusiness } from './utils';
import gsap from 'gsap';
import './profile-settings.css';

const TABS = [
  { id: 'profile',  label: 'Personal Profile' },
  { id: 'business', label: 'Business Profile' },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [industries, setIndustries] = useState([]);

  const [profile, setProfile] = useState({});
  const [business, setBusiness] = useState({});
  
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  
  const [origProfile, setOrigProfile] = useState({});
  const [origBusiness, setOrigBusiness] = useState({});

  const { setAuth, accessToken, refreshToken } = useAuthStore();
  
  const pillRef = useRef(null);
  const navRef = useRef(null);

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

  const movePill = (btnIndex, animate = true) => {
    if (!navRef.current || !pillRef.current) return;
    const btns = navRef.current.querySelectorAll('button');
    const btn = btns[btnIndex];
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const navR = navRef.current.getBoundingClientRect();
    const x = r.left - navR.left;
    const w = r.width;
    
    if (animate) {
      gsap.to(pillRef.current, { x, width: w, duration: 0.4, ease: 'power3.out' });
    } else {
      gsap.set(pillRef.current, { x, width: w });
    }
  };

  const playIn = (tab) => {
    gsap.fromTo('.id-card', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' });
    gsap.fromTo('.sec', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.1, delay: 0.1, ease: 'power2.out' });
    const fillId = tab === 'profile' ? '#fillP' : '#fillB';
    const pct = tab === 'profile' ? 75 : 90;
    gsap.fromTo(fillId, { width: '0%' }, { width: pct + '%', duration: 1, delay: 0.3, ease: 'power2.out' });
  };

  useEffect(() => {
    if (!loading) {
      const idx = TABS.findIndex(t => t.id === activeTab);
      movePill(idx, false);
      playIn(activeTab);
    }
  }, [loading, activeTab]);

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

  const handleSave = async () => {
    setErrors({});
    
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

  const handleTabSwitch = (tabId, idx) => {
    if (activeTab === tabId) return;
    if (hasChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to switch tabs? Changes will be lost.')) return;
    }
    setProfile(origProfile);
    setBusiness(origBusiness);
    setErrors({});
    setHasChanges(false);
    setActiveTab(tabId);
    movePill(idx, true);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <svg className="animate-spin w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      </div>
    );
  }

  return (
    <div className="profile-app flex-col items-center">
      
      <div className="set-body w-full flex-1">
        <div className="set-scroll" id="main-scroll">
          
          {/* Header & Tabs Aligned Together */}
          <div className="flex justify-between items-end mb-2">
            <div className="page-head" style={{ marginBottom: 0 }}>
              <div className="eyebrow">
                <span className="ln"></span>
                {activeTab === 'profile' ? 'Account' : 'Workspace'}
              </div>
              <h1>{activeTab === 'profile' ? 'Personal profile' : 'Business profile'}</h1>
              <p>{activeTab === 'profile' ? 'Update your personal information and contact details.' : 'Basic details about your organization to inform AI contexts.'}</p>
            </div>
            
            <div className="concept-nav" ref={navRef} style={{ margin: 0 }}>
              <div className="nav-pill" ref={pillRef}></div>
              {TABS.map((tab, idx) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabSwitch(tab.id, idx)}
                  className={activeTab === tab.id ? 'active' : ''}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'profile' && (
            <div className="tab-content" id="personal">
              <div className="completeness">
                <div className="cbar"><div className="cbar-fill" id="fillP" style={{ width: '0%' }}></div></div>
                <span>75% complete</span>
              </div>

              <div className="id-card ic1">
                <div className="id-avatar">{(profile.firstName?.[0] || '') + (profile.lastName?.[0] || '')}</div>
                <div className="id-info">
                  <b>{profile.firstName} {profile.lastName}</b>
                  <span>{profile.email}</span>
                </div>
                <div className="id-actions"><button className="id-btn">Remove</button><button className="id-btn primary">Upload photo</button></div>
              </div>

              <PersonalProfileTab 
                profile={profile} 
                errors={errors} 
                onChange={handleProfileChange} 
              />
            </div>
          )}

          {activeTab === 'business' && (
            <div className="tab-content" id="business">
              <div className="completeness">
                <div className="cbar"><div className="cbar-fill" id="fillB" style={{ width: '0%' }}></div></div>
                <span>90% complete</span>
              </div>

              <div className="id-card ic2">
                <div className="id-logo">🏢</div>
                <div className="id-info">
                  <b>{business.companyName || 'Company Name'}</b>
                  <span>{business.industry || 'Industry'} · {business.businessType || 'B2B'}</span>
                </div>
                <div className="id-actions"><button className="id-btn">Remove</button><button className="id-btn primary">Upload logo</button></div>
              </div>

              <BusinessProfileTab 
                business={business} 
                errors={errors} 
                onChange={handleBusinessChange} 
                industries={industries} 
              />
            </div>
          )}
        </div>
        
        {/* Sticky Save Footer */}
        <div className={`savebar ${hasChanges ? 'visible' : ''}`} id="savebar">
          <b>You have unsaved changes</b>
          <div className="btns">
            <button className="discard" onClick={handleCancel} disabled={saving}>Discard</button>
            <button className="save" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
