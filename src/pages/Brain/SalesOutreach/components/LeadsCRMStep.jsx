import React, { useState, useEffect } from 'react';
import { CheckCircle2, User, Building2, Globe, Loader2 } from 'lucide-react';
import { salesOutreachService } from '../../../../services/salesOutreachService';

export default function LeadsCRMStep({ sessionId, onComplete, onBack }) {
  const [leads, setLeads] = useState([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    salesOutreachService.getLeads({ session_id: sessionId })
      .then(data => setLeads(data || []))
      .catch(err => { console.error(err); setLeads([]); })
      .finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => {
    if (leads.length > 0) setSelectedLeadIds(new Set(leads.map(l => l.id)));
  }, [leads]);

  const handleGenerateDrafts = async () => {
    const selected = leads.filter(l => selectedLeadIds.has(l.id));
    if (selected.length === 0) return;
    try {
      setGenerating(true);
      const res = await salesOutreachService.generateDrafts({ leads: selected.map(l => l.id) });
      onComplete(selected, sessionId, res?.drafts || []);
    } catch (err) {
      console.error('Failed to generate drafts:', err);
      onComplete(selected, sessionId, []);
    } finally {
      setGenerating(false);
    }
  };

  const allSelected = leads.length > 0 && selectedLeadIds.size === leads.length;

  return (
    <div className="flex flex-col animate-fade-in w-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-[#1a1a1a] flex items-center justify-center border border-neutral-200 dark:border-neutral-800">
            <User className="w-5 h-5 text-[#6c48ff]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">Discovered Leads</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Select leads to generate outreach drafts for</p>
          </div>
        </div>

        <div className="text-sm font-medium text-neutral-500 bg-white dark:bg-[#111111] px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <span className="text-neutral-900 dark:text-white font-bold">{selectedLeadIds.size}</span> of {leads.length} selected
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-hidden mb-5">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-neutral-500">
            <Loader2 className="w-6 h-6 animate-spin text-[#6c48ff]" />
            <p className="text-sm font-medium">Loading leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-500">
            <User className="w-10 h-10 mb-3 text-neutral-300 dark:text-neutral-700" />
            <p className="text-sm font-medium">No leads found</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="sticky top-0 bg-neutral-50 dark:bg-[#161616] z-10 shadow-sm">
                <tr>
                  <th className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 w-12">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={e => setSelectedLeadIds(e.target.checked ? new Set(leads.map(l => l.id)) : new Set())}
                      className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 cursor-pointer"
                    />
                  </th>
                  <th className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-500 uppercase tracking-wider w-1/4">Contact</th>
                  <th className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-500 uppercase tracking-wider w-1/4">Company</th>
                  <th className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-500 uppercase tracking-wider w-32">Fit</th>
                  <th className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-500 uppercase tracking-wider">AI Insight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 bg-white dark:bg-[#0f0f0f]">
                {leads.map((lead) => {
                  const isChecked = selectedLeadIds.has(lead.id);
                  const fitPct = Math.min(100, Math.max(0, lead.fit_score || 0));
                  
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => {
                        const s = new Set(selectedLeadIds);
                        if (s.has(lead.id)) s.delete(lead.id); else s.add(lead.id);
                        setSelectedLeadIds(s);
                      }}
                      className={`cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-[#141414] ${isChecked ? 'bg-neutral-50 dark:bg-[#161616]' : ''}`}
                    >
                      <td className="px-5 py-5" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            const s = new Set(selectedLeadIds);
                            if (e.target.checked) s.add(lead.id); else s.delete(lead.id);
                            setSelectedLeadIds(s);
                          }}
                          className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 cursor-pointer"
                        />
                      </td>
                      
                      {/* Contact Column */}
                      <td className="px-5 py-5 align-top">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-neutral-900 dark:text-white mb-0.5">{lead.contact_name}</span>
                          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">{lead.title || 'Unknown Title'}</span>
                          <div className="flex items-center gap-2 text-xs text-neutral-500">
                            {lead.linkedin_url ? (
                              <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-[#6c48ff] hover:underline truncate max-w-[150px]">
                                {lead.email || 'LinkedIn Profile'}
                              </a>
                            ) : (
                              <span className="truncate max-w-[150px]">{lead.email || 'No email'}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Company Column */}
                      <td className="px-5 py-5 align-top">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-neutral-900 dark:text-white mb-0.5">{lead.company_name}</span>
                          {lead.company_domain && (
                            <a href={`https://${lead.company_domain}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-xs font-medium text-[#6c48ff] hover:underline mb-1.5 flex items-center gap-1">
                              <Globe className="w-3 h-3" /> {lead.company_domain}
                            </a>
                          )}
                          <div className="flex flex-col gap-1 text-xs text-neutral-500">
                            {lead.industry && <span className="truncate max-w-[180px]">{lead.industry}</span>}
                            {lead.company_size && <span>{lead.company_size} employees</span>}
                          </div>
                        </div>
                      </td>

                      {/* Fit Column */}
                      <td className="px-5 py-5 align-top">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-neutral-900 dark:text-white">{lead.fit_score}</span>
                            <div className="flex-1 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden w-16">
                              <div className="h-full bg-neutral-800 dark:bg-neutral-300 rounded-full" style={{ width: `${fitPct}%` }} />
                            </div>
                          </div>
                          {lead.verdict && (
                            <div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                lead.verdict.toLowerCase() === 'hot' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' :
                                lead.verdict.toLowerCase() === 'warm' ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20' :
                                lead.verdict.toLowerCase() === 'cold' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                                'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-[#1a1a1a] dark:text-neutral-400 dark:border-neutral-700'
                              }`}>
                                {lead.verdict}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* AI Insight Column */}
                      <td className="px-5 py-5 align-top">
                        <div className="flex flex-col gap-2">
                          <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 leading-relaxed line-clamp-2">
                            {lead.icp_reasoning?.reason || 'No specific reason provided.'}
                          </p>
                          {lead.icp_reasoning?.pain_hypothesis && (
                            <div className="bg-neutral-50 dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 p-2 rounded-lg">
                              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 italic line-clamp-2">
                                <span className="font-semibold text-neutral-700 dark:text-neutral-300 not-italic">Hypothesis:</span> {lead.icp_reasoning.pain_hypothesis}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center shrink-0">
        <button onClick={onBack} className="px-5 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111111] text-neutral-700 dark:text-neutral-300 font-medium text-sm hover:bg-neutral-50 dark:hover:bg-[#1a1a1a] transition-colors">
          Back
        </button>
        <button
          onClick={handleGenerateDrafts}
          disabled={selectedLeadIds.size === 0 || generating || loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#6c48ff] hover:bg-[#5b3df5] text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating Drafts...</>
          ) : (
            <><CheckCircle2 className="w-4 h-4" /> Generate Drafts for {selectedLeadIds.size}</>
          )}
        </button>
      </div>
    </div>
  );
}
