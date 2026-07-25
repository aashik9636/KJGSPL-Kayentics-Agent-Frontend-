import React, { useState } from 'react';
import { KnowledgeUploader } from './components/KnowledgeUploader';
import { KnowledgeExplorer } from './components/KnowledgeExplorer';
import { BrandKitEditor } from './components/BrandKitEditor';
import { FolderKanban, Palette } from 'lucide-react';

export default function KnowledgeBase() {
  const [activeTab, setActiveTab] = useState('documents'); // 'documents' | 'brand-kit'
  const [explorerKey, setExplorerKey] = useState(0);

  const handleUploadSuccess = () => {
    setExplorerKey(prev => prev + 1);
  };

  return (
    <div className="w-full h-full pb-10 flex flex-col gap-6 animate-fade-in">
      
      {/* Header Info Card */}
      <div className="bg-white rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#e0d4ff] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#6c48ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Knowledge Base</h1>
          </div>
          <p className="text-[13px] font-medium text-gray-500 max-w-2xl">
            Manage your organization's business documents, Brand Kit guidelines, and product specs. 
            Indexed automatically to power your AI Social Media and Content Agents.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-gray-100 p-1.5 rounded-2xl flex items-center gap-1 border border-gray-200/80 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'documents'
                ? 'bg-white text-[#6c48ff] shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Documents & Data</span>
          </button>

          <button
            onClick={() => setActiveTab('brand-kit')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'brand-kit'
                ? 'bg-white text-[#6c48ff] shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Brand Kit (Social Agent)</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'documents' ? (
        <>
          {/* Uploader Card */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col">
            <h3 className="text-[16px] font-bold text-gray-900 mb-4">Ingest New Document</h3>
            <KnowledgeUploader onSuccess={handleUploadSuccess} />
          </div>

          {/* Database Explorer Card */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col">
            <h3 className="text-[16px] font-bold text-gray-900 mb-6">Knowledge Database</h3>
            <KnowledgeExplorer key={explorerKey} />
          </div>
        </>
      ) : (
        /* Brand Kit Editor */
        <BrandKitEditor />
      )}

    </div>
  );
}
