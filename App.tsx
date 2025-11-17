import React, { useState, useCallback, useEffect, useRef } from 'react';
import HtmlEditor from './components/HtmlEditor';
import PreviewPanel from './components/PreviewPanel';
import AiSuggestionCard from './components/AiSuggestionCard';
import ImageUploader from './components/ImageUploader';
import ImageLibrary from './components/ImageLibrary';
import SeoPanel from './components/SeoPanel';
import ReferencePanel from './components/ReferencePanel';
import SlicingControls from './components/SlicingControls';
import EnhancedFeedbackPanel from './components/EnhancedFeedbackPanel';
import { analyzeHtml, applyFeedbackToHtml, generateFeedbackSuggestions } from './services/geminiService';
import { applySuggestion } from './services/htmlApplier';
import { analyzeSeo } from './services/seoAnalyzer';
import { createProjectData, loadProjectFromFile, downloadProject } from './services/projectService';
import { exportPreviewAsImage, exportFullPageAsImage } from './services/exportService';
import { useImageUpload } from './hooks/useImageUpload';
import { usePageEvolve } from './contexts/PageEvolveContext';
import { useFeedback } from './contexts/FeedbackContext';
import { Suggestion, AnalysisResult, ImagePosition, Reference, ProjectData, HtmlHistory } from './types';
import { CONFIG } from './config/constants';

export default function App() {
  const {
    currentHtml,
    history,
    currentIndex,
    addHistory,
    updateCurrentHistoryEntry,
    undo,
    redo,
    canUndo,
    canRedo,
    loadHistory,
    suggestions,
    setSuggestions,
    isAnalyzing,
    setIsAnalyzing,
    applyingId,
    setApplyingId,
    seoAnalysis,
    setSeoAnalysis,
    isAnalyzingSeo,
    setIsAnalyzingSeo,
    references,
    setReferences,
    activeTab,
    setActiveTab,
    showEditor,
    setShowEditor,
    error,
    setError,
    projectName,
    setProjectName,
    isExporting,
    setIsExporting,
    isSlicingMode,
    setIsSlicingMode,
    slicePositions,
    setSlicePositions,
  } = usePageEvolve();

  const {
    userFeedback,
    setUserFeedback,
    feedbackHistory,
    addFeedbackToHistory,
    clearFeedbackHistory,
    isApplyingFeedback,
    setIsApplyingFeedback,
    feedbackError,
    setFeedbackError,
    selectedTemplate,
    setSelectedTemplate,
    aiSuggestions,
    setAiSuggestions,
    isGeneratingSuggestions,
    setIsGeneratingSuggestions,
  } = useFeedback();

  const {
    images,
    isUploading,
    uploadError,
    analyzingImageId,
    uploadImages,
    analyzeImage,
    removeImage,
    loadUploadedImages,
  } = useImageUpload(currentHtml);

  const [isDragging, setIsDragging] = useState(false);
  const loadFileInputRef = useRef<HTMLInputElement>(null);

  // Load showEditor state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(CONFIG.STORAGE.EDITOR_STATE_KEY);
    if (savedState) {
      setShowEditor(savedState === 'true');
    }
  }, [setShowEditor]);

  // Save showEditor state to localStorage
  useEffect(() => {
    localStorage.setItem(CONFIG.STORAGE.EDITOR_STATE_KEY, String(showEditor));
  }, [showEditor]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setShowEditor(prev => !prev);
      }
      if (e.key === 'Escape') {
        if (isSlicingMode) {
          handleCancelSlicing();
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isSlicingMode, setShowEditor]);

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
  }, [currentHtml, setIsAnalyzing, setError, setSuggestions, setActiveTab]);

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
  }, [currentHtml, setIsAnalyzingSeo, setError, setSeoAnalysis, setActiveTab]);

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
  }, [currentHtml, addHistory, setApplyingId, setError, setSuggestions]);

  const handleApplyFeedback = useCallback(async () => {
    if (!userFeedback.trim()) {
      alert("Please enter your feedback first.");
      return;
    }
    setIsApplyingFeedback(true);
    setFeedbackError(null);
    setError(null);

    // Get previous changes from feedback history
    const previousChanges = feedbackHistory
      .filter(h => h.success)
      .slice(0, 3)
      .map(h => h.feedback);

    try {
      const newHtml = await applyFeedbackToHtml(currentHtml, userFeedback, {
        previousChanges,
      });

      if (!newHtml.trim().toLowerCase().includes('<html')) {
        throw new Error("AI returned an invalid response. It might be a note or a question. Please try rephrasing your feedback to be more specific.");
      }

      addHistory(newHtml, `Applied user feedback: ${userFeedback.slice(0, 50)}...`);

      // Add to feedback history
      addFeedbackToHistory({
        feedback: userFeedback,
        htmlBefore: currentHtml,
        htmlAfter: newHtml,
        success: true,
      });

      // Clear the input after successful application
      setUserFeedback('');
      setAiSuggestions([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setFeedbackError(message);

      // Add failed attempt to history
      addFeedbackToHistory({
        feedback: userFeedback,
        htmlBefore: currentHtml,
        htmlAfter: currentHtml,
        success: false,
        error: message,
      });
    } finally {
      setIsApplyingFeedback(false);
    }
  }, [
    currentHtml,
    userFeedback,
    feedbackHistory,
    addHistory,
    addFeedbackToHistory,
    setIsApplyingFeedback,
    setFeedbackError,
    setError,
    setUserFeedback,
    setAiSuggestions,
  ]);

  const handleGenerateFeedbackSuggestions = useCallback(async () => {
    if (!userFeedback.trim() || userFeedback.length < 5) {
      return;
    }

    setIsGeneratingSuggestions(true);
    try {
      const suggestions = await generateFeedbackSuggestions(userFeedback, currentHtml);
      setAiSuggestions(suggestions);
    } catch (err) {
      console.error('Failed to generate suggestions:', err);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  }, [userFeedback, currentHtml, setIsGeneratingSuggestions, setAiSuggestions]);

  const handleReapplyFeedback = useCallback((feedback: string) => {
    setUserFeedback(feedback);
    setActiveTab('feedback');
  }, [setUserFeedback, setActiveTab]);

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
  }, [currentHtml, addHistory, setError]);

  const handleSaveProject = useCallback(() => {
    const projectData = createProjectData(
      projectName,
      currentHtml,
      suggestions,
      images,
      seoAnalysis,
      history as HtmlHistory[],
      currentIndex
    );
    downloadProject(projectData);
  }, [projectName, currentHtml, suggestions, images, seoAnalysis, history, currentIndex]);

  const restoreProjectState = useCallback((project: ProjectData) => {
    setProjectName(project.name);
    setSuggestions(project.suggestions);
    setSeoAnalysis(project.seoAnalysis);
    loadHistory(project.history, project.historyIndex);
    loadUploadedImages(project.images);
  }, [loadHistory, loadUploadedImages, setProjectName, setSuggestions, setSeoAnalysis]);

  const handleLoadProjectFile = useCallback(async (file: File) => {
    try {
      const projectData = await loadProjectFromFile(file);
      restoreProjectState(projectData);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to load project file.');
    }
  }, [restoreProjectState]);

  const handleExportImage = useCallback(async (type: 'visible' | 'full') => {
    setIsExporting(true);
    try {
      const service = type === 'visible' ? exportPreviewAsImage : exportFullPageAsImage;
      const fileName = `${projectName.replace(/\s+/g, '_')}_${type}.png`;
      await service('preview-iframe', fileName);
    } catch (err) {
      alert('Export failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsExporting(false);
    }
  }, [projectName, setIsExporting]);

  const handleAddReference = useCallback(() => {
    const newRef: Reference = {
      id: crypto.randomUUID(),
      title: `Reference - ${new Date().toLocaleString()}`,
      category: 'Uncategorized',
      tags: [],
      content: currentHtml,
      notes: 'Saved from current page',
      createdAt: new Date(),
      isFavorite: false,
    };
    setReferences(prev => [newRef, ...prev]);
    setActiveTab('references');
  }, [currentHtml, setReferences, setActiveTab]);

  const handleDeleteReference = useCallback((id: string) => {
    setReferences(prev => prev.filter(ref => ref.id !== id));
  }, [setReferences]);

  const handleInsertReference = useCallback((content: string) => {
    addHistory(content, 'Loaded from reference');
  }, [addHistory]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length === 1) {
      handleLoadProjectFile(e.dataTransfer.files[0]);
    } else {
      alert('Please drop a single project file.');
    }
  }, [handleLoadProjectFile]);

  const handleCancelSlicing = useCallback(() => {
    setIsSlicingMode(false);
    setSlicePositions([]);
  }, [setIsSlicingMode, setSlicePositions]);

  const handleToggleSlicingMode = useCallback(() => {
    setIsSlicingMode(prev => !prev);
    if (isSlicingMode) {
      handleCancelSlicing();
    }
  }, [isSlicingMode, handleCancelSlicing, setIsSlicingMode]);

  const handleExportSlices = useCallback(async () => {
    if (slicePositions.length === 0) {
      alert("Please add at least one slice line by clicking in the preview.");
      return;
    }
    setIsExporting(true);
    try {
      const fileName = `${projectName.replace(/\s+/g, '_')}_sliced.png`;
      await exportFullPageAsImage('preview-iframe', fileName, slicePositions);
    } catch (err) {
      alert('Export failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsExporting(false);
      handleCancelSlicing();
    }
  }, [projectName, slicePositions, handleCancelSlicing, setIsExporting]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      {isDragging && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 pointer-events-none">
          <div className="p-8 border-4 border-dashed border-purple-500 rounded-lg">
            <h2 className="text-2xl font-bold text-white">Drop Project File to Load</h2>
          </div>
        </div>
      )}
      <header className="flex justify-between items-center p-3 bg-gray-800 border-b border-gray-700 z-20">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🚀 Page Evolve
          </h1>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-gray-700 text-sm rounded px-2 py-1 border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:outline-none w-48"
            placeholder="Untitled Project"
            title="Project Name"
          />
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowEditor(prev => !prev)} className={`px-3 py-1.5 rounded-md font-semibold text-sm transition-all ${showEditor ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`} title="Toggle Editor (Ctrl+E)">{showEditor ? 'Hide Editor' : 'Show Editor'}</button>
          <button onClick={handleSaveProject} className="px-3 py-1.5 text-sm font-semibold bg-blue-600 rounded-md hover:bg-blue-700 transition-colors" title="Save Project">💾 Save</button>
          <button onClick={() => loadFileInputRef.current?.click()} className="px-3 py-1.5 text-sm font-semibold bg-blue-600 rounded-md hover:bg-blue-700 transition-colors" title="Load Project">📂 Load</button>
          <input type="file" ref={loadFileInputRef} onChange={(e) => e.target.files && handleLoadProjectFile(e.target.files[0])} className="hidden" accept=".json" />

          <button onClick={undo} disabled={!canUndo} className="px-3 py-1.5 text-sm font-semibold bg-gray-700 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors" title="Undo (Ctrl+Z)">↶ Undo</button>
          <button onClick={redo} disabled={!canRedo} className="px-3 py-1.5 text-sm font-semibold bg-gray-700 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors" title="Redo (Ctrl+Y)">Redo ↷</button>
          <button onClick={handleSeoAnalyze} disabled={isAnalyzingSeo} className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-md disabled:opacity-50">{isAnalyzingSeo ? 'Checking...' : '📊 SEO Check'}</button>
          <button onClick={handleAnalyze} disabled={isAnalyzing} className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-md disabled:opacity-50">{isAnalyzing ? 'Analyzing...' : '🤖 AI Analyze'}</button>
        </div>
      </header>

      <main className={`flex-1 grid overflow-hidden relative ${showEditor ? 'grid-cols-[1.2fr_2fr_1fr]' : 'grid-cols-[1fr_450px]'}`}>
        {isSlicingMode && <SlicingControls sliceCount={slicePositions.length + 1} onExport={handleExportSlices} onCancel={handleCancelSlicing} isExporting={isExporting} />}

        {showEditor && (
          <div className="flex flex-col border-r border-gray-700 min-h-0">
            <div className="flex border-b border-gray-700 shrink-0">
              <div className={`flex-1 p-3 text-sm font-bold bg-gray-900 text-purple-400`}>
                &lt;/&gt; HTML Editor
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <HtmlEditor
                language="html"
                value={currentHtml}
                onChange={updateCurrentHistoryEntry}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col border-r border-gray-700 min-h-0">
          <div className="p-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-bold">👁️ Live Preview</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => handleExportImage('visible')} disabled={isExporting || isSlicingMode} className="px-3 py-1 text-xs font-semibold bg-green-700 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50">{isExporting ? '...' : '📷 Export View'}</button>
              <button onClick={() => handleExportImage('full')} disabled={isExporting || isSlicingMode} className="px-3 py-1 text-xs font-semibold bg-green-700 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50">{isExporting ? '...' : '📜 Export Full'}</button>
              <button onClick={handleToggleSlicingMode} disabled={isExporting} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors disabled:opacity-50 ${isSlicingMode ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}>{isSlicingMode ? 'Cancel Slicing' : '✂️ Slice Export'}</button>
            </div>
          </div>
          <div className="flex-1 bg-white min-h-0">
            <PreviewPanel
              html={currentHtml}
              isSlicingMode={isSlicingMode}
              slicePositions={slicePositions}
              onSlicePositionsChange={setSlicePositions}
            />
          </div>
        </div>

        <div className="flex flex-col bg-gray-800 min-h-0">
          <div className="flex border-b border-gray-700 shrink-0">
            <button onClick={() => setActiveTab('suggestions')} className={`flex-1 p-3 text-sm font-bold transition-colors ${activeTab === 'suggestions' ? 'bg-gray-900 text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:bg-gray-700'}`}>💡 Suggestions</button>
            <button onClick={() => setActiveTab('images')} className={`flex-1 p-3 text-sm font-bold transition-colors ${activeTab === 'images' ? 'bg-gray-900 text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:bg-gray-700'}`}>🖼️ Images ({images.length})</button>
            <button onClick={() => setActiveTab('feedback')} className={`flex-1 p-3 text-sm font-bold transition-colors ${activeTab === 'feedback' ? 'bg-gray-900 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:bg-gray-700'}`}>✍️ 내 피드백</button>
            <button onClick={() => setActiveTab('seo')} className={`flex-1 p-3 text-sm font-bold transition-colors ${activeTab === 'seo' ? 'bg-gray-900 text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:bg-gray-700'}`}>
              📊 SEO
              {seoAnalysis && <span className={`font-bold ml-1 ${seoAnalysis.score >= 80 ? 'text-green-400' : seoAnalysis.score > 50 ? 'text-yellow-400' : 'text-red-400'}`}>({seoAnalysis.score})</span>}
            </button>
            <button onClick={() => setActiveTab('references')} className={`flex-1 p-3 text-sm font-bold transition-colors ${activeTab === 'references' ? 'bg-gray-900 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:bg-gray-700'}`}>📚 Refs ({references.length})</button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === 'suggestions' && (
              <div className="p-4 space-y-4">
                {error && !uploadError && <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm"><strong>Error:</strong> {error}</div>}
                {isAnalyzing && <div className="text-center text-gray-400 p-8"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-3"></div><p>Analyzing your page...</p></div>}
                {!isAnalyzing && suggestions.length === 0 && <div className="text-center text-gray-500 pt-8 space-y-3"><p>Click "🤖 AI Analyze" to get improvement suggestions.</p></div>}
                {suggestions.map(suggestion => <AiSuggestionCard key={suggestion.id} suggestion={suggestion} onApply={handleApply} isApplying={applyingId === suggestion.id} />)}
              </div>
            )}
            {activeTab === 'images' && (
              <div>
                <ImageUploader onUpload={uploadImages} isUploading={isUploading} />
                {(uploadError || (error && activeTab === 'images')) && <div className="mx-4 mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">{uploadError || error}</div>}
                <ImageLibrary images={images} analyzingImageId={analyzingImageId} onAnalyze={analyzeImage} onInsert={handleImageInsert} onDelete={removeImage} />
              </div>
            )}
            {activeTab === 'feedback' && (
              <EnhancedFeedbackPanel
                feedback={userFeedback}
                onFeedbackChange={setUserFeedback}
                onSubmit={handleApplyFeedback}
                isApplying={isApplyingFeedback}
                error={feedbackError}
                feedbackHistory={feedbackHistory}
                onClearHistory={clearFeedbackHistory}
                onReapplyFeedback={handleReapplyFeedback}
                aiSuggestions={aiSuggestions}
                onGenerateSuggestions={handleGenerateFeedbackSuggestions}
                isGeneratingSuggestions={isGeneratingSuggestions}
              />
            )}
            {activeTab === 'seo' && <SeoPanel analysis={seoAnalysis} isAnalyzing={isAnalyzingSeo} />}
            {activeTab === 'references' && <ReferencePanel references={references} onAdd={handleAddReference} onDelete={handleDeleteReference} onInsert={handleInsertReference} />}
          </div>
        </div>
      </main>
    </div>
  );
}
