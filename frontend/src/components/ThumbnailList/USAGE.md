

# ThumbnailList 组件使用指南

## 快速开始

### 1. 导入组件

```tsx
import ThumbnailList, { ThumbnailItem } from '../components/ThumbnailList';
```

### 2. 准备数据

```tsx
const [items, setItems] = useState<ThumbnailItem[]>([
  {
    file: fileObject,     // File 对象
    path: "image1.jpg"    // 文件路径或名称
  }
]);
```

### 3. 使用组件

```tsx
<ThumbnailList 
  items={items} 
  onDelete={(index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }} 
/>
```

## 功能详解

### 缩略图显示
- 固定尺寸：45x45 像素
- 自动裁剪适应容器
- 支持常见图片格式（JPEG、PNG、GIF、WebP等）

### 预览功能
- **点击缩略图**：打开全屏预览
- **键盘导航**：
  - `ESC` - 关闭预览
  - `←` - 上一张图片
  - `→` - 下一张图片
- **鼠标操作**：
  - 点击导航按钮切换图片
  - 点击背景或关闭按钮退出预览

### 删除功能
- 悬停显示删除按钮（×）
- 点击删除按钮触发 `onDelete` 回调
- 支持事件冒泡阻止

## 高级用法

### 批量操作示例

```tsx
const ThumbnailManager = () => {
  const [items, setItems] = useState<ThumbnailItem[]>([]);
  
  // 添加图片
  const addImages = (files: FileList) => {
    const newItems = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        file,
        path: file.name
      }));
    setItems(prev => [...prev, ...newItems]);
  };
  
  // 删除单个图片
  const deleteImage = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };
  
  // 清空所有图片
  const clearAll = () => {
    setItems([]);
  };
  
  return (
    <div>
      <input 
        type="file" 
        multiple 
        accept="image/*"
        onChange={(e) => e.target.files && addImages(e.target.files)}
      />
      <button onClick={clearAll}>清空所有</button>
      <ThumbnailList items={items} onDelete={deleteImage} />
    </div>
  );
};
```

### 自定义样式

```css
/* 自定义缩略图容器 */
.thumbnail-list {
  background-color: #2d2d2d;
  border-radius: 8px;
  padding: 12px;
}

/* 自定义删除按钮 */
.thumbnail-delete-btn {
  background-color: #ff4444;
  width: 20px;
  height: 20px;
}

/* 自定义预览背景 */
.thumbnail-preview-modal {
  background-color: rgba(0, 0, 0, 0.95);
}
```

## 注意事项

### 性能优化
1. **大量图片**：建议使用虚拟滚动
2. **内存管理**：组件会自动管理 Object URL 的创建，但不会自动清理
3. **文件大小**：建议对大文件进行压缩处理

### 浏览器兼容性
- 需要支持 `URL.createObjectURL()` API
- 需要支持 CSS Grid 和 Flexbox
- 推荐使用现代浏览器（Chrome 60+, Firefox 60+, Safari 12+）

### 错误处理

```tsx
const handleDelete = (index: number) => {
  try {
    setItems(prev => {
      if (index < 0 || index >= prev.length) {
        console.warn('Invalid index for deletion:', index);
        return prev;
      }
      return prev.filter((_, i) => i !== index);
    });
  } catch (error) {
    console.error('Error deleting thumbnail:', error);
  }
};
```

## 扩展功能

### 添加拖拽排序

```tsx
// 安装 react-beautiful-dnd
// npm install react-beautiful-dnd

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const DraggableThumbnailList = () => {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);
    
    setItems(newItems);
  };
  
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="thumbnails">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {/* 在这里渲染可拖拽的缩略图 */}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
```

### 添加图片编辑功能

```tsx
const EditableThumbnailList = () => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const handleEdit = (index: number) => {
    setEditingIndex(index);
    // 打开图片编辑器
  };
  
  // 在缩略图上添加编辑按钮
  // 集成图片编辑库如 Fabric.js 或 Konva.js
};
```

## 故障排除

### 常见问题

1. **图片不显示**
   - 检查文件类型是否为图片
   - 确认 File 对象是否有效
   - 查看浏览器控制台错误信息

2. **预览功能异常**
   - 确认组件层级没有被其他元素遮挡
   - 检查 z-index 设置
   - 验证键盘事件监听器是否正常

3. **删除功能不工作**
   - 确认 onDelete 回调函数已正确传入
   - 检查父组件状态更新逻辑
   - 验证事件冒泡是否被正确阻止

### 调试技巧

```tsx
// 添加调试日志
const ThumbnailList = ({ items, onDelete }) => {
  console.log('ThumbnailList rendered with items:', items.length);
  
  const handleDelete = (index: number) => {
    console.log('Deleting item at index:', index);
    onDelete(index);
  };
  
  // ... 其他代码
};
```


