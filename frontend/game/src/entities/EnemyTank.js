





/**
 * 敌方坦克AI类
 * 继承自Tank基类，实现智能敌方坦克的行为和AI逻辑
 */

import { Tank, TankType, TankDirection } from './Tank.js';
import { Vector2 } from '../utils/Vector2.js';

/**
 * AI行为状态枚举
 */
export const AIBehaviorState = {
    IDLE: 'idle',
    PATROL: 'patrol',
    CHASE: 'chase',
    ATTACK: 'attack',
    RETREAT: 'retreat',
    SEARCH: 'search',
    STUCK: 'stuck'
};

/**
 * AI难度级别
 */
export const AIDifficulty = {
    EASY: 'easy',
    NORMAL: 'normal',
    HARD: 'hard',
    EXPERT: 'expert'
};

/**
 * 敌方坦克类
 */
export class EnemyTank extends Tank {
    constructor(x, y, type = TankType.ENEMY_BASIC, difficulty = AIDifficulty.NORMAL) {
        super(x, y, type);
        
        // AI相关属性
        this.difficulty = difficulty;
        this.behaviorState = AIBehaviorState.PATROL;
        this.previousBehaviorState = AIBehaviorState.PATROL;
        
        // 目标和感知
        this.target = null;
        this.lastKnownTargetPosition = null;
        this.sightRange = 200;
        this.attackRange = 180;
        this.hearingRange = 150;
        
        // 移动和路径
        this.waypoints = [];
        this.currentWaypoint = 0;
        this.patrolRadius = 100;
        this.moveDirection = TankDirection.UP;
        this.stuckTimer = 0;
        this.stuckThreshold = 2.0; // 秒
        this.lastPosition = new Vector2(x, y);
        
        // 行为计时器
        this.behaviorTimer = 0;
        this.decisionInterval = 0.5; // 每0.5秒做一次决策
        this.lastDecisionTime = 0;
        
        // 射击相关
        this.aimAccuracy = 0.8; // 瞄准精度
        this.reactionTime = 0.3; // 反应时间
        this.lastShotTime = 0;
        this.burstFireCount = 0;
        this.maxBurstFire = 3;
        
        // 状态持续时间
        this.stateDurations = {
            patrol: 5.0,
            chase: 8.0,
            attack: 3.0,
            retreat: 2.0,
            search: 4.0
        };
        
        // 记忆系统
        this.memory = {
            lastPlayerSeen: 0,
            playerPositions: [],
            maxMemorySize: 10,
            memoryDecayTime: 5.0
        };
        
        // 根据难度调整AI参数
        this.adjustAIForDifficulty();
        
        // 初始化巡逻路径
        this.initializePatrolPath();
        
        // 添加标签
        this.addTag('enemy');
        this.addTag('ai');
    }

    /**
     * 根据难度调整AI参数
     */
    adjustAIForDifficulty() {
        switch (this.difficulty) {
            case AIDifficulty.EASY:
                this.sightRange = 150;
                this.attackRange = 140;
                this.aimAccuracy = 0.6;
                this.reactionTime = 0.8;
                this.decisionInterval = 1.0;
                this.speed *= 0.8;
                this.shootCooldownTime *= 1.5;
                break;
                
            case AIDifficulty.NORMAL:
                this.sightRange = 200;
                this.attackRange = 180;
                this.aimAccuracy = 0.8;
                this.reactionTime = 0.5;
                this.decisionInterval = 0.5;
                break;
                
            case AIDifficulty.HARD:
                this.sightRange = 250;
                this.attackRange = 220;
                this.aimAccuracy = 0.9;
                this.reactionTime = 0.3;
                this.decisionInterval = 0.3;
                this.speed *= 1.1;
                this.shootCooldownTime *= 0.8;
                break;
                
            case AIDifficulty.EXPERT:
                this.sightRange = 300;
                this.attackRange = 260;
                this.aimAccuracy = 0.95;
                this.reactionTime = 0.1;
                this.decisionInterval = 0.2;
                this.speed *= 1.2;
                this.shootCooldownTime *= 0.6;
                this.maxBurstFire = 5;
                break;
        }
    }

    /**
     * 初始化巡逻路径
     */
    initializePatrolPath() {
        const centerX = this.x;
        const centerY = this.y;
        const radius = this.patrolRadius;
        
        // 创建矩形巡逻路径
        this.waypoints = [
            new Vector2(centerX - radius, centerY - radius),
            new Vector2(centerX + radius, centerY - radius),
            new Vector2(centerX + radius, centerY + radius),
            new Vector2(centerX - radius, centerY + radius)
        ];
        
        this.currentWaypoint = 0;
    }

    /**
     * 更新敌方坦克
     */
    update(deltaTime, gameState) {
        if (this.isDestroyed) {
            return;
        }
        
        // 更新行为计时器
        this.behaviorTimer += deltaTime;
        
        // 更新记忆系统
        this.updateMemory(deltaTime);
        
        // 检测卡住状态
        this.checkStuckState(deltaTime);
        
        // AI决策
        if (this.behaviorTimer - this.lastDecisionTime >= this.decisionInterval) {
            this.makeDecision(gameState);
            this.lastDecisionTime = this.behaviorTimer;
        }
        
        // 执行当前行为
        this.executeBehavior(deltaTime, gameState);
        
        // 调用父类更新
        super.update(deltaTime, gameState);
        
        // 更新位置记录
        this.updatePositionTracking();
    }

    /**
     * 更新记忆系统
     */
    updateMemory(deltaTime) {
        // 清理过期的记忆
        const currentTime = this.behaviorTimer;
        this.memory.playerPositions = this.memory.playerPositions.filter(
            pos => currentTime - pos.time < this.memory.memoryDecayTime
        );
    }

    /**
     * 检测卡住状态
     */
    checkStuckState(deltaTime) {
        const currentPos = new Vector2(this.x, this.y);
        const distanceMoved = Vector2.distance(currentPos, this.lastPosition);
        
        if (distanceMoved < 5 && this.isMoving) {
            this.stuckTimer += deltaTime;
            
            if (this.stuckTimer >= this.stuckThreshold) {
                this.handleStuckState();
            }
        } else {
            this.stuckTimer = 0;
        }
    }

    /**
     * 处理卡住状态
     */
    handleStuckState() {
        console.log('敌方坦克卡住，尝试脱困');
        
        // 随机改变方向
        const directions = [TankDirection.UP, TankDirection.RIGHT, TankDirection.DOWN, TankDirection.LEFT];
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        
        this.setDirection(randomDirection);
        this.behaviorState = AIBehaviorState.STUCK;
        this.stuckTimer = 0;
        
        // 1秒后恢复正常行为
        setTimeout(() => {
            if (!this.isDestroyed) {
                this.behaviorState = AIBehaviorState.PATROL;
            }
        }, 1000);
    }

    /**
     * AI决策制定
     */
    makeDecision(gameState) {
        // 感知环境
        this.perceiveEnvironment(gameState);
        
        // 根据当前状态和感知信息决定行为
        const newState = this.decideBehavior(gameState);
        
        if (newState !== this.behaviorState) {
            this.changeBehaviorState(newState);
        }
    }

    /**
     * 感知环境
     */
    perceiveEnvironment(gameState) {
        // 寻找玩家坦克
        this.target = this.findPlayerTank(gameState);
        
        // 如果发现目标，更新记忆
        if (this.target) {
            this.updatePlayerMemory(this.target);
        }
        
        // 检测声音（其他坦克的射击）
        this.detectSounds(gameState);
    }

    /**
     * 寻找玩家坦克
     */
    findPlayerTank(gameState) {
        if (!gameState.entities) {
            return null;
        }
        
        const playerTanks = gameState.entities.filter(entity => 
            entity.isPlayer && entity.isPlayer() && !entity.isDestroyed
        );
        
        for (const player of playerTanks) {
            if (this.canSeeTarget(player)) {
                return player;
            }
        }
        
        return null;
    }

    /**
     * 检查是否能看到目标
     */
    canSeeTarget(target) {
        const distance = this.distanceTo(target);
        
        if (distance > this.sightRange) {
            return false;
        }
        
        // 简单的视线检查（在实际游戏中需要考虑障碍物）
        return true;
    }

    /**
     * 更新玩家记忆
     */
    updatePlayerMemory(player) {
        const currentTime = this.behaviorTimer;
        const playerPos = {
            position: player.getCenter(),
            time: currentTime
        };
        
        this.memory.playerPositions.push(playerPos);
        this.memory.lastPlayerSeen = currentTime;
        
        // 限制记忆大小
        if (this.memory.playerPositions.length > this.memory.maxMemorySize) {
            this.memory.playerPositions.shift();
        }
        
        this.lastKnownTargetPosition = playerPos.position.clone();
    }

    /**
     * 检测声音
     */
    detectSounds(gameState) {
        // 检测附近的射击声音
        if (gameState.recentSounds) {
            for (const sound of gameState.recentSounds) {
                if (sound.type === 'gunshot') {
                    const distance = Vector2.distance(
                        this.getCenter(),
                        sound.position
                    );
                    
                    if (distance <= this.hearingRange) {
                        this.investigateSound(sound.position);
                    }
                }
            }
        }
    }

    /**
     * 调查声音
     */
    investigateSound(soundPosition) {
        if (this.behaviorState === AIBehaviorState.PATROL) {
            this.lastKnownTargetPosition = soundPosition.clone();
            this.changeBehaviorState(AIBehaviorState.SEARCH);
        }
    }

    /**
     * 决定行为状态
     */
    decideBehavior(gameState) {
        const currentTime = this.behaviorTimer;
        
        // 如果有直接视觉接触的目标
        if (this.target) {
            const distanceToTarget = this.distanceTo(this.target);
            
            if (distanceToTarget <= this.attackRange) {
                return AIBehaviorState.ATTACK;
            } else {
                return AIBehaviorState.CHASE;
            }
        }
        
        // 如果有最近的目标记忆
        if (this.lastKnownTargetPosition && 
            currentTime - this.memory.lastPlayerSeen < 3.0) {
            return AIBehaviorState.SEARCH;
        }
        
        // 检查是否需要撤退（生命值低）
        if (this.health <= this.maxHealth * 0.3) {
            return AIBehaviorState.RETREAT;
        }
        
        // 默认巡逻
        return AIBehaviorState.PATROL;
    }

    /**
     * 改变行为状态
     */
    changeBehaviorState(newState) {
        console.log(`敌方坦克行为改变: ${this.behaviorState} -> ${newState}`);
        
        this.previousBehaviorState = this.behaviorState;
        this.behaviorState = newState;
        this.behaviorTimer = 0;
        
        // 状态切换时的初始化
        this.onBehaviorStateEnter(newState);
    }

    /**
     * 行为状态进入时的初始化
     */
    onBehaviorStateEnter(state) {
        switch (state) {
            case AIBehaviorState.CHASE:
                this.burstFireCount = 0;
                break;
                
            case AIBehaviorState.ATTACK:
                this.burstFireCount = 0;
                break;
                
            case AIBehaviorState.RETREAT:
                // 寻找远离玩家的方向
                this.findRetreatDirection();
                break;
                
            case AIBehaviorState.SEARCH:
                // 设置搜索目标点
                this.setSearchTarget();
                break;
        }
    }

    /**
     * 执行当前行为
     */
    executeBehavior(deltaTime, gameState) {
        switch (this.behaviorState) {
            case AIBehaviorState.IDLE:
                this.executeIdle(deltaTime);
                break;
                
            case AIBehaviorState.PATROL:
                this.executePatrol(deltaTime);
                break;
                
            case AIBehaviorState.CHASE:
                this.executeChase(deltaTime);
                break;
                
            case AIBehaviorState.ATTACK:
                this.executeAttack(deltaTime, gameState);
                break;
                
            case AIBehaviorState.RETREAT:
                this.executeRetreat(deltaTime);
                break;
                
            case AIBehaviorState.SEARCH:
                this.executeSearch(deltaTime);
                break;
                
            case AIBehaviorState.STUCK:
                this.executeStuck(deltaTime);
                break;
        }
    }

    /**
     * 执行待机行为
     */
    executeIdle(deltaTime) {
        this.stopMoving();
        
        // 待机一段时间后开始巡逻
        if (this.behaviorTimer > 2.0) {
            this.changeBehaviorState(AIBehaviorState.PATROL);
        }
    }

    /**
     * 执行巡逻行为
     */
    executePatrol(deltaTime) {
        if (this.waypoints.length === 0) {
            return;
        }
        
        const targetWaypoint = this.waypoints[this.currentWaypoint];
        const distance = Vector2.distance(this.getCenter(), targetWaypoint);
        
        if (distance < 20) {
            // 到达路径点，前往下一个
            this.currentWaypoint = (this.currentWaypoint + 1) % this.waypoints.length;
            targetWaypoint = this.waypoints[this.currentWaypoint];
        }
        
        // 移动向目标路径点
        this.moveTowards(targetWaypoint);
    }

    /**
     * 执行追击行为
     */
    executeChase(deltaTime) {
        if (!this.target) {
            this.changeBehaviorState(AIBehaviorState.SEARCH);
            return;
        }
        
        // 移动向目标
        this.moveTowards(this.target.getCenter());
        
        // 如果在射程内，偶尔开火
        const distance = this.distanceTo(this.target);
        if (distance <= this.attackRange && Math.random() < 0.3) {
            this.attemptShoot(gameState);
        }
    }

    /**
     * 执行攻击行为
     */
    executeAttack(deltaTime, gameState) {
        if (!this.target) {
            this.changeBehaviorState(AIBehaviorState.SEARCH);
            return;
        }
        
        // 瞄准目标
        this.aimAtTarget(this.target);
        
        // 停止移动以提高射击精度
        this.stopMoving();
        
        // 射击
        this.attemptShoot(gameState);
        
        // 连射控制
        if (this.burstFireCount >= this.maxBurstFire) {
            this.changeBehaviorState(AIBehaviorState.CHASE);
        }
    }

    /**
     * 执行撤退行为
     */
    executeRetreat(deltaTime) {
        // 远离玩家
        if (this.target) {
            const retreatDirection = this.getRetreatDirection(this.target);
            this.moveInDirection(retreatDirection);
        } else {
            // 随机移动
            this.moveInDirection(this.direction);
        }
        
        // 撤退一段时间后恢复巡逻
        if (this.behaviorTimer > this.stateDurations.retreat) {
            this.changeBehaviorState(AIBehaviorState.PATROL);
        }
    }

    /**
     * 执行搜索行为
     */
    executeSearch(deltaTime) {
        if (this.lastKnownTargetPosition) {
            const distance = Vector2.distance(
                this.getCenter(),
                this.lastKnownTargetPosition
            );
            
            if (distance > 30) {
                this.moveTowards(this.lastKnownTargetPosition);
            } else {
                // 到达搜索位置，开始随机搜索
                this.randomSearch();
            }
        }
        
        // 搜索超时
        if (this.behaviorTimer > this.stateDurations.search) {
            this.changeBehaviorState(AIBehaviorState.PATROL);
        }
    }

    /**
     * 执行卡住行为
     */
    executeStuck(deltaTime) {
        // 随机移动尝试脱困
        this.startMoving(this.direction);
    }

    /**
     * 移动向目标位置
     */
    moveTowards(targetPosition) {
        const currentPos = this.getCenter();
        const direction = Vector2.subtract(targetPosition, currentPos);
        
        if (direction.length() > 5) {
            // 确定主要移动方向
            const angle = direction.angle();
            const tankDirection = this.angleToTankDirection(angle);
            
            this.startMoving(tankDirection);
        } else {
            this.stopMoving();
        }
    }

    /**
     * 向指定方向移动
     */
    moveInDirection(direction) {
        this.startMoving(direction);
    }

    /**
     * 瞄准目标
     */
    aimAtTarget(target) {
        const targetPos = target.getCenter();
        const currentPos = this.getCenter();
        const direction = Vector2.subtract(targetPos, currentPos);
        
        // 预测目标位置（简单预测）
        if (target.velocity && target.velocity.length() > 0) {
            const timeToTarget = direction.length() / this.bulletSpeed;
            const predictedPos = Vector2.add(
                targetPos,
                Vector2.multiply(target.velocity, timeToTarget)
            );
            direction.copy(Vector2.subtract(predictedPos, currentPos));
        }
        
        const angle = direction.angle();
        const tankDirection = this.angleToTankDirection(angle);
        
        this.setDirection(tankDirection);
    }

    /**
     * 尝试射击
     */
    attemptShoot(gameState) {
        if (!this.canShoot) {
            return;
        }
        
        // 添加瞄准误差
        const accuracy = this.aimAccuracy + (Math.random() - 0.5) * 0.2;
        
        if (Math.random() < accuracy) {
            const bullet = this.shoot(gameState.audioManager);
            if (bullet) {
                this.burstFireCount++;
                this.lastShotTime = this.behaviorTimer;
            }
        }
    }

    /**
     * 角度转换为坦克方向
     */
    angleToTankDirection(angle) {
        // 将角度标准化到 0-2π
        while (angle < 0) angle += Math.PI * 2;
        while (angle >= Math.PI * 2) angle -= Math.PI * 2;
        
        // 转换为坦克方向
        if (angle >= -Math.PI/4 && angle < Math.PI/4) {
            return TankDirection.RIGHT;
        } else if (angle >= Math.PI/4 && angle < 3*Math.PI/4) {
            return TankDirection.DOWN;
        } else if (angle >= 3*Math.PI/4 && angle < 5*Math.PI/4) {
            return TankDirection.LEFT;
        } else {
            return TankDirection.UP;
        }
    }

    /**
     * 获取撤退方向
     */
    getRetreatDirection(threat) {
        const currentPos = this.getCenter();
        const threatPos = threat.getCenter();
        const direction = Vector2.subtract(currentPos, threatPos);
        
        const angle = direction.angle();
        return this.angleToTankDirection(angle);
    }

    /**
     * 寻找撤退方向
     */
    findRetreatDirection() {
        if (this.target) {
            this.direction = this.getRetreatDirection(this.target);
        } else {
            // 随机方向
            const directions = [TankDirection.UP, TankDirection.RIGHT, TankDirection.DOWN, TankDirection.LEFT];
            this.direction = directions[Math.floor(Math.random() * directions.length)];
        }
    }

    /**
     * 设置搜索目标
     */
    setSearchTarget() {
        if (!this.lastKnownTargetPosition) {
            // 随机搜索位置
            this.lastKnownTargetPosition = new Vector2(
                this.x + (Math.random() - 0.5) * 200,
                this.y + (Math.random() - 0.5) * 200
            );
        }
    }

    /**
     * 随机搜索
     */
    randomSearch() {
        const directions = [TankDirection.UP, TankDirection.RIGHT, TankDirection.DOWN, TankDirection.LEFT];
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        
        this.startMoving(randomDirection);
        
        // 移动一小段时间后停止
        setTimeout(() => {
            if (!this.isDestroyed) {
                this.stopMoving();
            }
        }, 500);
    }

    /**
     * 更新位置跟踪
     */
    updatePositionTracking() {
        this.lastPosition.set(this.x, this.y);
    }

    /**
     * 获取AI状态信息
     */
    getAIStatus() {
        return {
            behaviorState: this.behaviorState,
            difficulty: this.difficulty,
            hasTarget: !!this.target,
            targetDistance: this.target ? this.distanceTo(this.target) : null,
            memoryCount: this.memory.playerPositions.length,
            stuckTimer: this.stuckTimer,
            burstFireCount: this.burstFireCount
        };
    }

    /**
     * 渲染敌方坦克（包含AI调试信息）
     */
    render(renderer) {
        super.render(renderer);
        
        // 在调试模式下显示AI信息
        if (renderer.debugMode) {
            this.renderDebugInfo(renderer);
        }
    }

    /**
     * 渲染调试信息
     */
    renderDebugInfo(renderer) {
        const x = this.x;
        const y = this.y - 30;
        
        // 显示行为状态
        renderer.drawText(this.behaviorState, x, y, '#ffffff', '10px Arial');
        
        // 显示视野范围
        renderer.setGlobalAlpha(0.1);
        renderer.drawCircle(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.sightRange,
            '#00ff00'
        );
        renderer.resetGlobalAlpha();
        
        // 显示攻击范围
        renderer.setGlobalAlpha(0.1);
        renderer.drawCircle(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.attackRange,
            '#ff0000'
        );
        renderer.resetGlobalAlpha();
        
        // 显示目标线
        if (this.target) {
            renderer.drawLine(
                this.getCenter(),
                this.target.getCenter(),
                '#ff0000',
                2
            );
        }
        
        // 显示最后已知位置
        if (this.lastKnownTargetPosition) {
            renderer.drawCircle(
                this.lastKnownTargetPosition.x,
                this.lastKnownTargetPosition.y,
                5,
                '#ffff00'
            );
        }
    }
}





