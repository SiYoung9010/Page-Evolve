import React, { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';

interface Props {
  html: string;
  isSlicingMode: boolean;
  slicePositions: number[];
  onSlicePositionsChange: (positions: number[]) => void;
}

const PreviewPanel: React.FC<Props> = ({ html, isSlicingMode, slicePositions, onSlicePositionsChange }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
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
      }
      
      cleanupFunc = () => {
        if (doc && doc.body) doc.body.style.cursor = 'default';
        listeners.forEach(({ target, type, listener }) => {
          target.removeEventListener(type, listener);
        });
      };
    };

    const handleLoad = () => {
        setupEventListeners();
    };
    
    iframe.addEventListener('load', handleLoad);
    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
      setupEventListeners();
    }
    
    return () => {
      iframe.removeEventListener('load', handleLoad);
      if (cleanupFunc) {
        cleanupFunc();
      }
    };
  }, [isSlicingMode, onSlicePositionsChange, slicePositions, html]);

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
