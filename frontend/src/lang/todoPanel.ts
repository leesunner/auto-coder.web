
interface Message {
  en: string;
  zh: string;
}

export const todoPanelMessages: { [key: string]: Message } = {
  // TodoPanel 相关的多语言配置
  createNewTask: {
    en: "Create New Task",
    zh: "创建新任务"
  },
  statusPending: {
    en: "Pending",
    zh: "待评估"
  },
  statusDeveloping: {
    en: "Developing",
    zh: "进行中"
  },
  statusTesting: {
    en: "Testing",
    zh: "测试中"
  },
  statusDone: {
    en: "Done",
    zh: "已完成"
  },
  priorityP0: {
    en: "P0 - Critical",
    zh: "P0 - 紧急"
  },
  priorityP1: {
    en: "P1 - High",
    zh: "P1 - 高优先级"
  },
  priorityP2: {
    en: "P2 - Medium",
    zh: "P2 - 中优先级"
  },
  priorityP3: {
    en: "P3 - Low",
    zh: "P3 - 低优先级"
  },
  taskTitlePlaceholder: {
    en: "Enter task title",
    zh: "输入任务标题"
  },
  priorityPlaceholder: {
    en: "Select priority",
    zh: "选择优先级"
  },
  cannotExecuteEmptyTasks: {
    en: "Cannot execute empty tasks, please split the task first",
    zh: "无法执行空任务，请先拆解任务"
  },
  cannotMoveCompletedTaskBack: {
    en: "Completed or testing tasks cannot be moved back to pending or developing status",
    zh: "测试中或已完成的任务不能移动到待办或开发中状态"
  },
  failedToSaveChanges: {
    en: "Failed to save changes",
    zh: "保存更改失败"
  },
  failedToExecuteTask: {
    en: "Failed to execute task",
    zh: "执行任务失败"
  },
  taskRunningStatus: {
    en: "Running",
    zh: "运行中"
  },
  taskExecutingInBackground: {
    en: "Executing in background",
    zh: "后台执行中"
  },
  confirmDeleteTask: {
    en: "Are you sure you want to delete this task?",
    zh: "确定要删除这个任务吗?"
  },
  deleteTask: {
    en: "Delete Task",
    zh: "删除任务"
  },
  yes: {
    en: "Yes",
    zh: "是"
  },
  no: {
    en: "No",
    zh: "否"
  },
  hideTaskSplitResult: {
    en: "Hide Task Split Result",
    zh: "隐藏任务拆解结果"
  },
  viewTaskSplitResult: {
    en: "View Task Split Result",
    zh: "查看任务拆解结果"
  },
  maximizePanel: {
    en: "Maximize Panel",
    zh: "最大化面板"
  },
  restorePanel: {
    en: "Restore Panel",
    zh: "恢复面板"
  },
  dueDate: {
    en: "Due: {{date}}",
    zh: "截止日期: {{date}}"
  },
  loading: {
    en: "Loading...",
    zh: "加载中..."
  },
  droppableError: {
    en: "Drag and drop error: {{message}}",
    zh: "拖拽操作错误: {{message}}"
  },
  failedToFetchTodos: {
    en: "Failed to fetch todos",
    zh: "获取任务列表失败"
  },
  failedToLoadTodos: {
    en: "Failed to load todos",
    zh: "加载任务列表失败"
  },
  failedToCreateTodo: {
    en: "Failed to create todo",
    zh: "创建任务失败"
  },
  failedToCreateNewTodo: {
    en: "Failed to create new todo",
    zh: "创建新任务失败"
  },
  failedToSaveTodo: {
    en: "Failed to save todo",
    zh: "保存任务失败"
  },
  failedToDeleteTodo: {
    en: "Failed to delete todo",
    zh: "删除任务失败"
  },
  failedToFetchTodo: {
    en: "Failed to fetch todo",
    zh: "获取任务失败"
  },
  failedToLoadTodo: {
    en: "Failed to load todo",
    zh: "加载任务失败"
  },
  taskSplittingInProgress: {
    en: "Task splitting in progress...",
    zh: "正在后台运行拆解任务..."
  },
  viewTaskStatus: {
    en: "View Task Status",
    zh: "查看任务状态"
  }
};
