




import { Tank } from './Tank.js';

/**
 * 敌方坦克基类
 * 所有敌方坦克的基础类，包含AI逻辑
 */
export class EnemyTank extends Tank {
    constructor(x, y, tankType = 'basic') {
        super(x, y, 'enemy');
        
        this.tankType = tankType;
        
        // AI相关属性
        this.aiState = 'patrol';
        this.aiStates = ['patrol', 'chase', 'attack', 'retreat', 'search'];
        this.stateTimer = 0;
        this.stateChangeInterval = 2; // 状态检查间隔
        
        // 目标和路径
        this.target = null;
        this.lastKnownTargetPosition = null;
        this.patrolPoints = [];
        this.currentPatrolIndex = 0;
        this.waypoints = [];
        this.currentWaypointIndex = 0;
        
        // 感知系统
        this.viewDistance = 200;
        this.viewAngle = Math.PI / 3; // 60度视角
        this.hearingDistance = 150;
        this.attackRange = 120;
        this.optimalRange = 100;
        
        // 行为参数
        this.aggressionLevel = 0.5; // 0-1，影响攻击性
        this.fearLevel = 0.3; // 0-1，影响撤退倾向
        this.accuracy = 0.7; // 射击精度
        this.reactionTime = 0.5; // 反应时间
        this.lastReactionTime = 0;
        
        // 群体行为
        this.allies = [];
        this.formationPosition = null;
        this.leaderDistance = 80;
        
        // 记忆系统
        this.memory = {
            lastSeenTarget: 0,
            targetLostTime: 0,
            dangerAreas: [],
            safeAreas: []
        };
        
        // 移动相关
        this.moveSpeed = 60;
        this.turnSpeed = 2;
        this.stuckTimer = 0;
        this.maxStuckTime = 2;
        this.lastPosition = { x: x, y: y };
        
        // 战斗相关
        this.preferredDistance = 80;
        this.retreatThreshold = 0.3; // 血量低于30%时撤退
        this.lastShotTime = 0;
        this.burstFireCount = 0;
        this.maxBurstFire = 3;
        
        // 设置标签
        this.addTag('ai');
        this.addTag('enemy');
        
        // 初始化
        this.initialize();
    }

    /**
     * 设置坦克类型属性
     */
    setupTankType() {
        switch (this.tankType) {
            case 'basic':
                this.setupBasicTank();
                break;
            case 'fast':
                this.setupFastTank();
                break;
            case 'heavy':
                this.setupHeavyTank();
                break;
            case 'armor':
                this.setupArmorTank();
                break;
            case 'sniper':
                this.setupSniperTank();
                break;
        }
    }

    /**
     * 设置基础坦克
     */
    setupBasicTank() {
        this.maxHealth = 50;
        this.health = this.maxHealth;
        this.maxSpeed = 60;
        this.fireRate = 1.5;
        this.bulletDamage = 20;
        this.armor = 0;
        this.viewDistance = 150;
        this.accuracy = 0.6;
        this.aggressionLevel = 0.5;
    }

    /**
     * 设置快速坦克
     */
    setupFastTank() {
        this.maxHealth = 30;
        this.health = this.maxHealth;
        this.maxSpeed = 100;
        this.fireRate = 2.5;
        this.bulletDamage = 15;
        this.armor = 0;
        this.viewDistance = 180;
        this.accuracy = 0.5;
        this.aggressionLevel = 0.8;
        this.fearLevel = 0.6;
    }

    /**
     * 设置重型坦克
     */
    setupHeavyTank() {
        this.maxHealth = 120;
        this.health = this.maxHealth;
        this.maxSpeed = 40;
        this.fireRate = 0.8;
        this.bulletDamage = 50;
        this.armor = 3;
        this.viewDistance = 200;
        this.accuracy = 0.8;
        this.aggressionLevel = 0.3;
        this.fearLevel = 0.1;
    }

    /**
     * 设置装甲坦克
     */
    setupArmorTank() {
        this.maxHealth = 80;
        this.health = this.maxHealth;
        this.maxSpeed = 50;
        this.fireRate = 1.2;
        this.bulletDamage = 30;
        this.armor = 5;
        this.maxShield = 40;
        this.shield = this.maxShield;
        this.shieldRegenRate = 5;
        this.viewDistance = 170;
        this.accuracy = 0.7;
        this.aggressionLevel = 0.4;
    }

    /**
     * 设置狙击坦克
     */
    setupSniperTank() {
        this.maxHealth = 40;
        this.health = this.maxHealth;
        this.maxSpeed = 45;
        this.fireRate = 0.5;
        this.bulletDamage = 80;
        this.armor = 1;
        this.viewDistance = 300;
        this.attackRange = 250;
        this.accuracy = 0.95;
        this.aggressionLevel = 0.2;
        this.fearLevel = 0.8;
        this.preferredDistance = 200;
    }

    /**
     * 更新AI逻辑
     */
    updateAI(deltaTime) {
        this.stateTimer += deltaTime;
        
        // 更新感知
        this.updatePerception(deltaTime);
        
        // 更新记忆
        this.updateMemory(deltaTime);
        
        // 检查是否需要改变状态
        if (this.stateTimer >= this.stateChangeInterval) {
            this.evaluateStateChange();
            this.stateTimer = 0;
        }
        
        // 执行当前状态的行为
        this.executeCurrentState(deltaTime);
        
        // 检查卡住状态
        this.checkIfStuck(deltaTime);
    }

    /**
     * 更新感知系统
     */
    updatePerception(deltaTime) {
        // 扫描目标
        this.scanForTargets();
        
        // 监听声音
        this.listenForSounds();
        
        // 更新盟友列表
        this.updateAllies();
    }

    /**
     * 扫描目标
     */
    scanForTargets() {
        // 这里应该从游戏引擎获取所有可见的敌方单位
        // 暂时用事件系统请求目标信息
        this.emit('requestTargets', {
            position: { x: this.x, y: this.y },
            viewDistance: this.viewDistance,
            viewAngle: this.viewAngle,
            direction: this.turretDirection
        });
    }

    /**
     * 设置扫描到的目标
     */
    setScannedTargets(targets) {
        if (targets.length > 0) {
            // 选择最近的敌方目标
            let nearestTarget = null;
            let nearestDistance = Infinity;
            
            for (const target of targets) {
                if (target.team !== this.team) {
                    const distance = this.getDistanceTo(target);
                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearestTarget = target;
                    }
                }
            }
            
            if (nearestTarget) {
                this.target = nearestTarget;
                this.lastKnownTargetPosition = { x: nearestTarget.x, y: nearestTarget.y };
                this.memory.lastSeenTarget = Date.now();
            }
        }
    }

    /**
     * 监听声音
     */
    listenForSounds() {
        // 监听射击声、爆炸声等
        // 通过事件系统实现
    }

    /**
     * 更新盟友列表
     */
    updateAllies() {
        // 请求附近的盟友信息
        this.emit('requestAllies', {
            position: { x: this.x, y: this.y },
            team: this.team,
            range: this.viewDistance
        });
    }

    /**
     * 更新记忆
     */
    updateMemory(deltaTime) {
        const now = Date.now();
        
        // 如果长时间没有看到目标，清除目标
        if (this.target && now - this.memory.lastSeenTarget > 5000) {
            this.target = null;
            this.memory.targetLostTime = now;
        }
        
        // 清理过期的危险区域
        this.memory.dangerAreas = this.memory.dangerAreas.filter(area => 
            now - area.timestamp < 10000
        );
    }

    /**
     * 评估状态改变
     */
    evaluateStateChange() {
        const healthRatio = this.health / this.maxHealth;
        const hasTarget = this.target !== null;
        const targetDistance = hasTarget ? this.getDistanceTo(this.target) : Infinity;
        
        // 状态转换逻辑
        switch (this.aiState) {
            case 'patrol':
                if (hasTarget) {
                    this.aiState = targetDistance < this.attackRange ? 'attack' : 'chase';
                }
                break;
                
            case 'chase':
                if (!hasTarget) {
                    this.aiState = 'search';
                } else if (targetDistance < this.attackRange) {
                    this.aiState = 'attack';
                } else if (healthRatio < this.retreatThreshold && this.fearLevel > 0.5) {
                    this.aiState = 'retreat';
                }
                break;
                
            case 'attack':
                if (!hasTarget) {
                    this.aiState = 'search';
                } else if (targetDistance > this.attackRange * 1.5) {
                    this.aiState = 'chase';
                } else if (healthRatio < this.retreatThreshold && this.fearLevel > 0.5) {
                    this.aiState = 'retreat';
                }
                break;
                
            case 'retreat':
                if (healthRatio > this.retreatThreshold * 1.5) {
                    this.aiState = hasTarget ? 'chase' : 'patrol';
                }
                break;
                
            case 'search':
                if (hasTarget) {
                    this.aiState = 'chase';
                } else if (Date.now() - this.memory.targetLostTime > 8000) {
                    this.aiState = 'patrol';
                }
                break;
        }
        
        this.emit('stateChanged', { oldState: this.aiState, newState: this.aiState });
    }

    /**
     * 执行当前状态的行为
     */
    executeCurrentState(deltaTime) {
        switch (this.aiState) {
            case 'patrol':
                this.executePatrol(deltaTime);
                break;
            case 'chase':
                this.executeChase(deltaTime);
                break;
            case 'attack':
                this.executeAttack(deltaTime);
                break;
            case 'retreat':
                this.executeRetreat(deltaTime);
                break;
            case 'search':
                this.executeSearch(deltaTime);
                break;
        }
    }

    /**
     * 执行巡逻行为
     */
    executePatrol(deltaTime) {
        if (this.patrolPoints.length === 0) {
            // 生成随机巡逻点
            this.generatePatrolPoints();
        }
        
        if (this.patrolPoints.length > 0) {
            const targetPoint = this.patrolPoints[this.currentPatrolIndex];
            const distance = Math.sqrt(
                Math.pow(targetPoint.x - this.x, 2) + 
                Math.pow(targetPoint.y - this.y, 2)
            );
            
            if (distance < 30) {
                // 到达巡逻点，选择下一个
                this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
            } else {
                // 移动到巡逻点
                this.moveToward(targetPoint.x, targetPoint.y, deltaTime);
            }
        }
    }

    /**
     * 执行追击行为
     */
    executeChase(deltaTime) {
        if (this.target) {
            const targetPos = this.predictTargetPosition();
            this.moveToward(targetPos.x, targetPos.y, deltaTime);
            this.aimAt(this.target.x, this.target.y);
            
            // 在追击过程中偶尔射击
            if (Math.random() < 0.3 * deltaTime) {
                this.attemptShoot();
            }
        }
    }

    /**
     * 执行攻击行为
     */
    executeAttack(deltaTime) {
        if (this.target) {
            const distance = this.getDistanceTo(this.target);
            
            // 保持最佳射击距离
            if (distance < this.preferredDistance * 0.8) {
                // 太近了，后退
                this.moveAwayFrom(this.target.x, this.target.y, deltaTime);
            } else if (distance > this.preferredDistance * 1.2) {
                // 太远了，靠近
                this.moveToward(this.target.x, this.target.y, deltaTime);
            } else {
                // 距离合适，进行侧向移动
                this.executeTacticalMovement(deltaTime);
            }
            
            // 瞄准并射击
            this.aimAt(this.target.x, this.target.y);
            this.attemptShoot();
        }
    }

    /**
     * 执行撤退行为
     */
    executeRetreat(deltaTime) {
        if (this.target) {
            // 远离目标
            this.moveAwayFrom(this.target.x, this.target.y, deltaTime);
            
            // 寻找掩护
            const cover = this.findNearestCover();
            if (cover) {
                this.moveToward(cover.x, cover.y, deltaTime);
            }
            
            // 边撤退边射击
            if (Math.random() < 0.2 * deltaTime) {
                this.aimAt(this.target.x, this.target.y);
                this.attemptShoot();
            }
        }
    }

    /**
     * 执行搜索行为
     */
    executeSearch(deltaTime) {
        if (this.lastKnownTargetPosition) {
            const distance = Math.sqrt(
                Math.pow(this.lastKnownTargetPosition.x - this.x, 2) + 
                Math.pow(this.lastKnownTargetPosition.y - this.y, 2)
            );
            
            if (distance > 50) {
                // 移动到最后已知位置
                this.moveToward(this.lastKnownTargetPosition.x, this.lastKnownTargetPosition.y, deltaTime);
            } else {
                // 在附近搜索
                this.executeSearchPattern(deltaTime);
            }
        } else {
            // 随机搜索
            this.executeRandomSearch(deltaTime);
        }
    }

    /**
     * 预测目标位置
     */
    predictTargetPosition() {
        if (!this.target) return { x: 0, y: 0 };
        
        const distance = this.getDistanceTo(this.target);
        const bulletTravelTime = distance / this.bulletSpeed;
        
        return {
            x: this.target.x + this.target.velocityX * bulletTravelTime,
            y: this.target.y + this.target.velocityY * bulletTravelTime
        };
    }

    /**
     * 移动到指定位置
     */
    moveToward(targetX, targetY, deltaTime) {
        const direction = Math.atan2(targetY - this.y, targetX - this.x);
        this.move(direction, deltaTime);
    }

    /**
     * 远离指定位置
     */
    moveAwayFrom(targetX, targetY, deltaTime) {
        const direction = Math.atan2(this.y - targetY, this.x - targetX);
        this.move(direction, deltaTime);
    }

    /**
     * 执行战术移动
     */
    executeTacticalMovement(deltaTime) {
        // 侧向移动以避免被击中
        const toTarget = Math.atan2(this.target.y - this.y, this.target.x - this.x);
        const perpendicular = toTarget + Math.PI / 2;
        
        // 随机选择左右移动
        const direction = Math.random() < 0.5 ? perpendicular : perpendicular + Math.PI;
        
        this.move(direction, deltaTime);
    }

    /**
     * 尝试射击
     */
    attemptShoot() {
        if (!this.canShoot() || !this.target) {
            return;
        }
        
        // 根据精度添加射击偏差
        const accuracy = this.accuracy * (1 - this.getStressLevel());
        const maxDeviation = (1 - accuracy) * Math.PI / 6; // 最大30度偏差
        const deviation = (Math.random() - 0.5) * maxDeviation;
        
        const targetPos = this.predictTargetPosition();
        const aimDirection = Math.atan2(targetPos.y - this.y, targetPos.x - this.x) + deviation;
        
        this.turretDirection = aimDirection;
        
        const bullet = this.shoot();
        if (bullet) {
            this.burstFireCount++;
        }
    }

    /**
     * 获取压力等级
     */
    getStressLevel() {
        const healthRatio = this.health / this.maxHealth;
        const enemyCount = this.allies.length > 0 ? 1 / this.allies.length : 1;
        
        return (1 - healthRatio) * 0.5 + enemyCount * 0.3;
    }

    /**
     * 生成巡逻点
     */
    generatePatrolPoints() {
        const pointCount = 3 + Math.floor(Math.random() * 3);
        const radius = 100 + Math.random() * 100;
        
        for (let i = 0; i < pointCount; i++) {
            const angle = (i / pointCount) * Math.PI * 2;
            this.patrolPoints.push({
                x: this.x + Math.cos(angle) * radius,
                y: this.y + Math.sin(angle) * radius
            });
        }
    }

    /**
     * 寻找最近的掩护
     */
    findNearestCover() {
        // 请求地图中的掩护点
        this.emit('requestCover', {
            position: { x: this.x, y: this.y },
            range: 150
        });
        
        // 暂时返回随机位置
        return {
            x: this.x + (Math.random() - 0.5) * 200,
            y: this.y + (Math.random() - 0.5) * 200
        };
    }

    /**
     * 执行搜索模式
     */
    executeSearchPattern(deltaTime) {
        // 螺旋搜索模式
        const time = Date.now() / 1000;
        const radius = 80;
        const targetX = this.lastKnownTargetPosition.x + Math.cos(time) * radius;
        const targetY = this.lastKnownTargetPosition.y + Math.sin(time) * radius;
        
        this.moveToward(targetX, targetY, deltaTime);
    }

    /**
     * 执行随机搜索
     */
    executeRandomSearch(deltaTime) {
        if (this.waypoints.length === 0 || this.currentWaypointIndex >= this.waypoints.length) {
            // 生成新的随机路径点
            this.generateRandomWaypoints();
            this.currentWaypointIndex = 0;
        }
        
        const waypoint = this.waypoints[this.currentWaypointIndex];
        const distance = Math.sqrt(
            Math.pow(waypoint.x - this.x, 2) + 
            Math.pow(waypoint.y - this.y, 2)
        );
        
        if (distance < 40) {
            this.currentWaypointIndex++;
        } else {
            this.moveToward(waypoint.x, waypoint.y, deltaTime);
        }
    }

    /**
     * 生成随机路径点
     */
    generateRandomWaypoints() {
        this.waypoints = [];
        const waypointCount = 2 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < waypointCount; i++) {
            this.waypoints.push({
                x: this.x + (Math.random() - 0.5) * 400,
                y: this.y + (Math.random() - 0.5) * 400
            });
        }
    }

    /**
     * 检查是否卡住
     */
    checkIfStuck(deltaTime) {
        const distance = Math.sqrt(
            Math.pow(this.x - this.lastPosition.x, 2) + 
            Math.pow(this.y - this.lastPosition.y, 2)
        );
        
        if (distance < 5 && this.isMoving) {
            this.stuckTimer += deltaTime;
            
            if (this.stuckTimer > this.maxStuckTime) {
                // 尝试脱困
                this.executeUnstuckBehavior();
                this.stuckTimer = 0;
            }
        } else {
            this.stuckTimer = 0;
            this.lastPosition = { x: this.x, y: this.y };
        }
    }

    /**
     * 执行脱困行为
     */
    executeUnstuckBehavior() {
        // 随机转向
        const randomDirection = Math.random() * Math.PI * 2;
        this.move(randomDirection, 0.5);
        
        // 后退
        setTimeout(() => {
            const backwardDirection = this.moveDirection + Math.PI;
            this.move(backwardDirection, 0.5);
        }, 500);
    }

    /**
     * 渲染敌方坦克
     */
    onRender(context) {
        super.onRender(context);
        
        // 渲染AI状态（调试模式）
        if (this.debugInfo.showBoundingBox) {
            this.renderAIDebugInfo(context);
        }
    }

    /**
     * 渲染AI调试信息
     */
    renderAIDebugInfo(context) {
        context.save();
        
        // 渲染状态文本
        context.fillStyle = '#ffffff';
        context.font = '8px Arial';
        context.textAlign = 'center';
        context.fillText(this.aiState, 0, -this.height / 2 - 20);
        
        // 渲染视野范围
        context.strokeStyle = '#ffff00';
        context.lineWidth = 1;
        context.setLineDash([2, 2]);
        context.beginPath();
        context.arc(0, 0, this.viewDistance, 0, Math.PI * 2);
        context.stroke();
        
        // 渲染攻击范围
        context.strokeStyle = '#ff0000';
        context.beginPath();
        context.arc(0, 0, this.attackRange, 0, Math.PI * 2);
        context.stroke();
        
        context.setLineDash([]);
        context.restore();
    }

    /**
     * 获取敌方坦克状态
     */
    getEnemyStatus() {
        return {
            ...this.getStatus(),
            aiState: this.aiState,
            target: this.target ? this.target.id : null,
            aggressionLevel: this.aggressionLevel,
            fearLevel: this.fearLevel,
            accuracy: this.accuracy
        };
    }
}

/**
 * 具体的敌方坦克类型
 */

export class BasicEnemyTank extends EnemyTank {
    constructor(x, y) {
        super(x, y, 'basic');
    }
}

export class FastEnemyTank extends EnemyTank {
    constructor(x, y) {
        super(x, y, 'fast');
    }
}

export class HeavyEnemyTank extends EnemyTank {
    constructor(x, y) {
        super(x, y, 'heavy');
    }
}

export class ArmorEnemyTank extends EnemyTank {
    constructor(x, y) {
        super(x, y, 'armor');
    }
}

export class SniperEnemyTank extends EnemyTank {
    constructor(x, y) {
        super(x, y, 'sniper');
    }
}





