import React, { createContext, useContext, useState, ReactNode } from 'react';

// 定义 Context 的类型
interface ChatContextType {
  chatLists: string[];
  setChatLists: React.Dispatch<React.SetStateAction<string[]>>;
  chatListName: string;
  setChatListName: React.Dispatch<React.SetStateAction<string>>;
}

// 创建 Context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider 组件的 Props 类型
interface ChatProviderProps {
  children: ReactNode;
}

// Provider 组件
export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [chatLists, setChatLists] = useState<string[]>([]);
  const [chatListName, setChatListName] = useState<string>('');

  const value: ChatContextType = {
    chatLists,
    setChatLists,
    chatListName,
    setChatListName,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// 自定义 Hook 用于使用 Context
export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext 必须在 ChatProvider 内部使用');
  }
  return context;
};
