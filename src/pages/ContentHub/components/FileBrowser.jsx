import React, { useState, useEffect } from 'react';
import { contentService } from '../../../services/contentService';
import { toast } from 'react-toastify';
import { MoreVertical, Link as LinkIcon, RefreshCw } from 'lucide-react';
import FileRelationshipsModal from './FileRelationshipsModal';

export default function FileBrowser() {
  const [files, setFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('');

  // Modals / Actions
  const [activeFileRelations, setActiveFileRelations] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const data = await contentService.searchFiles({ 
        searchTerm,
        categoryId: selectedCategory || undefined,
        fileType: selectedFileType || undefined
      });
      setFiles(data?.items || data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await contentService.listCategories();
      setCategories(data?.items || data || []);
    } catch (err) {
      console.error('Failed to load categories');
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [searchTerm, selectedCategory, selectedFileType]);

  const handleReExtract = async (file) => {
    setActionMenuOpen(null);
    try {
      await contentService.requestReExtraction(file.id, { populateDb: true });
      toast.success(`Extraction queued for ${file.originalName}`);
    } catch (err) {
      toast.error('Failed to request extraction');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <input 
          type="text"
          placeholder="Search files by name or tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-5 py-3.5 rounded-xl border border-gray-200 bg-white focus:bg-[#fafbfc] focus:border-[#1a1a1a] text-[#1a1a1a] text-[14px] focus:outline-none focus:ring-4 focus:ring-[#1a1a1a]/10 transition-all placeholder:text-gray-400 font-medium shadow-sm"
        />
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-5 py-3.5 rounded-xl border border-gray-200 bg-white focus:border-[#1a1a1a] text-[#1a1a1a] text-[14px] focus:outline-none shadow-sm"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select 
          value={selectedFileType}
          onChange={(e) => setSelectedFileType(e.target.value)}
          className="px-5 py-3.5 rounded-xl border border-gray-200 bg-white focus:border-[#1a1a1a] text-[#1a1a1a] text-[14px] focus:outline-none shadow-sm"
        >
          <option value="">All Types</option>
          <option value="PDF">PDF</option>
          <option value="PNG">PNG</option>
          <option value="TXT">TXT</option>
          <option value="CSV">CSV</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-[#1a1a1a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-16 bg-[#fafbfc] rounded-3xl border border-dashed border-gray-200">
          <p className="text-[#666666] font-medium mb-2 text-[15px]">No files found.</p>
          <p className="text-[13px] text-gray-400">Try uploading a new file or adjusting your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {files.map((file) => (
            <div key={file.id} className="bg-[#fafbfc] rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow group relative flex flex-col">
              
              <div className="absolute top-3 right-3 z-10">
                <button 
                  onClick={() => setActionMenuOpen(actionMenuOpen === file.id ? null : file.id)}
                  className="p-1 bg-white rounded-md shadow-sm border border-gray-200 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </button>
                
                {actionMenuOpen === file.id && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20">
                    <button 
                      onClick={() => { setActionMenuOpen(null); setActiveFileRelations(file); }}
                      className="w-full text-left px-4 py-2 text-[13px] font-medium hover:bg-gray-50 flex items-center gap-2"
                    >
                      <LinkIcon className="w-4 h-4" /> Relationships
                    </button>
                    <button 
                      onClick={() => handleReExtract(file)}
                      className="w-full text-left px-4 py-2 text-[13px] font-medium hover:bg-gray-50 flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" /> Re-Extract Data
                    </button>
                  </div>
                )}
              </div>

              <div className="h-32 bg-gray-100 rounded-xl mb-4 flex items-center justify-center text-gray-400 font-bold uppercase text-[24px]">
                {file.extension || 'DOC'}
              </div>
              <h3 className="font-bold text-[#1a1a1a] mb-1 text-[14px] truncate" title={file.originalName}>
                {file.originalName}
              </h3>
              <p className="text-[12px] text-[#666666] uppercase">{file.status}</p>
            </div>
          ))}
        </div>
      )}

      {activeFileRelations && (
        <FileRelationshipsModal 
          file={activeFileRelations} 
          onClose={() => setActiveFileRelations(null)} 
        />
      )}
    </div>
  );
}
