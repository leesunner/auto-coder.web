






/**
 * 游戏状态管理器
 * 管理游戏的各种状态转换和状态数据
 */

/**
 * 游戏状态枚举
 */
export const GameState = {
    MENU: 'menu',           // 主菜单
    LOADING: 'loading',     // 加载中
    PLAYING: 'playing',     // 游戏进行中
    PAUSED: 'paused',       // 暂停
    GAME_OVER: 'game_over', // 游戏结束
    VICTORY: 'victory',     // 胜利
    SETTINGS: 'settings',   // 设置
    HELP: 'help'           // 帮助
};

/**
 * 游戏状态管理器类
 */
export class GameStateManager {
    constructor() {
        // 当前状态
        this.currentState = GameState.MENU;
        this.previousState = null;
        this.stateHistory = [];
        
        // 状态数据
        this.stateData = new Map();
        
        // 状态转换监听器
        this.stateChangeListeners = [];
        
        // 游戏数据
        this.gameData = {
            score: 0,
            lives: 3,
            level: 1,
            enemiesDestroyed: 0,
            totalEnemies: 0,
            timeElapsed: 0,
            powerUps: [],
            achievements: []
        };
        
        // 设置数据
        this.settings = {
            soundEnabled: true,
            musicEnabled: true,
            soundVolume: 0.7,
            musicVolume: 0.5,
            difficulty: 'normal',
            controls: {
                up: 'ArrowUp',
                down: 'ArrowDown',
                left: 'ArrowLeft',
                right: 'ArrowRight',
                shoot: 'Space',
                pause: 'Escape'
            }
        };
        
        // 统计数据
        this.statistics = {
            gamesPlayed: 0,
            totalScore: 0,
            bestScore: 0,
            totalTime: 0,
            enemiesDestroyed: 0,
            shotsfired: 0,
            accuracy: 0
        };
        
        // 初始化状态数据
        this.initializeStateData();
        
        // 从本地存储加载数据
        this.loadFromStorage();
    }

    /**
     * 初始化状态数据
     */
    initializeStateData() {
        // 菜单状态数据
        this.stateData.set(GameState.MENU, {
            selectedOption: 0,
            menuOptions: ['开始游戏', '设置', '帮助', '退出'],
            showBackground: true
        });
        
        // 游戏状态数据
        this.stateData.set(GameState.PLAYING, {
            isPaused: false,
            showHUD: true,
            showDebugInfo: false
        });
        
        // 暂停状态数据
        this.stateData.set(GameState.PAUSED, {
            selectedOption: 0,
            pauseOptions: ['继续游戏', '重新开始', '设置', '返回主菜单']
        });
        
        // 游戏结束状态数据
        this.stateData.set(GameState.GAME_OVER, {
            finalScore: 0,
            isNewBestScore: false,
            showReplay: true
        });
        
        // 胜利状态数据
        this.stateData.set(GameState.VICTORY, {
            finalScore: 0,
            levelCompleted: 1,
            bonusPoints: 0,
            showNextLevel: true
        });
        
        // 设置状态数据
        this.stateData.set(GameState.SETTINGS, {
            selectedCategory: 0,
            selectedOption: 0,
            categories: ['音频', '控制', '游戏', '图形'],
            isDirty: false
        });
    }

    /**
     * 切换到新状态
     */
    changeState(newState, data = null) {
        if (newState === this.currentState) {
            return;
        }
        
        console.log(`状态切换: ${this.currentState} -> ${newState}`);
        
        // 保存当前状态到历史
        this.stateHistory.push(this.currentState);
        if (this.stateHistory.length > 10) {
            this.stateHistory.shift();
        }
        
        // 退出当前状态
        this.onStateExit(this.currentState);
        
        // 更新状态
        this.previousState = this.currentState;
        this.currentState = newState;
        
        // 进入新状态
        this.onStateEnter(newState, data);
        
        // 通知监听器
        this.notifyStateChange(newState, this.previousState);
    }

    /**
     * 状态进入处理
     */
    onStateEnter(state, data) {
        switch (state) {
            case GameState.MENU:
                this.onEnterMenu(data);
                break;
            case GameState.PLAYING:
                this.onEnterPlaying(data);
                break;
            case GameState.PAUSED:
                this.onEnterPaused(data);
                break;
            case GameState.GAME_OVER:
                this.onEnterGameOver(data);
                break;
            case GameState.VICTORY:
                this.onEnterVictory(data);
                break;
            case GameState.SETTINGS:
                this.onEnterSettings(data);
                break;
        }
    }

    /**
     * 状态退出处理
     */
    onStateExit(state) {
        switch (state) {
            case GameState.PLAYING:
                this.onExitPlaying();
                break;
            case GameState.SETTINGS:
                this.onExitSettings();
                break;
        }
    }

    /**
     * 进入菜单状态
     */
    onEnterMenu(data) {
        const menuData = this.stateData.get(GameState.MENU);
        menuData.selectedOption = 0;
        
        // 重置游戏数据
        this.resetGameData();
    }

    /**
     * 进入游戏状态
     */
    onEnterPlaying(data) {
        const playingData = this.stateData.get(GameState.PLAYING);
        playingData.isPaused = false;
        
        // 初始化游戏数据
        if (data && data.newGame) {
            this.resetGameData();
            this.gameData.level = data.level || 1;
        }
        
        // 开始计时
        this.gameData.startTime = Date.now();
    }

    /**
     * 进入暂停状态
     */
    onEnterPaused(data) {
        const pausedData = this.stateData.get(GameState.PAUSED);
        pausedData.selectedOption = 0;
        
        // 暂停计时
        if (this.gameData.startTime) {
            this.gameData.timeElapsed += Date.now() - this.gameData.startTime;
        }
    }

    /**
     * 进入游戏结束状态
     */
    onEnterGameOver(data) {
        const gameOverData = this.stateData.get(GameState.GAME_OVER);
        
        // 计算最终分数
        gameOverData.finalScore = this.gameData.score;
        gameOverData.isNewBestScore = this.gameData.score > this.statistics.bestScore;
        
        // 更新统计数据
        this.updateStatistics();
        
        // 保存数据
        this.saveToStorage();
    }

    /**
     * 进入胜利状态
     */
    onEnterVictory(data) {
        const victoryData = this.stateData.get(GameState.VICTORY);
        
        // 计算奖励分数
        const timeBonus = Math.max(0, 10000 - this.gameData.timeElapsed / 100);
        const lifeBonus = this.gameData.lives * 1000;
        victoryData.bonusPoints = timeBonus + lifeBonus;
        
        // 更新分数
        this.gameData.score += victoryData.bonusPoints;
        victoryData.finalScore = this.gameData.score;
        victoryData.levelCompleted = this.gameData.level;
        
        // 更新统计数据
        this.updateStatistics();
        
        // 保存数据
        this.saveToStorage();
    }

    /**
     * 进入设置状态
     */
    onEnterSettings(data) {
        const settingsData = this.stateData.get(GameState.SETTINGS);
        settingsData.selectedCategory = 0;
        settingsData.selectedOption = 0;
        settingsData.isDirty = false;
    }

    /**
     * 退出游戏状态
     */
    onExitPlaying() {
        // 停止计时
        if (this.gameData.startTime) {
            this.gameData.timeElapsed += Date.now() - this.gameData.startTime;
            this.gameData.startTime = null;
        }
    }

    /**
     * 退出设置状态
     */
    onExitSettings() {
        const settingsData = this.stateData.get(GameState.SETTINGS);
        
        // 如果设置有更改，保存到本地存储
        if (settingsData.isDirty) {
            this.saveToStorage();
            settingsData.isDirty = false;
        }
    }

    /**
     * 返回上一个状态
     */
    goBack() {
        if (this.stateHistory.length > 0) {
            const previousState = this.stateHistory.pop();
            this.changeState(previousState);
        }
    }

    /**
     * 重置游戏数据
     */
    resetGameData() {
        this.gameData = {
            score: 0,
            lives: 3,
            level: 1,
            enemiesDestroyed: 0,
            totalEnemies: 0,
            timeElapsed: 0,
            startTime: null,
            powerUps: [],
            achievements: []
        };
    }

    /**
     * 更新统计数据
     */
    updateStatistics() {
        this.statistics.gamesPlayed++;
        this.statistics.totalScore += this.gameData.score;
        this.statistics.bestScore = Math.max(this.statistics.bestScore, this.gameData.score);
        this.statistics.totalTime += this.gameData.timeElapsed;
        this.statistics.enemiesDestroyed += this.gameData.enemiesDestroyed;
        
        // 计算准确率
        if (this.gameData.shotsFired > 0) {
            this.statistics.accuracy = (this.gameData.shotsHit / this.gameData.shotsFired) * 100;
        }
    }

    /**
     * 添加分数
     */
    addScore(points) {
        this.gameData.score += points;
    }

    /**
     * 减少生命
     */
    loseLife() {
        this.gameData.lives--;
        
        if (this.gameData.lives <= 0) {
            this.changeState(GameState.GAME_OVER);
        }
    }

    /**
     * 增加生命
     */
    gainLife() {
        this.gameData.lives++;
    }

    /**
     * 摧毁敌人
     */
    destroyEnemy(enemyType = 'basic') {
        this.gameData.enemiesDestroyed++;
        
        // 根据敌人类型给分
        const scoreMap = {
            'basic': 100,
            'fast': 200,
            'heavy': 300,
            'boss': 1000
        };
        
        this.addScore(scoreMap[enemyType] || 100);
        
        // 检查是否完成关卡
        if (this.gameData.enemiesDestroyed >= this.gameData.totalEnemies) {
            this.changeState(GameState.VICTORY);
        }
    }

    /**
     * 添加状态变化监听器
     */
    addStateChangeListener(listener) {
        this.stateChangeListeners.push(listener);
    }

    /**
     * 移除状态变化监听器
     */
    removeStateChangeListener(listener) {
        const index = this.stateChangeListeners.indexOf(listener);
        if (index > -1) {
            this.stateChangeListeners.splice(index, 1);
        }
    }

    /**
     * 通知状态变化
     */
    notifyStateChange(newState, oldState) {
        for (const listener of this.stateChangeListeners) {
            try {
                listener(newState, oldState);
            } catch (error) {
                console.error('状态变化监听器错误:', error);
            }
        }
    }

    /**
     * 获取当前状态数据
     */
    getCurrentStateData() {
        return this.stateData.get(this.currentState) || {};
    }

    /**
     * 更新当前状态数据
     */
    updateCurrentStateData(data) {
        const currentData = this.getCurrentStateData();
        Object.assign(currentData, data);
    }

    /**
     * 检查是否在游戏中
     */
    isInGame() {
        return this.currentState === GameState.PLAYING;
    }

    /**
     * 检查是否暂停
     */
    isPaused() {
        return this.currentState === GameState.PAUSED;
    }

    /**
     * 检查是否在菜单中
     */
    isInMenu() {
        return this.currentState === GameState.MENU;
    }

    /**
     * 暂停游戏
     */
    pauseGame() {
        if (this.currentState === GameState.PLAYING) {
            this.changeState(GameState.PAUSED);
        }
    }

    /**
     * 恢复游戏
     */
    resumeGame() {
        if (this.currentState === GameState.PAUSED) {
            this.changeState(GameState.PLAYING);
        }
    }

    /**
     * 重新开始游戏
     */
    restartGame() {
        this.changeState(GameState.PLAYING, { newGame: true, level: 1 });
    }

    /**
     * 返回主菜单
     */
    returnToMenu() {
        this.changeState(GameState.MENU);
    }

    /**
     * 保存到本地存储
     */
    saveToStorage() {
        try {
            const saveData = {
                settings: this.settings,
                statistics: this.statistics,
                gameData: this.gameData
            };
            
            localStorage.setItem('tankBattleGame', JSON.stringify(saveData));
            console.log('游戏数据已保存');
        } catch (error) {
            console.error('保存游戏数据失败:', error);
        }
    }

    /**
     * 从本地存储加载
     */
    loadFromStorage() {
        try {
            const saveData = localStorage.getItem('tankBattleGame');
            
            if (saveData) {
                const data = JSON.parse(saveData);
                
                if (data.settings) {
                    Object.assign(this.settings, data.settings);
                }
                
                if (data.statistics) {
                    Object.assign(this.statistics, data.statistics);
                }
                
                console.log('游戏数据已加载');
            }
        } catch (error) {
            console.error('加载游戏数据失败:', error);
        }
    }

    /**
     * 清除存储数据
     */
    clearStorage() {
        try {
            localStorage.removeItem('tankBattleGame');
            
            // 重置到默认值
            this.statistics = {
                gamesPlayed: 0,
                totalScore: 0,
                bestScore: 0,
                totalTime: 0,
                enemiesDestroyed: 0,
                shotsfired: 0,
                accuracy: 0
            };
            
            console.log('游戏数据已清除');
        } catch (error) {
            console.error('清除游戏数据失败:', error);
        }
    }

    /**
     * 获取游戏状态信息
     */
    getStatus() {
        return {
            currentState: this.currentState,
            previousState: this.previousState,
            gameData: { ...this.gameData },
            settings: { ...this.settings },
            statistics: { ...this.statistics }
        };
    }

    /**
     * 更新设置
     */
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        
        const settingsData = this.stateData.get(GameState.SETTINGS);
        if (settingsData) {
            settingsData.isDirty = true;
        }
    }

    /**
     * 获取设置值
     */
    getSetting(key) {
        return this.settings[key];
    }

    /**
     * 设置设置值
     */
    setSetting(key, value) {
        this.settings[key] = value;
        
        const settingsData = this.stateData.get(GameState.SETTINGS);
        if (settingsData) {
            settingsData.isDirty = true;
        }
    }
}






