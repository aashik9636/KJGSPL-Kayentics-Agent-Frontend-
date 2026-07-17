import React, { useState } from 'react';
import FileBrowser from './components/FileBrowser';
import CategoryManager from './components/CategoryManager';
import CollectionManager from './components/CollectionManager';
import UploadModal from './components/UploadModal';

export default function ContentHub() {
  const [activeTab, setActiveTab] = useState('files');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/60 p-8 lg:p-10 h-full w-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[26px] font-bold text-[#1a1a1a] mb-2">Content Hub</h1>
          <p className="text-[#666666] font-medium text-[15px]">Manage, search, and generate marketing content assets.</p>
        </div>
        <button 
          onClick={() => setIsUploadOpen(true)}
          className="bg-[#1a1a1a] text-white px-6 py-3.5 rounded-xl font-bold hover:bg-black transition-all shadow-md hover:shadow-lg text-[14px]"
        >
          + Upload File
        </button>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-100 pb-4">
        <button 
          onClick={() => setActiveTab('files')}
          className={`font-bold text-[15px] pb-1 border-b-2 transition-all ${activeTab === 'files' ? 'border-[#1a1a1a] text-[#1a1a1a]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          File Browser
        </button>
        <button 
          onClick={() => setActiveTab('collections')}
          className={`font-bold text-[15px] pb-1 border-b-2 transition-all ${activeTab === 'collections' ? 'border-[#1a1a1a] text-[#1a1a1a]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Collections
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`font-bold text-[15px] pb-1 border-b-2 transition-all ${activeTab === 'categories' ? 'border-[#1a1a1a] text-[#1a1a1a]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Categories (Legacy)
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === 'files' && <FileBrowser />}
        {activeTab === 'collections' && <CollectionManager />}
        {activeTab === 'categories' && <CategoryManager />}
      </div>

      {isUploadOpen && (
        <UploadModal onClose={() => setIsUploadOpen(false)} />
      )}
    </div>
  );
}
