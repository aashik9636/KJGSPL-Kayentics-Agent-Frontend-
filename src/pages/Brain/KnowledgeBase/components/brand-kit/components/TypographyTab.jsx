import React from 'react';
import { Type } from 'lucide-react';
import { FONT_OPTIONS } from '../constants';

export const TypographyTab = ({ typography, setTypography }) => {
  return (
    <div className="bg-white dark:bg-[#171717] border border-neutral-200/90 dark:border-[#333333] rounded-2xl p-6 shadow-sm space-y-6 transition-colors">
      <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 border-b border-neutral-100 dark:border-[#333333] pb-3">
        <Type className="w-5 h-5 text-[#6c48ff]" /> Brand Typography & Font Stacks
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
            Headings Font
          </label>
          <select
            value={typography.headings}
            onChange={(e) => setTypography(prev => ({ ...prev, headings: e.target.value }))}
            className="w-full bg-neutral-50 dark:bg-[#12141D] border border-neutral-200 dark:border-[#333333] rounded-xl px-3.5 py-2 text-xs font-bold text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-[#6c48ff]"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
            Body Font
          </label>
          <select
            value={typography.body}
            onChange={(e) => setTypography(prev => ({ ...prev, body: e.target.value }))}
            className="w-full bg-neutral-50 dark:bg-[#12141D] border border-neutral-200 dark:border-[#333333] rounded-xl px-3.5 py-2 text-xs font-semibold text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-[#6c48ff]"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
            Fallback Font Stack
          </label>
          <input
            type="text"
            value={typography.fallback}
            onChange={(e) => setTypography(prev => ({ ...prev, fallback: e.target.value }))}
            className="w-full bg-neutral-50 dark:bg-[#12141D] border border-neutral-200 dark:border-[#333333] rounded-xl px-3.5 py-2 text-xs font-mono text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[#6c48ff]"
            placeholder="sans-serif, system-ui"
          />
        </div>
      </div>

      {/* Typography Live Preview */}
      <div className="p-6 bg-neutral-50 dark:bg-[#171717] rounded-2xl border border-neutral-200 dark:border-[#333333] space-y-4 transition-colors">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Live Typography Preview</span>
        <div style={{ fontFamily: `${typography.headings}, ${typography.fallback}` }}>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Heading 1 Preview Text</h1>
          <h3 className="text-base font-bold text-[#6c48ff] dark:text-purple-400">Subheading Accent Preview</h3>
        </div>
        <div style={{ fontFamily: `${typography.body}, ${typography.fallback}` }}>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl">
            Body text preview: This demonstrates how your body font renders inside marketing copy, blog posts, and agent-generated responses across web platforms.
          </p>
        </div>
      </div>
    </div>
  );
};
