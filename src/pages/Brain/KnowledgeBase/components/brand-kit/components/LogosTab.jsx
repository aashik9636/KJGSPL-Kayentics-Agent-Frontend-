import React from 'react';
import { Image as ImageIcon, UploadCloud } from 'lucide-react';

const VARIATIONS = [
  { key: 'dark', label: 'Dark Mode Logo', bgClass: 'bg-neutral-900', textClass: 'text-neutral-500' },
  { key: 'light', label: 'Light Mode Logo', bgClass: 'bg-neutral-50 dark:bg-[#12141D] border border-neutral-100 dark:border-[#333333]', textClass: 'text-neutral-400 dark:text-neutral-500' },
  { key: 'mono', label: 'Monochrome', bgClass: 'bg-neutral-50 dark:bg-[#12141D] border border-neutral-100 dark:border-[#333333]', textClass: 'text-neutral-400 dark:text-neutral-500' },
  { key: 'iconOnly', label: 'Icon Only', bgClass: 'bg-neutral-50 dark:bg-[#12141D] border border-neutral-100 dark:border-[#333333]', textClass: 'text-neutral-400 dark:text-neutral-500' },
];

export const LogosTab = ({ logo, setLogo, logoVariations, setLogoVariations, uploadingState, onFileUpload }) => {
  return (
    <div className="space-y-6">
      {/* Primary Logo */}
      <div className="bg-white dark:bg-[#171717] border border-neutral-200/90 dark:border-[#333333] rounded-2xl p-6 shadow-sm space-y-6 transition-colors">
        <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 border-b border-neutral-100 dark:border-[#333333] pb-3">
          <ImageIcon className="w-5 h-5 text-[#6c48ff]" /> Primary Brand Logo
        </h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-[#333333] bg-neutral-50 dark:bg-[#12141D] flex items-center justify-center overflow-hidden relative shrink-0 transition-colors">
            {logo ? (
              <img src={logo} alt="Primary Logo" className="w-full h-full object-contain p-2" />
            ) : (
              <ImageIcon className="w-10 h-10 text-neutral-300" />
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6c48ff] hover:bg-[#5b3af0] text-white font-bold rounded-xl text-xs cursor-pointer transition shadow-sm">
                <UploadCloud className="w-4 h-4" />
                <span>{uploadingState.logo ? 'Uploading Logo...' : 'Upload Primary Logo'}</span>
                <input type="file" accept="image/*" onChange={(e) => onFileUpload(e, 'logo')} disabled={uploadingState.logo} className="hidden" />
              </label>
              {logo && (
                <button
                  type="button"
                  onClick={() => setLogo('')}
                  className="px-4 py-2.5 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-bold rounded-xl text-xs transition"
                >
                  Remove Logo
                </button>
              )}
            </div>
            <p className="text-xs text-neutral-400">Upload your official brand logo (PNG, SVG, WEBP, or JPG format).</p>
          </div>
        </div>
      </div>

      {/* Logo Variations - Clean White Cards */}
      <div className="bg-white dark:bg-[#171717] border border-neutral-200/90 dark:border-[#333333] rounded-2xl p-6 shadow-sm space-y-6 transition-colors">
        <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-[#333333] pb-3">Logo Variations</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VARIATIONS.map((v) => {
            const currentUrl = logoVariations[v.key];
            return (
              <div key={v.key} className="p-4 bg-white dark:bg-[#171717] rounded-2xl border border-neutral-200 dark:border-[#333333] space-y-3 shadow-xs transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">{v.label}</span>
                  <label className="cursor-pointer text-[#6c48ff] dark:text-purple-400 hover:text-[#5b3af0] dark:hover:text-purple-300 text-xs font-bold inline-flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5" />
                    Upload
                    <input type="file" accept="image/*" onChange={(e) => onFileUpload(e, v.key)} className="hidden" />
                  </label>
                </div>
                <div className={`h-24 rounded-xl flex items-center justify-center overflow-hidden p-2 ${v.bgClass}`}>
                  {currentUrl ? (
                    <img src={currentUrl} alt={v.label} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className={`text-[11px] ${v.textClass}`}>No {v.label.toLowerCase()}</span>
                  )}
                </div>
                {currentUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoVariations(prev => ({ ...prev, [v.key]: '' }))}
                    className="w-full text-center text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
