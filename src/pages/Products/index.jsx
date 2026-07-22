import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { toast } from 'react-toastify';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricing: '',
    usps: ['']
  });

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleUspChange = (index, value) => {
    const newUsps = [...formData.usps];
    newUsps[index] = value;
    setFormData({ ...formData, usps: newUsps });
  };

  const addUspField = () => {
    setFormData({ ...formData, usps: [...formData.usps, ''] });
  };

  const removeUspField = (index) => {
    const newUsps = formData.usps.filter((_, i) => i !== index);
    setFormData({ ...formData, usps: newUsps });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Filter out empty USPs
      const payload = {
        ...formData,
        usps: formData.usps.filter(usp => usp.trim() !== '')
      };
      await productService.createProduct(payload);
      toast.success('Product created successfully');
      setIsModalOpen(false);
      setFormData({ name: '', description: '', pricing: '', usps: [''] });
      fetchProducts();
    } catch (err) {
      // Error handled by interceptor
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      // Error handled by interceptor
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 h-full overflow-y-auto animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products Catalog</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your offerings, pricing, and unique selling propositions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1967d2] hover:bg-[#1557b0] text-white font-medium py-2.5 px-5 rounded-xl shadow-sm hover:shadow transition-all text-sm flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <svg className="animate-spin w-8 h-8 text-[#1967d2]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#1967d2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-[16px] font-bold text-gray-900 mb-1">No products found</h3>
          <p className="text-gray-500 text-[13px] mb-6 max-w-sm mx-auto">Get started by creating your first product or service offering.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-[#1967d2] font-bold text-sm hover:underline"
          >
            + Create New Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all group relative flex flex-col h-full">
              
              <button 
                onClick={() => handleDelete(product.id)}
                className="absolute top-4 right-4 p-1.5 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                title="Delete Product"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-[16px] leading-tight">{product.name}</h3>
                  <p className="text-[#1967d2] font-bold text-[14px] mt-0.5">{product.pricing}</p>
                </div>
              </div>
              
              <p className="text-gray-500 text-[13px] mb-5 flex-1">{product.description}</p>
              
              <div className="pt-4 border-t border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Key Features (USPs)</p>
                <ul className="space-y-1.5">
                  {product.usps?.map((usp, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[13px] text-gray-700 font-medium">
                      <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      {usp}
                    </li>
                  ))}
                  {(!product.usps || product.usps.length === 0) && (
                     <li className="text-[13px] text-gray-400 italic">No features listed</li>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Create New Product</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="productForm" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Product Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Kaynetics AI Pro" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 text-sm transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]" />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required placeholder="Short summary of the product..." rows="3" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 text-sm transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]" />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Pricing</label>
                  <input type="text" value={formData.pricing} onChange={(e) => setFormData({...formData, pricing: e.target.value})} required placeholder="e.g. $99/mo or $1500 one-time" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 text-sm transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]" />
                </div>
                
                <div>
                  <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide flex justify-between items-center">
                    Unique Selling Propositions (USPs)
                    <button type="button" onClick={addUspField} className="text-[#1967d2] hover:underline capitalize text-xs">
                      + Add USP
                    </button>
                  </label>
                  <div className="space-y-2">
                    {formData.usps.map((usp, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input type="text" value={usp} onChange={(e) => handleUspChange(index, e.target.value)} placeholder="e.g. 24/7 Automated Support" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 text-sm transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]" />
                        {formData.usps.length > 1 && (
                          <button type="button" onClick={() => removeUspField(index)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0 rounded-b-3xl">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-white transition-colors">
                Cancel
              </button>
              <button type="submit" form="productForm" className="px-6 py-2.5 rounded-xl bg-[#1967d2] hover:bg-[#1557b0] text-white font-medium text-sm shadow-sm hover:shadow transition-all">
                Create Product
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
