


# 自定义 Hooks 文档

本目录包含了为 FileListSelector 组件抽离出来的可复用 hooks，以提高代码的可维护性和复用性。

## 可用的 Hooks

### useDropdownDirection

**用途**: 智能计算下拉框的显示方向（向上或向下）

**特性**:
- 自动检测容器周围的可用空间
- 根据视口高度和容器位置计算最佳方向
- 支持自定义下拉框高度和偏移量

**使用示例**:
```typescript
const calculateDirection = useDropdownDirection({
  containerRef,
  dropdownHeight: 320,
  offset: 10,
});

// 在需要时调用
const direction = calculateDirection(); // 返回 'up' 或 'down'
```

### useWindowResize

**用途**: 监听窗口大小变化事件，支持防抖处理

**特性**:
- 内置防抖机制，避免频繁触发
- 同时监听 resize 和 scroll 事件
- 自动清理事件监听器

**使用示例**:
```typescript
useWindowResize({
  debounceMs: 100,
  onResize: () => {
    // 处理窗口大小变化
    console.log('窗口大小已改变');
  },
});
```

### useClickOutside

**用途**: 检测点击元素外部区域的事件

**特性**:
- 支持条件启用/禁用监听
- 自动处理事件绑定和清理
- TypeScript 泛型支持

**使用示例**:
```typescript
const ref = useRef<HTMLDivElement>(null);

useClickOutside(
  ref,
  (event) => {
    console.log('点击了外部区域');
  },
  isEnabled // 可选的启用条件
);
```

### useKeyboardNavigation

**用途**: 处理列表项的键盘导航（上下箭头、回车、ESC）

**特性**:
- 支持循环导航
- 处理边界情况
- 可自定义回调函数

**使用示例**:
```typescript
const handleKeyDown = useKeyboardNavigation({
  totalItems: items.length,
  isOpen: isDropdownOpen,
  currentIndex: focusedIndex,
  onIndexChange: setFocusedIndex,
  onSelect: (index) => selectItem(index),
  onClose: () => closeDropdown(),
});

// 在组件中使用
<div onKeyDown={handleKeyDown}>...</div>
```

## 设计原则

1. **单一职责**: 每个 hook 只负责一个特定功能
2. **可复用性**: 设计为通用解决方案，不绑定特定组件
3. **类型安全**: 完整的 TypeScript 类型定义
4. **性能优化**: 使用 useCallback 和 useMemo 避免不必要的重渲染
5. **清理机制**: 正确处理事件监听器和定时器的清理

## 文件结构

```
hooks/
├── index.ts                          # 统一导出
├── useDropdownDirection.ts           # 下拉框方向计算
├── useWindowResize.ts                # 窗口大小变化监听
├── useClickOutside.ts                # 外部点击检测
├── useKeyboardNavigation.ts          # 键盘导航处理
├── __tests__/                        # 测试文件
│   └── useDropdownDirection.test.ts
└── README.md                         # 本文档
```

## 在 FileListSelector 中的应用

这些 hooks 的抽离使得 FileListSelector 组件的代码更加清晰和易于维护：

1. **calculateDropdownDirection** 方法现在有了完整的实现
2. 窗口变化监听逻辑被抽离到独立的 hook
3. 点击外部检测逻辑被抽离并可复用
4. 键盘导航逻辑被标准化并可复用

这种设计提高了代码的可测试性、可维护性和复用性。



