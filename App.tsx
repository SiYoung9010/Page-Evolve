import React, { useState, useCallback, useEffect } from 'react';
import HtmlEditor from './components/HtmlEditor';
import PreviewPanel from './components/PreviewPanel';
import AiSuggestionCard from './components/AiSuggestionCard';
import ImageUploader from './components/ImageUploader';
import ImageLibrary from './components/ImageLibrary';
import SeoPanel from './components/SeoPanel';
import { analyzeHtml } from './services/geminiService';
import { applySuggestion } from './services/htmlApplier';
import { analyzeSeo } from './services/seoAnalyzer';
import { useHtmlHistory } from './hooks/useHtmlHistory';
import { useImageUpload } from './hooks/useImageUpload';
import { Suggestion, AnalysisResult, ImagePosition, SeoAnalysis } from './types';

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>프리미엄 세럼</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }
    img { max-width: 100%; height: auto; border-radius: 10px; }
    h1 { font-size: 32px; }
    h2 { font-size: 24px; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 40px;}
    p { line-height: 1.6; }
    ul { padding-left: 20px; }
  </style>
</head>
<body>
  <h1>프리미엄 세럼 - 24시간 보습 지속</h1>
  <img src="https://picsum.photos/800/500">
  
  <h2>제품 설명</h2>
  <p>피부에 좋은 제품입니다. 이 프리미엄 세럼은 보습 효과가 뛰어납니다.</p>
  
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
  const [activeTab, setActiveTab] = useState<'suggestions' | 'images' | 'seo'>('suggestions');
  const [seoAnalysis, setSeoAnalysis] = useState<SeoAnalysis | null>(null);
  const [isAnalyzingSeo, setIsAnalyzingSeo] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

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

  // Load editor visibility state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('pageEvolve-showEditor');
    if (savedState) {
      setShowEditor(savedState === 'true');
    }
  }, []);

  // Save editor visibility state to localStorage on change
  useEffect(() => {
    localStorage.setItem('pageEvolve-showEditor', String(showEditor));
  }, [showEditor]);
  
  // Add keyboard shortcut for toggling the editor
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setShowEditor(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);
  
  useEffect(() => {
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
      setActiveTab('suggestions');
    } catch (err) {
      setError(err instanceof Error ? `AI Analysis Failed: ${err.message}\nPlease check your HTML structure.` : 'An unknown error occurred during AI analysis');
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentHtml]);
  
  const handleSeoAnalyze = useCallback(() => {
    setIsAnalyzingSeo(true);
    setError(null);
    try {
      const analysis = analyzeSeo(currentHtml);
      setSeoAnalysis(analysis);
      setActiveTab('seo');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SEO analysis failed');
    } finally {
      setIsAnalyzingSeo(false);
    }
  }, [currentHtml]);

  const handleApply = useCallback(async (suggestion: Suggestion) => {
    setApplyingId(suggestion.id);
    setError(null);
    
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
        applied: true,
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
  
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="flex justify-between items-center p-3 bg-gray-800 border-b border-gray-700 z-20">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🚀 Page Evolve
          </h1>
          
          <button
            onClick={() => setShowEditor(!showEditor)}
            className={`px-3 py-1.5 rounded-md font-semibold text-sm transition-all ${
              showEditor 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            title="Toggle Editor (Ctrl+E)"
          >
            {showEditor ? '📝 Hide Editor' : '📝 Edit HTML'}
          </button>
        </div>
        
        <div className="flex gap-2">
           <button
            onClick={undo}
            disabled={!canUndo}
            className="px-3 py-1.5 text-sm font-semibold bg-gray-700 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors" title="Undo (Ctrl+Z)">
            ↶ Undo
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="px-3 py-1.5 text-sm font-semibold bg-gray-700 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors" title="Redo (Ctrl+Y)">
            Redo ↷
          </button>
          <button
            onClick={handleSeoAnalyze}
            disabled={isAnalyzingSeo}
            className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-md disabled:opacity-50"
          >
            {isAnalyzingSeo ? 'Checking...' : '📊 SEO Check'}
          </button>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-md disabled:opacity-50"
          >
            {isAnalyzing ? 'Analyzing...' : '🤖 AI Analyze'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {showEditor && (
          <div className="w-[600px] flex flex-col border-r border-gray-700 shrink-0">
            <div className="p-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold">📝 HTML Editor</h2>
              <button
                onClick={() => {
                  if (editorValue !== currentHtml) {
                    addHistory(editorValue, 'Manual edit');
                  }
                  setShowEditor(false);
                }}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm font-semibold"
              >
                ✓ Save & Close
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <HtmlEditor value={editorValue} onChange={setEditorValue} />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col border-r border-gray-700 min-w-0">
          <div className="p-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-bold">👁️ Live Preview</h2>
            <div className="text-sm text-gray-400">
              {!showEditor && '💡 Press Ctrl+E or click "Edit HTML" to modify the code'}
            </div>
          </div>
          <div className="flex-1 bg-white min-h-0">
            <PreviewPanel html={currentHtml} />
          </div>
        </div>

        <div className="w-[450px] flex flex-col shrink-0 bg-gray-800">
          <div className="flex border-b border-gray-700 shrink-0">
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`flex-1 p-3 text-sm font-bold transition-colors ${
                activeTab === 'suggestions'
                  ? 'bg-gray-900 text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:bg-gray-700'
              }`}
            >
              💡 AI Suggestions
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`flex-1 p-3 text-sm font-bold transition-colors ${
                activeTab === 'images'
                  ? 'bg-gray-900 text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:bg-gray-700'
              }`}
            >
              🖼️ Images ({images.length})
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`flex-1 p-3 text-sm font-bold transition-colors ${
                activeTab === 'seo'
                  ? 'bg-gray-900 text-green-400 border-b-2 border-green-400'
                  : 'text-gray-400 hover:bg-gray-700'
              }`}
            >
              📊 SEO
              {seoAnalysis && (
                <span className={`font-bold ml-1 ${
                  seoAnalysis.score >= 80 ? 'text-green-400' :
                  seoAnalysis.score > 50 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  ({seoAnalysis.score})
                </span>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === 'suggestions' && (
              <div className="p-4 space-y-4">
                {error && !uploadError && (
                  <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
                    <strong>Error:</strong> {error}
                  </div>
                )}
                {isAnalyzing && (
                  <div className="text-center text-gray-400 p-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-3"></div>
                    <p>Analyzing your page...</p>
                  </div>
                )}
                {!isAnalyzing && suggestions.length === 0 && (
                  <div className="text-center text-gray-500 pt-8 space-y-3">
                    <p>Click "🤖 AI Analyze" to get improvement suggestions.</p>
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
                {(uploadError || (error && activeTab === 'images')) && (
                  <div className="mx-4 mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
                    {uploadError || error}
                  </div>
                )}
                <ImageLibrary
                  images={images}
                  analyzingImageId={analyzingImageId}
                  onAnalyze={analyzeImage}
                  onInsert={handleImageInsert}
                  onDelete={removeImage}
                />
              </div>
            )}

            {activeTab === 'seo' && (
              <SeoPanel analysis={seoAnalysis} isAnalyzing={isAnalyzingSeo} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
