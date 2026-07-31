import React, { useMemo, useState } from 'react';
import { Check, Info, Layers, Search, RotateCcw } from 'lucide-react';

// ─── These match the backend DB after the module consolidation migration ───
// Consolidated: Brand Profile + Business Profile → Profiles
// Consolidated: Media Library + Prompt Library + Knowledge → Content Hub
// Consolidated: AI + AI Usage + Activities + Agents → Agents & AI
// Consolidated: Search → Dashboard
export const FALLBACK_MODULES = [
  { id: 'Agents & AI',         name: 'Agents & AI',              category: 'Core AI' },
  { id: 'Audit Logs',          name: 'Audit Logs',               category: 'Security' },
  { id: 'Content Hub',         name: 'Content Hub',              category: 'Media & Content' },
  { id: 'Dashboard',           name: 'Dashboard Analytics',      category: 'Analytics' },
  { id: 'Integrations',        name: 'Integrations',             category: 'Integrations' },
  { id: 'Notifications',       name: 'Notifications',            category: 'Settings' },
  { id: 'Organization',        name: 'Organization Settings',    category: 'Administration' },
  { id: 'Post Scheduler',      name: 'Post Scheduler',           category: 'Media & Content' },
  { id: 'Products',            name: 'Products',                 category: 'Media & Content' },
  { id: 'Profiles',            name: 'Brand & Business Profiles',category: 'Settings' },
  { id: 'Settings',            name: 'System Settings',          category: 'Settings' },
  { id: 'Subscriptions',       name: 'Subscriptions & Billing',  category: 'Administration' },
  { id: 'Users',               name: 'User Management',          category: 'Administration' },
  { id: 'Workspace',           name: 'Workspace Management',     category: 'Administration' },
];

export const DEFAULT_MODULES = FALLBACK_MODULES;

export const STANDARD_ACTIONS = [
  { key: 'Read',    label: 'View / Read',   desc: 'Can read and list items' },
  { key: 'Create',  label: 'Create / Add',  desc: 'Can create new records' },
  { key: 'Update',  label: 'Update / Edit', desc: 'Can edit existing records' },
  { key: 'Delete',  label: 'Delete',        desc: 'Can delete records' },
  { key: 'Execute', label: 'Execute / Run', desc: 'Can trigger or execute actions' },
  { key: 'Manage',  label: 'Full Manage',   desc: 'Administrative control' },
];

export default function PermissionMatrix({
  matrix = {},
  dynamicPermissions = [],
  dynamicModules = [],
  onTogglePermission,
  onSelectAllRead,
  onGrantFullAdmin,
  onClearAll
}) {
  const [matrixSearch, setMatrixSearch] = useState('');

  const modulesList = useMemo(() => {
    let list = FALLBACK_MODULES;

    if (Array.isArray(dynamicModules) && dynamicModules.length > 0) {
      list = dynamicModules.map(m => ({
        id: m.name || m.code || m.id,
        name: m.name || m.code,
        category: m.category || 'System Module'
      }));
    } else if (Array.isArray(dynamicPermissions) && dynamicPermissions.length > 0) {
      const moduleNames = Array.from(
        new Set(dynamicPermissions.map(p => p.module || p.permission?.module).filter(Boolean))
      );
      if (moduleNames.length > 0) {
        list = moduleNames.map(modName => ({
          id: modName,
          name: modName,
          category: 'API Module'
        }));
      }
    }

    if (!matrixSearch.trim()) return list;

    const q = matrixSearch.toLowerCase();
    return list.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    );
  }, [dynamicPermissions, dynamicModules, matrixSearch]);

  const actionsList = useMemo(() => {
    if (Array.isArray(dynamicPermissions) && dynamicPermissions.length > 0) {
      const actionsFound = Array.from(
        new Set(dynamicPermissions.map(p => p.action || p.permission?.action).filter(Boolean))
      );

      const combined = Array.from(new Set([...STANDARD_ACTIONS.map(a => a.key), ...actionsFound]));
      
      return combined.map(actKey => {
        const std = STANDARD_ACTIONS.find(a => a.key.toLowerCase() === actKey.toLowerCase());
        return {
          key: actKey,
          label: std ? std.label : actKey,
          desc: std ? std.desc : `Can ${actKey.toLowerCase()}`
        };
      });
    }

    return STANDARD_ACTIONS;
  }, [dynamicPermissions]);

  return (
    <div className="space-y-3 font-sans">
      {/* Matrix Toolbar & Bulk Helpers */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#6c48ff] dark:text-purple-300" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight">
            Module Permission Matrix
          </h3>
        </div>

        {/* Matrix Search & Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {/* Quick Matrix Filter */}
          <div className="relative flex-1 sm:flex-initial sm:w-44">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter modules..."
              value={matrixSearch}
              onChange={(e) => setMatrixSearch(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333333] rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-800 dark:text-white focus:outline-none focus:border-[#6c48ff] transition-all"
            />
          </div>

          <button
            type="button"
            onClick={onSelectAllRead}
            className="px-2.5 py-1.5 bg-neutral-100 dark:bg-[#1a1a1a] hover:bg-purple-50 dark:hover:bg-purple-950/60 hover:text-[#6c48ff] dark:hover:text-purple-300 text-neutral-700 dark:text-neutral-300 text-xs font-bold rounded-lg transition-colors"
          >
            Select All View
          </button>
          <button
            type="button"
            onClick={onGrantFullAdmin}
            className="px-2.5 py-1.5 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-[#6c48ff] dark:text-purple-300 text-xs font-bold rounded-lg transition-colors"
          >
            Grant Full Access
          </button>
          <button
            type="button"
            onClick={onClearAll}
            className="px-2.5 py-1.5 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* 
        CONTAINED SCROLL CONTAINER:
        The permission table is strictly contained in a max-h-[320px] scrollable box.
        This prevents the top Role Metadata fields (Name, Status, Description) from scrolling out of view!
      */}
      <div className="bg-white dark:bg-[#111111] border border-neutral-200/90 dark:border-[#262626] rounded-2xl overflow-hidden shadow-xs max-h-[320px] overflow-y-auto scrollbar-thin">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-neutral-50/95 dark:bg-[#171717] backdrop-blur-xs z-10 border-b border-neutral-200 dark:border-[#262626]">
            <tr className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              <th className="p-3 pl-5 w-2/5">Module Taxonomy</th>
              {actionsList.map(act => (
                <th key={act.key} className="p-3 text-center">
                  <div className="font-bold text-neutral-700 dark:text-neutral-300">{act.label.split('/')[0]}</div>
                  <div className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium font-mono normal-case">{act.key}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-[#262626] text-xs">
            {modulesList.length === 0 ? (
              <tr>
                <td colSpan={actionsList.length + 1} className="p-8 text-center text-neutral-400 dark:text-neutral-500 text-xs">
                  No modules match "{matrixSearch}"
                </td>
              </tr>
            ) : (
              modulesList.map((mod) => {
                const activeSet = matrix[mod.id] || new Set();

                return (
                  <tr key={mod.id} className="hover:bg-purple-50/20 dark:hover:bg-purple-950/20 transition-colors">
                    <td className="p-3 pl-5">
                      <div className="font-bold text-neutral-900 dark:text-white tracking-tight">{mod.name}</div>
                      <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono mt-0.5">{mod.id} • {mod.category}</div>
                    </td>

                    {actionsList.map((act) => {
                      const isChecked = activeSet.has(act.key);

                      return (
                        <td key={act.key} className="p-3 text-center">
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={isChecked}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onTogglePermission(mod.id, act.key);
                            }}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-purple-100/50 dark:hover:bg-purple-900/40 active:scale-95 transition-all focus:outline-none"
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              isChecked
                                ? 'bg-[#6c48ff] border-[#6c48ff] text-white shadow-xs'
                                : 'bg-white dark:bg-[#1a1a1a] border-neutral-300 dark:border-[#333333] text-transparent hover:border-[#6c48ff]'
                            }`}>
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Rule Explanation Box */}
      <div className="p-3 bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 rounded-xl text-[11px] text-purple-900 dark:text-purple-300 flex items-start gap-2.5">
        <Info className="w-3.5 h-3.5 text-[#6c48ff] dark:text-purple-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Enforced Permission Dependency Rule:</span> Granting <span className="font-semibold">Update</span>, <span className="font-semibold">Create</span>, <span className="font-semibold">Delete</span>, or <span className="font-semibold">Manage</span> automatically selects <span className="font-semibold">Read</span> access. Unchecking <span className="font-semibold">Read</span> clears all action permissions for that module.
        </div>
      </div>
    </div>
  );
}
