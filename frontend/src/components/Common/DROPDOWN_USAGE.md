

# Dropdown 组件使用指南

## 概述

新创建的 `Dropdown` 组件是一个功能完整、高度可配置的下拉菜单组件，参考了 antd 的 Dropdown API 设计，专门用于替换 ExpertModePage 中的"更多下拉菜单"实现。

## 主要特性

✅ **多种触发方式**: 支持点击 (`click`)、悬停 (`hover`) 以及混合触发方式  
✅ **灵活的位置配置**: 支持 8 种不同的下拉位置  
✅ **完整的状态管理**: 支持受控和非受控模式  
✅ **丰富的交互功能**: 图标支持、禁用状态、点击外部关闭等  
✅ **优秀的用户体验**: 悬停延迟、平滑动画、边界处理  
✅ **类型安全**: 完整的 TypeScript 类型定义  
✅ **UI 一致性**: 与项目现有的 UI 风格保持一致

## 快速开始

### 1. 基本使用

```tsx
import { Dropdown } from '../Common';
import type { DropdownMenuItem } from '../Common';

const menuItems: DropdownMenuItem[] = [
  {
    key: 'option1',
    label: '选项1',
    onClick: () => console.log('选项1被点击')
  },
  {
    key: 'option2',
    label: '选项2', 
    disabled: true
  }
];

<Dropdown trigger={['click']} menu={{ items: menuItems }}>
  <button>点击我</button>
</Dropdown>
```

### 2. 在 ExpertModePage 中替换现有实现

```tsx
// 原有实现 (需要替换)
<div className="relative tools-dropdown-container">
  <button onClick={toggleToolsDropdown}>更多</button>
  {showToolsDropdown && (
    <div className="absolute z-[9999] mt-2 ...">
      {/* 手动管理的下拉菜单 */}
    </div>
  )}
</div>

// 新的实现 (推荐)
<Dropdown
  trigger={['click']}
  placement="bottomLeft"
  menu={{ items: moreMenuItems }}
>
  <button className="px-2 py-1 rounded text-xs font-medium ...">
    <DownIcon />
    <span>更多</span>
  </button>
</Dropdown>
```

## API 文档

### Dropdown Props

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| children | ReactNode | - | ✅ | 触发下拉菜单的元素 |
| menu | DropdownMenuProps | - | ✅ | 下拉菜单配置 |
| trigger | ('click' \| 'hover')[] | ['hover'] | ❌ | 触发方式数组 |
| placement | PlacementType | 'bottomLeft' | ❌ | 下拉菜单显示位置 |
| disabled | boolean | false | ❌ | 是否禁用整个下拉菜单 |
| open | boolean | undefined | ❌ | 受控模式下的显示状态 |
| onOpenChange | (open: boolean) => void | undefined | ❌ | 显示状态改变回调 |

### DropdownMenuItem

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| key | string | ✅ | 菜单项唯一标识符 |
| label | ReactNode | ✅ | 菜单项显示内容 |
| icon | ReactNode | ❌ | 菜单项左侧图标 |
| disabled | boolean | ❌ | 是否禁用此菜单项 |
| onClick | () => void | ❌ | 菜单项点击回调函数 |

### Placement 选项

| 值 | 说明 | 适用场景 |
|---|------|----------|
| `top` | 上方居中 | 底部空间不足时 |
| `topLeft` | 上方左对齐 | 底部空间不足，左对齐 |
| `topRight` | 上方右对齐 | 底部空间不足，右对齐 |
| `bottom` | 下方居中 | 默认情况，居中对齐 |
| `bottomLeft` | 下方左对齐 | 默认情况，左对齐 ⭐ |
| `bottomRight` | 下方右对齐 | 默认情况，右对齐 |
| `left` | 左侧居中 | 右侧空间不足时 |
| `right` | 右侧居中 | 左侧空间不足时 |

## 使用场景示例

### 场景1: 工具栏更多选项 (ExpertModePage)

```tsx
const moreMenuItems: DropdownMenuItem[] = [
  {
    key: 'preview',
    label: '预览功能',
    icon: <EyeIcon />,
    disabled: true, // 功能暂时禁用
    onClick: () => console.log('预览功能已屏蔽')
  },
  {
    key: 'clipboard',
    label: '剪贴板',
    icon: <ClipboardIcon />,
    onClick: () => setActivePanel('clipboard')
  },
  {
    key: 'todo',
    label: '待办事项',
    icon: <TodoIcon />,
    onClick: () => setActivePanel('todo')
  }
];

<Dropdown trigger={['click']} placement="bottomLeft" menu={{ items: moreMenuItems }}>
  <button className="toolbar-button">
    <MoreIcon />
    <span>更多</span>
  </button>
</Dropdown>
```

### 场景2: 用户操作菜单

```tsx
const userMenuItems: DropdownMenuItem[] = [
  {
    key: 'profile',
    label: '个人资料',
    icon: <UserIcon />,
    onClick: () => navigate('/profile')
  },
  {
    key: 'settings',
    label: '设置',
    icon: <SettingsIcon />,
    onClick: () => navigate('/settings')
  },
  {
    key: 'logout',
    label: '退出登录',
    icon: <LogoutIcon />,
    onClick: handleLogout
  }
];

<Dropdown trigger={['click']} placement="bottomRight" menu={{ items: userMenuItems }}>
  <Avatar src={user.avatar} />
</Dropdown>
```

### 场景3: 悬停提示菜单

```tsx
const helpMenuItems: DropdownMenuItem[] = [
  {
    key: 'docs',
    label: '查看文档',
    onClick: () => window.open('/docs')
  },
  {
    key: 'shortcuts',
    label: '快捷键',
    onClick: () => setShowShortcuts(true)
  },
  {
    key: 'feedback',
    label: '反馈建议',
    onClick: () => setShowFeedback(true)
  }
];

<Dropdown trigger={['hover']} placement="top" menu={{ items: helpMenuItems }}>
  <HelpIcon className="cursor-help" />
</Dropdown>
```

## 最佳实践

### 1. 触发方式选择

- **点击触发** (`click`): 适用于主要操作、工具栏按钮
- **悬停触发** (`hover`): 适用于帮助信息、快速预览
- **混合触发** (`['click', 'hover']`): 适用于需要兼容两种交互方式的场景

### 2. 位置选择建议

- **工具栏按钮**: 使用 `bottomLeft` 或 `bottomRight`
- **用户头像**: 使用 `bottomRight`
- **帮助图标**: 使用 `top` 或 `bottom`，避免遮挡内容

### 3. 菜单项设计

```tsx
// ✅ 好的设计
const menuItems: DropdownMenuItem[] = [
  {
    key: 'action_copy',           // 明确的 key 命名
    label: '复制到剪贴板',          // 清晰的标签
    icon: <CopyIcon />,           // 有意义的图标
    onClick: handleCopy          // 具体的处理函数
  },
  {
    key: 'action_delete',
    label: '删除项目',
    icon: <DeleteIcon />,
    disabled: !canDelete,        // 基于状态的禁用
    onClick: handleDelete
  }
];

// ❌ 避免的设计
const menuItems: DropdownMenuItem[] = [
  {
    key: '1',                    // 不明确的 key
    label: '操作',               // 模糊的标签
    onClick: () => {}            // 空的处理函数
  }
];
```

### 4. 受控模式使用

```tsx
// 当需要外部控制菜单状态时使用受控模式
const [menuOpen, setMenuOpen] = useState(false);

const handleMenuChange = (open: boolean) => {
  setMenuOpen(open);
  // 可以在这里添加额外的逻辑，如埋点统计
  if (open) {
    trackEvent('dropdown_opened', { menu: 'user_menu' });
  }
};

<Dropdown 
  open={menuOpen}
  onOpenChange={handleMenuChange}
  trigger={['click']}
  menu={{ items: menuItems }}
>
  <button>用户菜单</button>
</Dropdown>
```

## 样式自定义

组件使用 Tailwind CSS，主要样式类包括：

```css
/* 菜单容器 */
.menu-container {
  @apply rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5;
}

/* 菜单项 */
.menu-item {
  @apply w-full px-4 py-2 text-sm flex items-center space-x-2 text-left transition-colors duration-200;
}

.menu-item:not(.disabled) {
  @apply text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer;
}

.menu-item.disabled {
  @apply cursor-not-allowed text-gray-500 bg-gray-800/60;
}
```

## 性能考虑

1. **菜单项数量**: 建议单个菜单不超过 10 个选项
2. **图标优化**: 使用 SVG 图标而非图片，减少加载时间
3. **事件处理**: 避免在 onClick 中执行重量级操作
4. **内存泄漏**: 组件会自动清理定时器和事件监听器

## 无障碍访问

当前实现包含基本的无障碍支持：

- 禁用状态的视觉反馈
- 鼠标和键盘交互支持
- 语义化的 HTML 结构

未来计划添加：
- ARIA 属性支持
- 键盘导航 (方向键、Enter、ESC)
- 屏幕阅读器优化

## 故障排除

### 常见问题

1. **菜单没有显示**
   - 检查 `trigger` 配置是否正确
   - 确认 `disabled` 属性不是 `true`
   - 验证 `menu.items` 不为空

2. **菜单位置不正确**
   - 检查 `placement` 属性配置
   - 确认容器元素有足够空间
   - 检查 CSS 样式是否有冲突

3. **点击菜单项没有响应**
   - 确认菜单项没有设置 `disabled: true`
   - 检查 `onClick` 函数是否正确绑定
   - 验证事件是否被其他元素拦截

4. **TypeScript 类型错误**
   - 确保导入了正确的类型定义
   - 检查菜单项的 `key` 属性是否为字符串
   - 验证 `onClick` 函数签名是否正确

### 调试技巧

```tsx
// 1. 添加日志调试
const menuItems: DropdownMenuItem[] = [
  {
    key: 'debug_item',
    label: '调试选项',
    onClick: () => {
      console.log('菜单项被点击');
      console.log('当前状态:', { activePanel, otherState });
    }
  }
];

// 2. 使用受控模式监控状态
const [open, setOpen] = useState(false);

<Dropdown
  open={open}
  onOpenChange={(newOpen) => {
    console.log('菜单状态改变:', newOpen);
    setOpen(newOpen);
  }}
  trigger={['click']}
  menu={{ items: menuItems }}
>
  <button>调试按钮</button>
</Dropdown>
```

## 迁移指南

### 从原有实现迁移到新组件

#### 第1步: 安装和导入

```tsx
// 新增导入
import { Dropdown } from '../Common';
import type { DropdownMenuItem } from '../Common';
```

#### 第2步: 重构菜单数据

```tsx
// 原有实现
const showToolsDropdown = useState(false);

// 新实现
const moreMenuItems: DropdownMenuItem[] = [
  // 将原有的 JSX 转换为配置对象
];
```

#### 第3步: 替换 JSX

```tsx
// 删除原有的手动实现
- <div className="relative tools-dropdown-container">
-   <button onClick={toggleToolsDropdown}>...</button>
-   {showToolsDropdown && (<div>...</div>)}
- </div>

// 使用新组件
+ <Dropdown trigger={['click']} menu={{ items: moreMenuItems }}>
+   <button>...</button>
+ </Dropdown>
```

#### 第4步: 清理代码

- 删除 `showToolsDropdown` 状态
- 删除 `toggleToolsDropdown` 函数
- 删除相关的 CSS 类和样式

## 总结

新的 Dropdown 组件相比原有实现具有以下优势：

1. **更好的复用性** - 可在项目任何地方使用
2. **更丰富的功能** - 支持多种触发方式和位置
3. **更好的类型安全** - 完整的 TypeScript 支持
4. **更简洁的代码** - 减少样板代码和状态管理
5. **更好的用户体验** - 自动处理边界情况和交互细节
6. **更易维护** - 集中管理逻辑，减少重复代码

建议在新功能开发中优先使用此组件，并逐步迁移现有的下拉菜单实现。

