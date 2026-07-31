import React from 'react';
import { Bot } from 'lucide-react';

export const AiEnforcementFooter = ({ saving, onSave }) => {
  return (
    <div className="bg-white dark:bg-[#171717] border border-neutral-200/90 dark:border-[#333333] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-[#6c48ff] dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-800/50">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">AI Agent RAG Enforcement</h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Saving updates all brand guidelines parameters synced to your AI Agents, Content Hub, and Post Schedulers in real time.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="px-6 py-3 bg-[#6c48ff] hover:bg-[#5b3af0] text-white font-bold rounded-xl text-xs transition shadow-md shadow-purple-500/20 shrink-0"
      >
        {saving ? 'Saving Guidelines...' : 'Save & Sync Guidelines'}
      </button>
    </div>
  );
};
