

















# 坦克大战游戏

一个使用TypeScript和HTML5 Canvas开发的面向对象坦克大战游戏。

## 功能特性

- 🎮 **玩家控制**: 使用WASD键控制坦克移动，空格键发射子弹
- 🤖 **AI敌人**: 智能敌人坦克，具有巡逻、追击和攻击三种AI状态
- 💥 **碰撞检测**: 完整的碰撞检测系统，包括坦克、子弹和墙壁
- 🏗️ **关卡系统**: 多关卡设计，消灭所有敌人后进入下一关
- 🎯 **得分系统**: 击败敌人获得分数
- 💖 **生命值系统**: 玩家和敌人都有生命值，支持血条显示
- 🎨 **精美渲染**: 流畅的动画和视觉效果

## 游戏控制

| 按键 | 功能 |
|------|------|
| W | 向前移动 |
| S | 向后移动 |
| A | 向左转 |
| D | 向右转 |
| 空格 | 发射子弹 |

## 技术架构

### 核心类设计

1. **Game** - 游戏主控制器
   - 管理游戏循环
   - 处理游戏状态
   - 协调各个组件

2. **Tank** - 坦克基类
   - 移动和转向
   - 射击功能
   - 生命值管理

3. **Enemy** - 敌人坦克（继承Tank）
   - AI行为系统
   - 自动寻路和攻击

4. **Bullet** - 子弹类
   - 飞行轨迹
   - 碰撞检测

5. **Wall** - 墙壁类
   - 静态障碍物
   - 碰撞边界

6. **InputManager** - 输入管理器
   - 键盘事件处理
   - 输入状态管理

7. **CollisionDetector** - 碰撞检测器
   - AABB碰撞检测
   - 圆形碰撞检测

8. **GameRenderer** - 渲染器
   - Canvas绘制
   - UI渲染

## 项目结构

```
frontend/src/game/
├── index.tsx              # 主游戏组件
├── GameRoute.tsx          # 游戏路由组件
├── index.ts               # 导出文件
├── README.md              # 说明文档
├── core/                  # 核心游戏逻辑
│   ├── Game.ts            # 游戏主控制器
│   ├── Tank.ts            # 坦克基类
│   ├── Enemy.ts           # 敌人坦克
│   ├── Bullet.ts          # 子弹类
│   ├── Wall.ts            # 墙壁类
│   ├── InputManager.ts    # 输入管理器
│   ├── CollisionDetector.ts # 碰撞检测器
│   └── GameRenderer.ts    # 渲染器
└── styles/
    └── game.css           # 游戏样式
```

## 使用方法

### 1. 作为独立组件使用

```tsx
import TankGame from './game';

function App() {
  return (
    <div>
      <TankGame />
    </div>
  );
}
```

### 2. 作为路由页面使用

```tsx
import { GameRoute } from './game';

// 在路由配置中
<Route path="/game" component={GameRoute} />
```

### 3. 集成到现有应用

```tsx
import { Game } from './game/core/Game';

// 在React组件中
const canvasRef = useRef<HTMLCanvasElement>(null);

useEffect(() => {
  if (canvasRef.current) {
    const game = new Game(canvasRef.current);
    game.start();
    
    return () => game.stop();
  }
}, []);
```

## 游戏机制

### AI系统

敌人坦克具有三种AI状态：

1. **巡逻模式** - 随机移动和转向
2. **追击模式** - 发现玩家后追击
3. **攻击模式** - 接近玩家时进行攻击

### 碰撞系统

- 坦克与墙壁碰撞会阻止移动
- 子弹与墙壁碰撞会消失
- 子弹与坦克碰撞会造成伤害

### 关卡系统

- 消灭所有敌人后自动进入下一关
- 每关敌人数量和布局可能不同
- 得分会累积保留

## 扩展功能

可以轻松扩展以下功能：

- 道具系统（加血包、武器升级等）
- 更多敌人类型
- 地图编辑器
- 多人游戏模式
- 音效和背景音乐
- 粒子效果
- 更复杂的AI行为

## 性能优化

- 使用requestAnimationFrame进行流畅动画
- 高效的碰撞检测算法
- 对象池管理（可扩展）
- Canvas优化渲染

## 兼容性

- 支持所有现代浏览器
- 响应式设计，支持不同屏幕尺寸
- TypeScript类型安全


















