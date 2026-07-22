import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { storageService } from '../../services/storageService';
import { KnowledgeService } from '../../services/knowledgeService';
import { toast } from 'react-toastify';

export default function Storage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchFiles = async () => {
    try {
      const data = await storageService.getFiles();
      setFiles(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      toast.error('Failed to load storage files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (acceptedFiles) => {
    const targetFile = acceptedFiles[0];
    if (!targetFile) return;

    setUploading(true);
    try {
      // Re-using the upload function from KnowledgeService which targets /storage/upload
      await KnowledgeService.uploadFile(targetFile);
      toast.success('File uploaded successfully');
      fetchFiles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleUpload,
    multiple: false,
    maxSize: 104857600, // 100MB
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
  });

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to permanently delete this file?')) return;
    try {
      await storageService.deleteFile(id);
      toast.success('File deleted');
      fetchFiles();
    } catch (err) {
      // Error handled by interceptor
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) {
      return (
        <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 9h1.5m1.5 0H15m-4.5 4h3" />
        </svg>
      );
    }
    if (mimeType?.includes('word')) {
      return (
        <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13l2 2 4-4" />
        </svg>
      );
    }
    return (
      <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  };

  const handlePreview = (file) => {
    if (file.mimeType?.includes('image')) {
      setPreviewUrl(file.url);
    } else {
      window.open(file.url, '_blank');
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 h-full overflow-y-auto animate-fade-in">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Media Storage</h1>
        <p className="text-gray-500 text-sm mt-1">Upload and manage your brand assets, images, and documents.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Upload Zone */}
        <div className="w-full lg:w-1/3 shrink-0">
          <div 
            {...getRootProps()}
            className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 bg-white ${
              isDragActive 
                ? 'border-[#1967d2] bg-blue-50/50' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex flex-col items-center">
                <svg className="animate-spin w-8 h-8 text-[#1967d2] mb-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <span className="text-[13px] font-bold text-gray-900">Uploading asset...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1967d2] flex items-center justify-center mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-[13px] font-bold text-gray-900 text-center px-4">
                  {isDragActive ? 'Drop file here' : 'Click or drag file to upload'}
                </p>
                <p className="text-[11px] text-gray-500 font-medium mt-1">Up to 100MB (Images, PDF, DOCX)</p>
              </div>
            )}
          </div>
        </div>

        {/* Gallery */}
        <div className="flex-1 bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] min-h-[400px]">
          <h3 className="text-[16px] font-bold text-gray-900 mb-6">Uploaded Assets</h3>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <svg className="animate-spin w-8 h-8 text-[#1967d2]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-[13px] font-medium text-gray-500">No assets uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {files.map(file => (
                <div 
                  key={file.id} 
                  onClick={() => handlePreview(file)}
                  className="group relative bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md hover:border-gray-200 transition-all aspect-square flex flex-col"
                >
                  {/* Delete Button (overlay on hover) */}
                  <button 
                    onClick={(e) => handleDelete(file.id, e)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 text-gray-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10 backdrop-blur-sm"
                    title="Delete File"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>

                  <div className="flex-1 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {file.mimeType?.includes('image') ? (
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="group-hover:scale-110 transition-transform duration-300">
                        {getFileIcon(file.mimeType)}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 bg-white border-t border-gray-100">
                    <p className="text-[12px] font-bold text-gray-900 truncate" title={file.name}>{file.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-gray-400 font-medium">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${file.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : file.status === 'failed' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                        {file.status || 'READY'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center">
            <button 
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <img src={previewUrl} alt="Preview" className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain" onClick={e => e.stopPropagation()} />
          </div>
        </div>
      )}

    </div>
  );
}
