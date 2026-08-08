import React, { useEffect, useState } from 'react';
import { Package, ChevronRight, Building2, Users, Target, BarChart3 } from 'lucide-react';
import { salesOutreachService } from '../../../../services/salesOutreachService';

export default function SelectProductStep({ onSelectProduct }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    salesOutreachService.getProducts()
      .then(data => setProducts(data || []))
      .catch(err => { console.error(err); setProducts([]); })
      .finally(() => setLoading(false));
  }, []);

  const icp = selected?.icpdata || selected?.icp || null;

  return (
    <div className="flex flex-col h-full animate-fade-in w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-[#1a1a1a] flex items-center justify-center">
            <Package className="w-5 h-5 text-[#6c48ff]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">Select Product</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Choose which product to run outreach for</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-[#6c48ff] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading products...</p>
          </div>
        </div>
      ) : (
        <div className="flex gap-6 flex-1 min-h-0">
          {/* Products Grid */}
          <div className="w-1/2 overflow-y-auto pr-2 space-y-3">
            {products.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border rounded-xl border-neutral-200 dark:border-neutral-800">
                <Package className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mb-3" />
                <p className="font-bold text-neutral-600 dark:text-neutral-400 mb-1">No products found</p>
                <p className="text-sm text-neutral-400">Create a product in the Product Catalog first.</p>
              </div>
            )}
            {products.map(p => {
              const isSelected = selected?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors relative ${
                    isSelected
                      ? 'border-[#6c48ff] bg-[#6c48ff]/5'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111111] hover:border-[#6c48ff]/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#6c48ff] text-white' : 'bg-neutral-100 dark:bg-[#1a1a1a] text-neutral-500'
                    }`}>
                      <Package className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-neutral-900 dark:text-white text-sm">{p.name}</p>
                        {p.status === 'ACTIVE' && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-medium rounded uppercase">Live</span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-neutral-400 mb-2">{p.sku}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                        {p.short_description || p.shortDescription || ''}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ICP Preview Panel */}
          <div className="flex-1 flex flex-col min-w-0">
            {selected ? (
              <div className="flex-1 flex flex-col rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111111] overflow-hidden">
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141414]">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-neutral-500" />
                    <span className="text-xs font-semibold text-neutral-500 uppercase">ICP Profile</span>
                  </div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">{selected.name}</p>
                </div>

                <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                  {icp ? (
                    <>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="w-4 h-4 text-neutral-400" />
                          <p className="text-xs font-semibold text-neutral-500 uppercase">Industries</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(icp.industry || '').split(',').map(i => i.trim()).filter(Boolean).map(ind => (
                            <span key={ind} className="px-2.5 py-1 bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs rounded-md">{ind}</span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-4 h-4 text-neutral-400" />
                          <p className="text-xs font-semibold text-neutral-500 uppercase">Company Size</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 text-center">
                            <p className="text-xs text-neutral-500 mb-1">Min</p>
                            <p className="text-base font-semibold text-neutral-900 dark:text-white">{icp.min_employees ?? '—'}</p>
                          </div>
                          <span className="text-neutral-300">-</span>
                          <div className="flex-1 bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 text-center">
                            <p className="text-xs text-neutral-500 mb-1">Max</p>
                            <p className="text-base font-semibold text-neutral-900 dark:text-white">{icp.max_employees ?? '—'}</p>
                          </div>
                        </div>
                      </div>

                      {icp.buyer_personas?.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-neutral-400" />
                            <p className="text-xs font-semibold text-neutral-500 uppercase">Buyer Personas</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {icp.buyer_personas.map(bp => (
                              <span key={bp} className="px-2.5 py-1 bg-[#6c48ff]/10 text-[#6c48ff] text-xs font-medium rounded-md">{bp}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-10 text-center text-neutral-400">
                      <Target className="w-8 h-8 mb-3 opacity-50" />
                      <p className="text-sm">No ICP linked to this product</p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-white dark:bg-[#141414] border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    onClick={() => onSelectProduct(selected)}
                    className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#6c48ff] hover:bg-[#5b3df5] text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    Start Campaign
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl flex flex-col items-center justify-center text-center p-8 bg-neutral-50 dark:bg-[#111111]">
                <Target className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mb-3" />
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Select a product</p>
                <p className="text-sm text-neutral-400">ICP details will appear here</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
