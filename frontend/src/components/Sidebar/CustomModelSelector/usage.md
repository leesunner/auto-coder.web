

# CustomModelSelector 使用指南

## 快速开始

### 1. 基础导入

```tsx
import CustomModelSelector from './components/Sidebar/CustomModelSelector';
// 或者
import { CustomModelSelector } from './components/Sidebar/CustomModelSelector';
```

### 2. 基础使用

```tsx
function MyComponent() {
  return (
    <CustomModelSelector />
  );
}
```

### 3. 自定义配置

```tsx
import { RobotOutlined } from '@ant-design/icons';

function MyComponent() {
  return (
    <CustomModelSelector
      needApiKey={true}
      configKey="my_custom_model"
      title="我的模型"
      placeholder="请选择模型"
      icon={<RobotOutlined />}
      tooltip="选择用于特定任务的模型"
      eventKey="MY_MODEL_UPDATED"
      maxCount={3}
      onChange={(models) => console.log('选择的模型:', models)}
      onSelect={(model) => console.log('选择了模型:', model)}
      onDeselect={(model) => console.log('取消选择模型:', model)}
    />
  );
}
```

## 预设配置使用

### 代码模型选择器

```tsx
import { presetConfigs } from './components/Sidebar/CustomModelSelector';

function CodeModelSelector() {
  const config = presetConfigs.code;
  
  return (
    <CustomModelSelector
      {...config}
      onChange={(models) => console.log('代码模型:', models)}
    />
  );
}
```

### 聊天模型选择器

```tsx
function ChatModelSelector() {
  return (
    <CustomModelSelector
      needApiKey={true}
      configKey="chat_model"
      title="聊天模型"
      placeholder="选择对话模型"
      icon={<MessageOutlined />}
      tooltip="选择用于对话的模型，需要配置API Key"
      eventKey="CHAT_MODEL_UPDATED"
    />
  );
}
```

## 高级用法

### 1. 自定义过滤函数

```tsx
function AdvancedSelector() {
  const customFilter = (input: string, model: Model) => {
    const searchTerm = input.toLowerCase();
    return (
      model.name.toLowerCase().includes(searchTerm) ||
      model.model_type.toLowerCase().includes(searchTerm) ||
      model.model_name?.toLowerCase().includes(searchTerm)
    );
  };

  return (
    <CustomModelSelector
      filterOption={customFilter}
      onSearch={(value) => console.log('搜索:', value)}
    />
  );
}
```

### 2. 事件监听

```tsx
function EventHandlingSelector() {
  const handleChange = (models: string[]) => {
    console.log('模型选择变更:', models);
    // 可以在这里执行其他逻辑
  };

  const handleDropdownChange = (open: boolean) => {
    console.log('下拉框状态:', open ? '打开' : '关闭');
  };

  return (
    <CustomModelSelector
      onChange={handleChange}
      onDropdownVisibleChange={handleDropdownChange}
      onSelect={(model) => console.log('选择:', model)}
      onDeselect={(model) => console.log('取消选择:', model)}
    />
  );
}
```

### 3. 样式定制

```tsx
// 在组件中使用自定义样式类
function StyledSelector() {
  return (
    <CustomModelSelector
      className="my-custom-selector"
      // 其他 props...
    />
  );
}
```

```css
/* 在你的 CSS 文件中 */
.my-custom-selector .custom-selector {
  border-radius: 8px;
  border-color: #ff6b6b;
}

.my-custom-selector .dropdown-panel {
  border-color: #ff6b6b;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.15);
}
```

### 4. 限制选择数量

```tsx
function LimitedSelector() {
  return (
    <CustomModelSelector
      maxCount={2}
      onChange={(models) => {
        if (models.length > 2) {
          console.warn('最多只能选择2个模型');
        }
      }}
    />
  );
}
```

## 工具函数使用

### 1. 模型验证

```tsx
import { validateModelApiKey } from './components/Sidebar/CustomModelSelector';

function validateSelection(models: Model[], selected: string[]) {
  const isValid = validateModelApiKey(models, selected);
  if (!isValid) {
    console.warn('某些选择的模型没有配置 API Key');
  }
  return isValid;
}
```

### 2. 模型过滤

```tsx
import { filterModels } from './components/Sidebar/CustomModelSelector';

function searchModels(models: Model[], searchTerm: string) {
  return filterModels(models, searchTerm, false);
}
```

### 3. 模型排序

```tsx
import { sortModels } from './components/Sidebar/CustomModelSelector';

function sortByApiKey(models: Model[]) {
  return sortModels(models, 'apiKey');
}
```

## 与事件总线集成

### 1. 监听模型更新事件

```tsx
import eventBus, { EVENTS } from '../../services/eventBus';

useEffect(() => {
  const handleModelUpdate = (models: string[]) => {
    console.log('模型配置已更新:', models);
    // 处理模型更新逻辑
  };

  const unsubscribe = eventBus.subscribe(
    EVENTS.CONFIG.CODE_MODEL_UPDATED,
    handleModelUpdate
  );

  return () => unsubscribe();
}, []);
```

### 2. 手动发布事件

```tsx
import eventBus, { EVENTS } from '../../services/eventBus';

function updateModels(models: string[]) {
  // 手动发布模型更新事件
  eventBus.publish(EVENTS.CONFIG.CODE_MODEL_UPDATED, models);
}
```

## 最佳实践

### 1. 性能优化

```tsx
import { useMemo, useCallback } from 'react';

function OptimizedSelector() {
  const handleChange = useCallback((models: string[]) => {
    // 使用 useCallback 避免不必要的重渲染
    console.log('模型变更:', models);
  }, []);

  const filterOption = useMemo(() => {
    return (input: string, model: Model) => {
      return model.name.toLowerCase().includes(input.toLowerCase());
    };
  }, []);

  return (
    <CustomModelSelector
      onChange={handleChange}
      filterOption={filterOption}
    />
  );
}
```

### 2. 错误处理

```tsx
function SafeSelector() {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (models: string[]) => {
    try {
      // 验证选择
      if (models.length === 0) {
        setError('请至少选择一个模型');
        return;
      }
      
      setError(null);
      console.log('模型选择:', models);
    } catch (err) {
      setError('模型选择失败');
      console.error(err);
    }
  };

  return (
    <div>
      <CustomModelSelector onChange={handleChange} />
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
  );
}
```

### 3. 表单集成

```tsx
import { Form } from 'antd';

function FormIntegration() {
  const [form] = Form.useForm();

  return (
    <Form form={form}>
      <Form.Item 
        name="selectedModels" 
        label="选择模型"
        rules={[{ required: true, message: '请选择至少一个模型' }]}
      >
        <CustomModelSelector
          onChange={(models) => {
            form.setFieldsValue({ selectedModels: models });
          }}
        />
      </Form.Item>
    </Form>
  );
}
```

## 故障排除

### 常见问题

1. **组件不显示模型列表**
   - 检查 `/api/models` 接口是否正常
   - 确认网络连接正常

2. **选择的模型不会保存**
   - 检查 `/api/conf` 接口是否正常
   - 确认 `configKey` 是否唯一

3. **事件不触发**
   - 确认事件总线中定义了相应的事件键
   - 检查 `eventKey` 参数是否正确

4. **样式不正确**
   - 确认导入了 `styles.css` 文件
   - 检查是否有 CSS 冲突

### 调试技巧

```tsx
// 开启调试模式
function DebugSelector() {
  return (
    <CustomModelSelector
      onChange={(models) => {
        console.log('DEBUG: 模型变更', models);
      }}
      onSelect={(model) => {
        console.log('DEBUG: 选择模型', model);
      }}
      onDeselect={(model) => {
        console.log('DEBUG: 取消选择', model);
      }}
      onDropdownVisibleChange={(open) => {
        console.log('DEBUG: 下拉框状态', open);
      }}
      onSearch={(value) => {
        console.log('DEBUG: 搜索', value);
      }}
    />
  );
}
```

