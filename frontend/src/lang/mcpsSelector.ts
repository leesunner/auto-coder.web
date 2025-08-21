
interface Message {
  en: string;
  zh: string;
}

export const mcpsSelectorMessages: { [key: string]: Message } = {
  // MCPsSelector 相关的多语言配置
  disableMultiAgentCollaboration: {
    en: "Disable Multi-Agent Collaboration Pattern",
    zh: "禁用多智能体协作模式"
  },
  enableMultiAgentCollaboration: {
    en: "Enable Multi-Agent Collaboration Pattern",
    zh: "启用多智能体协作模式"
  },
  mcpsProvider: {
    en: "MCPs Provider",
    zh: "MCPs 提供者"
  }
};
