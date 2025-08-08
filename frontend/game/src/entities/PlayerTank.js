



/**
 * 玩家坦克类
 * 继承自Tank基类，实现玩家特有的功能和控制逻辑
 */

import { Tank, TankType, TankDirection } from './Tank.js';
import { Vector2 } from '../utils/Vector2.js';

/**
 * 玩家坦克类
 */
export class PlayerTank extends Tank {
    constructor(x, y) {
        super(x, y, TankType.PLAYER);
        
        // 玩家特有属性
        this.lives = 3;
        this.score = 0;
        this.level = 1;
        
        // 强化状态
        this.powerUps = {
            rapidFire: false,
            doubleBullet: false,
            shield: false,
            extraLife: false,
            freezeEnemies: false
        };
        
        // 强化计时器
        this.powerUpTimers = {
            rapidFire: 0,
            doubleBullet: 0,
            shield: 0,
            freezeEnemies: 0
        };
        
        // 强化持续时间
        this.powerUpDurations = {
            rapidFire: 10.0,
            doubleBullet: 15.0,
            shield: 8.0,
            freezeEnemies: 5.0
        };
        
        // 输入控制
        this.inputState = {
            up: false,
            down: false,
            left: false,
            right: false,
            shoot: false,
            shootPressed: false
        };
        
        // 移动平滑
        this.moveSmoothing = 0.8;
        this.targetVelocity = new Vector2(0, 0);
        
        // 特殊能力
        this.canDoubleShoot = false;
        this.shieldActive = false;
        this.shieldFlashTimer = 0;
        
        // 重生相关
        this.respawnInvulnerabilityDuration = 3.0;
        this.isRespawning = false;
        
        // 初始化玩家坦克属性
        this.initializePlayerProperties();
    }

    /**
     * 初始化玩家坦克属性
     */
    initializePlayerProperties() {
        // 增强玩家坦克的基础属性
        this.speed = 140;
        this.health = 1;
        this.maxHealth = 1;
        this.shootCooldownTime = 0.2;
        this.bulletSpeed = 400;
        this.maxBullets = 3;
        
        // 设置碰撞边界更精确
        this.collisionBounds = {
            x: 3,
            y: 3,
            width: this.width - 6,
            height: this.height - 6
        };
    }

    /**
     * 更新玩家坦克
     */
    update(deltaTime, gameState) {
        // 更新强化状态
        this.updatePowerUps(deltaTime);
        
        // 处理输入
        this.handleInput(gameState.inputManager);
        
        // 更新移动
        this.updatePlayerMovement(deltaTime);
        
        // 调用父类更新
        super.update(deltaTime, gameState);
        
        // 更新护盾效果
        this.updateShield(deltaTime);
        
        // 更新重生状态
        this.updateRespawn(deltaTime);
    }

    /**
     * 更新强化状态
     */
    updatePowerUps(deltaTime) {
        for (const [powerUp, timer] of Object.entries(this.powerUpTimers)) {
            if (timer > 0) {
                this.powerUpTimers[powerUp] -= deltaTime;
                
                // 强化效果结束
                if (this.powerUpTimers[powerUp] <= 0) {
                    this.removePowerUp(powerUp);
                }
            }
        }
    }

    /**
     * 处理输入
     */
    handleInput(inputManager) {
        if (!inputManager || this.isDestroyed) {
            return;
        }
        
        // 获取玩家输入
        this.inputState = inputManager.getPlayerInput();
        
        // 处理移动输入
        this.handleMovementInput();
        
        // 处理射击输入
        this.handleShootInput();
    }

    /**
     * 处理移动输入
     */
    handleMovementInput() {
        let hasMovementInput = false;
        let newDirection = this.direction;
        
        // 检查方向键输入
        if (this.inputState.up) {
            newDirection = TankDirection.UP;
            hasMovementInput = true;
        } else if (this.inputState.down) {
            newDirection = TankDirection.DOWN;
            hasMovementInput = true;
        } else if (this.inputState.left) {
            newDirection = TankDirection.LEFT;
            hasMovementInput = true;
        } else if (this.inputState.right) {
            newDirection = TankDirection.RIGHT;
            hasMovementInput = true;
        }
        
        // 设置移动状态
        if (hasMovementInput) {
            this.startMoving(newDirection);
        } else {
            this.stopMoving();
        }
    }

    /**
     * 处理射击输入
     */
    handleShootInput() {
        if (this.inputState.shootPressed) {
            this.playerShoot();
        }
    }

    /**
     * 更新玩家移动（带平滑效果）
     */
    updatePlayerMovement(deltaTime) {
        if (!this.isMoving || !this.canMove) {
            this.velocity.lerp(new Vector2(0, 0), this.moveSmoothing * deltaTime);
            return;
        }
        
        // 计算目标速度
        this.setTargetVelocityFromDirection();
        
        // 平滑移动
        this.velocity.lerp(this.targetVelocity, this.moveSmoothing * deltaTime);
        
        // 应用移动
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
        
        // 更新碰撞边界
        this.updateCollisionBounds();
    }

    /**
     * 根据方向设置目标速度
     */
    setTargetVelocityFromDirection() {
        switch (this.direction) {
            case TankDirection.UP:
                this.targetVelocity.set(0, -this.speed);
                break;
            case TankDirection.RIGHT:
                this.targetVelocity.set(this.speed, 0);
                break;
            case TankDirection.DOWN:
                this.targetVelocity.set(0, this.speed);
                break;
            case TankDirection.LEFT:
                this.targetVelocity.set(-this.speed, 0);
                break;
        }
    }

    /**
     * 玩家射击
     */
    playerShoot(audioManager = null) {
        if (this.powerUps.doubleBullet) {
            // 双发子弹
            this.shootDoubleBullet(audioManager);
        } else {
            // 普通射击
            return this.shoot(audioManager);
        }
    }

    /**
     * 双发子弹射击
     */
    shootDoubleBullet(audioManager = null) {
        if (!this.canShoot || this.activeBullets.length >= this.maxBullets - 1) {
            return null;
        }
        
        const bullets = [];
        
        // 射击两发稍微偏移的子弹
        for (let i = 0; i < 2; i++) {
            const bulletPos = this.getBulletStartPosition();
            const offset = (i === 0) ? -4 : 4;
            
            // 根据方向调整偏移
            if (this.direction === TankDirection.UP || this.direction === TankDirection.DOWN) {
                bulletPos.x += offset;
            } else {
                bulletPos.y += offset;
            }
            
            const bullet = new (await import('./Bullet.js')).Bullet(
                bulletPos.x,
                bulletPos.y,
                this.direction,
                this.bulletSpeed,
                this
            );
            
            this.activeBullets.push(bullet);
            bullets.push(bullet);
        }
        
        // 设置射击冷却
        this.canShoot = false;
        this.shootCooldown = this.getShootCooldownTime();
        
        // 播放射击音效
        if (audioManager) {
            audioManager.playSound('shoot');
        }
        
        return bullets;
    }

    /**
     * 获取射击冷却时间
     */
    getShootCooldownTime() {
        let cooldown = this.shootCooldownTime;
        
        // 快速射击强化
        if (this.powerUps.rapidFire) {
            cooldown *= 0.5;
        }
        
        return cooldown;
    }

    /**
     * 更新护盾效果
     */
    updateShield(deltaTime) {
        if (this.powerUps.shield) {
            this.shieldActive = true;
            this.shieldFlashTimer += deltaTime;
        } else {
            this.shieldActive = false;
            this.shieldFlashTimer = 0;
        }
    }

    /**
     * 更新重生状态
     */
    updateRespawn(deltaTime) {
        if (this.isRespawning) {
            // 重生期间保持无敌
            if (!this.isInvulnerable) {
                this.setInvulnerable(this.respawnInvulnerabilityDuration);
            }
        }
    }

    /**
     * 获得强化道具
     */
    addPowerUp(powerUpType, audioManager = null) {
        console.log(`玩家获得强化: ${powerUpType}`);
        
        switch (powerUpType) {
            case 'rapidFire':
                this.powerUps.rapidFire = true;
                this.powerUpTimers.rapidFire = this.powerUpDurations.rapidFire;
                break;
                
            case 'doubleBullet':
                this.powerUps.doubleBullet = true;
                this.powerUpTimers.doubleBullet = this.powerUpDurations.doubleBullet;
                break;
                
            case 'shield':
                this.powerUps.shield = true;
                this.powerUpTimers.shield = this.powerUpDurations.shield;
                break;
                
            case 'extraLife':
                this.lives++;
                break;
                
            case 'freezeEnemies':
                this.powerUps.freezeEnemies = true;
                this.powerUpTimers.freezeEnemies = this.powerUpDurations.freezeEnemies;
                break;
        }
        
        // 播放强化音效
        if (audioManager) {
            audioManager.playSound('powerUp');
        }
    }

    /**
     * 移除强化效果
     */
    removePowerUp(powerUpType) {
        console.log(`强化效果结束: ${powerUpType}`);
        
        this.powerUps[powerUpType] = false;
        this.powerUpTimers[powerUpType] = 0;
    }

    /**
     * 受到伤害（重写以处理护盾）
     */
    takeDamage(damage = 1, source = null) {
        // 护盾保护
        if (this.powerUps.shield) {
            console.log('护盾抵挡了攻击！');
            return false;
        }
        
        // 调用父类伤害处理
        const wasDamaged = super.takeDamage(damage, source);
        
        if (wasDamaged && this.isDestroyed) {
            this.handlePlayerDeath();
        }
        
        return wasDamaged;
    }

    /**
     * 处理玩家死亡
     */
    handlePlayerDeath() {
        this.lives--;
        
        if (this.lives > 0) {
            // 还有生命，准备重生
            this.prepareRespawn();
        } else {
            // 游戏结束
            this.handleGameOver();
        }
    }

    /**
     * 准备重生
     */
    prepareRespawn() {
        console.log(`玩家死亡，剩余生命: ${this.lives}`);
        
        // 清除所有强化效果
        this.clearAllPowerUps();
        
        // 标记为重生状态
        this.isRespawning = true;
        
        // 重置健康状态
        this.health = this.maxHealth;
        this.isDestroyed = false;
    }

    /**
     * 执行重生
     */
    respawn(x, y) {
        console.log('玩家重生');
        
        // 重置位置
        this.resetPosition(x, y);
        
        // 重置状态
        this.isRespawning = false;
        this.velocity.set(0, 0);
        this.direction = TankDirection.UP;
        
        // 设置重生无敌时间
        this.setInvulnerable(this.respawnInvulnerabilityDuration);
        
        // 清理子弹
        this.activeBullets = [];
    }

    /**
     * 处理游戏结束
     */
    handleGameOver() {
        console.log('游戏结束');
        // 这里会被游戏状态管理器处理
    }

    /**
     * 清除所有强化效果
     */
    clearAllPowerUps() {
        for (const powerUp of Object.keys(this.powerUps)) {
            this.powerUps[powerUp] = false;
            this.powerUpTimers[powerUp] = 0;
        }
    }

    /**
     * 增加分数
     */
    addScore(points) {
        this.score += points;
        console.log(`分数增加: +${points}, 总分: ${this.score}`);
    }

    /**
     * 检查边界碰撞
     */
    checkBoundaryCollision(mapWidth, mapHeight) {
        let collided = false;
        
        if (this.x < 0) {
            this.x = 0;
            collided = true;
        } else if (this.x + this.width > mapWidth) {
            this.x = mapWidth - this.width;
            collided = true;
        }
        
        if (this.y < 0) {
            this.y = 0;
            collided = true;
        } else if (this.y + this.height > mapHeight) {
            this.y = mapHeight - this.height;
            collided = true;
        }
        
        if (collided) {
            this.updateCollisionBounds();
            this.stopMoving();
        }
        
        return collided;
    }

    /**
     * 获取强化状态
     */
    getPowerUpStatus() {
        const status = {};
        
        for (const [powerUp, active] of Object.entries(this.powerUps)) {
            status[powerUp] = {
                active: active,
                timeRemaining: this.powerUpTimers[powerUp] || 0
            };
        }
        
        return status;
    }

    /**
     * 渲染玩家坦克
     */
    render(renderer) {
        if (this.isDestroyed && !this.isRespawning) {
            return;
        }
        
        // 重生闪烁效果
        if (this.isRespawning && Math.floor(Date.now() / 100) % 2 === 0) {
            return;
        }
        
        // 调用父类渲染
        super.render(renderer);
        
        // 渲染护盾效果
        if (this.shieldActive) {
            this.renderShield(renderer);
        }
        
        // 渲染强化效果指示器
        this.renderPowerUpIndicators(renderer);
    }

    /**
     * 渲染护盾效果
     */
    renderShield(renderer) {
        const flashSpeed = 5;
        const alpha = 0.3 + 0.3 * Math.sin(this.shieldFlashTimer * flashSpeed);
        
        renderer.setGlobalAlpha(alpha);
        renderer.drawCircle(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.width / 2 + 8,
            '#00ffff'
        );
        renderer.resetGlobalAlpha();
    }

    /**
     * 渲染强化效果指示器
     */
    renderPowerUpIndicators(renderer) {
        let indicatorY = this.y - 20;
        
        // 快速射击指示器
        if (this.powerUps.rapidFire) {
            renderer.drawText('R', this.x, indicatorY, '#ff0000', '12px Arial');
            indicatorY -= 12;
        }
        
        // 双发子弹指示器
        if (this.powerUps.doubleBullet) {
            renderer.drawText('D', this.x + 10, indicatorY, '#00ff00', '12px Arial');
            indicatorY -= 12;
        }
        
        // 冰冻敌人指示器
        if (this.powerUps.freezeEnemies) {
            renderer.drawText('F', this.x + 20, indicatorY, '#0080ff', '12px Arial');
        }
    }

    /**
     * 获取玩家状态
     */
    getPlayerStatus() {
        return {
            ...this.getStatus(),
            lives: this.lives,
            score: this.score,
            level: this.level,
            powerUps: this.getPowerUpStatus(),
            isRespawning: this.isRespawning
        };
    }

    /**
     * 重置玩家状态（新游戏）
     */
    reset() {
        this.lives = 3;
        this.score = 0;
        this.level = 1;
        this.health = this.maxHealth;
        this.isDestroyed = false;
        this.isRespawning = false;
        
        this.clearAllPowerUps();
        this.activeBullets = [];
        this.velocity.set(0, 0);
        this.direction = TankDirection.UP;
        
        console.log('玩家状态已重置');
    }
}



