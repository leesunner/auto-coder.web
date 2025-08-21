

interface Message {
  en: string;
  zh: string;
}

export const ragSelectorMessages: { [key: string]: Message } = {
  // RagSelector 相关的多语言配置
  selectRagProvider: {
    en: "Select a Retrieval-Augmented Generation provider",
    zh: "选择检索增强生成提供者"
  },
  ragProvider: {
    en: "RAG Provider",
    zh: "RAG 提供者"
  },
  refreshRagProviders: {
    en: "Refresh RAG providers",
    zh: "刷新 RAG 提供者"
  },
  selectRag: {
    en: "Select RAG",
    zh: "选择 RAG"
  },
  noRagProvidersFound: {
    en: "No RAG providers found",
    zh: "未找到 RAG 提供者"
  },
  failedToFetchRags: {
    en: "Failed to fetch RAGs",
    zh: "获取 RAG 列表失败"
  }
};

