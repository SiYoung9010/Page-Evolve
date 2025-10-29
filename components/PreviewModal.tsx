// components/PreviewModal.tsx
import React from 'react';
import PreviewPanel from './PreviewPanel';

interface Props {
  beforeHtml: string;
  afterHtml: string;
  onApply: () => void;
  onClose: () => void;
}

const PreviewModal: React.FC<Props> = ({ beforeHtml, afterHtml, onApply, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col shadow-2xl">
        <header className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Suggestion Preview</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </header>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-hidden">
          <div className="flex flex-col h-full">
            <h3 className="text-lg font-semibold mb-2 text-center text-gray-300">Before</h3>
            <div className="flex-1 border border-gray-600 rounded-lg overflow-hidden">
                <PreviewPanel html={beforeHtml} />
            </div>
          </div>
          <div className="flex flex-col h-full">
            <h3 className="text-lg font-semibold mb-2 text-center text-green-400">After</h3>
            <div className="flex-1 border-2 border-green-500 rounded-lg overflow-hidden">
                <PreviewPanel html={afterHtml} />
            </div>
          </div>
        </div>
        
        <footer className="p-4 border-t border-gray-700 flex justify-end gap-4">
          <button onClick={onClose} className="px-5 py-2 text-sm font-semibold bg-gray-600 rounded-md hover:bg-gray-500 transition-colors">
            Close
          </button>
          <button onClick={onApply} className="px-5 py-2 text-sm font-semibold bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
            Apply Changes
          </button>
        </footer>
      </div>
    </div>
  );
};

export default PreviewModal;
