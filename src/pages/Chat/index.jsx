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
      console.error('Failed to load conversations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  /**
   * "New Chat" button clicked:
   * 1. Call POST /api/chat/new  →  get session_id
   * 2. Store session_id so ChatWindow can use it for /api/chat/orchestrator
   */
  const handleNewChat = async () => {
    try {
      setCreatingSession(true);
      // Reset window immediately so UI feels responsive
      setActiveSessionId(null);

      const session = await chatService.createChatSession();
      const newSessionId = session.session_id || session.sessionId;

      setActiveSessionId(newSessionId);
      // Refresh sidebar so the new session appears in the history list
      loadConversations();
    } catch (err) {
      console.error('Failed to create chat session', err);
      toast.error('Could not start a new chat. Please try again.');
    } finally {
      setCreatingSession(false);
    }
  };

  const handleSelectConversation = (id) => {
    setActiveSessionId(id);
  };

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/60 flex h-full overflow-hidden w-full">
      {/* Sidebar - History */}
      <div className="w-1/4 min-w-[280px] max-w-[320px] border-r border-gray-100 bg-[#fafbfc] flex flex-col h-full">
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

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col h-full relative">
        <ChatWindow
          activeConversationId={activeSessionId}
          creatingSession={creatingSession}
        />
      </div>
    </div>
  );
}
