// components/AiSuggestionCard.tsx
import React from 'react';
import { Suggestion } from '../types';

interface Props {
  suggestion: Suggestion;
  onApply: (suggestion: Suggestion) => void;
  onPreview: (suggestion: Suggestion) => void;
  isApplying: boolean;
}

const AiSuggestionCard: React.FC<Props> = ({
  suggestion,
  onApply,
  onPreview,
  isApplying
}) => {
  const priorityClasses = {
    high: {
      border: 'border-red-500',
      bg: 'bg-red-900/50',
      labelBg: 'bg-red-500',
      text: 'text-white'
    },
    medium: {
      border: 'border-yellow-500',
      bg: 'bg-yellow-900/50',
      labelBg: 'bg-yellow-500',
      text: 'text-black'
    },
    low: {
      border: 'border-blue-500',
      bg: 'bg-blue-900/50',
      labelBg: 'bg-blue-500',
      text: 'text-white'
    }
  };

  const typeEmojis = {
    image: '📸',
    text: '📝',
    seo: '🔍',
    structure: '🏗️',
  };

  const priorityLabels = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };

  const classes = priorityClasses[suggestion.priority];

  return (
    <div 
      className={`p-4 rounded-lg border-2 ${classes.bg} ${classes.border} ${suggestion.applied ? 'opacity-60' : ''} transition-all duration-300`}
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl flex-shrink-0 mt-1">{typeEmojis[suggestion.type]}</span>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2 flex-wrap">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="text-sm font-bold uppercase text-gray-400 tracking-wider">
                  {suggestion.type}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${classes.labelBg} ${classes.text}`}>
                  Priority: {priorityLabels[suggestion.priority]}
                </span>
              </div>
              {suggestion.applied && (
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full font-semibold">
                      ✓ Applied
                  </span>
              )}
          </div>
          
          <p className="text-base text-gray-200 leading-relaxed mb-3">{suggestion.message}</p>
          
          {suggestion.code && (
            <details className="text-xs mb-4 bg-gray-900/50 rounded p-2 border border-gray-600">
              <summary className="cursor-pointer text-gray-400 font-medium select-none">
                View Code Change
              </summary>
              <pre className="text-white p-2 mt-2 rounded overflow-x-auto text-xs bg-black/50">
                <code>{suggestion.code}</code>
              </pre>
            </details>
          )}

          <div className="flex gap-2">
            <button
                onClick={() => onPreview(suggestion)}
                disabled={suggestion.applied || isApplying}
                className="flex-1 px-4 py-2 rounded-md font-semibold text-sm text-gray-200 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
                Preview
            </button>
            <button
              onClick={() => onApply(suggestion)}
              disabled={suggestion.applied || isApplying}
              className="flex-1 px-4 py-2 rounded-md font-semibold text-sm text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {isApplying ? 'Applying...' : suggestion.applied ? 'Applied' : 'Apply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiSuggestionCard;
