interface Message {
  en: string;
  zh: string;
}

export const chatListDropdownMessages: { [key: string]: Message } = {
  // ChatListDropdown相关的多语言配置
  chatDeleted: {
    en: "Chat deleted",
    zh: "对话已删除"
  },
  chatNameEmpty: {
    en: "Chat name cannot be empty",
    zh: "对话名称不能为空"
  },
  chatNameExists: {
    en: "Chat with the same name already exists",
    zh: "已存在同名对话"
  },
  confirmDeleteTitle: {
    en: "Delete Chat",
    zh: "删除对话"
  },
  confirmDeleteContent: {
    en: "Are you sure you want to delete the chat '{{name}}'? This action cannot be undone.",
    zh: "确定要删除对话 '{{name}}' 吗？此操作不可撤销。"
  },
  showMore: {
    en: "Show More",
    zh: "显示更多"
  },
  showLess: {
    en: "Show Less",
    zh: "收起"
  },
  renameChatTitle: {
    en: "Rename Chat",
    zh: "重命名对话"
  },
  enterChatName: {
    en: "Please enter a name for the chat",
    zh: "请输入对话名称"
  },
  renameSuccess: {
    en: "Chat renamed successfully",
    zh: "对话重命名成功"
  },
  renameFailed: {
    en: "Failed to rename chat",
    zh: "重命名对话失败"
  },
  loadChatFailed: {
    en: "Failed to load chat",
    zh: "加载对话失败"
  },
  deleteChatFailed: {
    en: "Failed to delete chat",
    zh: "删除对话失败"
  },
  chatLoadedSuccessfully: {
    en: "Chat loaded successfully",
    zh: "对话加载成功"
  },
  chatList: {
    en: "Chat List",
    zh: "对话列表"
  },
  noChatAvailable: {
    en: "No chat available",
    zh: "暂无对话"
  },
  chatHistory: {
    en: "Chat History",
    zh: "对话历史"
  },
  selectChat: {
    en: "Select a chat",
    zh: "选择对话"
  },
  chatOptions: {
    en: "Chat Options",
    zh: "对话选项"
  },
  duplicateChat: {
    en: "Duplicate Chat",
    zh: "复制对话"
  },
  exportChat: {
    en: "Export Chat",
    zh: "导出对话"
  },
  archiveChat: {
    en: "Archive Chat",
    zh: "归档对话"
  },
  unarchiveChat: {
    en: "Unarchive Chat",
    zh: "取消归档"
  },
  pinChat: {
    en: "Pin Chat",
    zh: "置顶对话"
  },
  unpinChat: {
    en: "Unpin Chat",
    zh: "取消置顶"
  },
  cancelButton: {
    en: "Cancel",
    zh: "取消"
  },
  deleteButton: {
    en: "Delete",
    zh: "删除"
  },
  confirmButton: {
    en: "Confirm",
    zh: "确认"
  },
  renameButton: {
    en: "Rename",
    zh: "重命名"
  },
  saveButton: {
    en: "Save",
    zh: "保存"
  },
  loadButton: {
    en: "Load",
    zh: "加载"
  },
  createButton: {
    en: "Create",
    zh: "创建"
  },
  editButton: {
    en: "Edit",
    zh: "编辑"
  },
  copyButton: {
    en: "Copy",
    zh: "复制"
  },
  moveButton: {
    en: "Move",
    zh: "移动"
  },
  newName: {
    en: "New Name",
    zh: "新名称"
  },
  enterNewName: {
    en: "Enter new name",
    zh: "输入新名称"
  },
  chatName: {
    en: "Chat Name",
    zh: "对话名称"
  },
  chatDescription: {
    en: "Chat Description",
    zh: "对话描述"
  },
  lastModified: {
    en: "Last Modified",
    zh: "最后修改"
  },
  messageCount: {
    en: "Message Count",
    zh: "消息数量"
  },
  createdDate: {
    en: "Created Date",
    zh: "创建日期"
  },
  chatSize: {
    en: "Chat Size",
    zh: "对话大小"
  },
  noChatsFound: {
    en: "No chats found",
    zh: "未找到对话"
  },
  searchChats: {
    en: "Search chats",
    zh: "搜索对话"
  },
  filterChats: {
    en: "Filter chats",
    zh: "筛选对话"
  },
  sortChats: {
    en: "Sort chats",
    zh: "排序对话"
  },
  sortByName: {
    en: "Sort by name",
    zh: "按名称排序"
  },
  sortByDate: {
    en: "Sort by date",
    zh: "按日期排序"
  },
  sortBySize: {
    en: "Sort by size",
    zh: "按大小排序"
  },
  ascending: {
    en: "Ascending",
    zh: "升序"
  },
  descending: {
    en: "Descending",
    zh: "降序"
  },
  refreshChats: {
    en: "Refresh chats",
    zh: "刷新对话列表"
  },
  importChat: {
    en: "Import Chat",
    zh: "导入对话"
  },
  exportChatAsJson: {
    en: "Export as JSON",
    zh: "导出为JSON"
  },
  exportChatAsText: {
    en: "Export as Text",
    zh: "导出为文本"
  },
  exportChatAsMarkdown: {
    en: "Export as Markdown",
    zh: "导出为Markdown"
  },
  chatExported: {
    en: "Chat exported successfully",
    zh: "对话导出成功"
  },
  chatExportFailed: {
    en: "Failed to export chat",
    zh: "导出对话失败"
  },
  chatImported: {
    en: "Chat imported successfully",
    zh: "对话导入成功"
  },
  chatImportFailed: {
    en: "Failed to import chat",
    zh: "导入对话失败"
  },
  selectFile: {
    en: "Select file",
    zh: "选择文件"
  },
  fileSelected: {
    en: "File selected",
    zh: "文件已选择"
  },
  invalidFileFormat: {
    en: "Invalid file format",
    zh: "文件格式无效"
  },
  fileTooLarge: {
    en: "File too large",
    zh: "文件过大"
  },
  processingFile: {
    en: "Processing file...",
    zh: "处理文件中..."
  },
  uploadComplete: {
    en: "Upload complete",
    zh: "上传完成"
  },
  uploadFailed: {
    en: "Upload failed",
    zh: "上传失败"
  },
  downloadStarted: {
    en: "Download started",
    zh: "下载开始"
  },
  downloadComplete: {
    en: "Download complete",
    zh: "下载完成"
  },
  downloadFailed: {
    en: "Download failed",
    zh: "下载失败"
  },
  newChat: {
    en: "New Chat",
    zh: "新建对话"
  },
  chatRenamed: {
    en: "Chat renamed successfully",
    zh: "对话重命名成功"
  },
  ruleModePromptGenerated: {
    en: "Rule mode prompt generated",
    zh: "规则模式提示已生成"
  },
  ruleModePromptError: {
    en: "Rule mode prompt error: {{error}}",
    zh: "规则模式提示错误：{{error}}"
  }
};
