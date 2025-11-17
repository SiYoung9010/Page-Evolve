import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Suggestion, SeoAnalysis, Reference, ProjectData } from '../types';
import { CroAnalysisResult } from '../types/cro';
import { useHtmlHistory } from '../hooks/useHtmlHistory';
import { createProjectData, loadProjectFromFile, downloadProject } from '../services/projectService';
import { SAMPLE_HTML_INPUT } from '../config/constants';

interface PageEvolveContextType {
  // HTML State
  currentHtml: string;
  history: any[];
  currentIndex: number;
  addHistory: (html: string, action: string, suggestionId?: string) => void;
  updateCurrentHistoryEntry: (html: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  loadHistory: (newHistory: any[], newIndex: number) => void;

  // Suggestions State
  suggestions: Suggestion[];
  setSuggestions: React.Dispatch<React.SetStateAction<Suggestion[]>>;
  isAnalyzing: boolean;
  setIsAnalyzing: React.Dispatch<React.SetStateAction<boolean>>;
  applyingId: string | null;
  setApplyingId: React.Dispatch<React.SetStateAction<string | null>>;

  // SEO State
  seoAnalysis: SeoAnalysis | null;
  setSeoAnalysis: React.Dispatch<React.SetStateAction<SeoAnalysis | null>>;
  isAnalyzingSeo: boolean;
  setIsAnalyzingSeo: React.Dispatch<React.SetStateAction<boolean>>;

  // CRO State
  croAnalysis: CroAnalysisResult | null;
  setCroAnalysis: React.Dispatch<React.SetStateAction<CroAnalysisResult | null>>;
  isAnalyzingCro: boolean;
  setIsAnalyzingCro: React.Dispatch<React.SetStateAction<boolean>>;

  // References State
  references: Reference[];
  setReferences: React.Dispatch<React.SetStateAction<Reference[]>>;

  // UI State
  activeTab: 'suggestions' | 'images' | 'seo' | 'references' | 'feedback' | 'product' | 'cro';
  setActiveTab: React.Dispatch<React.SetStateAction<'suggestions' | 'images' | 'seo' | 'references' | 'feedback' | 'product' | 'cro'>>;
  showEditor: boolean;
  setShowEditor: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;

  // Product Form State
  isGeneratingFromProduct: boolean;
  setIsGeneratingFromProduct: React.Dispatch<React.SetStateAction<boolean>>;

  // Project Management
  projectName: string;
  setProjectName: React.Dispatch<React.SetStateAction<string>>;
  isExporting: boolean;
  setIsExporting: React.Dispatch<React.SetStateAction<boolean>>;

  // Slicing State
  isSlicingMode: boolean;
  setIsSlicingMode: React.Dispatch<React.SetStateAction<boolean>>;
  slicePositions: number[];
  setSlicePositions: React.Dispatch<React.SetStateAction<number[]>>;
}

const PageEvolveContext = createContext<PageEvolveContextType | undefined>(undefined);

export const usePageEvolve = () => {
  const context = useContext(PageEvolveContext);
  if (!context) {
    throw new Error('usePageEvolve must be used within PageEvolveProvider');
  }
  return context;
};

interface PageEvolveProviderProps {
  children: ReactNode;
}

export const PageEvolveProvider: React.FC<PageEvolveProviderProps> = ({ children }) => {
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
  } = useHtmlHistory(SAMPLE_HTML_INPUT);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'suggestions' | 'images' | 'seo' | 'references' | 'feedback' | 'product' | 'cro'>('suggestions');
  const [seoAnalysis, setSeoAnalysis] = useState<SeoAnalysis | null>(null);
  const [isAnalyzingSeo, setIsAnalyzingSeo] = useState(false);
  const [croAnalysis, setCroAnalysis] = useState<CroAnalysisResult | null>(null);
  const [isAnalyzingCro, setIsAnalyzingCro] = useState(false);
  const [showEditor, setShowEditor] = useState(true);

  const [projectName, setProjectName] = useState('Untitled Project');
  const [isExporting, setIsExporting] = useState(false);
  const [references, setReferences] = useState<Reference[]>([]);

  const [isSlicingMode, setIsSlicingMode] = useState(false);
  const [slicePositions, setSlicePositions] = useState<number[]>([]);
  const [isGeneratingFromProduct, setIsGeneratingFromProduct] = useState(false);

  const value: PageEvolveContextType = {
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
    croAnalysis,
    setCroAnalysis,
    isAnalyzingCro,
    setIsAnalyzingCro,
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
    isGeneratingFromProduct,
    setIsGeneratingFromProduct,
  };

  return <PageEvolveContext.Provider value={value}>{children}</PageEvolveContext.Provider>;
};
