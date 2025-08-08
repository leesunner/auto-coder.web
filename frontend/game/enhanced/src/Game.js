













import { GameEngine } from './core/GameEngine.js';
import { StateManager } from './managers/StateManager.js';
import { UIManager } from './managers/UIManager.js';
import { ControlManager } from './managers/ControlManager.js';
import { ResourceManager } from './managers/ResourceManager.js';
import { InputManager } from './managers/InputManager.js';
import { AudioManager } from './managers/AudioManager.js';
import { Map } from './systems/Map.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { EffectsSystem } from './systems/EffectsSystem.js';
import { PlayerTank } from './entities/PlayerTank.js';
import { EnemyTank } from './entities/EnemyTank.js';
import { Logger } from './utils/Logger.js';

/**
 * 主游戏类
 * 整合所有游戏系统，管理游戏的整体流程
 */
export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        
        // 游戏状态
        this.isRunning = false;
        this.isPaused = false;
        this.isInitialized = false;
        
        // 核心系统
        this.engine = null;
        this.stateManager = null;
        this.uiManager = null;
        this.controlManager = null;
        this.resourceManager = null;
        this.inputManager = null;
        this.audioManager = null;
        
        // 游戏系统
        this.map = null;
        this.collisionSystem = null;
        this.effectsSystem = null;
        
        // 游戏对象
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.powerUps = [];
        this.explosions = [];
        
        // 游戏循环
        this.lastTime = 0;
        this.accumulator = 0;
        this.fixedTimeStep = 1000 / 60; // 60 FPS
        
        // 关卡配置
        this.levelConfig = {
            1: {
                enemies: [
                    { type: 'basic', count: 5, spawnDelay: 2000 },
                    { type: 'fast', count: 2, spawnDelay: 5000 }
                ],
                powerUps: ['speed', 'fireRate', 'shield'],
                timeLimit: 180000, // 3分钟
                objectives: ['destroyAllEnemies']
            },
            2: {
                enemies: [
                    { type: 'basic', count: 8, spawnDelay: 1500 },
                    { type: 'fast', count: 3, spawnDelay: 4000 },
                    { type: 'heavy', count: 1, spawnDelay: 10000 }
                ],
                powerUps: ['speed', 'fireRate', 'shield', 'multiShot'],
                timeLimit: 240000, // 4分钟
                objectives: ['destroyAllEnemies', 'surviveTimeLimit']
            }
        };
        
        // 敌人生成
        this.enemySpawner = {
            queue: [],
            lastSpawnTime: 0,
            spawnPoints: []
        };
        
        // 初始化
        this.initialize();
    }

    /**
     * 初始化游戏
     */
    async initialize() {
        try {
            Logger.info('开始初始化游戏...');
            
            // 初始化核心系统
            await this.initializeCoreSystem();
            
            // 初始化游戏系统
            await this.initializeGameSystems();
            
            // 初始化游戏对象
            this.initializeGameObjects();
            
            // 设置事件监听器
            this.setupEventListeners();
            
            // 加载资源
            await this.loadResources();
            
            // 初始化UI
            this.initializeUI();
            
            this.isInitialized = true;
            Logger.info('游戏初始化完成');
            
            // 进入主菜单
            this.stateManager.changeState(this.stateManager.states.MENU);
            
        } catch (error) {
            Logger.error('游戏初始化失败:', error);
            throw error;
        }
    }

    /**
     * 初始化核心系统
     */
    async initializeCoreSystem() {
        // 游戏引擎
        this.engine = new GameEngine(this.canvas);
        
        // 状态管理器
        this.stateManager = new StateManager();
        
        // UI管理器
        this.uiManager = new UIManager(this.canvas, this.context);
        
        // 控制管理器
        this.controlManager = new ControlManager();
        
        // 资源管理器
        this.resourceManager = new ResourceManager();
        
        // 输入管理器
        this.inputManager = new InputManager(this.canvas);
        
        // 音频管理器
        this.audioManager = new AudioManager();
    }

    /**
     * 初始化游戏系统
     */
    async initializeGameSystems() {
        // 地图系统
        this.map = new Map(this.canvas.width, this.canvas.height);
        
        // 碰撞检测系统
        this.collisionSystem = new CollisionSystem();
        
        // 特效系统
        this.effectsSystem = new EffectsSystem(this.context);
    }

    /**
     * 初始化游戏对象
     */
    initializeGameObjects() {
        // 清空游戏对象数组
        this.enemies = [];
        this.bullets = [];
        this.powerUps = [];
        this.explosions = [];
        
        // 设置敌人生成点
        this.setupEnemySpawnPoints();
    }

    /**
     * 设置敌人生成点
     */
    setupEnemySpawnPoints() {
        this.enemySpawner.spawnPoints = [
            { x: 50, y: 50 },
            { x: this.canvas.width - 50, y: 50 },
            { x: 50, y: this.canvas.height - 50 },
            { x: this.canvas.width - 50, y: this.canvas.height - 50 },
            { x: this.canvas.width / 2, y: 50 }
        ];
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 状态管理器事件
        this.stateManager.on('stateChanged', (data) => this.handleStateChange(data));
        this.stateManager.on('gameOver', (data) => this.handleGameOver(data));
        this.stateManager.on('levelComplete', (data) => this.handleLevelComplete(data));
        
        // 控制管理器事件
        this.controlManager.on('action', (data) => this.handleControlAction(data));
        this.controlManager.on('escapePressed', () => this.handleEscapePressed());
        
        // UI管理器事件
        this.uiManager.on('uiAction', (data) => this.handleUIAction(data));
        
        // 游戏引擎事件
        this.engine.on('update', (deltaTime) => this.update(deltaTime));
        this.engine.on('render', () => this.render());
    }

    /**
     * 加载资源
     */
    async loadResources() {
        // 加载图片资源
        const imageResources = [
            { id: 'playerTank', url: 'assets/images/player_tank.png' },
            { id: 'enemyTank', url: 'assets/images/enemy_tank.png' },
            { id: 'bullet', url: 'assets/images/bullet.png' },
            { id: 'explosion', url: 'assets/images/explosion.png' },
            { id: 'powerUp', url: 'assets/images/power_up.png' },
            { id: 'wall', url: 'assets/images/wall.png' }
        ];
        
        // 加载音频资源
        const audioResources = [
            { id: 'shoot', url: 'assets/audio/shoot.wav' },
            { id: 'explosion', url: 'assets/audio/explosion.wav' },
            { id: 'powerUp', url: 'assets/audio/power_up.wav' },
            { id: 'bgMusic', url: 'assets/audio/background.mp3' }
        ];
        
        try {
            await this.resourceManager.loadImages(imageResources);
            await this.resourceManager.loadAudio(audioResources);
            Logger.info('资源加载完成');
        } catch (error) {
            Logger.warn('资源加载失败，使用默认资源:', error);
        }
    }

    /**
     * 初始化UI
     */
    initializeUI() {
        // 更新UI中的高分显示
        this.uiManager.updateUIElement('mainMenu', 'highScore', {
            text: `最高分: ${this.stateManager.getGameData().highScore}`
        });
    }

    /**
     * 处理状态变化
     */
    handleStateChange(data) {
        const { currentState, previousState } = data;
        
        switch (currentState) {
            case this.stateManager.states.MENU:
                this.showMainMenu();
                break;
            case this.stateManager.states.PLAYING:
                this.startGame();
                break;
            case this.stateManager.states.PAUSED:
                this.pauseGame();
                break;
            case this.stateManager.states.GAME_OVER:
                this.showGameOver();
                break;
            case this.stateManager.states.LEVEL_COMPLETE:
                this.showLevelComplete();
                break;
        }
    }

    /**
     * 处理控制动作
     */
    handleControlAction(data) {
        const { action, type } = data;
        
        if (!this.stateManager.isPlaying()) return;
        
        switch (action) {
            case 'up':
                if (type === 'keydown') this.player?.startMoving('up');
                else if (type === 'keyup') this.player?.stopMoving('up');
                break;
            case 'down':
                if (type === 'keydown') this.player?.startMoving('down');
                else if (type === 'keyup') this.player?.stopMoving('down');
                break;
            case 'left':
                if (type === 'keydown') this.player?.startMoving('left');
                else if (type === 'keyup') this.player?.stopMoving('left');
                break;
            case 'right':
                if (type === 'keydown') this.player?.startMoving('right');
                else if (type === 'keyup') this.player?.stopMoving('right');
                break;
            case 'shoot':
                if (type === 'keydown') this.player?.startShooting();
                else if (type === 'keyup') this.player?.stopShooting();
                break;
            case 'pause':
                if (type === 'keydown') this.togglePause();
                break;
        }
    }

    /**
     * 处理ESC键按下
     */
    handleEscapePressed() {
        if (this.stateManager.isPlaying()) {
            this.togglePause();
        } else if (this.stateManager.isPaused()) {
            this.resumeGame();
        }
    }

    /**
     * 处理UI动作
     */
    handleUIAction(data) {
        const { action } = data;
        
        switch (action) {
            case 'startGame':
                this.stateManager.changeState(this.stateManager.states.PLAYING);
                break;
            case 'showSettings':
                this.stateManager.changeState(this.stateManager.states.SETTINGS);
                break;
            case 'showHelp':
                this.stateManager.changeState(this.stateManager.states.HELP);
                break;
            case 'resumeGame':
                this.resumeGame();
                break;
            case 'backToMenu':
                this.stateManager.changeState(this.stateManager.states.MENU);
                break;
            case 'restartGame':
                this.restartGame();
                break;
            case 'backFromSettings':
                this.stateManager.goBack();
                break;
        }
    }

    /**
     * 显示主菜单
     */
    showMainMenu() {
        this.uiManager.hideUI('gameHUD');
        this.uiManager.hideUI('pauseMenu');
        this.uiManager.hideUI('gameOverScreen');
        this.uiManager.showUI('mainMenu');
        
        // 播放背景音乐
        this.audioManager.playMusic('bgMusic', { loop: true, volume: 0.3 });
    }

    /**
     * 开始游戏
     */
    startGame() {
        // 隐藏菜单UI
        this.uiManager.hideUI('mainMenu');
        this.uiManager.hideUI('pauseMenu');
        
        // 显示游戏UI
        this.uiManager.showUI('gameHUD');
        
        // 重置游戏状态
        this.resetGame();
        
        // 创建玩家坦克
        this.createPlayer();
        
        // 开始关卡
        this.startLevel();
        
        // 开始游戏循环
        if (!this.isRunning) {
            this.isRunning = true;
            this.engine.start();
        }
        
        this.isPaused = false;
    }

    /**
     * 暂停游戏
     */
    pauseGame() {
        this.isPaused = true;
        this.uiManager.showUI('pauseMenu');
        this.audioManager.pauseAll();
    }

    /**
     * 恢复游戏
     */
    resumeGame() {
        this.stateManager.changeState(this.stateManager.states.PLAYING);
        this.isPaused = false;
        this.uiManager.hideUI('pauseMenu');
        this.audioManager.resumeAll();
    }

    /**
     * 切换暂停状态
     */
    togglePause() {
        if (this.stateManager.isPlaying()) {
            this.stateManager.changeState(this.stateManager.states.PAUSED);
        } else if (this.stateManager.isPaused()) {
            this.resumeGame();
        }
    }

    /**
     * 重启游戏
     */
    restartGame() {
        this.stateManager.resetGame();
        this.stateManager.changeState(this.stateManager.states.PLAYING);
    }

    /**
     * 显示游戏结束界面
     */
    showGameOver() {
        this.uiManager.hideUI('gameHUD');
        this.uiManager.showUI('gameOverScreen');
        
        // 更新最终分数显示
        const gameData = this.stateManager.getGameData();
        this.uiManager.updateUIElement('gameOverScreen', 'finalScore', {
            text: `最终分数: ${gameData.score}`
        });
        this.uiManager.updateUIElement('gameOverScreen', 'highScore', {
            text: `最高分: ${gameData.highScore}`
        });
        
        // 停止背景音乐
        this.audioManager.stopMusic();
    }

    /**
     * 显示关卡完成界面
     */
    showLevelComplete() {
        this.uiManager.showNotification('关卡完成！', 'success');
        
        // 延迟进入下一关
        setTimeout(() => {
            this.stateManager.nextLevel();
        }, 2000);
    }

    /**
     * 处理游戏结束
     */
    handleGameOver(data) {
        // 停止所有音效
        this.audioManager.stopAll();
        
        // 播放游戏结束音效
        this.audioManager.playSound('gameOver');
    }

    /**
     * 处理关卡完成
     */
    handleLevelComplete(data) {
        // 播放关卡完成音效
        this.audioManager.playSound('levelComplete');
    }

    /**
     * 重置游戏
     */
    resetGame() {
        // 清空游戏对象
        this.enemies = [];
        this.bullets = [];
        this.powerUps = [];
        this.explosions = [];
        
        // 重置敌人生成器
        this.enemySpawner.queue = [];
        this.enemySpawner.lastSpawnTime = 0;
        
        // 重置地图
        this.map.reset();
    }

    /**
     * 创建玩家坦克
     */
    createPlayer() {
        const startX = this.canvas.width / 2;
        const startY = this.canvas.height - 100;
        
        this.player = new PlayerTank(startX, startY);
        this.player.on('shoot', (bullet) => this.addBullet(bullet));
        this.player.on('destroyed', () => this.handlePlayerDestroyed());
    }

    /**
     * 开始关卡
     */
    startLevel() {
        const currentLevel = this.stateManager.getLevelData().currentLevel;
        const config = this.levelConfig[currentLevel] || this.levelConfig[1];
        
        // 设置关卡数据
        this.stateManager.setLevelEnemies(
            config.enemies.reduce((total, enemy) => total + enemy.count, 0)
        );
        
        // 设置时间限制
        this.stateManager.levelData.timeLimit = config.timeLimit;
        this.stateManager.levelData.timeRemaining = config.timeLimit;
        
        // 准备敌人生成队列
        this.prepareEnemySpawnQueue(config.enemies);
        
        // 更新UI
        this.updateGameUI();
    }

    /**
     * 准备敌人生成队列
     */
    prepareEnemySpawnQueue(enemyConfig) {
        this.enemySpawner.queue = [];
        
        for (const config of enemyConfig) {
            for (let i = 0; i < config.count; i++) {
                this.enemySpawner.queue.push({
                    type: config.type,
                    spawnTime: Date.now() + (i + 1) * config.spawnDelay
                });
            }
        }
        
        // 随机打乱生成顺序
        this.enemySpawner.queue.sort(() => Math.random() - 0.5);
    }

    /**
     * 更新游戏UI
     */
    updateGameUI() {
        const gameData = this.stateManager.getGameData();
        const levelData = this.stateManager.getLevelData();
        
        this.uiManager.updateUIElement('gameHUD', 'score', {
            text: `分数: ${gameData.score}`
        });
        this.uiManager.updateUIElement('gameHUD', 'lives', {
            text: `生命: ${gameData.lives}`
        });
        this.uiManager.updateUIElement('gameHUD', 'level', {
            text: `关卡: ${levelData.currentLevel}`
        });
        this.uiManager.updateUIElement('gameHUD', 'enemies', {
            text: `敌人: ${levelData.enemiesRemaining}`
        });
        
        // 更新时间进度条
        if (levelData.timeLimit > 0) {
            const timeProgress = (levelData.timeRemaining / levelData.timeLimit) * 100;
            this.uiManager.updateUIElement('gameHUD', 'timeBar', {
                value: timeProgress
            });
        }
    }

    /**
     * 生成敌人
     */
    spawnEnemies() {
        const now = Date.now();
        
        // 检查生成队列
        for (let i = this.enemySpawner.queue.length - 1; i >= 0; i--) {
            const spawn = this.enemySpawner.queue[i];
            
            if (now >= spawn.spawnTime) {
                this.createEnemy(spawn.type);
                this.enemySpawner.queue.splice(i, 1);
            }
        }
    }

    /**
     * 创建敌人
     */
    createEnemy(type) {
        const spawnPoint = this.getRandomSpawnPoint();
        const enemy = new EnemyTank(spawnPoint.x, spawnPoint.y, type);
        
        enemy.on('shoot', (bullet) => this.addBullet(bullet));
        enemy.on('destroyed', () => this.handleEnemyDestroyed(enemy));
        
        this.enemies.push(enemy);
    }

    /**
     * 获取随机生成点
     */
    getRandomSpawnPoint() {
        const availablePoints = this.enemySpawner.spawnPoints.filter(point => {
            // 检查生成点是否被占用
            return !this.isPositionOccupied(point.x, point.y, 50);
        });
        
        if (availablePoints.length === 0) {
            return this.enemySpawner.spawnPoints[0]; // 备用方案
        }
        
        return availablePoints[Math.floor(Math.random() * availablePoints.length)];
    }

    /**
     * 检查位置是否被占用
     */
    isPositionOccupied(x, y, radius) {
        // 检查玩家位置
        if (this.player) {
            const dx = this.player.x - x;
            const dy = this.player.y - y;
            if (Math.sqrt(dx * dx + dy * dy) < radius) {
                return true;
            }
        }
        
        // 检查其他敌人位置
        for (const enemy of this.enemies) {
            const dx = enemy.x - x;
            const dy = enemy.y - y;
            if (Math.sqrt(dx * dx + dy * dy) < radius) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * 添加子弹
     */
    addBullet(bullet) {
        this.bullets.push(bullet);
        this.audioManager.playSound('shoot', { volume: 0.3 });
        
        // 更新射击统计
        if (bullet.owner === 'player') {
            this.stateManager.shotFired();
        }
    }

    /**
     * 处理玩家被摧毁
     */
    handlePlayerDestroyed() {
        this.stateManager.loseLife();
        
        if (this.stateManager.getGameData().lives > 0) {
            // 重新创建玩家
            setTimeout(() => {
                this.createPlayer();
            }, 2000);
        }
    }

    /**
     * 处理敌人被摧毁
     */
    handleEnemyDestroyed(enemy) {
        // 从敌人数组中移除
        const index = this.enemies.indexOf(enemy);
        if (index !== -1) {
            this.enemies.splice(index, 1);
        }
        
        // 更新统计
        this.stateManager.enemyDestroyed();
        this.stateManager.addScore(100);
        
        // 播放爆炸音效
        this.audioManager.playSound('explosion', { volume: 0.5 });
        
        // 更新UI
        this.updateGameUI();
    }

    /**
     * 更新游戏逻辑
     */
    update(deltaTime) {
        if (!this.isInitialized || this.isPaused) return;
        
        // 更新管理器
        this.stateManager.update(deltaTime);
        this.controlManager.update(deltaTime);
        this.uiManager.update(deltaTime);
        this.effectsSystem.update(deltaTime);
        
        // 只在游戏进行时更新游戏对象
        if (this.stateManager.isPlaying()) {
            this.updateGameObjects(deltaTime);
            this.handleCollisions();
            this.spawnEnemies();
            this.updateGameUI();
        }
    }

    /**
     * 更新游戏对象
     */
    updateGameObjects(deltaTime) {
        // 更新玩家
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        // 更新敌人
        for (const enemy of this.enemies) {
            enemy.update(deltaTime);
        }
        
        // 更新子弹
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update(deltaTime);
            
            // 移除超出边界的子弹
            if (bullet.isOutOfBounds(this.canvas.width, this.canvas.height)) {
                this.bullets.splice(i, 1);
            }
        }
        
        // 更新道具
        for (const powerUp of this.powerUps) {
            powerUp.update(deltaTime);
        }
        
        // 更新爆炸效果
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            explosion.update(deltaTime);
            
            if (explosion.isFinished()) {
                this.explosions.splice(i, 1);
            }
        }
    }

    /**
     * 处理碰撞
     */
    handleCollisions() {
        // 子弹与坦克的碰撞
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            let collision = false;
            
            // 子弹与玩家碰撞
            if (bullet.owner !== 'player' && this.player && 
                this.collisionSystem.checkCollision(bullet, this.player)) {
                this.player.takeDamage(bullet.damage);
                collision = true;
            }
            
            // 子弹与敌人碰撞
            if (bullet.owner === 'player') {
                for (const enemy of this.enemies) {
                    if (this.collisionSystem.checkCollision(bullet, enemy)) {
                        enemy.takeDamage(bullet.damage);
                        collision = true;
                        break;
                    }
                }
            }
            
            // 子弹与地图碰撞
            if (this.map.checkCollision(bullet)) {
                collision = true;
            }
            
            if (collision) {
                this.bullets.splice(i, 1);
            }
        }
        
        // 坦克与道具碰撞
        if (this.player) {
            for (let i = this.powerUps.length - 1; i >= 0; i--) {
                const powerUp = this.powerUps[i];
                if (this.collisionSystem.checkCollision(this.player, powerUp)) {
                    this.player.applyPowerUp(powerUp);
                    this.powerUps.splice(i, 1);
                    this.audioManager.playSound('powerUp');
                }
            }
        }
    }

    /**
     * 渲染游戏
     */
    render() {
        if (!this.isInitialized) return;
        
        // 清空画布
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 渲染地图
        this.map.render(this.context);
        
        // 只在游戏进行时渲染游戏对象
        if (this.stateManager.isPlaying() || this.stateManager.isPaused()) {
            this.renderGameObjects();
        }
        
        // 渲染特效
        this.effectsSystem.render();
        
        // 渲染UI
        this.uiManager.render();
    }

    /**
     * 渲染游戏对象
     */
    renderGameObjects() {
        // 渲染玩家
        if (this.player) {
            this.player.render(this.context);
        }
        
        // 渲染敌人
        for (const enemy of this.enemies) {
            enemy.render(this.context);
        }
        
        // 渲染子弹
        for (const bullet of this.bullets) {
            bullet.render(this.context);
        }
        
        // 渲染道具
        for (const powerUp of this.powerUps) {
            powerUp.render(this.context);
        }
        
        // 渲染爆炸效果
        for (const explosion of this.explosions) {
            explosion.render(this.context);
        }
    }

    /**
     * 启动游戏
     */
    start() {
        if (!this.isInitialized) {
            throw new Error('游戏未初始化完成');
        }
        
        this.isRunning = true;
        this.engine.start();
        Logger.info('游戏已启动');
    }

    /**
     * 停止游戏
     */
    stop() {
        this.isRunning = false;
        this.engine.stop();
        Logger.info('游戏已停止');
    }

    /**
     * 销毁游戏
     */
    dispose() {
        // 停止游戏循环
        this.stop();
        
        // 清理所有管理器
        this.stateManager?.dispose();
        this.uiManager?.dispose();
        this.controlManager?.dispose();
        this.resourceManager?.dispose();
        this.inputManager?.dispose();
        this.audioManager?.dispose();
        
        // 清理游戏系统
        this.collisionSystem?.dispose();
        this.effectsSystem?.dispose();
        
        // 清理游戏对象
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.powerUps = [];
        this.explosions = [];
        
        Logger.info('游戏已销毁');
    }
}














