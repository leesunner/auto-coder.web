
import { getMessage as getMessageFromLang } from '../../lang';

interface Message {
  en: string;
  zh: string;
}

export const autoModeMessages: { [key: string]: Message } = {
  // 自动模式基础
  autoMode: {
    en: "Auto Mode",
    zh: "自动模式",
  },
  expertMode: {
    en: "Expert Mode",
    zh: "专家模式",
  },
  autoModeDescription: {
    en: "Ask anything about your code or what you want to build",
    zh: "询问任何关于你的代码或者你想构建的内容",
  },
  tryExamples: {
    en: "Try examples",
    zh: "尝试示例",
  },
  
  // 项目相关
  projectName: {
    en: "Project",
    zh: "项目名称",
  },
  noProjectSelected: {
    en: "No Project Selected",
    zh: "未选择项目",
  },
  
  // 导航和界面
  navigationMenu: {
    en: "Navigation Menu",
    zh: "导航菜单",
  },
  showMessages: {
    en: "Messages",
    zh: "消息",
  },
  currentChange: {
    en: "Current Changes",
    zh: "当前变化",
  },
  viewChange: {
    en: "History Changes",
    zh: "历史变化",
  },
  viewChanges: {
    en: "View Changes",
    zh: "查看变更",
  },
  fullScreenWidth: {
    en: "Full screen width",
    zh: "全屏宽度",
  },
  limitedWidth: {
    en: "Limited width",
    zh: "限制宽度",
  },
  close: {
    en: "Close",
    zh: "关闭",
  },
  
  // 消息类型和状态
  thinking: {
    en: "Thinking",
    zh: "思考",
  },
  processingStatus: {
    en: "Thinking...",
    zh: "正在思考...",
  },
  processingComplete: {
    en: "Thinking Complete",
    zh: "思考完成",
  },
  
  // 代码生成相关
  codeGenerateStart: {
    en: "Starting code generation...",
    zh: "开始代码生成...",
  },
  codeGenerateComplete: {
    en: "Code generation complete",
    zh: "代码生成完成",
  },
  generatingCode: {
    en: "Generating code...",
    zh: "正在生成代码...",
  },
  generatedCode: {
    en: "Generated Code",
    zh: "生成的代码",
  },
  codeGenerationComplete: {
    en: "Code generation complete",
    zh: "代码生成完成",
  },
  rankingCode: {
    en: "Code Ranking...",
    zh: "代码排序...",
  },
  codeRankingComplete: {
    en: "Code ranking complete",
    zh: "代码排序完成",
  },
  rankedCode: {
    en: "Ranked Code",
    zh: "排序后的代码",
  },
  
  // 编译和检查相关
  compileResults: {
    en: "Compile Results",
    zh: "编译结果",
  },
  analyzingCompile: {
    en: "Analyzing Compile...",
    zh: "正在分析编译...",
  },
  analyzingCode: {
    en: "Analyzing Code",
    zh: "正在分析代码",
  },
  lintResults: {
    en: "Lint Results",
    zh: "代码检查结果",
  },
  
  // 合并相关
  unmergedBlocks: {
    en: "Merge Check",
    zh: "合并检查",
  },
  
  // RAG搜索
  ragSearchStart: {
    en: "Starting RAG search...",
    zh: "开始RAG搜索...",
  },
  ragSearchComplete: {
    en: "RAG search complete",
    zh: "RAG搜索完成",
  },
  
  // 索引构建
  indexBuildStart: {
    en: "Build incremental index...",
    zh: "构建增量索引...",
  },
  indexBuildComplete: {
    en: "Index build complete",
    zh: "索引构建完成",
  },
  filterStart: {
    en: "Starting to filter files...",
    zh: "开始过滤文件...",
  },
  filterComplete: {
    en: "File filtering complete",
    zh: "文件过滤完成",
  },
  fileSelected: {
    en: "Selected file: {{file}}",
    zh: "已选择文件: {{file}}",
  },
  
  // 任务完成状态
  completion: {
    en: "Completion",
    zh: "完成",
  },
  jobCompleted: {
    en: "Job Completed",
    zh: "任务完成",
  },
  
  // 命令相关
  commandPreparation: {
    en: "Tool Preparation",
    zh: "工具准备",
  },
  compilerCommand: {
    en: "Command",
    zh: "命令",
  },
  parameters: {
    en: "Parameters",
    zh: "参数",
  },
  commandExecution: {
    en: "Execution Result",
    zh: "执行结果",
  },
  commandSuggestionTitle: {
    en: "After thinking, we will call the following command:",
    zh: "经过思考，我们会调用以下命令：",
  },
  
  // 上下文相关
  contextUsed: {
    en: "Context Used",
    zh: "使用的上下文",
  },
  filesReferenced: {
    en: "Files Referenced",
    zh: "引用的文件",
  },
  contextAwareInfo: {
    en: "Context Awareness",
    zh: "上下文感知信息",
  },
  analyzingContext: {
    en: "Analyzing Context...",
    zh: "正在分析上下文...",
  },
  contextAnalysisComplete: {
    en: "Context Analysis Complete",
    zh: "上下文分析完成",
  },
  relevantContext: {
    en: "Relevant Context",
    zh: "相关上下文",
  },
  
  // 用户交互
  user: {
    en: "User",
    zh: "用户",
  },
  summary: {
    en: "Summary",
    zh: "总结",
  },
  
  // Agentic Edit相关
  agenticEditToolResultReplaceInFileTool: {
    en: "AitoCoder updated the file",
    zh: "AitoCoder 更新了文件",
  },
  agenticEditToolResultWriteToFileTool: {
    en: "AitoCoder wrote to the file",
    zh: "AitoCoder 写入了文件",
  },
  agenticEditToolResultReadFileTool: {
    en: "AitoCoder read the file",
    zh: "AitoCoder 读取了文件",
  },
  agenticEditToolResultListFilesTool: {
    en: "AitoCoder listed the following files in this directory:",
    zh: "AitoCoder 列出了此目录中的以下文件:",
  },
  agenticEditToolResultSearchFilesTool: {
    en: "AitoCoder found the following files matching the pattern:",
    zh: "AitoCoder 找到了与此模式匹配的以下文件:",
  },
  agenticEditReplaceInFileToolTitle: {
    en: "AitoCoder wants to replace the content of this file",
    zh: "AitoCoder 想要替换此文件中的内容",
  },
  agenticEditWriteToFileToolTitle: {
    en: "AitoCoder wants to write to this file",
    zh: "AitoCoder 想要写入此文件",
  },
  agenticEditReadFileToolTitle: {
    en: "AitoCoder wants to read this file",
    zh: "AitoCoder 想要读取此文件",
  },
  agenticEditListFilesToolTitle: {
    en: "AitoCoder wants to list files in this directory",
    zh: "AitoCoder 想要列出此目录中的文件",
  },
  agenticEditSearchFilesToolTitle: {
    en: "AitoCoder wants to search for files matching this pattern",
    zh: "AitoCoder 想要搜索与此模式匹配的文件",
  },
  
  // Todo相关
  agenticTodoWriteToolTitle: {
    en: "AitoCoder Todo",
    zh: "AitoCoder 待办",
  },
  todoTaskPending: {
    en: "Pending",
    zh: "待处理",
  },
  todoTaskInProgress: {
    en: "In Progress",
    zh: "进行中",
  },
  todoTaskCompleted: {
    en: "Completed",
    zh: "已完成",
  },
  todoTaskHigh: {
    en: "High",
    zh: "高",
  },
  todoTaskMedium: {
    en: "Medium",
    zh: "中",
  },
  todoTaskLow: {
    en: "Low",
    zh: "低",
  },
  todoTaskNotes: {
    en: "Notes",
    zh: "备注",
  },
  todoTaskCreatedAt: {
    en: "Created",
    zh: "创建时间",
  },
  todoTaskUpdatedAt: {
    en: "Updated",
    zh: "更新时间",
  },
  todoActionCreate: {
    en: "Created todo list",
    zh: "创建了待办列表",
  },
  todoActionAddTask: {
    en: "Added new task",
    zh: "添加了新任务",
  },
  todoActionMarkProgress: {
    en: "Marked task as in progress",
    zh: "任务标记为进行中",
  },
  todoActionMarkCompleted: {
    en: "Marked task as completed",
    zh: "任务标记为已完成",
  },
  todoActionUpdate: {
    en: "Updated task",
    zh: "更新了任务",
  },
  todoActionDefault: {
    en: "Operated todo list",
    zh: "操作了待办列表",
  },
  todoStatsTotal: {
    en: "Total",
    zh: "总计",
  },
  todoStatsPending: {
    en: "Pending",
    zh: "待处理",
  },
  todoStatsInProgress: {
    en: "In Progress",
    zh: "进行中",
  },
  todoStatsCompleted: {
    en: "Completed",
    zh: "已完成",
  },
  todoEmptyStateCreate: {
    en: "Create todo list",
    zh: "创建待办列表",
  },
  todoEmptyStateMarkProgress: {
    en: "Todo task in progress",
    zh: "待办任务进行中",
  },
  todoEmptyStateMarkCompleted: {
    en: "Todo task completed",
    zh: "待办任务已完成",
  },
  todoEmptyStateDefault: {
    en: "Todo operation",
    zh: "待办操作",
  },
  todoTaskLabel: {
    en: "Task",
    zh: "任务",
  },
  
  // 用户输入对话框
  askUserDialogTitle: {
    en: "User Input Required",
    zh: "需要用户输入",
  },
  askUserDialogResponseRequired: {
    en: "A response is required to continue",
    zh: "需要回复才能继续",
  },
  askUserDialogPlaceholder: {
    en: "Type your response...",
    zh: "输入您的回复...",
  },
  askUserDialogSend: {
    en: "Send",
    zh: "发送",
  },
  
  // 输入面板
  inputPanelPlaceholder: {
    en: "Ask anything about your code...",
    zh: "询问任何关于你的代码的问题...",
  },
  inputPanelSend: {
    en: "Send",
    zh: "发送",
  },
  inputPanelCancel: {
    en: "Cancel",
    zh: "取消",
  },
  inputPanelHistory: {
    en: "History",
    zh: "历史",
  },
  inputPanelExpand: {
    en: "Expand Editor",
    zh: "展开编辑器",
  },
  inputPanelCollapse: {
    en: "Collapse Editor",
    zh: "收起编辑器",
  },
  
  // 提交列表面板
  commitListTitle: {
    en: "Commit History",
    zh: "提交历史",
  },
  commitListLoading: {
    en: "Loading commits...",
    zh: "加载提交记录中...",
  },
  commitListError: {
    en: "Failed to load commits",
    zh: "加载提交记录失败",
  },
  commitListEmpty: {
    en: "No commits found",
    zh: "未找到提交记录",
  },
  commitHash: {
    en: "Commit Hash",
    zh: "提交哈希",
  },
  commitAuthor: {
    en: "Author",
    zh: "作者",
  },
  commitDate: {
    en: "Date",
    zh: "日期",
  },
  commitMessage: {
    en: "Message",
    zh: "提交信息",
  },
  commitStats: {
    en: "Stats",
    zh: "统计",
  },
  commitInsertions: {
    en: "Insertions",
    zh: "新增",
  },
  commitDeletions: {
    en: "Deletions",
    zh: "删除",
  },
  commitFilesChanged: {
    en: "Files Changed",
    zh: "文件变更",
  },
  
  // 当前变化面板
  currentChangeTitle: {
    en: "Current Changes",
    zh: "当前变化",
  },
  currentChangeLoading: {
    en: "Loading changes...",
    zh: "加载变化中...",
  },
  currentChangeError: {
    en: "Failed to load changes",
    zh: "加载变化失败",
  },
  currentChangeEmpty: {
    en: "No changes found",
    zh: "未找到变化",
  },
  revertChanges: {
    en: "Revert Changes",
    zh: "撤销变化",
  },
  revertConfirmTitle: {
    en: "Confirm Revert",
    zh: "确认撤销",
  },
  revertConfirmMessage: {
    en: "Are you sure you want to revert this commit? This action cannot be undone.",
    zh: "确定要撤销此提交吗？此操作不可撤销。",
  },
  revertSuccess: {
    en: "Changes reverted successfully",
    zh: "变化撤销成功",
  },
  revertFailed: {
    en: "Failed to revert changes",
    zh: "撤销变化失败",
  },
  
  // 文件差异查看
  fileDiffBefore: {
    en: "Before",
    zh: "修改前",
  },
  fileDiffAfter: {
    en: "After",
    zh: "修改后",
  },
  fileDiffUnified: {
    en: "Unified View",
    zh: "统一视图",
  },
  fileDiffSplit: {
    en: "Split View",
    zh: "分屏视图",
  },
  fileDiffLoading: {
    en: "Loading file diff...",
    zh: "加载文件差异中...",
  },
  fileDiffError: {
    en: "Failed to load file diff",
    zh: "加载文件差异失败",
  },
  fileDiffMaximize: {
    en: "Maximize",
    zh: "最大化",
  },
  fileDiffMinimize: {
    en: "Minimize",
    zh: "最小化",
  },
  
  // 消息列表
  messageListEmpty: {
    en: "No messages yet",
    zh: "暂无消息",
  },
  messageListLoading: {
    en: "Loading messages...",
    zh: "加载消息中...",
  },
  
  // 其他通用消息
  markdown: {
    en: "Markdown",
    zh: "Markdown",
  },
  maximize: {
    en: "Maximize",
    zh: "最大化",
  },
  minimize: {
    en: "Minimize",
    zh: "最小化",
  },
  refreshFromHere: {
    en: "Refresh from here",
    zh: "从此处刷新",
  },
  askAgain: {
    en: "Ask Again from here",
    zh: "重新提问",
  },
  
  // 面板标题
  codeViewer: {
    en: "Code Editor",
    zh: "代码编辑器",
  },
  previewChangesStatic: {
    en: "Preview",
    zh: "预览",
  },
  previewChangesEditable: {
    en: "Editable Preview",
    zh: "可编辑预览",
  },
  more: {
    en: "More",
    zh: "更多",
  },
  todos: {
    en: "Todos",
    zh: "待办事项",
  },
  
  // 工具面板
  output: {
    en: "Output",
    zh: "输出",
  },
  terminal: {
    en: "Terminal",
    zh: "终端",
  },
  
  // 弹窗和对话框
  contentPreview: {
    en: "Content Preview",
    zh: "内容预览",
  },
  loadingHistory: {
    en: "Loading History...",
    zh: "加载历史记录中...",
  },
  
  // Tooltip 提示
  previewChangesStaticTooltip: {
    en: "Preview code changes in read-only mode",
    zh: "以只读模式预览代码变更",
  },
  previewChangesEditableTooltip: {
    en: "Preview and edit code changes",
    zh: "预览并编辑代码变更",
  },
  
  // 加载和错误状态
  loading: {
    en: "Loading...",
    zh: "加载中...",
  },
  error: {
    en: "Error",
    zh: "错误",
  },
  retry: {
    en: "Retry",
    zh: "重试",
  },
  
  // 操作按钮
  confirm: {
    en: "Confirm",
    zh: "确认",
  },
  cancel: {
    en: "Cancel",
    zh: "取消",
  },
  save: {
    en: "Save",
    zh: "保存",
  },
  delete: {
    en: "Delete",
    zh: "删除",
  },
  edit: {
    en: "Edit",
    zh: "编辑",
  },
  view: {
    en: "View",
    zh: "查看",
  },
  copy: {
    en: "Copy",
    zh: "复制",
  },
  refresh: {
    en: "Refresh",
    zh: "刷新",
  },
};

export const getMessage = getMessageFromLang;

