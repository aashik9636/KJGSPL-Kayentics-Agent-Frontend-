import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../../../services/chatService';
import MessageBubble from './MessageBubble';
import { toast } from 'react-toastify';

export default function ChatWindow({ activeConversationId, onConversationCreated }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const submitQuery = async (query) => {
    if (!query.trim() || isSending) return;
    
    setInput('');
    setIsSending(true);

    try {
      // 1. Optimistically add user message to local state
      setMessages(prev => [...prev, { role: 'USER', content: query }]);

      // 2. Call Python Orchestrator (Agent API) via the simple endpoint
      const agentResponse = await chatService.runMainBrainApi(query, activeConversationId || 'default-session');
      
      // 3. Add AI Answer to local state
      if (agentResponse?.data?.finalAnswer) {
        setMessages(prev => [...prev, {
          role: 'ASSISTANT',
          content: agentResponse.data.finalAnswer,
          targetOrchestrators: agentResponse.data.targetOrchestrators || []
        }]);
      } else {
        throw new Error("No final answer returned from the Brain");
      }
    } catch (err) {
      console.error('Failed to execute AI request', err);
      toast.error(err.response?.data?.message || 'Failed to get response from Main Brain Agent');
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitQuery(input);
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fc] relative rounded-tr-[24px] rounded-br-[24px]">
      <div className="flex-1 overflow-y-auto p-8 lg:p-10 pb-32 space-y-6" ref={scrollRef}>
        {messages.length === 0 && !isSending ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-[#6c48ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <p className="font-bold text-[22px] text-gray-900 mb-2 tracking-tight">How can I help you today?</p>
            <p className="font-medium text-[15px] text-gray-500">Ask me anything about your brand or content strategy.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              {msg.targetOrchestrators && msg.targetOrchestrators.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-1 animate-fade-in pl-[52px]">
                  {msg.targetOrchestrators.map(orch => (
                    <span key={orch} className="bg-purple-50 text-purple-600 border border-purple-100 text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {orch === 'social_media' ? '📱 Social Media Active' : orch === 'scraper' ? '🌐 Web Research Active' : `${orch.replace('_', ' ')} Active`}
                    </span>
                  ))}
                </div>
              )}
              <MessageBubble message={msg} />
            </div>
          ))
        )}

        {/* Loading State for Agent Execution */}
        {isSending && (
          <div className="flex justify-start w-full mb-2 animate-fade-in">
            <div className="bg-white rounded-2xl rounded-bl-sm border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] px-6 py-4 max-w-[85%] lg:max-w-[75%] flex flex-col gap-3">
              <div className="flex items-center gap-3 mb-1">
                <svg className="animate-spin h-5 w-5 text-[#6c48ff]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span className="text-[#6c48ff] text-[13px] font-bold">Kaynetics Orchestrator is thinking...</span>
              </div>
              <div className="space-y-2.5">
                <div className="h-2.5 bg-gray-100 rounded-full w-3/4 animate-pulse"></div>
                <div className="h-2.5 bg-gray-100 rounded-full w-1/2 animate-pulse"></div>
                <div className="h-2.5 bg-gray-100 rounded-full w-5/6 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="absolute bottom-6 left-6 right-6 z-10">
        <div className="bg-white p-2 pr-2.5 rounded-[24px] shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-gray-100 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="flex gap-2 w-full relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending}
              placeholder="Ask Kaynetics..."
              className="flex-1 px-6 py-4 rounded-[18px] bg-transparent text-gray-900 text-[15px] focus:outline-none transition-all placeholder:text-gray-400 font-medium disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={isSending || !input.trim()}
              className="bg-gradient-to-r from-[#6c48ff] to-[#8b5cf6] hover:shadow-lg disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none text-white px-8 py-3 my-1 mr-1 rounded-[16px] font-bold transition-all focus:outline-none flex items-center justify-center min-w-[120px]"
            >
              {isSending ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <span className="flex items-center gap-2">
                  Send <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
