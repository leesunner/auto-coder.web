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
};

function TerminalOutput(props: Props) {
  const { toggleTerminalExpand, isTerminalMinimized, requestId } = props;
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
    <div className="flex-1 w-full h-full relative z-[9] flex flex-col">
      {/* Tool Panel Navigation */}
      <div className="flex-shrink-0 bg-[#1f1f1f] border-b border-gray-700 px-2">
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

            {/* 展开/收起箭头按钮 */}

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
          </div>
        </div>
      </div>

      {/* Tool Panel Content */}
      <div className="flex-1 bg-[#2d2d2d] overflow-hidden">
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
