import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { contentService } from '../../../services/contentService';
import { toast } from 'react-toastify';
import { X, Link as LinkIcon, Trash2 } from 'lucide-react';

export default function FileRelationshipsModal({ file, onClose }) {
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newRelatedId, setNewRelatedId] = useState('');
  const [newRelationType, setNewRelationType] = useState('DERIVED_FROM');
  const [isAdding, setIsAdding] = useState(false);

  const fetchRelationships = async () => {
    try {
      setLoading(true);
      const data = await contentService.listRelationships(file.id);
      setRelationships(data?.items || data || []);
    } catch (err) {
      toast.error('Failed to load relationships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (file?.id) {
      fetchRelationships();
    }
  }, [file]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newRelatedId.trim()) return;
    setIsAdding(true);
    try {
      await contentService.createRelationship(file.id, {
        relatedFileId: newRelatedId,
        relationshipType: newRelationType
      });
      toast.success('Relationship added');
      setNewRelatedId('');
      fetchRelationships();
    } catch (err) {
      toast.error('Failed to add relationship');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (relId) => {
    try {
      await contentService.deleteRelationship(file.id, relId);
      toast.success('Relationship removed');
      fetchRelationships();
    } catch (err) {
      toast.error('Failed to remove relationship');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1a1a1a]/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#fafbfc]">
          <div>
            <h2 className="text-[20px] font-bold text-[#1a1a1a] flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-purple-600" /> File Relationships
            </h2>
            <p className="text-[#666666] text-[13px] font-medium mt-1">Manage linked assets for: <span className="font-bold text-[#1a1a1a]">{file.originalName}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {/* Add New Relationship */}
          <form onSubmit={handleAdd} className="bg-[#fafbfc] border border-gray-200 rounded-2xl p-5 mb-8">
            <h3 className="font-bold text-[14px] mb-3">Link another file</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Target File ID..."
                value={newRelatedId}
                onChange={(e) => setNewRelatedId(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:border-purple-600 focus:outline-none text-[14px]"
                required
              />
              <select 
                value={newRelationType} 
                onChange={(e) => setNewRelationType(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:border-purple-600 focus:outline-none text-[14px] bg-white"
              >
                <option value="DERIVED_FROM">Derived From</option>
                <option value="RELATED_TO">Related To</option>
                <option value="REFERENCE_FOR">Reference For</option>
              </select>
              <button 
                type="submit" 
                disabled={isAdding}
                className="bg-[#1a1a1a] text-white px-5 py-2 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50"
              >
                {isAdding ? 'Adding...' : 'Link'}
              </button>
            </div>
          </form>

          {/* List Relationships */}
          <div>
            <h3 className="font-bold text-[16px] mb-4">Current Links</h3>
            {loading ? (
               <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full"></div></div>
            ) : relationships.length === 0 ? (
               <p className="text-center text-gray-400 py-8 text-[14px]">No relationships found for this file.</p>
            ) : (
              <div className="space-y-3">
                {relationships.map(rel => (
                  <div key={rel.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div>
                      <span className="inline-block bg-purple-50 text-purple-700 text-[11px] font-bold px-2 py-1 rounded-md mb-1">
                        {rel.relationshipType}
                      </span>
                      <p className="font-bold text-[14px] text-[#1a1a1a]">File ID: {rel.relatedFileId}</p>
                    </div>
                    <button 
                      onClick={() => handleDelete(rel.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
