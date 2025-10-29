
import React from 'react';
import Editor from '@monaco-editor/react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const HtmlEditor: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="h-full border border-gray-700 rounded-lg overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage="html"
        theme="vs-dark"
        value={value}
        onChange={(val) => onChange(val || '')}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
        }}
      />
    </div>
  );
};

export default HtmlEditor;
