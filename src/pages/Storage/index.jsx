import React, { useState, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { storageService } from '../../services/storageService';
import { KnowledgeService } from '../../services/knowledgeService';
import { 
  FolderPlus, Upload, Search, Grid, List, Trash2, 
  Edit3, ExternalLink, FileText, Image as ImageIcon, 
  Film, File, ChevronRight, Folder, Download, Copy, Check 
} from 'lucide-react';
import { toast } from 'react-toastify';

// Helper for formatting file size safely
const formatBytes = (bytes) => {
  if (!bytes || isNaN(bytes)) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i] || 'MB'}`;
};

export default function Storage() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [currentFolderPath, setCurrentFolderPath] = useState([]);
  
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [copiedId, setCopiedId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [filesData, foldersData] = await Promise.all([
        storageService.getFiles(currentFolderId ? { folderId: currentFolderId } : {}),
        storageService.getFolders(currentFolderId ? { parentId: currentFolderId } : {})
      ]);
      setFiles(Array.isArray(filesData) ? filesData : filesData?.data || []);
      setFolders(Array.isArray(foldersData) ? foldersData : foldersData?.data || []);
    } catch {
      // Fallback safe state
      setFiles([]);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentFolderId]);

  const handleUpload = async (acceptedFiles) => {
    const targetFile = acceptedFiles[0];
    if (!targetFile) return;

    setUploading(true);
    try {
      await KnowledgeService.uploadFile(targetFile);
      toast.success(`Uploaded ${targetFile.name}`);
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
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'video/*': ['.mp4', '.mov']
    },
  });

  const handleDeleteFile = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Permanently delete this asset?')) return;
    try {
      await storageService.deleteFile(id);
      toast.success('Asset deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete asset');
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
    } catch {
      toast.error('Failed to create folder');
    }
  };

  const handleDeleteFolder = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete folder and all enclosed assets?')) return;
    try {
      await storageService.deleteFolder(id);
      toast.success('Folder deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete folder');
    }
  };

  const handleRenameSubmit = async (id) => {
    if (!renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    try {
      await storageService.renameFile(id, { name: renameValue.trim() });
      toast.success('Asset renamed');
      setRenamingId(null);
      fetchData();
    } catch {
      toast.error('Failed to rename asset');
    }
  };

  const handleCopyLink = (url, id, e) => {
    e.stopPropagation();
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Asset URL copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered Folders & Files by Search Query
  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return folders;
    return folders.filter(f => f.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [folders, searchQuery]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    return files.filter(f => f.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [files, searchQuery]);

  const renderFileIcon = (file) => {
    const mime = file.mimeType || file.type || '';
    const ext = file.name ? file.name.split('.').pop().toLowerCase() : '';

    if (mime.includes('image') || ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext)) {
      return <ImageIcon className="w-6 h-6 text-blue-500" />;
    }
    if (mime.includes('pdf') || ext === 'pdf') {
      return <FileText className="w-6 h-6 text-red-500" />;
    }
    if (mime.includes('video') || ['mp4', 'mov', 'avi'].includes(ext)) {
      return <Film className="w-6 h-6 text-purple-500" />;
    }
    return <File className="w-6 h-6 text-gray-400" />;
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 font-sans space-y-6 animate-fade-in">
      
      {/* ── Page Header & Breadcrumb ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2 font-medium">
            <button 
              onClick={() => { setCurrentFolderId(null); setCurrentFolderPath([]); }}
              className={`hover:text-[#6c48ff] transition-colors ${!currentFolderId ? 'font-bold text-gray-900' : ''}`}
            >
              Content & Media Hub
            </button>
            {currentFolderPath.map((folder, idx) => (
              <React.Fragment key={folder.id}>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                <button 
                  onClick={() => {
                    setCurrentFolderId(folder.id);
                    setCurrentFolderPath(prev => prev.slice(0, idx + 1));
                  }}
                  className={`hover:text-[#6c48ff] transition-colors ${idx === currentFolderPath.length - 1 ? 'font-bold text-gray-900' : ''}`}
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight font-['Space_Grotesk']">
            Content & Media Hub
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Centralized cloud repository for brand assets, images, documents, and AI media.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowNewFolder(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <FolderPlus className="w-4 h-4 text-[#6c48ff]" />
            <span>New Folder</span>
          </button>
        </div>
      </div>

      {/* ── New Folder Input Modal/Inline ───────────────────────────────────── */}
      {showNewFolder && (
        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center gap-3 animate-fade-in">
          <Folder className="w-5 h-5 text-[#6c48ff] shrink-0" />
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            placeholder="Enter folder name..."
            autoFocus
            className="flex-1 max-w-sm px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 text-xs font-medium outline-none focus:border-[#6c48ff]"
          />
          <button 
            onClick={handleCreateFolder} 
            className="px-4 py-2 rounded-xl bg-[#6c48ff] hover:bg-[#5b3adb] text-white text-xs font-bold transition-all shadow-sm"
          >
            Create
          </button>
          <button 
            onClick={() => { setShowNewFolder(false); setNewFolderName(''); }} 
            className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── Main Layout: Dropzone Hero + File Explorer ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Upload Zone Hero */}
        <div className="lg:col-span-1">
          <div 
            {...getRootProps()}
            className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.02)] ${
              isDragActive 
                ? 'border-[#6c48ff] bg-purple-50/50 scale-[1.01]' 
                : 'border-gray-200 hover:border-[#6c48ff]/50 hover:bg-gray-50/50'
            }`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex flex-col items-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#6c48ff] border-t-transparent mb-3"></div>
                <span className="text-xs font-bold text-gray-900">Uploading asset...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6c48ff] flex items-center justify-center mb-3 shadow-sm">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-gray-900 mb-1">
                  {isDragActive ? 'Drop File to Upload' : 'Upload Asset'}
                </h4>
                <p className="text-[11px] text-gray-500 mb-3 font-medium">
                  Drag & drop or click to select files
                </p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {['PDF', 'PNG', 'JPG', 'DOCX', 'MP4'].map(tag => (
                    <span key={tag} className="text-[9px] font-extrabold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* File Gallery & Controls */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] min-h-[480px] flex flex-col justify-between">
          
          {/* Controls Bar: Search & View Toggle */}
          <div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search assets & folders..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-900 font-medium outline-none focus:bg-white focus:border-[#6c48ff] transition-all"
                />
              </div>

              {/* View Mode Switches */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl self-end sm:self-auto">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-[#6c48ff] shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-[#6c48ff] shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Folder & Files Contents */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#6c48ff] border-t-transparent"></div>
              </div>
            ) : filteredFolders.length === 0 && filteredFiles.length === 0 ? (
              <div className="text-center py-16">
                <Folder className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-xs font-bold text-gray-700 mb-1">No Assets Found</p>
                <p className="text-[11px] text-gray-400">Upload a file or create a folder to populate your Media Hub.</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Folders Section */}
                {filteredFolders.length > 0 && (
                  <div>
                    <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-3">
                      Folders ({filteredFolders.length})
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {filteredFolders.map(folder => (
                        <div
                          key={folder.id}
                          onClick={() => {
                            setCurrentFolderId(folder.id);
                            setCurrentFolderPath(prev => [...prev, { id: folder.id, name: folder.name }]);
                          }}
                          className="group relative p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 hover:bg-purple-50 hover:border-purple-200 cursor-pointer transition-all flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Folder className="w-5 h-5 text-[#6c48ff] shrink-0" />
                            <span className="text-xs font-bold text-gray-900 truncate" title={folder.name}>
                              {folder.name}
                            </span>
                          </div>
                          <button
                            onClick={(e) => handleDeleteFolder(folder.id, e)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete Folder"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Files Section */}
                {filteredFiles.length > 0 && (
                  <div>
                    <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-3">
                      Files ({filteredFiles.length})
                    </span>

                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredFiles.map(file => {
                          const isImage = file.mimeType?.includes('image') || ['png', 'jpg', 'jpeg', 'webp'].some(ext => file.name?.toLowerCase().endsWith(ext));

                          return (
                            <div
                              key={file.id}
                              className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-purple-100 transition-all flex flex-col justify-between"
                            >
                              {/* Quick Action Overlay */}
                              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                  onClick={(e) => handleCopyLink(file.url, file.id, e)}
                                  className="p-1.5 bg-white/90 text-gray-600 hover:text-[#6c48ff] rounded-lg shadow-sm backdrop-blur-sm"
                                  title="Copy URL"
                                >
                                  {copiedId === file.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setRenamingId(file.id); setRenameValue(file.name); }}
                                  className="p-1.5 bg-white/90 text-gray-600 hover:text-[#6c48ff] rounded-lg shadow-sm backdrop-blur-sm"
                                  title="Rename"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteFile(file.id, e)}
                                  className="p-1.5 bg-white/90 text-gray-600 hover:text-red-500 rounded-lg shadow-sm backdrop-blur-sm"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Asset Thumbnail / Icon */}
                              <div 
                                onClick={() => isImage && file.url ? setPreviewUrl(file.url) : window.open(file.url, '_blank')}
                                className="h-32 bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer relative"
                              >
                                {isImage && file.url ? (
                                  <img 
                                    src={file.url} 
                                    alt={file.name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                  />
                                ) : (
                                  <div className="p-4 rounded-2xl bg-white shadow-sm border border-gray-100">
                                    {renderFileIcon(file)}
                                  </div>
                                )}
                              </div>

                              {/* Details Bottom */}
                              <div className="p-3 border-t border-gray-100 bg-white">
                                {renamingId === file.id ? (
                                  <input
                                    type="text"
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(file.id)}
                                    onBlur={() => handleRenameSubmit(file.id)}
                                    autoFocus
                                    className="w-full text-xs font-bold text-gray-900 border border-[#6c48ff] rounded px-1.5 py-0.5 outline-none"
                                  />
                                ) : (
                                  <p className="text-xs font-bold text-gray-900 truncate" title={file.name}>
                                    {file.name}
                                  </p>
                                )}
                                <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400 font-medium">
                                  <span>{formatBytes(file.size)}</span>
                                  <span className="uppercase text-[9px] font-extrabold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                    {file.status || 'READY'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Table / List View */
                      <div className="rounded-2xl border border-gray-100 overflow-hidden">
                        <table className="w-full text-left text-xs text-gray-700">
                          <thead className="bg-gray-50 text-gray-400 uppercase font-extrabold text-[10px] tracking-wider border-b border-gray-100">
                            <tr>
                              <th className="p-3">Name</th>
                              <th className="p-3">Size</th>
                              <th className="p-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 font-medium">
                            {filteredFiles.map(file => (
                              <tr key={file.id} className="hover:bg-gray-50/60 transition">
                                <td className="p-3 flex items-center gap-2.5">
                                  {renderFileIcon(file)}
                                  <span className="font-bold text-gray-900 truncate max-w-xs">{file.name}</span>
                                </td>
                                <td className="p-3 text-gray-500">{formatBytes(file.size)}</td>
                                <td className="p-3 text-right space-x-2">
                                  <button
                                    onClick={(e) => handleCopyLink(file.url, file.id, e)}
                                    className="p-1 text-gray-400 hover:text-[#6c48ff]"
                                    title="Copy Link"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteFile(file.id, e)}
                                    className="p-1 text-gray-400 hover:text-red-500"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Image Preview Lightbox Modal ───────────────────────────────────── */}
      {previewUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[85vh] flex items-center justify-center">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl object-contain border border-white/20" 
              onClick={e => e.stopPropagation()} 
            />
          </div>
        </div>
      )}

    </div>
  );
}
