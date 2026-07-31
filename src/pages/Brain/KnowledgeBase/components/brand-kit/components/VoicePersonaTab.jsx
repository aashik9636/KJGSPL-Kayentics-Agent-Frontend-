import React, { useState } from 'react';
import { Volume2, CheckCircle2, Ban, X } from 'lucide-react';

export const VoicePersonaTab = ({
  writingStyle, setWritingStyle,
  approvedTerminology, setApprovedTerminology,
  restrictedTerminology, setRestrictedTerminology,
  onAddTag, onRemoveTag
}) => {
  const [newApprovedTag, setNewApprovedTag] = useState('');
  const [newRestrictedTag, setNewRestrictedTag] = useState('');

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#171717] border border-neutral-200/90 dark:border-[#333333] rounded-2xl p-6 shadow-sm space-y-6 transition-colors">
        <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 border-b border-neutral-100 dark:border-[#333333] pb-3">
          <Volume2 className="w-5 h-5 text-[#6c48ff]" /> Brand Voice & Tone Guidelines
        </h3>

        {/* Writing Style Instructions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              Writing Style Instructions (Max 2,000 chars)
            </label>
            <span className={`text-xs font-mono font-semibold ${writingStyle.length > 2000 ? 'text-rose-600' : 'text-neutral-400'}`}>
              {writingStyle.length}/2000
            </span>
          </div>
          <textarea
            rows={4}
            value={writingStyle}
            onChange={(e) => setWritingStyle(e.target.value)}
            maxLength={2000}
            placeholder="Describe your writing style (e.g. Professional, energetic, customer-obsessed, concise, empathetic...)"
            className="w-full bg-neutral-50 dark:bg-[#12141D] border border-neutral-200 dark:border-[#333333] rounded-xl p-3.5 text-xs text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-[#6c48ff] leading-relaxed"
          />
        </div>

        {/* Terminology Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-neutral-100 dark:border-[#333333] pt-6">
          
          {/* Approved Terminology */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500" /> Approved Terminology
            </label>
            <div className="flex flex-wrap items-center gap-2 min-h-[42px] p-2 bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-xl">
              {approvedTerminology.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">
                  {tag}
                  <button type="button" onClick={() => onRemoveTag(tag, setApprovedTerminology)} className="hover:text-emerald-950">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newApprovedTag}
                onChange={(e) => setNewApprovedTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAddTag(newApprovedTag, setApprovedTerminology, setNewApprovedTag))}
                placeholder="Add approved tag..."
                className="w-full bg-neutral-50 dark:bg-[#12141D] border border-neutral-200 dark:border-[#333333] rounded-xl px-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => onAddTag(newApprovedTag, setApprovedTerminology, setNewApprovedTag)}
                className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 shrink-0"
              >
                Add
              </button>
            </div>
          </div>

          {/* Restricted Terminology */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-rose-700 dark:text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
              <Ban className="w-4 h-4 text-rose-600 dark:text-rose-500" /> Restricted / Banned Terminology
            </label>
            <div className="flex flex-wrap items-center gap-2 min-h-[42px] p-2 bg-rose-50/50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30 rounded-xl">
              {restrictedTerminology.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-lg">
                  {tag}
                  <button type="button" onClick={() => onRemoveTag(tag, setRestrictedTerminology)} className="hover:text-rose-950">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newRestrictedTag}
                onChange={(e) => setNewRestrictedTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAddTag(newRestrictedTag, setRestrictedTerminology, setNewRestrictedTag))}
                placeholder="Add restricted tag..."
                className="w-full bg-neutral-50 dark:bg-[#12141D] border border-neutral-200 dark:border-[#333333] rounded-xl px-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => onAddTag(newRestrictedTag, setRestrictedTerminology, setNewRestrictedTag)}
                className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 shrink-0"
              >
                Add
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
