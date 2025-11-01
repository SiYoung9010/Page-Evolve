// components/BlockFeedbackPopup.tsx
import React, { useEffect, useRef } from 'react';

interface Props {
  visible: boolean;
  blockIndex: number | null;
  blockType: string | null;
  feedbackText: string;
  isModifying: boolean;
  onTextChange: (text: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const BlockFeedbackPopup: React.FC<Props> = ({
  visible,
  blockIndex,
  blockType,
  feedbackText,
  isModifying,
  onTextChange,
  onSubmit,
  onClose,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (visible) {
      textareaRef.current?.focus();
    }
  }, [visible]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isModifying && feedbackText.trim()) {
        onSubmit();
      }
    }
  };

  if (!visible || blockIndex === null) return null;

  return (
    <div className="fixed bottom-4 right-4 w-[400px] bg-gray-800 border border-blue-500 rounded-lg shadow-2xl z-50 text-white animate-fade-in-up">
      <div className="p-3 bg-gray-900/50 flex justify-between items-center rounded-t-lg border-b border-gray-700">
        <h3 className="text-sm font-bold text-blue-300 truncate pr-2">
          Modify Block #{blockIndex}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-400 mb-2">Type: <code className="bg-gray-700 px-1 rounded capitalize">{blockType}</code></p>
        <textarea
          ref={textareaRef}
          value={feedbackText}
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., 'Make this text bold and red', 'Increase the image size by 50%'"
          className="w-full h-32 p-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          disabled={isModifying}
        />
      </div>
      <div className="p-3 bg-gray-900/50 rounded-b-lg border-t border-gray-700">
        <button
          onClick={onSubmit}
          disabled={isModifying || !feedbackText.trim()}
          className="w-full px-4 py-2 rounded-md font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isModifying ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Applying...</span>
            </>
          ) : (
            '🤖 Apply with AI'
          )}
        </button>
      </div>
    </div>
  );
};

export default BlockFeedbackPopup;