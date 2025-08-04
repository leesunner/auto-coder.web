
# Common Components

这个目录包含项目中可复用的通用组件。

## Dropdown 组件

一个功能完整的下拉菜单组件，参考了 antd 的 Dropdown 组件 API 设计，支持多种触发方式和位置配置。

### 特性

- ✅ 支持点击触发 (`click`)
- ✅ 支持悬停触发 (`hover`)  
- ✅ 支持混合触发方式
- ✅ 多种位置选项 (top, bottom, left, right 及其变体)
- ✅ 禁用状态支持
- ✅ 受控和非受控模式
- ✅ 图标支持
- ✅ 点击外部自动关闭
- ✅ 键盘 ESC 支持 (TODO)
- ✅ 无障碍访问支持 (TODO)

### 基本使用

```tsx
import Dropdown from './Common/Dropdown';
import type { DropdownMenuItem } from './Common/Dropdown';

const menuItems: DropdownMenuItem[] = [
  {
    key: 'option1',
    label: '选项1',
    icon: <SomeIcon />,
    onClick: () => console.log('选项1被点击')
  },
  {
    key: 'option2', 
    label: '选项2',
    disabled: true,
    onClick: () => console.log('选项2被点击')
  }
];

// 基本用法
<Dropdown 
  trigger={['click']}
  menu={{ items: menuItems }}
>
  <button>点击我</button>
</Dropdown>
```

### API

#### Dropdown Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| children | ReactNode | - | 触发下拉菜单的元素 |
| menu | DropdownMenuProps | - | 下拉菜单配置 |
| trigger | ('click' \| 'hover')[] | ['hover'] | 触发方式 |
| placement | string | 'bottomLeft' | 下拉菜单位置 |
| disabled | boolean | false | 是否禁用 |
| open | boolean | - | 受控模式下的显示状态 |
| onOpenChange | (open: boolean) => void | - | 显示状态改变的回调 |

#### DropdownMenuProps

| 属性 | 类型 | 说明 |
|------|------|------|
| items | DropdownMenuItem[] | 菜单项列表 |

#### DropdownMenuItem

| 属性 | 类型 | 说明 |
|------|------|------|
| key | string | 唯一标识 |
| label | ReactNode | 菜单项内容 |
| icon | ReactNode | 菜单项图标 |
| disabled | boolean | 是否禁用 |
| onClick | () => void | 点击回调 |

#### placement 选项

- `top` - 上方居中
- `topLeft` - 上方左对齐  
- `topRight` - 上方右对齐
- `bottom` - 下方居中
- `bottomLeft` - 下方左对齐
- `bottomRight` - 下方右对齐
- `left` - 左侧居中
- `right` - 右侧居中

### 使用示例

#### 1. 点击触发

```tsx
<Dropdown
  trigger={['click']}
  placement="bottomLeft"
  menu={{ items: menuItems }}
>
  <button>点击显示菜单</button>
</Dropdown>
```

#### 2. 悬停触发

```tsx
<Dropdown
  trigger={['hover']}
  placement="bottomRight"
  menu={{ items: menuItems }}
>
  <button>悬停显示菜单</button>
</Dropdown>
```

#### 3. 混合触发

```tsx
<Dropdown
  trigger={['click', 'hover']}
  placement="bottom"
  menu={{ items: menuItems }}
>
  <button>点击或悬停显示菜单</button>
</Dropdown>
```

#### 4. 受控模式

```tsx
const [open, setOpen] = useState(false);

<Dropdown
  trigger={['click']}
  open={open}
  onOpenChange={setOpen}
  menu={{ items: menuItems }}
>
  <button>受控模式</button>
</Dropdown>
```

#### 5. 禁用菜单项

```tsx
const menuItems = [
  {
    key: 'enabled',
    label: '正常选项',
    onClick: () => console.log('点击了正常选项')
  },
  {
    key: 'disabled',
    label: '禁用选项',
    disabled: true,
    onClick: () => console.log('这不会被执行')
  }
];
```

### 样式说明

组件使用 Tailwind CSS 类名，主要样式包括：

- 菜单容器：`bg-gray-800` 背景，`shadow-lg` 阴影
- 菜单项：`text-gray-300` 文字颜色，`hover:bg-gray-700` 悬停背景
- 禁用状态：`text-gray-500` 文字颜色，`cursor-not-allowed` 鼠标样式

### 注意事项

1. 确保触发器元素有合适的样式来指示其可交互性
2. 菜单项的 `key` 必须唯一
3. 悬停触发有 100ms 的延迟，避免鼠标快速移动时的闪烁
4. 组件会自动处理点击外部关闭的逻辑
5. 禁用的菜单项不会触发 `onClick` 回调

### 与 ExpertModePage 中"更多下拉菜单"的对比

新的 Dropdown 组件相比原有实现的优势：

1. **更好的复用性** - 可以在任何地方使用，不绑定特定业务逻辑
2. **更丰富的触发方式** - 支持点击、悬停及混合触发
3. **更多的位置选项** - 支持 8 个不同的位置
4. **更好的类型安全** - 完整的 TypeScript 类型定义
5. **更灵活的配置** - 支持受控和非受控模式
6. **更好的用户体验** - 自动处理边界情况，如点击外部关闭等

### TODO

- [ ] 添加键盘导航支持 (方向键、Enter、ESC)
- [ ] 添加无障碍访问属性 (ARIA)
- [ ] 添加动画效果
- [ ] 支持分组菜单项
- [ ] 支持菜单项分割线
- [ ] 支持子菜单
