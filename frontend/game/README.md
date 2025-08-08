
# 🎮 坦克大战游戏

一个使用纯JavaScript和HTML5 Canvas开发的面向对象坦克大战游戏。

## 📁 项目结构

```
frontend/game/
├── index.html              # 主游戏页面
├── test.html              # 游戏测试页面
├── README.md              # 项目说明文档
├── ARCHITECTURE.md        # 架构设计文档
├── src/                   # 源代码目录
│   ├── main.js           # 游戏主入口
│   ├── core/             # 核心引擎
│   │   ├── Game.js       # 游戏主类
│   │   ├── Renderer.js   # 渲染引擎
│   │   ├── InputManager.js    # 输入管理器
│   │   ├── AudioManager.js    # 音频管理器
│   │   └── GameController.js  # 游戏控制器
│   ├── entities/         # 游戏实体
│   │   ├── GameObject.js # 游戏对象基类
│   │   ├── Tank.js       # 坦克基类
│   │   ├── PlayerTank.js # 玩家坦克
│   │   ├── EnemyTank.js  # 敌方坦克
│   │   ├── Bullet.js     # 子弹类
│   │   └── Explosion.js  # 爆炸效果
│   ├── map/              # 地图系统
│   │   ├── GameMap.js    # 游戏地图
│   │   └── Obstacle.js   # 障碍物
│   ├── states/           # 状态管理
│   │   ├── GameStateManager.js # 游戏状态管理器
│   │   └── UIManager.js  # UI管理器
│   └── utils/            # 工具类
│       └── Vector2.js    # 2D向量工具
├── styles/               # 样式文件
│   └── game.css         # 游戏样式
├── assets/              # 游戏资源
└── sounds/              # 音效文件
```

## 🚀 快速开始

### 1. 运行主游戏

直接在浏览器中打开 `index.html` 文件即可开始游戏。

### 2. 运行测试页面

打开 `test.html` 文件可以进行各种功能测试和调试。

### 3. 使用本地服务器（推荐）

由于浏览器的安全限制，建议使用本地HTTP服务器运行游戏：

```bash
# 使用Python
python -m http.server 8000

# 使用Node.js
npx http-server

# 使用Live Server (VS Code扩展)
```

然后访问：
- 主游戏：`http://localhost:8000/index.html`
- 测试页面：`http://localhost:8000/test.html`

## 🎯 游戏控制

### 基本控制
- **WASD** 或 **方向键** - 移动坦克
- **空格键** - 射击
- **Enter** - 开始游戏
- **ESC** - 暂停/恢复游戏

### 调试控制
- **F3** - 切换调试模式
- **F5** - 重新加载游戏

## 🎮 游戏特性

### 核心功能
- ✅ 完整的面向对象架构
- ✅ 平滑的坦克移动和旋转
- ✅ 子弹射击和碰撞检测
- ✅ 智能敌方AI系统
- ✅ 多种障碍物类型
- ✅ 爆炸特效和粒子系统
- ✅ 游戏状态管理
- ✅ 音效系统支持
- ✅ 响应式UI界面

### 高级特性
- 🔄 模块化设计，易于扩展
- 🎯 精确的碰撞检测系统
- 🤖 多种AI行为模式
- 💥 丰富的视觉特效
- 🎵 完整的音频管理
- 📊 实时性能监控
- 🐛 内置调试工具

## 🏗️ 架构设计

### 设计模式
- **组件系统**: 游戏对象采用组件化设计
- **状态机**: 游戏状态和AI行为管理
- **观察者模式**: 事件系统和状态同步
- **工厂模式**: 实体创建和管理
- **单例模式**: 全局管理器类

### 核心类层次
```
GameObject (基类)
├── Tank (坦克基类)
│   ├── PlayerTank (玩家坦克)
│   └── EnemyTank (敌方坦克)
├── Bullet (子弹)
├── Explosion (爆炸)
└── Obstacle (障碍物)
```

## 🧪 测试功能

测试页面 (`test.html`) 提供了完整的测试套件：

### 游戏控制测试
- 开始/暂停/恢复/重启游戏
- 游戏状态切换测试

### 实体测试
- 生成敌人坦克
- 玩家射击测试
- 爆炸效果测试
- 道具生成测试

### 性能测试
- FPS监控
- 内存使用监控
- 压力测试（大量实体）
- 调试模式切换

### 碰撞检测测试
- 子弹碰撞测试
- 坦克碰撞测试
- 障碍物交互测试

### 音效测试
- 射击音效
- 爆炸音效
- 背景音乐
- 音量控制

## 🔧 开发指南

### 添加新的坦克类型

1. 继承 `Tank` 基类
2. 实现特定的行为方法
3. 在 `GameController` 中注册新类型

```javascript
class HeavyTank extends Tank {
    constructor(x, y) {
        super(x, y, 40, 40); // 更大的尺寸
        this.maxHealth = 3;  // 更多生命值
        this.speed = 30;     // 更慢的速度
    }
}
```

### 添加新的武器类型

1. 继承 `Bullet` 基类
2. 定义特殊的行为和效果
3. 在坦克类中调用

```javascript
class RocketBullet extends Bullet {
    constructor(x, y, direction, owner) {
        super(x, y, direction, owner);
        this.damage = 2;     // 更高伤害
        this.speed = 150;    // 更快速度
        this.explosionRadius = 50; // 爆炸半径
    }
}
```

### 添加新的障碍物

1. 继承 `Obstacle` 基类
2. 定义物理属性和视觉效果
3. 在地图中放置

```javascript
class ElectricFence extends Obstacle {
    constructor(x, y, width, height) {
        super(x, y, width, height, 'electric_fence');
        this.damage = 1;     // 接触伤害
        this.isPassable = false;
        this.isDestructible = false;
    }
}
```

## 🐛 调试技巧

### 启用调试模式
按 `F3` 或调用 `testToggleDebug()` 启用调试模式，显示：
- 碰撞边界框
- AI状态信息
- 性能统计
- 实体计数

### 控制台命令
在浏览器控制台中可以使用：
```javascript
// 访问游戏实例
window.game

// 访问游戏控制器
window.gameController

// 生成敌人
window.gameController.createEnemyTank('heavy')

// 查看游戏状态
window.gameStateManager.currentState
```

## 📊 性能优化

### 已实现的优化
- 对象池管理（子弹、爆炸效果）
- 视锥剔除（只渲染可见对象）
- 碰撞检测优化（空间分割）
- 音频缓存和预加载
- 纹理重用和批处理

### 性能监控
- 实时FPS显示
- 内存使用监控
- 实体数量统计
- 渲染时间分析

## 🎨 自定义和扩展

### 修改游戏设置
编辑各个类的构造函数参数来调整：
- 坦克速度和生命值
- 子弹伤害和速度
- 敌人AI难度
- 地图大小和障碍物

### 添加新关卡
在 `GameMap` 类中定义新的地图布局：
```javascript
const level2 = {
    width: 800,
    height: 600,
    obstacles: [
        { type: 'brick_wall', x: 100, y: 100, width: 50, height: 50 },
        // 更多障碍物...
    ],
    enemySpawns: [
        { x: 700, y: 50, type: 'basic' },
        // 更多敌人生成点...
    ]
};
```

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- HTML5 Canvas API
- Web Audio API
- ES6+ JavaScript 特性
- 现代浏览器支持

---

**享受游戏！** 🎮✨
