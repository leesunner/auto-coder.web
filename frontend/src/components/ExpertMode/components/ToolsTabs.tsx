import { getMessage } from "@/lang";
import type { ActivePanelType } from "../ExpertModePage_new";

interface ToolsTabsProps {
  activePanel: ActivePanelType;
  setActivePanel: (panel: ActivePanelType) => void;
}

interface TabItem {
  key: ActivePanelType;
  title: string;
  icon: React.ReactNode;
  handleChange: () => void;
}

const ToolsTabs = ({ activePanel, setActivePanel }: ToolsTabsProps) => {
  // 定义按钮配置列表
  const tabItems: TabItem[] = [
    {
      key: "code",
      title: getMessage("codeViewer"),
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
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      ),
      handleChange: () => setActivePanel("code"),
    },
    {
      key: "history",
      title: getMessage("devHistory"),
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      handleChange: () => setActivePanel("history"),
    },
    {
      key: "filegroup",
      title: getMessage("fileGroups"),
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
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      ),
      handleChange: () => setActivePanel("filegroup"),
    },
    {
      key: "settings",
      title: getMessage("settings"),
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      handleChange: () => setActivePanel("settings"),
    },
  ];

  // 获取按钮样式的函数
  const getButtonClassName = (isActive: boolean) => {
    return `px-2 py-1 rounded text-xs font-medium transition-all duration-300 ${
      isActive
        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:from-blue-600 hover:to-indigo-700 transform hover:-translate-y-0.5"
        : "bg-gray-800/60 text-gray-400 hover:bg-gray-700/80 hover:text-white hover:shadow-sm"
    } flex items-center space-x-2`;
  };

  return (
    <div className="flex space-x-2">
      {tabItems.map((item) => (
        <button
          key={item.key}
          className={getButtonClassName(activePanel === item.key)}
          onClick={item.handleChange}
        >
          {item.icon}
          <span>{item.title}</span>
        </button>
      ))}
    </div>
  );
};

export default ToolsTabs;
