import React, { useState } from "react";
import type { MessageProps } from "../MessageList";
import { getMessage } from "../../../lang";
import "./MessageStyles.css";

interface AgenticTodoWriteToolProps {
  message: MessageProps;
}

type TodoTask =
  | {
      tool_name: string;
      action: "create";
      task_id: null;
      //content就是todolist的内容: "\n<task>创建俄罗斯方块游戏主组件 (TetrisGame.vue)</task>\n<task>XXXX</task>
      content: string;
      priority: "high" | "medium" | "low";
      status: null;
      notes: null;
    }
  | {
      tool_name: string;
      action: "mark_progress";
      task_id: string;
      content: null;
      priority: null;
      status: null;
      notes: null;
    }
  | {
      tool_name: string;
      action: "mark_completed";
      task_id: string;
      content: null;
      priority: null;
      status: null;
      notes: string;
    }
  | {
      tool_name: string;
      action: "add_task";
      task_id: null;
      content: string;
      priority: "high" | "medium" | "low";
      status: null;
      notes: string | null;
    }
  | {
      tool_name: string;
      action: "update";
      task_id: string;
      content: string | null;
      priority: "high" | "medium" | "low" | null;
      status: "pending" | "in_progress" | "completed" | null;
      notes: string | null;
    };

interface ParsedTask {
  id: string;
  content: string;
  status: "pending" | "in_progress" | "completed";
  priority: "high" | "medium" | "low";
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// 解析content字段中的<task>标签
function parseTasksFromContent(
  content: string,
  priority: "high" | "medium" | "low"
): ParsedTask[] {
  const tasks: ParsedTask[] = [];

  // 匹配<task>内容</task>模式，同时处理HTML实体编码
  const taskRegex = /<task>(.*?)<\/task>/g;
  let match;
  let index = 0;

  while ((match = taskRegex.exec(content)) !== null) {
    const taskContent = match[1].trim();
    if (taskContent) {
      tasks.push({
        id: `task_${index++}`,
        content: taskContent,
        status: "pending",
        priority: priority,
      });
    }
  }

  // 如果没有找到<task>标签，尝试按行分割
  if (tasks.length === 0 && content.trim()) {
    const lines = content.split("\n").filter((line) => line.trim());
    lines.forEach((line, index) => {
      const cleanLine = line.trim();
      if (
        cleanLine &&
        !cleanLine.startsWith("<") &&
        !cleanLine.startsWith("<")
      ) {
        tasks.push({
          id: `task_${index}`,
          content: cleanLine,
          status: "pending",
          priority: priority,
        });
      }
    });
  }

  return tasks;
}

const AgenticTodoWriteTool: React.FC<AgenticTodoWriteToolProps> = ({
  message,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  let todoData: TodoTask | null = null;
  let action = "";
  let success = false;
  let parsedTasks: ParsedTask[] = [];

  try {
    const parsed = JSON.parse(message.content || "{}");
    todoData = parsed as TodoTask;
    action = todoData.action || "";
    success = parsed.success ?? true;

    // 根据不同的action解析任务内容
    if (todoData.action === "create" && todoData.content) {
      // 解析content中的<task>标签
      parsedTasks = parseTasksFromContent(todoData.content, todoData.priority);
    } else if (todoData.action === "add_task" && todoData.content) {
      // 单个新任务
      parsedTasks = [
        {
          id: `task_${Date.now()}`,
          content: todoData.content,
          status: "pending",
          priority: todoData.priority,
          notes: todoData.notes || undefined,
        },
      ];
    } else if (todoData.action === "mark_progress" && todoData.task_id) {
      // 标记进行中的任务
      parsedTasks = [
        {
          id: todoData.task_id,
          content: `任务 ${todoData.task_id}`,
          status: "in_progress",
          priority: "medium",
        },
      ];
    } else if (todoData.action === "mark_completed" && todoData.task_id) {
      // 标记完成的任务
      parsedTasks = [
        {
          id: todoData.task_id,
          content: `任务 ${todoData.task_id}`,
          status: "completed",
          priority: "medium",
          notes: todoData.notes || undefined,
        },
      ];
    } else if (todoData.action === "update" && todoData.task_id) {
      // 更新任务
      parsedTasks = [
        {
          id: todoData.task_id,
          content: todoData.content || `任务 ${todoData.task_id}`,
          status: todoData.status || "pending",
          priority: todoData.priority || "medium",
          notes: todoData.notes || undefined,
        },
      ];
    }
  } catch (e) {
    console.error("Failed to parse todo content:", e);
  }

  const getStatusColor = (status: "pending" | "in_progress" | "completed") => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-600/20";
      case "in_progress":
        return "text-yellow-400 bg-yellow-600/20";
      case "pending":
      default:
        return "text-gray-400 bg-gray-600/20";
    }
  };

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "text-red-400 bg-red-600/20";
      case "medium":
        return "text-yellow-400 bg-yellow-600/20";
      case "low":
      default:
        return "text-blue-400 bg-blue-600/20";
    }
  };

  const getStatusText = (status: "pending" | "in_progress" | "completed") => {
    switch (status) {
      case "completed":
        return getMessage("todoTaskCompleted");
      case "in_progress":
        return getMessage("todoTaskInProgress");
      case "pending":
      default:
        return getMessage("todoTaskPending");
    }
  };

  const getPriorityText = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return getMessage("todoTaskHigh");
      case "medium":
        return getMessage("todoTaskMedium");
      case "low":
      default:
        return getMessage("todoTaskLow");
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case "create":
        return "创建了待办列表";
      case "add_task":
        return "添加了新任务";
      case "mark_progress":
        return "任务为进行中";
      case "mark_completed":
        return "任务为已完成";
      case "update":
        return "更新了任务";
      default:
        return "操作了待办列表";
    }
  };

  // 计算任务统计
  const taskStats = {
    total: parsedTasks.length,
    pending: parsedTasks.filter((task) => task.status === "pending").length,
    in_progress: parsedTasks.filter((task) => task.status === "in_progress")
      .length,
    completed: parsedTasks.filter((task) => task.status === "completed").length,
  };

  return (
    <div className="message-font">
      <div className="message-title flex items-center">
        <div className="message-title flex items-center flex-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="message-toggle-button text-gray-400"
          >
            {isCollapsed ? (
              <svg
                className="message-toggle-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="message-toggle-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          <span className="message-title-icon">
            <svg
              className="w-4 h-4 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </span>

          <span className="message-title-text ml-1 text-purple-400 font-semibold">
            {getMessage("agenticTodoWriteToolTitle")} - {getActionText(action)}
          </span>
        </div>
        {todoData?.priority && (
          <span
            className={`flex-shrink-0 text-xs px-2 py-1 rounded-full ${getPriorityColor(
              todoData.priority
            )}`}
          >
            {getPriorityText(todoData.priority)}
          </span>
        )}
      </div>

      {/* 摘要信息 */}
      {taskStats.total > 0 && !isCollapsed && (
        <div className="mt-2 flex gap-4 text-xs">
          <span className="text-gray-400">
            总计: <span className="text-white">{taskStats.total}</span>
          </span>
          <span className="text-gray-400">
            待处理: <span className="text-gray-300">{taskStats.pending}</span>
          </span>
          <span className="text-yellow-400">
            进行中:{" "}
            <span className="text-yellow-300">{taskStats.in_progress}</span>
          </span>
          <span className="text-green-400">
            已完成:{" "}
            <span className="text-green-300">{taskStats.completed}</span>
          </span>
        </div>
      )}

      {/* 任务列表 */}
      {!isCollapsed && parsedTasks.length > 0 && (
        <div className="mt-3 space-y-2">
          {parsedTasks.map((task, index) => (
            <div
              key={task.id || index}
              className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-1 hover:bg-gray-800/70 transition-colors"
            >
              {/* 任务标题和状态 */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-gray-200 text-sm font-medium leading-relaxed">
                    {task.content}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {getStatusText(task.status)}
                  </span>
                </div>
              </div>

              {/* 备注 */}
              {task.notes && (
                <div className="mb-2">
                  <span className="text-xs text-gray-400">
                    {getMessage("todoTaskNotes")}:
                  </span>
                  <p className="text-xs text-gray-300 mt-1 pl-2 border-l-2 border-gray-600">
                    {task.notes}
                  </p>
                </div>
              )}

              {/* 时间信息 */}
              {(task.created_at || task.updated_at) && (
                <div className="flex gap-4 text-xs text-gray-500">
                  {task.created_at && (
                    <span>
                      {getMessage("todoTaskCreatedAt")}:{" "}
                      {formatDateTime(task.created_at)}
                    </span>
                  )}
                  {task.updated_at && task.updated_at !== task.created_at && (
                    <span>
                      {getMessage("todoTaskUpdatedAt")}:{" "}
                      {formatDateTime(task.updated_at)}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 空状态 */}
      {!isCollapsed && parsedTasks.length === 0 && (
        <div className="mt-3 text-center py-6 text-gray-500">
          <svg
            className="w-8 h-8 mx-auto mb-2 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 0 012 2"
            />
          </svg>
          <p className="text-sm">
            {action === "create"
              ? "创建待办列表"
              : action === "mark_progress"
              ? "待办任务进行中"
              : action === "mark_completed"
              ? "待办任务已完成"
              : "待办操作"}
          </p>
        </div>
      )}
    </div>
  );
};

export default AgenticTodoWriteTool;
