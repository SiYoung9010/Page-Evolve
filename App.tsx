

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import HtmlEditor from './components/HtmlEditor';
import PreviewPanel from './components/PreviewPanel';
import AiSuggestionCard from './components/AiSuggestionCard';
import ImageUploader from './components/ImageUploader';
import ImageLibrary from './components/ImageLibrary';
import SeoPanel from './components/SeoPanel';
import ReferencePanel from './components/ReferencePanel';
import BlockFeedbackPopup from './components/BlockFeedbackPopup';
import SlicingControls from './components/SlicingControls';
import { analyzeHtml, applyBlockFeedback, convertHtmlToPagePlan } from './services/geminiService';
import { applySuggestion } from './services/pagePlanApplier';
import { analyzeSeo } from './services/seoAnalyzer';
import { createProjectData, downloadProject, loadProjectFromFile, saveRecentProjects, loadRecentProjects } from './services/projectService';
import { exportPreviewAsImage, exportFullPageAsImage } from './services/exportService';
import { generateHtml } from './services/htmlGenerator';
import { usePagePlanHistory } from './hooks/usePagePlanHistory';
import { useImageUpload } from './hooks/useImageUpload';
import { Suggestion, AnalysisResult, ImagePosition, SeoAnalysis, Reference, ProjectMetadata, ProjectData, PagePlan } from './types';
import DOMPurify from 'dompurify';

const SAMPLE_PAGE_PLAN: PagePlan = {
  title: '프리미엄 세럼',
  blocks: [
    { id: crypto.randomUUID(), type: 'heading', level: 1, content: '프리미엄 세럼 - 24시간 보습 지속' },
    { id: crypto.randomUUID(), type: 'image', content: 'https://picsum.photos/800/500' },
    { id: crypto.randomUUID(), type: 'heading', level: 2, content: '제품 설명' },
    { id: crypto.randomUUID(), type: 'text', content: '피부에 좋은 제품입니다. 이 프리미엄 세럼은 보습 효과가 뛰어납니다.' },
    { id: crypto.randomUUID(), type: 'heading', level: 2, content: '특징' },
    { id: crypto.randomUUID(), type: 'list', content: ['24시간 보습 지속', '피부과 테스트 완료', '무향, 무알코올'] },
  ]
};

const SAMPLE_HTML_INPUT = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>프리미엄 세럼</title>
</head>
<body>
  <h1>프리미엄 세럼 - 24시간 보습 지속</h1>
  <img src="https://picsum.photos/800/500" alt="세럼 제품 이미지">
  <h2>제품 설명</h2>
  <p>피부에 좋은 제품입니다. <b>이 프리미엄 세럼은</b> 보습 효과가 뛰어납니다.</p>
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
  const [activeTab, setActiveTab] = useState<'suggestions' | 'images' | 'seo' | 'references'>('suggestions');
  const [seoAnalysis, setSeoAnalysis] = useState<SeoAnalysis | null>(null);
  const [isAnalyzingSeo, setIsAnalyzingSeo] = useState(false);
  const [showEditor, setShowEditor] = useState(true);
  
  const [projectName, setProjectName] = useState('Untitled Project');
  const [isExporting, setIsExporting] = useState(false);
  const [references, setReferences] = useState<Reference[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const loadFileInputRef = useRef<HTMLInputElement>(null);

  // Editor states
  const [editorTab, setEditorTab] = useState<'html' | 'json'>('json');
  const [htmlInput, setHtmlInput] = useState<string>(SAMPLE_HTML_INPUT);
  const [isConverting, setIsConverting] = useState(false);

  // Block feedback states (JSON-based)
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [selectedBlockType, setSelectedBlockType] = useState<string | null>(null);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [blockFeedbackText, setBlockFeedbackText] = useState('');
  const [isModifyingBlock, setIsModifyingBlock] = useState(false);

  // Image slicing states
  const [isSlicingMode, setIsSlicingMode] = useState(false);
  const [slicePositions, setSlicePositions] = useState<number[]>([]);

  const {
    currentPagePlan,
    history,
    currentIndex,
    addHistory,
    updateCurrentHistoryEntry,
    undo,
    redo,
    canUndo,
    canRedo,
    loadHistory,
  } = usePagePlanHistory(SAMPLE_PAGE_PLAN);
  
  const previewHtml = useMemo(() => generateHtml(currentPagePlan), [currentPagePlan]);
  
  const [jsonInput, setJsonInput] = useState(() => JSON.stringify(currentPagePlan, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const debounceTimeoutRef = useRef<number | null>(null);

  const {
    images,
    isUploading,
    uploadError,
    analyzingImageId,
    uploadImages,
    analyzeImage,
    removeImage,
    loadUploadedImages,
  } = useImageUpload(previewHtml);

  useEffect(() => {
    setJsonInput(JSON.stringify(currentPagePlan, null, 2));
    setJsonError(null);
  }, [currentPagePlan]);

  useEffect(() => {
    const savedState = localStorage.getItem('pageEvolve-showEditor');
    if (savedState) {
      setShowEditor(savedState === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pageEvolve-showEditor', String(showEditor));
  }, [showEditor]);
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setShowEditor(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowFeedbackPopup(false);
        setSelectedBlockIndex(null);
        if (isSlicingMode) {
          handleCancelSlicing();
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isSlicingMode]);
  
  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    setError(null);
    setSuggestions([]);
    try {
      const result: AnalysisResult = await analyzeHtml(previewHtml);
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
  }, [previewHtml]);
  
  const handleSeoAnalyze = useCallback(() => {
    setIsAnalyzingSeo(true);
    setError(null);
    try {
      const analysis = analyzeSeo(previewHtml);
      setSeoAnalysis(analysis);
      setActiveTab('seo');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SEO analysis failed');
    } finally {
      setIsAnalyzingSeo(false);
    }
  }, [previewHtml]);

  const handleApply = useCallback(async (suggestion: Suggestion) => {
    setApplyingId(suggestion.id);
    setError(null);
    
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const result = applySuggestion(currentPagePlan, suggestion, previewHtml);
      if (result.success) {
        addHistory(result.newPagePlan, `Applied: ${suggestion.message}`, suggestion.id);
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
  }, [currentPagePlan, addHistory, previewHtml]);

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
      
      const result = applySuggestion(currentPagePlan, suggestionForHistory, previewHtml);
      if (result.success) {
        addHistory(result.newPagePlan, `Image inserted near ${position.targetSelector}`);
      } else {
        setError(`Failed to insert image: ${result.error}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image insertion failed');
    }
  }, [currentPagePlan, addHistory, previewHtml]);
  
  const handleSaveProject = useCallback(() => {
    // ...
  }, [projectName, currentPagePlan, suggestions, images, seoAnalysis, history, currentIndex]);

  const restoreProjectState = useCallback((project: ProjectData) => {
    // ...
  }, [loadHistory, loadUploadedImages]);


  const handleLoadProjectFile = useCallback(async (file: File) => {
    // ...
  }, [restoreProjectState]);
  
  const handleExportImage = useCallback(async (type: 'visible' | 'full') => {
    // ...
  }, [projectName]);
  
  const handleAddReference = useCallback(() => {
    // ...
  }, [previewHtml]);

  const handleDeleteReference = useCallback((id: string) => {
    // ...
  }, []);

  const handleInsertReference = useCallback((content: string) => {
    // This needs to be converted to a PagePlan to be loaded.
    // For now, it will replace with a simple text block.
    const newPlan: PagePlan = { title: "Reference", blocks: [{id: crypto.randomUUID(), type: 'text', content: 'HTML from reference inserted. Needs conversion.'}] };
    addHistory(newPlan, 'Inserted from reference');
  }, [addHistory]);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);
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

    const handleBlockSelect = useCallback((index: number, type: string) => {
        setSelectedBlockIndex(index);
        setSelectedBlockType(type);
        setShowFeedbackPopup(true);
        setBlockFeedbackText(''); // Clear previous feedback
    }, []);

    const handleBlockFeedbackClose = useCallback(() => {
        setShowFeedbackPopup(false);
        setSelectedBlockIndex(null);
        setBlockFeedbackText('');
    }, []);

    const handleBlockFeedbackSubmit = useCallback(async () => {
        if (selectedBlockIndex === null || !blockFeedbackText.trim()) {
            setError('Block not selected or feedback is empty.');
            return;
        }

        setIsModifyingBlock(true);
        setError(null);

        try {
            const updatedPlan = await applyBlockFeedback(
                currentPagePlan,
                selectedBlockIndex,
                blockFeedbackText
            );
            addHistory(updatedPlan, `AI Modify block #${selectedBlockIndex}: ${blockFeedbackText.substring(0, 30)}...`);
            handleBlockFeedbackClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during block modification.');
        } finally {
            setIsModifyingBlock(false);
        }
    }, [currentPagePlan, selectedBlockIndex, blockFeedbackText, addHistory, handleBlockFeedbackClose]);
    
    const handleCancelSlicing = useCallback(() => {
        setIsSlicingMode(false);
        setSlicePositions([]);
    }, []);

    const handleToggleSlicingMode = useCallback(() => {
        setIsSlicingMode(prev => !prev);
        if (isSlicingMode) {
            handleCancelSlicing();
        }
    }, [isSlicingMode, handleCancelSlicing]);

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
    }, [projectName, slicePositions, handleCancelSlicing]);
    
    const handleJsonChange = useCallback((value: string | undefined) => {
        if (value === undefined) return;

        setJsonInput(value);
        setJsonError(null);

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = window.setTimeout(() => {
            try {
                const parsedPlan = JSON.parse(value);
                updateCurrentHistoryEntry(parsedPlan);
            } catch (e) {
                setJsonError("Invalid JSON structure. Please correct the syntax.");
            }
        }, 500);
    }, [updateCurrentHistoryEntry]);

    const handleConvertToPlan = useCallback(async () => {
        if (!htmlInput.trim()) {
            setError("HTML input is empty.");
            return;
        }
        setIsConverting(true);
        setError(null);
        try {
            const newPlan = await convertHtmlToPagePlan(htmlInput);
            newPlan.blocks = newPlan.blocks.map(block => ({...block, id: crypto.randomUUID()}));
            addHistory(newPlan, 'Converted from HTML');
            setEditorTab('json');
        } catch(err) {
            setError(err instanceof Error ? `Conversion failed: ${err.message}` : "An unknown error occurred during conversion.");
        } finally {
            setIsConverting(false);
        }
    }, [htmlInput, addHistory]);


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

      <main className={`flex-1 grid overflow-hidden relative ${showEditor ? 'grid-cols-[600px_1fr_450px]' : 'grid-cols-[1fr_450px]'}`}>
        {isSlicingMode && <SlicingControls sliceCount={slicePositions.length + 1} onExport={handleExportSlices} onCancel={handleCancelSlicing} isExporting={isExporting} />}

        {showEditor && (
          <div className="flex flex-col border-r border-gray-700 min-h-0">
            <div className="flex border-b border-gray-700 shrink-0">
                <button onClick={() => setEditorTab('html')} className={`flex-1 p-3 text-sm font-bold transition-colors ${editorTab === 'html' ? 'bg-gray-900 text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:bg-gray-700'}`}>
                    &lt;/&gt; HTML Input
                </button>
                <button onClick={() => setEditorTab('json')} className={`flex-1 p-3 text-sm font-bold transition-colors ${editorTab === 'json' ? 'bg-gray-900 text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:bg-gray-700'}`}>
                    &#123;&#125; JSON Data
                </button>
            </div>
            
            {editorTab === 'html' && (
                <div className="flex flex-col flex-1 min-h-0">
                    <div className="flex-1 min-h-0">
                        <HtmlEditor 
                            language="html"
                            value={htmlInput}
                            onChange={setHtmlInput}
                        />
                    </div>
                    <div className="p-2 border-t border-gray-700">
                        <button onClick={handleConvertToPlan} disabled={isConverting || !htmlInput.trim()} className="w-full px-4 py-2 rounded-md font-semibold text-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                            {isConverting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Converting...</span>
                                </>
                            ) : (
                                '🔄 Convert HTML to JSON'
                            )}
                        </button>
                    </div>
                </div>
            )}

            {editorTab === 'json' && (
                <div className="flex flex-col flex-1 min-h-0">
                    <div className="flex-1 min-h-0">
                      <HtmlEditor 
                        language="json"
                        value={jsonInput} 
                        onChange={handleJsonChange} 
                      />
                    </div>
                     {jsonError && (
                      <div className="p-2 bg-red-900 border-t border-red-500 text-red-200 text-xs font-mono">
                        <strong>Error:</strong> {jsonError}
                      </div>
                    )}
                </div>
            )}
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
                html={previewHtml}
                pagePlan={currentPagePlan}
                onBlockSelect={handleBlockSelect}
                selectedBlockIndex={selectedBlockIndex}
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
                {suggestions.map(suggestion => <AiSuggestionCard key={suggestion.id} suggestion={suggestion} onApply={handleApply} isApplying={applyingId === suggestion.id}/>)}
              </div>
            )}
            {activeTab === 'images' && (
              <div>
                <ImageUploader onUpload={uploadImages} isUploading={isUploading} />
                {(uploadError || (error && activeTab === 'images')) && <div className="mx-4 mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">{uploadError || error}</div>}
                <ImageLibrary images={images} analyzingImageId={analyzingImageId} onAnalyze={analyzeImage} onInsert={handleImageInsert} onDelete={removeImage}/>
              </div>
            )}
            {activeTab === 'seo' && <SeoPanel analysis={seoAnalysis} isAnalyzing={isAnalyzingSeo} />}
            {activeTab === 'references' && <ReferencePanel references={references} onAdd={handleAddReference} onDelete={handleDeleteReference} onInsert={handleInsertReference}/>}
          </div>
        </div>
      </main>
        <BlockFeedbackPopup
            visible={showFeedbackPopup}
            blockIndex={selectedBlockIndex}
            blockType={selectedBlockType}
            feedbackText={blockFeedbackText}
            isModifying={isModifyingBlock}
            onTextChange={setBlockFeedbackText}
            onSubmit={handleBlockFeedbackSubmit}
            onClose={handleBlockFeedbackClose}
        />
    </div>
  );
}