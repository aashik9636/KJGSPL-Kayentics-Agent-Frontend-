import React from 'react';
import { Image as ImageIcon, Palette, Type, Volume2, ShieldAlert } from 'lucide-react';

const TABS = [
  { id: 'identity', label: 'Logos & Identity', icon: ImageIcon },
  { id: 'colors', label: 'Color System', icon: Palette },
  { id: 'typography', label: 'Typography', icon: Type },
  { id: 'voice', label: 'Voice & Persona', icon: Volume2 },
  { id: 'rules', label: "Do's & Don'ts Rules", icon: ShieldAlert },
];

export const BrandKitTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex items-center gap-2 border-b border-neutral-200/80 dark:border-[#333333] pb-px overflow-x-auto transition-colors">
      {TABS.map(t => {
        const Icon = t.icon;
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onTabChange(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              isActive
                ? 'border-[#6c48ff] text-[#6c48ff] dark:text-purple-400 dark:border-purple-400'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Icon className="w-4 h-4" /> {t.label}
          </button>
        );
      })}
    </div>
  );
};
