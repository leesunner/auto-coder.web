import React, { useState } from "react";
import type { MessageProps } from "../MessageList";
import { getMessage } from "../../../lang";
import "./MessageStyles.css";

interface AgenticTodoWriteToolProps {
  message: MessageProps & { content: TodoTask };
}

type TodoTask =
  | {
      tool_name: string;
      action: "create";
      task_id: null;
      //content就是todolist的内容: "\n<task>创建俄罗斯方块游戏主组件 (TetrisGame.vue)</task>\n<task>XXXX</task>
      content: string;
      priority: "high";
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
    };

const AgenticTodoWriteTool: React.FC<AgenticTodoWriteToolProps> = ({
  message,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  let todoData: TodoData = { tasks: [] };
  let action = "";
  let success = false;

  try {
    const parsed = JSON.parse(message.content || "{}");
    action = parsed.action || "";
    success = parsed.success ?? true;

    // 解析todo数据
    if (parsed.todo_data) {
      todoData = parsed.todo_data;
    } else if (parsed.tasks) {
      todoData = { tasks: parsed.tasks };
    }
  } catch (e) {
    console.error("Failed to parse todo content:", e);
  }

  const getStatusColor = (status: string) => {
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

  const getPriorityColor = (priority: string) => {
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

  const getStatusText = (status: string) => {
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

  const getPriorityText = (priority: string) => {
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

  return (
    <div className="message-font">
      <div className="message-title flex items-center">
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        </span>

        <span className="message-title-text ml-1 text-purple-400 font-semibold">
          {getMessage("agenticTodoWriteToolTitle")}
        </span>

        {todoData.summary && (
          <span className="text-xs px-2 py-0.5 ml-2 rounded-full bg-purple-600/30 text-purple-400">
            {todoData.summary.total} 项任务
          </span>
        )}
      </div>

      {/* 摘要信息 */}
      {todoData.summary && !isCollapsed && (
        <div className="mt-2 flex gap-4 text-xs">
          <span className="text-gray-400">
            总计: <span className="text-white">{todoData.summary.total}</span>
          </span>
          <span className="text-gray-400">
            待处理:{" "}
            <span className="text-gray-300">{todoData.summary.pending}</span>
          </span>
          <span className="text-yellow-400">
            进行中:{" "}
            <span className="text-yellow-300">
              {todoData.summary.in_progress}
            </span>
          </span>
          <span className="text-green-400">
            已完成:{" "}
            <span className="text-green-300">{todoData.summary.completed}</span>
          </span>
        </div>
      )}

      {/* 任务列表 */}
      {!isCollapsed && todoData.tasks.length > 0 && (
        <div className="mt-3 space-y-2">
          {todoData.tasks.map((task, index) => (
            <div
              key={task.task_id || index}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 hover:bg-gray-800/70 transition-colors"
            >
              {/* 任务标题和状态 */}
              <div className="flex items-start justify-between gap-2 mb-2">
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
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {getPriorityText(task.priority)}
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
      {!isCollapsed && todoData.tasks.length === 0 && (
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 0 012 2"
            />
          </svg>
          <p className="text-sm">暂无待办任务</p>
        </div>
      )}
    </div>
  );
};

export default AgenticTodoWriteTool;
