



/**
 * 子弹类
 * 处理子弹的移动、碰撞检测和生命周期管理
 */

import { GameObject } from './GameObject.js';
import { Vector2 } from '../utils/Vector2.js';
import { TankDirection } from './Tank.js';

/**
 * 子弹类型枚举
 */
export const BulletType = {
    NORMAL: 'normal',
    ARMOR_PIERCING: 'armor_piercing',
    EXPLOSIVE: 'explosive',
    RAPID: 'rapid'
};

/**
 * 子弹类
 */
export class Bullet extends GameObject {
    constructor(x, y, direction, speed = 300, owner = null, type = BulletType.NORMAL) {
        super(x, y, 8, 8);
        
        // 基本属性
        this.direction = direction;
        this.speed = speed;
        this.owner = owner;
        this.type = type;
        
        // 移动相关
        this.velocity = new Vector2(0, 0);
        this.previousPosition = new Vector2(x, y);
        
        // 伤害和穿透
        this.damage = 1;
        this.piercing = false;
        this.maxPenetrations = 0;
        this.penetrationCount = 0;
        
        // 生命周期
        this.maxLifetime = 3.0; // 秒
        this.lifetime = 0;
        this.maxDistance = 800; // 像素
        this.traveledDistance = 0;
        
        // 碰撞检测
        this.collisionRadius = 4;
        this.hasCollided = false;
        
        // 视觉效果
        this.trail = [];
        this.maxTrailLength = 5;
        this.trailUpdateInterval = 0.05; // 秒
        this.trailTimer = 0;
        
        // 音效标志
        this.hasPlayedHitSound = false;
        
        // 根据类型初始化属性
        this.initializeBulletProperties();
        
        // 设置初始速度
        this.setVelocityFromDirection();
        
        // 添加标签
        this.addTag('bullet');
        if (owner && owner.isPlayer && owner.isPlayer()) {
            this.addTag('player_bullet');
        } else {
            this.addTag('enemy_bullet');
        }
    }

    /**
     * 根据子弹类型初始化属性
     */
    initializeBulletProperties() {
        switch (this.type) {
            case BulletType.NORMAL:
                this.damage = 1;
                this.piercing = false;
                break;
                
            case BulletType.ARMOR_PIERCING:
                this.damage = 2;
                this.piercing = true;
                this.maxPenetrations = 1;
                break;
                
            case BulletType.EXPLOSIVE:
                this.damage = 3;
                this.piercing = false;
                // 爆炸子弹会在碰撞时产生范围伤害
                break;
                
            case BulletType.RAPID:
                this.damage = 1;
                this.speed *= 1.5;
                this.piercing = false;
                break;
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
     * 更新子弹
     */
    update(deltaTime, gameState) {
        if (this.isDestroyed) {
            return;
        }
        
        super.update(deltaTime, gameState);
        
        // 保存之前的位置
        this.previousPosition.copy(new Vector2(this.x, this.y));
        
        // 更新生命周期
        this.updateLifetime(deltaTime);
        
        // 更新移动
        this.updateMovement(deltaTime);
        
        // 更新拖尾效果
        this.updateTrail(deltaTime);
        
        // 检查边界碰撞
        this.checkBoundaryCollision(gameState);
        
        // 检查是否超出生命周期
        this.checkLifetime();
    }

    /**
     * 更新生命周期
     */
    updateLifetime(deltaTime) {
        this.lifetime += deltaTime;
    }

    /**
     * 更新移动
     */
    updateMovement(deltaTime) {
        // 应用速度
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
        
        // 计算移动距离
        const moveDistance = this.velocity.length() * deltaTime;
        this.traveledDistance += moveDistance;
    }

    /**
     * 更新拖尾效果
     */
    updateTrail(deltaTime) {
        this.trailTimer += deltaTime;
        
        if (this.trailTimer >= this.trailUpdateInterval) {
            // 添加当前位置到拖尾
            this.trail.push({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                time: this.lifetime
            });
            
            // 限制拖尾长度
            if (this.trail.length > this.maxTrailLength) {
                this.trail.shift();
            }
            
            this.trailTimer = 0;
        }
    }

    /**
     * 检查边界碰撞
     */
    checkBoundaryCollision(gameState) {
        const margin = 50; // 边界外的缓冲区
        
        if (this.x < -margin || 
            this.x > gameState.mapWidth + margin ||
            this.y < -margin || 
            this.y > gameState.mapHeight + margin) {
            this.destroy();
        }
    }

    /**
     * 检查生命周期
     */
    checkLifetime() {
        if (this.lifetime >= this.maxLifetime || 
            this.traveledDistance >= this.maxDistance) {
            this.destroy();
        }
    }

    /**
     * 处理碰撞
     */
    onCollision(target, audioManager = null) {
        if (this.isDestroyed || this.hasCollided) {
            return false;
        }
        
        // 检查是否是有效目标
        if (!this.isValidTarget(target)) {
            return false;
        }
        
        // 标记已碰撞
        this.hasCollided = true;
        
        // 处理伤害
        this.dealDamage(target);
        
        // 播放碰撞音效
        this.playHitSound(audioManager);
        
        // 处理穿透
        if (this.piercing && this.penetrationCount < this.maxPenetrations) {
            this.penetrationCount++;
            this.hasCollided = false; // 允许继续移动
            return true;
        }
        
        // 处理爆炸效果
        if (this.type === BulletType.EXPLOSIVE) {
            this.createExplosion(target, audioManager);
        }
        
        // 销毁子弹
        this.destroy();
        
        return true;
    }

    /**
     * 检查是否是有效目标
     */
    isValidTarget(target) {
        // 不能伤害发射者
        if (target === this.owner) {
            return false;
        }
        
        // 玩家子弹不能伤害玩家，敌方子弹不能伤害敌方
        if (this.owner) {
            const ownerIsPlayer = this.owner.isPlayer && this.owner.isPlayer();
            const targetIsPlayer = target.isPlayer && target.isPlayer();
            
            if (ownerIsPlayer === targetIsPlayer) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * 造成伤害
     */
    dealDamage(target) {
        if (target.takeDamage) {
            const damageDealt = target.takeDamage(this.damage, this);
            
            // 如果目标被摧毁且有发射者，增加分数
            if (damageDealt && target.isDestroyed && this.owner) {
                this.awardScore(target);
            }
        }
    }

    /**
     * 奖励分数
     */
    awardScore(target) {
        if (!this.owner.addScore) {
            return;
        }
        
        let points = 0;
        
        // 根据目标类型给予不同分数
        if (target.type) {
            switch (target.type) {
                case 'enemy_basic':
                    points = 100;
                    break;
                case 'enemy_fast':
                    points = 200;
                    break;
                case 'enemy_heavy':
                    points = 300;
                    break;
                case 'enemy_armor':
                    points = 400;
                    break;
                default:
                    points = 50;
            }
        }
        
        if (points > 0) {
            this.owner.addScore(points);
        }
    }

    /**
     * 播放碰撞音效
     */
    playHitSound(audioManager) {
        if (!audioManager || this.hasPlayedHitSound) {
            return;
        }
        
        this.hasPlayedHitSound = true;
        
        // 根据子弹类型播放不同音效
        if (this.type === BulletType.EXPLOSIVE) {
            audioManager.playSound('explosion');
        } else {
            audioManager.playSound('bulletHit');
        }
    }

    /**
     * 创建爆炸效果
     */
    createExplosion(target, audioManager) {
        // 这里会创建爆炸效果对象
        // 在实际实现中，会通知游戏状态管理器创建爆炸
        console.log(`在 (${this.x}, ${this.y}) 创建爆炸效果`);
        
        // 播放爆炸音效
        if (audioManager) {
            audioManager.playSound('explosion');
        }
    }

    /**
     * 检查与目标的碰撞
     */
    checkCollision(target) {
        if (this.isDestroyed || target.isDestroyed) {
            return false;
        }
        
        // 获取目标的碰撞边界
        const targetBounds = target.getCollisionBounds ? 
                           target.getCollisionBounds() : 
                           target.getBounds();
        
        // 圆形碰撞检测（子弹）vs 矩形碰撞检测（目标）
        const bulletCenterX = this.x + this.width / 2;
        const bulletCenterY = this.y + this.height / 2;
        
        // 找到矩形上最接近圆心的点
        const closestX = Math.max(targetBounds.x, 
                                Math.min(bulletCenterX, targetBounds.x + targetBounds.width));
        const closestY = Math.max(targetBounds.y, 
                                Math.min(bulletCenterY, targetBounds.y + targetBounds.height));
        
        // 计算距离
        const distanceX = bulletCenterX - closestX;
        const distanceY = bulletCenterY - closestY;
        const distanceSquared = distanceX * distanceX + distanceY * distanceY;
        
        return distanceSquared <= (this.collisionRadius * this.collisionRadius);
    }

    /**
     * 获取碰撞边界
     */
    getCollisionBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
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
     * 获取旋转角度
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
     * 渲染子弹
     */
    render(renderer) {
        if (this.isDestroyed) {
            return;
        }
        
        // 渲染拖尾
        this.renderTrail(renderer);
        
        // 渲染子弹主体
        renderer.drawBullet(this);
        
        // 渲染特殊效果
        this.renderSpecialEffects(renderer);
    }

    /**
     * 渲染拖尾效果
     */
    renderTrail(renderer) {
        if (this.trail.length < 2) {
            return;
        }
        
        for (let i = 0; i < this.trail.length - 1; i++) {
            const point = this.trail[i];
            const alpha = (i + 1) / this.trail.length * 0.5;
            
            renderer.setGlobalAlpha(alpha);
            renderer.drawCircle(point.x, point.y, 2, '#ffff00');
        }
        
        renderer.resetGlobalAlpha();
    }

    /**
     * 渲染特殊效果
     */
    renderSpecialEffects(renderer) {
        // 根据子弹类型渲染特殊效果
        switch (this.type) {
            case BulletType.ARMOR_PIERCING:
                // 穿甲弹发光效果
                renderer.setGlobalAlpha(0.3);
                renderer.drawCircle(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    this.width,
                    '#00ffff'
                );
                renderer.resetGlobalAlpha();
                break;
                
            case BulletType.EXPLOSIVE:
                // 爆炸弹闪烁效果
                if (Math.floor(this.lifetime * 10) % 2 === 0) {
                    renderer.setGlobalAlpha(0.5);
                    renderer.drawCircle(
                        this.x + this.width / 2,
                        this.y + this.height / 2,
                        this.width + 2,
                        '#ff4400'
                    );
                    renderer.resetGlobalAlpha();
                }
                break;
        }
    }

    /**
     * 获取子弹状态
     */
    getStatus() {
        return {
            type: this.type,
            direction: this.direction,
            speed: this.speed,
            damage: this.damage,
            lifetime: this.lifetime,
            traveledDistance: this.traveledDistance,
            penetrationCount: this.penetrationCount,
            hasCollided: this.hasCollided
        };
    }

    /**
     * 销毁子弹
     */
    destroy() {
        super.destroy();
        
        // 清理拖尾
        this.trail = [];
        
        // 从发射者的子弹列表中移除
        if (this.owner && this.owner.activeBullets) {
            const index = this.owner.activeBullets.indexOf(this);
            if (index !== -1) {
                this.owner.activeBullets.splice(index, 1);
            }
        }
    }
}



