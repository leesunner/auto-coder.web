

interface Message {
  en: string;
  zh: string;
}

export const todoEditModalMessages: { [key: string]: Message } = {
  // TodoEditModal 相关的多语言配置
  editTodoTitle: {
    en: "Edit Task",
    zh: "编辑任务"
  },
  splitTask: {
    en: "Split Task",
    zh: "拆解任务"
  },
  cancel: {
    en: "Cancel",
    zh: "取消"
  },
  save: {
    en: "Save",
    zh: "保存"
  },
  todoTitle: {
    en: "Task Title",
    zh: "任务标题"
  },
  todoTitlePlaceholder: {
    en: "Enter task title",
    zh: "输入任务标题"
  },
  todoDescription: {
    en: "Task Description",
    zh: "任务描述"
  },
  todoDescriptionPlaceholder: {
    en: "Enter detailed task description",
    zh: "输入详细的任务描述"
  },
  priority: {
    en: "Priority",
    zh: "优先级"
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
  dueDate: {
    en: "Due Date",
    zh: "截止日期"
  },
  tags: {
    en: "Tags",
    zh: "标签"
  },
  addTagPlaceholder: {
    en: "Enter tag name",
    zh: "输入标签名称"
  },
  addTag: {
    en: "Add",
    zh: "添加"
  },
  todoTitleRequired: {
    en: "Task title is required",
    zh: "任务标题是必填项"
  },
  todoDescriptionRequired: {
    en: "Task description is required for task splitting",
    zh: "任务拆解需要任务描述"
  },
  failedToSaveTodo: {
    en: "Failed to save task",
    zh: "保存任务失败"
  },
  taskSplitSuccess: {
    en: "Task split successfully, generated {{count}} subtasks",
    zh: "任务拆解成功，生成了 {{count}} 个子任务"
  },
  failedToSplitTask: {
    en: "Failed to split task",
    zh: "任务拆解失败"
  },
  taskSplittingInProgress: {
    en: "Another task is being split, please wait for completion",
    zh: "已有任务正在拆解中，请等待当前拆解完成"
  },
  taskSplitPromptTemplate: {
    en: `Please help me break down the following task requirements into detailed subtasks:
Title: {{title}}
Description: {{description}}
Priority: {{priority}}

Please follow these steps for breakdown:
1. Analyze the core objectives and key functional points of the requirements
2. Break down the large task into multiple small tasks, each should be independent enough and clearly measurable for completion
3. For each small task, specify the following:
   - Task Title: Concise and clear
   - Task Description: Detailed explanation of what needs to be completed
   - Technical References: Files, APIs, or technical documentation that might need to be referenced
   - Implementation Steps: Step-by-step listing of specific operations to complete the task
   - Acceptance Criteria: How to determine if the task is completed
   - Priority: Inherit original task priority or adjust appropriately
   - Estimated Workload: Expressed in hours or points
4. Special Note: The task executor can only create new files and modify source code files. Your tasks must be completable by the executor.
5. Return the result in JSON format as follows:

\`\`\`json
{
  "original_task": {
    "title": "Original task title",
    "description": "Original task description"
  },
  "analysis": "Analysis of overall requirements",
  "tasks": [
    {
      "title": "Subtask 1 title",
      "description": "Subtask 1 detailed description",
      "references": ["Files or documents that might need to be referenced"],
      "steps": ["Step 1", "Step 2"...],
      "acceptance_criteria": ["Acceptance criterion 1", "Acceptance criterion 2"...],
      "priority": "Priority",
      "estimate": "Estimated workload"
    },
    // More subtasks...
  ],
  "tasks_count": 3, // Total number of subtasks
  "dependencies": [ // Optional, specify dependencies between tasks
    {
      "task": "Subtask title",
      "depends_on": ["Dependent subtask titles"]
    }
  ]
}
\`\`\`

Special note: when you finally call the response_user function, you should pass JSON text data that conforms to the above format requirements.`,
    zh: `请帮我将以下任务需求进行细化拆解:
标题: {{title}}
描述: {{description}}
优先级: {{priority}}

请按照以下步骤进行拆解:
1. 分析需求的核心目标和关键功能点
2. 将大任务拆分成多个小任务，每个小任务应该足够独立且能够明确衡量完成情况
3. 为每个小任务标明以下内容:
   - 任务标题: 简洁清晰
   - 任务描述: 详细说明需要完成的内容
   - 技术参考: 可能需要参考的文件、API或技术文档
   - 实现步骤: 逐步列出完成该任务的具体操作
   - 验收标准: 如何判断该任务已完成
   - 优先级: 继承原任务优先级或适当调整
   - 预估工作量: 用小时或点数表示
4. 特别注意： 任务的执行者只会新建，修改源码文件两个能力，你的任务必须要能够让执行者能够完成。
5. 以JSON格式文本返回结果，格式如下:

\`\`\`json
{
  "original_task": {
    "title": "原任务标题",
    "description": "原任务描述"
  },
  "analysis": "对整体需求的分析",
  "tasks": [
    {
      "title": "子任务1标题",
      "description": "子任务1详细描述",
      "references": ["可能需要参考的文件或文档"],
      "steps": ["步骤1", "步骤2"...],
      "acceptance_criteria": ["验收标准1", "验收标准2"...],
      "priority": "优先级",
      "estimate": "预估工作量"
    },
    // 更多子任务...
  ],
  "tasks_count": 3, // 子任务总数
  "dependencies": [ // 可选，标明任务间依赖关系
    {
      "task": "子任务标题",
      "depends_on": ["依赖的子任务标题"]
    }
  ]
}
\`\`\`

特别注意，你最后调用 response_user 函数的时候，要给函数传递的是 json 文本数据，符合上面的格式要求。`
  },
  splittingTag: {
    en: "Splitting",
    zh: "正在拆解"
  },
  splitCompletedTag: {
    en: "Split Completed",
    zh: "已拆解"
  }
};

