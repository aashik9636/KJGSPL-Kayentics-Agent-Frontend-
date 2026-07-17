import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { businessService } from '../../../services/businessService';

export default function BrandGuidelinesTab() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    primaryColor: '',
    secondaryColor: '',
    logoUrl: '',
    fontFamily: '',
    toneOfVoice: '',
    bannedWords: ''
  });

  useEffect(() => {
    const fetchGuidelines = async () => {
      try {
        const response = await businessService.getBrandGuidelines();
        if (response?.data) {
          setFormData({
            ...response.data,
            bannedWords: response.data.bannedWords?.join(', ') || ''
          });
        }
      } catch (error) {
        console.error('Failed to load brand guidelines:', error);
      } finally {
        setFetching(false);
      }
    };
    fetchGuidelines();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        bannedWords: formData.bannedWords.split(',').map(w => w.trim()).filter(Boolean)
      };
      await businessService.createOrUpdateBrandGuidelines(payload);
      toast.success('Brand Guidelines updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update Brand Guidelines');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  if (fetching) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[13px] font-bold text-[#1a1a1a] mb-2">Primary Color</label>
          <div className="flex gap-3">
            <input
              type="color"
              name="primaryColor"
              value={formData.primaryColor || '#6366f1'}
              onChange={handleChange}
              className="h-12 w-12 rounded-lg cursor-pointer shrink-0 border-0 p-0"
            />
            <input
              type="text"
              name="primaryColor"
              value={formData.primaryColor}
              onChange={handleChange}
              placeholder="#6366f1"
              className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-white focus:bg-[#fafbfc] focus:border-[#1a1a1a] text-[#1a1a1a] text-[15px] focus:outline-none focus:ring-4 focus:ring-[#1a1a1a]/10 transition-all font-medium uppercase"
            />
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-bold text-[#1a1a1a] mb-2">Secondary Color</label>
          <div className="flex gap-3">
            <input
              type="color"
              name="secondaryColor"
              value={formData.secondaryColor || '#1e293b'}
              onChange={handleChange}
              className="h-12 w-12 rounded-lg cursor-pointer shrink-0 border-0 p-0"
            />
            <input
              type="text"
              name="secondaryColor"
              value={formData.secondaryColor}
              onChange={handleChange}
              placeholder="#1e293b"
              className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-white focus:bg-[#fafbfc] focus:border-[#1a1a1a] text-[#1a1a1a] text-[15px] focus:outline-none focus:ring-4 focus:ring-[#1a1a1a]/10 transition-all font-medium uppercase"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[13px] font-bold text-[#1a1a1a] mb-2">Logo URL</label>
          <input
            type="url"
            name="logoUrl"
            value={formData.logoUrl}
            onChange={handleChange}
            placeholder="https://cdn.../logo.svg"
            className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-white focus:bg-[#fafbfc] focus:border-[#1a1a1a] text-[#1a1a1a] text-[15px] focus:outline-none focus:ring-4 focus:ring-[#1a1a1a]/10 transition-all placeholder:text-gray-400 font-medium"
          />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-[#1a1a1a] mb-2">Font Family</label>
          <input
            type="text"
            name="fontFamily"
            value={formData.fontFamily}
            onChange={handleChange}
            placeholder="Inter, sans-serif"
            className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-white focus:bg-[#fafbfc] focus:border-[#1a1a1a] text-[#1a1a1a] text-[15px] focus:outline-none focus:ring-4 focus:ring-[#1a1a1a]/10 transition-all placeholder:text-gray-400 font-medium"
          />
        </div>
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#1a1a1a] mb-2">Tone of Voice</label>
        <textarea
          name="toneOfVoice"
          value={formData.toneOfVoice}
          onChange={handleChange}
          placeholder="e.g., Professional, optimistic, data-driven..."
          className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-white focus:bg-[#fafbfc] focus:border-[#1a1a1a] text-[#1a1a1a] text-[15px] focus:outline-none focus:ring-4 focus:ring-[#1a1a1a]/10 transition-all placeholder:text-gray-400 font-medium h-24 resize-none"
        />
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#1a1a1a] mb-2">Banned Words (Comma Separated)</label>
        <input
          type="text"
          name="bannedWords"
          value={formData.bannedWords}
          onChange={handleChange}
          placeholder="cheap, unbelievable"
          className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-white focus:bg-[#fafbfc] focus:border-[#1a1a1a] text-[#1a1a1a] text-[15px] focus:outline-none focus:ring-4 focus:ring-[#1a1a1a]/10 transition-all placeholder:text-gray-400 font-medium"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-[#1a1a1a] text-white px-8 py-4 rounded-xl font-bold hover:bg-black disabled:bg-gray-400 transition-all w-full md:w-auto shadow-md hover:shadow-lg text-[15px] mt-4"
      >
        {loading ? 'Saving Guidelines...' : 'Save Guidelines'}
      </button>
    </form>
  );
}
