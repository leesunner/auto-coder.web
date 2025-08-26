import { getMessage } from "@/lang";
import React, { createContext, useContext, useState, ReactNode } from "react";

// 定义 Context 的类型
interface ChatContextType {
  chatLists: string[];
  setChatLists: React.Dispatch<React.SetStateAction<string[]>>;
  chatListName: string;
  setChatListName: React.Dispatch<React.SetStateAction<string>>;
  setTabs: React.Dispatch<React.SetStateAction<ChatTabConfig[]>>;
  tabs: ChatTabConfig[];
  activeTabId: string;
  setActiveTabId: React.Dispatch<React.SetStateAction<string>>;
  isExpertMode: boolean;
  setIsExpertMode: React.Dispatch<React.SetStateAction<boolean>>;
}

// 定义单个聊天面板的配置接口
export interface ChatTabConfig {
  id: string;
  name: string;
}

export interface ChatPanelsConfig {
  tabs: ChatTabConfig[];
  activeTabId: string;
}

// 创建 Context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider 组件的 Props 类型
interface ChatProviderProps {
  children: ReactNode;
  isExpertMode: boolean;
  setIsExpertMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DEFAULT_TABS: ChatTabConfig[] = [
  { id: "main", name: getMessage("mainChat") || "主线面板" },
  { id: "secondary", name: getMessage("secondaryChat") || "支线面板" },
];

// Provider 组件
export const ChatProvider: React.FC<ChatProviderProps> = ({
  children,
  setIsExpertMode,
  isExpertMode,
}) => {
  const [chatLists, setChatLists] = useState<string[]>([]);
  const [chatListName, setChatListName] = useState<string>("");

  // 默认聊天标签页配置
  const [tabs, setTabs] = useState<ChatTabConfig[]>(DEFAULT_TABS);
  const [activeTabId, setActiveTabId] = useState<string>(DEFAULT_TABS[0].id);

  const value: ChatContextType = {
    chatLists,
    setChatLists,
    chatListName,
    setChatListName,
    setTabs,
    tabs,
    activeTabId,
    setActiveTabId,
    setIsExpertMode,
    isExpertMode,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// 自定义 Hook 用于使用 Context
export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext 必须在 ChatProvider 内部使用");
  }
  return context;
};
