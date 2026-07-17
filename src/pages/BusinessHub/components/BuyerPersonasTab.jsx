import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { businessService } from '../../../services/businessService';

export default function BuyerPersonasTab() {
  const [personas, setPersonas] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    demographics: '',
    painPoints: '',
    goals: '',
    buyingBehavior: ''
  });

  const fetchPersonas = async () => {
    try {
      const response = await businessService.getBuyerPersonas();
      if (response?.data) setPersonas(response.data);
    } catch (error) {
      console.error('Failed to fetch personas:', error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        painPoints: formData.painPoints.split(',').map(s => s.trim()).filter(Boolean),
        goals: formData.goals.split(',').map(s => s.trim()).filter(Boolean)
      };
      await businessService.createBuyerPersona(payload);
      toast.success('Persona created successfully!');
      setFormData({ name: '', demographics: '', painPoints: '', goals: '', buyingBehavior: '' });
      setShowForm(false);
      fetchPersonas();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create persona');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  if (fetching) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[18px] font-bold text-[#1a1a1a]">Saved Personas</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#1a1a1a] text-white px-5 py-2.5 rounded-xl text-[14px] font-bold hover:bg-black transition-all shadow-md"
        >
          {showForm ? 'Cancel' : '+ Add New Persona'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-5 max-w-3xl mb-8">
          <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-4">Create New Persona</h3>
          <div>
            <label className="block text-[13px] font-bold text-[#1a1a1a] mb-2">Persona Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Sarah the CMO"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:bg-[#fafbfc] focus:border-[#1a1a1a] text-[#1a1a1a] text-[15px] focus:outline-none transition-all font-medium"
              required
            />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#1a1a1a] mb-2">Demographics</label>
            <input
              type="text"
              name="demographics"
              value={formData.demographics}
              onChange={handleChange}
              placeholder="CMOs, Tech Companies, 50-200 Employees"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:bg-[#fafbfc] focus:border-[#1a1a1a] text-[#1a1a1a] text-[15px] focus:outline-none transition-all font-medium"
              required
            />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#1a1a1a] mb-2">Pain Points (Comma Separated)</label>
            <input
              type="text"
              name="painPoints"
              value={formData.painPoints}
              onChange={handleChange}
              placeholder="Inconsistent scheduling, High overhead"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:bg-[#fafbfc] focus:border-[#1a1a1a] text-[#1a1a1a] text-[15px] focus:outline-none transition-all font-medium"
              required
            />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#1a1a1a] mb-2">Goals (Comma Separated)</label>
            <input
              type="text"
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              placeholder="Scale output 5x, Increase leads 30%"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:bg-[#fafbfc] focus:border-[#1a1a1a] text-[#1a1a1a] text-[15px] focus:outline-none transition-all font-medium"
              required
            />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#1a1a1a] mb-2">Buying Behavior</label>
            <textarea
              name="buyingBehavior"
              value={formData.buyingBehavior}
              onChange={handleChange}
              placeholder="Strict reviews on data compliance and security"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:bg-[#fafbfc] focus:border-[#1a1a1a] text-[#1a1a1a] text-[15px] focus:outline-none transition-all font-medium h-24 resize-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#1a1a1a] text-white px-6 py-3 rounded-xl font-bold hover:bg-black disabled:bg-gray-400 transition-all text-[14px]"
          >
            {loading ? 'Saving...' : 'Save Persona'}
          </button>
        </form>
      )}

      {personas.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
          No personas found. Click "Add New Persona" to create one.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personas.map((persona) => (
          <div key={persona.id || persona._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl mb-4">
              {persona.name.charAt(0)}
            </div>
            <h3 className="font-bold text-[#1a1a1a] text-[16px] mb-1">{persona.name}</h3>
            {persona.demographics && <p className="text-gray-500 text-[13px] mb-4">{persona.demographics}</p>}
            
            <div className="space-y-3">
              {persona.painPoints?.length > 0 && (
                <div>
                  <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pain Points</h4>
                  <p className="text-[14px] text-[#1a1a1a] line-clamp-2">{persona.painPoints.join(', ')}</p>
                </div>
              )}
              {persona.goals?.length > 0 && (
                <div>
                  <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-1">Goals</h4>
                  <p className="text-[14px] text-[#1a1a1a] line-clamp-2">{persona.goals.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
