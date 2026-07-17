import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { businessService } from '../../../services/businessService';

export default function BusinessProfileTab() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    legalName: '',
    industry: '',
    description: '',
    website: '',
    competitors: '',
    targetAudience: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await businessService.getBusinessProfile();
        if (response?.data) {
          setFormData({
            ...response.data,
            competitors: response.data.competitors?.join(', ') || ''
          });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        competitors: formData.competitors.split(',').map(c => c.trim()).filter(Boolean)
      };
      await businessService.createOrUpdateBusinessProfile(payload);
      toast.success('Business Profile updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update Business Profile');
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
          <label className="block text-[13px] font-bold text-[#1a1a1a] mb-2">Legal Name</label>
          <input
            type="text"
            name="legalName"
            value={formData.legalName}
            onChange={handleChange}
            placeholder="e.g., Kaynetics Inc"
            className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-white focus:bg-[#fafbfc] focus:border-[#1a1a1a] text-[#1a1a1a] text-[15px] focus:outline-none focus:ring-4 focus:ring-[#1a1a1a]/10 transition-all placeholder:text-gray-400 font-medium"
            required
          />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-[#1a1a1a] mb-2">Website</label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://kaynetics.ai"
            className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-white focus:bg-[#fafbfc] focus:border-[#1a1a1a] text-[#1a1a1a] text-[15px] focus:outline-none focus:ring-4 focus:ring-[#1a1a1a]/10 transition-all placeholder:text-gray-400 font-medium"
          />
        </div>
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#1a1a1a] mb-2">Industry</label>
        <input
          type="text"
          name="industry"
          value={formData.industry}
          onChange={handleChange}
          placeholder="e.g., Marketing Tech & AI"
          className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-white focus:bg-[#fafbfc] focus:border-[#1a1a1a] text-[#1a1a1a] text-[15px] focus:outline-none focus:ring-4 focus:ring-[#1a1a1a]/10 transition-all placeholder:text-gray-400 font-medium"
          required
        />
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#1a1a1a] mb-2">Company Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="What does your company do?"
          className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-white focus:bg-[#fafbfc] focus:border-[#1a1a1a] text-[#1a1a1a] text-[15px] focus:outline-none focus:ring-4 focus:ring-[#1a1a1a]/10 transition-all placeholder:text-gray-400 font-medium h-24 resize-none"
        />
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#1a1a1a] mb-2">Competitors (Comma Separated)</label>
        <input
          type="text"
          name="competitors"
          value={formData.competitors}
          onChange={handleChange}
          placeholder="Jasper.ai, Copy.ai"
          className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-white focus:bg-[#fafbfc] focus:border-[#1a1a1a] text-[#1a1a1a] text-[15px] focus:outline-none focus:ring-4 focus:ring-[#1a1a1a]/10 transition-all placeholder:text-gray-400 font-medium"
        />
      </div>

      <div>
        <label className="block text-[13px] font-bold text-[#1a1a1a] mb-2">Target Audience Context</label>
        <textarea
          name="targetAudience"
          value={formData.targetAudience}
          onChange={handleChange}
          placeholder="General overview of your target audience..."
          className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-white focus:bg-[#fafbfc] focus:border-[#1a1a1a] text-[#1a1a1a] text-[15px] focus:outline-none focus:ring-4 focus:ring-[#1a1a1a]/10 transition-all placeholder:text-gray-400 font-medium h-24 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-[#1a1a1a] text-white px-8 py-4 rounded-xl font-bold hover:bg-black disabled:bg-gray-400 transition-all w-full md:w-auto shadow-md hover:shadow-lg text-[15px] mt-4"
      >
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}
