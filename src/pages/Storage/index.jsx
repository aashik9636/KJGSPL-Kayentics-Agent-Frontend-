import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { storageService } from '../../services/storageService';
import { KnowledgeService } from '../../services/knowledgeService';
import { toast } from 'react-toastify';

export default function Storage() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const fetchData = async () => {
    try {
      const [filesData, foldersData] = await Promise.all([
        storageService.getFiles(currentFolderId ? { folderId: currentFolderId } : {}),
        storageService.getFolders(currentFolderId ? { parentId: currentFolderId } : {})
      ]);
      setFiles(Array.isArray(filesData) ? filesData : filesData?.data || []);
      setFolders(Array.isArray(foldersData) ? foldersData : foldersData?.data || []);
    } catch (err) {
      toast.error('Failed to load storage');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [currentFolderId]);

  const handleUpload = async (acceptedFiles) => {
    const targetFile = acceptedFiles[0];
    if (!targetFile) return;

    setUploading(true);
    try {
      await KnowledgeService.uploadFile(targetFile);
      toast.success('File uploaded successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleUpload,
    multiple: false,
    maxSize: 104857600,
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
      fetchData();
    } catch (err) {
      // Error handled by interceptor
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await storageService.createFolder({
        name: newFolderName.trim(),
        parentId: currentFolderId
      });
      toast.success('Folder created');
      setNewFolderName('');
      setShowNewFolder(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to create folder');
    }
  };

  const handleDeleteFolder = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this folder and its contents?')) return;
    try {
      await storageService.deleteFolder(id);
      toast.success('Folder deleted');
      fetchData();
    } catch (err) {
      // Error handled by interceptor
    }
  };

  const handleRename = async (id, e) => {
    e.stopPropagation();
    setRenamingId(id);
    setRenameValue('');
    setTimeout(() => document.getElementById(`rename-${id}`)?.focus(), 100);
  };

  const handleRenameSubmit = async (id) => {
    if (!renameValue.trim()) return;
    try {
      await storageService.renameFile(id, { name: renameValue.trim() });
      toast.success('File renamed');
      setRenamingId(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to rename');
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
        <div className="flex items-center gap-2 text-[13px] text-gray-400 mb-3">
          <button 
            onClick={() => setCurrentFolderId(null)} 
            className={`hover:text-gray-900 transition-colors ${!currentFolderId ? 'font-bold text-gray-900' : ''}`}
          >
            Storage
          </button>
          {currentFolderId && (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <span className="font-bold text-gray-900">Current Folder</span>
            </>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Media Storage</h1>
            <p className="text-gray-500 text-sm mt-1">Upload and manage your brand assets, images, and documents.</p>
          </div>
          <button 
            onClick={() => setShowNewFolder(!showNewFolder)}
            className="bg-white border border-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-xl shadow-sm hover:bg-gray-50 transition-all text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
            New Folder
          </button>
        </div>
      </div>

      {/* New Folder Input */}
      {showNewFolder && (
        <div className="mb-6 flex items-center gap-3">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            placeholder="Folder name..."
            className="flex-1 max-w-xs px-4 py-2.5 rounded-xl border border-gray-200 bg-[#f9fafb] focus:bg-white text-gray-900 text-sm outline-none focus:ring-2 focus:ring-[#1967d2]/20 focus:border-[#1967d2]"
          />
          <button onClick={handleCreateFolder} className="px-4 py-2.5 rounded-xl bg-[#1967d2] text-white text-sm font-medium hover:bg-[#1557b0] transition-colors">
            Create
          </button>
          <button onClick={() => { setShowNewFolder(false); setNewFolderName(''); }} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      )}

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
          <h3 className="text-[16px] font-bold text-gray-900 mb-6">{currentFolderId ? 'Folder Contents' : 'All Files'}</h3>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <svg className="animate-spin w-8 h-8 text-[#1967d2]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            </div>
          ) : (files.length === 0 && folders.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-[13px] font-medium text-gray-500">No files or folders yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Folders */}
              {folders.map(folder => (
                <div 
                  key={folder.id}
                  onClick={() => setCurrentFolderId(folder.id)}
                  className="group relative bg-blue-50 rounded-2xl border border-blue-100 overflow-hidden cursor-pointer hover:shadow-md hover:border-blue-200 transition-all aspect-square flex flex-col items-center justify-center"
                >
                  <button 
                    onClick={(e) => handleDeleteFolder(folder.id, e)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 text-gray-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
                    title="Delete Folder"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                  <svg className="w-12 h-12 text-[#1967d2] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-[12px] font-bold text-[#1967d2] truncate w-full text-center px-2">{folder.name}</p>
                </div>
              ))}

              {/* Files */}
              {files.map(file => (
                <div 
                  key={file.id} 
                  onClick={() => handlePreview(file)}
                  className="group relative bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md hover:border-gray-200 transition-all aspect-square flex flex-col"
                >
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                    <button 
                      onClick={(e) => handleRename(file.id, e)}
                      className="p-1.5 bg-white/90 text-gray-400 hover:text-[#1967d2] rounded-lg shadow-sm"
                      title="Rename"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button 
                      onClick={(e) => handleDelete(file.id, e)}
                      className="p-1.5 bg-white/90 text-gray-400 hover:text-red-500 rounded-lg shadow-sm"
                      title="Delete File"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>

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
                    {renamingId === file.id ? (
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <input
                          id={`rename-${file.id}`}
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(file.id)}
                          onBlur={() => handleRenameSubmit(file.id)}
                          placeholder={file.name}
                          className="flex-1 text-[12px] font-bold text-gray-900 px-1 py-0.5 border border-[#1967d2] rounded outline-none"
                        />
                      </div>
                    ) : (
                      <p className="text-[12px] font-bold text-gray-900 truncate" title={file.name}>{file.name}</p>
                    )}
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
