import React, { useState, useEffect } from 'react';
import { schedulerService } from '../../services/schedulerService';
import { toast } from 'react-toastify';

export default function PostScheduler() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Basic calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchPosts = async () => {
    try {
      const data = await schedulerService.getScheduledPosts();
      setPosts(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      toast.error('Failed to load scheduled posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCancelPost = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to cancel this scheduled post?')) return;
    
    try {
      await schedulerService.cancelPost(id);
      toast.success('Scheduled post cancelled');
      fetchPosts();
    } catch (err) {
      // Error handled by interceptor
    }
  };

  // Calendar Helpers
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const daysArray = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - firstDayOfMonth + 1;
    if (dayNumber > 0 && dayNumber <= daysInMonth) {
      return new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
    }
    return null; // Padding days
  });

  const getPostsForDay = (dateObj) => {
    if (!dateObj) return [];
    return posts.filter(post => {
      const postDate = new Date(post.scheduledAt);
      return postDate.getDate() === dateObj.getDate() && 
             postDate.getMonth() === dateObj.getMonth() && 
             postDate.getFullYear() === dateObj.getFullYear();
    });
  };

  const getPlatformIcon = (platform) => {
    switch(platform.toUpperCase()) {
      case 'LINKEDIN': return <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>;
      case 'TWITTER': return <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
      case 'META': return <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>;
      default: return null;
    }
  };

  const getPlatformColor = (platform) => {
    switch(platform.toUpperCase()) {
      case 'LINKEDIN': return 'bg-[#0077b5]';
      case 'TWITTER': return 'bg-black';
      case 'META': return 'bg-[#1877F2]';
      default: return 'bg-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 h-full flex flex-col animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Post Calendar</h1>
          <p className="text-gray-500 text-sm mt-1">Visually manage your upcoming scheduled posts.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white rounded-xl shadow-sm border border-gray-100 p-2">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="font-bold text-[#1a1a1a] min-w-[140px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-[#fafbfc] shrink-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-4 text-center text-[12px] font-bold text-gray-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        
        {/* Days Grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-6 auto-rows-fr">
          {loading ? (
            <div className="col-span-7 row-span-6 flex items-center justify-center">
              <svg className="animate-spin w-8 h-8 text-[#1967d2]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            </div>
          ) : (
            daysArray.map((dateObj, idx) => {
              const dayPosts = getPostsForDay(dateObj);
              const isToday = dateObj && dateObj.toDateString() === new Date().toDateString();

              return (
                <div 
                  key={idx} 
                  className={`min-h-[100px] border-b border-r border-gray-50 p-2 flex flex-col ${
                    !dateObj ? 'bg-gray-50/50' : 'bg-white hover:bg-gray-50 transition-colors'
                  }`}
                >
                  {dateObj && (
                    <>
                      <span className={`text-[12px] font-bold w-7 h-7 flex items-center justify-center rounded-full mb-2 ${
                        isToday ? 'bg-[#1967d2] text-white' : 'text-gray-900'
                      }`}>
                        {dateObj.getDate()}
                      </span>
                      
                      <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto scrollbar-hide">
                        {dayPosts.map(post => (
                          <div 
                            key={post.id} 
                            className="bg-white border border-gray-100 rounded-lg p-2 shadow-sm relative group text-left flex flex-col"
                          >
                            {/* Cancel Button (overlay) */}
                            <button 
                              onClick={(e) => handleCancelPost(post.id, e)}
                              className="absolute top-1 right-1 p-1 bg-red-50 text-red-500 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              title="Cancel Post"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>

                            <div className="flex gap-1 mb-1">
                              {post.platforms.map(p => (
                                <div key={p} className={`w-4 h-4 rounded-full flex items-center justify-center ${getPlatformColor(p)}`} title={p}>
                                  {getPlatformIcon(p)}
                                </div>
                              ))}
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                              {new Date(post.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
