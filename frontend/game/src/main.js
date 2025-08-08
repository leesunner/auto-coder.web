
/**
 * 坦克大战游戏主入口文件
 * 负责初始化游戏并启动游戏循环
 */

// 导入核心模块
import { Game } from './core/Game.js';
import { InputManager } from './core/InputManager.js';
import { AudioManager } from './core/AudioManager.js';

/**
 * 游戏应用类
 * 负责游戏的整体初始化和生命周期管理
 */
class GameApp {
    constructor() {
        this.game = null;
        this.inputManager = null;
        this.audioManager = null;
        this.isInitialized = false;
        
        // 绑定方法上下文
        this.init = this.init.bind(this);
        this.setupEventListeners = this.setupEventListeners.bind(this);
        this.showLoadingScreen = this.showLoadingScreen.bind(this);
        this.hideLoadingScreen = this.hideLoadingScreen.bind(this);
    }

    /**
     * 初始化游戏应用
     */
    async init() {
        try {
            console.log('开始初始化坦克大战游戏...');
            
            // 显示加载屏幕
            this.showLoadingScreen();
            
            // 初始化音频管理器
            this.updateLoadingProgress(20, '初始化音频系统...');
            this.audioManager = new AudioManager();
            await this.audioManager.init();
            
            // 初始化输入管理器
            this.updateLoadingProgress(40, '初始化输入系统...');
            this.inputManager = new InputManager();
            this.inputManager.init();
            
            // 获取游戏画布
            this.updateLoadingProgress(60, '初始化游戏引擎...');
            const canvas = document.getElementById('gameCanvas');
            if (!canvas) {
                throw new Error('无法找到游戏画布元素');
            }
            
            // 初始化游戏核心
            this.game = new Game(canvas, this.inputManager, this.audioManager);
            await this.game.init();
            
            // 设置事件监听器
            this.updateLoadingProgress(80, '设置游戏控制...');
            this.setupEventListeners();
            
            // 完成初始化
            this.updateLoadingProgress(100, '游戏准备就绪！');
            this.isInitialized = true;
            
            // 延迟隐藏加载屏幕
            setTimeout(() => {
                this.hideLoadingScreen();
                console.log('坦克大战游戏初始化完成！');
            }, 500);
            
        } catch (error) {
            console.error('游戏初始化失败:', error);
            this.showError('游戏初始化失败: ' + error.message);
        }
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 主菜单按钮
        const startGameBtn = document.getElementById('startGameBtn');
        const instructionsBtn = document.getElementById('instructionsBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        
        // 游戏控制按钮
        const resumeBtn = document.getElementById('resumeBtn');
        const restartBtn = document.getElementById('restartBtn');
        const mainMenuBtn = document.getElementById('mainMenuBtn');
        
        // 游戏结束按钮
        const playAgainBtn = document.getElementById('playAgainBtn');
        const backToMenuBtn = document.getElementById('backToMenuBtn');
        
        // 说明页面按钮
        const backFromInstructionsBtn = document.getElementById('backFromInstructionsBtn');
        
        // 设置页面按钮
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        const backFromSettingsBtn = document.getElementById('backFromSettingsBtn');
        
        // 状态按钮
        const statusButton = document.getElementById('statusButton');

        // 主菜单事件
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => {
                this.hideAllMenus();
                this.game.startNewGame();
            });
        }

        if (instructionsBtn) {
            instructionsBtn.addEventListener('click', () => {
                this.showInstructions();
            });
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }

        // 游戏控制事件
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                this.game.resumeGame();
            });
        }

        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.game.restartGame();
            });
        }

        if (mainMenuBtn) {
            mainMenuBtn.addEventListener('click', () => {
                this.game.goToMainMenu();
            });
        }

        // 游戏结束事件
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                this.game.startNewGame();
            });
        }

        if (backToMenuBtn) {
            backToMenuBtn.addEventListener('click', () => {
                this.game.goToMainMenu();
            });
        }

        // 说明页面事件
        if (backFromInstructionsBtn) {
            backFromInstructionsBtn.addEventListener('click', () => {
                this.showMainMenu();
            });
        }

        // 设置页面事件
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveSettings();
                this.showMainMenu();
            });
        }

        if (backFromSettingsBtn) {
            backFromSettingsBtn.addEventListener('click', () => {
                this.showMainMenu();
            });
        }

        // 状态按钮事件
        if (statusButton) {
            statusButton.addEventListener('click', () => {
                this.game.handleStatusButtonClick();
            });
        }

        // 设置滑块事件
        this.setupSettingsSliders();

        // 窗口事件
        window.addEventListener('beforeunload', () => {
            if (this.game) {
                this.game.cleanup();
            }
        });

        // 窗口大小改变事件
        window.addEventListener('resize', () => {
            if (this.game) {
                this.game.handleResize();
            }
        });

        console.log('事件监听器设置完成');
    }

    /**
     * 设置设置页面的滑块事件
     */
    setupSettingsSliders() {
        const soundVolumeSlider = document.getElementById('soundVolume');
        const musicVolumeSlider = document.getElementById('musicVolume');
        const soundVolumeValue = document.getElementById('soundVolumeValue');
        const musicVolumeValue = document.getElementById('musicVolumeValue');

        if (soundVolumeSlider && soundVolumeValue) {
            soundVolumeSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                soundVolumeValue.textContent = value + '%';
                if (this.audioManager) {
                    this.audioManager.setSoundVolume(value / 100);
                }
            });
        }

        if (musicVolumeSlider && musicVolumeValue) {
            musicVolumeSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                musicVolumeValue.textContent = value + '%';
                if (this.audioManager) {
                    this.audioManager.setMusicVolume(value / 100);
                }
            });
        }
    }

    /**
     * 显示加载屏幕
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    /**
     * 隐藏加载屏幕
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }

    /**
     * 更新加载进度
     */
    updateLoadingProgress(percentage, text) {
        const progressBar = document.getElementById('loadingProgress');
        const loadingText = document.getElementById('loadingText');
        
        if (progressBar) {
            progressBar.style.width = percentage + '%';
        }
        
        if (loadingText && text) {
            loadingText.textContent = text;
        }
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        const loadingText = document.getElementById('loadingText');
        if (loadingText) {
            loadingText.textContent = message;
            loadingText.style.color = '#e74c3c';
        }
    }

    /**
     * 隐藏所有菜单
     */
    hideAllMenus() {
        const menus = [
            'mainMenu', 'pauseMenu', 'gameOverMenu', 
            'instructionsMenu', 'settingsMenu', 'gameStatus'
        ];
        
        menus.forEach(menuId => {
            const menu = document.getElementById(menuId);
            if (menu) {
                menu.classList.add('hidden');
            }
        });
    }

    /**
     * 显示主菜单
     */
    showMainMenu() {
        this.hideAllMenus();
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) {
            mainMenu.classList.remove('hidden');
        }
    }

    /**
     * 显示游戏说明
     */
    showInstructions() {
        this.hideAllMenus();
        const instructionsMenu = document.getElementById('instructionsMenu');
        if (instructionsMenu) {
            instructionsMenu.classList.remove('hidden');
        }
    }

    /**
     * 显示设置菜单
     */
    showSettings() {
        this.hideAllMenus();
        const settingsMenu = document.getElementById('settingsMenu');
        if (settingsMenu) {
            settingsMenu.classList.remove('hidden');
        }
    }

    /**
     * 保存设置
     */
    saveSettings() {
        const soundVolume = document.getElementById('soundVolume').value;
        const musicVolume = document.getElementById('musicVolume').value;
        const difficulty = document.getElementById('difficulty').value;

        // 保存到本地存储
        localStorage.setItem('tankBattle_soundVolume', soundVolume);
        localStorage.setItem('tankBattle_musicVolume', musicVolume);
        localStorage.setItem('tankBattle_difficulty', difficulty);

        // 应用设置
        if (this.audioManager) {
            this.audioManager.setSoundVolume(soundVolume / 100);
            this.audioManager.setMusicVolume(musicVolume / 100);
        }

        if (this.game) {
            this.game.setDifficulty(difficulty);
        }

        console.log('设置已保存');
    }

    /**
     * 加载设置
     */
    loadSettings() {
        const soundVolume = localStorage.getItem('tankBattle_soundVolume') || '70';
        const musicVolume = localStorage.getItem('tankBattle_musicVolume') || '50';
        const difficulty = localStorage.getItem('tankBattle_difficulty') || 'normal';

        // 应用到UI
        const soundVolumeSlider = document.getElementById('soundVolume');
        const musicVolumeSlider = document.getElementById('musicVolume');
        const difficultySelect = document.getElementById('difficulty');
        const soundVolumeValue = document.getElementById('soundVolumeValue');
        const musicVolumeValue = document.getElementById('musicVolumeValue');

        if (soundVolumeSlider) {
            soundVolumeSlider.value = soundVolume;
            if (soundVolumeValue) {
                soundVolumeValue.textContent = soundVolume + '%';
            }
        }

        if (musicVolumeSlider) {
            musicVolumeSlider.value = musicVolume;
            if (musicVolumeValue) {
                musicVolumeValue.textContent = musicVolume + '%';
            }
        }

        if (difficultySelect) {
            difficultySelect.value = difficulty;
        }

        // 应用到游戏
        if (this.audioManager) {
            this.audioManager.setSoundVolume(soundVolume / 100);
            this.audioManager.setMusicVolume(musicVolume / 100);
        }

        if (this.game) {
            this.game.setDifficulty(difficulty);
        }
    }
}

// 全局游戏应用实例
let gameApp = null;

/**
 * 文档加载完成后初始化游戏
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM加载完成，开始初始化游戏应用...');
    
    try {
        gameApp = new GameApp();
        await gameApp.init();
        
        // 加载用户设置
        gameApp.loadSettings();
        
    } catch (error) {
        console.error('游戏应用启动失败:', error);
    }
});

// 导出游戏应用实例供调试使用
window.gameApp = gameApp;

