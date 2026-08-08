import React, { useEffect, useState } from 'react';
import { Package, Plus } from 'lucide-react';
import { salesOutreachService } from '../../../../services/salesOutreachService';
import { useNavigate } from 'react-router-dom';

export default function SelectProductStep({ onSelectProduct }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cloningId, setCloningId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await salesOutreachService.getProducts(); // fetch all products
      setProducts(data || []);
    } catch (err) {
      console.error('API failed, using dummy data', err);
      setProducts([
        { id: '1', name: 'Kaynetics AI Pro', sku: 'KAY-01', short_description: 'Enterprise analytics AI agent with real-time insights and automated reporting workflows.', status: 'ACTIVE' },
        { id: '2', name: 'Social Media Auto-Pilot', sku: 'KAY-02', short_description: 'Automated post scheduler that uses generative AI to write engaging linkedin posts.', status: 'ACTIVE' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (p) => {
    try {
      setCloningId(p.id);
      // Option A: Create the product in the Sales Catalog first
      const salesProduct = await salesOutreachService.createProduct({
        name: p.name,
        sku: p.sku || 'N/A',
        category: p.category || 'General',
        shortDescription: p.short_description || p.shortDescription || 'No description',
        longDescription: p.long_description || p.longDescription || 'No description',
        features: p.features || [],
        benefits: p.benefits || [],
        usp: p.usp || '',
        targetAudience: p.target_audience || '',
        tags: p.tags || [],
        status: 'ACTIVE'
      });
      onSelectProduct(salesProduct);
    } catch (err) {
      console.error('Failed to clone product to sales catalog:', err);
      // Fallback: Proceed with original if clone fails
      onSelectProduct(p);
    } finally {
      setCloningId(null);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="mb-10 text-center max-w-2xl mx-auto pt-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6c48ff]/20 to-[#ec4899]/20 mb-6">
          <Package className="w-8 h-8 text-[#6c48ff]" />
        </div>
        <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-3 tracking-tight">Select a Product</h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-lg leading-relaxed">
          Choose which product or service you want to run this outreach campaign for. The AI will use this product's unique selling propositions to draft highly personalized emails.
        </p>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center pb-20">
          <div className="w-10 h-10 border-4 border-[#6c48ff] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto w-full pb-8">
          {Array.isArray(products) && products.map(p => (
            <button 
              key={p.id}
              onClick={() => handleSelect(p)}
              disabled={cloningId !== null}
              className={`text-left p-6 rounded-3xl border-2 border-neutral-100 dark:border-[#262626] bg-white dark:bg-[#151515] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#6c48ff]/10 group relative overflow-hidden ${cloningId === p.id ? 'opacity-70 scale-[0.98]' : 'hover:border-[#6c48ff] dark:hover:border-[#6c48ff]'}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#6c48ff]/5 to-transparent rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-14 h-14 bg-neutral-50 dark:bg-[#202020] rounded-2xl flex items-center justify-center group-hover:bg-[#6c48ff]/10 transition-colors shadow-sm relative">
                  {cloningId === p.id ? (
                    <div className="w-6 h-6 border-2 border-[#6c48ff] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Package className="w-7 h-7 text-neutral-600 dark:text-neutral-300 group-hover:text-[#6c48ff]" />
                  )}
                </div>
                {p.status === 'ACTIVE' && (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-extrabold uppercase rounded-full">
                    Active
                  </span>
                )}
              </div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1.5">{p.name}</h3>
                <p className="text-xs font-mono font-bold text-neutral-400 dark:text-neutral-500 mb-3">{p.sku}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">{p.short_description || p.shortDescription || 'No description provided.'}</p>
              </div>
            </button>
          ))}
          
          <button 
            onClick={() => navigate('/products')}
            className="text-left p-6 rounded-3xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-[#6c48ff] dark:hover:border-[#6c48ff] hover:bg-[#6c48ff]/5 flex flex-col items-center justify-center text-center transition-all duration-300 h-full min-h-[240px] group"
          >
             <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-[#262626] group-hover:bg-[#6c48ff] flex items-center justify-center mb-4 transition-colors shadow-sm">
               <Plus className="w-8 h-8 text-neutral-400 group-hover:text-white transition-colors" />
             </div>
             <p className="font-bold text-neutral-900 dark:text-white text-lg group-hover:text-[#6c48ff]">Create New Product</p>
             <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 max-w-[200px]">Head over to the product catalog to create a new offering.</p>
          </button>
        </div>
      )}
    </div>
  );
}
