

import React, { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';

interface Props {
  html: string;
  onBlockSelect: (selector: string) => void;
  selectedSelector: string | null;
}

const getCssSelector = (el: HTMLElement): string => {
  if (!(el instanceof Element)) return '';
  const path: string[] = [];
  while (el.nodeType === Node.ELEMENT_NODE) {
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
    const parent = el.parentNode as HTMLElement;
    if (parent && parent.nodeName.toLowerCase() === 'body') {
        path.unshift('body');
        break;
    }
    el = parent;
  }
  return path.join(' > ');
};


const PreviewPanel: React.FC<Props> = ({ html, onBlockSelect, selectedSelector }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const lastSelectedElement = useRef<HTMLElement | null>(null);

  // Configure DOMPurify to allow style tags and process a full HTML document
  const sanitizedHtml = DOMPurify.sanitize(html, {
    WHOLE_DOCUMENT: true, // Allows <html>, <head>, and <body> tags
    ADD_TAGS: ['style'],  // Explicitly allows the <style> tag
  });

  // Effect to attach event listeners when iframe loads
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;

      const clickHandler = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const target = e.target as HTMLElement;
        if (target) {
          const selector = getCssSelector(target);
          onBlockSelect(selector);
        }
      };
      
      doc.body.addEventListener('click', clickHandler);
      return () => {
        doc.body.removeEventListener('click', clickHandler);
      };
    };
    
    iframe.addEventListener('load', handleLoad);
    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, [html, onBlockSelect]);

  // Effect to manage visual selection highlight
  useEffect(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc) return;
    
    // Clear previous selection
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
  }, [selectedSelector, html]); // Rerun on html change to re-apply highlight
  
  return (
    <div className="h-full border border-gray-700 rounded-lg overflow-auto bg-white">
      <iframe
        ref={iframeRef}
        id="preview-iframe" // Added ID for targeting
        srcDoc={sanitizedHtml}
        className="w-full h-full"
        sandbox="allow-scripts allow-same-origin"
        title="Preview"
      />
    </div>
  );
};

export default PreviewPanel;