import React, { useState, useEffect } from 'react';
import { KnowledgeService } from '../../services/knowledgeService';
import { CategoryBadge, MetadataRenderer } from './dynamicRenderers';

export const KnowledgeExplorer = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const [uniqueTypes, setUniqueTypes] = useState([]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await KnowledgeService.listItems({
        search: search || undefined,
        type: selectedType || undefined,
        take: 50,
      });
      const data = Array.isArray(res) ? res : res.data || [];
      setItems(data);
      
      if (!selectedType) {
        const types = Array.from(new Set(data.map(item => item.type)));
        setUniqueTypes(types);
      }
    } catch (err) {
      console.error('Failed to load knowledge:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(fetchItems, 300);
    return () => clearTimeout(debounce);
  }, [search, selectedType]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this segment?')) return;
    try {
      await KnowledgeService.deleteItem(id);
      fetchItems();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="w-full flex flex-col space-y-5">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
             <svg className="h-4 w-4 text-gray-400 group-focus-within:text-[#6c48ff] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
          </div>
          <input
            type="text"
            placeholder="Search semantic matches (e.g. pricing, audience)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl bg-gray-50/50 text-[13px] font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6c48ff] focus:border-[#6c48ff] focus:bg-white transition-all"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/50 text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#6c48ff] focus:border-[#6c48ff] focus:bg-white transition-all min-w-[160px] cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center] bg-[length:0.6rem_auto]"
        >
          <option value="">All Categories</option>
          {uniqueTypes.map(t => (
            <option key={t} value={t}>
              {t?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
           <svg className="w-8 h-8 text-[#6c48ff]/50 animate-spin mb-3" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
           <span className="text-[13px] font-medium">Loading knowledge database...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100">
            <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 text-[13px] font-medium">No items found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              className={`p-5 bg-white border rounded-2xl cursor-pointer group transition-all duration-300 flex flex-col ${
                expandedId === item.id 
                  ? 'border-[#6c48ff]/30 shadow-[0_4px_24px_rgba(108,72,255,0.06)] md:col-span-2' 
                  : 'border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-[0_4px_16px_rgba(0,0,0,0.02)]'
              }`}
            >
              <div className="flex justify-between items-start gap-3 mb-2">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <CategoryBadge type={item.type} />
                  </div>
                  <h4 className="text-[14px] font-bold text-gray-900 leading-snug">{item.title}</h4>
                </div>
                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-1.5 -mr-1.5 -mt-1.5 bg-transparent hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete Item"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <p className={`text-[13px] text-gray-500 font-medium leading-relaxed flex-1 ${expandedId === item.id ? '' : 'line-clamp-3'}`}>
                {item.content}
              </p>

              {expandedId === item.id && (
                <div className="mt-5 border-t border-gray-100 pt-5 animate-fade-in">
                  <MetadataRenderer metadata={item.metadata} />
                  
                  <div className="flex justify-between items-center text-[11px] font-bold text-gray-400 mt-5 px-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                      <span>Confidence: {item.confidence ? `${Math.round(item.confidence * 100)}%` : 'N/A'}</span>
                    </div>
                    <span>{new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
