import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { brandService } from '../../../../services/brandService';
import { KnowledgeService } from '../../../../services/knowledgeService';
import { 
  Palette, Image as ImageIcon, Type, Sparkles, Volume2, ShieldAlert, 
  Hash, Save, UploadCloud, CheckCircle2, Bot
} from 'lucide-react';

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (Modern & Clean)' },
  { value: 'Roboto', label: 'Roboto (Tech & Universal)' },
  { value: 'Outfit', label: 'Outfit (Trendy & Premium)' },
  { value: 'Playfair Display', label: 'Playfair Display (Editorial & Luxury)' },
  { value: 'Montserrat', label: 'Montserrat (Bold & Geometric)' },
  { value: 'Open Sans', label: 'Open Sans (Friendly & Legible)' }
];

export const BrandKitEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Form State
  const [brandName, setBrandName] = useState('');
  const [tagline, setTagline] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6C48FF');
  const [secondaryColor, setSecondaryColor] = useState('#111827');
  const [accentColor, setAccentColor] = useState('#EC4899');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [brandVoice, setBrandVoice] = useState('Professional, Authoritative, Innovative');
  const [brandTone, setBrandTone] = useState('Empathetic, Engaging, Clear');
  const [writingStyle, setWritingStyle] = useState('Concise, value-driven with strong call to actions');
  const [targetAudience, setTargetAudience] = useState('B2B Decision Makers, Growth Marketers, Startup Founders');
  const [preferredHashtags, setPreferredHashtags] = useState('#Kaynetics #AIAgents #SaaS #Growth');
  const [prohibitedKeywords, setProhibitedKeywords] = useState('cheap, guaranteed, spam, fake, discount');
  const [missionStatement, setMissionStatement] = useState('');
  const [brandPromise, setBrandPromise] = useState('');

  useEffect(() => {
    loadBrandKit();
  }, []);

  const loadBrandKit = async () => {
    setLoading(true);
    try {
      const data = await brandService.getBrandProfile();
      if (data) {
        if (data.brandName) setBrandName(data.brandName);
        if (data.tagline) setTagline(data.tagline);
        if (data.logoUrl) setLogoUrl(data.logoUrl);
        if (data.primaryColor) setPrimaryColor(data.primaryColor);
        if (data.secondaryColor) setSecondaryColor(data.secondaryColor);
        if (data.accentColor) setAccentColor(data.accentColor);
        if (data.fontFamily) setFontFamily(data.fontFamily);
        if (data.brandVoice) setBrandVoice(data.brandVoice);
        if (data.brandTone) setBrandTone(data.brandTone);
        if (data.writingStyle) setWritingStyle(data.writingStyle);
        if (data.targetAudience) setTargetAudience(data.targetAudience);
        if (data.preferredHashtags) setPreferredHashtags(data.preferredHashtags);
        if (data.prohibitedKeywords) setProhibitedKeywords(data.prohibitedKeywords);
        if (data.missionStatement) setMissionStatement(data.missionStatement);
        if (data.brandPromise) setBrandPromise(data.brandPromise);
      }
    } catch (err) {
      console.error('Failed to load Brand Kit:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const res = await KnowledgeService.uploadFile(file);
      const uploadedUrl = res.fileUrl || res.url || res.path || (res.data && res.data.url);
      if (uploadedUrl) {
        setLogoUrl(uploadedUrl);
        toast.success('Brand logo uploaded successfully!');
      } else {
        toast.error('Uploaded but failed to extract file URL.');
      }
    } catch (err) {
      console.error('Logo upload error:', err);
      toast.error('Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!brandName.trim()) {
      return toast.error('Please enter your Brand Name');
    }

    setSaving(true);
    try {
      const payload = {
        brandName,
        tagline,
        logoUrl,
        primaryColor,
        secondaryColor,
        accentColor,
        fontFamily,
        brandVoice,
        brandTone,
        writingStyle,
        targetAudience,
        preferredHashtags,
        prohibitedKeywords,
        missionStatement,
        brandPromise,
      };

      await brandService.upsertBrandGuidelines(payload);
      toast.success('Brand Kit saved successfully! Social Media Agent updated.');
    } catch (err) {
      console.error('Failed to save Brand Kit:', err);
      toast.error(err?.response?.data?.message || 'Failed to save Brand Kit.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#6c48ff] mb-4"></div>
        <p className="text-sm font-medium">Loading Brand Kit guidelines...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-pink-500/10 border border-indigo-500/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6c48ff]/10 text-[#6c48ff] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Social Media AI Agent Integration</h4>
            <p className="text-xs text-gray-500">
              The parameters defined here guide your AI Social Media Agent when crafting posts, generating visual banners, and ensuring brand consistency.
            </p>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-[#6c48ff] hover:bg-[#5b3adb] text-white font-bold rounded-xl text-sm transition shadow-lg shadow-[#6c48ff]/20 flex items-center gap-2 whitespace-nowrap self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Kit...' : 'Save Brand Kit'}</span>
        </button>
      </div>

      {/* Grid Section 1: Brand Overview & Visual Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Visual Identity Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <Palette className="w-5 h-5 text-[#6c48ff]" />
            <h3 className="text-base font-bold text-gray-900">Visual Identity & Colors</h3>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Brand Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden relative group flex-shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt="Brand Logo" className="w-full h-full object-contain p-1.5" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#6c48ff] hover:bg-[#5b3adb] text-white font-bold rounded-xl text-xs cursor-pointer transition shadow-sm">
                    <UploadCloud className="w-4 h-4" />
                    <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} className="hidden" />
                  </label>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl text-xs transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">
                  PNG, SVG or JPG (Recommended: 512x512px transparent background)
                </p>
              </div>
            </div>
          </div>

          {/* Color Palettes */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1.5">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1.5">Secondary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1.5">Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Typography */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-[#6c48ff]" /> Brand Typography / Font Family
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#6c48ff]"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* Live Preview Chips */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <h5 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Color Preview</h5>
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-2 rounded-xl text-white text-xs font-bold shadow-sm" style={{ backgroundColor: primaryColor }}>
                Primary Button
              </div>
              <div className="px-3.5 py-2 rounded-xl text-white text-xs font-bold shadow-sm" style={{ backgroundColor: secondaryColor }}>
                Dark Badge
              </div>
              <div className="px-3.5 py-2 rounded-xl text-white text-xs font-bold shadow-sm" style={{ backgroundColor: accentColor }}>
                Highlight Accent
              </div>
            </div>
          </div>

        </div>

        {/* Brand Voice & Personality */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <Volume2 className="w-5 h-5 text-[#6c48ff]" />
            <h3 className="text-base font-bold text-gray-900">Brand Voice & Persona</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Brand Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Kaynetics AI"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#6c48ff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Tagline / Slogan
            </label>
            <input
              type="text"
              placeholder="e.g. Autonomous AI Workflows for Modern Teams"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#6c48ff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Tone of Voice (Attributes)
            </label>
            <input
              type="text"
              placeholder="e.g. Professional, Authoritative, Witty, High-Energy"
              value={brandVoice}
              onChange={(e) => setBrandVoice(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#6c48ff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Writing Style Guidelines
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Keep copy short and punchy. Use bullet points for features. Avoid passive voice."
              value={writingStyle}
              onChange={(e) => setWritingStyle(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#6c48ff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Prohibited Words / Topics
            </label>
            <input
              type="text"
              placeholder="e.g. cheap, guaranteed, 100% free, spam, fake"
              value={prohibitedKeywords}
              onChange={(e) => setProhibitedKeywords(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#6c48ff]"
            />
          </div>
        </div>

      </div>

      {/* Grid Section 2: Social Media Guidelines & AI Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Social Media Guidelines */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <Hash className="w-5 h-5 text-[#6c48ff]" />
            <h3 className="text-base font-bold text-gray-900">Social Media & Hashtag Guidelines</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Target Audience
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Tech Founders, Social Media Managers, Agency Owners"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#6c48ff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Preferred Hashtags
            </label>
            <input
              type="text"
              placeholder="#Kaynetics #AIAgents #SocialMediaMarketing"
              value={preferredHashtags}
              onChange={(e) => setPreferredHashtags(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#6c48ff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Mission Statement
            </label>
            <textarea
              rows={2}
              placeholder="Our mission is to streamline automated social presence for growing businesses..."
              value={missionStatement}
              onChange={(e) => setMissionStatement(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#6c48ff]"
            />
          </div>
        </div>

        {/* AI Social Media Agent Live Preview */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 translate-x-6 -translate-y-6 w-32 h-32 bg-[#6c48ff]/20 rounded-full blur-2xl pointer-events-none"></div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-[#6c48ff]" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">Social Media Agent Context</h4>
            </div>

            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              When the Social Media Agent generates posts or design assets, it automatically injects your Brand Kit parameters into its context prompt:
            </p>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 font-mono text-[11px] text-indigo-300 space-y-2">
              <div><span className="text-slate-500">// System Prompt Injection</span></div>
              <div><span className="text-purple-400">Brand Name:</span> {brandName || 'Not Set'}</div>
              <div><span className="text-purple-400">Voice/Tone:</span> {brandVoice || 'Standard'}</div>
              <div><span className="text-purple-400">Primary Color:</span> <span style={{ color: primaryColor }}>{primaryColor}</span></div>
              <div><span className="text-purple-400">Font:</span> {fontFamily}</div>
              <div><span className="text-purple-400">Hashtags:</span> {preferredHashtags || '#None'}</div>
              <div><span className="text-purple-400">Prohibited:</span> {prohibitedKeywords || 'None'}</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Active RAG Integration
            </span>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#6c48ff] hover:bg-[#5b3adb] text-white font-bold rounded-xl text-xs transition shadow-lg shadow-[#6c48ff]/30"
            >
              {saving ? 'Saving...' : 'Save & Update Agent'}
            </button>
          </div>
        </div>

      </div>
    </form>
  );
};
