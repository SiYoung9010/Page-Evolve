// hooks/useHtmlHistory.ts
import { useState, useCallback } from 'react';
import { HtmlHistory } from '../types';

const MAX_HISTORY_LENGTH = 20; // Maximum number of undo steps

export const useHtmlHistory = (initialHtml: string) => {
  const [history, setHistory] = useState<HtmlHistory[]>([
    {
      id: crypto.randomUUID(),
      html: initialHtml,
      timestamp: new Date(),
      action: 'Initial State',
    },
  ]);
  
  const [currentIndex, setCurrentIndex] = useState(0);

  /**
   * Adds a new entry to the history stack.
   * This clears any "redo" history that existed.
   */
  const addHistory = useCallback((
    html: string,
    action: string,
    suggestionId?: string
  ) => {
    setHistory(prev => {
      // Truncate history from the current point onwards
      const newHistory = prev.slice(0, currentIndex + 1);
      
      // Add the new state
      newHistory.push({
        id: crypto.randomUUID(),
        html,
        timestamp: new Date(),
        action,
        suggestionId,
      });

      // Trim the history if it exceeds the max length
      if (newHistory.length > MAX_HISTORY_LENGTH) {
        newHistory.shift(); // Remove the oldest item
      }
      
      // Update the current index to point to the new state
      setCurrentIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [currentIndex]);

  /**
   * Moves the current state back one step in history.
   */
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  /**
   * Moves the current state forward one step in history.
   */
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, history]);
  
  /**
   * Replaces the entire history state. Used for loading a project.
   */
  const loadHistory = useCallback((newHistory: HtmlHistory[], newIndex: number) => {
    if (Array.isArray(newHistory) && newHistory.length > 0 && newIndex >= 0 && newIndex < newHistory.length) {
      setHistory(newHistory);
      setCurrentIndex(newIndex);
    } else {
      console.error("Invalid history data provided for loading.");
    }
  }, []);


  const currentHtml = history[currentIndex]?.html ?? initialHtml;
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    currentHtml,
    history,
    currentIndex,
    addHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    loadHistory,
  };
};