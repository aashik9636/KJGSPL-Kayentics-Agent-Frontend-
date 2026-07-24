import React, { useState, useEffect, useMemo } from 'react';
import { schedulerService } from '../../services/schedulerService';
import { toast } from 'react-toastify';
import gsap from 'gsap';
import './styles.css';

export default function PostScheduler() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'list'

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      let data;
      try {
        data = await schedulerService.getCalendarPosts(year, month);
      } catch {
        data = await schedulerService.getScheduledPosts();
      }
      setPosts(Array.isArray(data) ? data : data?.data || []);
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
    if (!confirm('Reject this post?')) return;
    try {
      await schedulerService.rejectPost(id);
      toast.success('Post rejected');
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
    daysArray.forEach((d, i) => { if(d) lastValidIndex = i; });
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
      const postDate = new Date(post.scheduledAt);
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
      const d = new Date(post.scheduledAt);
      const dateKey = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(post);
    });
    return Object.keys(groups).sort((a,b) => new Date(a) - new Date(b)).map(dateKey => ({
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
    const pf = getPlatformInfo(post.platforms?.[0] || '');
    const time = new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (
      <div key={post.id} className="sp-post">
        <div className="plat">
          <div className="ic" style={{ background: pf.c }}>{pf.label}</div>
          <b>{pf.name}</b>
          <span className="time">{time}</span>
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

        {(!post.status || post.status === 'PENDING') && (
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
            <button className="new-post-btn">＋ New post</button>
          </div>
        </div>

        {viewMode !== 'list' && (
          <div className="cal-legend">
            <div className="li"><span className="sw" style={{background: 'var(--blue)'}}></span>LinkedIn</div>
            <div className="li"><span className="sw" style={{background: 'var(--pink)'}}></span>Instagram</div>
            <div className="li"><span className="sw" style={{background: 'var(--ink)'}}></span>X</div>
            <div className="li"><span className="sw" style={{background: 'var(--accent)'}}></span>Draft</div>
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
                             const pf = getPlatformInfo(p.platforms?.[0] || '');
                             return (
                               <div key={p.id} className="post-chip" style={{ background: `${pf.c}22`, color: pf.c }}>
                                 <span className="d" style={{ background: pf.c }}></span>
                                 Post
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
                              const pf = getPlatformInfo(post.platforms?.[0] || '');
                              const time = new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                              return (
                                <div key={post.id} style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: pf.c, color: '#fff', fontSize: '9px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      {pf.label}
                                    </div>
                                    <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600 }}>{time}</span>
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
    </div>
  );
}
