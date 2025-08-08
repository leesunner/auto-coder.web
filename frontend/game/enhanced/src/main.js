













import { Game } from './Game.js';
import { Logger } from './utils/Logger.js';
import { DebugConsole } from './debug/DebugConsole.js';
import { PerformanceOptimizer } from './optimization/PerformanceOptimizer.js';

/**
 * 游戏启动器
 * 负责初始化和启动整个坦克大战游戏
 */
class GameLauncher {
    constructor() {
        this.game = null;
        this.debugConsole = null;
        this.performanceOptimizer = null;
        this.isInitialized = false;
        
        // 游戏配置
        this.config = {
            canvas: {
                width: 800,
                height: 600,
                backgroundColor: '#000000'
            },
            game: {
                targetFPS: 60,
                enableDebug: true,
                enableOptimization: true,
                autoStart: true
            },
            controls: {
                player1: {
                    up: 'ArrowUp',
                    down: 'ArrowDown',
                    left: 'ArrowLeft',
                    right: 'ArrowRight',
                    fire: 'Space'
                },
                player2: {
                    up: 'KeyW',
                    down: 'KeyS',
                    left: 'KeyA',
                    right: 'KeyD',
                    fire: 'KeyF'
                }
            },
            audio: {
                enabled: true,
                volume: 0.7,
                musicVolume: 0.5,
                sfxVolume: 0.8
            },
            graphics: {
                quality: 'high',
                particles: true,
                shadows: true,
                antiAliasing: true
            }
        };
        
        // 绑定事件
        this.bindEvents();
    }

    /**
     * 绑定全局事件
     */
    bindEvents() {
        // 页面加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
        
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (this.game) {
                if (document.hidden) {
                    this.game.pauseGame();
                } else {
                    this.game.resumeGame();
                }
            }
        });
        
        // 窗口大小变化
        window.addEventListener('resize', () => {
            if (this.game) {
                this.game.handleResize();
            }
        });
        
        // 页面卸载
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
        
        // 错误处理
        window.addEventListener('error', (event) => {
            Logger.error('全局错误:', event.error);
            this.handleError(event.error);
        });
        
        // 未处理的Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            Logger.error('未处理的Promise拒绝:', event.reason);
            this.handleError(event.reason);
        });
    }

    /**
     * 初始化游戏
     */
    async init() {
        try {
            Logger.info('开始初始化坦克大战游戏...');
            
            // 显示加载界面
            this.showLoadingScreen();
            
            // 检查浏览器兼容性
            if (!this.checkCompatibility()) {
                this.showCompatibilityError();
                return;
            }
            
            // 创建游戏画布
            const canvas = this.createCanvas();
            
            // 初始化游戏实例
            this.game = new Game(canvas, this.config);
            
            // 初始化调试控制台
            if (this.config.game.enableDebug) {
                this.debugConsole = new DebugConsole(this.game);
                this.debugConsole.enable();
            }
            
            // 初始化性能优化器
            if (this.config.game.enableOptimization) {
                this.performanceOptimizer = new PerformanceOptimizer(this.game);
            }
            
            // 加载游戏资源
            await this.loadResources();
            
            // 初始化游戏
            await this.game.initialize();
            
            // 隐藏加载界面
            this.hideLoadingScreen();
            
            // 显示主菜单
            this.showMainMenu();
            
            this.isInitialized = true;
            
            Logger.info('游戏初始化完成!');
            
            // 自动开始游戏（如果启用）
            if (this.config.game.autoStart) {
                setTimeout(() => this.startGame(), 1000);
            }
            
        } catch (error) {
            Logger.error('游戏初始化失败:', error);
            this.showInitError(error);
        }
    }

    /**
     * 检查浏览器兼容性
     */
    checkCompatibility() {
        const requirements = [
            {
                name: 'Canvas API',
                check: () => !!document.createElement('canvas').getContext
            },
            {
                name: 'Web Audio API',
                check: () => !!(window.AudioContext || window.webkitAudioContext)
            },
            {
                name: 'requestAnimationFrame',
                check: () => !!window.requestAnimationFrame
            },
            {
                name: 'ES6 Classes',
                check: () => {
                    try {
                        eval('class Test {}');
                        return true;
                    } catch (e) {
                        return false;
                    }
                }
            },
            {
                name: 'ES6 Modules',
                check: () => 'noModule' in document.createElement('script')
            }
        ];
        
        const unsupported = requirements.filter(req => !req.check());
        
        if (unsupported.length > 0) {
            Logger.error('浏览器不支持以下功能:', unsupported.map(req => req.name));
            return false;
        }
        
        return true;
    }

    /**
     * 创建游戏画布
     */
    createCanvas() {
        let canvas = document.getElementById('gameCanvas');
        
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'gameCanvas';
            canvas.width = this.config.canvas.width;
            canvas.height = this.config.canvas.height;
            canvas.style.border = '2px solid #333';
            canvas.style.backgroundColor = this.config.canvas.backgroundColor;
            canvas.style.display = 'block';
            canvas.style.margin = '0 auto';
            
            // 添加到游戏容器
            const gameContainer = document.getElementById('gameContainer');
            if (gameContainer) {
                gameContainer.appendChild(canvas);
            } else {
                document.body.appendChild(canvas);
            }
        }
        
        return canvas;
    }

    /**
     * 加载游戏资源
     */
    async loadResources() {
        const loadingProgress = document.getElementById('loadingProgress');
        const loadingText = document.getElementById('loadingText');
        
        const resources = [
            { name: '纹理资源', loader: () => this.loadTextures() },
            { name: '音频资源', loader: () => this.loadAudio() },
            { name: '关卡数据', loader: () => this.loadLevels() },
            { name: '配置文件', loader: () => this.loadConfigs() }
        ];
        
        let loaded = 0;
        
        for (const resource of resources) {
            if (loadingText) {
                loadingText.textContent = `正在加载 ${resource.name}...`;
            }
            
            try {
                await resource.loader();
                loaded++;
                
                if (loadingProgress) {
                    const progress = (loaded / resources.length) * 100;
                    loadingProgress.style.width = `${progress}%`;
                }
                
                Logger.info(`已加载: ${resource.name}`);
            } catch (error) {
                Logger.warn(`加载失败: ${resource.name}`, error);
            }
        }
    }

    /**
     * 加载纹理资源
     */
    async loadTextures() {
        // 这里可以预加载纹理
        return new Promise(resolve => {
            setTimeout(resolve, 200); // 模拟加载时间
        });
    }

    /**
     * 加载音频资源
     */
    async loadAudio() {
        // 这里可以预加载音频
        return new Promise(resolve => {
            setTimeout(resolve, 300); // 模拟加载时间
        });
    }

    /**
     * 加载关卡数据
     */
    async loadLevels() {
        // 这里可以加载关卡配置
        return new Promise(resolve => {
            setTimeout(resolve, 150); // 模拟加载时间
        });
    }

    /**
     * 加载配置文件
     */
    async loadConfigs() {
        // 这里可以加载游戏配置
        return new Promise(resolve => {
            setTimeout(resolve, 100); // 模拟加载时间
        });
    }

    /**
     * 显示加载界面
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        } else {
            // 创建加载界面
            const loading = document.createElement('div');
            loading.id = 'loadingScreen';
            loading.innerHTML = `
                <div class="loading-container">
                    <h1>坦克大战</h1>
                    <div class="loading-bar">
                        <div id="loadingProgress" class="loading-progress"></div>
                    </div>
                    <p id="loadingText">正在初始化...</p>
                </div>
            `;
            loading.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(45deg, #1a1a1a, #2d2d2d);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                font-family: Arial, sans-serif;
                color: #fff;
            `;
            
            const style = document.createElement('style');
            style.textContent = `
                .loading-container {
                    text-align: center;
                }
                .loading-container h1 {
                    font-size: 3em;
                    margin-bottom: 30px;
                    color: #00ff00;
                    text-shadow: 0 0 10px #00ff00;
                }
                .loading-bar {
                    width: 300px;
                    height: 10px;
                    background: #333;
                    border-radius: 5px;
                    overflow: hidden;
                    margin: 20px auto;
                    border: 2px solid #555;
                }
                .loading-progress {
                    height: 100%;
                    background: linear-gradient(90deg, #00ff00, #ffff00);
                    width: 0%;
                    transition: width 0.3s ease;
                }
                #loadingText {
                    margin-top: 20px;
                    font-size: 1.2em;
                    color: #ccc;
                }
            `;
            
            document.head.appendChild(style);
            document.body.appendChild(loading);
        }
    }

    /**
     * 隐藏加载界面
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    /**
     * 显示主菜单
     */
    showMainMenu() {
        const menuScreen = document.getElementById('mainMenu');
        if (menuScreen) {
            menuScreen.style.display = 'flex';
        } else {
            // 创建主菜单
            const menu = document.createElement('div');
            menu.id = 'mainMenu';
            menu.innerHTML = `
                <div class="menu-container">
                    <h1>坦克大战</h1>
                    <div class="menu-buttons">
                        <button id="startGame" class="menu-btn">开始游戏</button>
                        <button id="showSettings" class="menu-btn">设置</button>
                        <button id="showControls" class="menu-btn">操作说明</button>
                        <button id="showCredits" class="menu-btn">制作人员</button>
                    </div>
                </div>
            `;
            
            menu.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(45deg, #1a1a1a, #2d2d2d);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9998;
                font-family: Arial, sans-serif;
                color: #fff;
            `;
            
            const menuStyle = document.createElement('style');
            menuStyle.textContent = `
                .menu-container {
                    text-align: center;
                }
                .menu-container h1 {
                    font-size: 4em;
                    margin-bottom: 50px;
                    color: #00ff00;
                    text-shadow: 0 0 20px #00ff00;
                }
                .menu-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .menu-btn {
                    padding: 15px 40px;
                    font-size: 1.5em;
                    background: linear-gradient(45deg, #333, #555);
                    color: #fff;
                    border: 2px solid #00ff00;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    font-weight: bold;
                }
                .menu-btn:hover {
                    background: linear-gradient(45deg, #555, #777);
                    box-shadow: 0 0 20px #00ff00;
                    transform: translateY(-2px);
                }
                .menu-btn:active {
                    transform: translateY(0);
                }
            `;
            
            document.head.appendChild(menuStyle);
            document.body.appendChild(menu);
            
            // 绑定菜单事件
            this.bindMenuEvents();
        }
    }

    /**
     * 绑定菜单事件
     */
    bindMenuEvents() {
        document.getElementById('startGame')?.addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('showSettings')?.addEventListener('click', () => {
            this.showSettings();
        });
        
        document.getElementById('showControls')?.addEventListener('click', () => {
            this.showControls();
        });
        
        document.getElementById('showCredits')?.addEventListener('click', () => {
            this.showCredits();
        });
    }

    /**
     * 开始游戏
     */
    startGame() {
        if (!this.game || !this.isInitialized) {
            Logger.error('游戏未初始化');
            return;
        }
        
        // 隐藏菜单
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) {
            mainMenu.style.display = 'none';
        }
        
        // 启动游戏
        this.game.startGame();
        
        Logger.info('游戏开始!');
    }

    /**
     * 显示设置界面
     */
    showSettings() {
        // TODO: 实现设置界面
        alert('设置功能开发中...');
    }

    /**
     * 显示操作说明
     */
    showControls() {
        const controls = `
        操作说明:
        
        玩家1:
        ↑↓←→ - 移动坦克
        空格键 - 发射子弹
        
        玩家2:
        WASD - 移动坦克
        F键 - 发射子弹
        
        调试功能:
        F12 或 Ctrl+` - 打开调试控制台
        P键 - 暂停/恢复游戏
        R键 - 重新开始游戏
        `;
        
        alert(controls);
    }

    /**
     * 显示制作人员
     */
    showCredits() {
        const credits = `
        坦克大战 - 增强版
        
        开发: AI Assistant
        引擎: 自制JavaScript游戏引擎
        图形: Canvas 2D API
        音频: Web Audio API
        
        特性:
        - 面向对象设计
        - 智能AI系统
        - 性能优化
        - 调试控制台
        - 关卡系统
        - 道具系统
        
        感谢您的游玩!
        `;
        
        alert(credits);
    }

    /**
     * 显示兼容性错误
     */
    showCompatibilityError() {
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <h1>浏览器不兼容</h1>
            <p>抱歉，您的浏览器不支持运行此游戏所需的功能。</p>
            <p>请使用现代浏览器，如：</p>
            <ul>
                <li>Chrome 60+</li>
                <li>Firefox 55+</li>
                <li>Safari 11+</li>
                <li>Edge 79+</li>
            </ul>
        `;
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
            text-align: center;
            font-family: Arial, sans-serif;
            z-index: 10000;
        `;
        document.body.appendChild(errorDiv);
    }

    /**
     * 显示初始化错误
     */
    showInitError(error) {
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <h1>游戏初始化失败</h1>
            <p>游戏在初始化过程中遇到错误：</p>
            <pre>${error.message}</pre>
            <button onclick="location.reload()">重新加载</button>
        `;
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
            text-align: center;
            font-family: Arial, sans-serif;
            z-index: 10000;
            max-width: 500px;
        `;
        document.body.appendChild(errorDiv);
    }

    /**
     * 处理错误
     */
    handleError(error) {
        if (this.debugConsole) {
            this.debugConsole.log(`错误: ${error.message}`, 'error');
        }
        
        // 可以添加错误上报逻辑
    }

    /**
     * 清理资源
     */
    cleanup() {
        if (this.game) {
            this.game.dispose();
        }
        
        if (this.debugConsole) {
            this.debugConsole.dispose();
        }
        
        if (this.performanceOptimizer) {
            this.performanceOptimizer.dispose();
        }
        
        Logger.info('游戏资源已清理');
    }

    /**
     * 获取游戏实例
     */
    getGame() {
        return this.game;
    }

    /**
     * 获取调试控制台
     */
    getDebugConsole() {
        return this.debugConsole;
    }

    /**
     * 获取性能优化器
     */
    getPerformanceOptimizer() {
        return this.performanceOptimizer;
    }
}

// 创建全局游戏启动器实例
const gameLauncher = new GameLauncher();

// 导出以供外部使用
window.TankGameLauncher = gameLauncher;

// 开发环境下的全局访问
if (typeof window !== 'undefined') {
    window.game = () => gameLauncher.getGame();
    window.debug = () => gameLauncher.getDebugConsole();
    window.optimizer = () => gameLauncher.getPerformanceOptimizer();
}

Logger.info('坦克大战游戏启动器已加载');














