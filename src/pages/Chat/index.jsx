import React, { useState, useEffect } from 'react';
import ChatSidebar from './components/ChatSidebar';
import ChatWindow from './components/ChatWindow';
import { chatService } from '../../services/chatService';

export default function Chat() {
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch conversation history
  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await chatService.getConversations();
      // data might be wrapped based on apiClient interceptor, usually data.data or data directly
      setConversations(data?.data || data || []);
    } catch (err) {
      console.error("Failed to load conversations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleSelectConversation = (id) => {
    setActiveConversationId(id);
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
  };

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/60 flex h-full overflow-hidden w-full">
      {/* Sidebar - History */}
      <div className="w-1/4 min-w-[280px] max-w-[320px] border-r border-gray-100 bg-[#fafbfc] flex flex-col h-full">
        <ChatSidebar 
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={handleSelectConversation}
          onNewChat={handleNewChat}
          loading={loading}
          refreshConversations={loadConversations}
        />
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col h-full relative">
        <ChatWindow 
          activeConversationId={activeConversationId}
          onConversationCreated={(newId) => {
            setActiveConversationId(newId);
            loadConversations();
          }}
        />
      </div>
    </div>
  );
}
