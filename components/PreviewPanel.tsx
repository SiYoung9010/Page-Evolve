
import React from 'react';
import DOMPurify from 'dompurify';

interface Props {
  html: string;
}

const PreviewPanel: React.FC<Props> = ({ html }) => {
  const sanitizedHtml = DOMPurify.sanitize(html);
  
  return (
    <div className="h-full border border-gray-700 rounded-lg overflow-auto bg-white">
      <iframe
        srcDoc={sanitizedHtml}
        className="w-full h-full"
        sandbox="allow-scripts allow-same-origin"
        title="Preview"
      />
    </div>
  );
};

export default PreviewPanel;
