import { useState, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';

export const useChatStream = () => {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [sources, setSources] = useState([]);
  
  const wsRef = useRef(null);
  
  const connectAndSend = useCallback((sessionId, message) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) {
      setError('Not authenticated');
      return;
    }

    setIsStreaming(true);
    setStatus('Initializing connection...');
    setError(null);
    setSources([]);

    // Add user message to UI
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    
    // Add an empty assistant message that will be populated by the stream
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';
    const socketUrl = `${wsBaseUrl}/conversations/stream?session_id=${sessionId}&token=${accessToken}`;
    const socket = new WebSocket(socketUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      // Send the query payload immediately as per the guide
      socket.send(JSON.stringify({
        message: message
      }));
    };

    socket.onmessage = (event) => {
      try {
        const chunk = JSON.parse(event.data);
        
        switch (chunk.type) {
          case 'status':
            setStatus(chunk.content);
            break;
            
          case 'token':
            setStatus(''); // Clear status when text tokens arrive
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage.role === 'assistant') {
                lastMessage.content += chunk.content;
              }
              return newMessages;
            });
            break;
            
          case 'done':
            setIsStreaming(false);
            setStatus('');
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage.role === 'assistant' && chunk.metadata) {
                lastMessage.metadata = chunk.metadata;
              }
              return newMessages;
            });
            if (chunk.metadata?.sources) {
              setSources(chunk.metadata.sources);
            }
            socket.close();
            break;
            
          case 'error':
            setError(chunk.content || 'An error occurred during generation.');
            setIsStreaming(false);
            setStatus('');
            socket.close();
            break;
            
          default:
            console.warn('Unknown chunk type:', chunk.type);
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message', err);
      }
    };

    socket.onerror = (event) => {
      console.error('WebSocket Error', event);
      setError('Connection error occurred.');
      setIsStreaming(false);
      setStatus('');
    };

    socket.onclose = () => {
      setIsStreaming(false);
    };
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  return {
    messages,
    status,
    isStreaming,
    error,
    sources,
    connectAndSend,
    disconnect
  };
};
