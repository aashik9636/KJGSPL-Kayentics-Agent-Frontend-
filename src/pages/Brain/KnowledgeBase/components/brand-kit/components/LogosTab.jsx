import React from 'react';
import { Image as ImageIcon, UploadCloud } from 'lucide-react';

const VARIATIONS = [
  { key: 'dark', label: 'Dark Mode Logo', bgClass: 'bg-gray-900', textClass: 'text-gray-500' },
  { key: 'light', label: 'Light Mode Logo', bgClass: 'bg-gray-50 border border-gray-100', textClass: 'text-gray-400' },
  { key: 'mono', label: 'Monochrome', bgClass: 'bg-gray-50 border border-gray-100', textClass: 'text-gray-400' },
  { key: 'iconOnly', label: 'Icon Only', bgClass: 'bg-gray-50 border border-gray-100', textClass: 'text-gray-400' },
];

export const LogosTab = ({ logo, setLogo, logoVariations, setLogoVariations, uploadingState, onFileUpload }) => {
  return (
    <div className="space-y-6">
      {/* Primary Logo */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
          <ImageIcon className="w-5 h-5 text-[#6c48ff]" /> Primary Brand Logo
        </h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden relative shrink-0">
            {logo ? (
              <img src={logo} alt="Primary Logo" className="w-full h-full object-contain p-2" />
            ) : (
              <ImageIcon className="w-10 h-10 text-gray-300" />
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
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl text-xs transition"
                >
                  Remove Logo
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400">Upload your official brand logo (PNG, SVG, WEBP, or JPG format).</p>
          </div>
        </div>
      </div>

      {/* Logo Variations - Clean White Cards */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Logo Variations</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VARIATIONS.map((v) => {
            const currentUrl = logoVariations[v.key];
            return (
              <div key={v.key} className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700">{v.label}</span>
                  <label className="cursor-pointer text-[#6c48ff] hover:text-[#5b3af0] text-xs font-bold inline-flex items-center gap-1">
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
                    className="w-full text-center text-xs text-rose-600 font-semibold hover:underline"
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
