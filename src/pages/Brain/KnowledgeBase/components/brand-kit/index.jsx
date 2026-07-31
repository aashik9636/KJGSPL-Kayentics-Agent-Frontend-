import React from 'react';
import { useBrandKitState } from './useBrandKitState';
import { BrandKitHeader } from './components/BrandKitHeader';
import { BrandKitTabs } from './components/BrandKitTabs';
import { LogosTab } from './components/LogosTab';
import { ColorPaletteTab } from './components/ColorPaletteTab';
import { TypographyTab } from './components/TypographyTab';
import { VoicePersonaTab } from './components/VoicePersonaTab';
import { RulesTab } from './components/RulesTab';
import { AiEnforcementFooter } from './components/AiEnforcementFooter';

export const BrandKitEditor = () => {
  const {
    loading,
    saving,
    resetting,
    activeTab,
    setActiveTab,
    uploadingState,
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
    writingStyle,
    setWritingStyle,
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
  } = useBrandKitState();

  if (loading) {
    return (
      <div className="p-16 text-center text-neutral-400 flex flex-col items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#6c48ff] mb-4"></div>
        <p className="text-sm font-medium">Loading Brand Guidelines...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 font-sans">
      {/* Header Banner */}
      <BrandKitHeader
        saving={saving}
        resetting={resetting}
        onReset={handleReset}
        onSave={handleSave}
      />

      {/* Navigation Tabs */}
      <BrandKitTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* TAB 1: LOGOS & VISUAL IDENTITY */}
      {activeTab === 'identity' && (
        <LogosTab
          logo={logo}
          setLogo={setLogo}
          logoVariations={logoVariations}
          setLogoVariations={setLogoVariations}
          uploadingState={uploadingState}
          onFileUpload={handleFileUpload}
        />
      )}

      {/* TAB 2: COLOR PALETTES */}
      {activeTab === 'colors' && (
        <ColorPaletteTab
          primaryColors={primaryColors}
          setPrimaryColors={setPrimaryColors}
          secondaryColors={secondaryColors}
          setSecondaryColors={setSecondaryColors}
          accentColors={accentColors}
          setAccentColors={setAccentColors}
          onAddColor={addColor}
          onRemoveColor={removeColor}
        />
      )}

      {/* TAB 3: TYPOGRAPHY */}
      {activeTab === 'typography' && (
        <TypographyTab
          typography={typography}
          setTypography={setTypography}
        />
      )}

      {/* TAB 4: VOICE & PERSONA */}
      {activeTab === 'voice' && (
        <VoicePersonaTab
          writingStyle={writingStyle}
          setWritingStyle={setWritingStyle}
          approvedTerminology={approvedTerminology}
          setApprovedTerminology={setApprovedTerminology}
          restrictedTerminology={restrictedTerminology}
          setRestrictedTerminology={setRestrictedTerminology}
          onAddTag={addTag}
          onRemoveTag={removeTag}
        />
      )}

      {/* TAB 5: DO'S & DON'TS RULES */}
      {activeTab === 'rules' && (
        <RulesTab
          brandDos={brandDos}
          setBrandDos={setBrandDos}
          brandDonts={brandDonts}
          setBrandDonts={setBrandDonts}
          onAddRule={addRule}
          onRemoveRule={removeRule}
        />
      )}

      {/* AI Context Card Footer */}
      <AiEnforcementFooter
        saving={saving}
        onSave={handleSave}
      />
    </form>
  );
};

export default BrandKitEditor;
