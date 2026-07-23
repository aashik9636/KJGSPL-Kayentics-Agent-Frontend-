import React, { useState, useEffect } from 'react';
import ChatSidebar from './components/ChatSidebar';
import ChatWindow from './components/ChatWindow';
import { chatService } from '../../services/chatService';
import { toast } from 'react-toastify';

export default function Chat() {
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingSession, setCreatingSession] = useState(false);

  // Fetch conversation history for sidebar
  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await chatService.getConversations();
      setConversations(data?.data || data || []);
    } catch (err) {
      // Non-critical — chat works without history sidebar
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleNewChat = async () => {
    try {
      setCreatingSession(true);
      setActiveSessionId(null);
      const session = await chatService.createChatSession();
      const newSessionId = session.session_id || session.sessionId;
      setActiveSessionId(newSessionId);
      loadConversations();
      return newSessionId;
    } catch (err) {
      console.error('Failed to create chat session', err);
      toast.error('Could not start a new chat. Please try again.');
      return null;
    } finally {
      setCreatingSession(false);
    }
  };

  const handleSelectConversation = (id) => {
    setActiveSessionId(id);
  };

  return (
    <div className="flex h-full w-full bg-[#fdfbfd] p-3 md:p-5 overflow-hidden relative font-sans">
      
      {/* Background Soft Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[50rem] h-[50rem] bg-purple-300/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-pink-300/10 rounded-full blur-[120px]" />
      </div>

      {/* Main Glass Window */}
      <div className="flex flex-1 w-full h-full bg-white/80 backdrop-blur-3xl rounded-[28px] shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-white overflow-hidden relative z-10 transition-all duration-500">
        
        {/* Sidebar - History */}
        {activeSessionId && (
          <div className="w-[280px] flex-shrink-0 border-r border-gray-100/50 bg-[#fafbfc]/50 flex flex-col h-full animate-fade-in">
            <ChatSidebar
              conversations={conversations}
              activeId={activeSessionId}
              onSelect={handleSelectConversation}
              onNewChat={handleNewChat}
              loading={loading}
              creatingSession={creatingSession}
              refreshConversations={loadConversations}
            />
          </div>
        )}

        {/* Main Chat Window */}
        <div className="flex-1 flex flex-col h-full relative bg-transparent">
          <ChatWindow
            activeConversationId={activeSessionId}
            creatingSession={creatingSession}
            onNewChat={handleNewChat}
          />
        </div>
      </div>
    </div>
  );
}
