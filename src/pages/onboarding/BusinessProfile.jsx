import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { businessService } from '../../services/businessService';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import Select from 'react-select';
import { toast } from 'react-toastify';
import gsap from 'gsap';
import './profile-styles.css';

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

  useEffect(() => {
    // GSAP Entrance Animation
    gsap.fromTo('.sec', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.1, delay: 0.1, ease: 'power2.out' });
    gsap.fromTo('.bottom-actions', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, delay: 0.4, ease: 'power2.out' });
    gsap.fromTo('#fillB', { width: '0%' }, { width: '50%', duration: 1, delay: 0.3, ease: 'power2.out' });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let formattedWebsite = websiteUrl.trim();
      if (formattedWebsite && !/^https?:\/\//i.test(formattedWebsite)) {
        formattedWebsite = `https://${formattedWebsite}`;
      }

      await businessService.createOrUpdateBusinessProfile({
        companyName,
        industry,
        vision,
        description: targetAudience,
        website: formattedWebsite,
      });
      toast.success("Business profile saved successfully!");
      
      const updatedUser = await authService.getCurrentUser();
      const { accessToken, refreshToken } = useAuthStore.getState();
      useAuthStore.getState().setAuth(updatedUser, accessToken, refreshToken);

      navigate('/');
    } catch (err) {
      // apiClient handles toasts
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="set-scroll w-full">
      <div className="page-head">
        <div className="eyebrow"><span className="ln"></span>Workspace</div>
        <h1>Business Profile</h1>
        <p>Basic details about your organization to inform AI contexts.</p>
      </div>
      <div className="completeness">
        <div className="cbar"><div className="cbar-fill" id="fillB" style={{ width: '0%' }}></div></div>
        <span>Step 1 of 2</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="section sec">
          <div className="sec-label">
            <h3>Company info</h3>
            <p>Basic details about your organization to inform AI contexts.</p>
          </div>
          <div className="sec-fields">
            <div className="field">
              <label>Company Name <span className="req">*</span></label>
              <input
                type="text"
                placeholder="Acme AI Corp"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
            
            <div className="field">
              <label>Industry <span className="req">*</span></label>
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
                placeholder="Select or type..."
                isSearchable
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderRadius: '10px',
                    borderColor: state.isFocused ? 'var(--primary)' : 'var(--border)',
                    boxShadow: state.isFocused ? '0 0 0 3px var(--primary-soft)' : 'none',
                    padding: '3px 4px',
                    minHeight: '44px',
                    fontSize: '13.5px',
                    fontFamily: 'Inter, sans-serif',
                    '&:hover': { borderColor: state.isFocused ? 'var(--primary)' : 'var(--border)' }
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? 'var(--primary)' : state.isFocused ? 'var(--primary-soft)' : 'white',
                    color: state.isSelected ? 'white' : state.isFocused ? 'var(--primary-dark)' : 'var(--ink)',
                    fontSize: '13.5px',
                    fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer',
                  })
                }}
              />
            </div>

            <div className="field full">
              <label>Target Audience</label>
              <input
                type="text"
                placeholder="e.g. B2B SaaS Founders"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="section sec">
          <div className="sec-label">
            <h3>Contact & operations</h3>
            <p>Where and how your business operates online.</p>
          </div>
          <div className="sec-fields">
            <div className="field full">
              <label>Website URL</label>
              <input
                type="text"
                placeholder="e.g. acme-ai.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="section sec">
          <div className="sec-label">
            <h3>Brand identity</h3>
            <p>Guides the AI in generating content aligned with your goals.</p>
          </div>
          <div className="sec-fields">
            <div className="field full">
              <label>Vision & Goals</label>
              <textarea
                placeholder="To automate digital marketing and scale effortlessly."
                value={vision}
                onChange={(e) => setVision(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bottom-actions">
          <button 
            type="submit" 
            disabled={loading || !companyName || !industry} 
            className="btn-primary"
          >
            {loading ? 'Saving...' : 'Continue to Brand Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
