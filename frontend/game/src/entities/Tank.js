


/**
 * 坦克基类
 * 所有坦克类型的基础类，定义了坦克的基本属性和行为
 */

import { GameObject } from './GameObject.js';
import { Bullet } from './Bullet.js';
import { Vector2 } from '../utils/Vector2.js';

/**
 * 坦克方向枚举
 */
export const TankDirection = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
};

/**
 * 坦克类型枚举
 */
export const TankType = {
    PLAYER: 'player',
    ENEMY_BASIC: 'enemy_basic',
    ENEMY_FAST: 'enemy_fast',
    ENEMY_HEAVY: 'enemy_heavy',
    ENEMY_ARMOR: 'enemy_armor'
};

/**
 * 坦克基类
 */
export class Tank extends GameObject {
    constructor(x, y, type = TankType.PLAYER) {
        super(x, y, 32, 32);
        
        // 坦克基本属性
        this.type = type;
        this.direction = TankDirection.UP;
        this.previousDirection = TankDirection.UP;
        
        // 移动相关
        this.speed = 100; // 像素/秒
        this.velocity = new Vector2(0, 0);
        this.isMoving = false;
        this.canMove = true;
        
        // 射击相关
        this.canShoot = true;
        this.shootCooldown = 0;
        this.shootCooldownTime = 0.3; // 秒
        this.bulletSpeed = 300;
        this.maxBullets = 1;
        this.activeBullets = [];
        
        // 生命和护甲
        this.health = 1;
        this.maxHealth = 1;
        this.armor = 0;
        this.isInvulnerable = false;
        this.invulnerabilityTime = 0;
        this.invulnerabilityDuration = 1.0; // 秒
        
        // 视觉效果
        this.showHealthBar = false;
        this.flashTimer = 0;
        this.flashDuration = 0.1;
        this.isFlashing = false;
        
        // 碰撞检测
        this.collisionBounds = {
            x: 2,
            y: 2,
            width: this.width - 4,
            height: this.height - 4
        };
        
        // 动画
        this.animationTimer = 0;
        this.animationFrame = 0;
        this.animationSpeed = 0.2;
        
        // 音效
        this.moveSound = null;
        this.shootSound = null;
        
        // 初始化坦克属性
        this.initializeTankProperties();
    }

    /**
     * 根据坦克类型初始化属性
     */
    initializeTankProperties() {
        switch (this.type) {
            case TankType.PLAYER:
                this.speed = 120;
                this.health = 1;
                this.maxHealth = 1;
                this.shootCooldownTime = 0.25;
                this.bulletSpeed = 350;
                this.maxBullets = 2;
                break;
                
            case TankType.ENEMY_BASIC:
                this.speed = 80;
                this.health = 1;
                this.maxHealth = 1;
                this.shootCooldownTime = 0.5;
                this.bulletSpeed = 250;
                this.maxBullets = 1;
                break;
                
            case TankType.ENEMY_FAST:
                this.speed = 150;
                this.health = 1;
                this.maxHealth = 1;
                this.shootCooldownTime = 0.4;
                this.bulletSpeed = 300;
                this.maxBullets = 1;
                break;
                
            case TankType.ENEMY_HEAVY:
                this.speed = 60;
                this.health = 3;
                this.maxHealth = 3;
                this.shootCooldownTime = 0.3;
                this.bulletSpeed = 200;
                this.maxBullets = 2;
                this.showHealthBar = true;
                break;
                
            case TankType.ENEMY_ARMOR:
                this.speed = 100;
                this.health = 2;
                this.maxHealth = 2;
                this.armor = 1;
                this.shootCooldownTime = 0.35;
                this.bulletSpeed = 280;
                this.maxBullets = 1;
                this.showHealthBar = true;
                break;
        }
    }

    /**
     * 更新坦克状态
     */
    update(deltaTime, gameState) {
        super.update(deltaTime, gameState);
        
        // 更新射击冷却
        this.updateShootCooldown(deltaTime);
        
        // 更新无敌状态
        this.updateInvulnerability(deltaTime);
        
        // 更新闪烁效果
        this.updateFlashing(deltaTime);
        
        // 更新动画
        this.updateAnimation(deltaTime);
        
        // 更新移动
        this.updateMovement(deltaTime);
        
        // 更新子弹
        this.updateBullets(deltaTime, gameState);
        
        // 清理已销毁的子弹
        this.cleanupBullets();
    }

    /**
     * 更新射击冷却
     */
    updateShootCooldown(deltaTime) {
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
            if (this.shootCooldown <= 0) {
                this.canShoot = true;
            }
        }
    }

    /**
     * 更新无敌状态
     */
    updateInvulnerability(deltaTime) {
        if (this.isInvulnerable) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.isInvulnerable = false;
            }
        }
    }

    /**
     * 更新闪烁效果
     */
    updateFlashing(deltaTime) {
        if (this.isFlashing) {
            this.flashTimer -= deltaTime;
            if (this.flashTimer <= 0) {
                this.isFlashing = false;
            }
        }
    }

    /**
     * 更新动画
     */
    updateAnimation(deltaTime) {
        if (this.isMoving) {
            this.animationTimer += deltaTime;
            if (this.animationTimer >= this.animationSpeed) {
                this.animationTimer = 0;
                this.animationFrame = (this.animationFrame + 1) % 2;
            }
        } else {
            this.animationFrame = 0;
            this.animationTimer = 0;
        }
    }

    /**
     * 更新移动
     */
    updateMovement(deltaTime) {
        if (this.isMoving && this.canMove) {
            // 根据方向设置速度
            this.setVelocityFromDirection();
            
            // 应用移动
            this.x += this.velocity.x * deltaTime;
            this.y += this.velocity.y * deltaTime;
            
            // 更新碰撞边界
            this.updateCollisionBounds();
        } else {
            this.velocity.set(0, 0);
        }
    }

    /**
     * 根据方向设置速度
     */
    setVelocityFromDirection() {
        switch (this.direction) {
            case TankDirection.UP:
                this.velocity.set(0, -this.speed);
                break;
            case TankDirection.RIGHT:
                this.velocity.set(this.speed, 0);
                break;
            case TankDirection.DOWN:
                this.velocity.set(0, this.speed);
                break;
            case TankDirection.LEFT:
                this.velocity.set(-this.speed, 0);
                break;
        }
    }

    /**
     * 更新碰撞边界
     */
    updateCollisionBounds() {
        this.collisionBounds.x = this.x + 2;
        this.collisionBounds.y = this.y + 2;
    }

    /**
     * 更新子弹
     */
    updateBullets(deltaTime, gameState) {
        for (const bullet of this.activeBullets) {
            bullet.update(deltaTime, gameState);
        }
    }

    /**
     * 清理已销毁的子弹
     */
    cleanupBullets() {
        this.activeBullets = this.activeBullets.filter(bullet => !bullet.isDestroyed);
    }

    /**
     * 设置移动方向
     */
    setDirection(direction) {
        this.previousDirection = this.direction;
        this.direction = direction;
    }

    /**
     * 开始移动
     */
    startMoving(direction = null) {
        if (direction !== null) {
            this.setDirection(direction);
        }
        this.isMoving = true;
    }

    /**
     * 停止移动
     */
    stopMoving() {
        this.isMoving = false;
        this.velocity.set(0, 0);
    }

    /**
     * 射击
     */
    shoot(audioManager = null) {
        if (!this.canShoot || this.activeBullets.length >= this.maxBullets) {
            return null;
        }
        
        // 计算子弹起始位置
        const bulletPos = this.getBulletStartPosition();
        
        // 创建子弹
        const bullet = new Bullet(
            bulletPos.x,
            bulletPos.y,
            this.direction,
            this.bulletSpeed,
            this
        );
        
        // 添加到活跃子弹列表
        this.activeBullets.push(bullet);
        
        // 设置射击冷却
        this.canShoot = false;
        this.shootCooldown = this.shootCooldownTime;
        
        // 播放射击音效
        if (audioManager) {
            audioManager.playSound('shoot');
        }
        
        return bullet;
    }

    /**
     * 获取子弹起始位置
     */
    getBulletStartPosition() {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const offset = 20; // 子弹从坦克前方发射
        
        switch (this.direction) {
            case TankDirection.UP:
                return new Vector2(centerX - 4, this.y - offset);
            case TankDirection.RIGHT:
                return new Vector2(this.x + this.width + offset, centerY - 4);
            case TankDirection.DOWN:
                return new Vector2(centerX - 4, this.y + this.height + offset);
            case TankDirection.LEFT:
                return new Vector2(this.x - offset, centerY - 4);
            default:
                return new Vector2(centerX - 4, this.y - offset);
        }
    }

    /**
     * 受到伤害
     */
    takeDamage(damage = 1, source = null) {
        if (this.isInvulnerable || this.isDestroyed) {
            return false;
        }
        
        // 计算实际伤害（考虑护甲）
        const actualDamage = Math.max(1, damage - this.armor);
        
        // 减少生命值
        this.health -= actualDamage;
        
        // 触发闪烁效果
        this.startFlashing();
        
        // 如果生命值归零，销毁坦克
        if (this.health <= 0) {
            this.destroy();
            return true;
        }
        
        // 设置短暂无敌
        this.setInvulnerable(this.invulnerabilityDuration);
        
        return true;
    }

    /**
     * 治疗
     */
    heal(amount = 1) {
        if (this.isDestroyed) {
            return;
        }
        
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    /**
     * 设置无敌状态
     */
    setInvulnerable(duration) {
        this.isInvulnerable = true;
        this.invulnerabilityTime = duration;
    }

    /**
     * 开始闪烁效果
     */
    startFlashing() {
        this.isFlashing = true;
        this.flashTimer = this.flashDuration;
    }

    /**
     * 检查与其他对象的碰撞
     */
    checkCollision(other) {
        if (this.isDestroyed || other.isDestroyed) {
            return false;
        }
        
        const thisBounds = this.getCollisionBounds();
        const otherBounds = other.getCollisionBounds ? other.getCollisionBounds() : other;
        
        return thisBounds.x < otherBounds.x + otherBounds.width &&
               thisBounds.x + thisBounds.width > otherBounds.x &&
               thisBounds.y < otherBounds.y + otherBounds.height &&
               thisBounds.y + thisBounds.height > otherBounds.y;
    }

    /**
     * 获取碰撞边界
     */
    getCollisionBounds() {
        return {
            x: this.collisionBounds.x,
            y: this.collisionBounds.y,
            width: this.collisionBounds.width,
            height: this.collisionBounds.height
        };
    }

    /**
     * 获取中心点
     */
    getCenter() {
        return new Vector2(
            this.x + this.width / 2,
            this.y + this.height / 2
        );
    }

    /**
     * 获取方向向量
     */
    getDirectionVector() {
        switch (this.direction) {
            case TankDirection.UP:
                return new Vector2(0, -1);
            case TankDirection.RIGHT:
                return new Vector2(1, 0);
            case TankDirection.DOWN:
                return new Vector2(0, 1);
            case TankDirection.LEFT:
                return new Vector2(-1, 0);
            default:
                return new Vector2(0, -1);
        }
    }

    /**
     * 获取旋转角度（弧度）
     */
    getRotation() {
        switch (this.direction) {
            case TankDirection.UP:
                return 0;
            case TankDirection.RIGHT:
                return Math.PI / 2;
            case TankDirection.DOWN:
                return Math.PI;
            case TankDirection.LEFT:
                return -Math.PI / 2;
            default:
                return 0;
        }
    }

    /**
     * 检查是否为玩家坦克
     */
    isPlayer() {
        return this.type === TankType.PLAYER;
    }

    /**
     * 检查是否为敌方坦克
     */
    isEnemy() {
        return this.type !== TankType.PLAYER;
    }

    /**
     * 重置位置
     */
    resetPosition(x, y) {
        this.x = x;
        this.y = y;
        this.updateCollisionBounds();
    }

    /**
     * 销毁坦克
     */
    destroy() {
        super.destroy();
        
        // 销毁所有子弹
        for (const bullet of this.activeBullets) {
            bullet.destroy();
        }
        this.activeBullets = [];
    }

    /**
     * 渲染坦克
     */
    render(renderer) {
        if (this.isDestroyed) {
            return;
        }
        
        // 如果正在闪烁，跳过部分帧的渲染
        if (this.isFlashing && Math.floor(this.flashTimer * 10) % 2 === 0) {
            return;
        }
        
        // 渲染坦克主体
        renderer.drawTank(this);
        
        // 渲染子弹
        for (const bullet of this.activeBullets) {
            bullet.render(renderer);
        }
    }

    /**
     * 获取坦克状态信息
     */
    getStatus() {
        return {
            type: this.type,
            health: this.health,
            maxHealth: this.maxHealth,
            direction: this.direction,
            isMoving: this.isMoving,
            canShoot: this.canShoot,
            activeBullets: this.activeBullets.length,
            isInvulnerable: this.isInvulnerable
        };
    }
}


