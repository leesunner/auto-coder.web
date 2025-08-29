import React, { useState, useRef, useCallback, useEffect } from "react";
import { Radio, Space, Tabs, message } from "antd";
import { FileOutlined } from "@ant-design/icons";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Editor, loader, DiffEditor } from "@monaco-editor/react";
import axios from "axios";
import { getMessage } from "../../lang";

// 防止Monaco加载多次
loader.config({
  paths: {
    vs: "/monaco-editor/min/vs",
  },
  "vs/nls": {
    availableLanguages: { "*": "zh-cn" },
  },
});

const { TabPane } = Tabs;

interface FileChange {
  path: string;
  change_type: string;
}

interface FileDiff {
  before_content: string;
  after_content: string;
  diff_content: string;
  file_status: string;
}

interface DiffViewerProps {
  commitId: string;
  onClose?: () => void;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ commitId, onClose }) => {
  const [currentDiff, setCurrentDiff] = useState<{
    diff: string;
    file_changes?: Array<FileChange>;
  }>({ diff: "" });
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileDiff, setFileDiff] = useState<FileDiff | null>(null);
  const [fileDiffLoading, setFileDiffLoading] = useState(false);
  const [diffViewMode, setDiffViewMode] = useState<"split" | "unified">(
    "split"
  );
  const [maximizedView, setMaximizedView] = useState<
    "before" | "after" | "diff" | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState("1");

  // 编辑器引用

  const diffEditorRef = useRef<any>(null);
  const editorRef = useRef<any>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // 获取提交差异信息
  const fetchCommitDiff = async () => {
    if (!commitId) return;
    setLoading(true);

    try {
      const encodedResponseId = encodeURIComponent(commitId);
      const diffResponse = await axios.get(
        `/api/history/commit-diff/${encodedResponseId}`
      );

      if (diffResponse.data.success) {
        setCurrentDiff({
          diff: diffResponse.data.diff,
          file_changes: diffResponse.data.file_changes,
        });
      } else {
        message.error(diffResponse.data.message || getMessage("getDiffFailed"));
      }
    } catch (error) {
      console.error("Error fetching diff:", error);
      message.error(getMessage("getDiffFailed"));
    } finally {
      setLoading(false);
    }
  };

  // 获取文件差异详情
  const fetchFileDiff = async (filePath: string) => {
    if (!commitId) return;

    try {
      setFileDiffLoading(true);
      setFileDiff(null);

      // 清除编辑器实例，防止内存泄漏
      diffEditorRef.current = null;

      const encodedResponseId = encodeURIComponent(commitId);
      const response = await axios.get(
        `/api/history/file-diff/${encodedResponseId}?file_path=${encodeURIComponent(
          filePath
        )}`
      );

      if (response.data.success) {
        setFileDiff(response.data.file_diff);
      } else {
        message.error(response.data.message || getMessage("getFileDiffFailed"));
      }
    } catch (error) {
      console.error("Error fetching file diff:", error);
      message.error(getMessage("getFileDiffFailed"));
    } finally {
      setFileDiffLoading(false);
    }
  };

  const handleFileClick = (filePath: string) => {
    if (selectedFile === filePath) {
      setSelectedFile(null);
      setFileDiff(null);

      // 清除所有编辑器实例

      diffEditorRef.current = null;

      // 清除最大化状态
      setMaximizedView(null);
    } else {
      setSelectedFile(filePath);
      fetchFileDiff(filePath);

      // 清除最大化状态
      setMaximizedView(null);
    }
  };

  const handleEditorDidMount = useCallback((editor: any) => {
    editorRef.current = editor;
  }, []);

  const handleDiffEditorDidMount = useCallback((editor: any) => {
    diffEditorRef.current = editor;
  }, []);

  // 确定文件的语言类型，用于 Monaco Editor 语法高亮
  const getLanguageForFile = (filename: string): string => {
    const extension = filename.split(".").pop()?.toLowerCase();
    const extensionMap: { [key: string]: string } = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      java: "java",
      c: "c",
      cpp: "cpp",
      cs: "csharp",
      go: "go",
      rs: "rust",
      rb: "ruby",
      php: "php",
      html: "html",
      css: "css",
      scss: "scss",
      json: "json",
      md: "markdown",
      yml: "yaml",
      yaml: "yaml",
      xml: "xml",
      sh: "shell",
      bash: "shell",
      txt: "plaintext",
    };

    return extensionMap[extension || ""] || "plaintext";
  };

  // 清除最大化状态
  const clearMaximizedView = () => {
    setMaximizedView(null);
  };

  // 最大化/正常化按钮
  const MaximizeButton = ({
    viewType,
  }: {
    viewType: "before" | "after" | "diff";
  }) => {
    const isMaximized = maximizedView === viewType;

    return (
      <button
        className="ml-2 text-gray-400 hover:text-white transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          setMaximizedView(isMaximized ? null : viewType);
        }}
        title={
          isMaximized
            ? getMessage("restoreNormalView")
            : getMessage("maximizeView")
        }
      >
        {isMaximized ? (
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
            />
          </svg>
        ) : (
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
            />
          </svg>
        )}
      </button>
    );
  };

  // 渲染文件差异视图
  const renderFileDiffView = () => {
    if (!selectedFile || !fileDiff) return null;

    const language = getLanguageForFile(selectedFile);
    const diffKey = `diff-${commitId}-${selectedFile}-${diffViewMode}`;
    const beforeKey = `before-${commitId}-${selectedFile}`;
    const afterKey = `after-${commitId}-${selectedFile}`;

    // 基本编辑器选项
    const editorOptions = {
      readOnly: true,
      scrollBeyondLastLine: false,
      minimap: { enabled: false },
      lineNumbers: "on" as const,
      wordWrap: "on" as const,
      automaticLayout: true,
      scrollbar: {
        vertical: "visible" as const,
        horizontal: "visible" as const,
        verticalScrollbarSize: 14,
        horizontalScrollbarSize: 14,
      },
    };

    if (diffViewMode === "unified") {
      // 统一视图模式 - 只显示差异
      return (
        <div
          ref={editorContainerRef}
          className="bg-gray-900 rounded-lg border border-gray-700"
          style={{ height: "500px", width: "100%", overflow: "hidden" }}
        >
          <div className="py-1 px-3 bg-gray-800 border-b border-gray-700 text-xs font-medium text-white flex justify-between items-center">
            <span>{getMessage("diffView")}</span>
            <MaximizeButton viewType="diff" />
          </div>
          <Editor
            key={diffKey}
            height="calc(100% - 26px)"
            width="100%"
            defaultLanguage="diff"
            value={fileDiff.diff_content || ""}
            theme="vs-dark"
            onMount={handleDiffEditorDidMount}
            options={editorOptions}
            loading={
              <div className="flex items-center justify-center h-full text-white">
                加载中...
              </div>
            }
          />
        </div>
      );
    }
    // diff 视图
    return (
      <div
        className={`bg-gray-900 overflow-hidden rounded-lg border border-gray-700 ${
          maximizedView === "after" ? "col-span-2" : ""
        }`}
        style={{ height: "500px", width: "100%" }}
      >
        <div className="py-1 px-3 bg-gray-800 border-b border-gray-700 text-xs font-medium text-white flex justify-between items-center">
          <span>
            {getMessage("afterModification")} (
            {fileDiff.file_status === "deleted"
              ? getMessage("fileDeleted")
              : selectedFile}
            )
          </span>
          <MaximizeButton viewType="after" />
        </div>
        <DiffEditor
          key={afterKey}
          height="calc(100% - 26px)"
          width="100%"
          original={fileDiff.before_content || ""}
          modified={fileDiff.after_content || ""}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={editorOptions}
          loading={
            <div className="flex items-center justify-center h-full text-white">
              {getMessage("loading")}
            </div>
          }
        />
      </div>
    );
  };

  // 组件加载时获取数据
  useEffect(() => {
    if (commitId) {
      fetchCommitDiff();
    }
  }, [commitId]);

  // 自定义Tab样式
  const tabBarStyle = {
    background: "#1F2937",
    borderBottom: "1px solid #374151",
    margin: 0,
    padding: "0 16px",
  };

  // 渲染特定样式的标签
  const renderTabBar = (props: any, DefaultTabBar: any) => (
    <DefaultTabBar {...props} style={tabBarStyle} className="custom-tabs-bar" />
  );

  return (
    <div className="flex flex-col h-full bg-[#111827] overflow-hidden">
      <div className="flex justify-between items-center p-4 bg-[#1F2937] border-b border-[#374151]">
        <h2 className="text-lg font-semibold text-white">
          {getMessage("codeChangesDetail")}
        </h2>
        <Space>
          {onClose && (
            <button
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
              onClick={onClose}
            >
              {getMessage("close")}
            </button>
          )}
        </Space>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs
          activeKey={activeTabKey}
          onChange={setActiveTabKey}
          type="card"
          className="diff-viewer-tabs"
          renderTabBar={renderTabBar}
          style={{
            background: "#111827",
          }}
        >
          <TabPane
            tab={
              <div
                className={`py-2 px-4 ${
                  activeTabKey === "1"
                    ? "text-white font-medium"
                    : "text-gray-400"
                }`}
              >
                {getMessage("fileList")}
              </div>
            }
            key="1"
          >
            <div className="p-4">
              {/* 文件列表视图 */}
              <div className="space-y-2 mb-4">
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                ) : currentDiff.file_changes &&
                  currentDiff.file_changes.length > 0 ? (
                  currentDiff.file_changes.map((file, index) => (
                    <div
                      key={index}
                      className={`text-sm py-2 px-3 rounded cursor-pointer ${
                        selectedFile === file.path
                          ? "bg-gray-700 border-l-2 border-indigo-500"
                          : "hover:bg-gray-750 bg-gray-800"
                      }`}
                      onClick={() => handleFileClick(file.path)}
                    >
                      <div className="flex items-center">
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-2 ${
                            file.change_type === "added"
                              ? "bg-green-500"
                              : file.change_type === "modified"
                              ? "bg-yellow-500"
                              : file.change_type === "deleted"
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                        ></span>
                        <span
                          className={`font-mono ${
                            file.change_type === "deleted"
                              ? "line-through text-gray-500"
                              : "text-white"
                          }`}
                        >
                          {file.path}
                        </span>
                        <FileOutlined className="ml-2 text-gray-400" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-white py-8">
                    <p>{getMessage("noFileChanges")}</p>
                  </div>
                )}
              </div>

              {/* 文件差异加载状态 */}
              {fileDiffLoading && (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}

              {/* 视图模式切换按钮 */}
              {selectedFile && fileDiff && !fileDiffLoading && (
                <div className="flex justify-end mb-3">
                  <Radio.Group
                    value={diffViewMode}
                    onChange={(e) => setDiffViewMode(e.target.value)}
                    buttonStyle="solid"
                  >
                    <Radio.Button
                      value="split"
                      style={{
                        color: diffViewMode === "split" ? "#fff" : "#1f2937",
                      }}
                    >
                      {getMessage("splitView")}
                    </Radio.Button>
                    <Radio.Button
                      value="unified"
                      style={{
                        color: diffViewMode === "unified" ? "#fff" : "#1f2937",
                      }}
                    >
                      {getMessage("unifiedView")}
                    </Radio.Button>
                  </Radio.Group>
                </div>
              )}

              {/* 文件差异视图 */}
              {selectedFile &&
                fileDiff &&
                !fileDiffLoading &&
                renderFileDiffView()}
            </div>
          </TabPane>
          <TabPane
            tab={
              <div
                className={`py-2 px-4 ${
                  activeTabKey === "2"
                    ? "text-white font-medium"
                    : "text-gray-400"
                }`}
              >
                {getMessage("originalDiff")}
              </div>
            }
            key="2"
          >
            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : (
                <SyntaxHighlighter
                  language="diff"
                  style={vscDarkPlus}
                  customStyle={{
                    padding: "12px",
                    borderRadius: "4px",
                    overflow: "auto",
                    maxHeight: "600px",
                  }}
                >
                  {currentDiff.diff || ""}
                </SyntaxHighlighter>
              )}
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default DiffViewer;
