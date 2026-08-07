import { create } from 'zustand';
import { toast } from 'react-toastify';

export const useEventStore = create((set, get) => ({
  ws: null,
  isConnected: false,
  activeJobs: {},
  jobUpdates: {}, // store latest status updates per job

  connect: (token) => {
    if (get().ws || !token) return;

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const defaultWsUrl = apiBaseUrl.replace(/^https:\/\//, 'wss://').replace(/^http:\/\//, 'ws://');
    const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || defaultWsUrl;
    
    // Connect to Global Event Stream
    const socket = new WebSocket(`${wsBaseUrl}/ws/events?token=${token}`);
    set({ ws: socket, isConnected: false }); // Set ws immediately to prevent multiple connections

    socket.onopen = () => {
      console.log('Global Event WebSocket connected');
      set({ isConnected: true });
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { type, sessionId, taskId, status, message, finalAnswer, node, agentSlug } = data;

        const formatAgentName = (slug) => {
          if (!slug) return 'Agent Task';
          if (slug.includes('trend')) return 'Buzz';
          if (slug.includes('stock') || slug.includes('post')) return 'Marc';
          if (slug.includes('research') || slug.includes('content') || slug.includes('planner')) return 'Rea';
          if (slug.includes('market') || slug === 'image-generation') return 'Mia';
          if (slug.includes('lead')) return 'Lea';
          if (slug.includes('recruit')) return 'Joey';
          if (slug.includes('social-media')) return 'Nova';
          if (slug.includes('image-query')) return 'Pixa';
          return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        };

        if (type === 'started') {
          set((state) => ({
            activeJobs: {
              ...state.activeJobs,
              [taskId]: { sessionId, taskId, status, message, node: node || formatAgentName(agentSlug) }
            },
            jobUpdates: { ...state.jobUpdates, [taskId]: data }
          }));
          
          const isChatRoute = window.location.pathname.includes('/chat') || window.location.pathname.match(/\/agents\/.+/);
          if (!isChatRoute) {
            toast.info('Task Started in background! Click to view in chat.', {
              onClick: () => window.location.href = `/chat?session=${sessionId}`,
              autoClose: 5000,
              toastId: taskId
            });
          }
        }

        if (type === 'progress') {
          set((state) => {
            const newJobs = { ...state.activeJobs };
            if (!newJobs[taskId]) {
              newJobs[taskId] = { sessionId, taskId, status, message, node };
            } else {
              newJobs[taskId] = { ...newJobs[taskId], status, message, node };
            }
            return {
              activeJobs: newJobs,
              jobUpdates: { ...state.jobUpdates, [taskId]: data }
            };
          });
        }

        if (type === 'completed' || type === 'failed') {
          set((state) => {
            const newJobs = { ...state.activeJobs };
            delete newJobs[taskId];
            return {
              activeJobs: newJobs,
              jobUpdates: { ...state.jobUpdates, [taskId]: data }
            };
          });

          if (type === 'completed') {
            const isChatRoute = window.location.pathname.includes('/chat') || window.location.pathname.match(/\/agents\/.+/);
            if (!isChatRoute) {
              toast.success('Task Completed! Click here to view results in Chat.', {
                autoClose: false,
                onClick: () => window.location.href = `/chat?session=${sessionId}`
              });
            }
          } else {
            toast.error(`Task failed: ${message || 'Unknown error'}`);
          }
        }
      } catch (err) {
        console.error('Failed to parse global event', err);
      }
    };

    socket.onclose = () => {
      console.log('Global Event WebSocket closed');
      set({ ws: null, isConnected: false });
      
      // Attempt reconnect if still have token (handled outside ideally, or simple timeout)
      setTimeout(() => {
        if (get().ws === null) {
          get().connect(token);
        }
      }, 5000);
    };
    
    socket.onerror = (err) => {
      console.error('Global Event WebSocket error:', err);
    };
  },

  disconnect: () => {
    const { ws } = get();
    if (ws) {
      ws.close();
      set({ ws: null, isConnected: false });
    }
  },

  addActiveJob: (taskId, sessionId, statusText = 'Processing...', node = null) => {
    set((state) => ({
      activeJobs: {
        ...state.activeJobs,
        [taskId]: { taskId, sessionId, status: 'processing', message: statusText, node }
      }
    }));
    
    // Only show "Started" toast if they are NOT currently in the chat module
    const isChatRoute = window.location.pathname.includes('/chat') || window.location.pathname.match(/\/agents\/.+/);
    if (!isChatRoute) {
      toast.info('Task Started in background! Click to view in chat.', {
        onClick: () => {
          window.location.href = `/chat?session=${sessionId}`;
          toast.dismiss(taskId);
        },
        autoClose: false,
        toastId: taskId
      });
    }
  },
  
  removeActiveJob: (taskId) => {
    toast.dismiss(taskId);
    toast.dismiss('bg-task-nav-toast');
    set((state) => {
      const newJobs = { ...state.activeJobs };
      delete newJobs[taskId];
      return { activeJobs: newJobs };
    });
  }
}));
