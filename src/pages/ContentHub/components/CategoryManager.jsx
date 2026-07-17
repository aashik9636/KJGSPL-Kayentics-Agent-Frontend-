import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { contentService } from '../../../services/contentService';
import { toast } from 'react-toastify';

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await contentService.listCategories();
      setCategories(data?.data || data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!newCatName.trim()) {
      toast.error("Category name is required.");
      return;
    }
    setSaving(true);
    try {
      await contentService.createCategory({ name: newCatName, description: newCatDesc });
      toast.success("Category created successfully!");
      setIsModalOpen(false);
      setNewCatName('');
      setNewCatDesc('');
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-white border border-[#1a1a1a] text-[#1a1a1a] px-5 py-2.5 rounded-xl font-bold hover:bg-[#1a1a1a] hover:text-white transition-all text-[14px] shadow-sm"
        >
          + New Category
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-[#1a1a1a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-[#fafbfc] rounded-3xl border border-dashed border-gray-200">
          <p className="text-[#666666] font-medium mb-4 text-[15px]">No content categories found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <div key={idx} className="bg-[#fafbfc] rounded-2xl p-6 lg:p-8 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-bold text-[#1a1a1a] mb-2 text-[16px]">{cat.name}</h3>
              <p className="text-[14px] text-[#666666]">{cat.description || 'No description provided.'}</p>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[20px] font-bold text-[#1a1a1a]">Create Category</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-[#1a1a1a] mb-2">Category Name *</label>
                <input 
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Legal Documents"
                  className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white focus:bg-[#fafbfc] focus:border-[#1a1a1a] text-[#1a1a1a] text-[14px] focus:outline-none focus:ring-4 focus:ring-[#1a1a1a]/10 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#1a1a1a] mb-2">Description (Optional)</label>
                <textarea 
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Optional details about this category"
                  rows={3}
                  className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-white focus:bg-[#fafbfc] focus:border-[#1a1a1a] text-[#1a1a1a] text-[14px] focus:outline-none focus:ring-4 focus:ring-[#1a1a1a]/10 transition-all font-medium resize-none"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors text-[14px]"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                disabled={!newCatName.trim() || saving}
                className="bg-[#1a1a1a] text-white px-8 py-3 rounded-xl font-bold hover:bg-black disabled:bg-gray-400 transition-all shadow-md text-[14px]"
              >
                {saving ? 'Saving...' : 'Create'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
