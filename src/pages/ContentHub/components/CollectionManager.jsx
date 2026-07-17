import React, { useState, useEffect } from 'react';
import { contentService } from '../../../services/contentService';
import { toast } from 'react-toastify';
import { Folder, Search, Plus, Layers, BookOpen } from 'lucide-react';

export default function CollectionManager() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [collectionType, setCollectionType] = useState('content'); // 'content' or 'knowledge'
  
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const data = await contentService.listCollections(collectionType);
      setCollections(data?.items || data || []);
    } catch (error) {
      toast.error(`Failed to load ${collectionType} collections`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [collectionType]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    try {
      await contentService.createCollection(collectionType, {
        name: newCollectionName,
        description: newCollectionDesc
      });
      toast.success('Collection created!');
      setNewCollectionName('');
      setNewCollectionDesc('');
      setIsCreating(false);
      fetchCollections();
    } catch (error) {
      toast.error('Failed to create collection');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setCollectionType('content')}
            className={`px-4 py-2 rounded-lg font-bold text-[14px] flex items-center gap-2 transition-all ${
              collectionType === 'content' ? 'bg-[#1a1a1a] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <Layers className="w-4 h-4" /> Content Collections
          </button>
          <button
            onClick={() => setCollectionType('knowledge')}
            className={`px-4 py-2 rounded-lg font-bold text-[14px] flex items-center gap-2 transition-all ${
              collectionType === 'knowledge' ? 'bg-[#1a1a1a] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Knowledge Collections
          </button>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-[14px] hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Collection
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-[#fafbfc] rounded-2xl border border-gray-200 p-5 mb-6 flex flex-col gap-4">
          <h3 className="font-bold text-[16px]">Create New {collectionType === 'content' ? 'Content' : 'Knowledge'} Collection</h3>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Collection Name (e.g. Q4 Campaign)" 
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-purple-600"
              required
            />
            <input 
              type="text" 
              placeholder="Description" 
              value={newCollectionDesc}
              onChange={(e) => setNewCollectionDesc(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-purple-600"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setIsCreating(false)} className="text-gray-500 font-bold px-4 py-2 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="bg-[#1a1a1a] text-white font-bold px-4 py-2 rounded-lg hover:bg-black">Create</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
           <svg className="animate-spin h-8 w-8 text-[#1a1a1a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-16 bg-[#fafbfc] rounded-3xl border border-dashed border-gray-200">
           <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Folder className="w-6 h-6 text-gray-400" />
           </div>
           <p className="text-[#666666] font-medium mb-1 text-[15px]">No {collectionType} collections found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map(col => (
            <div key={col.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${collectionType === 'content' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                  {collectionType === 'content' ? <Layers className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                </div>
                <h3 className="font-bold text-[#1a1a1a] text-[16px]">{col.name}</h3>
              </div>
              <p className="text-[#666666] text-[14px] line-clamp-2">{col.description || 'No description provided.'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
