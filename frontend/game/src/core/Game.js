

/**
 * 游戏引擎核心类
 * 负责游戏的主循环、状态管理和整体协调
 */

import { Renderer } from './Renderer.js';
import { MenuState } from '../states/MenuState.js';
import { PlayingState } from '../states/PlayingState.js';
import { PausedState } from '../states/PausedState.js';
import { GameOverState } from '../states/GameOverState.js';
import { GameMap } from '../map/GameMap.js';

/**
 * 游戏状态枚举
 */
export const GameStates = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over',
    LOADING: 'loading'
};

/**
 * 游戏难度枚举
 */
export const GameDifficulty = {
    EASY: 'easy',
    NORMAL: 'normal',
    HARD: 'hard'
};

/**
 * 游戏主控制器类
 */
export class Game {
    constructor(canvas, inputManager, audioManager) {
        // 核心组件
        this.canvas = canvas;
        this.inputManager = inputManager;
        this.audioManager = audioManager;
        this.renderer = null;
        this.gameMap = null;

        // 游戏状态
        this.currentState = null;
        this.states = new Map();
        this.gameState = GameStates.MENU;
        this.previousState = null;

        // 游戏循环
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;

        // 游戏数据
        this.gameData = {
            score: 0,
            lives: 3,
            level: 1,
            difficulty: GameDifficulty.NORMAL,
            highScore: parseInt(localStorage.getItem('tankBattle_highScore') || '0'),
            enemyTanksRemaining: 0,
            playerTank: null,
            enemyTanks: [],
            bullets: [],
            explosions: [],
            powerUps: []
        };

        // 游戏设置
        this.settings = {
            soundEnabled: true,
            musicEnabled: true,
            soundVolume: 0.7,
            musicVolume: 0.5
        };

        // 性能监控
        this.performanceStats = {
            fps: 0,
            frameCount: 0,
            lastFpsUpdate: 0,
            renderTime: 0,
            updateTime: 0
        };

        // 绑定方法上下文
        this.gameLoop = this.gameLoop.bind(this);
        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
        this.handleResize = this.handleResize.bind(this);
    }

    /**
     * 初始化游戏
     */
    async init() {
        console.log('初始化游戏引擎...');

        try {
            // 初始化渲染器
            this.renderer = new Renderer(this.canvas);
            await this.renderer.init();

            // 初始化游戏地图
            this.gameMap = new GameMap(this.canvas.width, this.canvas.height);
            await this.gameMap.init();

            // 初始化游戏状态
            this.initializeStates();

            // 设置初始状态
            this.changeState(GameStates.MENU);

            // 设置输入事件监听
            this.setupInputHandlers();

            // 开始游戏循环
            this.startGameLoop();

            console.log('游戏引擎初始化完成');

        } catch (error) {
            console.error('游戏引擎初始化失败:', error);
            throw error;
        }
    }

    /**
     * 初始化所有游戏状态
     */
    initializeStates() {
        this.states.set(GameStates.MENU, new MenuState(this));
        this.states.set(GameStates.PLAYING, new PlayingState(this));
        this.states.set(GameStates.PAUSED, new PausedState(this));
        this.states.set(GameStates.GAME_OVER, new GameOverState(this));

        console.log('游戏状态初始化完成');
    }

    /**
     * 设置输入处理器
     */
    setupInputHandlers() {
        // 全局按键事件
        this.inputManager.onKeyPress('Escape', () => {
            this.handleEscapeKey();
        });

        this.inputManager.onKeyPress('KeyP', () => {
            this.togglePause();
        });

        // 游戏窗口失去焦点时自动暂停
        window.addEventListener('blur', () => {
            if (this.gameState === GameStates.PLAYING) {
                this.pauseGame();
            }
        });

        console.log('输入处理器设置完成');
    }

    /**
     * 开始游戏循环
     */
    startGameLoop() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastFrameTime = performance.now();
            requestAnimationFrame(this.gameLoop);
            console.log('游戏循环已启动');
        }
    }

    /**
     * 停止游戏循环
     */
    stopGameLoop() {
        this.isRunning = false;
        console.log('游戏循环已停止');
    }

    /**
     * 游戏主循环
     */
    gameLoop(currentTime) {
        if (!this.isRunning) return;

        // 计算帧时间
        this.deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        // 限制帧率
        if (this.deltaTime >= this.frameInterval) {
            // 更新性能统计
            this.updatePerformanceStats(currentTime);

            // 更新游戏逻辑
            const updateStartTime = performance.now();
            this.update(this.deltaTime / 1000); // 转换为秒
            this.performanceStats.updateTime = performance.now() - updateStartTime;

            // 渲染游戏画面
            const renderStartTime = performance.now();
            this.render();
            this.performanceStats.renderTime = performance.now() - renderStartTime;
        }

        // 继续下一帧
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * 更新游戏逻辑
     */
    update(deltaTime) {
        // 更新当前状态
        if (this.currentState && this.currentState.update) {
            this.currentState.update(deltaTime);
        }

        // 更新输入管理器
        this.inputManager.update();
    }

    /**
     * 渲染游戏画面
     */
    render() {
        // 清空画布
        this.renderer.clear();

        // 渲染当前状态
        if (this.currentState && this.currentState.render) {
            this.currentState.render(this.renderer);
        }

        // 渲染调试信息（开发模式）
        if (this.isDebugMode()) {
            this.renderDebugInfo();
        }
    }

    /**
     * 更新性能统计
     */
    updatePerformanceStats(currentTime) {
        this.performanceStats.frameCount++;

        if (currentTime - this.performanceStats.lastFpsUpdate >= 1000) {
            this.performanceStats.fps = this.performanceStats.frameCount;
            this.performanceStats.frameCount = 0;
            this.performanceStats.lastFpsUpdate = currentTime;
        }
    }

    /**
     * 渲染调试信息
     */
    renderDebugInfo() {
        const ctx = this.renderer.context;
        ctx.fillStyle = '#00ff00';
        ctx.font = '12px monospace';
        ctx.fillText(`FPS: ${this.performanceStats.fps}`, 10, this.canvas.height - 60);
        ctx.fillText(`Update: ${this.performanceStats.updateTime.toFixed(2)}ms`, 10, this.canvas.height - 45);
        ctx.fillText(`Render: ${this.performanceStats.renderTime.toFixed(2)}ms`, 10, this.canvas.height - 30);
        ctx.fillText(`State: ${this.gameState}`, 10, this.canvas.height - 15);
    }

    /**
     * 改变游戏状态
     */
    changeState(newState) {
        console.log(`状态切换: ${this.gameState} -> ${newState}`);

        // 退出当前状态
        if (this.currentState && this.currentState.exit) {
            this.currentState.exit();
        }

        // 保存前一个状态
        this.previousState = this.gameState;
        this.gameState = newState;

        // 获取新状态
        this.currentState = this.states.get(newState);

        // 进入新状态
        if (this.currentState && this.currentState.enter) {
            this.currentState.enter();
        }

        // 更新UI显示
        this.updateUIForState(newState);
    }

    /**
     * 根据状态更新UI显示
     */
    updateUIForState(state) {
        // 隐藏所有菜单
        const menus = ['mainMenu', 'pauseMenu', 'gameOverMenu', 'gameStatus'];
        menus.forEach(menuId => {
            const menu = document.getElementById(menuId);
            if (menu) {
                menu.classList.add('hidden');
            }
        });

        // 显示对应状态的UI
        switch (state) {
            case GameStates.MENU:
                this.showElement('mainMenu');
                break;
            case GameStates.PAUSED:
                this.showElement('pauseMenu');
                break;
            case GameStates.GAME_OVER:
                this.showElement('gameOverMenu');
                this.updateGameOverUI();
                break;
            case GameStates.PLAYING:
                // 游戏进行时显示分数板
                break;
        }
    }

    /**
     * 显示UI元素
     */
    showElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('hidden');
        }
    }

    /**
     * 隐藏UI元素
     */
    hideElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('hidden');
        }
    }

    /**
     * 更新游戏结束UI
     */
    updateGameOverUI() {
        const finalScoreElement = document.getElementById('finalScoreValue');
        const gameOverTitle = document.getElementById('gameOverTitle');

        if (finalScoreElement) {
            finalScoreElement.textContent = this.gameData.score;
        }

        if (gameOverTitle) {
            if (this.gameData.score > this.gameData.highScore) {
                gameOverTitle.textContent = '新纪录！';
                this.gameData.highScore = this.gameData.score;
                localStorage.setItem('tankBattle_highScore', this.gameData.score.toString());
            } else {
                gameOverTitle.textContent = '游戏结束';
            }
        }
    }

    /**
     * 开始新游戏
     */
    startNewGame() {
        console.log('开始新游戏');

        // 重置游戏数据
        this.resetGameData();

        // 切换到游戏状态
        this.changeState(GameStates.PLAYING);

        // 播放游戏开始音效
        this.audioManager.playSound('gameStart');
    }

    /**
     * 重置游戏数据
     */
    resetGameData() {
        this.gameData.score = 0;
        this.gameData.lives = 3;
        this.gameData.level = 1;
        this.gameData.enemyTanksRemaining = 0;
        this.gameData.playerTank = null;
        this.gameData.enemyTanks = [];
        this.gameData.bullets = [];
        this.gameData.explosions = [];
        this.gameData.powerUps = [];

        this.updateScoreDisplay();
    }

    /**
     * 暂停游戏
     */
    pauseGame() {
        if (this.gameState === GameStates.PLAYING) {
            this.changeState(GameStates.PAUSED);
        }
    }

    /**
     * 恢复游戏
     */
    resumeGame() {
        if (this.gameState === GameStates.PAUSED) {
            this.changeState(GameStates.PLAYING);
        }
    }

    /**
     * 切换暂停状态
     */
    togglePause() {
        if (this.gameState === GameStates.PLAYING) {
            this.pauseGame();
        } else if (this.gameState === GameStates.PAUSED) {
            this.resumeGame();
        }
    }

    /**
     * 重新开始游戏
     */
    restartGame() {
        console.log('重新开始游戏');
        this.startNewGame();
    }

    /**
     * 返回主菜单
     */
    goToMainMenu() {
        console.log('返回主菜单');
        this.changeState(GameStates.MENU);
    }

    /**
     * 游戏结束
     */
    gameOver(victory = false) {
        console.log(`游戏结束 - ${victory ? '胜利' : '失败'}`);

        // 播放游戏结束音效
        this.audioManager.playSound(victory ? 'victory' : 'gameOver');

        // 切换到游戏结束状态
        this.changeState(GameStates.GAME_OVER);
    }

    /**
     * 处理ESC键
     */
    handleEscapeKey() {
        switch (this.gameState) {
            case GameStates.PLAYING:
                this.pauseGame();
                break;
            case GameStates.PAUSED:
                this.goToMainMenu();
                break;
            default:
                // 其他状态下ESC键返回主菜单
                this.goToMainMenu();
                break;
        }
    }

    /**
     * 处理状态按钮点击
     */
    handleStatusButtonClick() {
        if (this.gameState === GameStates.GAME_OVER) {
            this.startNewGame();
        } else if (this.gameState === GameStates.PAUSED) {
            this.resumeGame();
        }
    }

    /**
     * 设置游戏难度
     */
    setDifficulty(difficulty) {
        this.gameData.difficulty = difficulty;
        console.log(`游戏难度设置为: ${difficulty}`);
    }

    /**
     * 更新分数显示
     */
    updateScoreDisplay() {
        const scoreElement = document.getElementById('playerScore');
        const livesElement = document.getElementById('playerLives');
        const levelElement = document.getElementById('currentLevel');

        if (scoreElement) {
            scoreElement.textContent = this.gameData.score;
        }

        if (livesElement) {
            livesElement.textContent = this.gameData.lives;
        }

        if (levelElement) {
            levelElement.textContent = this.gameData.level;
        }
    }

    /**
     * 添加分数
     */
    addScore(points) {
        this.gameData.score += points;
        this.updateScoreDisplay();
    }

    /**
     * 减少生命
     */
    loseLife() {
        this.gameData.lives--;
        this.updateScoreDisplay();

        if (this.gameData.lives <= 0) {
            this.gameOver(false);
        }
    }

    /**
     * 下一关
     */
    nextLevel() {
        this.gameData.level++;
        this.updateScoreDisplay();
        console.log(`进入第 ${this.gameData.level} 关`);
    }

    /**
     * 处理窗口大小改变
     */
    handleResize() {
        if (this.renderer) {
            this.renderer.handleResize();
        }
    }

    /**
     * 检查是否为调试模式
     */
    isDebugMode() {
        return localStorage.getItem('tankBattle_debug') === 'true';
    }

    /**
     * 清理资源
     */
    cleanup() {
        console.log('清理游戏资源...');

        // 停止游戏循环
        this.stopGameLoop();

        // 清理状态
        this.states.forEach(state => {
            if (state.cleanup) {
                state.cleanup();
            }
        });

        // 清理渲染器
        if (this.renderer) {
            this.renderer.cleanup();
        }

        // 清理音频
        if (this.audioManager) {
            this.audioManager.cleanup();
        }

        console.log('游戏资源清理完成');
    }

    /**
     * 获取游戏数据（只读）
     */
    getGameData() {
        return { ...this.gameData };
    }

    /**
     * 获取游戏设置（只读）
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * 获取性能统计（只读）
     */
    getPerformanceStats() {
        return { ...this.performanceStats };
    }
}

