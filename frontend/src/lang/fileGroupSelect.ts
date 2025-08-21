interface Message {
  en: string;
  zh: string;
}

export const fileGroupSelectMessages: { [key: string]: Message } = {
  // 基础界面文本
  fileGroupSelectPlaceholder: {
    en: "Select files or groups...",
    zh: "选择文件或分组..."
  },
  focusInput: {
    en: "Focus on file selector",
    zh: "聚焦到文件选择器"
  },
  
  // 错误和状态消息
  errorFetchingCompletions: {
    en: "Error fetching file completions",
    zh: "获取文件补全失败"
  },
  errorUpdatingSelection: {
    en: "Error updating file selection",
    zh: "更新文件选择失败"
  },
  clearFailed: {
    en: "Failed to clear files",
    zh: "清空文件失败"
  },
  clearContext: {
    en: "Clear all selected files and groups",
    zh: "清空所有选中的文件和分组"
  },
  clearSuccess: {
    en: "Files cleared successfully",
    zh: "文件清空成功"
  },
  confirmClear: {
    en: "Confirm Clear",
    zh: "确认清空"
  },
  confirmClearContent: {
    en: "Are you sure you want to clear all selected files and groups? This action cannot be undone.",
    zh: "确定要清空所有选中的文件和分组吗？此操作不可撤销。"
  },
  
  // 编辑器相关
  editorTabsChanged: {
    en: "Editor tabs changed",
    zh: "编辑器标签页已更改"
  },
  
  // 文件分组标签
  searchResults: {
    en: "Search Results",
    zh: "搜索结果"
  },
  openedFiles: {
    en: "Opened Files",
    zh: "已打开文件"
  },
  mentionedFiles: {
    en: "Mentioned Files",
    zh: "提及的文件"
  },
  
  // 文件状态
  fileType: {
    en: "File",
    zh: "文件"
  },
  fileStatusActive: {
    en: "Active",
    zh: "活跃"
  },
  fileStatusOpened: {
    en: "Opened",
    zh: "已打开"
  },
  mentionedFileStatus: {
    en: "Mentioned",
    zh: "已提及"
  },
  
  // 计数显示
  fileCount: {
    en: "{{count}} files",
    zh: "{{count}} 个文件"
  },
  moreFiles: {
    en: "+{{count}} more",
    zh: "+{{count}} 个"
  },
  
  // Modal 按钮文本 (从 common.ts 继承，但在这里明确定义以确保一致性)
  okButton: {
    en: "OK",
    zh: "确定"
  },
  cancelButton: {
    en: "Cancel",
    zh: "取消"
  }
};
