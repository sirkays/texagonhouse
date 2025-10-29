// components/CodeViewer.tsx
"use client";

import React from "react";
import Editor from "@monaco-editor/react";

interface CodeViewerProps {
  code: string;
  language: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({code, language}) => {
  return (
    <div className="mt-4">
      <h3 className="font-bold">Submitted Code:</h3>
      <Editor
        height="400px"
        language={language}
        value={code}
        options={{
          readOnly: true,
          minimap: {enabled: false},
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
};

export default CodeViewer;
