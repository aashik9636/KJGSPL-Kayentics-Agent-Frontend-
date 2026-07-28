import React, { useState } from 'react';
import { CheckCircle2, Ban, Trash2 } from 'lucide-react';

export const RulesTab = ({ brandDos, setBrandDos, brandDonts, setBrandDonts, onAddRule, onRemoveRule }) => {
  const [newDoInput, setNewDoInput] = useState('');
  const [newDontInput, setNewDontInput] = useState('');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Brand Do's */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-emerald-700 flex items-center gap-2 border-b border-gray-100 pb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Brand Do's (Enforced Rules)
          </h3>
          <div className="space-y-2">
            {brandDos.map((rule, idx) => (
              <div key={idx} className="flex items-start justify-between gap-3 p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs text-emerald-950 font-medium">
                <span className="leading-relaxed">✓ {rule}</span>
                <button type="button" onClick={() => onRemoveRule(idx, setBrandDos)} className="text-emerald-400 hover:text-rose-600 shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newDoInput}
              onChange={(e) => setNewDoInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAddRule(newDoInput, setBrandDos, setNewDoInput))}
              placeholder="e.g. Always include call to action button"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900"
            />
            <button
              type="button"
              onClick={() => onAddRule(newDoInput, setBrandDos, setNewDoInput)}
              className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 shrink-0"
            >
              Add Do Rule
            </button>
          </div>
        </div>

        {/* Brand Don'ts */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-rose-700 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Ban className="w-5 h-5 text-rose-600" /> Brand Don'ts (Strict Warnings)
          </h3>
          <div className="space-y-2">
            {brandDonts.map((rule, idx) => (
              <div key={idx} className="flex items-start justify-between gap-3 p-3 bg-rose-50/60 border border-rose-100 rounded-xl text-xs text-rose-950 font-medium">
                <span className="leading-relaxed">✗ {rule}</span>
                <button type="button" onClick={() => onRemoveRule(idx, setBrandDonts)} className="text-rose-400 hover:text-rose-700 shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newDontInput}
              onChange={(e) => setNewDontInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAddRule(newDontInput, setBrandDonts, setNewDontInput))}
              placeholder="e.g. Never use outdated logo icons"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900"
            />
            <button
              type="button"
              onClick={() => onAddRule(newDontInput, setBrandDonts, setNewDontInput)}
              className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 shrink-0"
            >
              Add Don't Rule
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
