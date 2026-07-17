import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { contentService } from '../../../services/contentService';
import { toast } from 'react-toastify';

export default function UploadModal({ onClose }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await contentService.uploadFile(file);
      toast.success('File uploaded successfully!');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[24px] shadow-2xl p-8 max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[20px] font-bold text-[#1a1a1a]">Upload Content</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="border-2 border-dashed border-[#1a1a1a]/20 rounded-2xl p-10 flex flex-col items-center justify-center bg-[#fafbfc] hover:bg-[#f4f6f8] transition-colors cursor-pointer relative">
          <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <svg className="w-12 h-12 text-[#1a1a1a]/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          <p className="font-bold text-[#1a1a1a] text-[15px]">
            {file ? file.name : 'Click or drag file to upload'}
          </p>
          <p className="text-[13px] text-[#666666] mt-2">Supports images, documents, and videos.</p>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors text-[14px]"
          >
            Cancel
          </button>
          <button 
            onClick={handleUpload}
            disabled={!file || uploading}
            className="bg-[#1a1a1a] text-white px-8 py-3 rounded-xl font-bold hover:bg-black disabled:bg-gray-400 transition-all shadow-md text-[14px]"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
