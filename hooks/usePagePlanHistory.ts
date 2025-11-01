// hooks/usePagePlanHistory.ts
import { useState, useCallback } from 'react';
import { PagePlan, PagePlanHistoryEntry } from '../types';

const MAX_HISTORY_LENGTH = 50;

export const usePagePlanHistory = (initialPlan: PagePlan) => {
  const [history, setHistory] = useState<PagePlanHistoryEntry[]>([
    {
      id: crypto.randomUUID(),
      plan: initialPlan,
      timestamp: new Date(),
      action: 'Initial State',
    },
  ]);
  
  const [currentIndex, setCurrentIndex] = useState(0);

  const addHistory = useCallback((
    plan: PagePlan,
    action: string,
    suggestionId?: string
  ) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      
      newHistory.push({
        id: crypto.randomUUID(),
        plan,
        timestamp: new Date(),
        action,
        suggestionId,
      });

      if (newHistory.length > MAX_HISTORY_LENGTH) {
        newHistory.shift();
      }
      
      setCurrentIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [currentIndex]);

  const updateCurrentHistoryEntry = useCallback((plan: PagePlan) => {
    setHistory(prev => {
        if (JSON.stringify(prev[currentIndex]?.plan) === JSON.stringify(plan)) {
            return prev;
        }
        const newHistory = [...prev];
        newHistory[currentIndex] = {
            ...newHistory[currentIndex],
            plan: plan,
            action: 'Manual Edit',
            timestamp: new Date(),
        };
        return newHistory;
    });
  }, [currentIndex]);
  
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, history]);
  
  const loadHistory = useCallback((newHistory: PagePlanHistoryEntry[], newIndex: number) => {
    if (Array.isArray(newHistory) && newHistory.length > 0 && newIndex >= 0 && newIndex < newHistory.length) {
      setHistory(newHistory);
      setCurrentIndex(newIndex);
    } else {
      console.error("Invalid history data provided for loading.");
    }
  }, []);

  const currentPagePlan = history[currentIndex]?.plan ?? initialPlan;
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
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
  };
};