export { getMessage } from "../../lang";

interface Message {
  en: string;
  zh: string;
}

export const mainContentMessages: { [key: string]: Message } = {
  // 通用操作
  loading: {
    en: "Loading...",
    zh: "加载中...",
  },
  save: {
    en: "Save",
    zh: "保存",
  },
  cancel: {
    en: "Cancel",
    zh: "取消",
  },
  confirm: {
    en: "Confirm",
    zh: "确认",
  },
  delete: {
    en: "Delete",
    zh: "删除",
  },
  edit: {
    en: "Edit",
    zh: "编辑",
  },
  add: {
    en: "Add",
    zh: "添加",
  },
  create: {
    en: "Create",
    zh: "创建",
  },
  update: {
    en: "Update",
    zh: "更新",
  },
  enable: {
    en: "Enable",
    zh: "启用",
  },
  disable: {
    en: "Disable",
    zh: "禁用",
  },

  // 基础设置
  basicSettings: {
    en: "Basic Settings",
    zh: "基本设置",
  },
  advancedSettings: {
    en: "Advanced Settings",
    zh: "高级设置",
  },

  // 模型配置
  modelConfiguration: {
    en: "Model Configuration",
    zh: "模型配置",
  },
  modelManagement: {
    en: "Model Management",
    zh: "模型管理",
  },
  addModel: {
    en: "Add Model",
    zh: "添加模型",
  },
  editModel: {
    en: "Edit Model",
    zh: "编辑模型",
  },
  deleteModel: {
    en: "Delete Model",
    zh: "删除模型",
  },
  modelName: {
    en: "Model Name",
    zh: "模型名称",
  },
  modelDescription: {
    en: "Model Description",
    zh: "模型描述",
  },
  modelType: {
    en: "Model Type",
    zh: "模型类型",
  },
  baseUrl: {
    en: "Base URL",
    zh: "基础URL",
  },
  apiKey: {
    en: "API Key",
    zh: "API密钥",
  },
  maxOutputTokens: {
    en: "Max Output Tokens",
    zh: "最大输出令牌数",
  },
  inputPrice: {
    en: "Input Price",
    zh: "输入价格",
  },
  outputPrice: {
    en: "Output Price",
    zh: "输出价格",
  },
  averageSpeed: {
    en: "Average Speed",
    zh: "平均速度",
  },
  isReasoning: {
    en: "Is Reasoning Model",
    zh: "推理模型",
  },

  // 供应商管理
  providerManagement: {
    en: "Provider Management",
    zh: "供应商管理",
  },
  addProvider: {
    en: "Add Provider",
    zh: "添加供应商",
  },
  editProvider: {
    en: "Edit Provider",
    zh: "编辑供应商",
  },
  deleteProvider: {
    en: "Delete Provider",
    zh: "删除供应商",
  },
  providerName: {
    en: "Provider Name",
    zh: "供应商名称",
  },

  // 编译器配置
  compilerConfiguration: {
    en: "Compiler Configuration",
    zh: "编译器配置",
  },
  addCompiler: {
    en: "Add Compiler",
    zh: "添加编译器",
  },
  editCompiler: {
    en: "Edit Compiler",
    zh: "编辑编译器",
  },
  deleteCompiler: {
    en: "Delete Compiler",
    zh: "删除编译器",
  },
  compilerName: {
    en: "Compiler Name",
    zh: "编译器名称",
  },
  compilerType: {
    en: "Compiler Type",
    zh: "编译器类型",
  },
  workingDirectory: {
    en: "Working Directory",
    zh: "工作目录",
  },
  initializeDefault: {
    en: "Initialize Default",
    zh: "初始化默认",
  },

  // RAG配置
  ragConfiguration: {
    en: "RAG Configuration",
    zh: "RAG配置",
  },
  addRag: {
    en: "Add RAG",
    zh: "添加RAG",
  },
  editRag: {
    en: "Edit RAG",
    zh: "编辑RAG",
  },
  deleteRag: {
    en: "Delete RAG",
    zh: "删除RAG",
  },
  ragName: {
    en: "RAG Name",
    zh: "RAG名称",
  },
  ragBaseUrl: {
    en: "RAG Base URL",
    zh: "RAG基础URL",
  },
  ragApiKey: {
    en: "RAG API Key",
    zh: "RAG API密钥",
  },

  // MCP服务配置
  mcpServerConfiguration: {
    en: "MCP Server Configuration",
    zh: "MCP服务器配置",
  },
  mcpServers: {
    en: "MCP Servers",
    zh: "MCP服务器",
  },
  marketplace: {
    en: "Marketplace",
    zh: "市场",
  },
  manualInstall: {
    en: "Manual Install",
    zh: "手动安装",
  },
  manualAdd: {
    en: "Manual Add to Marketplace",
    zh: "手动添加到市场",
  },
  installed: {
    en: "Installed",
    zh: "已安装",
  },
  install: {
    en: "Install",
    zh: "安装",
  },
  uninstall: {
    en: "Uninstall",
    zh: "卸载",
  },

  // 记忆系统
  memorySystem: {
    en: "Memory System",
    zh: "记忆系统",
  },
  memorySystemTasks: {
    en: "Memory System Tasks",
    zh: "记忆系统任务",
  },
  taskId: {
    en: "Task ID",
    zh: "任务ID",
  },
  status: {
    en: "Status",
    zh: "状态",
  },
  file: {
    en: "File",
    zh: "文件",
  },
  startTime: {
    en: "Start Time",
    zh: "开始时间",
  },
  completionTime: {
    en: "Completion Time",
    zh: "完成时间",
  },
  tokens: {
    en: "Tokens",
    zh: "令牌",
  },
  total: {
    en: "Total",
    zh: "总计",
  },
  input: {
    en: "Input",
    zh: "输入",
  },
  output: {
    en: "Output",
    zh: "输出",
  },
  cost: {
    en: "Cost",
    zh: "成本",
  },
  processedDirs: {
    en: "Processed Directories",
    zh: "已处理目录",
  },
  memorySystemLoadError: {
    en: "Failed to load memory system tasks",
    zh: "加载记忆系统任务失败",
  },

  // 任务管理
  taskManagement: {
    en: "Task Management",
    zh: "任务管理",
  },
  todos: {
    en: "Todos",
    zh: "待办事项",
  },
  requirements: {
    en: "Requirements",
    zh: "需求管理",
  },
  createNewTask: {
    en: "Create New Task",
    zh: "创建新任务",
  },
  editTask: {
    en: "Edit Task",
    zh: "编辑任务",
  },
  deleteTask: {
    en: "Delete Task",
    zh: "删除任务",
  },
  splitTask: {
    en: "Split Task with AI",
    zh: "AI拆分任务",
  },
  todoTitle: {
    en: "Title",
    zh: "标题",
  },
  todoDescription: {
    en: "Description",
    zh: "描述",
  },
  priority: {
    en: "Priority",
    zh: "优先级",
  },
  tags: {
    en: "Tags",
    zh: "标签",
  },
  dueDate: {
    en: "Due Date",
    zh: "截止日期",
  },
  owner: {
    en: "Owner",
    zh: "负责人",
  },

  // 优先级
  priorityP0: {
    en: "P0 - Critical",
    zh: "P0 - 紧急",
  },
  priorityP1: {
    en: "P1 - High",
    zh: "P1 - 高",
  },
  priorityP2: {
    en: "P2 - Medium",
    zh: "P2 - 中",
  },
  priorityP3: {
    en: "P3 - Low",
    zh: "P3 - 低",
  },

  // 状态
  statusPending: {
    en: "Pending",
    zh: "待评估",
  },
  statusDeveloping: {
    en: "Developing",
    zh: "开发中",
  },
  statusTesting: {
    en: "Testing",
    zh: "测试中",
  },
  statusDone: {
    en: "Done",
    zh: "已完成",
  },

  // 文件组相关
  fileGroups: {
    en: "File Groups",
    zh: "文件组",
  },
  fileGroupTitle: {
    en: "File Groups",
    zh: "文件组",
  },
  fileGroupCreateSuccess: {
    en: "Group created successfully",
    zh: "分组创建成功",
  },
  fileGroupCreateFailed: {
    en: "Failed to create group",
    zh: "创建分组失败",
  },
  fileGroupDeleteSuccess: {
    en: "Group deleted successfully",
    zh: "分组删除成功",
  },
  fileGroupDeleteFailed: {
    en: "Failed to delete group",
    zh: "删除分组失败",
  },
  fileGroupAddFilesSuccess: {
    en: "Files added successfully",
    zh: "文件添加成功",
  },
  fileGroupAddFilesFailed: {
    en: "Failed to add files",
    zh: "添加文件失败",
  },
  fileGroupRemoveSuccess: {
    en: "File removed successfully",
    zh: "文件移除成功",
  },
  fileGroupRemoveFailed: {
    en: "Failed to remove file",
    zh: "移除文件失败",
  },
  fileGroupLoadFailed: {
    en: "Failed to load file content",
    zh: "加载文件内容失败",
  },
  fileGroupNoGroups: {
    en: "No groups available",
    zh: "暂无分组",
  },
  fileGroupSelectFile: {
    en: "Select a file to preview",
    zh: "选择文件以预览",
  },
  fileGroupCreateNewGroup: {
    en: "Create New Group",
    zh: "创建新分组",
  },
  fileGroupGroupName: {
    en: "Group Name",
    zh: "分组名称",
  },
  fileGroupGroupNamePlaceholder: {
    en: "Enter group name",
    zh: "请输入分组名称",
  },
  fileGroupDescription: {
    en: "Description",
    zh: "描述",
  },
  fileGroupDescriptionPlaceholder: {
    en: "Enter group description",
    zh: "请输入分组描述",
  },
  fileGroupAddExternalFile: {
    en: "Add External File",
    zh: "添加外部文件",
  },
  fileGroupExternalFilePath: {
    en: "File Path or URL",
    zh: "文件路径或URL",
  },
  fileGroupExternalFilePathPlaceholder: {
    en: "Enter file path or HTTP(S) URL",
    zh: "输入文件路径或HTTP(S) URL",
  },
  fileGroupExternalFileSuccess: {
    en: "External file added successfully",
    zh: "外部文件添加成功",
  },
  fileGroupExternalFileFailed: {
    en: "Failed to add external file",
    zh: "添加外部文件失败",
  },
  fileGroupUnexpectedResponse: {
    en: "Unexpected response format",
    zh: "意外的响应格式",
  },

  // 设置相关
  settingsPanel: {
    en: "Settings Panel",
    zh: "设置面板",
  },
  language: {
    en: "Language",
    zh: "语言",
  },
  selectLanguage: {
    en: "Select Language",
    zh: "选择语言",
  },
  clickReload: {
    en: "Click Reload Page",
    zh: "点击重载页面",
  },
  english: {
    en: "English",
    zh: "英语",
  },
  chinese: {
    en: "Chinese",
    zh: "中文",
  },

  // 预览相关
  preview: {
    en: "Preview",
    zh: "预览",
  },
  previewPanel: {
    en: "Preview Panel",
    zh: "预览面板",
  },
  codePreview: {
    en: "Code Preview",
    zh: "代码预览",
  },
  editablePreview: {
    en: "Editable Preview",
    zh: "可编辑预览",
  },

  // 历史相关
  history: {
    en: "History",
    zh: "历史",
  },
  historyPanel: {
    en: "History Panel",
    zh: "历史面板",
  },

  // 错误和成功消息
  operationSuccess: {
    en: "Operation completed successfully",
    zh: "操作成功完成",
  },
  operationFailed: {
    en: "Operation failed",
    zh: "操作失败",
  },
  saveSuccess: {
    en: "Saved successfully",
    zh: "保存成功",
  },
  saveFailed: {
    en: "Save failed",
    zh: "保存失败",
  },
  deleteSuccess: {
    en: "Deleted successfully",
    zh: "删除成功",
  },
  deleteFailed: {
    en: "Delete failed",
    zh: "删除失败",
  },
  loadFailed: {
    en: "Load failed",
    zh: "加载失败",
  },
  connectionError: {
    en: "Connection error",
    zh: "连接错误",
  },

  // 确认对话框
  deleteConfirmation: {
    en: "Are you sure you want to delete this item?",
    zh: "确定要删除此项吗？",
  },
  deleteConfirmationTitle: {
    en: "Confirm Delete",
    zh: "确认删除",
  },

  // 表单验证
  fieldRequired: {
    en: "This field is required",
    zh: "此字段为必填项",
  },
  invalidInput: {
    en: "Invalid input",
    zh: "输入无效",
  },

  // 其他通用消息
  actions: {
    en: "Actions",
    zh: "操作",
  },
  search: {
    en: "Search",
    zh: "搜索",
  },
  filter: {
    en: "Filter",
    zh: "筛选",
  },
  sort: {
    en: "Sort",
    zh: "排序",
  },
  refresh: {
    en: "Refresh",
    zh: "刷新",
  },
  export: {
    en: "Export",
    zh: "导出",
  },
  import: {
    en: "Import",
    zh: "导入",
  },
  settings: {
    en: "Settings",
    zh: "设置",
  },
  help: {
    en: "Help",
    zh: "帮助",
  },
  about: {
    en: "About",
    zh: "关于",
  },
  close: {
    en: "Close",
    zh: "关闭",
  },
  open: {
    en: "Open",
    zh: "打开",
  },
  view: {
    en: "View",
    zh: "查看",
  },
  copy: {
    en: "Copy",
    zh: "复制",
  },
  paste: {
    en: "Paste",
    zh: "粘贴",
  },
  cut: {
    en: "Cut",
    zh: "剪切",
  },
  undo: {
    en: "Undo",
    zh: "撤销",
  },
  redo: {
    en: "Redo",
    zh: "重做",
  },
  selectAll: {
    en: "Select All",
    zh: "全选",
  },
  clear: {
    en: "Clear",
    zh: "清空",
  },
  reset: {
    en: "Reset",
    zh: "重置",
  },

  // EditablePreviewPanel 相关消息
  editingEnabled: {
    en: "Editing enabled",
    zh: "编辑模式已启用",
  },
  editingDisabled: {
    en: "Editing disabled",
    zh: "编辑模式已禁用",
  },
  showCode: {
    en: "Show code",
    zh: "显示代码",
  },
  hideCode: {
    en: "Hide code",
    zh: "隐藏代码",
  },
  reloadPreview: {
    en: "Reload preview",
    zh: "重新加载预览",
  },
  disableEditing: {
    en: "Disable editing",
    zh: "禁用编辑",
  },
  enableEditing: {
    en: "Enable editing",
    zh: "启用编辑",
  },
  saveEditedHTML: {
    en: "Save edited HTML",
    zh: "保存编辑的HTML",
  },
  loadingPreview: {
    en: "Loading preview...",
    zh: "加载预览中...",
  },
  enterUrlToStartPreview: {
    en: "Enter URL to start preview",
    zh: "输入URL开始预览",
  },

  // ModelChatDialog 相关消息
  modelDialogTestTitle: {
    en: "Model Test Dialog",
    zh: "模型测试对话",
  },
  noDialogMessages: {
    en: "No messages yet",
    zh: "暂无消息",
  },
  dialogInputPlaceholder: {
    en: "Enter your message...",
    zh: "请输入内容...",
  },
  send: {
    en: "Send",
    zh: "发送",
  },

  // AutoExecuteNotificationModal 相关消息
  taskExecutingMessage: {
    en: "Task is executing...",
    zh: "任务执行中...",
  },
  taskConfirmExecuteMessage: {
    en: "Confirm to execute this task?",
    zh: "确认执行此任务？",
  },
  taskAutoExecuteMessage: {
    en: "Task will be executed automatically",
    zh: "任务将自动执行",
  },
  taskConfirmExecuteDescription: {
    en: "Please confirm whether to execute this task",
    zh: "请确认是否执行此任务",
  },
  taskAutoExecuteDescription: {
    en: "This task will be executed automatically",
    zh: "此任务将自动执行",
  },
  taskAutoExecuteTitle: {
    en: "Task Auto Execute",
    zh: "任务自动执行",
  },

  // FileDirectorySelector 相关消息
  collapse: {
    en: "Collapse",
    zh: "收起",
  },
  expand: {
    en: "Expand",
    zh: "展开",
  },
  selectAllFilesInside: {
    en: "Select all files inside",
    zh: "选择内部所有文件",
  },
  deselect: {
    en: "Deselect",
    zh: "取消选择",
  },
  select: {
    en: "Select",
    zh: "选择",
  },
  previewFile: {
    en: "Preview file",
    zh: "预览文件",
  },
  copyPath: {
    en: "Copy path",
    zh: "复制路径",
  },
  addTo: {
    en: "Add to",
    zh: "添加到",
  },
  pathCopiedToClipboard: {
    en: "Path copied to clipboard",
    zh: "路径已复制到剪贴板",
  },
  failedToCopyPath: {
    en: "Failed to copy path",
    zh: "复制路径失败",
  },
  searchFiles: {
    en: "Search files",
    zh: "搜索文件",
  },
  refreshDirectoryTree: {
    en: "Refresh directory tree",
    zh: "刷新目录树",
  },
  addSelected: {
    en: "Add selected",
    zh: "添加选中",
  },
  selectAllCurrentVisible: {
    en: "Select all currently visible",
    zh: "选择当前可见的所有",
  },
  invertCurrentVisible: {
    en: "Invert current visible",
    zh: "反选当前可见",
  },
  filesSelected: {
    en: "files selected",
    zh: "个文件已选择",
  },
  filesInverted: {
    en: "files inverted",
    zh: "个文件已反选",
  },
  filterByFileType: {
    en: "Filter by file type",
    zh: "按文件类型筛选",
  },
  fileAddedToSelection: {
    en: "File added to selection",
    zh: "文件已添加到选择",
  },

  // DiffViewer 相关消息
  codeChangesDetail: {
    en: "Code Changes Detail",
    zh: "代码变更详情",
  },
  fileList: {
    en: "File List",
    zh: "文件列表",
  },
  originalDiff: {
    en: "Original Diff",
    zh: "原始差异",
  },
  diffView: {
    en: "Diff View",
    zh: "差异视图",
  },
  beforeModification: {
    en: "Before Modification",
    zh: "修改前",
  },
  afterModification: {
    en: "After Modification",
    zh: "修改后",
  },
  newFile: {
    en: "New File",
    zh: "新文件",
  },
  fileDeleted: {
    en: "File Deleted",
    zh: "文件已删除",
  },
  restoreNormalView: {
    en: "Restore Normal View",
    zh: "恢复正常视图",
  },
  maximizeView: {
    en: "Maximize View",
    zh: "最大化视图",
  },
  splitView: {
    en: "Split View",
    zh: "分割视图",
  },
  unifiedView: {
    en: "Unified View",
    zh: "统一视图",
  },
  noFileChanges: {
    en: "No file changes information",
    zh: "没有文件变更信息",
  },
  getDiffFailed: {
    en: "Failed to get diff",
    zh: "获取diff失败",
  },
  getFileDiffFailed: {
    en: "Failed to get file diff",
    zh: "获取文件差异失败",
  },

  // HistoryPanel 相关消息
  revertCommitFailed: {
    en: "Failed to revert commit",
    zh: "撤销提交失败",
  },

  // BasicSettings 相关消息
  enableAgenticAutoApproveDescription: {
    en: "Automatically approve shell command execution",
    zh: "自动同意执行shell命令",
  },
};
