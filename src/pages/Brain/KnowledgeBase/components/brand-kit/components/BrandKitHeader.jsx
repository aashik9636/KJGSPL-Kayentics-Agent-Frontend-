import React from 'react';
import { Sparkles, Save } from 'lucide-react';

export const BrandKitHeader = ({ saving, resetting, onReset, onSave }) => {
  return (
    <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-[#6c48ff] text-xs font-semibold border border-purple-100">
          <Sparkles className="w-4 h-4" /> Brand Guidelines & AI Kit
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Corporate Identity & AI Guardrails</h2>
        <p className="text-gray-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Define corporate logo assets, color palettes, font stacks, voice guidelines, and compliance rules enforced across AI Agents and Content Generators.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onReset}
          disabled={resetting}
          className="px-4 py-2.5 bg-gray-100 hover:bg-rose-50 text-gray-700 hover:text-rose-600 font-bold rounded-xl text-xs transition border border-gray-200"
        >
          {resetting ? 'Resetting...' : 'Reset Kit'}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#6c48ff] hover:bg-[#5b3af0] text-white font-bold rounded-xl shadow-md shadow-purple-500/20 transition-all text-xs"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Guidelines...' : 'Save Brand Guidelines'}</span>
        </button>
      </div>
    </div>
  );
};
