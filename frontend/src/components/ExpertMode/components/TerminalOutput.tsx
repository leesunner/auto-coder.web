import { Tooltip } from "antd";
import { Dropdown } from "@/components/Common";
import { UpOutlined, DownOutlined, PlusOutlined } from "@ant-design/icons";
import TerminalManager from "../../Terminal/TerminalManager";
import OutputPanel from "../../Terminal/OutputPanel";
import { getMessage } from "@/lang";
import { useRef, useState } from "react";

type Props = {
  toggleTerminalExpand: () => void;
  isTerminalMinimized: boolean;
  requestId: string;
  isFull: boolean;
  toggleFullscreen: () => void;
};

function TerminalOutput(props: Props) {
  const {
    toggleTerminalExpand,
    isTerminalMinimized,
    requestId,
    isFull,
    toggleFullscreen,
  } = props;
  const [activeToolPanel, setActiveToolPanel] = useState<string>("terminal");
  const terminalManager = useRef<any>(null);
  // 处理新建终端的shell选择
  const handleAddTerminalWithShell = (shellType: string) => {
    console.log(`创建新终端，Shell类型: ${shellType}`);
    // 这里可以添加实际的终端创建逻辑
    // 例如：调用TerminalManager的addTerminal方法，并传递shell类型
    if (!terminalManager.current) return;
    terminalManager.current?.addTerminal(shellType);
  };

  // 下拉菜单项配置
  const shellMenuItems = [
    {
      key: "bash",
      label: (
        <div className="flex items-center gap-2 px-2 py-1">
          <span>{getMessage("bash")}</span>
        </div>
      ),
      onClick: () => handleAddTerminalWithShell("bash"),
    },
    {
      key: "zsh",
      label: (
        <div className="flex items-center gap-2 px-2 py-1">
          <span>{getMessage("zsh")}</span>
        </div>
      ),
      onClick: () => handleAddTerminalWithShell("zsh"),
    },
    {
      key: "powershell",
      label: (
        <div className="flex items-center gap-2 px-2 py-1">
          <span>{getMessage("powershell")}</span>
        </div>
      ),
      onClick: () => handleAddTerminalWithShell("powershell"),
    },
  ];
  return (
    <div className="h-full w-full relative z-[9]">
      {/* Tool Panel Navigation */}
      <div className="bg-[#1f1f1f] border-b border-gray-700 px-2">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            {[
              { key: "output", label: getMessage("output") },
              { key: "terminal", label: getMessage("terminal") },
            ].map((tab, index) => (
              <button
                key={tab.key}
                className={`px-2 py-0.5 text-xs rounded-t transition-colors ${
                  activeToolPanel === tab.key
                    ? "text-white bg-[#2d2d2d]"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setActiveToolPanel(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center pr-2">
            {/* 新建终端按钮 - 只在terminal标签页激活时显示 */}
            {activeToolPanel === "terminal" && (
              <Tooltip
                placement="bottomLeft"
                title={getMessage("addTerminalWithShell")}
              >
                <div className="mr-2 flex items-center text-white">
                  <button
                    onClick={() => terminalManager.current?.addTerminal()}
                    className="ml-1 flex items-center gap-1 px-1 py-1 hover:bg-gray-700 rounded-none transition-colors"
                  >
                    <PlusOutlined />
                  </button>

                  <Dropdown
                    trigger={["click"]}
                    placement="topLeft"
                    menu={{ items: shellMenuItems }}
                    size="small"
                    selectClass="w-32"
                    defaultActiveKey="bash"
                  >
                    <button className="flex items-center gap-0 px-0.5 py-0.5 text-white hover:bg-gray-700 rounded-none transition-colors">
                      <DownOutlined style={{ fontSize: "10px" }} />
                    </button>
                  </Dropdown>
                </div>
              </Tooltip>
            )}
            {/* 全屏切换按钮 - 当终端区域被最小化时隐藏 */}
            {!isTerminalMinimized && (
              <Tooltip
                placement="topLeft"
                title={
                  isFull
                    ? getMessage("exitFullscreen")
                    : getMessage("fullscreenMode")
                }
              >
                <button
                  onClick={toggleFullscreen}
                  className="mr-1 p-0.5 rounded-md transition-all duration-200  text-white hover:bg-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {isFull ? (
                      <>
                        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                      </>
                    ) : (
                      <>
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                      </>
                    )}
                  </svg>
                </button>
              </Tooltip>
            )}

            {/* 展开/收起箭头按钮 */}
            {!isFull && (
              <Tooltip
                placement="topLeft"
                title={
                  isTerminalMinimized
                    ? getMessage("expandTerminal")
                    : getMessage("collapseTerminal")
                }
              >
                <button
                  onClick={toggleTerminalExpand}
                  className="ml-2 mr-1 p-0 rounded-md transition-all duration-200 text-white hover:bg-gray-700"
                >
                  {isTerminalMinimized ? (
                    <UpOutlined style={{ fontSize: "14px" }} />
                  ) : (
                    <DownOutlined style={{ fontSize: "14px" }} />
                  )}
                </button>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      {/* Tool Panel Content */}
      <div className="flex-1 bg-[#2d2d2d] overflow-auto">
        {/* Output Panel */}

        <div
          className={`h-full ${
            activeToolPanel === "output" ? "block" : "hidden"
          }`}
        >
          <OutputPanel requestId={requestId} />
        </div>

        {/* Terminal Panel */}
        <div
          className={`h-full ${
            activeToolPanel === "terminal" ? "block" : "hidden"
          }`}
        >
          <TerminalManager ref={terminalManager} />
        </div>
      </div>
    </div>
  );
}

export default TerminalOutput;
