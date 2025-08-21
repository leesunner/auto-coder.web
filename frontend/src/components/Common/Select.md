
# Select 通用下拉选择组件

基于 CustomModelSelector 组件开发的通用下拉选择组件，支持单选、多选、搜索等功能，并具备智能边界检测。

## 特性

- ✅ **单选和多选模式**：支持单个选项选择和多个选项选择
- ✅ **智能边界检测**：自动检测上下边界，智能调整下拉方向
- ✅ **搜索功能**：支持选项搜索和自定义过滤逻辑
- ✅ **多种尺寸**：支持 small、middle、large 三种尺寸
- ✅ **状态管理**：支持受控和非受控模式
- ✅ **自定义样式**：支持自定义样式和类名
- ✅ **无障碍访问**：支持键盘导航和屏幕阅读器
- ✅ **响应式设计**：适配移动端和桌面端

## 基础用法

### 单选模式

```tsx
import { Select, SelectOption } from '@/components/Common';

const options: SelectOption[] = [
  { value: 'option1', label: '选项一' },
  { value: 'option2', label: '选项二' },
  { value: 'option3', label: '选项三' },
];

function SingleSelect() {
  const [value, setValue] = useState<string>('');

  return (
    <Select
      options={options}
      value={value}
      onChange={(val) => setValue(val as string)}
      placeholder="请选择"
    />
  );
}
```

### 多选模式

```tsx
function MultipleSelect() {
  const [values, setValues] = useState<string[]>([]);

  return (
    <Select
      options={options}
      value={values}
      onChange={(vals) => setValues(vals as string[])}
      multiple
      placeholder="请选择多个选项"
      maxTagCount={3}
    />
  );
}
```

### 搜索功能

```tsx
function SearchableSelect() {
  return (
    <Select
      options={options}
      showSearch
      placeholder="搜索并选择"
      filterOption={(input, option) =>
        option.label.toLowerCase().includes(input.toLowerCase())
      }
    />
  );
}
```

## API 参数

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| options | 选项数据 | `SelectOption[]` | `[]` |
| value | 当前选中值（受控） | `string \| string[]` | - |
| defaultValue | 默认选中值（非受控） | `string \| string[]` | - |
| placeholder | 占位符文本 | `string` | `"请选择"` |
| multiple | 是否多选 | `boolean` | `false` |
| searchable | 是否可搜索（已废弃，使用 showSearch） | `boolean` | `true` |
| showSearch | 是否显示搜索框 | `boolean` | `true` |
| disabled | 是否禁用 | `boolean` | `false` |
| clearable | 是否可清空（已废弃，使用 allowClear） | `boolean` | `true` |
| allowClear | 是否可清空 | `boolean` | `true` |
| maxTagCount | 多选时最多显示的标签数量 | `number` | `3` |
| loading | 是否加载中 | `boolean` | `false` |
| size | 组件尺寸 | `"small" \| "middle" \| "large"` | `"middle"` |
| maxHeight | 下拉菜单最大高度 | `number` | `200` |
| className | 自定义类名 | `string` | - |
| style | 自定义样式 | `React.CSSProperties` | - |
| dropdownClassName | 下拉菜单自定义类名 | `string` | - |
| dropdownStyle | 下拉菜单自定义样式 | `React.CSSProperties` | - |
| filterOption | 自定义过滤逻辑 | `(input: string, option: SelectOption) => boolean` | - |
| notFoundContent | 无匹配内容时显示的内容 | `React.ReactNode` | `"无匹配结果"` |
| onChange | 选中值变化时的回调 | `(value: string \| string[]) => void` | - |
| onSearch | 搜索时的回调 | `(searchValue: string) => void` | - |

## SelectOption 类型

```tsx
interface SelectOption {
  value: string;        // 选项值
  label: string;        // 选项显示文本
  disabled?: boolean;   // 是否禁用
}
```

## 智能边界检测

组件会自动检测下拉框的展开方向：

1. **优先向下展开**：如果下方空间足够，优先向下展开
2. **自动向上展开**：如果下方空间不足，但上方空间更大，则向上展开
3. **默认向下展开**：其他情况默认向下展开

这确保了下拉框在各种布局场景下都能正确显示。

## 样式定制

### 自定义主题

组件使用 CSS 变量，可以通过覆盖样式来自定义主题：

```css
.common-select {
  --select-bg: #1e293b;
  --select-border: #374151;
  --select-hover-border: #4b5563;
  --select-focus-border: #3b82f6;
  --select-text: #e5e7eb;
  --select-placeholder: #9ca3af;
}
```

### 自定义尺寸

```tsx
<Select
  size="large"
  style={{ minHeight: '48px' }}
  options={options}
/>
```

## 最佳实践

1. **选项数量较多时**：启用搜索功能，提升用户体验
2. **多选模式**：合理设置 `maxTagCount`，避免界面过于拥挤
3. **边界检测**：在固定高度容器中使用时，确保有足够空间展开
4. **性能优化**：大量选项时考虑虚拟滚动（未来版本支持）
5. **无障碍访问**：为选项提供有意义的标签文本

## 与 CustomModelSelector 的区别

| 特性 | CustomModelSelector | Select |
|------|-------------------|--------|
| 用途 | 专门用于模型选择 | 通用下拉选择 |
| 数据源 | 内置 API 调用 | 外部传入 options |
| 配置持久化 | 支持配置保存 | 不涉及持久化 |
| 事件总线 | 集成 EventBus | 纯组件，不依赖外部服务 |
| 复用性 | 特定场景 | 高度可复用 |

## 示例

查看 `SelectExample.tsx` 文件获取更多使用示例。

