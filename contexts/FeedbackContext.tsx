import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface FeedbackHistoryItem {
  id: string;
  feedback: string;
  timestamp: Date;
  htmlBefore: string;
  htmlAfter: string;
  success: boolean;
  error?: string;
}

interface FeedbackContextType {
  // Current feedback
  userFeedback: string;
  setUserFeedback: React.Dispatch<React.SetStateAction<string>>;

  // Feedback history
  feedbackHistory: FeedbackHistoryItem[];
  addFeedbackToHistory: (item: Omit<FeedbackHistoryItem, 'id' | 'timestamp'>) => void;
  clearFeedbackHistory: () => void;

  // Loading & Error states
  isApplyingFeedback: boolean;
  setIsApplyingFeedback: React.Dispatch<React.SetStateAction<boolean>>;
  feedbackError: string | null;
  setFeedbackError: React.Dispatch<React.SetStateAction<string | null>>;

  // Template state
  selectedTemplate: string | null;
  setSelectedTemplate: React.Dispatch<React.SetStateAction<string | null>>;

  // AI Suggestions for feedback
  aiSuggestions: string[];
  setAiSuggestions: React.Dispatch<React.SetStateAction<string[]>>;
  isGeneratingSuggestions: boolean;
  setIsGeneratingSuggestions: React.Dispatch<React.SetStateAction<boolean>>;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return context;
};

interface FeedbackProviderProps {
  children: ReactNode;
}

export const FeedbackProvider: React.FC<FeedbackProviderProps> = ({ children }) => {
  const [userFeedback, setUserFeedback] = useState('');
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackHistoryItem[]>([]);
  const [isApplyingFeedback, setIsApplyingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  const addFeedbackToHistory = useCallback((item: Omit<FeedbackHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: FeedbackHistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setFeedbackHistory(prev => [newItem, ...prev].slice(0, 20)); // Keep last 20
  }, []);

  const clearFeedbackHistory = useCallback(() => {
    setFeedbackHistory([]);
  }, []);

  const value: FeedbackContextType = {
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
  };

  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>;
};
