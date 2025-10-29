import React, { useState, useCallback } from 'react';
import HtmlEditor from './components/HtmlEditor';
import PreviewPanel from './components/PreviewPanel';
import AiSuggestionCard from './components/AiSuggestionCard';
import ImageUploader from './components/ImageUploader';
import ImageLibrary from './components/ImageLibrary';
import { analyzeHtml } from './services/geminiService';
import { applySuggestion } from './services/htmlApplier';
import { useHtmlHistory } from './hooks/useHtmlHistory';
import { useImageUpload } from './hooks/useImageUpload';
import { Suggestion, AnalysisResult, ImagePosition } from './types';

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
  const [activeTab, setActiveTab] = useState<'suggestions' | 'images'>('suggestions');

  const {
    currentHtml,
    addHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHtmlHistory(SAMPLE_HTML);
  
  const [editorValue, setEditorValue] = useState(currentHtml);
  
  const {
    images,
    isUploading,
    uploadError,
    analyzingImageId,
    uploadImages,
    analyzeImage,
    removeImage,
  } = useImageUpload(currentHtml);
  
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
      setActiveTab('suggestions'); // Switch to suggestions tab after analysis
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentHtml]);

  const handleApply = useCallback(async (suggestion: Suggestion) => {
    setApplyingId(suggestion.id);
    setError(null);
    
    // Brief delay to allow UI to update
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

  const handleImageInsert = useCallback((codeWithSrc: string, position: ImagePosition) => {
    setError(null);
    try {
      const suggestionForHistory: Suggestion = {
        id: crypto.randomUUID(),
        type: 'image',
        priority: position.priority,
        message: `Image Inserted: ${position.reason}`,
        code: codeWithSrc,
        targetSelector: position.targetSelector,
        action: position.action,
        applied: true, // Mark as applied since it's a direct action
      };
      
      const result = applySuggestion(currentHtml, suggestionForHistory);
      if (result.success) {
        addHistory(result.newHtml, `Image inserted near ${position.targetSelector}`);
      } else {
        setError(`Failed to insert image: ${result.error}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image insertion failed');
    }
  }, [currentHtml, addHistory]);
  
  const handleEditorSync = () => {
      if (editorValue !== currentHtml) {
          addHistory(editorValue, "Manual Editor Sync");
      }
  };

  const isEditorSynced = editorValue === currentHtml;

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-gray-100 font-sans">
      <header className="bg-gray-800 border-b border-gray-700 p-3 flex justify-between items-center shadow-md z-20">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          🚀 Page Evolve
        </h1>
        <div className="flex items-center gap-2">
            <button onClick={handleEditorSync} disabled={isEditorSynced} className="px-3 py-1.5 text-sm font-semibold bg-green-700 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-600 transition-colors" title="Save manual edits to history">
                Sync Edits
            </button>
          <button onClick={undo} disabled={!canUndo} className="px-3 py-1.5 text-sm font-semibold bg-gray-700 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors" title="Undo (Ctrl+Z)">
            ↶ Undo
          </button>
          <button onClick={redo} disabled={!canRedo} className="px-3 py-1.5 text-sm font-semibold bg-gray-700 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors" title="Redo (Ctrl+Y)">
            Redo ↷
          </button>
          <button onClick={handleAnalyze} disabled={isAnalyzing} className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-md disabled:opacity-50 disabled:cursor-wait hover:from-purple-700 hover:to-pink-700 transition-all">
            {isAnalyzing ? 'Analyzing...' : '🤖 AI Analyze'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className="w-1/3 flex flex-col border-r border-gray-700">
            <h2 className="p-3 text-lg font-bold border-b border-gray-700 bg-gray-800 flex-shrink-0">📝 HTML Editor</h2>
            <div className="flex-1 min-h-0">
                <HtmlEditor value={editorValue} onChange={setEditorValue} />
            </div>
        </div>
        
        <div className="w-1/3 flex flex-col border-r border-gray-700">
            <h2 className="p-3 text-lg font-bold border-b border-gray-700 bg-gray-800 flex-shrink-0">👁️ Live Preview</h2>
            <div className="flex-1 bg-white min-h-0">
                <PreviewPanel html={currentHtml} />
            </div>
        </div>
        
        <div className="w-1/3 flex flex-col">
          <div className="flex border-b border-gray-700 bg-gray-800 flex-shrink-0">
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`flex-1 p-3 text-sm font-bold transition-colors ${activeTab === 'suggestions' ? 'bg-gray-900 text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:bg-gray-700'}`}
            >
              💡 AI Suggestions
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`flex-1 p-3 text-sm font-bold transition-colors ${activeTab === 'images' ? 'bg-gray-900 text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:bg-gray-700'}`}
            >
              🖼️ Images ({images.length})
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'suggestions' && (
              <div className="p-4 space-y-4">
                {error && <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm"><strong>Error:</strong> {error}</div>}
                {isAnalyzing && <p className="text-gray-400 text-center p-4">Analyzing your page...</p>}
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
            )}
            
            {activeTab === 'images' && (
              <div>
                <ImageUploader onUpload={uploadImages} isUploading={isUploading} />
                {(uploadError || error) && <div className="mx-4 mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">{uploadError || error}</div>}
                <ImageLibrary
                  images={images}
                  analyzingImageId={analyzingImageId}
                  onAnalyze={analyzeImage}
                  onInsert={handleImageInsert}
                  onDelete={removeImage}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
