import React, { useState, useEffect, useMemo } from 'react';
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
    lifecycle: 'DEVELOPMENT'
  };

  const [formData, setFormData] = useState(initialFormState);

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
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
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
      lifecycle: product.lifecycle || 'DEVELOPMENT'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) {
      toast.error('Product Name and SKU are required');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
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

      if (editingId) {
        await productService.updateProduct(editingId, payload);
        toast.success('Product updated successfully');
      } else {
        await productService.createProduct(payload);
        toast.success('Product created successfully');
      }
      setIsModalOpen(false);
      setFormData(initialFormState);
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
        return <span className="bg-gray-100 text-gray-500 border border-gray-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">Archived</span>;
      case 'DISCONTINUED':
        return <span className="bg-red-50 text-red-500 border border-red-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">Discontinued</span>;
      default:
        return <span className="bg-purple-50 text-[#6c48ff] border border-purple-100 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">{status || 'Draft'}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 font-sans space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products Catalog</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your offerings, features, and unique selling propositions.</p>
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, SKU, category, or tags..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-900 font-medium outline-none focus:bg-white focus:border-[#6c48ff] transition-all"
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
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#6c48ff] border-t-transparent"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <Package className="w-12 h-12 text-purple-200 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 mb-1 font-['Space_Grotesk']">No Products Found</h3>
          <p className="text-gray-500 text-xs mb-5 max-w-sm mx-auto">
            {searchQuery ? 'No product matches your search filters.' : 'Get started by creating your first product schema for your workspace.'}
          </p>
          <button 
            onClick={openCreateModal}
            className="text-[#6c48ff] font-bold text-xs hover:underline inline-flex items-center gap-1"
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
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all group relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-[16px] leading-tight">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-1 wrap flex-wrap">
                        <span className="inline-block px-2 py-0.5 bg-blue-50 text-[#1967d2] text-[11px] font-bold rounded-md uppercase tracking-wider">
                          SKU: {product.sku}
                        </span>
                        {product.category && (
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-medium rounded-md">
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
                        className="p-1.5 text-gray-400 hover:text-[#6c48ff] rounded-lg hover:bg-purple-50 transition-colors"
                        title="Edit Product"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(product.id, e)} 
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-500 text-[13px] my-3 flex-1">{product.shortDescription || product.longDescription || 'No description provided.'}</p>
                  
                  {product.usp && (
                    <div className="pt-3 border-t border-gray-100 mb-2">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">USP</p>
                      <p className="text-[13px] text-gray-700 font-medium">{product.usp}</p>
                    </div>
                  )}

                  {product.features && (
                    <div className="pt-3 border-t border-gray-100 mb-2">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Key Features</p>
                      <p className="text-[13px] text-gray-600 whitespace-pre-line">{product.features}</p>
                    </div>
                  )}

                  {product.benefits && (
                    <div className="pt-3 border-t border-gray-100 mb-2">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Benefits</p>
                      <p className="text-[13px] text-gray-600 whitespace-pre-line">{product.benefits}</p>
                    </div>
                  )}

                  {/* Resource Links */}
                  {(product.landingPage || product.demoVideo || product.brochure) && (
                    <div className="pt-3 border-t border-gray-100 flex items-center gap-3 text-xs font-semibold text-[#6c48ff]">
                      {product.landingPage && (
                        <a href={product.landingPage} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                          <ExternalLink className="w-3.5 h-3.5" /> Landing
                        </a>
                      )}
                      {product.demoVideo && (
                        <a href={product.demoVideo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                          <Video className="w-3.5 h-3.5" /> Demo
                        </a>
                      )}
                      {product.brochure && (
                        <a href={product.brochure} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                          <FileText className="w-3.5 h-3.5" /> Brochure
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 mt-4 flex items-center justify-between">
                  <div>
                    {getStatusBadge(product.productStatus)}
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{product.lifecycle || 'DEVELOPMENT'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit Product Schema Modal ─────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#6c48ff] flex items-center justify-center font-bold">
                  <Package className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-gray-900 font-['Space_Grotesk']">
                  {editingId ? 'Edit Product Schema' : 'Create New Product'}
                </h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="productForm" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Product Name *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Kaynetics AI Pro" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 text-sm transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">SKU *</label>
                    <input type="text" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} required placeholder="e.g. KAY-AI-001" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 text-sm transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]" />
                  </div>
                </div>

                {/* Category & SubCategory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                      Category
                    </label>
                    <input 
                      type="text" 
                      value={formData.category} 
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                      placeholder="e.g. SaaS Platform" 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 text-xs font-medium outline-none focus:border-[#6c48ff]" 
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                      Sub Category
                    </label>
                    <input 
                      type="text" 
                      value={formData.subCategory} 
                      onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })} 
                      placeholder="e.g. Automation" 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 text-xs font-medium outline-none focus:border-[#6c48ff]" 
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                    Short Description
                  </label>
                  <textarea 
                    value={formData.shortDescription} 
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} 
                    placeholder="Brief overview for search & catalog cards..." 
                    rows="2" 
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 text-xs font-medium outline-none focus:border-[#6c48ff]" 
                  />
                </div>

                {/* Long Description */}
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                    Long Description
                  </label>
                  <textarea 
                    value={formData.longDescription} 
                    onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })} 
                    placeholder="Detailed explanation of the product offering..." 
                    rows="3" 
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 text-xs font-medium outline-none focus:border-[#6c48ff]" 
                  />
                </div>

                {/* Features & Benefits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                      Features List
                    </label>
                    <textarea 
                      value={formData.features} 
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })} 
                      placeholder="- Multi-modal AI generation&#10;- Post scheduling" 
                      rows="3" 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 text-xs font-medium outline-none focus:border-[#6c48ff]" 
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                      Benefits
                    </label>
                    <textarea 
                      value={formData.benefits} 
                      onChange={(e) => setFormData({ ...formData, benefits: e.target.value })} 
                      placeholder="Reduces management overhead by 80%" 
                      rows="3" 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 text-xs font-medium outline-none focus:border-[#6c48ff]" 
                    />
                  </div>
                </div>

                {/* USP & Target Audience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                      Unique Selling Proposition (USP)
                    </label>
                    <input 
                      type="text" 
                      value={formData.usp} 
                      onChange={(e) => setFormData({ ...formData, usp: e.target.value })} 
                      placeholder="e.g. End-to-end autonomous agent workflow" 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 text-xs font-medium outline-none focus:border-[#6c48ff]" 
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                      Target Audience
                    </label>
                    <input 
                      type="text" 
                      value={formData.targetAudience} 
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })} 
                      placeholder="e.g. Agencies, SaaS Founders" 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 text-xs font-medium outline-none focus:border-[#6c48ff]" 
                    />
                  </div>
                </div>

                {/* Tags & SEO Keywords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                      Tags
                    </label>
                    <input 
                      type="text" 
                      value={formData.tags} 
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })} 
                      placeholder="e.g. AI, SaaS, Automation" 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 text-xs font-medium outline-none focus:border-[#6c48ff]" 
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                      SEO Keywords
                    </label>
                    <input 
                      type="text" 
                      value={formData.seoKeywords} 
                      onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })} 
                      placeholder="e.g. AI agent, post scheduler" 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 text-xs font-medium outline-none focus:border-[#6c48ff]" 
                    />
                  </div>
                </div>

                {/* Resource Links (Landing Page, Demo Video, Brochure) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                      Landing Page URL
                    </label>
                    <input 
                      type="url" 
                      value={formData.landingPage} 
                      onChange={(e) => setFormData({ ...formData, landingPage: e.target.value })} 
                      placeholder="https://..." 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 text-xs font-medium outline-none focus:border-[#6c48ff]" 
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                      Demo Video URL
                    </label>
                    <input 
                      type="url" 
                      value={formData.demoVideo} 
                      onChange={(e) => setFormData({ ...formData, demoVideo: e.target.value })} 
                      placeholder="https://..." 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 text-xs font-medium outline-none focus:border-[#6c48ff]" 
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                      Brochure URL
                    </label>
                    <input 
                      type="url" 
                      value={formData.brochure} 
                      onChange={(e) => setFormData({ ...formData, brochure: e.target.value })} 
                      placeholder="https://..." 
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 text-xs font-medium outline-none focus:border-[#6c48ff]" 
                    />
                  </div>
                </div>

                {/* Product Status & Lifecycle Enums */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                      Status
                    </label>
                    <select 
                      value={formData.productStatus} 
                      onChange={(e) => setFormData({ ...formData, productStatus: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 text-xs font-bold outline-none focus:border-[#6c48ff]"
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                      <option value="DISCONTINUED">DISCONTINUED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                      Lifecycle Stage
                    </label>
                    <select 
                      value={formData.lifecycle} 
                      onChange={(e) => setFormData({ ...formData, lifecycle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 text-xs font-bold outline-none focus:border-[#6c48ff]"
                    >
                      <option value="DEVELOPMENT">DEVELOPMENT</option>
                      <option value="INTRODUCTION">INTRODUCTION</option>
                      <option value="GROWTH">GROWTH</option>
                      <option value="MATURITY">MATURITY</option>
                      <option value="DECLINE">DECLINE</option>
                    </select>
                  </div>
                </div>

              </form>
            </div>
            
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0 rounded-b-3xl">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-white transition-colors"
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
        </div>
      )}

    </div>
  );
}
