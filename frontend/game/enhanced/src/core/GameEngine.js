
/**
 * 增强版游戏引擎核心类
 * 采用现代面向对象设计模式，提供完整的游戏框架
 */

import { EventEmitter } from '../utils/EventEmitter.js';
import { ResourceManager } from '../managers/ResourceManager.js';
import { SceneManager } from '../managers/SceneManager.js';
import { InputManager } from '../managers/InputManager.js';
import { AudioManager } from '../managers/AudioManager.js';
import { UIManager } from '../managers/UIManager.js';
import { PerformanceMonitor } from '../utils/PerformanceMonitor.js';
import { Logger } from '../utils/Logger.js';

/**
 * 游戏状态枚举
 */
export const GameState = {
    INITIALIZING: 'initializing',
    LOADING: 'loading',
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over',
    LEVEL_COMPLETE: 'level_complete',
    SETTINGS: 'settings',
    ACHIEVEMENTS: 'achievements',
    LEVEL_SELECT: 'level_select',
    INSTRUCTIONS: 'instructions'
};

/**
 * 游戏引擎核心类
 * 负责整个游戏的生命周期管理和各个系统的协调
 */
export class GameEngine extends EventEmitter {
    constructor(canvas, options = {}) {
        super();
        
        // 核心组件
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.options = {
            targetFPS: 60,
            enableDebug: false,
            enablePerformanceMonitor: true,
            autoResize: true,
            ...options
        };

        // 游戏状态
        this.currentState = GameState.INITIALIZING;
        this.previousState = null;
        this.isRunning = false;
        this.isPaused = false;
        this.isInitialized = false;

        // 时间管理
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.totalTime = 0;
        this.frameInterval = 1000 / this.options.targetFPS;
        this.accumulator = 0;

        // 管理器系统
        this.managers = new Map();
        this.resourceManager = null;
        this.sceneManager = null;
        this.inputManager = null;
        this.audioManager = null;
        this.uiManager = null;

        // 工具系统
        this.performanceMonitor = null;
        this.logger = null;

        // 游戏数据
        this.gameData = {
            version: '2.0.0',
            player: {
                score: 0,
                lives: 3,
                level: 1,
                highScore: 0,
                totalKills: 0,
                totalPlayTime: 0,
                achievements: new Set(),
                unlockedLevels: new Set([1])
            },
            settings: {
                soundEnabled: true,
                musicEnabled: true,
                soundVolume: 0.7,
                musicVolume: 0.5,
                difficulty: 'normal',
                showFPS: false,
                showMiniMap: true,
                controlScheme: 'both',
                language: 'zh-CN'
            },
            statistics: {
                gamesPlayed: 0,
                totalScore: 0,
                bestTime: 0,
                longestSurvival: 0
            }
        };

        // 错误处理
        this.errorHandler = this.handleError.bind(this);
        window.addEventListener('error', this.errorHandler);
        window.addEventListener('unhandledrejection', this.errorHandler);

        // 生命周期事件绑定
        this.bindLifecycleEvents();
        
        // 初始化日志系统
        this.logger = new Logger('GameEngine', this.options.enableDebug);
        this.logger.info('游戏引擎实例创建完成');
    }

    /**
     * 初始化游戏引擎
     */
    async initialize() {
        try {
            this.logger.info('开始初始化游戏引擎...');
            this.changeState(GameState.INITIALIZING);

            // 加载保存的数据
            await this.loadGameData();

            // 初始化核心管理器
            await this.initializeManagers();

            // 初始化性能监控
            if (this.options.enablePerformanceMonitor) {
                this.performanceMonitor = new PerformanceMonitor();
                this.performanceMonitor.start();
            }

            // 设置画布
            this.setupCanvas();

            // 绑定事件监听器
            this.bindEventListeners();

            // 标记为已初始化
            this.isInitialized = true;

            this.logger.info('游戏引擎初始化完成');
            this.emit('initialized');

            // 切换到加载状态
            this.changeState(GameState.LOADING);

            return true;

        } catch (error) {
            this.logger.error('游戏引擎初始化失败:', error);
            this.handleError(error);
            return false;
        }
    }

    /**
     * 初始化管理器系统
     */
    async initializeManagers() {
        this.logger.info('初始化管理器系统...');

        // 资源管理器
        this.resourceManager = new ResourceManager();
        this.managers.set('resource', this.resourceManager);

        // 场景管理器
        this.sceneManager = new SceneManager(this);
        this.managers.set('scene', this.sceneManager);

        // 输入管理器
        this.inputManager = new InputManager(this.canvas);
        this.managers.set('input', this.inputManager);

        // 音频管理器
        this.audioManager = new AudioManager();
        this.managers.set('audio', this.audioManager);

        // UI管理器
        this.uiManager = new UIManager(this);
        this.managers.set('ui', this.uiManager);

        // 初始化所有管理器
        for (const [name, manager] of this.managers) {
            if (manager.initialize) {
                await manager.initialize();
                this.logger.info(`${name} 管理器初始化完成`);
            }
        }

        this.logger.info('所有管理器初始化完成');
    }

    /**
     * 设置画布
     */
    setupCanvas() {
        // 设置画布样式
        this.canvas.style.imageRendering = 'pixelated';
        
        // 自动调整画布大小
        if (this.options.autoResize) {
            this.resizeCanvas();
        }

        // 设置渲染上下文
        this.context.imageSmoothingEnabled = false;
        
        this.logger.info(`画布设置完成: ${this.canvas.width}x${this.canvas.height}`);
    }

    /**
     * 调整画布大小
     */
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // 保持16:9的宽高比
        const aspectRatio = 16 / 9;
        let width = rect.width;
        let height = width / aspectRatio;
        
        if (height > rect.height) {
            height = rect.height;
            width = height * aspectRatio;
        }
        
        this.canvas.width = Math.floor(width);
        this.canvas.height = Math.floor(height);
        
        // 通知所有管理器画布大小改变
        this.emit('canvasResize', { width: this.canvas.width, height: this.canvas.height });
    }

    /**
     * 绑定事件监听器
     */
    bindEventListeners() {
        // 窗口大小改变
        if (this.options.autoResize) {
            window.addEventListener('resize', () => {
                this.resizeCanvas();
            });
        }

        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.currentState === GameState.PLAYING) {
                this.pauseGame();
            }
        });

        // 窗口失去焦点
        window.addEventListener('blur', () => {
            if (this.currentState === GameState.PLAYING) {
                this.pauseGame();
            }
        });

        this.logger.info('事件监听器绑定完成');
    }

    /**
     * 绑定生命周期事件
     */
    bindLifecycleEvents() {
        // 页面卸载时保存数据
        window.addEventListener('beforeunload', () => {
            this.saveGameData();
            this.cleanup();
        });
    }

    /**
     * 开始游戏循环
     */
    start() {
        if (!this.isInitialized) {
            this.logger.error('游戏引擎未初始化，无法启动');
            return false;
        }

        if (this.isRunning) {
            this.logger.warn('游戏循环已在运行');
            return true;
        }

        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.gameLoop();

        this.logger.info('游戏循环已启动');
        this.emit('started');
        return true;
    }

    /**
     * 停止游戏循环
     */
    stop() {
        this.isRunning = false;
        this.logger.info('游戏循环已停止');
        this.emit('stopped');
    }

    /**
     * 暂停游戏
     */
    pauseGame() {
        if (this.currentState === GameState.PLAYING) {
            this.isPaused = true;
            this.changeState(GameState.PAUSED);
            this.logger.info('游戏已暂停');
        }
    }

    /**
     * 恢复游戏
     */
    resumeGame() {
        if (this.currentState === GameState.PAUSED) {
            this.isPaused = false;
            this.changeState(GameState.PLAYING);
            this.logger.info('游戏已恢复');
        }
    }

    /**
     * 游戏主循环
     */
    gameLoop() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        this.deltaTime = Math.min(currentTime - this.lastFrameTime, 100); // 限制最大帧时间
        this.lastFrameTime = currentTime;
        this.totalTime += this.deltaTime;

        // 固定时间步长更新
        this.accumulator += this.deltaTime;
        const fixedDeltaTime = 16.67; // 60fps

        while (this.accumulator >= fixedDeltaTime) {
            this.update(fixedDeltaTime / 1000); // 转换为秒
            this.accumulator -= fixedDeltaTime;
        }

        // 渲染
        this.render();

        // 更新性能监控
        if (this.performanceMonitor) {
            this.performanceMonitor.update(currentTime);
        }

        // 继续下一帧
        requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * 更新游戏逻辑
     */
    update(deltaTime) {
        try {
            // 更新输入管理器
            if (this.inputManager) {
                this.inputManager.update(deltaTime);
            }

            // 更新当前场景
            if (this.sceneManager) {
                this.sceneManager.update(deltaTime);
            }

            // 更新UI管理器
            if (this.uiManager) {
                this.uiManager.update(deltaTime);
            }

            // 更新音频管理器
            if (this.audioManager) {
                this.audioManager.update(deltaTime);
            }

            // 发送更新事件
            this.emit('update', deltaTime);

        } catch (error) {
            this.logger.error('更新过程中发生错误:', error);
            this.handleError(error);
        }
    }

    /**
     * 渲染游戏画面
     */
    render() {
        try {
            // 清空画布
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // 渲染当前场景
            if (this.sceneManager) {
                this.sceneManager.render(this.context);
            }

            // 渲染UI
            if (this.uiManager) {
                this.uiManager.render(this.context);
            }

            // 渲染调试信息
            if (this.options.enableDebug || this.gameData.settings.showFPS) {
                this.renderDebugInfo();
            }

            // 发送渲染事件
            this.emit('render', this.context);

        } catch (error) {
            this.logger.error('渲染过程中发生错误:', error);
            this.handleError(error);
        }
    }

    /**
     * 渲染调试信息
     */
    renderDebugInfo() {
        if (!this.performanceMonitor) return;

        const stats = this.performanceMonitor.getStats();
        const ctx = this.context;

        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 200, 100);

        ctx.fillStyle = '#00ff00';
        ctx.font = '12px monospace';
        ctx.fillText(`FPS: ${stats.fps}`, 20, 30);
        ctx.fillText(`Frame Time: ${stats.frameTime.toFixed(2)}ms`, 20, 45);
        ctx.fillText(`Update Time: ${stats.updateTime.toFixed(2)}ms`, 20, 60);
        ctx.fillText(`Render Time: ${stats.renderTime.toFixed(2)}ms`, 20, 75);
        ctx.fillText(`State: ${this.currentState}`, 20, 90);
        ctx.fillText(`Objects: ${this.getObjectCount()}`, 20, 105);

        ctx.restore();
    }

    /**
     * 获取当前对象数量
     */
    getObjectCount() {
        if (this.sceneManager && this.sceneManager.currentScene) {
            return this.sceneManager.currentScene.getObjectCount();
        }
        return 0;
    }

    /**
     * 改变游戏状态
     */
    changeState(newState, data = null) {
        if (this.currentState === newState) return;

        this.logger.info(`状态切换: ${this.currentState} -> ${newState}`);

        const oldState = this.currentState;
        this.previousState = oldState;
        this.currentState = newState;

        // 发送状态改变事件
        this.emit('stateChange', {
            from: oldState,
            to: newState,
            data: data
        });

        // 通知场景管理器状态改变
        if (this.sceneManager) {
            this.sceneManager.onStateChange(newState, oldState, data);
        }

        // 通知UI管理器状态改变
        if (this.uiManager) {
            this.uiManager.onStateChange(newState, oldState, data);
        }
    }

    /**
     * 加载游戏数据
     */
    async loadGameData() {
        try {
            const savedData = localStorage.getItem('tankBattle_enhanced_data');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                
                // 合并保存的数据，保留默认值
                this.gameData = {
                    ...this.gameData,
                    ...parsed,
                    player: { ...this.gameData.player, ...parsed.player },
                    settings: { ...this.gameData.settings, ...parsed.settings },
                    statistics: { ...this.gameData.statistics, ...parsed.statistics }
                };

                // 转换 Set 类型的数据
                if (parsed.player?.achievements) {
                    this.gameData.player.achievements = new Set(parsed.player.achievements);
                }
                if (parsed.player?.unlockedLevels) {
                    this.gameData.player.unlockedLevels = new Set(parsed.player.unlockedLevels);
                }

                this.logger.info('游戏数据加载完成');
            }
        } catch (error) {
            this.logger.error('加载游戏数据失败:', error);
            // 使用默认数据
        }
    }

    /**
     * 保存游戏数据
     */
    saveGameData() {
        try {
            // 转换 Set 为数组以便序列化
            const dataToSave = {
                ...this.gameData,
                player: {
                    ...this.gameData.player,
                    achievements: Array.from(this.gameData.player.achievements),
                    unlockedLevels: Array.from(this.gameData.player.unlockedLevels)
                }
            };

            localStorage.setItem('tankBattle_enhanced_data', JSON.stringify(dataToSave));
            this.logger.info('游戏数据保存完成');
        } catch (error) {
            this.logger.error('保存游戏数据失败:', error);
        }
    }

    /**
     * 重置游戏数据
     */
    resetGameData() {
        this.gameData.player = {
            score: 0,
            lives: 3,
            level: 1,
            highScore: this.gameData.player.highScore, // 保留最高分
            totalKills: 0,
            totalPlayTime: 0,
            achievements: this.gameData.player.achievements, // 保留成就
            unlockedLevels: this.gameData.player.unlockedLevels // 保留解锁关卡
        };

        this.logger.info('游戏数据已重置');
        this.emit('dataReset');
    }

    /**
     * 获取管理器
     */
    getManager(name) {
        return this.managers.get(name);
    }

    /**
     * 获取游戏数据
     */
    getGameData() {
        return { ...this.gameData };
    }

    /**
     * 更新游戏数据
     */
    updateGameData(path, value) {
        const keys = path.split('.');
        let obj = this.gameData;
        
        for (let i = 0; i < keys.length - 1; i++) {
            obj = obj[keys[i]];
        }
        
        obj[keys[keys.length - 1]] = value;
        this.emit('dataUpdate', { path, value });
    }

    /**
     * 解锁成就
     */
    unlockAchievement(achievementId) {
        if (!this.gameData.player.achievements.has(achievementId)) {
            this.gameData.player.achievements.add(achievementId);
            this.emit('achievementUnlocked', achievementId);
            this.logger.info(`成就解锁: ${achievementId}`);
            return true;
        }
        return false;
    }

    /**
     * 解锁关卡
     */
    unlockLevel(levelId) {
        if (!this.gameData.player.unlockedLevels.has(levelId)) {
            this.gameData.player.unlockedLevels.add(levelId);
            this.emit('levelUnlocked', levelId);
            this.logger.info(`关卡解锁: ${levelId}`);
            return true;
        }
        return false;
    }

    /**
     * 错误处理
     */
    handleError(error) {
        this.logger.error('游戏引擎错误:', error);
        this.emit('error', error);

        // 尝试恢复
        if (this.currentState === GameState.PLAYING) {
            this.pauseGame();
        }
    }

    /**
     * 清理资源
     */
    cleanup() {
        this.logger.info('开始清理游戏引擎资源...');

        // 停止游戏循环
        this.stop();

        // 保存游戏数据
        this.saveGameData();

        // 清理所有管理器
        for (const [name, manager] of this.managers) {
            if (manager.cleanup) {
                manager.cleanup();
                this.logger.info(`${name} 管理器已清理`);
            }
        }

        // 清理性能监控
        if (this.performanceMonitor) {
            this.performanceMonitor.stop();
        }

        // 移除事件监听器
        window.removeEventListener('error', this.errorHandler);
        window.removeEventListener('unhandledrejection', this.errorHandler);

        // 清理事件监听器
        this.removeAllListeners();

        this.logger.info('游戏引擎资源清理完成');
    }

    /**
     * 获取引擎信息
     */
    getEngineInfo() {
        return {
            version: this.gameData.version,
            state: this.currentState,
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            totalTime: this.totalTime,
            frameRate: this.performanceMonitor ? this.performanceMonitor.getStats().fps : 0
        };
    }
}

