import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import RightSidebar from './components/RightSidebar';
import ChatWindow from './components/ChatWindow';
import { chatService } from '../../../services/chatService';
import { toast } from 'react-toastify';

export default function AgentsChat() {
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingSession, setCreatingSession] = useState(false);
  const [activeTab, setActiveTab] = useState(null); // null (closed), 'history', 'agents', 'settings'
  const [selectedAgent, setSelectedAgent] = useState('brain');
  const hasAutoStarted = useRef(false);
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const lastProcessedNewChat = useRef(null);

  // Fetch conversation history
  const loadConversations = async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      setCreatingSession(true);
      setActiveSessionId(null);
      const session = await chatService.createChatSession();
      const newSessionId = session.session_id || session.sessionId;
      setActiveSessionId(newSessionId);
      await loadConversations();
    } catch (error) {
      toast.error('Failed to start new chat session');
    } finally {
      setCreatingSession(false);
    }
  };

  useEffect(() => {
    loadConversations();
    
    // Auto-start new chat if none exists and not already started
    if (!hasAutoStarted.current && conversations.length === 0 && !loading) {
      hasAutoStarted.current = true;
      handleNewChat();
    }
  }, [loading, conversations.length]);

  useEffect(() => {
    if (location.state?.newChat && location.state.newChat !== lastProcessedNewChat.current && !creatingSession) {
      lastProcessedNewChat.current = location.state.newChat;
      handleNewChat();
      setActiveTab(null); // Close sidebar on new chat just to be clean
    }
    if (params.agentSlug) {
      if (params.agentSlug === 'sales-outreach' || params.agentSlug === 'sales_outreach') {
        navigate('/agents/sales-outreach', { replace: true });
        return;
      }
      setSelectedAgent(params.agentSlug);
    } else if (location.state?.selectedAgent) {
      if (location.state.selectedAgent === 'sales-outreach' || location.state.selectedAgent === 'sales_outreach') {
        navigate('/agents/sales-outreach', { replace: true });
        return;
      }
      setSelectedAgent(location.state.selectedAgent);
    }
  }, [params.agentSlug, location.state?.newChat, location.state?.selectedAgent, creatingSession, navigate]);

  const handleSelectConversation = (id) => {
    setActiveSessionId(id);
  };

  const handleAgentChange = async (newAgentSlug) => {
    if (newAgentSlug === 'sales-outreach' || newAgentSlug === 'sales_outreach') {
      navigate('/agents/sales-outreach');
      return;
    }
    setSelectedAgent(newAgentSlug);
    handleNewChat();
    setActiveTab(null); // Close sidebar on new chat to keep the UI clean
  };

  return (
    <div className="flex h-screen w-full bg-[#f8f9fa] dark:bg-[#000000] p-3 md:p-5 overflow-hidden relative font-sans text-neutral-900 dark:text-neutral-100">
      
      {/* Background Soft Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[60rem] h-[60rem] bg-neutral-400/10 dark:bg-neutral-900/20 rounded-full blur-[140px] animate-pulse-slow mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute bottom-[-10rem] right-[-10rem] w-[50rem] h-[50rem] bg-neutral-400/10 dark:bg-neutral-900/20 rounded-full blur-[140px] animate-pulse-slow mix-blend-multiply dark:mix-blend-screen" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Glass Window */}
      <div className="flex flex-1 w-full h-full bg-white/70 dark:bg-[#111111]/90 backdrop-blur-3xl rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-white dark:border-[#262626] overflow-hidden relative z-10 transition-all duration-500">
        
        {/* Main Chat Window */}
        <div className="flex-1 flex flex-col h-full relative bg-transparent z-10">
          <ChatWindow
            activeConversationId={activeSessionId}
            creatingSession={creatingSession}
            onNewChat={handleNewChat}
            onMessageSent={() => {}}
            onMessagesLoaded={(count) => {}}
            selectedAgent={selectedAgent}
          />
        </div>

        {/* Right Tabbed Sidebar */}
        <div className="flex-shrink-0 flex-col h-full relative z-20">
          <RightSidebar
            conversations={conversations}
            activeId={activeSessionId}
            onSelect={handleSelectConversation}
            onNewChat={handleNewChat}
            loading={loading}
            creatingSession={creatingSession}
            refreshConversations={loadConversations}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedAgent={selectedAgent}
            setSelectedAgent={handleAgentChange}
          />
        </div>
      </div>
    </div>
  );
}
