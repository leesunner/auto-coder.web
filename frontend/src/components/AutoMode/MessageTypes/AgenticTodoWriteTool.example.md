
# AgenticTodoWriteTool 组件示例

这个组件用于显示 AitoCoder 的待办列表工具结果。

## 功能特性

- ✅ 显示待办任务列表
- ✅ 支持任务状态（待处理、进行中、已完成）
- ✅ 支持优先级（高、中、低）
- ✅ 显示任务备注
- ✅ 显示创建和更新时间
- ✅ 统计摘要信息
- ✅ 可折叠/展开视图
- ✅ 空状态处理
- ✅ 多语言支持（中文/英文）

## 数据格式示例

组件期望接收以下格式的JSON数据：

```json
{
  "action": "create",
  "success": true,
  "todo_data": {
    "tasks": [
      {
        "task_id": "task-1",
        "content": "实现用户认证功能",
        "status": "in_progress",
        "priority": "high",
        "notes": "需要添加JWT支持",
        "created_at": "2024-01-01T10:00:00Z",
        "updated_at": "2024-01-01T12:00:00Z"
      },
      {
        "task_id": "task-2",
        "content": "编写单元测试",
        "status": "pending",
        "priority": "medium",
        "created_at": "2024-01-01T10:30:00Z"
      },
      {
        "task_id": "task-3",
        "content": "更新文档",
        "status": "completed",
        "priority": "low",
        "created_at": "2024-01-01T09:00:00Z",
        "updated_at": "2024-01-01T11:00:00Z"
      }
    ],
    "summary": {
      "total": 3,
      "pending": 1,
      "in_progress": 1,
      "completed": 1
    }
  }
}
```

## 状态和优先级

### 任务状态
- `pending` - 待处理（灰色）
- `in_progress` - 进行中（黄色）
- `completed` - 已完成（绿色）

### 优先级
- `high` - 高（红色）
- `medium` - 中（黄色）
- `low` - 低（蓝色）

## 多语言支持

组件支持中英文双语，相关的多语言键值对已添加到 `frontend/src/lang/autoMode.ts`：

- `agenticTodoWriteToolTitle` - 组件标题
- `todoTaskPending` - 待处理状态
- `todoTaskInProgress` - 进行中状态
- `todoTaskCompleted` - 已完成状态
- `todoTaskHigh` - 高优先级
- `todoTaskMedium` - 中优先级
- `todoTaskLow` - 低优先级
- `todoTaskNotes` - 备注标签
- `todoTaskCreatedAt` - 创建时间标签
- `todoTaskUpdatedAt` - 更新时间标签

## 视觉设计

- 使用紫色主题色调，与其他工具组件区分
- 采用卡片式布局展示每个任务
- 状态和优先级使用不同颜色的徽章
- 支持折叠/展开功能
- 响应式设计，适配不同屏幕尺寸

## 集成说明

组件已集成到 `MessageList.tsx` 中，当消息类型为 `TodoWriteTool` 时会自动渲染此组件。

