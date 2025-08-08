
# 坦克大战 - 增强版

一个使用现代JavaScript和面向对象设计开发的坦克大战游戏。

## 特性

### 🎮 游戏特性
- **面向对象设计**: 采用现代ES6+语法和设计模式
- **智能AI系统**: 多种AI行为模式，包括巡逻、追击、包围等
- **关卡系统**: 多个关卡，难度递增
- **道具系统**: 生命恢复、武器升级、护盾等道具
- **多种坦克类型**: 轻型、重型、快速等不同特性的坦克
- **粒子效果**: 爆炸、烟雾、火花等视觉效果
- **音效系统**: 背景音乐和音效支持

### 🔧 技术特性
- **性能优化**: 自动性能监控和优化
- **调试控制台**: 强大的实时调试功能
- **模块化架构**: 清晰的代码结构，易于扩展
- **事件系统**: 解耦的事件驱动架构
- **资源管理**: 智能的资源加载和缓存
- **错误处理**: 完善的错误捕获和处理

## 文件结构

```
enhanced/
├── index.html                          # 主页面
├── styles/
│   └── game.css                        # 游戏样式
├── src/
│   ├── main.js                         # 游戏启动器
│   ├── Game.js                         # 主游戏类
│   ├── core/
│   │   └── GameEngine.js               # 游戏引擎核心
│   ├── entities/                       # 游戏实体
│   │   ├── GameObject.js               # 基础游戏对象
│   │   ├── Tank.js                     # 坦克基类
│   │   ├── PlayerTank.js               # 玩家坦克
│   │   ├── EnemyTank.js                # 敌方坦克
│   │   ├── Bullet.js                   # 子弹类
│   │   ├── Explosion.js                # 爆炸效果
│   │   └── PowerUp.js                  # 道具类
│   ├── systems/                        # 游戏系统
│   │   ├── Map.js                      # 地图系统
│   │   ├── CollisionSystem.js          # 碰撞检测
│   │   ├── EffectsSystem.js            # 效果系统
│   │   ├── LevelSystem.js              # 关卡系统
│   │   └── AISystem.js                 # AI系统
│   ├── managers/                       # 管理器
│   │   ├── ResourceManager.js          # 资源管理
│   │   ├── InputManager.js             # 输入管理
│   │   ├── AudioManager.js             # 音频管理
│   │   ├── StateManager.js             # 状态管理
│   │   ├── UIManager.js                # UI管理
│   │   └── ControlManager.js           # 控制管理
│   ├── utils/                          # 工具类
│   │   ├── EventEmitter.js             # 事件发射器
│   │   ├── Logger.js                   # 日志系统
│   │   └── PerformanceMonitor.js       # 性能监控
│   ├── debug/
│   │   └── DebugConsole.js             # 调试控制台
│   └── optimization/
│       └── PerformanceOptimizer.js     # 性能优化器
└── README.md                           # 说明文档
```

## 快速开始

### 1. 运行游戏
直接在浏览器中打开 `index.html` 文件即可开始游戏。

### 2. 操作说明

#### 玩家1控制
- **方向键** (↑↓←→) - 移动坦克
- **空格键** - 发射子弹

#### 玩家2控制
- **WASD键** - 移动坦克
- **F键** - 发射子弹

#### 调试功能
- **F12** 或 **Ctrl+`** - 打开/关闭调试控制台
- **P键** - 暂停/恢复游戏
- **R键** - 重新开始游戏

## 调试控制台

游戏内置了强大的调试控制台，按F12或Ctrl+`打开。

### 基础命令
- `help` - 显示所有可用命令
- `clear` - 清空控制台
- `fps` - 显示FPS信息
- `stats` - 显示游戏统计信息

### 游戏控制命令
- `pause` - 暂停/恢复游戏
- `speed <number>` - 设置游戏速度 (0.1-5.0)
- `god` - 切换无敌模式
- `noclip` - 切换穿墙模式

### 实体控制命令
- `spawn <type> [x] [y]` - 生成实体
- `kill` - 销毁所有敌人
- `heal` - 治疗玩家

### 关卡控制命令
- `level <number>` - 跳转到指定关卡
- `complete` - 完成当前关卡

### 渲染调试命令
- `wireframe` - 切换线框模式
- `hitbox` - 切换碰撞盒显示
- `grid` - 切换网格显示

### 性能调试命令
- `profile` - 开始/停止性能分析
- `memory` - 显示内存使用情况

## 性能优化

游戏包含自动性能优化系统：

### 自动优化策略
1. **粒子数量控制** - 当FPS低于45时减少粒子
2. **距离剔除** - 当FPS低于40时启用距离剔除
3. **效果质量降级** - 当FPS低于35时降低效果质量
4. **画质等级调整** - 当FPS低于30时自动降低画质
5. **紧急模式** - 当FPS低于20时启用极端优化

### 画质等级
- **超高** - 所有效果全开
- **高** - 默认设置，平衡性能和画质
- **中** - 减少部分效果
- **低** - 最小化效果
- **最低** - 仅保留基本功能

## 扩展开发

### 添加新的坦克类型

```javascript
import { Tank } from './Tank.js';

export class SuperTank extends Tank {
    constructor(x, y) {
        super(x, y);
        this.maxHealth = 200;
        this.health = this.maxHealth;
        this.speed = 1.5;
        this.fireRate = 300; // 毫秒
        this.bulletDamage = 75;
    }
    
    // 重写特殊行为
    update(deltaTime) {
        super.update(deltaTime);
        // 添加特殊逻辑
    }
}
```

### 添加新的道具

```javascript
import { PowerUp } from './PowerUp.js';

export class SpeedBoost extends PowerUp {
    constructor(x, y) {
        super(x, y);
        this.type = 'speedBoost';
        this.duration = 10000; // 10秒
    }
    
    apply(tank) {
        tank.speed *= 1.5;
        setTimeout(() => {
            tank.speed /= 1.5;
        }, this.duration);
    }
}
```

### 添加新的AI行为

```javascript
// 在AISystem.js中添加新的行为模式
const behaviors = {
    // 现有行为...
    
    berserker: {
        update: (tank, player, enemies, deltaTime) => {
            // 狂暴模式：直线冲向玩家
            const dx = player.x - tank.x;
            const dy = player.y - tank.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                tank.vx = (dx / distance) * tank.speed * 2;
                tank.vy = (dy / distance) * tank.speed * 2;
            }
            
            // 连续射击
            if (tank.canFire()) {
                tank.fire();
            }
        }
    }
};
```

## 浏览器兼容性

### 最低要求
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

### 所需API支持
- Canvas 2D API
- Web Audio API
- ES6 Classes and Modules
- requestAnimationFrame
- Performance API

## 开发建议

### 性能优化建议
1. 避免在游戏循环中创建新对象
2. 使用对象池管理频繁创建/销毁的对象
3. 合理使用距离剔除减少不必要的计算
4. 批量处理相似的渲染操作

### 调试建议
1. 使用内置的调试控制台监控性能
2. 启用线框模式和碰撞盒显示来调试渲染问题
3. 使用性能分析器找出性能瓶颈
4. 监控内存使用避免内存泄漏

### 代码规范
1. 遵循ES6+语法规范
2. 使用有意义的变量和函数名
3. 添加适当的注释和文档
4. 保持代码模块化和可复用性

## 许可证

MIT License - 可自由使用、修改和分发。

## 贡献

欢迎提交Issue和Pull Request来改进这个游戏！

---

**享受游戏！** 🎮
