import React, { useState, useEffect } from 'react';
import { Users, MapPin, Building2, Briefcase, Plus, Target, CheckCircle2, ShieldAlert } from 'lucide-react';
import { salesOutreachService } from '../../../../services/salesOutreachService';

export default function ICPStep({ product, onComplete, onBack }) {
  const [existingIcpId, setExistingIcpId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: `${product?.name || 'Product'} - Target ICP`,
    targetRegions: [],
    targetIndustries: [],
    minCompanySize: 1,
    maxCompanySize: 50,
    targetTitles: [],
    excludedIndustries: []
  });

  const [regionInput, setRegionInput] = useState('');
  const [industryInput, setIndustryInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [excludedIndustryInput, setExcludedIndustryInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchExistingICP = async () => {
      try {
        if (!product?.id) return;
        const icps = await salesOutreachService.getICPs(product.id);
        if (icps && icps.length > 0) {
          const icp = icps[0];
          setExistingIcpId(icp.id);
          setFormData({
            name: icp.name || `${product.name} - Target ICP`,
            targetRegions: icp.target_regions || [],
            targetIndustries: icp.target_industries || [],
            minCompanySize: icp.min_company_size || 1,
            maxCompanySize: icp.max_company_size || 50,
            targetTitles: icp.target_titles || [],
            excludedIndustries: icp.excluded_industries || []
          });
          return;
        }
      } catch (err) {
        console.error('Failed to fetch existing ICP:', err);
      }
      
      // Fallback to product.icpdata or product.icp if no backend ICP found
      const fallbackData = product?.icpdata || product?.icp || {};
      
      const parseList = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
        return [];
      };

      let minSize = 1;
      let maxSize = 50;
      if (fallbackData.min_employees) minSize = parseInt(fallbackData.min_employees, 10);
      else if (fallbackData.min_company_size) minSize = parseInt(fallbackData.min_company_size, 10);
      
      if (fallbackData.max_employees) maxSize = parseInt(fallbackData.max_employees, 10);
      else if (fallbackData.max_company_size) maxSize = parseInt(fallbackData.max_company_size, 10);
      
      if (!fallbackData.min_employees && !fallbackData.max_employees) {
         const compSize = fallbackData.company_size || fallbackData.companySize;
         if (compSize) {
           const parts = String(compSize).split('-');
           if (parts.length === 2) {
             minSize = parseInt(parts[0], 10) || minSize;
             maxSize = parseInt(parts[1], 10) || maxSize;
           }
         }
      }

      setFormData({
        name: fallbackData.name || `${product?.name || 'Product'} - Target ICP`,
        targetRegions: parseList(fallbackData.geography || fallbackData.target_regions || fallbackData.targetRegions),
        targetIndustries: parseList(fallbackData.industry || fallbackData.target_industries || fallbackData.targetIndustries),
        minCompanySize: minSize,
        maxCompanySize: maxSize,
        targetTitles: parseList(fallbackData.buyer_personas || fallbackData.target_titles || fallbackData.targetTitles),
        excludedIndustries: parseList(fallbackData.excluded_industries || fallbackData.excludedIndustries)
      });
      
    };

    fetchExistingICP().finally(() => setLoading(false));
  }, [product]);

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
      const payload = {
        product_id: product?.id,
        name: formData.name,
        target_regions: formData.targetRegions,
        target_industries: formData.targetIndustries,
        min_company_size: formData.minCompanySize,
        max_company_size: formData.maxCompanySize,
        target_titles: formData.targetTitles,
        excluded_industries: formData.excludedIndustries
      };
      
      let icp;
      if (existingIcpId) {
        icp = await salesOutreachService.updateICP(existingIcpId, payload);
      } else {
        icp = await salesOutreachService.createICP(payload);
      }
      onComplete(icp);
    } catch (err) {
      console.error(err);
      // Fallback
      onComplete({ id: existingIcpId || 'fallback-id', ...formData });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full animate-fade-in relative z-10 w-full max-w-4xl mx-auto py-20 items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6c48ff] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-neutral-500 font-medium text-sm">Loading Ideal Customer Profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in relative z-10 w-full max-w-4xl mx-auto py-4">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white mb-2 flex items-center gap-2 tracking-tight">
          <Target className="w-6 h-6 text-[#6c48ff]" /> Define Ideal Customer Profile (ICP)
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Who are we targeting for <span className="font-bold text-neutral-700 dark:text-neutral-300">{product?.name}</span>? Review and refine the criteria below.
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
          
          <div className="bg-neutral-50 dark:bg-[#151515] p-5 rounded-2xl border border-neutral-200 dark:border-[#262626]">
            <label className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white mb-3">
              <ShieldAlert className="w-4 h-4 text-red-500" /> Excluded Industries
            </label>
            <div className="flex gap-2 mb-3">
              <input type="text" value={excludedIndustryInput} onChange={e => setExcludedIndustryInput(e.target.value)} onKeyDown={e => handleKeyDown(e, 'excludedIndustries', excludedIndustryInput, setExcludedIndustryInput)} placeholder="e.g. Manufacturing, Non-profit..." className="flex-1 px-3 py-2 text-sm bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333333] rounded-xl outline-none focus:border-[#6c48ff] text-neutral-900 dark:text-white" />
              <button onClick={() => handleAdd('excludedIndustries', excludedIndustryInput, setExcludedIndustryInput)} className="px-3 py-2 bg-neutral-200 dark:bg-[#262626] rounded-xl hover:bg-neutral-300 dark:hover:bg-[#333333]"><Plus className="w-4 h-4 text-neutral-700 dark:text-neutral-300" /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.excludedIndustries.map(i => (
                <span key={i} className="px-3 py-1 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-bold rounded-lg flex items-center gap-1">
                  {i} <button onClick={() => handleRemove('excludedIndustries', i)} className="hover:text-red-900 dark:hover:text-red-300">&times;</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="space-y-6">
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
          
          <div className="bg-neutral-50 dark:bg-[#151515] p-5 rounded-2xl border border-neutral-200 dark:border-[#262626]">
            <label className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white mb-3">
              <Briefcase className="w-4 h-4 text-indigo-500" /> Target Job Titles
            </label>
            <div className="flex gap-2 mb-3">
              <input type="text" value={titleInput} onChange={e => setTitleInput(e.target.value)} onKeyDown={e => handleKeyDown(e, 'targetTitles', titleInput, setTitleInput)} placeholder="e.g. Founder, VP Sales..." className="flex-1 px-3 py-2 text-sm bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333333] rounded-xl outline-none focus:border-[#6c48ff] text-neutral-900 dark:text-white" />
              <button onClick={() => handleAdd('targetTitles', titleInput, setTitleInput)} className="px-3 py-2 bg-neutral-200 dark:bg-[#262626] rounded-xl hover:bg-neutral-300 dark:hover:bg-[#333333]"><Plus className="w-4 h-4 text-neutral-700 dark:text-neutral-300" /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.targetTitles.map(t => (
                <span key={t} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-lg flex items-center gap-1">
                  {t} <button onClick={() => handleRemove('targetTitles', t)} className="hover:text-indigo-900 dark:hover:text-indigo-300">&times;</button>
                </span>
              ))}
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
