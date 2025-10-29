// components/ImageLibrary.tsx

import React from 'react';
import { UploadedImage, ImagePosition } from '../types';
import { createImageInsertionCode } from '../services/imageService';

interface Props {
  images: UploadedImage[];
  analyzingImageId: string | null;
  onAnalyze: (imageId: string) => void;
  onInsert: (code: string, position: ImagePosition) => void;
  onDelete: (imageId: string) => void;
}

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const ImageLibrary: React.FC<Props> = ({ 
  images, 
  analyzingImageId, 
  onAnalyze, 
  onInsert,
  onDelete 
}) => {
  
  if (images.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No images uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {images.map(image => (
        <div key={image.id} className="border border-gray-700 rounded-lg p-3 bg-gray-800/50 shadow-sm">
          <div className="flex gap-4 mb-3">
            <img 
              src={image.dataUrl} 
              alt={image.fileName}
              className="w-20 h-20 object-cover rounded-md flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-200 truncate" title={image.fileName}>
                {image.fileName}
              </p>
              <p className="text-xs text-gray-400">
                {image.width} × {image.height} &bull; {formatBytes(image.sizeInBytes)}
              </p>
              
              {image.description && (
                <p className="text-xs text-gray-300 mt-1 italic">
                  "{image.description}"
                </p>
              )}
            </div>
            
            <button
              onClick={() => onDelete(image.id)}
              className="text-gray-500 hover:text-red-400 p-1 self-start"
              title="Delete Image"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!image.suggestedPositions && (
            <button
              onClick={() => onAnalyze(image.id)}
              disabled={analyzingImageId === image.id}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm font-semibold disabled:opacity-50 disabled:cursor-wait transition-colors"
            >
              {analyzingImageId === image.id ? '🤖 Analyzing with AI...' : '🤖 Get AI Suggestions'}
            </button>
          )}

          {image.suggestedPositions && (
            <div className="mt-3 space-y-2">
              <div className="text-xs text-gray-300 mb-2 p-2 bg-gray-700/50 rounded">
                <strong>Suggested Alt Text:</strong> {image.altText}
              </div>
              
              <p className="text-xs font-semibold text-gray-300 mb-2">
                💡 Recommended Positions:
              </p>
              
              {image.suggestedPositions.map((position, idx) => {
                const priorityClasses = {
                    high: 'border-red-500/50 bg-red-900/20 hover:border-red-500/80',
                    medium: 'border-yellow-500/50 bg-yellow-900/20 hover:border-yellow-500/80',
                    low: 'border-blue-500/50 bg-blue-900/20 hover:border-blue-500/80',
                };
                return (
                    <div 
                      key={idx}
                      className={`p-2 rounded border text-sm transition-colors ${priorityClasses[position.priority]}`}
                    >
                      <p className="text-xs text-gray-300 mb-2 font-medium">
                        {position.reason}
                      </p>
                      <button
                        onClick={() => {
                          const codeWithSrc = createImageInsertionCode(position, image.dataUrl);
                          onInsert(codeWithSrc, position);
                        }}
                        className="w-full py-1 bg-blue-700 hover:bg-blue-600 rounded text-xs font-semibold text-white transition-colors"
                      >
                        Insert Here
                      </button>
                    </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImageLibrary;
