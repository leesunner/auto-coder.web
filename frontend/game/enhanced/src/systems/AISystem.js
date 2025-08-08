













import { EventEmitter } from '../utils/EventEmitter.js';
import { Logger } from '../utils/Logger.js';

/**
 * AI系统
 * 管理游戏中所有AI实体的行为和决策
 */
export class AISystem extends EventEmitter {
    constructor(gameWorld) {
        super();
        
        this.gameWorld = gameWorld;
        
        // AI实体注册表
        this.aiEntities = new Map();
        
        // AI行为树
        this.behaviorTrees = new Map();
        
        // AI状态机
        this.stateMachines = new Map();
        
        // 寻路系统
        this.pathfinding = new PathfindingSystem();
        
        // AI难度设置
        this.difficultySettings = {
            easy: {
                reactionTime: 800,
                accuracy: 0.6,
                aggressiveness: 0.3,
                pathfindingAccuracy: 0.7
            },
            normal: {
                reactionTime: 500,
                accuracy: 0.75,
                aggressiveness: 0.6,
                pathfindingAccuracy: 0.85
            },
            hard: {
                reactionTime: 300,
                accuracy: 0.9,
                aggressiveness: 0.8,
                pathfindingAccuracy: 0.95
            },
            boss: {
                reactionTime: 200,
                accuracy: 0.95,
                aggressiveness: 1.0,
                pathfindingAccuracy: 1.0
            }
        };
        
        // AI行为模式
        this.behaviorPatterns = new Map();
        this.initializeBehaviorPatterns();
        
        // 群体AI设置
        this.swarmSettings = {
            communicationRange: 200,
            flockingEnabled: true,
            leaderFollowDistance: 100
        };
    }

    /**
     * 初始化行为模式
     */
    initializeBehaviorPatterns() {
        // 基础巡逻行为
        this.behaviorPatterns.set('patrol', {
            name: 'patrol',
            priority: 1,
            states: ['patrolling', 'investigating', 'returning'],
            transitions: {
                patrolling: {
                    playerDetected: 'investigating',
                    reachedWaypoint: 'patrolling'
                },
                investigating: {
                    playerLost: 'returning',
                    playerFound: 'chasing'
                },
                returning: {
                    reachedStartPoint: 'patrolling'
                }
            }
        });

        // 追击行为
        this.behaviorPatterns.set('chase', {
            name: 'chase',
            priority: 3,
            states: ['chasing', 'attacking', 'searching'],
            transitions: {
                chasing: {
                    inRange: 'attacking',
                    playerLost: 'searching'
                },
                attacking: {
                    outOfRange: 'chasing',
                    playerDestroyed: 'patrolling'
                },
                searching: {
                    playerFound: 'chasing',
                    timeout: 'patrolling'
                }
            }
        });

        // 防御行为
        this.behaviorPatterns.set('defend', {
            name: 'defend',
            priority: 2,
            states: ['guarding', 'engaging', 'retreating'],
            transitions: {
                guarding: {
                    enemyInZone: 'engaging'
                },
                engaging: {
                    enemyDefeated: 'guarding',
                    lowHealth: 'retreating'
                },
                retreating: {
                    healthRestored: 'guarding',
                    safeZoneReached: 'guarding'
                }
            }
        });

        // Boss AI行为
        this.behaviorPatterns.set('boss', {
            name: 'boss',
            priority: 5,
            states: ['phase1', 'phase2', 'phase3', 'enraged'],
            transitions: {
                phase1: {
                    healthBelow75: 'phase2'
                },
                phase2: {
                    healthBelow50: 'phase3'
                },
                phase3: {
                    healthBelow25: 'enraged'
                },
                enraged: {
                    defeated: 'destroyed'
                }
            }
        });
    }

    /**
     * 注册AI实体
     */
    registerAI(entity, aiConfig) {
        const aiData = {
            entity: entity,
            config: aiConfig,
            currentState: aiConfig.initialState || 'idle',
            behaviorTree: this.createBehaviorTree(aiConfig.behavior),
            stateMachine: this.createStateMachine(aiConfig.behavior),
            memory: new AIMemory(),
            sensors: new AISensors(entity, this.gameWorld),
            lastUpdate: 0,
            reactionTimer: 0
        };

        this.aiEntities.set(entity.id, aiData);
        
        Logger.debug(`AI实体注册: ${entity.id}, 行为: ${aiConfig.behavior}`);
        
        this.emit('aiRegistered', { entity, aiConfig });
        
        return aiData;
    }

    /**
     * 注销AI实体
     */
    unregisterAI(entityId) {
        const aiData = this.aiEntities.get(entityId);
        if (aiData) {
            this.aiEntities.delete(entityId);
            this.emit('aiUnregistered', { entityId });
        }
    }

    /**
     * 创建行为树
     */
    createBehaviorTree(behaviorType) {
        switch (behaviorType) {
            case 'patrol':
                return new PatrolBehaviorTree();
            case 'chase':
                return new ChaseBehaviorTree();
            case 'defend':
                return new DefendBehaviorTree();
            case 'boss':
                return new BossBehaviorTree();
            default:
                return new BasicBehaviorTree();
        }
    }

    /**
     * 创建状态机
     */
    createStateMachine(behaviorType) {
        const pattern = this.behaviorPatterns.get(behaviorType);
        if (!pattern) {
            return new BasicStateMachine();
        }
        
        return new AIStateMachine(pattern);
    }

    /**
     * 更新AI系统
     */
    update(deltaTime) {
        for (const [entityId, aiData] of this.aiEntities) {
            this.updateAI(aiData, deltaTime);
        }
        
        // 更新群体AI行为
        this.updateSwarmBehavior(deltaTime);
        
        // 更新寻路系统
        this.pathfinding.update(deltaTime);
    }

    /**
     * 更新单个AI实体
     */
    updateAI(aiData, deltaTime) {
        const { entity, config, sensors, memory, behaviorTree, stateMachine } = aiData;
        
        // 检查实体是否仍然有效
        if (!entity.isActive) {
            this.unregisterAI(entity.id);
            return;
        }

        // 更新传感器
        sensors.update(deltaTime);
        
        // 更新记忆
        memory.update(deltaTime);
        
        // 获取感知信息
        const perception = sensors.getPerception();
        
        // 更新行为树
        const decision = behaviorTree.update(perception, memory, deltaTime);
        
        // 更新状态机
        stateMachine.update(decision, deltaTime);
        
        // 执行AI决策
        this.executeDecision(aiData, decision, deltaTime);
        
        aiData.lastUpdate = Date.now();
    }

    /**
     * 执行AI决策
     */
    executeDecision(aiData, decision, deltaTime) {
        const { entity, config } = aiData;
        const difficulty = this.difficultySettings[config.difficulty] || this.difficultySettings.normal;
        
        // 应用反应时间延迟
        if (aiData.reactionTimer > 0) {
            aiData.reactionTimer -= deltaTime;
            return;
        }

        switch (decision.action) {
            case 'move':
                this.executeMove(entity, decision, difficulty);
                break;
            case 'attack':
                this.executeAttack(entity, decision, difficulty);
                break;
            case 'patrol':
                this.executePatrol(entity, decision, difficulty);
                break;
            case 'chase':
                this.executeChase(entity, decision, difficulty);
                break;
            case 'defend':
                this.executeDefend(entity, decision, difficulty);
                break;
            case 'retreat':
                this.executeRetreat(entity, decision, difficulty);
                break;
            case 'idle':
                this.executeIdle(entity, decision, difficulty);
                break;
        }
        
        // 设置新的反应时间
        aiData.reactionTimer = difficulty.reactionTime;
    }

    /**
     * 执行移动
     */
    executeMove(entity, decision, difficulty) {
        const target = decision.target;
        if (!target) return;

        // 使用寻路系统计算路径
        const path = this.pathfinding.findPath(
            entity.position,
            target,
            difficulty.pathfindingAccuracy
        );

        if (path && path.length > 1) {
            const nextWaypoint = path[1];
            const direction = this.calculateDirection(entity.position, nextWaypoint);
            
            entity.setMovementDirection(direction);
            entity.startMoving();
        }
    }

    /**
     * 执行攻击
     */
    executeAttack(entity, decision, difficulty) {
        const target = decision.target;
        if (!target) return;

        // 计算射击精度
        const accuracy = difficulty.accuracy;
        const distance = this.calculateDistance(entity.position, target.position);
        const aimOffset = this.calculateAimOffset(distance, accuracy);
        
        // 预测目标位置
        const predictedPosition = this.predictTargetPosition(target, distance);
        
        // 添加精度偏移
        const aimPoint = {
            x: predictedPosition.x + aimOffset.x,
            y: predictedPosition.y + aimOffset.y
        };
        
        // 执行射击
        entity.aimAt(aimPoint);
        entity.shoot();
    }

    /**
     * 执行巡逻
     */
    executePatrol(entity, decision, difficulty) {
        const aiData = this.aiEntities.get(entity.id);
        if (!aiData) return;

        let waypoints = aiData.memory.get('patrolWaypoints');
        if (!waypoints) {
            waypoints = this.generatePatrolWaypoints(entity.position);
            aiData.memory.set('patrolWaypoints', waypoints);
            aiData.memory.set('currentWaypointIndex', 0);
        }

        const currentIndex = aiData.memory.get('currentWaypointIndex');
        const currentWaypoint = waypoints[currentIndex];
        
        if (this.isNearPosition(entity.position, currentWaypoint, 20)) {
            const nextIndex = (currentIndex + 1) % waypoints.length;
            aiData.memory.set('currentWaypointIndex', nextIndex);
        }

        this.executeMove(entity, { target: currentWaypoint }, difficulty);
    }

    /**
     * 执行追击
     */
    executeChase(entity, decision, difficulty) {
        const target = decision.target;
        if (!target) return;

        const distance = this.calculateDistance(entity.position, target.position);
        
        if (distance > entity.attackRange) {
            // 移动到攻击范围内
            this.executeMove(entity, decision, difficulty);
        } else {
            // 在攻击范围内，开始攻击
            this.executeAttack(entity, decision, difficulty);
        }
    }

    /**
     * 执行防御
     */
    executeDefend(entity, decision, difficulty) {
        const defendPoint = decision.defendPoint || entity.spawnPosition;
        const threats = decision.threats || [];
        
        if (threats.length > 0) {
            // 面对最近的威胁
            const nearestThreat = this.findNearestThreat(entity, threats);
            this.executeAttack(entity, { target: nearestThreat }, difficulty);
        } else {
            // 返回防御位置
            if (!this.isNearPosition(entity.position, defendPoint, 30)) {
                this.executeMove(entity, { target: defendPoint }, difficulty);
            }
        }
    }

    /**
     * 执行撤退
     */
    executeRetreat(entity, decision, difficulty) {
        const threats = decision.threats || [];
        let retreatDirection = decision.retreatDirection;
        
        if (!retreatDirection && threats.length > 0) {
            // 计算远离威胁的方向
            retreatDirection = this.calculateRetreatDirection(entity, threats);
        }
        
        if (retreatDirection) {
            const retreatTarget = {
                x: entity.position.x + retreatDirection.x * 100,
                y: entity.position.y + retreatDirection.y * 100
            };
            
            this.executeMove(entity, { target: retreatTarget }, difficulty);
        }
    }

    /**
     * 执行空闲
     */
    executeIdle(entity, decision, difficulty) {
        entity.stopMoving();
        
        // 随机转向
        if (Math.random() < 0.1) {
            const randomDirection = Math.random() * Math.PI * 2;
            entity.setRotation(randomDirection);
        }
    }

    /**
     * 更新群体AI行为
     */
    updateSwarmBehavior(deltaTime) {
        if (!this.swarmSettings.flockingEnabled) return;

        const entities = Array.from(this.aiEntities.values()).map(ai => ai.entity);
        
        for (const aiData of this.aiEntities.values()) {
            const entity = aiData.entity;
            const neighbors = this.findNeighbors(entity, entities, this.swarmSettings.communicationRange);
            
            if (neighbors.length > 0) {
                const flockingForce = this.calculateFlockingForce(entity, neighbors);
                entity.applyForce(flockingForce);
            }
        }
    }

    /**
     * 计算群体行为力
     */
    calculateFlockingForce(entity, neighbors) {
        const separation = this.calculateSeparation(entity, neighbors);
        const alignment = this.calculateAlignment(entity, neighbors);
        const cohesion = this.calculateCohesion(entity, neighbors);
        
        return {
            x: separation.x * 0.5 + alignment.x * 0.3 + cohesion.x * 0.2,
            y: separation.y * 0.5 + alignment.y * 0.3 + cohesion.y * 0.2
        };
    }

    /**
     * 计算分离力
     */
    calculateSeparation(entity, neighbors) {
        const force = { x: 0, y: 0 };
        let count = 0;
        
        for (const neighbor of neighbors) {
            const distance = this.calculateDistance(entity.position, neighbor.position);
            if (distance < 50 && distance > 0) {
                const diff = {
                    x: entity.position.x - neighbor.position.x,
                    y: entity.position.y - neighbor.position.y
                };
                
                // 归一化并按距离加权
                const length = Math.sqrt(diff.x * diff.x + diff.y * diff.y);
                if (length > 0) {
                    diff.x /= length;
                    diff.y /= length;
                    diff.x /= distance; // 距离越近，力越大
                    diff.y /= distance;
                    
                    force.x += diff.x;
                    force.y += diff.y;
                    count++;
                }
            }
        }
        
        if (count > 0) {
            force.x /= count;
            force.y /= count;
        }
        
        return force;
    }

    /**
     * 计算对齐力
     */
    calculateAlignment(entity, neighbors) {
        const force = { x: 0, y: 0 };
        let count = 0;
        
        for (const neighbor of neighbors) {
            force.x += neighbor.velocity.x;
            force.y += neighbor.velocity.y;
            count++;
        }
        
        if (count > 0) {
            force.x /= count;
            force.y /= count;
            
            // 归一化
            const length = Math.sqrt(force.x * force.x + force.y * force.y);
            if (length > 0) {
                force.x /= length;
                force.y /= length;
            }
        }
        
        return force;
    }

    /**
     * 计算聚合力
     */
    calculateCohesion(entity, neighbors) {
        const center = { x: 0, y: 0 };
        let count = 0;
        
        for (const neighbor of neighbors) {
            center.x += neighbor.position.x;
            center.y += neighbor.position.y;
            count++;
        }
        
        if (count > 0) {
            center.x /= count;
            center.y /= count;
            
            const force = {
                x: center.x - entity.position.x,
                y: center.y - entity.position.y
            };
            
            // 归一化
            const length = Math.sqrt(force.x * force.x + force.y * force.y);
            if (length > 0) {
                force.x /= length;
                force.y /= length;
            }
            
            return force;
        }
        
        return { x: 0, y: 0 };
    }

    /**
     * 寻找邻居
     */
    findNeighbors(entity, entities, range) {
        return entities.filter(other => {
            if (other === entity) return false;
            const distance = this.calculateDistance(entity.position, other.position);
            return distance <= range;
        });
    }

    /**
     * 生成巡逻路径点
     */
    generatePatrolWaypoints(startPosition) {
        const waypoints = [];
        const numWaypoints = 4;
        const radius = 150;
        
        for (let i = 0; i < numWaypoints; i++) {
            const angle = (i / numWaypoints) * Math.PI * 2;
            waypoints.push({
                x: startPosition.x + Math.cos(angle) * radius,
                y: startPosition.y + Math.sin(angle) * radius
            });
        }
        
        return waypoints;
    }

    /**
     * 计算方向
     */
    calculateDirection(from, to) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) return { x: 0, y: 0 };
        
        return {
            x: dx / length,
            y: dy / length
        };
    }

    /**
     * 计算距离
     */
    calculateDistance(pos1, pos2) {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 计算瞄准偏移
     */
    calculateAimOffset(distance, accuracy) {
        const maxOffset = distance * (1 - accuracy) * 0.1;
        return {
            x: (Math.random() - 0.5) * maxOffset,
            y: (Math.random() - 0.5) * maxOffset
        };
    }

    /**
     * 预测目标位置
     */
    predictTargetPosition(target, distance) {
        const bulletSpeed = 300; // 假设子弹速度
        const timeToTarget = distance / bulletSpeed;
        
        return {
            x: target.position.x + target.velocity.x * timeToTarget,
            y: target.position.y + target.velocity.y * timeToTarget
        };
    }

    /**
     * 检查是否接近位置
     */
    isNearPosition(pos1, pos2, threshold) {
        return this.calculateDistance(pos1, pos2) <= threshold;
    }

    /**
     * 寻找最近的威胁
     */
    findNearestThreat(entity, threats) {
        let nearest = null;
        let minDistance = Infinity;
        
        for (const threat of threats) {
            const distance = this.calculateDistance(entity.position, threat.position);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = threat;
            }
        }
        
        return nearest;
    }

    /**
     * 计算撤退方向
     */
    calculateRetreatDirection(entity, threats) {
        const avoidanceVector = { x: 0, y: 0 };
        
        for (const threat of threats) {
            const direction = this.calculateDirection(threat.position, entity.position);
            const distance = this.calculateDistance(entity.position, threat.position);
            const weight = 1 / Math.max(distance, 1);
            
            avoidanceVector.x += direction.x * weight;
            avoidanceVector.y += direction.y * weight;
        }
        
        // 归一化
        const length = Math.sqrt(avoidanceVector.x * avoidanceVector.x + avoidanceVector.y * avoidanceVector.y);
        if (length > 0) {
            avoidanceVector.x /= length;
            avoidanceVector.y /= length;
        }
        
        return avoidanceVector;
    }

    /**
     * 设置AI难度
     */
    setDifficulty(entityId, difficulty) {
        const aiData = this.aiEntities.get(entityId);
        if (aiData) {
            aiData.config.difficulty = difficulty;
        }
    }

    /**
     * 获取AI统计信息
     */
    getStatistics() {
        const stats = {
            totalAIs: this.aiEntities.size,
            behaviorCounts: {},
            difficultyCounts: {},
            averageReactionTime: 0
        };
        
        let totalReactionTime = 0;
        
        for (const aiData of this.aiEntities.values()) {
            const behavior = aiData.config.behavior;
            const difficulty = aiData.config.difficulty;
            
            stats.behaviorCounts[behavior] = (stats.behaviorCounts[behavior] || 0) + 1;
            stats.difficultyCounts[difficulty] = (stats.difficultyCounts[difficulty] || 0) + 1;
            
            const difficultySettings = this.difficultySettings[difficulty] || this.difficultySettings.normal;
            totalReactionTime += difficultySettings.reactionTime;
        }
        
        if (this.aiEntities.size > 0) {
            stats.averageReactionTime = totalReactionTime / this.aiEntities.size;
        }
        
        return stats;
    }

    /**
     * 销毁AI系统
     */
    dispose() {
        this.aiEntities.clear();
        this.behaviorTrees.clear();
        this.stateMachines.clear();
        this.pathfinding.dispose();
        this.emit('disposed');
    }
}

/**
 * AI记忆系统
 */
class AIMemory {
    constructor() {
        this.shortTermMemory = new Map();
        this.longTermMemory = new Map();
        this.memoryDecay = 0.001; // 记忆衰减率
    }

    set(key, value, isLongTerm = false) {
        const memory = isLongTerm ? this.longTermMemory : this.shortTermMemory;
        memory.set(key, {
            value: value,
            timestamp: Date.now(),
            strength: 1.0
        });
    }

    get(key) {
        const shortTerm = this.shortTermMemory.get(key);
        const longTerm = this.longTermMemory.get(key);
        
        if (shortTerm && (!longTerm || shortTerm.timestamp > longTerm.timestamp)) {
            return shortTerm.value;
        }
        
        return longTerm ? longTerm.value : null;
    }

    update(deltaTime) {
        // 衰减短期记忆
        for (const [key, memory] of this.shortTermMemory) {
            memory.strength -= this.memoryDecay * deltaTime;
            if (memory.strength <= 0) {
                this.shortTermMemory.delete(key);
            }
        }
    }
}

/**
 * AI传感器系统
 */
class AISensors {
    constructor(entity, gameWorld) {
        this.entity = entity;
        this.gameWorld = gameWorld;
        this.sightRange = 200;
        this.sightAngle = Math.PI; // 180度视野
        this.hearingRange = 150;
    }

    update(deltaTime) {
        // 更新传感器数据
    }

    getPerception() {
        return {
            visibleEnemies: this.getVisibleEnemies(),
            audibleSounds: this.getAudibleSounds(),
            nearbyObjects: this.getNearbyObjects(),
            environmentInfo: this.getEnvironmentInfo()
        };
    }

    getVisibleEnemies() {
        // 实现视觉检测逻辑
        return [];
    }

    getAudibleSounds() {
        // 实现听觉检测逻辑
        return [];
    }

    getNearbyObjects() {
        // 实现物体检测逻辑
        return [];
    }

    getEnvironmentInfo() {
        // 实现环境信息检测
        return {};
    }
}

/**
 * 寻路系统
 */
class PathfindingSystem {
    constructor() {
        this.grid = null;
        this.nodeSize = 20;
    }

    findPath(start, end, accuracy = 1.0) {
        // 简化的寻路实现
        // 在实际项目中，这里应该实现A*算法或其他寻路算法
        return [start, end];
    }

    update(deltaTime) {
        // 更新寻路系统
    }

    dispose() {
        this.grid = null;
    }
}

/**
 * AI状态机
 */
class AIStateMachine {
    constructor(pattern) {
        this.pattern = pattern;
        this.currentState = pattern.states[0];
        this.stateTimer = 0;
    }

    update(decision, deltaTime) {
        this.stateTimer += deltaTime;
        
        // 检查状态转换
        const transitions = this.pattern.transitions[this.currentState];
        if (transitions && decision.trigger) {
            const newState = transitions[decision.trigger];
            if (newState) {
                this.currentState = newState;
                this.stateTimer = 0;
            }
        }
    }

    getCurrentState() {
        return this.currentState;
    }
}

/**
 * 基础行为树
 */
class BasicBehaviorTree {
    update(perception, memory, deltaTime) {
        return { action: 'idle' };
    }
}

/**
 * 巡逻行为树
 */
class PatrolBehaviorTree extends BasicBehaviorTree {
    update(perception, memory, deltaTime) {
        if (perception.visibleEnemies.length > 0) {
            return {
                action: 'chase',
                target: perception.visibleEnemies[0],
                trigger: 'playerDetected'
            };
        }
        
        return {
            action: 'patrol',
            trigger: 'patrolling'
        };
    }
}

/**
 * 追击行为树
 */
class ChaseBehaviorTree extends BasicBehaviorTree {
    update(perception, memory, deltaTime) {
        if (perception.visibleEnemies.length > 0) {
            const target = perception.visibleEnemies[0];
            const distance = Math.sqrt(
                Math.pow(target.position.x - this.entity.position.x, 2) +
                Math.pow(target.position.y - this.entity.position.y, 2)
            );
            
            if (distance <= this.entity.attackRange) {
                return {
                    action: 'attack',
                    target: target,
                    trigger: 'inRange'
                };
            } else {
                return {
                    action: 'chase',
                    target: target,
                    trigger: 'chasing'
                };
            }
        }
        
        return {
            action: 'patrol',
            trigger: 'playerLost'
        };
    }
}

/**
 * 防御行为树
 */
class DefendBehaviorTree extends BasicBehaviorTree {
    update(perception, memory, deltaTime) {
        const threats = perception.visibleEnemies;
        
        if (threats.length > 0) {
            return {
                action: 'defend',
                threats: threats,
                trigger: 'enemyInZone'
            };
        }
        
        return {
            action: 'patrol',
            trigger: 'guarding'
        };
    }
}

/**
 * Boss行为树
 */
class BossBehaviorTree extends BasicBehaviorTree {
    update(perception, memory, deltaTime) {
        const healthPercent = this.entity.health / this.entity.maxHealth;
        
        if (healthPercent < 0.25) {
            return {
                action: 'attack',
                target: perception.visibleEnemies[0],
                intensity: 'enraged',
                trigger: 'healthBelow25'
            };
        } else if (healthPercent < 0.5) {
            return {
                action: 'attack',
                target: perception.visibleEnemies[0],
                intensity: 'aggressive',
                trigger: 'healthBelow50'
            };
        } else {
            return {
                action: 'attack',
                target: perception.visibleEnemies[0],
                intensity: 'normal',
                trigger: 'phase1'
            };
        }
    }
}

/**
 * 基础状态机
 */
class BasicStateMachine {
    constructor() {
        this.currentState = 'idle';
    }

    update(decision, deltaTime) {
        // 基础状态机实现
    }

    getCurrentState() {
        return this.currentState;
    }
}














