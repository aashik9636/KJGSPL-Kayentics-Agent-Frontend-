import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, PenLine, Send, Loader2, Sparkles, User, AlertCircle } from 'lucide-react';
import { salesOutreachService } from '../../../../services/salesOutreachService';

export default function ReviewSendStep({ leads, sessionId, onBack }) {
  const [drafts, setDrafts] = useState([]);
  const [generating, setGenerating] = useState(true);
  const [activeDraft, setActiveDraft] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    generateDrafts();
  }, []);

  const generateDrafts = async () => {
    try {
      setGenerating(true);
      // UX delay
      await new Promise(r => setTimeout(r, 2500));
      
      const payload = sessionId ? { session_id: sessionId } : { leads: leads.map(l => l.id) };
      const res = await salesOutreachService.generateDrafts(payload);
      setDrafts(res.drafts || []);
      if (res.drafts?.length > 0) selectDraft(res.drafts[0]);
    } catch (err) {
      console.error(err);
      // Dummy data fallback
      const mockDrafts = leads.map((l, i) => ({
        id: `draft-${i}`,
        leadId: l.id,
        leadName: l.contactName,
        recipientAddress: l.email,
        companyName: l.companyName,
        subject: `Introducing Kaynetics AI for ${l.companyName}`,
        content: `Hi ${l.contactName},\n\nI noticed you manage technology at ${l.companyName}. Given your focus on innovation, I thought you might be interested in Kaynetics AI - our new platform that automates lead discovery and email outreach completely autonomously.\n\nAre you open to a brief chat next week to see a demo?\n\nBest,\nYour Sales Team`,
        status: 'pending_review'
      }));
      setDrafts(mockDrafts);
      if (mockDrafts.length > 0) selectDraft(mockDrafts[0]);
    } finally {
      setGenerating(false);
    }
  };

  const selectDraft = (draft) => {
    setActiveDraft(draft);
    setEditSubject(draft.subject);
    setEditBody(draft.content);
    setEditing(false);
  };

  const handleSaveEdit = async () => {
    try {
      // Opt: await salesOutreachService.updateDraft(activeDraft.id, { subject: editSubject, content: editBody });
      const updated = drafts.map(d => d.id === activeDraft.id ? { ...d, subject: editSubject, content: editBody } : d);
      setDrafts(updated);
      setActiveDraft(updated.find(d => d.id === activeDraft.id));
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveAndSend = async (draftId) => {
    try {
      setSendingId(draftId);
      // await salesOutreachService.updateDraftStatus([draftId], 'approved');
      // await salesOutreachService.sendOutreach(draftId);
      await new Promise(r => setTimeout(r, 1000));
      
      setDrafts(drafts.map(d => d.id === draftId ? { ...d, status: 'sent' } : d));
      if (activeDraft?.id === draftId) {
        setActiveDraft(prev => ({ ...prev, status: 'sent' }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingId(null);
    }
  };

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-xl mx-auto text-center animate-fade-in">
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-[#6c48ff] to-[#ec4899] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#6c48ff]/30 animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-[#1a1a1a] rounded-full flex items-center justify-center border-2 border-neutral-100 dark:border-[#262626]">
            <Loader2 className="w-4 h-4 text-[#6c48ff] animate-spin" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-3">AI is writing emails...</h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-lg">
          Analyzing {leads.length} leads and generating highly personalized outreach drafts based on their firmographics and intent scores.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in relative z-10 w-full max-w-6xl mx-auto py-2">
      <div className="mb-6 flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white mb-2 flex items-center gap-2 tracking-tight">
            <Mail className="w-6 h-6 text-[#6c48ff]" /> Drafts & Dispatch
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            Review the AI-generated emails, edit them if needed, and dispatch them to the prospects.
          </p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {drafts.filter(d => d.status === 'sent').length} / {drafts.length} Sent
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-[400px]">
        {/* Inbox Sidebar */}
        <div className="w-1/3 flex flex-col bg-white dark:bg-[#151515] rounded-2xl border border-neutral-200 dark:border-[#262626] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-100 dark:border-[#262626] font-bold text-sm text-neutral-500 uppercase tracking-wider">
            Pending Drafts ({drafts.length})
          </div>
          <div className="flex-1 overflow-y-auto">
            {drafts.map(draft => (
              <button 
                key={draft.id}
                onClick={() => selectDraft(draft)}
                className={`w-full text-left p-4 border-b border-neutral-50 dark:border-[#1a1a1a] hover:bg-neutral-50 dark:hover:bg-[#1a1a1a] transition-colors ${activeDraft?.id === draft.id ? 'bg-[#f8f9fc] dark:bg-[#1c1c1e] border-l-4 border-l-[#6c48ff]' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-neutral-900 dark:text-white truncate">{draft.leadName}</span>
                  {draft.status === 'sent' && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                  {draft.status === 'pending_review' && <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />}
                </div>
                <span className="text-xs text-[#6c48ff] font-medium">{draft.companyName}</span>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 truncate">{draft.subject}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Email Editor / Viewer */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#151515] rounded-2xl border border-neutral-200 dark:border-[#262626] shadow-sm overflow-hidden">
          {activeDraft ? (
            <>
              {/* Email Header */}
              <div className="p-6 border-b border-neutral-100 dark:border-[#262626] shrink-0">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-[#202020] flex items-center justify-center">
                      <User className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">To: <span className="font-bold text-neutral-900 dark:text-white">{activeDraft.recipientAddress}</span></p>
                      <p className="text-xs text-neutral-400">Target: {activeDraft.leadName} @ {activeDraft.companyName}</p>
                    </div>
                  </div>
                  {activeDraft.status !== 'sent' && !editing && (
                    <button onClick={() => setEditing(true)} className="p-2 rounded-lg bg-neutral-100 dark:bg-[#202020] hover:bg-neutral-200 dark:hover:bg-[#2a2a2a] text-neutral-600 dark:text-neutral-300 transition-colors">
                      <PenLine className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {editing ? (
                  <input 
                    type="text" 
                    value={editSubject} 
                    onChange={e => setEditSubject(e.target.value)} 
                    className="w-full text-lg font-bold bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333333] px-3 py-2 rounded-lg outline-none focus:border-[#6c48ff] text-neutral-900 dark:text-white"
                  />
                ) : (
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{activeDraft.subject}</h3>
                )}
              </div>
              
              {/* Email Body */}
              <div className="flex-1 p-6 overflow-y-auto">
                {editing ? (
                  <textarea 
                    value={editBody}
                    onChange={e => setEditBody(e.target.value)}
                    className="w-full h-full min-h-[200px] resize-none text-sm bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#333333] p-4 rounded-xl outline-none focus:border-[#6c48ff] text-neutral-900 dark:text-white leading-relaxed font-mono"
                  />
                ) : (
                  <div className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed font-sans max-w-2xl">
                    {activeDraft.content}
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="p-4 border-t border-neutral-100 dark:border-[#262626] bg-neutral-50/50 dark:bg-[#111111]/50 shrink-0 flex justify-end gap-3">
                {editing ? (
                  <>
                    <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm font-bold text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">Cancel</button>
                    <button onClick={handleSaveEdit} className="px-5 py-2 text-sm font-bold bg-neutral-800 dark:bg-white text-white dark:text-neutral-900 rounded-xl hover:bg-black dark:hover:bg-neutral-200 transition-colors">Save Edits</button>
                  </>
                ) : activeDraft.status === 'sent' ? (
                  <div className="px-5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Message Sent
                  </div>
                ) : (
                  <button 
                    onClick={() => handleApproveAndSend(activeDraft.id)}
                    disabled={sendingId === activeDraft.id}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#6c48ff] to-[#ec4899] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {sendingId === activeDraft.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {sendingId === activeDraft.id ? 'Dispatching...' : 'Approve & Send Now'}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-400">Select a draft to review</div>
          )}
        </div>
      </div>
    </div>
  );
}
