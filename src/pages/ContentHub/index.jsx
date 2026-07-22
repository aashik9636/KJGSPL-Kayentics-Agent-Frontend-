import React, { useState, useEffect } from 'react';
import { contentService } from '../../services/contentService';
import { toast } from 'react-toastify';

// ─── Format Bytes ─────────────────────────────────────────────────────────────
const formatBytes = (bytes, decimals = 1) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// ─── File Icon Helper ────────────────────────────────────────────────────────
const getFileIcon = (extension) => {
  const ext = extension?.toLowerCase() || '';
  
  if (['pdf'].includes(ext)) {
    return (
      <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }
  
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
    return (
      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  if (['mp4', 'mov', 'avi'].includes(ext)) {
    return (
      <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  // Default file icon
  return (
    <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center">
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    </div>
  );
};

export default function ContentHub() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    try {
      const data = await contentService.getDrafts();
      setFiles(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      toast.error('Failed to load content hub files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 h-full overflow-y-auto animate-fade-in bg-[#f6f7fb]">
      
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Content Hub</h1>
        <p className="text-gray-500 text-[13px] mt-1">Browse, view, and download your uploaded files and generated assets.</p>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3 text-gray-400">
          <svg className="animate-spin w-8 h-8 text-[#6c48ff]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm font-medium">Loading your files…</p>
        </div>
      ) : files.length === 0 ? (
        <div className="bg-white rounded-[24px] p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-violet-50 rounded-[20px] flex items-center justify-center mb-5">
            <svg className="w-10 h-10 text-[#6c48ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-[18px] font-bold text-gray-900 mb-1">No files found</h3>
          <p className="text-gray-400 text-[14px] max-w-sm mx-auto">Upload documents or generate content through the AI Chat to see them appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {files.map(file => (
            <div key={file.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all group flex flex-col">
              
              <div className="flex items-start justify-between mb-4">
                {getFileIcon(file.extension)}
                
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border ${
                  file.status === 'AVAILABLE'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}>
                  {file.status || 'UNKNOWN'}
                </span>
              </div>
              
              <div className="flex-1 mb-4">
                <h3 className="text-[14px] font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#6c48ff] transition-colors" title={file.originalName}>
                  {file.originalName}
                </h3>
                <div className="flex items-center gap-2 mt-2 text-[12px] text-gray-400 font-medium">
                  <span className="uppercase">{file.extension}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>{formatBytes(file.size)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {new Date(file.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                
                {file.publicUrl && (
                  <a 
                    href={file.publicUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-400 hover:text-[#6c48ff] hover:bg-violet-50 rounded-lg transition-colors"
                    title="View / Download File"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
