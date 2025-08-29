import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";
import Terminal from "./Terminal";
import Split from "react-split";
import {
  PlusOutlined,
  DeleteOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Tooltip, Modal } from "antd";
import { getMessage } from "../../lang";

interface TerminalTab {
  id: string;
  name: string;
  fontSize?: number;
}

export interface TerminalManagerRef {
  addTerminal: () => void;
}

const TerminalManager = forwardRef<TerminalManagerRef>((props, ref) => {
  const [terminals, setTerminals] = useState<TerminalTab[]>([
    { id: "1", name: `${getMessage("terminal")} 1`, fontSize: 14 },
  ]);
  const divRef = useRef<HTMLDivElement>(null);
  // 在组件挂载时触发resize事件
  // 注释掉，暂时没发现这里去掉后有什么影响，其他监听的都有自己的完整的监听卸载事件
  // useEffect(() => {
  //   const handleResize = () => {
  //     window.dispatchEvent(new Event('resize'));
  //   };
  //   handleResize(); // 初始化时触发一次
  //   window.addEventListener('resize', handleResize);
  //   return () => window.removeEventListener('resize', handleResize);
  // }, []);
  const [activeTerminal, setActiveTerminal] = useState<string>("1");
  const [isSettingsVisible, setIsSettingsVisible] = useState<boolean>(false);

  const addTerminal = (type?: string) => {
    const newId = String(terminals.length + 1);
    setTerminals([
      ...terminals,
      { id: newId, name: `${getMessage("terminal")} ${newId}`, fontSize: 14 },
    ]);
    setActiveTerminal(newId);
  };

  const removeTerminal = (id: string) => {
    if (terminals.length > 1) {
      const newTerminals = terminals.filter((t) => t.id !== id);
      setTerminals(newTerminals);
      if (activeTerminal === id) {
        setActiveTerminal(newTerminals[0].id);
      }
    }
  };

  const renameTerminal = (id: string, newName: string) => {
    setTerminals(
      terminals.map((t) => (t.id === id ? { ...t, name: newName } : t))
    );
  };

  const submitTerminalOptions = () => {};

  // 暴露方法给外部调用者
  useImperativeHandle(ref, () => ({
    addTerminal,
  }));

  useEffect(() => {
    if (!divRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("resize-terminal"));
      });
    });
    resizeObserver.observe(divRef.current);

    return () => {
      if (!divRef.current) return;
      resizeObserver.unobserve(divRef.current as Element); // 清理函数，避免内存泄漏
    };
  }, []); // 空依赖数组表示只执行一次

  const showList = terminals.length > 1;
  const sizes = showList ? [80, 20] : [100, 0];

  return (
    <div ref={divRef} className="flex h-full">
      <Split
        className="flex-1 flex overflow-hidden split-horizontal bg-[#2d2d2d]"
        sizes={sizes}
        minSize={[360, 100]}
        gutterSize={0.5}
        dragInterval={1}
        onDragEnd={() => window.dispatchEvent(new Event("resize-terminal"))}
        //   snapOffset={100}
      >
        {/* Left Panel - Terminal */}
        <div className="flex-1">
          {terminals.map((terminal) => (
            <div
              key={terminal.id}
              className={`h-full ${
                activeTerminal === terminal.id ? "block" : "hidden"
              }`}
            >
              <Terminal />
            </div>
          ))}
        </div>

        {/* Right Panel - Terminal Management */}
        <div
          className={`bg-[#1f1f1f] flex flex-col ${
            showList ? "block" : "hidden"
          }`}
        >
          {/* <div className="p-2 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Tooltip title={getMessage("newTerminal")}>
                  <button
                    onClick={addTerminal}
                    className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-700"
                  >
                    <PlusOutlined style={{ fontSize: "14px" }} />
                  </button>
                </Tooltip>
                <Tooltip title={getMessage("terminalSettings")}>
                  <button
                    onClick={() => setIsSettingsVisible(true)}
                    className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-700"
                  >
                    <SettingOutlined style={{ fontSize: "14px" }} />
                  </button>
                </Tooltip>
              </div>
            </div>
          </div> */}
          <div className="flex-1 overflow-y-auto relative z-40">
            {terminals.map((terminal) => (
              <div
                key={terminal.id}
                className={`group flex items-center justify-between px-3 py-1 cursor-pointer 
                ${
                  activeTerminal === terminal.id
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:bg-gray-800"
                }`}
                onClick={() => setActiveTerminal(terminal.id)}
              >
                <input
                  className={`text-xs truncate bg-transparent outline-none w-full ${
                    activeTerminal === terminal.id
                      ? "text-white"
                      : "text-gray-400"
                  }`}
                  value={terminal.name}
                  onDoubleClick={(e) => (e.target as HTMLInputElement).select()}
                  onChange={(e) =>
                    renameTerminal(
                      terminal.id,
                      (e.target as HTMLInputElement).value
                    )
                  }
                  onBlur={(e) => {
                    if (!(e.target as HTMLInputElement).value.trim()) {
                      renameTerminal(
                        terminal.id,
                        `${getMessage("terminal")} ${terminal.id}`
                      );
                    }
                  }}
                />
                {terminals.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTerminal(terminal.id);
                    }}
                    className={`p-1 rounded hover:bg-gray-600 
                    ${
                      activeTerminal === terminal.id
                        ? "text-gray-300"
                        : "invisible group-hover:visible"
                    }`}
                  >
                    <DeleteOutlined style={{ fontSize: "11px" }} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </Split>

      {/* Settings Modal */}
      <Modal
        title={getMessage("terminalSettings")}
        open={isSettingsVisible}
        onCancel={() => setIsSettingsVisible(false)}
        footer={null}
        className="dark-theme-modal"
        onOk={submitTerminalOptions}
      >
        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              {getMessage("shellConfiguration")}
            </h3>
            <select className="w-full bg-gray-800 text-gray-300 border border-gray-700 rounded px-3 py-2">
              <option value="bash">{getMessage("bash")}</option>
              <option value="zsh">{getMessage("zsh")}</option>
              <option value="powershell">{getMessage("powershell")}</option>
            </select>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              {getMessage("fontSize")}
            </h3>
            <input
              type="number"
              className="w-full bg-gray-800 text-gray-300 border border-gray-700 rounded px-3 py-2"
              defaultValue={14}
              min={8}
              max={24}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
});

export default TerminalManager;
