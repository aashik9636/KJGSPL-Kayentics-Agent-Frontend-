import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { businessService } from '../../../services/businessService';

export default function FaqsTab() {
  const [faqs, setFaqs] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    question: '',
    answer: ''
  });

  const fetchFaqs = async () => {
    try {
      const response = await businessService.getFaqs();
      if (response?.data) setFaqs(response.data);
    } catch (error) {
      console.error('Failed to fetch faqs:', error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await businessService.updateFaq(editingId, formData);
        toast.success('FAQ updated successfully!');
      } else {
        await businessService.createFaq(formData);
        toast.success('FAQ created successfully!');
      }
      resetForm();
      fetchFaqs();
    } catch (error) {
      console.error(error);
      toast.error(editingId ? 'Failed to update FAQ' : 'Failed to create FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await businessService.deleteFaq(id);
      toast.success('FAQ deleted');
      fetchFaqs();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete FAQ');
    }
  };

  const handleEdit = (faq) => {
    setFormData({ question: faq.question, answer: faq.answer });
    setEditingId(faq.id || faq._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ question: '', answer: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  if (fetching) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[18px] font-bold text-[#1a1a1a]">Knowledge Base (FAQs)</h2>
        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="bg-[#1a1a1a] text-white px-5 py-2.5 rounded-xl text-[14px] font-bold hover:bg-black transition-all shadow-md"
        >
          {showForm ? 'Cancel' : '+ Add New FAQ'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-5 max-w-3xl mb-8">
          <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-4">
            {editingId ? 'Edit FAQ' : 'Create New FAQ'}
          </h3>
          <div>
            <label className="block text-[13px] font-bold text-[#1a1a1a] mb-2">Question</label>
            <input
              type="text"
              name="question"
              value={formData.question}
              onChange={handleChange}
              placeholder="e.g., What standard security certificates do you support?"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:bg-[#fafbfc] focus:border-[#1a1a1a] text-[#1a1a1a] text-[15px] focus:outline-none transition-all font-medium"
              required
            />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#1a1a1a] mb-2">Answer</label>
            <textarea
              name="answer"
              value={formData.answer}
              onChange={handleChange}
              placeholder="We are SOC2 Type II compliant..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:bg-[#fafbfc] focus:border-[#1a1a1a] text-[#1a1a1a] text-[15px] focus:outline-none transition-all font-medium h-32 resize-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#1a1a1a] text-white px-6 py-3 rounded-xl font-bold hover:bg-black disabled:bg-gray-400 transition-all text-[14px]"
          >
            {loading ? 'Saving...' : 'Save FAQ'}
          </button>
        </form>
      )}

      {faqs.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
          No FAQs found. Click "Add New FAQ" to create one.
        </div>
      )}

      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.id || faq._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between gap-4 group">
            <div className="flex-1">
              <h3 className="font-bold text-[#1a1a1a] text-[15px] mb-2">{faq.question}</h3>
              <p className="text-gray-600 text-[14px] leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(faq)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg h-fit">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
              <button onClick={() => handleDelete(faq.id || faq._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg h-fit">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
