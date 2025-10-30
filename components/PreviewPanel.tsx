
import React from 'react';
import DOMPurify from 'dompurify';

interface Props {
  html: string;
}

const PreviewPanel: React.FC<Props> = ({ html }) => {
  // Configure DOMPurify to allow style tags and process a full HTML document
  const sanitizedHtml = DOMPurify.sanitize(html, {
    WHOLE_DOCUMENT: true, // Allows <html>, <head>, and <body> tags
    ADD_TAGS: ['style'],  // Explicitly allows the <style> tag
  });
  
  return (
    <div className="h-full border border-gray-700 rounded-lg overflow-auto bg-white">
      <iframe
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
