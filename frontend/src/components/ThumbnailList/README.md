
# ThumbnailList 缩略图列表组件

一个功能完整的缩略图列表组件，支持图片预览、删除和键盘导航功能。

## 功能特性

- ✅ 45x45 像素的缩略图显示
- ✅ 点击缩略图放大预览
- ✅ 预览模式下支持键盘和鼠标导航
- ✅ 每个缩略图的删除功能
- ✅ 响应式设计，支持移动端
- ✅ 暗色主题适配
- ✅ TypeScript 支持

## 基本用法

```tsx
import React, { useState } from 'react';
import ThumbnailList, { ThumbnailItem } from '../components/ThumbnailList';

const MyComponent = () => {
  const [items, setItems] = useState<ThumbnailItem[]>([]);

  const handleDelete = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <ThumbnailList 
      items={items} 
      onDelete={handleDelete} 
    />
  );
};
```

## 数据类型

```tsx
interface ThumbnailItem {
  file: File;        // 文件对象
  path: string;      // 文件路径或名称
}

interface ThumbnailListProps {
  items: ThumbnailItem[];                    // 缩略图数据数组
  onDelete: (index: number) => void;         // 删除回调函数
}
```

## API 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| items | ThumbnailItem[] | 是 | 缩略图数据数组 |
| onDelete | (index: number) => void | 是 | 删除某个缩略图的回调函数 |

## 预览功能

### 键盘快捷键
- `ESC`: 关闭预览
- `←` / `→`: 切换上一张/下一张图片

### 鼠标操作
- 点击缩略图: 打开预览
- 点击背景或关闭按钮: 关闭预览
- 点击导航按钮: 切换图片

## 删除功能

- 鼠标悬停在缩略图上会显示删除按钮（×）
- 点击删除按钮会触发 `onDelete` 回调
- 删除操作不会影响预览状态

## 样式定制

组件使用 CSS 变量适配 VS Code 暗色主题：

```css
/* 主要颜色变量 */
--vscode-editor-background: #1e1e1e
--vscode-editorWidget-border: #454545
--vscode-descriptionForeground: #cccccc
```

如需自定义样式，可以覆盖 `ThumbnailList.css` 中的类名：

- `.thumbnail-list`: 容器样式
- `.thumbnail-item`: 缩略图项样式
- `.thumbnail-delete-btn`: 删除按钮样式
- `.thumbnail-preview-modal`: 预览模态框样式

## 完整示例

查看 `ThumbnailListExample.tsx` 文件获取完整的使用示例，包括：

- 文件选择功能
- 批量删除
- 状态管理
- 错误处理

## 注意事项

1. 确保传入的 `file` 对象是有效的图片文件
2. 组件会自动创建和管理图片的 Object URL
3. 删除操作需要在父组件中处理状态更新
4. 组件针对移动端进行了优化，在小屏幕上导航按钮会调整位置

## 浏览器兼容性

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

支持现代浏览器的 Object URL 和 CSS Grid 特性。

