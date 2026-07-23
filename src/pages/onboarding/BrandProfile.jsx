import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { brandService } from '../../services/brandService';
import { toast } from 'react-toastify';

export default function BrandProfile() {
  const [toneOfVoice, setToneOfVoice] = useState('');
  const [prohibitedKeywords, setProhibitedKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    async function loadBrand() {
      try {
        const brand = await brandService.getBrandProfile();
        if (brand) {
          if (brand.brandTone) setToneOfVoice(Array.isArray(brand.brandTone) ? brand.brandTone.join(', ') : brand.brandTone);
          if (brand.prohibitedKeywords) setProhibitedKeywords(Array.isArray(brand.prohibitedKeywords) ? brand.prohibitedKeywords.join(', ') : brand.prohibitedKeywords);
        }
      } catch (e) {
        // silent catch
      }
    }
    loadBrand();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await brandService.upsertBrandGuidelines({
        toneOfVoice: toneOfVoice.split(',').map(t => t.trim()).filter(Boolean),
        prohibitedKeywords: prohibitedKeywords.split(',').map(k => k.trim()).filter(Boolean)
      });
      toast.success("Brand profile saved successfully!");
      // Proceed to the dashboard!
      window.location.href = '/'; 
    } catch (err) {
      // apiClient handles toasts
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Brand profile is optional, proceed to dashboard
    window.location.href = '/';
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-[32px] font-medium text-[#111827] tracking-tight mb-2">Brand Voice</h2>
        <p className="text-[#6b7280] text-[15px]">Define how the AI agents should communicate.</p>
      </div>

      <form className="w-full space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">
            Tone of Voice
          </label>
          <input
            type="text"
            placeholder="e.g. Professional, Witty, Friendly (comma separated)"
            value={toneOfVoice}
            onChange={(e) => setToneOfVoice(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 placeholder-gray-400 text-[14px] transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]"
          />
        </div>

        <div>
          <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">
            Prohibited Keywords
          </label>
          <input
            type="text"
            placeholder="e.g. cheap, scam, free (comma separated)"
            value={prohibitedKeywords}
            onChange={(e) => setProhibitedKeywords(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 placeholder-gray-400 text-[14px] transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]"
          />
        </div>

        <div className="flex flex-col space-y-3 mt-8">
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#1967d2] hover:bg-[#1557b0] disabled:bg-blue-300 text-white font-medium py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none text-[15px]"
          >
            {loading ? 'Saving...' : 'Finish Setup'}
          </button>
          
          <button 
            type="button" 
            onClick={handleSkip}
            disabled={loading} 
            className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all focus:outline-none text-[14px]"
          >
            Skip for now
          </button>
        </div>
      </form>
    </div>
  );
}
