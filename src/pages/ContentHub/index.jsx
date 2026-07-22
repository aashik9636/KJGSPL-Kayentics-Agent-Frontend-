import React, { useState, useEffect } from 'react';
import { contentService } from '../../services/contentService';
import { schedulerService } from '../../services/schedulerService';
import { toast } from 'react-toastify';

export default function ContentHub() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDraftId, setSelectedDraftId] = useState(null);
  
  const [scheduleData, setScheduleData] = useState({
    platforms: [],
    scheduledAt: ''
  });

  const fetchDrafts = async () => {
    try {
      const data = await contentService.getDrafts();
      setDrafts(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      toast.error('Failed to load content drafts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const openScheduleModal = (id) => {
    setSelectedDraftId(id);
    setScheduleData({ platforms: [], scheduledAt: '' });
    setIsScheduleModalOpen(true);
  };

  const togglePlatform = (platform) => {
    setScheduleData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform) 
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (scheduleData.platforms.length === 0) {
      toast.error('Select at least one platform');
      return;
    }
    
    try {
      await schedulerService.schedulePost({
        contentId: selectedDraftId,
        platforms: scheduleData.platforms,
        scheduledAt: new Date(scheduleData.scheduledAt).toISOString()
      });
      toast.success('Post scheduled successfully');
      setIsScheduleModalOpen(false);
    } catch (err) {
      // Error handled by interceptor
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 h-full overflow-y-auto animate-fade-in">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Content Hub</h1>
        <p className="text-gray-500 text-sm mt-1">Review AI-generated drafts and schedule them for publishing.</p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <svg className="animate-spin w-8 h-8 text-[#1967d2]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
        </div>
      ) : drafts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#1967d2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-[16px] font-bold text-gray-900 mb-1">No drafts found</h3>
          <p className="text-gray-500 text-[13px] mb-6 max-w-sm mx-auto">Generate content using the AI Chat to see your drafts appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.map(draft => (
            <div key={draft.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-[320px]">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-50 text-[#1967d2] text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                  Draft
                </span>
                <span className="text-[11px] text-gray-400 font-medium">
                  {new Date(draft.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex-1 overflow-hidden relative mb-4">
                <p className="text-gray-700 text-[14px] leading-relaxed line-clamp-6">{draft.text || draft.content}</p>
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
              </div>

              <button 
                onClick={() => openScheduleModal(draft.id)}
                className="w-full bg-[#fafbfc] hover:bg-gray-100 border border-gray-200 text-[#1a1a1a] font-bold py-2.5 rounded-xl transition-colors text-sm shadow-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Schedule Post
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Schedule Post</h2>
              <button onClick={() => setIsScheduleModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6">
              <form id="scheduleForm" onSubmit={handleScheduleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[12px] font-bold text-[#6b7280] mb-3 uppercase tracking-wide">Select Platforms</label>
                  <div className="flex gap-3">
                    {['LINKEDIN', 'TWITTER', 'META'].map(platform => {
                      const isSelected = scheduleData.platforms.includes(platform);
                      return (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => togglePlatform(platform)}
                          className={`flex-1 py-3 px-2 rounded-xl text-[13px] font-bold border transition-all ${
                            isSelected 
                              ? 'bg-blue-50 border-blue-200 text-[#1967d2] shadow-sm' 
                              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {platform}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Date & Time</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={scheduleData.scheduledAt}
                    onChange={(e) => setScheduleData({...scheduleData, scheduledAt: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 text-sm transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]"
                  />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-white transition-colors">
                Cancel
              </button>
              <button type="submit" form="scheduleForm" className="px-6 py-2.5 rounded-xl bg-[#1967d2] hover:bg-[#1557b0] text-white font-medium text-sm shadow-sm hover:shadow transition-all">
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
