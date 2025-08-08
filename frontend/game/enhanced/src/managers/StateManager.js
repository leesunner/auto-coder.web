









import { EventEmitter } from '../utils/EventEmitter.js';

/**
 * 游戏状态管理器
 * 管理游戏的各种状态，包括菜单、游戏进行、暂停、结束等
 */
export class StateManager extends EventEmitter {
    constructor() {
        super();
        
        // 游戏状态枚举
        this.states = {
            LOADING: 'loading',
            MENU: 'menu',
            PLAYING: 'playing',
            PAUSED: 'paused',
            GAME_OVER: 'gameOver',
            LEVEL_COMPLETE: 'levelComplete',
            SETTINGS: 'settings',
            HELP: 'help'
        };
        
        // 当前状态
        this.currentState = this.states.LOADING;
        this.previousState = null;
        
        // 状态历史
        this.stateHistory = [];
        this.maxHistoryLength = 10;
        
        // 状态数据
        this.stateData = new Map();
        
        // 状态转换规则
        this.transitionRules = this.createTransitionRules();
        
        // 状态处理器
        this.stateHandlers = new Map();
        
        // 游戏数据
        this.gameData = {
            score: 0,
            lives: 3,
            level: 1,
            highScore: this.loadHighScore(),
            playerName: '',
            difficulty: 'normal',
            powerUps: [],
            achievements: [],
            statistics: {
                enemiesDestroyed: 0,
                shotsfired: 0,
                accuracy: 0,
                playTime: 0,
                levelsCompleted: 0
            }
        };
        
        // 关卡数据
        this.levelData = {
            currentLevel: 1,
            maxLevel: 10,
            enemiesRemaining: 0,
            totalEnemies: 0,
            timeLimit: 0,
            timeRemaining: 0,
            objectives: [],
            completedObjectives: []
        };
        
        // 设置数据
        this.settings = {
            volume: {
                master: 1.0,
                sfx: 0.8,
                music: 0.6
            },
            graphics: {
                quality: 'high',
                effects: true,
                particles: true,
                shadows: true
            },
            controls: {
                keyboard: {
                    up: 'ArrowUp',
                    down: 'ArrowDown',
                    left: 'ArrowLeft',
                    right: 'ArrowRight',
                    shoot: 'Space',
                    pause: 'Escape'
                }
            },
            gameplay: {
                difficulty: 'normal',
                autoSave: true,
                showFPS: false,
                debugMode: false
            }
        };
        
        // 初始化
        this.initialize();
    }

    /**
     * 初始化状态管理器
     */
    initialize() {
        // 注册默认状态处理器
        this.registerStateHandlers();
        
        // 加载设置
        this.loadSettings();
        
        // 加载游戏数据
        this.loadGameData();
        
        this.emit('initialized');
    }

    /**
     * 创建状态转换规则
     */
    createTransitionRules() {
        const rules = new Map();
        
        // 从加载状态可以转换到菜单
        rules.set(this.states.LOADING, [this.states.MENU]);
        
        // 从菜单可以转换到游戏、设置、帮助
        rules.set(this.states.MENU, [
            this.states.PLAYING, 
            this.states.SETTINGS, 
            this.states.HELP
        ]);
        
        // 从游戏中可以转换到暂停、游戏结束、关卡完成
        rules.set(this.states.PLAYING, [
            this.states.PAUSED, 
            this.states.GAME_OVER, 
            this.states.LEVEL_COMPLETE
        ]);
        
        // 从暂停可以转换到游戏、菜单
        rules.set(this.states.PAUSED, [
            this.states.PLAYING, 
            this.states.MENU,
            this.states.SETTINGS
        ]);
        
        // 从游戏结束可以转换到菜单、游戏（重新开始）
        rules.set(this.states.GAME_OVER, [
            this.states.MENU, 
            this.states.PLAYING
        ]);
        
        // 从关卡完成可以转换到下一关或菜单
        rules.set(this.states.LEVEL_COMPLETE, [
            this.states.PLAYING, 
            this.states.MENU
        ]);
        
        // 从设置可以回到之前的状态
        rules.set(this.states.SETTINGS, [
            this.states.MENU, 
            this.states.PAUSED
        ]);
        
        // 从帮助可以回到菜单
        rules.set(this.states.HELP, [this.states.MENU]);
        
        return rules;
    }

    /**
     * 注册状态处理器
     */
    registerStateHandlers() {
        // 加载状态处理器
        this.stateHandlers.set(this.states.LOADING, {
            enter: () => this.handleLoadingEnter(),
            update: (deltaTime) => this.handleLoadingUpdate(deltaTime),
            exit: () => this.handleLoadingExit()
        });
        
        // 菜单状态处理器
        this.stateHandlers.set(this.states.MENU, {
            enter: () => this.handleMenuEnter(),
            update: (deltaTime) => this.handleMenuUpdate(deltaTime),
            exit: () => this.handleMenuExit()
        });
        
        // 游戏状态处理器
        this.stateHandlers.set(this.states.PLAYING, {
            enter: () => this.handlePlayingEnter(),
            update: (deltaTime) => this.handlePlayingUpdate(deltaTime),
            exit: () => this.handlePlayingExit()
        });
        
        // 暂停状态处理器
        this.stateHandlers.set(this.states.PAUSED, {
            enter: () => this.handlePausedEnter(),
            update: (deltaTime) => this.handlePausedUpdate(deltaTime),
            exit: () => this.handlePausedExit()
        });
        
        // 游戏结束状态处理器
        this.stateHandlers.set(this.states.GAME_OVER, {
            enter: () => this.handleGameOverEnter(),
            update: (deltaTime) => this.handleGameOverUpdate(deltaTime),
            exit: () => this.handleGameOverExit()
        });
        
        // 关卡完成状态处理器
        this.stateHandlers.set(this.states.LEVEL_COMPLETE, {
            enter: () => this.handleLevelCompleteEnter(),
            update: (deltaTime) => this.handleLevelCompleteUpdate(deltaTime),
            exit: () => this.handleLevelCompleteExit()
        });
    }

    /**
     * 切换状态
     */
    changeState(newState, data = null) {
        // 检查状态转换是否合法
        if (!this.canTransitionTo(newState)) {
            console.warn(`无法从 ${this.currentState} 转换到 ${newState}`);
            return false;
        }
        
        // 保存当前状态到历史
        this.addToHistory(this.currentState);
        
        // 退出当前状态
        const currentHandler = this.stateHandlers.get(this.currentState);
        if (currentHandler && currentHandler.exit) {
            currentHandler.exit();
        }
        
        // 更新状态
        this.previousState = this.currentState;
        this.currentState = newState;
        
        // 保存状态数据
        if (data) {
            this.stateData.set(newState, data);
        }
        
        // 进入新状态
        const newHandler = this.stateHandlers.get(newState);
        if (newHandler && newHandler.enter) {
            newHandler.enter();
        }
        
        // 发送状态变化事件
        this.emit('stateChanged', {
            previousState: this.previousState,
            currentState: this.currentState,
            data: data
        });
        
        return true;
    }

    /**
     * 检查是否可以转换到指定状态
     */
    canTransitionTo(newState) {
        const allowedStates = this.transitionRules.get(this.currentState);
        return allowedStates && allowedStates.includes(newState);
    }

    /**
     * 添加到状态历史
     */
    addToHistory(state) {
        this.stateHistory.push(state);
        if (this.stateHistory.length > this.maxHistoryLength) {
            this.stateHistory.shift();
        }
    }

    /**
     * 回到上一个状态
     */
    goBack() {
        if (this.previousState && this.canTransitionTo(this.previousState)) {
            this.changeState(this.previousState);
            return true;
        }
        return false;
    }

    /**
     * 更新状态
     */
    update(deltaTime) {
        const handler = this.stateHandlers.get(this.currentState);
        if (handler && handler.update) {
            handler.update(deltaTime);
        }
        
        // 更新游戏统计
        if (this.currentState === this.states.PLAYING) {
            this.gameData.statistics.playTime += deltaTime;
        }
    }

    /**
     * 加载状态处理器
     */
    handleLoadingEnter() {
        console.log('进入加载状态');
        // 初始化加载进度
        this.stateData.set(this.states.LOADING, { progress: 0 });
    }

    handleLoadingUpdate(deltaTime) {
        const data = this.stateData.get(this.states.LOADING);
        if (data) {
            data.progress += deltaTime * 50; // 模拟加载进度
            if (data.progress >= 100) {
                this.changeState(this.states.MENU);
            }
        }
    }

    handleLoadingExit() {
        console.log('退出加载状态');
    }

    /**
     * 菜单状态处理器
     */
    handleMenuEnter() {
        console.log('进入菜单状态');
        this.emit('showMenu');
    }

    handleMenuUpdate(deltaTime) {
        // 菜单动画更新等
    }

    handleMenuExit() {
        console.log('退出菜单状态');
        this.emit('hideMenu');
    }

    /**
     * 游戏状态处理器
     */
    handlePlayingEnter() {
        console.log('进入游戏状态');
        this.emit('startGame');
        
        // 重置关卡数据
        this.resetLevelData();
    }

    handlePlayingUpdate(deltaTime) {
        // 更新关卡时间
        if (this.levelData.timeLimit > 0) {
            this.levelData.timeRemaining -= deltaTime;
            if (this.levelData.timeRemaining <= 0) {
                this.changeState(this.states.GAME_OVER, { reason: 'timeout' });
            }
        }
    }

    handlePlayingExit() {
        console.log('退出游戏状态');
        this.emit('stopGame');
    }

    /**
     * 暂停状态处理器
     */
    handlePausedEnter() {
        console.log('进入暂停状态');
        this.emit('pauseGame');
    }

    handlePausedUpdate(deltaTime) {
        // 暂停时不更新游戏逻辑
    }

    handlePausedExit() {
        console.log('退出暂停状态');
        this.emit('resumeGame');
    }

    /**
     * 游戏结束状态处理器
     */
    handleGameOverEnter() {
        console.log('进入游戏结束状态');
        
        // 检查是否创造新纪录
        if (this.gameData.score > this.gameData.highScore) {
            this.gameData.highScore = this.gameData.score;
            this.saveHighScore();
            this.emit('newHighScore', { score: this.gameData.score });
        }
        
        this.emit('gameOver', {
            score: this.gameData.score,
            level: this.levelData.currentLevel,
            statistics: this.gameData.statistics
        });
    }

    handleGameOverUpdate(deltaTime) {
        // 游戏结束界面更新
    }

    handleGameOverExit() {
        console.log('退出游戏结束状态');
    }

    /**
     * 关卡完成状态处理器
     */
    handleLevelCompleteEnter() {
        console.log('进入关卡完成状态');
        
        // 计算关卡分数
        const levelBonus = this.calculateLevelBonus();
        this.addScore(levelBonus);
        
        // 更新统计
        this.gameData.statistics.levelsCompleted++;
        
        this.emit('levelComplete', {
            level: this.levelData.currentLevel,
            bonus: levelBonus,
            totalScore: this.gameData.score
        });
    }

    handleLevelCompleteUpdate(deltaTime) {
        // 关卡完成界面更新
    }

    handleLevelCompleteExit() {
        console.log('退出关卡完成状态');
    }

    /**
     * 游戏数据管理
     */
    addScore(points) {
        this.gameData.score += points;
        this.emit('scoreChanged', { 
            score: this.gameData.score, 
            points: points 
        });
    }

    loseLife() {
        this.gameData.lives--;
        this.emit('livesChanged', { lives: this.gameData.lives });
        
        if (this.gameData.lives <= 0) {
            this.changeState(this.states.GAME_OVER, { reason: 'noLives' });
        }
    }

    addLife() {
        this.gameData.lives++;
        this.emit('livesChanged', { lives: this.gameData.lives });
    }

    nextLevel() {
        this.levelData.currentLevel++;
        if (this.levelData.currentLevel > this.levelData.maxLevel) {
            // 游戏通关
            this.emit('gameComplete', {
                score: this.gameData.score,
                statistics: this.gameData.statistics
            });
        } else {
            this.changeState(this.states.PLAYING);
        }
    }

    resetGame() {
        this.gameData.score = 0;
        this.gameData.lives = 3;
        this.levelData.currentLevel = 1;
        this.gameData.statistics = {
            enemiesDestroyed: 0,
            shotsfired: 0,
            accuracy: 0,
            playTime: 0,
            levelsCompleted: 0
        };
        
        this.emit('gameReset');
    }

    /**
     * 关卡数据管理
     */
    resetLevelData() {
        this.levelData.enemiesRemaining = this.levelData.totalEnemies;
        this.levelData.timeRemaining = this.levelData.timeLimit;
        this.levelData.completedObjectives = [];
    }

    setLevelEnemies(total) {
        this.levelData.totalEnemies = total;
        this.levelData.enemiesRemaining = total;
    }

    enemyDestroyed() {
        this.levelData.enemiesRemaining--;
        this.gameData.statistics.enemiesDestroyed++;
        
        this.emit('enemyDestroyed', {
            remaining: this.levelData.enemiesRemaining,
            total: this.levelData.totalEnemies
        });
        
        // 检查是否完成关卡
        if (this.levelData.enemiesRemaining <= 0) {
            this.changeState(this.states.LEVEL_COMPLETE);
        }
    }

    shotFired() {
        this.gameData.statistics.shotsfired++;
        this.updateAccuracy();
    }

    updateAccuracy() {
        if (this.gameData.statistics.shotsfired > 0) {
            this.gameData.statistics.accuracy = 
                (this.gameData.statistics.enemiesDestroyed / this.gameData.statistics.shotsfired) * 100;
        }
    }

    calculateLevelBonus() {
        let bonus = 1000; // 基础奖励
        
        // 时间奖励
        if (this.levelData.timeRemaining > 0) {
            bonus += Math.floor(this.levelData.timeRemaining * 10);
        }
        
        // 精确度奖励
        bonus += Math.floor(this.gameData.statistics.accuracy * 10);
        
        // 生命值奖励
        bonus += this.gameData.lives * 500;
        
        return bonus;
    }

    /**
     * 设置管理
     */
    updateSetting(category, key, value) {
        if (this.settings[category] && this.settings[category].hasOwnProperty(key)) {
            this.settings[category][key] = value;
            this.saveSettings();
            
            this.emit('settingChanged', {
                category: category,
                key: key,
                value: value
            });
        }
    }

    getSetting(category, key) {
        return this.settings[category] && this.settings[category][key];
    }

    resetSettings() {
        // 重置为默认设置
        this.settings = {
            volume: { master: 1.0, sfx: 0.8, music: 0.6 },
            graphics: { quality: 'high', effects: true, particles: true, shadows: true },
            controls: {
                keyboard: {
                    up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', 
                    right: 'ArrowRight', shoot: 'Space', pause: 'Escape'
                }
            },
            gameplay: { difficulty: 'normal', autoSave: true, showFPS: false, debugMode: false }
        };
        
        this.saveSettings();
        this.emit('settingsReset');
    }

    /**
     * 数据持久化
     */
    saveGameData() {
        try {
            localStorage.setItem('tankGame_gameData', JSON.stringify(this.gameData));
            localStorage.setItem('tankGame_levelData', JSON.stringify(this.levelData));
        } catch (error) {
            console.error('保存游戏数据失败:', error);
        }
    }

    loadGameData() {
        try {
            const gameData = localStorage.getItem('tankGame_gameData');
            const levelData = localStorage.getItem('tankGame_levelData');
            
            if (gameData) {
                this.gameData = { ...this.gameData, ...JSON.parse(gameData) };
            }
            
            if (levelData) {
                this.levelData = { ...this.levelData, ...JSON.parse(levelData) };
            }
        } catch (error) {
            console.error('加载游戏数据失败:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('tankGame_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('保存设置失败:', error);
        }
    }

    loadSettings() {
        try {
            const settings = localStorage.getItem('tankGame_settings');
            if (settings) {
                this.settings = { ...this.settings, ...JSON.parse(settings) };
            }
        } catch (error) {
            console.error('加载设置失败:', error);
        }
    }

    saveHighScore() {
        try {
            localStorage.setItem('tankGame_highScore', this.gameData.highScore.toString());
        } catch (error) {
            console.error('保存最高分失败:', error);
        }
    }

    loadHighScore() {
        try {
            const highScore = localStorage.getItem('tankGame_highScore');
            return highScore ? parseInt(highScore) : 0;
        } catch (error) {
            console.error('加载最高分失败:', error);
            return 0;
        }
    }

    /**
     * 获取当前状态
     */
    getCurrentState() {
        return this.currentState;
    }

    /**
     * 获取状态数据
     */
    getStateData(state = null) {
        const targetState = state || this.currentState;
        return this.stateData.get(targetState);
    }

    /**
     * 获取游戏数据
     */
    getGameData() {
        return { ...this.gameData };
    }

    /**
     * 获取关卡数据
     */
    getLevelData() {
        return { ...this.levelData };
    }

    /**
     * 获取设置
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * 是否在游戏中
     */
    isPlaying() {
        return this.currentState === this.states.PLAYING;
    }

    /**
     * 是否暂停
     */
    isPaused() {
        return this.currentState === this.states.PAUSED;
    }

    /**
     * 是否游戏结束
     */
    isGameOver() {
        return this.currentState === this.states.GAME_OVER;
    }

    /**
     * 清理资源
     */
    dispose() {
        // 保存游戏数据
        this.saveGameData();
        this.saveSettings();
        
        // 清理状态
        this.stateHandlers.clear();
        this.stateData.clear();
        this.stateHistory = [];
        
        this.emit('disposed');
    }
}










