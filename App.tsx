import React, { useState, useCallback } from 'react';
import HtmlEditor from './components/HtmlEditor';
import PreviewPanel from './components/PreviewPanel';
import AiSuggestionCard from './components/AiSuggestionCard';
import { analyzeHtml } from './services/geminiService';
import { applySuggestion } from './services/htmlApplier';
import { useHtmlHistory } from './hooks/useHtmlHistory';
import { Suggestion, AnalysisResult } from './types';

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale-1.0">
  <title>프리미엄 세럼 - 24시간 보습 지속</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }
    img { max-width: 100%; height: auto; border-radius: 10px; }
    h1 { font-size: 32px; }
    p { line-height: 1.6; }
    ul { padding-left: 20px; }
  </style>
</head>
<body>
  <h1>프리미엄 세럼</h1>
  <img src="https://picsum.photos/800/500" alt="제품 이미지">
  
  <h2>제품 설명</h2>
  <p>피부에 좋은 제품입니다. 보습 효과가 뛰어납니다.</p>
  
  <h2>특징</h2>
  <ul>
    <li>24시간 보습 지속</li>
    <li>피부과 테스트 완료</li>
    <li>무향, 무알코올</li>
  </ul>
</body>
</html>`;

export default function App() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    currentHtml,
    addHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHtmlHistory(SAMPLE_HTML);
  
  // Use a separate state for the editor to allow typing without affecting history
  const [editorValue, setEditorValue] = useState(currentHtml);
  
  // Sync editor when history changes
  React.useEffect(() => {
    setEditorValue(currentHtml);
  }, [currentHtml]);


  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    setError(null);
    setSuggestions([]);
    try {
      const result: AnalysisResult = await analyzeHtml(currentHtml);
      const suggestionsWithMeta = result.suggestions.map((s) => ({
        ...s,
        id: crypto.randomUUID(),
        applied: false,
      }));
      setSuggestions(suggestionsWithMeta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentHtml]);

  const handleApply = useCallback(async (suggestion: Suggestion) => {
    setApplyingId(suggestion.id);
    setError(null);
    
    // Use a timeout to allow the UI to update to the "Applying..." state
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const result = applySuggestion(currentHtml, suggestion);
      if (result.success) {
        addHistory(result.newHtml, `Applied: ${suggestion.message}`, suggestion.id);
        setSuggestions(prev =>
          prev.map(s =>
            s.id === suggestion.id
              ? { ...s, applied: true, appliedAt: new Date() }
              : s
          )
        );
      } else {
        setError(`Failed to apply suggestion: ${result.error}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during application.');
    } finally {
      setApplyingId(null);
    }
  }, [currentHtml, addHistory]);

  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo();
  }, [redo]);

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-gray-100 font-sans">
      <header className="bg-gray-800 border-b border-gray-700 p-3 flex justify-between items-center shadow-md z-10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          🚀 Page Evolve - Sprint 2
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={handleUndo} disabled={!canUndo} className="px-3 py-1.5 text-sm font-semibold bg-gray-700 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors" title="Undo (Ctrl+Z)">
            ↶ Undo
          </button>
          <button onClick={handleRedo} disabled={!canRedo} className="px-3 py-1.5 text-sm font-semibold bg-gray-700 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors" title="Redo (Ctrl+Y)">
            Redo ↷
          </button>
          <button onClick={handleAnalyze} disabled={isAnalyzing} className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-md disabled:opacity-50 disabled:cursor-wait hover:from-purple-700 hover:to-pink-700 transition-all">
            {isAnalyzing ? 'Analyzing...' : '🤖 AI Analyze'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className="w-1/3 flex flex-col border-r border-gray-700">
            <h2 className="p-3 text-lg font-bold border-b border-gray-700 bg-gray-800">📝 HTML Editor</h2>
            <div className="flex-1">
                <HtmlEditor value={editorValue} onChange={setEditorValue} />
            </div>
        </div>
        
        <div className="w-1/3 flex flex-col border-r border-gray-700">
            <h2 className="p-3 text-lg font-bold border-b border-gray-700 bg-gray-800">👁️ Live Preview</h2>
            <div className="flex-1 bg-white">
                <PreviewPanel html={currentHtml} />
            </div>
        </div>
        
        <div className="w-1/3 flex flex-col overflow-y-auto">
            <h2 className="p-3 text-lg font-bold border-b border-gray-700 bg-gray-800 sticky top-0 z-10">💡 AI Suggestions</h2>
            <div className="p-4 space-y-4">
                {error && (
                    <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
                        <strong>Error:</strong> {error}
                    </div>
                )}
                {isAnalyzing && <p className="text-gray-400">Analyzing your page...</p>}
                {!isAnalyzing && suggestions.length === 0 && (
                    <div className="text-center text-gray-500 pt-8">
                        <p>Click "AI Analyze" to get improvement suggestions.</p>
                    </div>
                )}
                {suggestions.map(suggestion => (
                    <AiSuggestionCard
                        key={suggestion.id}
                        suggestion={suggestion}
                        onApply={handleApply}
                        isApplying={applyingId === suggestion.id}
                    />
                ))}
            </div>
        </div>
      </main>
    </div>
  );
}
