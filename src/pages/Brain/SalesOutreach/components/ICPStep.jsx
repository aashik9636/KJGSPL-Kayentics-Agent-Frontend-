import React, { useState } from 'react';
import { Users, MapPin, Building2, Briefcase, Plus, Target, CheckCircle2 } from 'lucide-react';
import { salesOutreachService } from '../../../../services/salesOutreachService';

export default function ICPStep({ product, onComplete, onBack }) {
  const [formData, setFormData] = useState({
    name: `${product?.name || 'Product'} - Core ICP`,
    targetRegions: [],
    targetIndustries: [],
    minCompanySize: 50,
    maxCompanySize: 500,
    targetTitles: []
  });
  
  const [regionInput, setRegionInput] = useState('');
  const [industryInput, setIndustryInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = (field, value, setInput) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData({ ...formData, [field]: [...formData[field], value.trim()] });
    }
    setInput('');
  };

  const handleRemove = (field, val) => {
    setFormData({ ...formData, [field]: formData[field].filter(item => item !== val) });
  };

  const handleKeyDown = (e, field, value, setInput) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd(field, value, setInput);
    }
  };

  const handleSubmit = async () => {
    if (formData.targetRegions.length === 0 || formData.targetIndustries.length === 0) return;
    try {
      setSubmitting(true);
      const icp = await salesOutreachService.createICP({
        product_id: product?.id,
        name: formData.name,
        target_regions: formData.targetRegions,
        target_industries: formData.targetIndustries,
        min_company_size: formData.minCompanySize,
        max_company_size: formData.maxCompanySize,
        target_titles: formData.targetTitles
      });
      onComplete(icp);
    } catch (err) {
      console.error(err);
      // Dummy flow if API fails
      onComplete({ id: 'icp-dummy', ...formData });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in relative z-10 w-full max-w-4xl mx-auto py-4">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white mb-2 flex items-center gap-2 tracking-tight">
          <Target className="w-6 h-6 text-[#6c48ff]" /> Define Ideal Customer Profile (ICP)
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Who are we targeting for <span className="font-bold text-neutral-700 dark:text-neutral-300">{product?.name}</span>? The crawler will use these parameters to discover qualified leads.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 flex-1">
        {/* Left Col */}
        <div className="space-y-6">
          <div className="bg-neutral-50 dark:bg-[#151515] p-5 rounded-2xl border border-neutral-200 dark:border-[#262626]">
            <label className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white mb-3">
              <MapPin className="w-4 h-4 text-emerald-500" /> Target Regions
            </label>
            <div className="flex gap-2 mb-3">
              <input type="text" value={regionInput} onChange={e => setRegionInput(e.target.value)} onKeyDown={e => handleKeyDown(e, 'targetRegions', regionInput, setRegionInput)} placeholder="e.g. North America, UK..." className="flex-1 px-3 py-2 text-sm bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333333] rounded-xl outline-none focus:border-[#6c48ff] text-neutral-900 dark:text-white" />
              <button onClick={() => handleAdd('targetRegions', regionInput, setRegionInput)} className="px-3 py-2 bg-neutral-200 dark:bg-[#262626] rounded-xl hover:bg-neutral-300 dark:hover:bg-[#333333]"><Plus className="w-4 h-4 text-neutral-700 dark:text-neutral-300" /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.targetRegions.map(r => (
                <span key={r} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-1">
                  {r} <button onClick={() => handleRemove('targetRegions', r)} className="hover:text-emerald-900 dark:hover:text-emerald-300">&times;</button>
                </span>
              ))}
            </div>
          </div>

          <div className="bg-neutral-50 dark:bg-[#151515] p-5 rounded-2xl border border-neutral-200 dark:border-[#262626]">
            <label className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white mb-3">
              <Building2 className="w-4 h-4 text-blue-500" /> Target Industries
            </label>
            <div className="flex gap-2 mb-3">
              <input type="text" value={industryInput} onChange={e => setIndustryInput(e.target.value)} onKeyDown={e => handleKeyDown(e, 'targetIndustries', industryInput, setIndustryInput)} placeholder="e.g. SaaS, Healthcare..." className="flex-1 px-3 py-2 text-sm bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333333] rounded-xl outline-none focus:border-[#6c48ff] text-neutral-900 dark:text-white" />
              <button onClick={() => handleAdd('targetIndustries', industryInput, setIndustryInput)} className="px-3 py-2 bg-neutral-200 dark:bg-[#262626] rounded-xl hover:bg-neutral-300 dark:hover:bg-[#333333]"><Plus className="w-4 h-4 text-neutral-700 dark:text-neutral-300" /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.targetIndustries.map(i => (
                <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-lg flex items-center gap-1">
                  {i} <button onClick={() => handleRemove('targetIndustries', i)} className="hover:text-blue-900 dark:hover:text-blue-300">&times;</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="space-y-6">
          <div className="bg-neutral-50 dark:bg-[#151515] p-5 rounded-2xl border border-neutral-200 dark:border-[#262626]">
            <label className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white mb-3">
              <Briefcase className="w-4 h-4 text-purple-500" /> Job Titles (Decision Makers)
            </label>
            <div className="flex gap-2 mb-3">
              <input type="text" value={titleInput} onChange={e => setTitleInput(e.target.value)} onKeyDown={e => handleKeyDown(e, 'targetTitles', titleInput, setTitleInput)} placeholder="e.g. CTO, VP of Engineering..." className="flex-1 px-3 py-2 text-sm bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333333] rounded-xl outline-none focus:border-[#6c48ff] text-neutral-900 dark:text-white" />
              <button onClick={() => handleAdd('targetTitles', titleInput, setTitleInput)} className="px-3 py-2 bg-neutral-200 dark:bg-[#262626] rounded-xl hover:bg-neutral-300 dark:hover:bg-[#333333]"><Plus className="w-4 h-4 text-neutral-700 dark:text-neutral-300" /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.targetTitles.map(t => (
                <span key={t} className="px-3 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs font-bold rounded-lg flex items-center gap-1">
                  {t} <button onClick={() => handleRemove('targetTitles', t)} className="hover:text-purple-900 dark:hover:text-purple-300">&times;</button>
                </span>
              ))}
            </div>
          </div>

          <div className="bg-neutral-50 dark:bg-[#151515] p-5 rounded-2xl border border-neutral-200 dark:border-[#262626]">
            <label className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white mb-3">
              <Users className="w-4 h-4 text-amber-500" /> Company Size
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-xs text-neutral-500 mb-1">Min Employees</p>
                <input type="number" value={formData.minCompanySize} onChange={e => setFormData({...formData, minCompanySize: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 text-sm bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333333] rounded-xl outline-none focus:border-[#6c48ff] text-neutral-900 dark:text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-neutral-500 mb-1">Max Employees</p>
                <input type="number" value={formData.maxCompanySize} onChange={e => setFormData({...formData, maxCompanySize: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 text-sm bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333333] rounded-xl outline-none focus:border-[#6c48ff] text-neutral-900 dark:text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center shrink-0 border-t border-neutral-100 dark:border-[#262626] pt-6">
        <button onClick={onBack} className="px-6 py-2.5 rounded-xl text-neutral-600 dark:text-neutral-400 font-bold hover:bg-neutral-100 dark:hover:bg-[#1a1a1a] transition-colors">
          Go Back
        </button>
        <button 
          onClick={handleSubmit}
          disabled={submitting || formData.targetRegions.length === 0 || formData.targetIndustries.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#6c48ff] hover:bg-[#5b3adb] text-white font-bold shadow-md shadow-[#6c48ff]/20 transition-all disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Save & Continue'} <CheckCircle2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
