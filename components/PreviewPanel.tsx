


import React, { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';

interface Props {
  html: string;
  onBlockSelect: (selector: string) => void;
  selectedSelector: string | null;
  isSlicingMode: boolean;
  slicePositions: number[];
  onSlicePositionsChange: (positions: number[]) => void;
}

const getCssSelector = (el: HTMLElement): string => {
  if (!(el instanceof Element)) return '';
  const path: string[] = [];
  while (el && el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase();
    if (el.id) {
      selector += '#' + el.id;
      path.unshift(selector);
      break;
    } else {
      let sib = el, nth = 1;
      while ((sib = sib.previousElementSibling as HTMLElement)) {
        if (sib.nodeName.toLowerCase() === selector) nth++;
      }
      if (nth !== 1) selector += `:nth-of-type(${nth})`;
    }
    path.unshift(selector);
    if (el.nodeName.toLowerCase() === 'body') {
        break;
    }
    el = el.parentElement as HTMLElement;
  }
  return path.join(' > ');
};


const PreviewPanel: React.FC<Props> = ({ html, onBlockSelect, selectedSelector, isSlicingMode, slicePositions, onSlicePositionsChange }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const lastSelectedElement = useRef<HTMLElement | null>(null);
  const [hoverY, setHoverY] = useState<number | null>(null);

  const sanitizedHtml = DOMPurify.sanitize(html, {
    WHOLE_DOCUMENT: true,
    ADD_TAGS: ['style'],
  });

  // Effect to manage event listeners inside the iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let cleanupFunc: (() => void) | undefined;
    
    const setupEventListeners = () => {
      if (cleanupFunc) cleanupFunc();
      
      const doc = iframe.contentDocument;
      if (!doc || !doc.body) return;
      
      const listeners: { type: string; listener: EventListener; target: EventTarget }[] = [];
      const addListener = (target: EventTarget, type: string, listener: EventListener) => {
        target.addEventListener(type, listener);
        listeners.push({ target, type, listener });
      };

      if (isSlicingMode) {
        doc.body.style.cursor = 'crosshair';
        
        const handleMouseMove = (e: MouseEvent) => setHoverY(e.pageY);
        const handleClick = (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          const newPositions = [...slicePositions, e.pageY].sort((a, b) => a - b);
          onSlicePositionsChange(newPositions);
        };
        const handleMouseLeave = () => setHoverY(null);
        
        addListener(doc.body, 'mousemove', handleMouseMove as EventListener);
        addListener(doc.body, 'click', handleClick as EventListener);
        addListener(doc.body, 'mouseleave', handleMouseLeave as EventListener);
      } else {
        doc.body.style.cursor = 'default';
        setHoverY(null);
        
        const handleClick = (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          
          let target = e.target as Node;
          // If the direct target is a text node, use its parent element instead.
          if (target.nodeType === Node.TEXT_NODE) {
            target = target.parentNode as Node;
          }

          if (target && target.nodeType === Node.ELEMENT_NODE) {
            const targetElement = target as HTMLElement;
            const selector = getCssSelector(targetElement);
            if (selector) { // Only proceed if we got a valid selector
              onBlockSelect(selector);
            }
          }
        };
        addListener(doc.body, 'click', handleClick as EventListener);
      }
      
      cleanupFunc = () => {
        if (doc && doc.body) doc.body.style.cursor = 'default';
        listeners.forEach(({ target, type, listener }) => {
          target.removeEventListener(type, listener);
        });
      };
    };

    const handleLoad = () => {
        // Run setup on load
        setupEventListeners();
    };
    
    iframe.addEventListener('load', handleLoad);
    // If iframe is already loaded (e.g., on dependency change), run setup
    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
      setupEventListeners();
    }
    
    return () => {
      iframe.removeEventListener('load', handleLoad);
      if (cleanupFunc) {
        cleanupFunc();
      }
    };
  }, [isSlicingMode, onBlockSelect, onSlicePositionsChange, slicePositions, html]);

  // Effect to manage visual selection highlight
  useEffect(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc || isSlicingMode) return;
    
    if (lastSelectedElement.current) {
        lastSelectedElement.current.style.outline = '';
        lastSelectedElement.current.style.outlineOffset = '';
    }

    if (selectedSelector) {
        try {
            const selectedEl = doc.querySelector(selectedSelector) as HTMLElement;
            if (selectedEl) {
                selectedEl.style.outline = '3px solid #60a5fa'; // light blue outline
                selectedEl.style.outlineOffset = '2px';
                lastSelectedElement.current = selectedEl;
            }
        } catch (e) {
            console.error("Invalid selector:", selectedSelector);
            lastSelectedElement.current = null;
        }
    } else {
        lastSelectedElement.current = null;
    }
  }, [selectedSelector, html, isSlicingMode]); // Rerun on html change to re-apply highlight
  
  const handleRemoveSlice = (indexToRemove: number) => {
      onSlicePositionsChange(slicePositions.filter((_, index) => index !== indexToRemove));
  };
  
  return (
    <div className="h-full border border-gray-700 rounded-lg overflow-auto bg-white relative">
      <iframe
        ref={iframeRef}
        id="preview-iframe"
        srcDoc={sanitizedHtml}
        className="w-full h-full"
        sandbox="allow-scripts allow-same-origin"
        title="Preview"
      />
      {isSlicingMode && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {hoverY !== null && (
            <div className="absolute w-full h-0 border-t-2 border-dashed border-red-500" style={{ top: `${hoverY}px` }} />
          )}
          {slicePositions.map((y, index) => (
            <div key={index} className="absolute w-full h-0 border-t-2 border-green-500 group" style={{ top: `${y}px` }}>
              <button
                onClick={(e) => { e.stopPropagation(); handleRemoveSlice(index); }}
                className="absolute -top-3 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove slice"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PreviewPanel;