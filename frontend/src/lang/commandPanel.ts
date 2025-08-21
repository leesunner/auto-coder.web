interface Message {
  en: string;
  zh: string;
}

export const commandPanelMessages: { [key: string]: Message } = {
  // CommandPanel 相关的多语言配置
  selectCommandFile: {
    en: "Select command file",
    zh: "选择命令文件"
  },
  refreshFiles: {
    en: "Refresh files",
    zh: "刷新文件"
  },
  hidePreview: {
    en: "Hide preview",
    zh: "隐藏预览"
  },
  showPreview: {
    en: "Show preview",
    zh: "显示预览"
  },
  renderedPreview: {
    en: "Rendered Preview:",
    zh: "渲染预览："
  },
  waitingForInput: {
    en: "Waiting for input...",
    zh: "等待输入..."
  },
  enterValue: {
    en: "Enter value",
    zh: "输入值"
  },
  executeCommand: {
    en: "Execute Command",
    zh: "执行命令"
  },
  selectCommandFileFirst: {
    en: "Select a command file",
    zh: "选择一个命令文件"
  },
  pleaseSelectCommandFile: {
    en: "Please select a command file",
    zh: "请选择一个命令文件"
  },
  pleaseProvideValues: {
    en: "Please provide values for",
    zh: "请为以下变量提供值"
  },
  commandExecutedSuccessfully: {
    en: "Command executed successfully",
    zh: "命令执行成功"
  },
  failedToExecuteCommand: {
    en: "Failed to execute command",
    zh: "命令执行失败"
  },
  failedToRenderTemplate: {
    en: "Failed to render template",
    zh: "模板渲染失败"
  },
  failedToFetchCommandFiles: {
    en: "Failed to fetch command files. Please try again.",
    zh: "获取命令文件失败，请重试。"
  },
  failedToFetchFileDetails: {
    en: "Failed to fetch file details. Please try again.",
    zh: "获取文件详情失败，请重试。"
  },
  failedToFetchFileContent: {
    en: "Failed to fetch file content",
    zh: "获取文件内容失败"
  },
  failedToFetchFileVariables: {
    en: "Failed to fetch file variables",
    zh: "获取文件变量失败"
  },
  loading: {
    en: "Loading...",
    zh: "加载中..."
  }
};
