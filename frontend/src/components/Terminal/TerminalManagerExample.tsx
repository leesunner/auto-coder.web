import React, { useRef } from "react";
import TerminalManager, { TerminalManagerRef } from "./TerminalManager";

// 使用示例组件
const TerminalManagerExample: React.FC = () => {
  const terminalManagerRef = useRef<TerminalManagerRef>(null);

  const handleAddTerminal = () => {
    // 通过 ref 调用 TerminalManager 的 addTerminal 方法
    if (terminalManagerRef.current) {
      terminalManagerRef.current.addTerminal();
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 bg-gray-800">
        <button
          onClick={handleAddTerminal}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          外部添加终端
        </button>
      </div>
      <div className="flex-1">
        <TerminalManager ref={terminalManagerRef} />
      </div>
    </div>
  );
};

export default TerminalManagerExample;
