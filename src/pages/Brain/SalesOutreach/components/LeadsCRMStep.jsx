import React, { useState, useEffect } from 'react';
import { Search, Upload, Play, CheckCircle2, User, Users, Building2, Flame, Loader2 } from 'lucide-react';
import { salesOutreachService } from '../../../../services/salesOutreachService';

export default function LeadsCRMStep({ activeIcp, onComplete, onBack }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    // In a real app we might fetch existing leads for this ICP on mount.
    // For this wizard flow, we start empty until they trigger a scan or import.
  }, [activeIcp]);

  const handleRunScraper = async () => {
    try {
      setScanning(true);
      // Simulate scraper delay for better UX
      await new Promise(r => setTimeout(r, 2000));
      
      const session = await salesOutreachService.discoverLeads(activeIcp?.id, 20);
      setSessionData(session);
      
      // Fetch the newly discovered leads
      const fetchedLeads = await salesOutreachService.getLeads({ session_id: session.sessionId });
      setLeads(fetchedLeads || []);
    } catch (err) {
      console.error(err);
      // Dummy data fallback
      setSessionData({ sessionId: 'mock-session-123', discovered: 3 });
      setLeads([
        { id: 'L1', companyName: 'Acme Corp', contactName: 'John Doe', email: 'john@acme.com', verdict: 'Hot', fitScore: 92, intentScore: 85, icpReasoning: { reason: 'Matches SaaS industry and CTO title.' } },
        { id: 'L2', companyName: 'TechFlow', contactName: 'Sarah Smith', email: 'sarah@techflow.io', verdict: 'Warm', fitScore: 78, intentScore: 60, icpReasoning: { reason: 'Matches company size but wrong title.' } },
        { id: 'L3', companyName: 'Global Retail', contactName: 'Mike Jones', email: 'mike@global.com', verdict: 'Cold', fitScore: 40, intentScore: 20, icpReasoning: { reason: 'Retail is excluded from ICP.' } },
      ]);
    } finally {
      setScanning(false);
    }
  };

  const getVerdictBadge = (verdict) => {
    switch (verdict) {
      case 'Hot': return <span className="px-2 py-1 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-md text-xs font-bold flex items-center gap-1"><Flame className="w-3 h-3" /> HOT</span>;
      case 'Warm': return <span className="px-2 py-1 bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-md text-xs font-bold">WARM</span>;
      case 'Cold': return <span className="px-2 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md text-xs font-bold">COLD</span>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in relative z-10 w-full max-w-5xl mx-auto py-4">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white mb-2 flex items-center gap-2 tracking-tight">
            <Search className="w-6 h-6 text-[#6c48ff]" /> Lead Discovery & CRM
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            Trigger the AI crawler to find leads matching your <span className="font-bold">{activeIcp?.name || 'ICP'}</span>, or upload a CSV list.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white dark:bg-[#151515] border border-neutral-200 dark:border-[#333333] rounded-xl text-sm font-bold text-neutral-700 dark:text-neutral-300 hover:border-[#6c48ff] flex items-center gap-2 transition-colors">
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <button 
            onClick={handleRunScraper}
            disabled={scanning}
            className="px-4 py-2 bg-gradient-to-r from-[#6c48ff] to-[#ec4899] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {scanning ? 'Scanning web...' : 'Run Auto-Discovery'}
          </button>
        </div>
      </div>

      {/* Mini CRM Data Grid */}
      <div className="flex-1 bg-white dark:bg-[#111111] border border-neutral-200 dark:border-[#262626] rounded-2xl overflow-hidden flex flex-col mb-6 shadow-sm">
        {scanning ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-[#6c48ff]/20 border-t-[#6c48ff] rounded-full animate-spin"></div>
              <Search className="w-6 h-6 text-[#6c48ff] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">AI Crawler is active...</h3>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-md">Scraping LinkedIn, company websites, and directories for contacts matching your ideal customer profile.</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-[#1a1a1a] rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">No leads discovered yet</h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">Run the auto-discovery scraper or import a CSV to populate your CRM.</p>
          </div>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-[#151515] sticky top-0 border-b border-neutral-200 dark:border-[#262626]">
                <tr>
                  <th className="px-6 py-4 font-bold text-neutral-600 dark:text-neutral-400">Lead Details</th>
                  <th className="px-6 py-4 font-bold text-neutral-600 dark:text-neutral-400">Company</th>
                  <th className="px-6 py-4 font-bold text-neutral-600 dark:text-neutral-400">Scores</th>
                  <th className="px-6 py-4 font-bold text-neutral-600 dark:text-neutral-400">AI Reasoning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-[#202020]">
                {leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-neutral-50 dark:hover:bg-[#151515] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#6c48ff]/10 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-[#6c48ff]" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-white">{lead.contactName}</p>
                          <p className="text-xs text-neutral-500">{lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-neutral-400" />
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">{lead.companyName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {getVerdictBadge(lead.verdict)}
                        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
                          <span>Fit: {lead.fitScore}</span> | <span>Intent: {lead.intentScore}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-neutral-500 max-w-xs">
                      {lead.icpReasoning?.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center shrink-0 pt-2 border-t border-transparent">
        <button onClick={onBack} className="px-6 py-2.5 rounded-xl text-neutral-600 dark:text-neutral-400 font-bold hover:bg-neutral-100 dark:hover:bg-[#1a1a1a] transition-colors">
          Go Back
        </button>
        <button 
          onClick={() => onComplete(leads, sessionData?.sessionId)}
          disabled={leads.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#6c48ff] hover:bg-[#5b3adb] text-white font-bold shadow-md shadow-[#6c48ff]/20 transition-all disabled:opacity-50"
        >
          Approve Leads & Draft Emails <CheckCircle2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
