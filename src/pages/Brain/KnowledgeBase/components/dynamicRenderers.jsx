import React from 'react';

// 1. Dynamic Metadata grid renderer
export const MetadataRenderer = ({ metadata }) => {
  if (!metadata || typeof metadata !== 'object' || Object.keys(metadata).length === 0) return null;

  const formatKey = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  
  const formatValue = (val) => {
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
      <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Extracted Attributes
      </h5>
      <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
        {Object.entries(metadata).map(([key, val]) => (
          val !== null && val !== undefined && (
            <div key={key} className="flex flex-col border-l-2 border-[#e0d4ff] pl-2.5">
              <dt className="text-[10px] font-bold text-gray-400 mb-0.5">{formatKey(key)}</dt>
              <dd className="text-[12px] font-bold text-gray-800 break-words">
                {formatValue(val)}
              </dd>
            </div>
          )
        ))}
      </dl>
    </div>
  );
};

// 2. Color-mapped category tag renderer
export const CategoryBadge = ({ type }) => {
  const getBadgeColor = (t) => {
    switch (t?.toLowerCase()) {
      case 'product':
        return 'bg-blue-50 text-blue-600';
      case 'brand':
        return 'bg-fuchsia-50 text-fuchsia-600';
      case 'persona':
        return 'bg-emerald-50 text-emerald-600';
      case 'faq':
        return 'bg-orange-50 text-orange-600';
      case 'goal':
        return 'bg-rose-50 text-rose-600';
      default:
        // Generic theme for custom LLM categories
        return 'bg-gray-100 text-gray-500';
    }
  };

  const friendlyName = type ? type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Unknown';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${getBadgeColor(type)}`}>
      {friendlyName}
    </span>
  );
};
