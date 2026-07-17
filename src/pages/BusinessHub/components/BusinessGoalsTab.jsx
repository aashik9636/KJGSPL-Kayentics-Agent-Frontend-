import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { businessService } from '../../../services/businessService';

export default function BusinessGoalsTab() {
  const [goals, setGoals] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    targetDate: '',
    metric: ''
  });

  const fetchGoals = async () => {
    try {
      const response = await businessService.getBusinessGoals();
      if (response?.data) setGoals(response.data);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        targetDate: new Date(formData.targetDate).toISOString()
      };
      await businessService.createBusinessGoal(payload);
      toast.success('Business goal created successfully!');
      setFormData({ title: '', targetDate: '', metric: '' });
      setShowForm(false);
      fetchGoals();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  if (fetching) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[18px] font-bold text-[#1a1a1a]">Business Goals</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#1a1a1a] text-white px-5 py-2.5 rounded-xl text-[14px] font-bold hover:bg-black transition-all shadow-md"
        >
          {showForm ? 'Cancel' : '+ Add New Goal'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-5 max-w-3xl mb-8">
          <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-4">Create New Goal</h3>
          <div>
            <label className="block text-[13px] font-bold text-[#1a1a1a] mb-2">Goal Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Establish Thought Leadership"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:bg-[#fafbfc] focus:border-[#1a1a1a] text-[#1a1a1a] text-[15px] focus:outline-none transition-all font-medium"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-bold text-[#1a1a1a] mb-2">Target Date</label>
              <input
                type="date"
                name="targetDate"
                value={formData.targetDate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:bg-[#fafbfc] focus:border-[#1a1a1a] text-[#1a1a1a] text-[15px] focus:outline-none transition-all font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#1a1a1a] mb-2">Metric</label>
              <input
                type="text"
                name="metric"
                value={formData.metric}
                onChange={handleChange}
                placeholder="e.g., LinkedIn Impressions > 1M/month"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:bg-[#fafbfc] focus:border-[#1a1a1a] text-[#1a1a1a] text-[15px] focus:outline-none transition-all font-medium"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#1a1a1a] text-white px-6 py-3 rounded-xl font-bold hover:bg-black disabled:bg-gray-400 transition-all text-[14px]"
          >
            {loading ? 'Saving...' : 'Save Goal'}
          </button>
        </form>
      )}

      {goals.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
          No business goals found. Click "Add New Goal" to create one.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => (
          <div key={goal.id || goal._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="font-bold text-[#1a1a1a] text-[16px] mb-2">{goal.title}</h3>
            <div className="flex flex-col gap-2 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold text-gray-500 w-24">Target Date:</span>
                <span className="text-[#1a1a1a] font-medium">{new Date(goal.targetDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold text-gray-500 w-24">Metric:</span>
                <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded-md">{goal.metric}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
