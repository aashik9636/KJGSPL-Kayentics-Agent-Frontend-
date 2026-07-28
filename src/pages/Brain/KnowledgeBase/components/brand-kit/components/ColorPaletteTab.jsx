import React, { useState } from 'react';
import { Palette, X } from 'lucide-react';

export const ColorPaletteTab = ({
  primaryColors, setPrimaryColors,
  secondaryColors, setSecondaryColors,
  accentColors, setAccentColors,
  onAddColor, onRemoveColor
}) => {
  const [newPrimaryInput, setNewPrimaryInput] = useState('#6C48FF');
  const [newSecondaryInput, setNewSecondaryInput] = useState('#F4F7FE');
  const [newAccentInput, setNewAccentInput] = useState('#FF5630');

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
          <Palette className="w-5 h-5 text-[#6c48ff]" /> Brand Color Palette System
        </h3>

        {/* Primary Colors */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            Primary Colors (HEX)
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {primaryColors.map((hex) => (
              <div key={hex} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 shadow-xs">
                <div className="w-5 h-5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: hex }} />
                <span className="text-xs font-mono font-bold text-gray-800">{hex}</span>
                {primaryColors.length > 1 && (
                  <button type="button" onClick={() => onRemoveColor(hex, setPrimaryColors)} className="text-gray-400 hover:text-rose-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input type="color" value={newPrimaryInput} onChange={(e) => setNewPrimaryInput(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0" />
            <input
              type="text"
              value={newPrimaryInput}
              onChange={(e) => setNewPrimaryInput(e.target.value)}
              placeholder="#0052FF"
              className="w-36 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-mono text-gray-800"
            />
            <button
              type="button"
              onClick={() => onAddColor(newPrimaryInput, setPrimaryColors)}
              className="px-3 py-1.5 bg-[#6c48ff] text-white font-bold rounded-xl text-xs hover:bg-[#5b3af0]"
            >
              Add Primary Color
            </button>
          </div>
        </div>

        {/* Secondary Colors */}
        <div className="space-y-3 border-t border-gray-100 pt-5">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            Secondary Colors (HEX)
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {secondaryColors.map((hex) => (
              <div key={hex} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 shadow-xs">
                <div className="w-5 h-5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: hex }} />
                <span className="text-xs font-mono font-bold text-gray-800">{hex}</span>
                {secondaryColors.length > 1 && (
                  <button type="button" onClick={() => onRemoveColor(hex, setSecondaryColors)} className="text-gray-400 hover:text-rose-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input type="color" value={newSecondaryInput} onChange={(e) => setNewSecondaryInput(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0" />
            <input
              type="text"
              value={newSecondaryInput}
              onChange={(e) => setNewSecondaryInput(e.target.value)}
              placeholder="#F4F7FE"
              className="w-36 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-mono text-gray-800"
            />
            <button
              type="button"
              onClick={() => onAddColor(newSecondaryInput, setSecondaryColors)}
              className="px-3 py-1.5 bg-gray-900 text-white font-bold rounded-xl text-xs hover:bg-gray-800"
            >
              Add Secondary Color
            </button>
          </div>
        </div>

        {/* Accent Colors */}
        <div className="space-y-3 border-t border-gray-100 pt-5">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            Accent Colors (HEX)
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {accentColors.map((hex) => (
              <div key={hex} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 shadow-xs">
                <div className="w-5 h-5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: hex }} />
                <span className="text-xs font-mono font-bold text-gray-800">{hex}</span>
                {accentColors.length > 1 && (
                  <button type="button" onClick={() => onRemoveColor(hex, setAccentColors)} className="text-gray-400 hover:text-rose-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input type="color" value={newAccentInput} onChange={(e) => setNewAccentInput(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0" />
            <input
              type="text"
              value={newAccentInput}
              onChange={(e) => setNewAccentInput(e.target.value)}
              placeholder="#FF5630"
              className="w-36 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-mono text-gray-800"
            />
            <button
              type="button"
              onClick={() => onAddColor(newAccentInput, setAccentColors)}
              className="px-3 py-1.5 bg-pink-600 text-white font-bold rounded-xl text-xs hover:bg-pink-700"
            >
              Add Accent Color
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
