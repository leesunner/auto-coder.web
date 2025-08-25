import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  Suspense,
  lazy,
} from "react"; // Import Suspense and lazy
import { Editor } from "@monaco-editor/react";
import Split from "react-split";
import ChatPanels from "../Sidebar/ChatPanels";
import CodeEditorPanel from "../MainContent/CodeEditorPanel";
import FileGroupPanel from "../MainContent/FileGroupPanel";
import SettingsPanel from "../MainContent/SettingsPanel";
import { Dropdown, type DropdownMenuItem } from "@/components/Common";
// Lazy load HistoryPanel
const HistoryPanel = lazy(() => import("../MainContent/HistoryPanel"));
import TodoPanel from "../MainContent/TodoPanel";
import AskUserDialog from "../AutoMode/AskUserDialog"; // Import AskUserDialog component
import { getMessage } from "../../lang";
import { FileMetadata } from "../../types/file_meta";
import "./SplitStyles.css";
import eventBus, { EVENTS } from "../../services/eventBus";
import { useChatContext } from "../../contexts/ChatContext";
import ModalDialog from "../Common/ModalDialog";
// 导入声音播放函数
import { playTaskComplete } from "../AutoMode/utils/SoundEffects";
import TerminalOutput from "./components/TerminalOutput";
import ToolsTabs from "./components/ToolsTabs";

// Define the possible panel types, including the new split preview types
export type ActivePanelType =
  | "todo"
  | "code"
  | "filegroup"
  | "preview_static"
  | "preview_editable"
  | "clipboard"
  | "history"
  | "settings";

interface ExpertModePageProps {
  projectName: string;
  activePanel: ActivePanelType;
  setActivePanel: (panel: ActivePanelType) => void;
  clipboardContent: string;
  setClipboardContent: (content: string) => void;
  previewFiles: { path: string; content: string }[];
  setPreviewFiles: (files: { path: string; content: string }[]) => void;
  requestId: string;
  setRequestId: (id: string) => void;
  selectedFiles: FileMetadata[];
  onSwitchToAutoMode: () => void;
  setSelectedFiles: (files: FileMetadata[]) => void;
}

const ExpertModePage: React.FC<ExpertModePageProps> = ({
  projectName,
  activePanel,
  setActivePanel,
  clipboardContent,
  setClipboardContent,
  previewFiles,
  setPreviewFiles,
  requestId,
  setRequestId,
  selectedFiles,
  onSwitchToAutoMode,
  setSelectedFiles,
}) => {
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [isFull, setFull] = useState(false);

  // 新增状态：跟踪分割面板的尺寸和折叠状态
  const [splitSizes, setSplitSizes] = useState([75, 25]);
  const [isTerminalMinimized, setIsTerminalMinimized] = useState(false);

  // 弹出框状态
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalFormat, setModalFormat] = useState<"markdown" | "monaco">(
    "markdown"
  );
  const [modalLanguage, setModalLanguage] = useState("plaintext");
  const [modalTitle, setModalTitle] = useState(getMessage("contentPreview"));

  // AskUserDialog相关状态
  const [activeAskUserMessage, setActiveAskUserMessage] = useState<any | null>(
    null
  );
  const [currentEventFileId, setCurrentEventFileId] = useState<string | null>(
    null
  );

  // 处理编辑器全屏切换
  const toggleFullscreen = () => {
    setFull(!isFull);
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 50);
  };

  // 处理拖拽变化，检查终端区域是否被拖到底部
  const handleSplitChange = (sizes: any) => {
    setSplitSizes(sizes);
    // 如果下方面板的大小小于等于8%，认为已经拖到底部
    const isMinimized = sizes[1] <= 3;
    setIsTerminalMinimized(isMinimized);

    // 触发resize事件以更新Terminal大小
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 50);
  };

  // 切换终端区域展开/收起状态
  const toggleTerminalExpand = () => {
    if (isTerminalMinimized) {
      // 展开：恢复到默认大小
      setSplitSizes([75, 25]);
      setIsTerminalMinimized(false);
    } else {
      // 收起：设置为最小高度
      setSplitSizes([98, 2]);
      setIsTerminalMinimized(true);
    }

    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 50);
  };

  // 添加对requestId变化的监听，更新currentEventFileId
  useEffect(() => {
    if (requestId) {
      setCurrentEventFileId(requestId);
      console.log(
        "ExpertModePage: Updated currentEventFileId from requestId:",
        requestId
      );
    }
  }, [requestId]);

  // 更新modalTitle的初始化，确保使用多语言
  useEffect(() => {
    setModalTitle(getMessage("contentPreview"));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".tools-dropdown-container") && showToolsDropdown) {
        setShowToolsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showToolsDropdown]);

  // Listen for panel activation events
  useEffect(() => {
    const unsubscribe = eventBus.subscribe(
      EVENTS.UI.ACTIVATE_PANEL,
      (panelName) => {
        if (panelName === "history") {
          setActivePanel("history");
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [setActivePanel]);

  // 监听消息事件，只通过 eventBus 接收消息
  useEffect(() => {
    // 订阅新消息事件，包括 ASK_USER 和带有 event_file_id 的消息
    const unsubscribeNewMessage = eventBus.subscribe(
      EVENTS.CHAT.NEW_MESSAGE,
      (message: any) => {
        console.log(
          "ExpertModePage: Received message via eventBus:",
          message.type
        );

        // 处理用户询问类型的消息
        if (message.type === "ASK_USER") {
          const askUserMessage = {
            ...message,
            id: message.id || `msg-${Date.now()}`,
            timestamp: Date.now(),
          };
          setActiveAskUserMessage(askUserMessage);
          // 弹窗出现时播放声音
          try {
            playTaskComplete();
          } catch (e) {
            // 忽略播放声音异常，避免影响主流程
          }
          console.log("ExpertModePage: Set activeAskUserMessage from eventBus");
        }

        // 从消息中提取 event_file_id
        if (message.event_file_id && !currentEventFileId) {
          setCurrentEventFileId(message.event_file_id);
          console.log(
            "ExpertModePage: Set currentEventFileId from message:",
            message.event_file_id
          );
        }

        // 从消息元数据中提取 event_file_id
        if (message.metadata?.event_file_id && !currentEventFileId) {
          setCurrentEventFileId(message.metadata.event_file_id);
          console.log(
            "ExpertModePage: Set currentEventFileId from message metadata:",
            message.metadata.event_file_id
          );
        }
      }
    );

    return () => {
      unsubscribeNewMessage();
    };
  }, [currentEventFileId]);

  // 订阅显示弹出框事件
  useEffect(() => {
    const unsubscribe = eventBus.subscribe(
      EVENTS.UI.SHOW_MODAL,
      (data: {
        content: string;
        format: "markdown" | "monaco";
        language?: string;
        title?: string;
      }) => {
        setModalContent(data.content);
        setModalFormat(data.format);
        setModalLanguage(data.language || "plaintext");
        setModalTitle(data.title || getMessage("contentPreview"));
        setModalOpen(true);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // 处理用户对ASK_USER事件的响应
  const handleUserResponse = async (response: string, eventId?: string) => {
    if (!eventId) {
      console.error("Cannot respond to event: No event ID provided");
      return;
    }

    if (!currentEventFileId) {
      console.error("Cannot respond to event: No event file ID available");
      return;
    }

    // 如果匹配事件ID，关闭活动的ASK_USER对话框
    if (activeAskUserMessage?.eventId === eventId) {
      setActiveAskUserMessage(null);
    }

    try {
      console.log("ExpertModePage: Sending response to event:", {
        event_id: eventId,
        event_file_id: currentEventFileId,
        response: response,
      });

      // 将响应发送回服务器
      const result = await fetch("/api/auto-command/response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_id: eventId,
          event_file_id: currentEventFileId,
          response: response,
        }),
      });

      if (!result.ok) {
        const errorData = await result.json();
        throw new Error(
          `Failed to send response: ${errorData.detail || result.statusText}`
        );
      }

      console.log("Response sent successfully to event:", eventId);
    } catch (error) {
      console.error("Error sending response to server:", error);
      // 通过eventBus发送错误消息
      eventBus.publish(EVENTS.CHAT.NEW_MESSAGE, {
        type: "ERROR",
        content: `Failed to send your response to the server: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    }
  };

  const toggleToolsDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowToolsDropdown(!showToolsDropdown);
  };

  // 参考原有"更多下拉菜单"的菜单项配置
  const moreMenuItems: DropdownMenuItem[] = [
    // {
    //   key: "preview_static",
    //   label: getMessage("previewChangesStatic"),
    //   icon: (
    //     <svg
    //       className="w-3 h-3"
    //       fill="none"
    //       stroke="currentColor"
    //       viewBox="0 0 24 24"
    //     >
    //       <path
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //         strokeWidth={2}
    //         d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    //       />
    //       <path
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //         strokeWidth={2}
    //         d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    //       />
    //     </svg>
    //   ),
    //   disabled: true, // 预览功能已屏蔽
    //   onClick: () => {
    //     console.log("预览功能已被屏蔽");
    //   },
    // },
    {
      key: "clipboard",
      label: getMessage("clipboard"),
      icon: (
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      onClick: () => {
        setActivePanel("clipboard");
      },
    },
    {
      key: "todo",
      label: getMessage("todos"),
      icon: (
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
      onClick: () => {
        setActivePanel("todo");
      },
    },
  ];

  return (
    <>
      {/* 用户询问对话框 - 当需要用户输入时显示的模态框 */}
      {activeAskUserMessage && (
        <AskUserDialog
          message={activeAskUserMessage}
          onResponse={handleUserResponse}
          onClose={() => {}}
        />
      )}

      <Split
        className="flex-1 flex split-horizontal"
        sizes={[75, 25]}
        minSize={[900, 385]}
        gutterSize={0.5}
        snapOffset={20}
      >
        {/* Content Area */}
        <div className="relative flex flex-col flex-grow h-full w-full overflow-hidden">
          <div className="h-full w-full">
            {/* Upper Section - 顶部内容区域 */}
            <div className="h-full w-full flex flex-col overflow-hidden">
              {/* Panel Switch Buttons */}
              <div className="bg-gray-800 p-2 border-b border-gray-700">
                <div className="flex space-x-2">
                  <ToolsTabs
                    activePanel={activePanel}
                    setActivePanel={setActivePanel}
                  />
                  {/* 更多下拉菜单 */}
                  <Dropdown
                    trigger={["click"]}
                    placement="bottomRight"
                    menu={{ items: moreMenuItems }}
                  >
                    <button
                      className={`px-2 py-1 rounded text-xs font-medium transition-all duration-300 
                          ${
                            activePanel === "clipboard"
                              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:from-blue-600 hover:to-indigo-700 transform hover:-translate-y-0.5"
                              : "bg-gray-800/60 text-gray-400 hover:bg-gray-700/80 hover:text-white hover:shadow-sm"
                          } flex items-center space-x-2`}
                      // onClick={toggleToolsDropdown}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      <span>{getMessage("more")}</span>
                    </button>
                  </Dropdown>
                </div>
              </div>

              {/* Dynamic Content Area */}
              <div className="flex-1 overflow-hidden">
                <div
                  className={`h-full ${
                    activePanel === "code" ? "block" : "hidden"
                  }`}
                >
                  <CodeEditorPanel
                    selectedFiles={selectedFiles}
                    requestId={requestId}
                  />
                </div>
                {activePanel === "filegroup" ? (
                  <div className={`h-full`}>
                    <FileGroupPanel />
                  </div>
                ) : null}
                <div
                  className={`h-full ${
                    activePanel === "clipboard" ? "block" : "hidden"
                  }`}
                >
                  <div className="h-full p-4">
                    <Editor
                      theme="vs-dark"
                      height="100%"
                      value={clipboardContent}
                      onChange={(value) => setClipboardContent(value || "")}
                      defaultLanguage="plaintext"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: "on",
                        wordWrap: "on",
                        automaticLayout: true,
                      }}
                    />
                  </div>
                </div>
                {/* Static Preview Panel - 预览功能已屏蔽 */}
                {/* <div
                    className={`h-full ${
                      activePanel === "preview_static" ? "block" : "hidden"
                    }`}
                  >
                    <div className="h-full flex items-center justify-center bg-gray-900">
                      <div className="text-center text-gray-400">
                        <svg
                          className="w-16 h-16 mx-auto mb-4 opacity-50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                          <line x1="3" y1="3" x2="21" y2="21" strokeWidth={2} />
                        </svg>
                        <p className="text-lg font-medium mb-2">
                          预览功能暂时不可用
                        </p>
                        <p className="text-sm">该功能正在维护中，请稍后再试</p>
                      </div>
                    </div>
                 
                    <PreviewPanel files={previewFiles} />
                  </div> */}
                <div
                  className={`h-full ${
                    activePanel === "history" ? "block" : "hidden"
                  }`}
                >
                  {/* Wrap HistoryPanel with Suspense for lazy loading */}
                  <Suspense
                    fallback={
                      <div className="p-4 text-gray-400 text-center">
                        {getMessage("loadingHistory")}
                      </div>
                    }
                  >
                    <HistoryPanel />
                  </Suspense>
                </div>
                <div
                  className={`h-full ${
                    activePanel === "settings" ? "block" : "hidden"
                  }`}
                >
                  <SettingsPanel />
                </div>
                <div
                  className={`h-full ${
                    activePanel === "todo" ? "block" : "hidden"
                  }`}
                >
                  <TodoPanel />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="border-r border-gray-700 flex flex-col">
          <ChatPanels
            setPreviewFiles={setPreviewFiles}
            setActivePanel={setActivePanel as any}
            setClipboardContent={setClipboardContent}
            clipboardContent={clipboardContent}
            setRequestId={setRequestId}
            projectName={projectName}
            setSelectedFiles={setSelectedFiles}
          />
        </div>
      </Split>

      {/* 弹出框组件 */}
      <ModalDialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        content={modalContent}
        format={modalFormat}
        language={modalLanguage}
        title={modalTitle}
      />
    </>
  );
};

export default ExpertModePage;
