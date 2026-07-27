import React, { useState, useEffect, useMemo } from 'react';
import { schedulerService } from '../../services/schedulerService';
import { toast } from 'react-toastify';
import gsap from 'gsap';
import './styles.css';

// Helper to safely parse local date without timezone shifting
function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  if (typeof dateStr === 'string') {
    const cleanStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m, d);
      }
    }
  }
  return new Date(dateStr);
}

export default function PostScheduler() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'list'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [genMode, setGenMode] = useState('custom'); // 'custom' | 'festivals'
  
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: new Date().toISOString().split('T')[0],
    topic: '',
    platform: 'linkedin',
    postType: 'custom_event',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    countryCode: 'US'
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      let res;
      try {
        res = await schedulerService.getCalendarPosts(year, month);
      } catch {
        res = await schedulerService.getScheduledPosts();
      }
      
      let rawPosts = [];
      if (Array.isArray(res)) {
        rawPosts = res;
      } else if (res?.days) {
        rawPosts = res.days.flatMap(d => d.posts || []);
      } else if (res?.data?.days) {
        rawPosts = res.data.days.flatMap(d => d.posts || []);
      } else if (Array.isArray(res?.data)) {
        rawPosts = res.data;
      } else if (Array.isArray(res?.posts)) {
        rawPosts = res.posts;
      }

      const normalized = rawPosts.map(p => ({
        ...p,
        scheduledAt: p.publish_at || p.publishAt || p.event_date || p.eventDate || p.created_at || p.createdAt,
        platform: p.platform || p.platforms?.[0] || 'LinkedIn',
        platforms: p.platforms || [p.platform || 'LinkedIn'],
        content: p.caption || p.content || p.topic || p.event_name || 'Media Post',
      }));

      setPosts(normalized);
    } catch (err) {
      toast.error('Failed to load scheduled posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentDate]);

  useEffect(() => {
    if (!loading) {
      if (viewMode === 'month' || viewMode === 'week') {
        gsap.fromTo('.cal-card', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
        gsap.fromTo('.cal-cell:not(.empty)', { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.35, stagger: { each: 0.008, from: 'start' }, delay: 0.15, ease: 'power1.out' });
      } else if (viewMode === 'list') {
        gsap.fromTo('.sp-post', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' });
      }
    }
  }, [currentDate, loading, viewMode]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      if (genMode === 'custom') {
        if (!formData.topic && !formData.eventName) {
          toast.error('Please enter a topic or event name');
          return;
        }
        await schedulerService.scheduleCustomPost({
          eventName: formData.eventName,
          eventDate: formData.eventDate,
          topic: formData.topic,
          platform: formData.platform,
          postType: formData.postType
        });
        toast.success('Custom post generated successfully');
      } else {
        await schedulerService.schedulePost({
          startDate: formData.startDate,
          endDate: formData.endDate,
          platform: formData.platform,
          countryCode: formData.countryCode
        });
        toast.success('Festival posts batch generated successfully');
      }
      setIsModalOpen(false);
      fetchPosts();
    } catch (err) {
      // Error toast handled by axios response interceptor
    }
  };

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

  const handleApprovePost = async (id, e) => {
    e.stopPropagation();
    try {
      await schedulerService.approvePost(id);
      toast.success('Post approved');
      fetchPosts();
    } catch (err) {
      // Error handled by interceptor
    }
  };

  const handleRejectPost = async (id, e) => {
    e.stopPropagation();
    const feedback = prompt('Please enter feedback for rejection:', 'Needs revisions on caption/hashtags');
    if (!feedback) return;
    try {
      await schedulerService.rejectPost(id, feedback);
      toast.success('Post rejected with feedback');
      fetchPosts();
    } catch (err) {
      // Error handled by interceptor
    }
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const nextTime = () => {
    if (viewMode === 'week') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };
  const prevTime = () => {
    if (viewMode === 'week') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const daysArray = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - firstDayOfMonth + 1;
    if (dayNumber > 0 && dayNumber <= daysInMonth) {
      return new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
    }
    return null;
  });

  const visibleDays = useMemo(() => {
    let lastValidIndex = 0;
    daysArray.forEach((d, i) => { if (d) lastValidIndex = i; });
    const rows = Math.ceil((lastValidIndex + 1) / 7);
    return daysArray.slice(0, rows * 7);
  }, [daysArray]);

  const currentWeekDays = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day; // adjust when day is sunday
    return Array.from({ length: 7 }, (_, i) => {
      return new Date(d.getFullYear(), d.getMonth(), diff + i);
    });
  }, [currentDate]);

  const getPostsForDay = (dateObj) => {
    if (!dateObj) return [];
    return posts.filter(post => {
      const postDate = parseLocalDate(post.scheduledAt);
      if (!postDate) return false;
      return postDate.getDate() === dateObj.getDate() && 
             postDate.getMonth() === dateObj.getMonth() && 
             postDate.getFullYear() === dateObj.getFullYear();
    });
  };

  const getPlatformInfo = (platform) => {
    const p = platform?.toUpperCase() || '';
    if (p === 'LINKEDIN') return { c: 'var(--blue)', label: 'in', name: 'LinkedIn' };
    if (p === 'TWITTER' || p === 'X') return { c: 'var(--ink)', label: 'x', name: 'X' };
    if (p === 'META' || p === 'INSTAGRAM') return { c: 'var(--pink)', label: 'ig', name: 'Instagram' };
    return { c: 'var(--primary)', label: 'p', name: platform || 'Social' };
  };

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'st-approved';
      case 'REJECTED': return 'st-rejected';
      case 'PENDING': return 'st-pending';
      case 'DRAFT': return 'st-draft';
      default: return 'st-scheduled';
    }
  };

  // Group posts by date for List View
  const groupedPosts = useMemo(() => {
    const groups = {};
    posts.forEach(post => {
      const d = parseLocalDate(post.scheduledAt) || new Date();
      const dateKey = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(post);
    });
    return Object.keys(groups).sort((a, b) => new Date(a) - new Date(b)).map(dateKey => ({
      date: dateKey,
      posts: groups[dateKey]
    }));
  }, [posts]);

  // View specific labels
  let timeLabel = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  if (viewMode === 'week') {
    const first = currentWeekDays[0];
    const last = currentWeekDays[6];
    timeLabel = `${monthNames[first.getMonth()]} ${first.getDate()} - ${last.getMonth() !== first.getMonth() ? monthNames[last.getMonth()] + ' ' : ''}${last.getDate()}`;
  }

  const renderPostCard = (post) => {
    const pf = getPlatformInfo(post.platforms?.[0] || post.platform || '');
    const pDate = parseLocalDate(post.scheduledAt);
    const time = pDate ? pDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    return (
      <div key={post.id} className="sp-post">
        <div className="plat">
          <div className="ic" style={{ background: pf.c }}>{pf.label}</div>
          <b>{pf.name}</b>
          {time && <span className="time">{time}</span>}
        </div>
        <p>{post.content || 'Media Post'}</p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className={`sp-status ${getStatusClass(post.status)}`}>
            ● {post.status || 'SCHEDULED'}
          </span>
          <button
            onClick={(e) => handleCancelPost(post.id, e)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted-2)' }}
            title="Delete Post"
          >
            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {(!post.status || post.status === 'PENDING' || post.status === 'DRAFT') && (
          <div className="sp-actions">
            <button className="approve" onClick={(e) => handleApprovePost(post.id, e)}>Approve</button>
            <button className="reject" onClick={(e) => handleRejectPost(post.id, e)}>Reject</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="ps-page-container">
      <div className="cal-main">
        <div className="head-row">
          <div>
            <div className="eyebrow"><span className="ln"></span>Content ops</div>
            <h1>Post Calendar</h1>
            <p>Visually manage every scheduled post across your channels.</p>
          </div>
          <div className="head-actions">
            <div className="view-toggle">
              <button className={viewMode === 'month' ? 'active' : ''} onClick={() => setViewMode('month')}>Month</button>
              <button className={viewMode === 'week' ? 'active' : ''} onClick={() => setViewMode('week')}>Week</button>
              <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>List</button>
            </div>
            <div className="month-nav">
              <button className="arrow" onClick={prevTime}>‹</button>
              <div className="label">{timeLabel}</div>
              <button className="arrow" onClick={nextTime}>›</button>
            </div>
            <button className="new-post-btn" onClick={() => setIsModalOpen(true)}>＋ New post</button>
          </div>
        </div>

        {viewMode !== 'list' && (
          <div className="cal-legend">
            <div className="li"><span className="sw" style={{ background: 'var(--blue)' }}></span>LinkedIn</div>
            <div className="li"><span className="sw" style={{ background: 'var(--pink)' }}></span>Instagram</div>
            <div className="li"><span className="sw" style={{ background: 'var(--ink)' }}></span>X</div>
            <div className="li"><span className="sw" style={{ background: 'var(--accent)' }}></span>Draft</div>
          </div>
        )}

        {(viewMode === 'month' || viewMode === 'week') && (
          <div className="cal-card">
            <div className="cal-headrow">
              <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
            </div>
            <div className={`cal-grid ${viewMode === 'week' ? 'week-grid' : ''}`}>
              {(viewMode === 'month' ? visibleDays : currentWeekDays).map((dateObj, i) => {
                if (!dateObj) {
                  return <div key={i} className="cal-cell empty"></div>;
                }
                const dayPosts = getPostsForDay(dateObj);
                const isToday = dateObj.toDateString() === new Date().toDateString();

                return (
                  <div 
                    key={i} 
                    className={`cal-cell ${isToday ? 'today' : ''} ${viewMode === 'week' ? 'selected' : ''}`}
                    style={viewMode === 'week' ? { background: 'var(--surface)' } : {}}
                  >
                    <span className="daynum">{dateObj.getDate()}</span>
                    <div className="posts-wrap">
                      {viewMode === 'month' ? (
                        <>
                          {dayPosts.slice(0, 2).map(p => {
                            const pf = getPlatformInfo(p.platforms?.[0] || p.platform || '');
                            return (
                              <div key={p.id} className="post-chip" style={{ background: `${pf.c}22`, color: pf.c }}>
                                <span className="d" style={{ background: pf.c }}></span>
                                {p.content ? (p.content.length > 16 ? p.content.slice(0, 16) + '...' : p.content) : 'Post'}
                              </div>
                            );
                          })}
                          {dayPosts.length > 2 && (
                            <div className="more-chip">+{dayPosts.length - 2} more</div>
                          )}
                        </>
                      ) : (
                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {dayPosts.map(post => {
                             const pf = getPlatformInfo(post.platforms?.[0] || post.platform || '');
                             const pDate = parseLocalDate(post.scheduledAt);
                             const time = pDate ? pDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                             return (
                               <div key={post.id} style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg)' }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                   <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: pf.c, color: '#fff', fontSize: '9px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                     {pf.label}
                                   </div>
                                   {time && <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600 }}>{time}</span>}
                                 </div>
                                 <div style={{ fontSize: '11px', color: 'var(--ink)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                   {post.content || 'Media Post'}
                                 </div>
                               </div>
                             );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'list' && (
          <div className="list-view-container">
            {groupedPosts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
                No scheduled posts for this time period.
              </div>
            ) : (
              groupedPosts.map(group => (
                <div key={group.date}>
                  <div className="list-date-header">{group.date}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {group.posts.map(post => renderPostCard(post))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* New Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Generate & Schedule Post</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
                <button 
                  type="button"
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${genMode === 'custom' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                  onClick={() => setGenMode('custom')}
                >
                  Custom Topic / Event
                </button>
                <button 
                  type="button"
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${genMode === 'festivals' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                  onClick={() => setGenMode('festivals')}
                >
                  Batch Festivals
                </button>
              </div>

              <form id="postGenForm" onSubmit={handleCreatePost} className="space-y-4">
                {genMode === 'custom' ? (
                  <>
                    <div>
                      <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Topic / Campaign Prompt *</label>
                      <input type="text" value={formData.topic} onChange={(e) => setFormData({...formData, topic: e.target.value})} placeholder="e.g. Product launch update or Industry insights" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 text-sm transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Event Name</label>
                        <input type="text" value={formData.eventName} onChange={(e) => setFormData({...formData, eventName: e.target.value})} placeholder="e.g. AI Webinar" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 text-sm transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]" />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Scheduled Date</label>
                        <input type="date" value={formData.eventDate} onChange={(e) => setFormData({...formData, eventDate: e.target.value})} required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 text-sm transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Start Date *</label>
                        <input type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 text-sm transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]" />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">End Date *</label>
                        <input type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 text-sm transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Country Code</label>
                      <input type="text" value={formData.countryCode} onChange={(e) => setFormData({...formData, countryCode: e.target.value})} placeholder="e.g. US, IN, GB" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 text-sm transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]" />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[12px] font-bold text-[#6b7280] mb-2 uppercase tracking-wide">Target Platform</label>
                  <select value={formData.platform} onChange={(e) => setFormData({...formData, platform: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 text-sm transition-all outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]">
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram</option>
                    <option value="twitter">X (Twitter)</option>
                  </select>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0 rounded-b-3xl">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-white transition-colors">
                Cancel
              </button>
              <button type="submit" form="postGenForm" className="px-6 py-2.5 rounded-xl bg-[#1967d2] hover:bg-[#1557b0] text-white font-medium text-sm shadow-sm hover:shadow transition-all">
                Generate Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
