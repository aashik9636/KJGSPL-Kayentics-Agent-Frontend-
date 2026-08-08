import React, { useState } from 'react';
import { Mail, CheckCircle, PenLine, Send, Loader2, Sparkles, User, XCircle } from 'lucide-react';
import { salesOutreachService } from '../../../../services/salesOutreachService';

const STATUS_CONFIG = {
  sent: { label: 'Sent', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' },
  approved: { label: 'Approved', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20' },
  pending_review: { label: 'Pending', cls: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700' },
};

export default function ReviewSendStep({ drafts: initialDrafts, leads, sessionId, onBack }) {
  const [drafts, setDrafts] = useState(initialDrafts || []);
  const [activeDraft, setActiveDraft] = useState(initialDrafts?.[0] || null);
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [sendingId, setSendingId] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const selectDraft = (draft) => {
    setActiveDraft(draft);
    setEditSubject(draft.subject);
    setEditBody(draft.content);
    setEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!activeDraft) return;
    try {
      setSavingId(activeDraft.id);
      await salesOutreachService.updateDraft(activeDraft.id, { subject: editSubject, content: editBody });
      const updated = drafts.map(d => d.id === activeDraft.id ? { ...d, subject: editSubject, content: editBody } : d);
      setDrafts(updated);
      setActiveDraft(updated.find(d => d.id === activeDraft.id));
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  const handleStatusChange = async (draftId, action) => {
    try {
      await salesOutreachService.updateDraftStatus([draftId], action);
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      const updated = drafts.map(d => d.id === draftId ? { ...d, status: newStatus } : d);
      setDrafts(updated);
      if (activeDraft?.id === draftId) setActiveDraft(updated.find(d => d.id === draftId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (draftId) => {
    try {
      setSendingId(draftId);
      await salesOutreachService.sendOutreach(draftId);
      const updated = drafts.map(d => d.id === draftId ? { ...d, status: 'sent' } : d);
      setDrafts(updated);
      if (activeDraft?.id === draftId) setActiveDraft(updated.find(d => d.id === draftId));
    } catch (err) {
      console.error(err);
    } finally {
      setSendingId(null);
    }
  };

  const sentCount = drafts.filter(d => d.status === 'sent').length;

  if (!drafts || drafts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in border border-neutral-200 dark:border-neutral-800 rounded-xl">
        <Mail className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mb-4" />
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">No Drafts Generated</h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6 max-w-sm">No outreach drafts were created. Go back and select different leads.</p>
        <button onClick={onBack} className="px-5 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1a1a1a] font-medium text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#222] transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in w-full">
      {/* Header */}
      <div className="mb-6 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-[#1a1a1a] flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#6c48ff]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">Review & Send</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Review, edit, approve and dispatch your outreach</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-neutral-500 mb-1">{sentCount} of {drafts.length} sent</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-5 overflow-hidden min-h-[380px]">
        {/* Inbox Sidebar */}
        <div className="w-64 flex flex-col bg-white dark:bg-[#111111] rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shrink-0">
          <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#141414]">
            <p className="text-xs font-semibold text-neutral-500 uppercase">{drafts.length} Draft{drafts.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
            {drafts.map(draft => {
              const statusCfg = STATUS_CONFIG[draft.status] || STATUS_CONFIG.pending_review;
              const isActive = activeDraft?.id === draft.id;
              return (
                <button
                  key={draft.id}
                  onClick={() => selectDraft(draft)}
                  className={`w-full text-left p-4 transition-colors ${isActive ? 'bg-[#6c48ff]/5 border-l-2 border-l-[#6c48ff]' : 'border-l-2 border-l-transparent hover:bg-neutral-50 dark:hover:bg-[#161616]'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white truncate flex-1">{draft.lead_name}</span>
                  </div>
                  <div className="mb-2">
                    <span className={`inline-block px-1.5 py-0.5 text-[10px] font-semibold border rounded uppercase ${statusCfg.cls}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">{draft.subject}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Email Panel */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#111111] rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          {activeDraft ? (
            <>
              {/* Email Meta Header */}
              <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#141414]/50 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] flex items-center justify-center">
                      <span className="text-sm font-semibold text-neutral-500">
                        {(activeDraft.lead_name || '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        To: <span className="font-semibold text-neutral-900 dark:text-white">{activeDraft.recipient_address}</span>
                      </p>
                      <p className="text-xs text-neutral-400">{activeDraft.lead_name} · <span className="capitalize">{activeDraft.channel || 'email'}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const s = STATUS_CONFIG[activeDraft.status];
                      if (!s) return null;
                      return <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold border uppercase ${s.cls}`}>{s.label}</span>;
                    })()}
                    {activeDraft.status !== 'sent' && !editing && (
                      <button onClick={() => setEditing(true)} className="p-1.5 rounded text-neutral-500 hover:bg-neutral-100 dark:hover:bg-[#222] transition-colors ml-2">
                        <PenLine className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  {editing ? (
                    <input
                      type="text"
                      value={editSubject}
                      onChange={e => setEditSubject(e.target.value)}
                      className="w-full text-sm font-semibold bg-white dark:bg-[#1a1a1a] border border-neutral-300 dark:border-neutral-700 px-3 py-2 rounded outline-none focus:border-[#6c48ff] text-neutral-900 dark:text-white transition-colors"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">Subject: {activeDraft.subject}</p>
                  )}
                </div>
              </div>

              {/* Email Body */}
              <div className="flex-1 p-5 overflow-y-auto">
                {editing ? (
                  <textarea
                    value={editBody}
                    onChange={e => setEditBody(e.target.value)}
                    className="w-full h-full min-h-[180px] resize-none text-sm bg-white dark:bg-[#1a1a1a] border border-neutral-300 dark:border-neutral-700 p-4 rounded outline-none focus:border-[#6c48ff] text-neutral-900 dark:text-white leading-relaxed font-mono transition-colors"
                  />
                ) : (
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">{activeDraft.content}</p>
                )}
              </div>

              {/* Action Bar */}
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#141414] shrink-0 flex justify-end gap-2">
                {editing ? (
                  <>
                    <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">Cancel</button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={!!savingId}
                      className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-[#6c48ff] text-white rounded-lg hover:bg-[#5b3df5] transition-colors disabled:opacity-50"
                    >
                      {savingId ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Changes
                    </button>
                  </>
                ) : activeDraft.status === 'sent' ? (
                  <div className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 font-medium text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Sent Successfully
                  </div>
                ) : activeDraft.status === 'rejected' ? (
                  <div className="px-4 py-2 rounded-lg bg-red-50 text-red-600 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 font-medium text-sm flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Draft Rejected
                  </div>
                ) : (
                  <>
                    {activeDraft.status !== 'approved' && (
                      <button
                        onClick={() => handleStatusChange(activeDraft.id, 'reject')}
                        className="px-5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                    )}
                    {activeDraft.status !== 'approved' && (
                      <button
                        onClick={() => handleStatusChange(activeDraft.id, 'approve')}
                        className="px-5 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#1a1a1a] border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-[#222] rounded-lg transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleSend(activeDraft.id)}
                      disabled={sendingId === activeDraft.id}
                      className="flex items-center gap-2 px-5 py-2 bg-[#6c48ff] text-white text-sm font-medium rounded-lg hover:bg-[#5b3df5] transition-colors disabled:opacity-50"
                    >
                      {sendingId === activeDraft.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {sendingId === activeDraft.id ? 'Sending...' : 'Send Now'}
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-400 text-sm">Select a draft to preview</div>
          )}
        </div>
      </div>
    </div>
  );
}
