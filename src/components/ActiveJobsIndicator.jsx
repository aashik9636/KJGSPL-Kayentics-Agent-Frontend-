import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEventStore } from '../store/eventStore';

export default function ActiveJobsIndicator() {
  const { activeJobs } = useEventStore();
  const [showTooltip, setShowTooltip] = useState(false);

  const jobIds = Object.keys(activeJobs);
  const activeCount = jobIds.length;

  if (activeCount === 0) return null;

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center gap-2 bg-[#6c48ff]/10 border border-[#6c48ff]/20 text-[#6c48ff] dark:bg-[#a59ef0]/10 dark:border-[#a59ef0]/20 dark:text-[#a59ef0] px-2.5 py-1.5 rounded-full shadow-sm cursor-pointer hover:bg-[#6c48ff]/20 dark:hover:bg-[#a59ef0]/20 transition-all">
        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span className="text-[11px] font-bold uppercase tracking-wider">{activeCount} Running</span>
      </div>

      {showTooltip && (
        <div className="absolute top-0 left-full ml-3 w-64 bg-white dark:bg-[#111111] border border-neutral-200 dark:border-[#333333] shadow-lg rounded-xl p-3 z-[9999]">
          <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-2 border-b border-neutral-100 dark:border-[#222222] pb-2">Active Tasks</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {jobIds.map(id => {
              const job = activeJobs[id];
              return (
                <Link 
                  key={id} 
                  to={`/chat?session=${job.sessionId}`}
                  className="flex flex-col gap-0.5 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-[#1a1a1a] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 truncate pr-2 group-hover:text-[#6c48ff] dark:group-hover:text-[#a59ef0] transition-colors">{job.node || 'Agent Task'}</span>
                    <span className="text-[9px] text-[#6c48ff] dark:text-[#a59ef0] uppercase tracking-wider font-bold">Processing</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 truncate">{job.message || 'Working...'}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
