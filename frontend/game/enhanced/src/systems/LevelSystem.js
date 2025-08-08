












import { EventEmitter } from '../utils/EventEmitter.js';
import { Logger } from '../utils/Logger.js';

/**
 * 关卡系统
 * 管理游戏关卡的加载、配置和进度
 */
export class LevelSystem extends EventEmitter {
    constructor() {
        super();
        
        // 关卡数据
        this.levels = new Map();
        this.currentLevel = 1;
        this.maxLevel = 10;
        
        // 关卡状态
        this.isLevelActive = false;
        this.levelStartTime = 0;
        this.levelProgress = {
            enemiesSpawned: 0,
            enemiesDestroyed: 0,
            objectivesCompleted: 0,
            totalObjectives: 0
        };
        
        // 关卡计时器
        this.timers = new Map();
        
        // 初始化默认关卡
        this.initializeDefaultLevels();
    }

    /**
     * 初始化默认关卡配置
     */
    initializeDefaultLevels() {
        // 关卡1：基础教学
        this.addLevel(1, {
            name: "新手训练",
            description: "学习基本操作和射击",
            mapLayout: "tutorial",
            backgroundMusic: "tutorial_theme",
            timeLimit: 120000, // 2分钟
            objectives: [
                {
                    type: "destroyEnemies",
                    target: 5,
                    description: "消灭5个敌人"
                }
            ],
            enemies: [
                {
                    type: "basic",
                    count: 5,
                    spawnPattern: "sequential",
                    spawnDelay: 3000,
                    aiLevel: "easy"
                }
            ],
            powerUps: [
                { type: "speed", probability: 0.3 },
                { type: "fireRate", probability: 0.2 }
            ],
            rewards: {
                score: 1000,
                lives: 0
            }
        });

        // 关卡2：速度挑战
        this.addLevel(2, {
            name: "速度挑战",
            description: "面对更快的敌人",
            mapLayout: "arena",
            backgroundMusic: "action_theme",
            timeLimit: 180000, // 3分钟
            objectives: [
                {
                    type: "destroyEnemies",
                    target: 8,
                    description: "消灭8个敌人"
                },
                {
                    type: "surviveTime",
                    target: 120000,
                    description: "生存2分钟"
                }
            ],
            enemies: [
                {
                    type: "basic",
                    count: 3,
                    spawnPattern: "wave",
                    spawnDelay: 2000,
                    aiLevel: "normal"
                },
                {
                    type: "fast",
                    count: 5,
                    spawnPattern: "random",
                    spawnDelay: 4000,
                    aiLevel: "normal"
                }
            ],
            powerUps: [
                { type: "speed", probability: 0.4 },
                { type: "fireRate", probability: 0.3 },
                { type: "shield", probability: 0.2 }
            ],
            rewards: {
                score: 2000,
                lives: 1
            }
        });

        // 关卡3：防御战
        this.addLevel(3, {
            name: "防御战",
            description: "保护基地免受攻击",
            mapLayout: "defense",
            backgroundMusic: "intense_theme",
            timeLimit: 240000, // 4分钟
            objectives: [
                {
                    type: "protectBase",
                    target: 1,
                    description: "保护基地不被摧毁"
                },
                {
                    type: "destroyEnemies",
                    target: 12,
                    description: "消灭12个敌人"
                }
            ],
            enemies: [
                {
                    type: "basic",
                    count: 6,
                    spawnPattern: "wave",
                    spawnDelay: 2500,
                    aiLevel: "normal"
                },
                {
                    type: "heavy",
                    count: 3,
                    spawnPattern: "timed",
                    spawnDelay: 8000,
                    aiLevel: "hard"
                },
                {
                    type: "fast",
                    count: 3,
                    spawnPattern: "random",
                    spawnDelay: 5000,
                    aiLevel: "normal"
                }
            ],
            powerUps: [
                { type: "multiShot", probability: 0.3 },
                { type: "shield", probability: 0.4 },
                { type: "repair", probability: 0.2 }
            ],
            rewards: {
                score: 3000,
                lives: 1
            }
        });

        // 关卡4：迷宫挑战
        this.addLevel(4, {
            name: "迷宫挑战",
            description: "在复杂地形中战斗",
            mapLayout: "maze",
            backgroundMusic: "mystery_theme",
            timeLimit: 300000, // 5分钟
            objectives: [
                {
                    type: "reachExit",
                    target: 1,
                    description: "到达出口"
                },
                {
                    type: "collectItems",
                    target: 5,
                    description: "收集5个特殊道具"
                }
            ],
            enemies: [
                {
                    type: "patrol",
                    count: 4,
                    spawnPattern: "fixed",
                    spawnDelay: 0,
                    aiLevel: "hard",
                    behavior: "patrol"
                },
                {
                    type: "hunter",
                    count: 2,
                    spawnPattern: "triggered",
                    spawnDelay: 30000,
                    aiLevel: "hard",
                    behavior: "hunt"
                }
            ],
            powerUps: [
                { type: "stealth", probability: 0.3 },
                { type: "wallBreaker", probability: 0.2 },
                { type: "speed", probability: 0.4 }
            ],
            rewards: {
                score: 4000,
                lives: 1
            }
        });

        // 关卡5：Boss战
        this.addLevel(5, {
            name: "Boss战",
            description: "挑战强大的Boss",
            mapLayout: "boss_arena",
            backgroundMusic: "boss_theme",
            timeLimit: 360000, // 6分钟
            objectives: [
                {
                    type: "destroyBoss",
                    target: 1,
                    description: "击败Boss"
                }
            ],
            enemies: [
                {
                    type: "boss",
                    count: 1,
                    spawnPattern: "immediate",
                    spawnDelay: 0,
                    aiLevel: "boss",
                    behavior: "boss_ai"
                },
                {
                    type: "minion",
                    count: 8,
                    spawnPattern: "boss_summon",
                    spawnDelay: 15000,
                    aiLevel: "normal"
                }
            ],
            powerUps: [
                { type: "superWeapon", probability: 0.2 },
                { type: "shield", probability: 0.5 },
                { type: "health", probability: 0.4 }
            ],
            rewards: {
                score: 10000,
                lives: 2
            }
        });

        // 继续添加更多关卡...
        this.generateAdvancedLevels();
    }

    /**
     * 生成高级关卡
     */
    generateAdvancedLevels() {
        for (let level = 6; level <= this.maxLevel; level++) {
            const difficulty = Math.min((level - 1) * 0.2, 2.0);
            
            this.addLevel(level, {
                name: `挑战关卡 ${level}`,
                description: `难度系数: ${difficulty.toFixed(1)}`,
                mapLayout: this.getRandomMapLayout(),
                backgroundMusic: this.getRandomMusic(),
                timeLimit: 300000 + (level * 30000),
                objectives: this.generateObjectives(level, difficulty),
                enemies: this.generateEnemies(level, difficulty),
                powerUps: this.generatePowerUps(difficulty),
                rewards: {
                    score: level * 2000,
                    lives: Math.floor(level / 3)
                }
            });
        }
    }

    /**
     * 添加关卡
     */
    addLevel(levelNumber, config) {
        this.levels.set(levelNumber, {
            number: levelNumber,
            ...config,
            completed: false,
            bestScore: 0,
            bestTime: Infinity,
            playCount: 0
        });
    }

    /**
     * 开始关卡
     */
    startLevel(levelNumber) {
        const level = this.levels.get(levelNumber);
        if (!level) {
            throw new Error(`关卡 ${levelNumber} 不存在`);
        }

        this.currentLevel = levelNumber;
        this.isLevelActive = true;
        this.levelStartTime = Date.now();
        
        // 重置关卡进度
        this.levelProgress = {
            enemiesSpawned: 0,
            enemiesDestroyed: 0,
            objectivesCompleted: 0,
            totalObjectives: level.objectives.length,
            objectives: level.objectives.map(obj => ({
                ...obj,
                completed: false,
                progress: 0
            }))
        };

        // 增加游玩次数
        level.playCount++;

        Logger.info(`开始关卡 ${levelNumber}: ${level.name}`);
        
        this.emit('levelStarted', {
            level: levelNumber,
            config: level
        });

        // 设置关卡计时器
        if (level.timeLimit > 0) {
            this.setTimer('timeLimit', level.timeLimit, () => {
                this.emit('timeLimitReached', { level: levelNumber });
            });
        }

        return level;
    }

    /**
     * 完成关卡
     */
    completeLevel(score, time) {
        if (!this.isLevelActive) return;

        const level = this.levels.get(this.currentLevel);
        if (!level) return;

        // 更新关卡记录
        level.completed = true;
        if (score > level.bestScore) {
            level.bestScore = score;
        }
        if (time < level.bestTime) {
            level.bestTime = time;
        }

        this.isLevelActive = false;
        this.clearAllTimers();

        Logger.info(`关卡 ${this.currentLevel} 完成！分数: ${score}, 时间: ${time}ms`);

        this.emit('levelCompleted', {
            level: this.currentLevel,
            score: score,
            time: time,
            rewards: level.rewards,
            newBestScore: score === level.bestScore,
            newBestTime: time === level.bestTime
        });
    }

    /**
     * 关卡失败
     */
    failLevel(reason) {
        if (!this.isLevelActive) return;

        this.isLevelActive = false;
        this.clearAllTimers();

        Logger.info(`关卡 ${this.currentLevel} 失败: ${reason}`);

        this.emit('levelFailed', {
            level: this.currentLevel,
            reason: reason
        });
    }

    /**
     * 更新目标进度
     */
    updateObjective(type, value = 1) {
        if (!this.isLevelActive) return;

        const objectives = this.levelProgress.objectives;
        let objectiveCompleted = false;

        for (const objective of objectives) {
            if (objective.type === type && !objective.completed) {
                objective.progress += value;
                
                if (objective.progress >= objective.target) {
                    objective.completed = true;
                    objective.progress = objective.target;
                    objectiveCompleted = true;
                    this.levelProgress.objectivesCompleted++;
                    
                    this.emit('objectiveCompleted', {
                        objective: objective,
                        level: this.currentLevel
                    });
                }
                
                this.emit('objectiveProgress', {
                    objective: objective,
                    level: this.currentLevel
                });
            }
        }

        // 检查是否所有目标都完成
        if (this.levelProgress.objectivesCompleted >= this.levelProgress.totalObjectives) {
            this.emit('allObjectivesCompleted', {
                level: this.currentLevel
            });
        }

        return objectiveCompleted;
    }

    /**
     * 获取关卡配置
     */
    getLevelConfig(levelNumber = this.currentLevel) {
        return this.levels.get(levelNumber);
    }

    /**
     * 获取关卡进度
     */
    getLevelProgress() {
        return { ...this.levelProgress };
    }

    /**
     * 检查关卡是否解锁
     */
    isLevelUnlocked(levelNumber) {
        if (levelNumber === 1) return true;
        
        const previousLevel = this.levels.get(levelNumber - 1);
        return previousLevel && previousLevel.completed;
    }

    /**
     * 获取所有关卡信息
     */
    getAllLevels() {
        return Array.from(this.levels.values());
    }

    /**
     * 获取已解锁的关卡
     */
    getUnlockedLevels() {
        return this.getAllLevels().filter((_, index) => 
            this.isLevelUnlocked(index + 1)
        );
    }

    /**
     * 设置计时器
     */
    setTimer(name, duration, callback) {
        this.clearTimer(name);
        
        const timer = setTimeout(() => {
            this.timers.delete(name);
            callback();
        }, duration);
        
        this.timers.set(name, timer);
    }

    /**
     * 清除计时器
     */
    clearTimer(name) {
        const timer = this.timers.get(name);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(name);
        }
    }

    /**
     * 清除所有计时器
     */
    clearAllTimers() {
        for (const timer of this.timers.values()) {
            clearTimeout(timer);
        }
        this.timers.clear();
    }

    /**
     * 生成目标
     */
    generateObjectives(level, difficulty) {
        const objectives = [];
        const enemyCount = Math.floor(5 + level * 2 + difficulty * 3);
        
        // 主要目标：消灭敌人
        objectives.push({
            type: "destroyEnemies",
            target: enemyCount,
            description: `消灭${enemyCount}个敌人`
        });

        // 根据关卡添加额外目标
        if (level % 2 === 0) {
            objectives.push({
                type: "surviveTime",
                target: 120000 + level * 15000,
                description: `生存${Math.floor((120000 + level * 15000) / 1000)}秒`
            });
        }

        if (level % 3 === 0) {
            objectives.push({
                type: "collectItems",
                target: Math.floor(2 + level / 3),
                description: `收集${Math.floor(2 + level / 3)}个道具`
            });
        }

        return objectives;
    }

    /**
     * 生成敌人配置
     */
    generateEnemies(level, difficulty) {
        const enemies = [];
        const totalEnemies = Math.floor(5 + level * 2 + difficulty * 3);
        
        // 基础敌人
        enemies.push({
            type: "basic",
            count: Math.floor(totalEnemies * 0.6),
            spawnPattern: "wave",
            spawnDelay: Math.max(1000, 3000 - level * 100),
            aiLevel: difficulty > 1 ? "normal" : "easy"
        });

        // 快速敌人
        if (level >= 2) {
            enemies.push({
                type: "fast",
                count: Math.floor(totalEnemies * 0.3),
                spawnPattern: "random",
                spawnDelay: Math.max(2000, 5000 - level * 150),
                aiLevel: "normal"
            });
        }

        // 重型敌人
        if (level >= 3) {
            enemies.push({
                type: "heavy",
                count: Math.floor(totalEnemies * 0.1),
                spawnPattern: "timed",
                spawnDelay: Math.max(5000, 10000 - level * 200),
                aiLevel: difficulty > 1.5 ? "hard" : "normal"
            });
        }

        return enemies;
    }

    /**
     * 生成道具配置
     */
    generatePowerUps(difficulty) {
        const baseProbability = 0.3 - difficulty * 0.05;
        
        return [
            { type: "speed", probability: baseProbability + 0.1 },
            { type: "fireRate", probability: baseProbability },
            { type: "shield", probability: baseProbability - 0.05 },
            { type: "multiShot", probability: Math.max(0.1, baseProbability - 0.1) },
            { type: "health", probability: baseProbability + 0.05 }
        ];
    }

    /**
     * 获取随机地图布局
     */
    getRandomMapLayout() {
        const layouts = ["arena", "maze", "defense", "open", "corridor"];
        return layouts[Math.floor(Math.random() * layouts.length)];
    }

    /**
     * 获取随机音乐
     */
    getRandomMusic() {
        const themes = ["action_theme", "intense_theme", "mystery_theme", "epic_theme"];
        return themes[Math.floor(Math.random() * themes.length)];
    }

    /**
     * 重置关卡系统
     */
    reset() {
        this.currentLevel = 1;
        this.isLevelActive = false;
        this.levelStartTime = 0;
        this.clearAllTimers();
        
        // 重置所有关卡完成状态（可选）
        for (const level of this.levels.values()) {
            level.completed = false;
            level.bestScore = 0;
            level.bestTime = Infinity;
            level.playCount = 0;
        }
    }

    /**
     * 获取关卡统计
     */
    getStatistics() {
        const levels = this.getAllLevels();
        const completed = levels.filter(l => l.completed).length;
        const totalScore = levels.reduce((sum, l) => sum + l.bestScore, 0);
        const totalPlayTime = levels.reduce((sum, l) => 
            sum + (l.bestTime !== Infinity ? l.bestTime : 0), 0
        );

        return {
            totalLevels: levels.length,
            completedLevels: completed,
            completionRate: (completed / levels.length) * 100,
            totalScore: totalScore,
            averageScore: totalScore / Math.max(completed, 1),
            totalPlayTime: totalPlayTime,
            averageTime: totalPlayTime / Math.max(completed, 1)
        };
    }

    /**
     * 更新游戏时间
     */
    update(deltaTime) {
        // 这里可以添加关卡相关的实时更新逻辑
        // 比如检查时间限制、动态生成事件等
    }

    /**
     * 销毁关卡系统
     */
    dispose() {
        this.clearAllTimers();
        this.levels.clear();
        this.emit('disposed');
    }
}













