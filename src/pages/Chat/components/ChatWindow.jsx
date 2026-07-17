import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../../../services/chatService';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ activeConversationId, onConversationCreated }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);

  // Load history when a specific conversation is selected
  const loadHistory = async (id) => {
    try {
      const data = await chatService.getConversationDetails(id);
      // Backend eagerly loads messages inside the conversation object
      setMessages(data?.messages || []);
    } catch (err) {
      console.error("Failed to load chat history", err);
    }
  };

  useEffect(() => {
    if (activeConversationId) {
      setLoadingHistory(true);
      loadHistory(activeConversationId).finally(() => setLoadingHistory(false));
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    
    let sessionId = activeConversationId;
    const userMessage = input;
    setInput('');
    setIsSending(true);

    try {
      if (!sessionId) {
        // Create new conversation
        const response = await chatService.createConversation({ 
          title: userMessage.slice(0, 30) + '...', 
          agentId: 'default' 
        });
        sessionId = response?.id || response?.sessionId;
        if (sessionId && onConversationCreated) {
          onConversationCreated(sessionId);
        }
      }

      if (sessionId) {
        // Optimistically add user message to UI
        setMessages(prev => [...prev, { role: 'USER', content: userMessage }]);

        // 1. Send message to backend (triggers Python agent)
        await chatService.appendMessage({
          conversationId: sessionId,
          role: 'USER',
          content: userMessage
        });

        // 2. Re-fetch the conversation details to get the Assistant's reply
        await loadHistory(sessionId);
      }
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-6" ref={scrollRef}>
        {loadingHistory && messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-[#1a1a1a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <p className="font-bold text-[20px] text-[#1a1a1a] mb-2">How can I help you today?</p>
            <p className="font-medium text-[14px]">Select an agent or ask me anything to get started.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <MessageBubble key={msg.id || idx} message={msg} />
          ))
        )}

        {isSending && (
          <div className="flex justify-start">
            <div className="bg-[#fafbfc] text-[#1a1a1a] font-medium text-[13px] px-5 py-3 rounded-[16px] rounded-tl-[4px] border border-gray-100 flex items-center gap-3 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1a1a1a]"></span>
              </span>
              Agent is typing...
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6 lg:px-10 lg:pb-10 lg:pt-4 bg-white border-t border-transparent bg-gradient-to-t from-white via-white to-transparent">
        <form onSubmit={handleSubmit} className="flex gap-3 relative max-w-4xl mx-auto w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending}
            placeholder="Ask Kaynetics..."
            className="flex-1 px-6 py-4 rounded-[16px] border border-gray-200 bg-[#fafbfc] focus:bg-white focus:border-[#1a1a1a] text-[#1a1a1a] text-[15px] focus:outline-none focus:ring-4 focus:ring-[#1a1a1a]/10 transition-all placeholder:text-gray-400 font-medium shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
          />
          <button 
            type="submit" 
            disabled={isSending || !input.trim()}
            className="bg-[#1a1a1a] hover:bg-black disabled:bg-gray-400 text-white px-8 py-4 rounded-[16px] font-bold transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#1a1a1a]/20 flex items-center justify-center min-w-[120px]"
          >
            {isSending ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span className="flex items-center gap-2">
                Send <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
