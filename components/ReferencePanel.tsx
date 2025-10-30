// components/ReferencePanel.tsx
import React, { useState } from 'react';
import { Reference } from '../types';

interface Props {
  references: Reference[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  onInsert: (content: string) => void;
}

const ReferencePanel: React.FC<Props> = ({ references, onAdd, onDelete, onInsert }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const categories = Array.from(new Set(references.map(r => r.category)));
  
  const filteredReferences = references.filter(ref => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      ref.title.toLowerCase().includes(searchLower) ||
      ref.notes.toLowerCase().includes(searchLower) ||
      ref.tags.some(t => t.toLowerCase().includes(searchLower));
    
    const matchesCategory = !selectedCategory || ref.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="🔍 Search references..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={onAdd}
          className="px-4 py-2 text-sm font-bold text-white bg-purple-600 rounded-md hover:bg-purple-700 whitespace-nowrap"
          title="Save current HTML as a new reference"
        >
          + Add New
        </button>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-2 py-1 text-xs rounded-full transition-colors ${
              !selectedCategory 
                ? 'bg-purple-600 text-white font-semibold' 
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                selectedCategory === cat 
                  ? 'bg-purple-600 text-white font-semibold' 
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
      
      <div className="space-y-3">
        {filteredReferences.length === 0 && (
            <div className="text-center text-gray-500 pt-8">
                <p>No references found.</p>
                <p className="text-sm">Click "+ Add New" to save the current page.</p>
            </div>
        )}
        {filteredReferences.map(ref => (
          <div key={ref.id} className="p-3 bg-gray-800/50 border border-gray-700 rounded">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-sm text-gray-200">{ref.title}</h3>
              <div className="flex gap-1 flex-shrink-0 ml-2">
                <button
                  onClick={() => onInsert(ref.content)}
                  className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
                  title="Load this reference into the editor"
                >
                  Insert
                </button>
                <button
                  onClick={() => onDelete(ref.id)}
                  className="text-xs px-2 py-1 bg-red-800 hover:bg-red-700 rounded text-white"
                  title="Delete this reference"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <p className="text-xs text-gray-400 mb-2 italic">"{ref.notes || 'No notes'}"</p>
            
            <div className="flex gap-1 flex-wrap">
              <span className="text-xs px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded-full">
                {ref.category}
              </span>
              {ref.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReferencePanel;