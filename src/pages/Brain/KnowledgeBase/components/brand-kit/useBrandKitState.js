import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { brandService } from '../../../../../services/brandService';
import { KnowledgeService } from '../../../../../services/knowledgeService';
import {
  HEX_REGEX,
  DEFAULT_PRIMARY_COLORS,
  DEFAULT_SECONDARY_COLORS,
  DEFAULT_ACCENT_COLORS,
  DEFAULT_APPROVED_TERMINOLOGY,
  DEFAULT_RESTRICTED_TERMINOLOGY,
  DEFAULT_BRAND_DOS,
  DEFAULT_BRAND_DONTS
} from './constants';

export function useBrandKitState() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [activeTab, setActiveTab] = useState('identity');

  // Upload loading states
  const [uploadingState, setUploadingState] = useState({});

  // 1. Logos & Visual Identity
  const [brandName, setBrandName] = useState('');
  const [tagline, setTagline] = useState('');
  const [logo, setLogo] = useState('');
  const [logoVariations, setLogoVariations] = useState({
    dark: '',
    light: '',
    mono: '',
    iconOnly: ''
  });

  // 2. Color Palettes
  const [primaryColors, setPrimaryColors] = useState(DEFAULT_PRIMARY_COLORS);
  const [secondaryColors, setSecondaryColors] = useState(DEFAULT_SECONDARY_COLORS);
  const [accentColors, setAccentColors] = useState(DEFAULT_ACCENT_COLORS);

  // 3. Typography
  const [typography, setTypography] = useState({
    headings: 'Inter Display',
    body: 'Inter',
    fallback: 'sans-serif'
  });
  const [fonts, setFonts] = useState(['Inter', 'Inter Display']);

  // 4. Voice & Persona
  const [writingStyle, setWritingStyle] = useState('Professional, energetic, customer-obsessed, concise, empathetic.');
  const [brandVoice, setBrandVoice] = useState('Professional, Authoritative, Innovative');
  const [brandTone, setBrandTone] = useState('Empathetic, Engaging, Clear');
  const [targetAudience, setTargetAudience] = useState('B2B Decision Makers, Growth Marketers, Startup Founders');

  // 5. Terminology Tags
  const [approvedTerminology, setApprovedTerminology] = useState(DEFAULT_APPROVED_TERMINOLOGY);
  const [restrictedTerminology, setRestrictedTerminology] = useState(DEFAULT_RESTRICTED_TERMINOLOGY);

  // 6. Do's & Don'ts
  const [brandDos, setBrandDos] = useState(DEFAULT_BRAND_DOS);
  const [brandDonts, setBrandDonts] = useState(DEFAULT_BRAND_DONTS);

  // Load Brand Guidelines
  const loadBrandKit = useCallback(async () => {
    setLoading(true);
    try {
      const data = await brandService.getBrandGuidelines();
      if (data) {
        if (data.brandName) setBrandName(data.brandName);
        if (data.tagline) setTagline(data.tagline);
        if (data.logo) setLogo(data.logo);

        if (data.logoVariations) {
          setLogoVariations({
            dark: data.logoVariations.dark || '',
            light: data.logoVariations.light || '',
            mono: data.logoVariations.mono || '',
            iconOnly: data.logoVariations.iconOnly || ''
          });
        }

        if (Array.isArray(data.primaryColors) && data.primaryColors.length > 0) setPrimaryColors(data.primaryColors);
        if (Array.isArray(data.secondaryColors) && data.secondaryColors.length > 0) setSecondaryColors(data.secondaryColors);
        if (Array.isArray(data.accentColors) && data.accentColors.length > 0) setAccentColors(data.accentColors);

        if (data.typography) {
          setTypography({
            headings: data.typography.headings || 'Inter Display',
            body: data.typography.body || 'Inter',
            fallback: data.typography.fallback || 'sans-serif'
          });
        }
        if (Array.isArray(data.fonts) && data.fonts.length > 0) setFonts(data.fonts);

        if (data.writingStyle) setWritingStyle(data.writingStyle);
        if (data.brandVoice) setBrandVoice(data.brandVoice);
        if (data.brandTone) setBrandTone(data.brandTone);
        if (data.targetAudience) setTargetAudience(data.targetAudience);

        if (Array.isArray(data.approvedTerminology)) setApprovedTerminology(data.approvedTerminology);
        if (Array.isArray(data.restrictedTerminology)) setRestrictedTerminology(data.restrictedTerminology);

        if (Array.isArray(data.brandDos)) setBrandDos(data.brandDos);
        if (Array.isArray(data.brandDonts)) setBrandDonts(data.brandDonts);
      }
    } catch (err) {
      console.error('Failed to load Brand Kit:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBrandKit();
  }, [loadBrandKit]);

  // Upload Logo handler
  const handleFileUpload = async (e, targetKey) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingState(prev => ({ ...prev, [targetKey]: true }));
    try {
      const res = await KnowledgeService.uploadFile(file);
      const uploadedUrl =
        res?.publicUrl ||
        res?.url ||
        res?.fileUrl ||
        res?.path ||
        res?.data?.publicUrl ||
        res?.data?.url ||
        res?.data?.fileUrl;

      if (uploadedUrl) {
        if (targetKey === 'logo') {
          setLogo(uploadedUrl);
        } else {
          setLogoVariations(prev => ({ ...prev, [targetKey]: uploadedUrl }));
        }
        toast.success(`Brand logo uploaded successfully!`);
      } else {
        toast.error('Uploaded but failed to extract file URL.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload file.');
    } finally {
      setUploadingState(prev => ({ ...prev, [targetKey]: false }));
    }
  };

  // Color helpers
  const addColor = (hex, setList) => {
    if (!HEX_REGEX.test(hex)) {
      return toast.error('Invalid HEX color code (must be e.g. #0052FF)');
    }
    setList(prev => [...new Set([...prev, hex.toUpperCase()])]);
  };

  const removeColor = (hex, setList) => {
    setList(prev => prev.filter(c => c !== hex));
  };

  // Tag helpers
  const addTag = (tag, setList, setInput) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (trimmed.length > 100) return toast.error('Tag exceeds 100 characters max limit.');
    setList(prev => [...new Set([...prev, trimmed])]);
    setInput('');
  };

  const removeTag = (tag, setList) => {
    setList(prev => prev.filter(t => t !== tag));
  };

  // Rule helpers
  const addRule = (rule, setList, setInput) => {
    const trimmed = rule.trim();
    if (!trimmed) return;
    if (trimmed.length > 200) return toast.error('Rule text exceeds 200 characters max limit.');
    setList(prev => [...prev, trimmed]);
    setInput('');
  };

  const removeRule = (index, setList) => {
    setList(prev => prev.filter((_, i) => i !== index));
  };

  // Save handler
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (writingStyle && writingStyle.length > 2000) {
      return toast.error('Writing style exceeds maximum allowed 2,000 characters.');
    }

    setSaving(true);
    try {
      const payload = {
        logo,
        logoVariations,
        primaryColors,
        secondaryColors,
        accentColors,
        typography,
        fonts: [typography.headings, typography.body].filter(Boolean),
        writingStyle,
        approvedTerminology,
        restrictedTerminology,
        brandDos,
        brandDonts,
        brandAssets: [],
        icons: [],
        templates: []
      };

      await brandService.upsertBrandGuidelines(payload);
      toast.success('Brand Kit configured successfully! AI Agents updated.');
    } catch (err) {
      console.error('Failed to save Brand Kit:', err);
      toast.error(err?.response?.data?.message || 'Failed to save Brand Kit guidelines.');
    } finally {
      setSaving(false);
    }
  };

  // Reset handler
  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all Brand Guidelines to default? This action cannot be undone.')) {
      return;
    }

    setResetting(true);
    try {
      await brandService.resetBrandGuidelines();
      toast.success('Brand Guidelines reset successfully.');
      setLogo('');
      setLogoVariations({ dark: '', light: '', mono: '', iconOnly: '' });
      setPrimaryColors(['#6C48FF']);
      setSecondaryColors(['#111827']);
      setAccentColors(['#EC4899']);
      setWritingStyle('');
      setApprovedTerminology([]);
      setRestrictedTerminology([]);
      setBrandDos([]);
      setBrandDonts([]);
      loadBrandKit();
    } catch (err) {
      toast.error('Failed to reset Brand Guidelines.');
    } finally {
      setResetting(false);
    }
  };

  return {
    loading,
    saving,
    resetting,
    activeTab,
    setActiveTab,
    uploadingState,
    brandName,
    setBrandName,
    tagline,
    setTagline,
    logo,
    setLogo,
    logoVariations,
    setLogoVariations,
    primaryColors,
    setPrimaryColors,
    secondaryColors,
    setSecondaryColors,
    accentColors,
    setAccentColors,
    typography,
    setTypography,
    fonts,
    setFonts,
    writingStyle,
    setWritingStyle,
    brandVoice,
    setBrandVoice,
    brandTone,
    setBrandTone,
    targetAudience,
    setTargetAudience,
    approvedTerminology,
    setApprovedTerminology,
    restrictedTerminology,
    setRestrictedTerminology,
    brandDos,
    setBrandDos,
    brandDonts,
    setBrandDonts,
    handleFileUpload,
    addColor,
    removeColor,
    addTag,
    removeTag,
    addRule,
    removeRule,
    handleSave,
    handleReset
  };
}
