import React from "react";
import CodeEditor from "../Editor/CodeEditor_new";
import { FileMetadata } from "../../types/file_meta";

interface CodeEditorPanelProps {
  selectedFiles?: FileMetadata[];
  requestId: string;
}

const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({
  selectedFiles,
  requestId,
}) => {
  return <CodeEditor selectedFiles={selectedFiles} requestId={requestId} />;
};

export default CodeEditorPanel;
