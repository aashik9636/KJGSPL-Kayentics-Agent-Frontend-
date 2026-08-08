import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { productService } from '../../services/productService';
import { 
  Package, Plus, Search, Edit3, Trash2, CheckCircle2, X, ExternalLink, Video, FileText 
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [submitting, setSubmitting] = useState(false);

  const initialFormState = {
    name: '',
    sku: '',
    category: '',
    subCategory: '',
    shortDescription: '',
    longDescription: '',
    usp: '',
    targetAudience: '',
    features: '',
    benefits: '',
    tags: '',
    seoKeywords: '',
    brochure: '',
    demoVideo: '',
    landingPage: '',
    productStatus: 'DRAFT',
    lifecycle: 'DEVELOPMENT',
    icp: {
      companySize: '',
      numberOfEmployees: '',
      industry: ''
    }
  };

  const [formData, setFormData] = useState(initialFormState);
  const [showIcp, setShowIcp] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      toast.error('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setShowIcp(false);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    const existingIcp = product.icp || { companySize: '', numberOfEmployees: '', industry: '' };
    const hasAdvancedData = Boolean(
      product.category ||
      product.subCategory ||
      product.longDescription ||
      product.usp ||
      product.targetAudience ||
      product.features ||
      product.benefits ||
      product.tags ||
      product.seoKeywords ||
      product.brochure ||
      product.demoVideo ||
      product.landingPage ||
      existingIcp.companySize ||
      existingIcp.numberOfEmployees ||
      existingIcp.industry
    );
    setFormData({
      name: product.name || '',
      sku: product.sku || '',
      category: product.category || '',
      subCategory: product.subCategory || '',
      shortDescription: product.shortDescription || product.description || '',
      longDescription: product.longDescription || '',
      usp: product.usp || '',
      targetAudience: product.targetAudience || '',
      features: product.features || '',
      benefits: product.benefits || '',
      tags: product.tags || '',
      seoKeywords: product.seoKeywords || '',
      brochure: product.brochure || '',
      demoVideo: product.demoVideo || '',
      landingPage: product.landingPage || '',
      productStatus: product.productStatus || 'DRAFT',
      lifecycle: product.lifecycle || 'DEVELOPMENT',
      icp: {
        companySize: existingIcp.companySize || '',
        numberOfEmployees: existingIcp.numberOfEmployees !== undefined && existingIcp.numberOfEmployees !== null ? String(existingIcp.numberOfEmployees) : '',
        industry: existingIcp.industry || ''
      }
    });
    setShowIcp(hasAdvancedData);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Product Name is required');
      return;
    }
    let finalSku = formData.sku.trim();
    if (!finalSku) {
      const cleanName = formData.name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      const prefix = cleanName.slice(0, 4) || 'KAY';
      const rand = Math.floor(1000 + Math.random() * 9000);
      finalSku = `${prefix}-${rand}`;
    }
    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        sku: finalSku,
        category: formData.category.trim() || undefined,
        subCategory: formData.subCategory.trim() || undefined,
        shortDescription: formData.shortDescription.trim() || undefined,
        longDescription: formData.longDescription.trim() || undefined,
        usp: formData.usp.trim() || undefined,
        targetAudience: formData.targetAudience.trim() || undefined,
        features: formData.features.trim() || undefined,
        benefits: formData.benefits.trim() || undefined,
        tags: formData.tags.trim() || undefined,
        seoKeywords: formData.seoKeywords.trim() || undefined,
        brochure: formData.brochure.trim() || undefined,
        demoVideo: formData.demoVideo.trim() || undefined,
        landingPage: formData.landingPage.trim() || undefined,
        productStatus: formData.productStatus || 'DRAFT',
        lifecycle: formData.lifecycle || 'DEVELOPMENT',
      };

      if (showIcp || (formData.icp?.companySize || formData.icp?.numberOfEmployees || formData.icp?.industry)) {
        const icpObj = {};
        if (formData.icp?.companySize?.trim()) icpObj.companySize = formData.icp.companySize.trim();
        if (formData.icp?.numberOfEmployees !== '' && formData.icp?.numberOfEmployees !== undefined && formData.icp?.numberOfEmployees !== null) {
          const empStr = String(formData.icp.numberOfEmployees).trim();
          icpObj.numberOfEmployees = !isNaN(Number(empStr)) && empStr !== '' ? Number(empStr) : empStr;
        }
        if (formData.icp?.industry?.trim()) icpObj.industry = formData.icp.industry.trim();
        if (Object.keys(icpObj).length > 0) {
          payload.icp = icpObj;
        }
      }

      if (editingId) {
        await productService.updateProduct(editingId, payload);
        toast.success('Product updated successfully');
      } else {
        await productService.createProduct(payload);
        toast.success('Product created successfully');
      }
      setIsModalOpen(false);
      setFormData(initialFormState);
      setShowIcp(false);
      fetchProducts();
    } catch (err) {
      toast.error(editingId ? 'Failed to update product' : 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = !searchQuery.trim() || 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || p.productStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">Active</span>;
      case 'DRAFT':
        return <span className="bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">Draft</span>;
      case 'ARCHIVED':
        return <span className="bg-neutral-100 text-neutral-500 border border-neutral-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">Archived</span>;
      case 'DISCONTINUED':
        return <span className="bg-red-50 text-red-500 border border-red-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">Discontinued</span>;
      default:
        return <span className="bg-purple-50 text-[#6c48ff] border border-purple-100 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">{status || 'Draft'}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 font-sans space-y-6 animate-fade-in">
      <style>{`
        .product-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 35px rgba(108, 72, 255, 0.12);
          border-color: rgba(108, 72, 255, 0.3) !important;
        }
        .product-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #6c48ff, #8b5cf6, #ec4899);
          opacity: 0;
          transition: opacity 0.3s;
          border-top-left-radius: 1rem;
          border-top-right-radius: 1rem;
        }
        .product-card:hover::before {
          opacity: 1;
        }
        .icp-banner {
          background: linear-gradient(135deg, rgba(108, 72, 255, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%);
          border: 1px dashed rgba(108, 72, 255, 0.25);
          transition: all 0.2s ease;
        }
        .icp-banner:hover {
          background: linear-gradient(135deg, rgba(108, 72, 255, 0.06) 0%, rgba(139, 92, 246, 0.06) 100%);
          border-color: rgba(108, 72, 255, 0.45) !important;
          box-shadow: 0 4px 15px rgba(108, 72, 255, 0.05);
        }
        .modal-glass {
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          background-color: rgba(255, 255, 255, 0.9) !important;
          border: 1px solid rgba(209, 213, 219, 0.3);
        }
        .dark .modal-glass {
          background-color: rgba(17, 17, 17, 0.9) !important;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .premium-input {
          transition: all 0.2s ease-in-out;
        }
        .premium-input:focus {
          border-color: #6c48ff !important;
          box-shadow: 0 0 0 4px rgba(108, 72, 255, 0.12) !important;
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .clamped-text {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Products Catalog</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Manage your offerings, features, and unique selling propositions.</p>
        </div>

        <button 
          onClick={openCreateModal}
          className="px-5 py-3 rounded-2xl bg-[#6c48ff] hover:bg-[#5b3adb] text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Controls Bar: Search & Status Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#111111] p-4 rounded-2xl border border-neutral-100 dark:border-[#262626] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, SKU, category, or tags..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-100 dark:border-[#333333] text-xs text-neutral-900 dark:text-white font-medium outline-none focus:bg-white dark:focus:bg-[#1f2333] focus:border-neutral-400 dark:focus:border-neutral-500 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-hide">
          {['ALL', 'DRAFT', 'ACTIVE', 'ARCHIVED', 'DISCONTINUED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st 
                  ? 'bg-[#6c48ff] text-white shadow-sm' 
                  : 'bg-neutral-50 dark:bg-[#1a1a1a] text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#25293b] hover:text-neutral-800 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-[#111111] rounded-2xl p-5 border border-neutral-100 dark:border-[#262626] shadow-sm animate-pulse flex flex-col h-[280px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-[#222222]"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-200 dark:bg-[#222222] rounded w-1/2"></div>
                  <div className="h-3 bg-neutral-100 dark:bg-[#1a1a1a] rounded w-1/3"></div>
                </div>
              </div>
              <div className="space-y-2 mb-6">
                <div className="h-3 bg-neutral-100 dark:bg-[#1a1a1a] rounded w-full"></div>
                <div className="h-3 bg-neutral-100 dark:bg-[#1a1a1a] rounded w-5/6"></div>
                <div className="h-3 bg-neutral-100 dark:bg-[#1a1a1a] rounded w-4/6"></div>
              </div>
              <div className="mt-auto flex justify-between items-center">
                <div className="h-6 w-16 bg-neutral-200 dark:bg-[#222222] rounded-full"></div>
                <div className="h-8 w-8 bg-neutral-200 dark:bg-[#222222] rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-[#111111] rounded-2xl p-12 text-center border border-neutral-100 dark:border-[#262626] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <Package className="w-12 h-12 text-purple-200 dark:text-purple-900/60 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1 font-['Space_Grotesk']">No Products Found</h3>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-5 max-w-sm mx-auto">
            {searchQuery ? 'No product matches your search filters.' : 'Get started by creating your first product schema for your workspace.'}
          </p>
          <button 
            onClick={openCreateModal}
            className="text-[#6c48ff] dark:text-purple-400 font-bold text-xs hover:underline inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Product</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => {
            return (
              <div 
                key={product.id} 
                className="bg-white dark:bg-[#111111] rounded-2xl p-6 border border-neutral-100 dark:border-[#262626] shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all group relative flex flex-col justify-between product-card h-full"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-bold text-neutral-900 dark:text-white text-[16px] leading-tight">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-1 wrap flex-wrap">
                        <span className="inline-block px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-[#1967d2] dark:text-blue-300 text-[11px] font-bold rounded-md uppercase tracking-wider">
                          SKU: {product.sku}
                        </span>
                        {product.category && (
                          <span className="inline-block px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[11px] font-medium rounded-md">
                            {product.category}
                          </span>
                        )}
                        {product.subCategory && (
                          <span className="inline-block px-2 py-0.5 bg-purple-50 text-[#6c48ff] text-[11px] font-medium rounded-md">
                            {product.subCategory}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={() => openEditModal(product)} 
                        className="p-1.5 text-neutral-400 hover:text-[#6c48ff] rounded-lg hover:bg-purple-50 transition-colors"
                        title="Edit Product"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(product.id, e)} 
                        className="p-1.5 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className={`text-neutral-500 dark:text-neutral-400 text-[13px] my-3 flex-1 ${!expandedCards[product.id] ? 'clamped-text' : ''}`}>
                    {product.shortDescription || product.longDescription || 'No description provided.'}
                  </p>

                  {/* Expanded Content Toggle block */}
                  {expandedCards[product.id] && (
                    <div className="space-y-3.5 mt-3 pt-3.5 border-t border-neutral-100 dark:border-[#262626] animate-fade-in">
                      {product.usp && (
                        <div>
                          <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">USP</p>
                          <p className="text-[13px] text-neutral-700 dark:text-neutral-300 font-medium italic">"{product.usp}"</p>
                        </div>
                      )}

                      {product.icp && (product.icp.industry || product.icp.companySize || product.icp.numberOfEmployees) && (
                        <div className="pt-3 border-t border-neutral-100 dark:border-[#262626]">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="px-2 py-0.5 bg-[#6c48ff]/10 dark:bg-purple-950/60 text-[#6c48ff] dark:text-purple-300 text-[10px] font-extrabold rounded uppercase tracking-wider">
                              ICP
                            </span>
                            <span className="text-[12px] font-bold text-neutral-800 dark:text-neutral-200">
                              {product.icp.industry || 'Ideal Customer Profile'}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                            {product.icp.companySize && <span className="px-2 py-0.5 bg-neutral-50 dark:bg-white/5 rounded border border-neutral-100 dark:border-neutral-800">Size: {product.icp.companySize}</span>}
                            {product.icp.numberOfEmployees && <span className="px-2 py-0.5 bg-neutral-50 dark:bg-white/5 rounded border border-neutral-100 dark:border-neutral-800">{product.icp.numberOfEmployees} employees</span>}
                          </div>
                        </div>
                      )}

                      {product.features && (
                        <div className="pt-3 border-t border-neutral-100 dark:border-[#262626]">
                          <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">Key Features</p>
                          <p className="text-[12px] text-neutral-600 dark:text-neutral-400 whitespace-pre-line leading-relaxed">{product.features}</p>
                        </div>
                      )}

                      {product.benefits && (
                        <div className="pt-3 border-t border-neutral-100 dark:border-[#262626]">
                          <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">Benefits</p>
                          <p className="text-[12px] text-neutral-600 dark:text-neutral-400 whitespace-pre-line leading-relaxed">{product.benefits}</p>
                        </div>
                      )}

                      {/* Resource Links */}
                      {(product.landingPage || product.demoVideo || product.brochure) && (
                        <div className="pt-3.5 border-t border-neutral-100 dark:border-[#262626] flex flex-wrap gap-2 text-[11px] font-bold">
                          {product.landingPage && (
                            <a href={product.landingPage} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 text-[#1967d2] dark:text-blue-300 border border-blue-100 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-colors">
                              <ExternalLink className="w-3.5 h-3.5" /> Landing Page
                            </a>
                          )}
                          {product.demoVideo && (
                            <a href={product.demoVideo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-300 border border-amber-100 dark:border-amber-900/40 hover:bg-amber-100 dark:hover:bg-amber-950/40 transition-colors">
                              <Video className="w-3.5 h-3.5" /> Demo Video
                            </a>
                          )}
                          {product.brochure && (
                            <a href={product.brochure} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 text-[#6c48ff] dark:text-purple-300 border border-purple-100 dark:border-purple-900/40 hover:bg-purple-100 dark:hover:bg-purple-950/40 transition-colors">
                              <FileText className="w-3.5 h-3.5" /> Brochure PDF
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Show/Hide details button inside card */}
                <div className="mt-3.5 pt-3.5 border-t border-neutral-100 dark:border-[#262626]">
                  <button
                    type="button"
                    onClick={() => setExpandedCards(prev => ({ ...prev, [product.id]: !prev[product.id] }))}
                    className="w-full py-2 rounded-xl bg-neutral-50 dark:bg-[#1a1a1a] hover:bg-neutral-100 dark:hover:bg-[#222222] text-neutral-600 dark:text-neutral-400 text-xs font-bold border border-neutral-100 dark:border-[#262626] transition-colors flex items-center justify-center gap-1"
                  >
                    <span>{expandedCards[product.id] ? 'Show Less' : 'Show Details'}</span>
                  </button>
                </div>

                <div className="pt-3 border-t border-neutral-100 dark:border-[#262626] mt-4 flex items-center justify-between">
                  <div>
                    {getStatusBadge(product.productStatus)}
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">{product.lifecycle || 'DEVELOPMENT'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit Product Schema Modal ─────────────────────────────── */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-neutral-900/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] modal-glass animate-scale-in">
            
            <div className="px-6 py-4 border-b border-neutral-100 dark:border-[#262626] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-[#1a1a1a] text-neutral-500 dark:text-neutral-400 flex items-center justify-center font-bold">
                  <Package className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-white font-['Space_Grotesk']">
                  {editingId ? 'Edit Product Schema' : 'Create New Product'}
                </h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="productForm" onSubmit={handleSubmit} className="space-y-5">
                {/* First Row: Product Name & Short Description */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-[#6b7280] dark:text-neutral-400 mb-2 uppercase tracking-wide">Product Name *</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      required 
                      placeholder="e.g. Kaynetics AI Pro" 
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-[#333333] bg-[#f9fafb] dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#262626] text-neutral-900 dark:text-white text-sm transition-all outline-none premium-input" 
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#6b7280] dark:text-neutral-400 mb-2 uppercase tracking-wide">Short Description</label>
                    <input 
                      type="text" 
                      value={formData.shortDescription} 
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} 
                      placeholder="Brief overview..." 
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-[#333333] bg-[#f9fafb] dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#262626] text-neutral-900 dark:text-white text-sm transition-all outline-none premium-input" 
                    />
                  </div>
                </div>

                {/* ICP Section (Ideal Customer Profile) / Toggle button */}
                {!showIcp ? (
                  <div 
                    onClick={() => setShowIcp(true)}
                    className="p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all icp-banner cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#6c48ff]/20 text-[#6c48ff] dark:text-purple-300 border border-[#6c48ff]/30 flex items-center justify-center font-extrabold text-xs shadow-inner shrink-0">
                        ICP
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                          Ideal Customer Profile (ICP) & Advanced Fields
                        </h4>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Click to show all advanced fields, categories, links, status, and Ideal Customer Profile.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6c48ff] to-[#8b5cf6] text-white text-xs font-bold hover:shadow-[0_0_15px_rgba(108,72,255,0.4)] transition-all flex items-center gap-1.5 shrink-0 transform hover:-translate-y-0.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Configure ICP & More</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5 animate-fade-in">
                    
                    {/* SKU, Category & SubCategory */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                          SKU *
                        </label>
                        <input 
                          type="text" 
                          value={formData.sku} 
                          onChange={(e) => setFormData({...formData, sku: e.target.value})} 
                          placeholder="e.g. KAY-AI-001" 
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-[#333333] bg-neutral-50 dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#262626] text-neutral-900 dark:text-white text-xs font-medium outline-none focus:border-neutral-400 dark:focus:border-neutral-500" 
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                          Category
                        </label>
                        <input 
                          type="text" 
                          value={formData.category} 
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                          placeholder="e.g. SaaS Platform" 
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-[#333333] bg-neutral-50 dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#262626] text-neutral-900 dark:text-white text-xs font-medium outline-none focus:border-neutral-400 dark:focus:border-neutral-500" 
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                          Sub Category
                        </label>
                        <input 
                          type="text" 
                          value={formData.subCategory} 
                          onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })} 
                          placeholder="e.g. Automation" 
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-[#333333] bg-neutral-50 dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#262626] text-neutral-900 dark:text-white text-xs font-medium outline-none focus:border-neutral-400 dark:focus:border-neutral-500" 
                        />
                      </div>
                    </div>

                    {/* Long Description */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                        Long Description
                      </label>
                      <textarea 
                        value={formData.longDescription} 
                        onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })} 
                        placeholder="Detailed explanation of the product offering..." 
                        rows="3" 
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-[#333333] bg-neutral-50 dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#262626] text-neutral-900 dark:text-white text-xs font-medium outline-none focus:border-neutral-400 dark:focus:border-neutral-500" 
                      />
                    </div>

                    {/* Features & Benefits */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                          Features List
                        </label>
                        <textarea 
                          value={formData.features} 
                          onChange={(e) => setFormData({ ...formData, features: e.target.value })} 
                          placeholder="- Multi-modal AI generation&#10;- Post scheduling" 
                          rows="3" 
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-[#333333] bg-neutral-50 dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#262626] text-neutral-900 dark:text-white text-xs font-medium outline-none focus:border-neutral-400 dark:focus:border-neutral-500" 
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                          Benefits
                        </label>
                        <textarea 
                          value={formData.benefits} 
                          onChange={(e) => setFormData({ ...formData, benefits: e.target.value })} 
                          placeholder="Reduces management overhead by 80%" 
                          rows="3" 
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-[#333333] bg-neutral-50 dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#262626] text-neutral-900 dark:text-white text-xs font-medium outline-none focus:border-neutral-400 dark:focus:border-neutral-500" 
                        />
                      </div>
                    </div>

                    {/* USP & Target Audience */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                          Unique Selling Proposition (USP)
                        </label>
                        <input 
                          type="text" 
                          value={formData.usp} 
                          onChange={(e) => setFormData({ ...formData, usp: e.target.value })} 
                          placeholder="e.g. End-to-end autonomous agent workflow" 
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-[#333333] bg-neutral-50 dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#262626] text-neutral-900 dark:text-white text-xs font-medium outline-none focus:border-neutral-400 dark:focus:border-neutral-500" 
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                          Target Audience
                        </label>
                        <input 
                          type="text" 
                          value={formData.targetAudience} 
                          onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })} 
                          placeholder="e.g. Agencies, SaaS Founders" 
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-[#333333] bg-neutral-50 dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#262626] text-neutral-900 dark:text-white text-xs font-medium outline-none focus:border-neutral-400 dark:focus:border-neutral-500" 
                        />
                      </div>
                    </div>

                    {/* Tags & SEO Keywords */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                          Tags
                        </label>
                        <input 
                          type="text" 
                          value={formData.tags} 
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })} 
                          placeholder="e.g. AI, SaaS, Automation" 
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-[#333333] bg-neutral-50 dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#262626] text-neutral-900 dark:text-white text-xs font-medium outline-none focus:border-neutral-400 dark:focus:border-neutral-500" 
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                          SEO Keywords
                        </label>
                        <input 
                          type="text" 
                          value={formData.seoKeywords} 
                          onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })} 
                          placeholder="e.g. AI agent, post scheduler" 
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-[#333333] bg-neutral-50 dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#262626] text-neutral-900 dark:text-white text-xs font-medium outline-none focus:border-neutral-400 dark:focus:border-neutral-500" 
                        />
                      </div>
                    </div>

                    {/* Resource Links (Landing Page, Demo Video, Brochure) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                          Landing Page URL
                        </label>
                        <input 
                          type="url" 
                          value={formData.landingPage} 
                          onChange={(e) => setFormData({ ...formData, landingPage: e.target.value })} 
                          placeholder="https://..." 
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-[#333333] bg-neutral-50 dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#262626] text-neutral-900 dark:text-white text-xs font-medium outline-none focus:border-neutral-400 dark:focus:border-neutral-500" 
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                          Demo Video URL
                        </label>
                        <input 
                          type="url" 
                          value={formData.demoVideo} 
                          onChange={(e) => setFormData({ ...formData, demoVideo: e.target.value })} 
                          placeholder="https://..." 
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-[#333333] bg-neutral-50 dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#262626] text-neutral-900 dark:text-white text-xs font-medium outline-none focus:border-neutral-400 dark:focus:border-neutral-500" 
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                          Brochure URL
                        </label>
                        <input 
                          type="url" 
                          value={formData.brochure} 
                          onChange={(e) => setFormData({ ...formData, brochure: e.target.value })} 
                          placeholder="https://..." 
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-[#333333] bg-neutral-50 dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#262626] text-neutral-900 dark:text-white text-xs font-medium outline-none focus:border-neutral-400 dark:focus:border-neutral-500" 
                        />
                      </div>
                    </div>

                    {/* Product Status & Lifecycle Enums */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                          Status
                        </label>
                        <select 
                          value={formData.productStatus} 
                          onChange={(e) => setFormData({ ...formData, productStatus: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-[#333333] bg-neutral-50 dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#262626] text-neutral-900 dark:text-white text-xs font-bold outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                        >
                          <option value="DRAFT">DRAFT</option>
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                          <option value="DISCONTINUED">DISCONTINUED</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                          Lifecycle Stage
                        </label>
                        <select 
                          value={formData.lifecycle} 
                          onChange={(e) => setFormData({ ...formData, lifecycle: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-[#333333] bg-neutral-50 dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#262626] text-neutral-900 dark:text-white text-xs font-bold outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                        >
                          <option value="DEVELOPMENT">DEVELOPMENT</option>
                          <option value="INTRODUCTION">INTRODUCTION</option>
                          <option value="GROWTH">GROWTH</option>
                          <option value="MATURITY">MATURITY</option>
                          <option value="DECLINE">DECLINE</option>
                        </select>
                      </div>
                    </div>

                    {/* ICP Details Section */}
                    <div className="space-y-4 bg-gradient-to-br from-purple-900/10 via-neutral-50/50 dark:via-[#1a1a1a] to-indigo-900/10 p-5 rounded-2xl border border-purple-500/30 animate-fade-in relative shadow-md">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-xs font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span> Ideal Customer Profile (ICP)
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setShowIcp(false);
                          }}
                          className="text-[11px] text-neutral-400 hover:text-rose-500 transition-colors font-medium flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5"
                        >
                          <X className="w-3.5 h-3.5" /> Collapse Advanced Fields
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Company Size */}
                        <div>
                          <label className="block text-[11px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                            Company Size
                          </label>
                          <select
                            value={formData.icp?.companySize || ''}
                            onChange={(e) => setFormData({ ...formData, icp: { ...formData.icp, companySize: e.target.value } })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-[#333333] bg-white dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#262626] text-neutral-900 dark:text-white text-xs font-medium outline-none focus:border-neutral-400 dark:focus:border-neutral-500 cursor-pointer"
                          >
                            <option value="">Select Company Size</option>
                            <option value="1-10">1 - 10 employees</option>
                            <option value="11-50">11 - 50 employees</option>
                            <option value="51-200">51 - 200 employees</option>
                            <option value="201-500">201 - 500 employees</option>
                            <option value="500-1000">500 - 1000 employees</option>
                            <option value="1000+">1000+ employees</option>
                          </select>
                        </div>

                        {/* Number of Employees */}
                        <div>
                          <label className="block text-[11px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                            Number of Employees
                          </label>
                          <input
                            type="text"
                            value={formData.icp?.numberOfEmployees || ''}
                            onChange={(e) => setFormData({ ...formData, icp: { ...formData.icp, numberOfEmployees: e.target.value } })}
                            placeholder="e.g. 120 or 100-500"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-[#333333] bg-white dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#262626] text-neutral-900 dark:text-white text-xs font-medium outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                          />
                        </div>

                        {/* Target Industry */}
                        <div>
                          <label className="block text-[11px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                            Target Industry
                          </label>
                          <input
                            type="text"
                            value={formData.icp?.industry || ''}
                            onChange={(e) => setFormData({ ...formData, icp: { ...formData.icp, industry: e.target.value } })}
                            placeholder="e.g. SaaS / B2B Operations"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-[#333333] bg-white dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#262626] text-neutral-900 dark:text-white text-xs font-medium outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
            
            <div className="p-5 border-t border-neutral-100 dark:border-[#262626] bg-neutral-50 dark:bg-[#171717] flex justify-end gap-3 shrink-0 rounded-b-3xl">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-[#333333] text-neutral-600 dark:text-neutral-300 font-bold text-xs hover:bg-white dark:hover:bg-[#262626] transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="productForm" 
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-[#6c48ff] hover:bg-[#5b3adb] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{editingId ? 'Save Changes' : 'Create Product'}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
