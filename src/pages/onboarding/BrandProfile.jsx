import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { brandService } from '../../services/brandService';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';
import gsap from 'gsap';
import './profile-styles.css';

export default function BrandProfile() {
  const [toneOfVoice, setToneOfVoice] = useState('');
  const [prohibitedKeywords, setProhibitedKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadBrand() {
      try {
        const brand = await brandService.getBrandProfile();
        if (brand) {
          if (brand.brandTone) setToneOfVoice(Array.isArray(brand.brandTone) ? brand.brandTone.join(', ') : brand.brandTone);
          if (brand.brandVoice) setProhibitedKeywords(Array.isArray(brand.brandVoice) ? brand.brandVoice.join(', ') : brand.brandVoice);
        }
      } catch (e) {
        // silent catch
      }
    }
    loadBrand();
  }, []);

  useEffect(() => {
    // GSAP Entrance Animation
    gsap.fromTo('.sec', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.1, delay: 0.1, ease: 'power2.out' });
    gsap.fromTo('.bottom-actions', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, delay: 0.4, ease: 'power2.out' });
    gsap.fromTo('#fillB', { width: '50%' }, { width: '100%', duration: 1, delay: 0.3, ease: 'power2.out' });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await brandService.upsertBrandGuidelines({
        brandName: 'My Brand',
        brandTone: toneOfVoice.split(',').map(t => t.trim()).filter(Boolean).join(', '),
        brandVoice: prohibitedKeywords.split(',').map(k => k.trim()).filter(Boolean).join(', '),
      });
      toast.success("Brand profile saved successfully!");
      
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

  const handleSkip = async () => {
    const updatedUser = await authService.getCurrentUser();
    const { accessToken, refreshToken } = useAuthStore.getState();
    useAuthStore.getState().setAuth(updatedUser, accessToken, refreshToken);
    navigate('/');
  };

  return (
    <div className="set-scroll w-full">
      <div className="page-head">
        <div className="eyebrow"><span className="ln"></span>Brand Voice</div>
        <h1>Brand Profile</h1>
        <p>Define how the AI agents should communicate.</p>
      </div>
      <div className="completeness">
        <div className="cbar"><div className="cbar-fill" id="fillB" style={{ width: '50%' }}></div></div>
        <span>Step 2 of 2</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="section sec">
          <div className="sec-label">
            <h3>Voice guidelines</h3>
            <p>Set rules for the tone and words the AI should use.</p>
          </div>
          <div className="sec-fields">
            <div className="field full">
              <label>Tone of Voice</label>
              <input
                type="text"
                placeholder="e.g. Professional, Witty, Friendly (comma separated)"
                value={toneOfVoice}
                onChange={(e) => setToneOfVoice(e.target.value)}
              />
            </div>
            
            <div className="field full">
              <label>Prohibited Keywords</label>
              <input
                type="text"
                placeholder="e.g. cheap, scam, free (comma separated)"
                value={prohibitedKeywords}
                onChange={(e) => setProhibitedKeywords(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bottom-actions">
          <button 
            type="button" 
            onClick={handleSkip}
            disabled={loading} 
            className="btn-secondary"
          >
            Skip for now
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="btn-primary"
          >
            {loading ? 'Saving...' : 'Finish Setup'}
          </button>
        </div>
      </form>
    </div>
  );
}
