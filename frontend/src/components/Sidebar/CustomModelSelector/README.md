
# 自定义模型选择器 (CustomModelSelector)

这是一个完全自定义实现的模型选择器组件，不依赖于 Antd 的 Select 组件，提供了更灵活的样式控制和交互体验。

## 功能特性

- ✅ **自定义下拉选择**: 完全自定义实现，不使用 Antd Select
- ✅ **多选支持**: 支持选择多个模型
- ✅ **搜索过滤**: 实时搜索过滤模型列表
- ✅ **标签显示**: 选中的模型以标签形式显示
- ✅ **API Key 验证**: 可选择是否需要验证 API Key
- ✅ **事件总线集成**: 与项目事件系统完美集成
- ✅ **响应式设计**: 适配不同屏幕尺寸
- ✅ **深色主题**: 完美适配项目的深色主题
- ✅ **加载状态**: 显示加载和更新状态
- ✅ **键盘支持**: 支持键盘操作

## 组件参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `needApiKey` | `boolean` | `false` | 是否只显示配置了 API Key 的模型 |
| `configKey` | `string` | `"custom_model"` | 配置键名，用于保存选择的模型 |
| `title` | `string` | `"自定义模型"` | 组件标题 |
| `placeholder` | `string` | `"请选择模型"` | 占位符文本 |
| `icon` | `React.ReactNode` | `<CodeOutlined />` | 标题前的图标 |
| `tooltip` | `string` | `"选择自定义模型"` | 鼠标悬停提示 |
| `eventKey` | `string` | `"CUSTOM_MODEL_UPDATED"` | 事件总线事件键名 |

## 使用示例

### 基础用法

```tsx
import CustomModelSelector from "./components/Sidebar/CustomModelSelector";
import { RobotOutlined } from "@ant-design/icons";

// 基础使用
<CustomModelSelector />

// 自定义配置
<CustomModelSelector
  needApiKey={true}
  configKey="my_model"
  title="我的模型"
  placeholder="选择一个模型"
  icon={<RobotOutlined />}
  tooltip="选择用于特定任务的模型"
  eventKey="MY_MODEL_UPDATED"
/>
```

### 预设配置示例

```tsx
// 代码生成模型选择器
<CustomModelSelector
  needApiKey={false}
  configKey="code_model"
  title="代码模型"
  placeholder="选择代码生成模型"
  icon={<RobotOutlined />}
  tooltip="选择用于代码生成的模型"
  eventKey="CODE_MODEL_UPDATED"
/>

// 对话模型选择器（需要 API Key）
<CustomModelSelector
  needApiKey={true}
  configKey="chat_model"
  title="聊天模型"
  placeholder="选择对话模型"
  icon={<BulbOutlined />}
  tooltip="选择用于对话的模型，需要配置API Key"
  eventKey="CHAT_MODEL_UPDATED"
/>
```

## 文件结构

```
CustomModelSelector/
├── index.tsx          # 主组件
├── index.ts           # 导出文件
├── styles.css         # 样式文件
├── types.ts           # 类型定义
├── utils.ts           # 工具函数
├── example.tsx        # 使用示例
├── test.tsx           # 测试组件
├── README.md          # 说明文档
└── usage.md           # 详细使用指南
```

## 快速开始

1. **导入组件**:
```tsx
import CustomModelSelector from './components/Sidebar/CustomModelSelector';
```

2. **基础使用**:
```tsx
<CustomModelSelector />
```

3. **查看示例**: 运行 `example.tsx` 查看各种使用场景

4. **运行测试**: 使用 `test.tsx` 进行功能测试

## 与原 CodeModelSelector 的区别

| 特性 | CodeModelSelector | CustomModelSelector |
|------|-------------------|---------------------|
| 依赖 | Antd Select | 完全自定义 |
| 样式控制 | 有限 | 完全可控 |
| 交互体验 | 标准 | 可定制 |
| 配置灵活性 | 固定 | 高度可配置 |
| 主题适配 | 依赖 Antd | 原生适配 |

详细使用说明请参考 `usage.md` 文件。
