import React from 'react';
import { Search, X, LayoutGrid, List, RotateCcw } from 'lucide-react';
import { DEFAULT_MODULES } from './PermissionMatrix';

export default function RoleFilterBar({
  searchQuery,
  setSearchQuery,
  roleTypeFilter,
  setRoleTypeFilter,
  statusFilter,
  setStatusFilter,
  moduleFilter,
  setModuleFilter,
  viewMode,
  setViewMode,
  filteredCount,
  totalCount,
  onResetFilters
}) {
  const activeFiltersCount = (roleTypeFilter !== 'ALL' ? 1 : 0) +
    (statusFilter !== 'ALL' ? 1 : 0) +
    (moduleFilter !== 'ALL' ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className="bg-white dark:bg-[#111111] border border-neutral-200/90 dark:border-[#262626] rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by role name, description, or permission key..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333333] rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#6c48ff] transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-2 border border-neutral-200 dark:border-[#333333] p-1 rounded-xl bg-neutral-50 dark:bg-[#1a1a1a] self-end lg:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('card')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'card'
                ? 'bg-white dark:bg-[#262626] text-[#6c48ff] dark:text-purple-300 shadow-sm'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
            title="Card Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Cards</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'table'
                ? 'bg-white dark:bg-[#262626] text-[#6c48ff] dark:text-purple-300 shadow-sm'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
            title="Row Table View"
          >
            <List className="w-4 h-4" />
            <span>Rows</span>
          </button>
        </div>
      </div>

      {/* Dropdown Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-3 border-t border-neutral-100 dark:border-[#262626] items-center">
        <div>
          <label className="block text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
            Role Type
          </label>
          <select
            value={roleTypeFilter}
            onChange={(e) => setRoleTypeFilter(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333333] rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-white focus:outline-none focus:border-[#6c48ff] transition"
          >
            <option value="ALL">All Types (System & Custom)</option>
            <option value="SYSTEM">System Roles Only</option>
            <option value="CUSTOM">Custom Roles Only</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
            Role Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333333] rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-white focus:outline-none focus:border-[#6c48ff] transition"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
            Permission Module
          </label>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333333] rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-white focus:outline-none focus:border-[#6c48ff] transition"
          >
            <option value="ALL">All Permission Modules</option>
            {DEFAULT_MODULES.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 pt-4 sm:pt-0">
          <span className="text-xs text-neutral-400 font-medium">
            {filteredCount} of {totalCount} roles
          </span>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset ({activeFiltersCount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
