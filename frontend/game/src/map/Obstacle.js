





/**
 * 障碍物类
 * 处理可破坏和不可破坏的障碍物
 */

import { GameObject } from '../entities/GameObject.js';
import { Vector2 } from '../utils/Vector2.js';

/**
 * 障碍物类型枚举
 */
export const ObstacleType = {
    BRICK_WALL: 'brick_wall',       // 砖墙
    STEEL_WALL: 'steel_wall',       // 钢墙
    CONCRETE_WALL: 'concrete_wall', // 混凝土墙
    WATER: 'water',                 // 水域
    FOREST: 'forest',               // 森林
    ICE: 'ice',                     // 冰面
    BUNKER: 'bunker',               // 碉堡
    BARRIER: 'barrier'              // 路障
};

/**
 * 障碍物基类
 */
export class Obstacle extends GameObject {
    constructor(x, y, width, height, type = ObstacleType.BRICK_WALL) {
        super(x, y, width, height);
        
        // 基本属性
        this.type = type;
        this.health = this.getMaxHealth();
        this.maxHealth = this.health;
        this.armor = this.getArmor();
        
        // 物理属性
        this.isPassable = this.getPassability();
        this.isShootThrough = this.getShootability();
        this.isDestructible = this.getDestructibility();
        
        // 视觉效果
        this.damageLevel = 0; // 0-3 损坏程度
        this.lastDamageTime = 0;
        this.shakeIntensity = 0;
        this.shakeTimer = 0;
        
        // 碎片效果
        this.debrisParticles = [];
        this.maxDebrisParticles = 10;
        
        // 环境效果
        this.environmentalEffect = this.getEnvironmentalEffect();
        
        // 添加标签
        this.addTag('obstacle');
        this.addTag(type);
        
        if (!this.isPassable) {
            this.addTag('blocking');
        }
        
        if (this.isDestructible) {
            this.addTag('destructible');
        }
    }

    /**
     * 获取最大生命值
     */
    getMaxHealth() {
        switch (this.type) {
            case ObstacleType.BRICK_WALL:
                return 1;
            case ObstacleType.CONCRETE_WALL:
                return 2;
            case ObstacleType.STEEL_WALL:
                return 4;
            case ObstacleType.BUNKER:
                return 6;
            case ObstacleType.BARRIER:
                return 1;
            case ObstacleType.WATER:
            case ObstacleType.FOREST:
            case ObstacleType.ICE:
            default:
                return 0; // 不可破坏
        }
    }

    /**
     * 获取装甲值
     */
    getArmor() {
        switch (this.type) {
            case ObstacleType.STEEL_WALL:
                return 2;
            case ObstacleType.BUNKER:
                return 3;
            case ObstacleType.CONCRETE_WALL:
                return 1;
            default:
                return 0;
        }
    }

    /**
     * 获取通行性
     */
    getPassability() {
        switch (this.type) {
            case ObstacleType.FOREST:
            case ObstacleType.ICE:
                return true;
            case ObstacleType.WATER:
                return false; // 普通坦克不能通过水域
            default:
                return false;
        }
    }

    /**
     * 获取射击穿透性
     */
    getShootability() {
        switch (this.type) {
            case ObstacleType.FOREST:
                return true; // 子弹可以穿过森林
            default:
                return false;
        }
    }

    /**
     * 获取可破坏性
     */
    getDestructibility() {
        switch (this.type) {
            case ObstacleType.WATER:
            case ObstacleType.ICE:
                return false;
            default:
                return this.maxHealth > 0;
        }
    }

    /**
     * 获取环境效果
     */
    getEnvironmentalEffect() {
        switch (this.type) {
            case ObstacleType.ICE:
                return {
                    type: 'slippery',
                    speedMultiplier: 1.5,
                    frictionMultiplier: 0.3
                };
            case ObstacleType.WATER:
                return {
                    type: 'slow',
                    speedMultiplier: 0.5,
                    frictionMultiplier: 2.0
                };
            case ObstacleType.FOREST:
                return {
                    type: 'concealment',
                    visibilityReduction: 0.7
                };
            default:
                return null;
        }
    }

    /**
     * 更新障碍物
     */
    update(deltaTime, gameState) {
        if (this.isDestroyed) {
            return;
        }
        
        super.update(deltaTime, gameState);
        
        // 更新震动效果
        this.updateShakeEffect(deltaTime);
        
        // 更新碎片粒子
        this.updateDebrisParticles(deltaTime);
        
        // 更新损坏等级
        this.updateDamageLevel();
    }

    /**
     * 更新震动效果
     */
    updateShakeEffect(deltaTime) {
        if (this.shakeIntensity > 0) {
            this.shakeTimer += deltaTime;
            this.shakeIntensity = Math.max(0, this.shakeIntensity - deltaTime * 5);
        }
    }

    /**
     * 更新碎片粒子
     */
    updateDebrisParticles(deltaTime) {
        this.debrisParticles = this.debrisParticles.filter(particle => {
            particle.update(deltaTime);
            return particle.lifetime > 0;
        });
    }

    /**
     * 更新损坏等级
     */
    updateDamageLevel() {
        if (!this.isDestructible) {
            this.damageLevel = 0;
            return;
        }
        
        const healthRatio = this.health / this.maxHealth;
        
        if (healthRatio > 0.75) {
            this.damageLevel = 0; // 完好
        } else if (healthRatio > 0.5) {
            this.damageLevel = 1; // 轻微损坏
        } else if (healthRatio > 0.25) {
            this.damageLevel = 2; // 中度损坏
        } else {
            this.damageLevel = 3; // 严重损坏
        }
    }

    /**
     * 受到伤害
     */
    takeDamage(damage, source = null) {
        if (!this.isDestructible || this.isDestroyed) {
            return false;
        }
        
        // 计算实际伤害（考虑装甲）
        const actualDamage = Math.max(1, damage - this.armor);
        
        this.health -= actualDamage;
        this.lastDamageTime = Date.now();
        
        // 震动效果
        this.shakeIntensity = Math.min(5, actualDamage);
        
        // 创建碎片效果
        this.createDebrisEffect(actualDamage);
        
        console.log(`障碍物 ${this.type} 受到 ${actualDamage} 点伤害，剩余生命值：${this.health}`);
        
        // 检查是否被摧毁
        if (this.health <= 0) {
            this.destroy();
            return true;
        }
        
        return false;
    }

    /**
     * 创建碎片效果
     */
    createDebrisEffect(damage) {
        const particleCount = Math.min(damage * 2, 8);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.createDebrisParticle();
            this.debrisParticles.push(particle);
        }
        
        // 限制粒子数量
        if (this.debrisParticles.length > this.maxDebrisParticles) {
            this.debrisParticles = this.debrisParticles.slice(-this.maxDebrisParticles);
        }
    }

    /**
     * 创建碎片粒子
     */
    createDebrisParticle() {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        return {
            x: centerX + (Math.random() - 0.5) * this.width,
            y: centerY + (Math.random() - 0.5) * this.height,
            vx: (Math.random() - 0.5) * 100,
            vy: (Math.random() - 0.5) * 100 - 20,
            size: 2 + Math.random() * 3,
            color: this.getDebrisColor(),
            lifetime: 0.5 + Math.random() * 1.0,
            maxLifetime: 0.5 + Math.random() * 1.0,
            gravity: 80,
            update: function(deltaTime) {
                this.x += this.vx * deltaTime;
                this.y += this.vy * deltaTime;
                this.vy += this.gravity * deltaTime;
                this.lifetime -= deltaTime;
            }
        };
    }

    /**
     * 获取碎片颜色
     */
    getDebrisColor() {
        switch (this.type) {
            case ObstacleType.BRICK_WALL:
                return '#8B4513';
            case ObstacleType.CONCRETE_WALL:
                return '#808080';
            case ObstacleType.STEEL_WALL:
                return '#C0C0C0';
            case ObstacleType.BUNKER:
                return '#696969';
            case ObstacleType.BARRIER:
                return '#654321';
            default:
                return '#666666';
        }
    }

    /**
     * 检查碰撞
     */
    checkCollision(other) {
        if (this.isDestroyed || !this.intersects(other)) {
            return false;
        }
        
        // 如果障碍物可通行，不产生碰撞
        if (this.isPassable) {
            return false;
        }
        
        return true;
    }

    /**
     * 检查射线碰撞
     */
    checkRayCollision(startX, startY, endX, endY) {
        if (this.isDestroyed || this.isShootThrough) {
            return null;
        }
        
        // 简单的射线-矩形相交检测
        const intersection = this.rayIntersectsRect(startX, startY, endX, endY);
        
        if (intersection) {
            return {
                obstacle: this,
                point: intersection,
                distance: Vector2.distance(
                    new Vector2(startX, startY),
                    intersection
                )
            };
        }
        
        return null;
    }

    /**
     * 射线与矩形相交检测
     */
    rayIntersectsRect(startX, startY, endX, endY) {
        // 射线方向
        const dx = endX - startX;
        const dy = endY - startY;
        
        // 计算与四个边的交点
        const intersections = [];
        
        // 左边
        if (dx !== 0) {
            const t = (this.x - startX) / dx;
            if (t >= 0 && t <= 1) {
                const y = startY + t * dy;
                if (y >= this.y && y <= this.y + this.height) {
                    intersections.push(new Vector2(this.x, y));
                }
            }
        }
        
        // 右边
        if (dx !== 0) {
            const t = (this.x + this.width - startX) / dx;
            if (t >= 0 && t <= 1) {
                const y = startY + t * dy;
                if (y >= this.y && y <= this.y + this.height) {
                    intersections.push(new Vector2(this.x + this.width, y));
                }
            }
        }
        
        // 上边
        if (dy !== 0) {
            const t = (this.y - startY) / dy;
            if (t >= 0 && t <= 1) {
                const x = startX + t * dx;
                if (x >= this.x && x <= this.x + this.width) {
                    intersections.push(new Vector2(x, this.y));
                }
            }
        }
        
        // 下边
        if (dy !== 0) {
            const t = (this.y + this.height - startY) / dy;
            if (t >= 0 && t <= 1) {
                const x = startX + t * dx;
                if (x >= this.x && x <= this.x + this.width) {
                    intersections.push(new Vector2(x, this.y + this.height));
                }
            }
        }
        
        // 返回最近的交点
        if (intersections.length > 0) {
            const start = new Vector2(startX, startY);
            let nearest = intersections[0];
            let minDistance = Vector2.distance(start, nearest);
            
            for (let i = 1; i < intersections.length; i++) {
                const distance = Vector2.distance(start, intersections[i]);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = intersections[i];
                }
            }
            
            return nearest;
        }
        
        return null;
    }

    /**
     * 获取环境效果影响
     */
    getEnvironmentalEffectForEntity(entity) {
        if (!this.environmentalEffect || !this.intersects(entity)) {
            return null;
        }
        
        return this.environmentalEffect;
    }

    /**
     * 渲染障碍物
     */
    render(renderer) {
        if (this.isDestroyed) {
            return;
        }
        
        // 计算震动偏移
        const shakeX = this.shakeIntensity > 0 ? 
                     (Math.random() - 0.5) * this.shakeIntensity : 0;
        const shakeY = this.shakeIntensity > 0 ? 
                     (Math.random() - 0.5) * this.shakeIntensity : 0;
        
        const renderX = this.x + shakeX;
        const renderY = this.y + shakeY;
        
        // 渲染主体
        this.renderMainBody(renderer, renderX, renderY);
        
        // 渲染损坏效果
        this.renderDamageEffects(renderer, renderX, renderY);
        
        // 渲染碎片粒子
        this.renderDebrisParticles(renderer);
        
        // 渲染特殊效果
        this.renderSpecialEffects(renderer, renderX, renderY);
    }

    /**
     * 渲染主体
     */
    renderMainBody(renderer, x, y) {
        const color = this.getColor();
        
        // 渲染基础形状
        renderer.fillRect(x, y, this.width, this.height, color);
        
        // 渲染边框
        if (this.type !== ObstacleType.WATER && this.type !== ObstacleType.ICE) {
            renderer.strokeRect(x, y, this.width, this.height, '#000000', 1);
        }
        
        // 渲染纹理
        this.renderTexture(renderer, x, y);
    }

    /**
     * 渲染纹理
     */
    renderTexture(renderer, x, y) {
        switch (this.type) {
            case ObstacleType.BRICK_WALL:
                this.renderBrickTexture(renderer, x, y);
                break;
            case ObstacleType.STEEL_WALL:
                this.renderSteelTexture(renderer, x, y);
                break;
            case ObstacleType.WATER:
                this.renderWaterTexture(renderer, x, y);
                break;
            case ObstacleType.FOREST:
                this.renderForestTexture(renderer, x, y);
                break;
            case ObstacleType.ICE:
                this.renderIceTexture(renderer, x, y);
                break;
        }
    }

    /**
     * 渲染砖块纹理
     */
    renderBrickTexture(renderer, x, y) {
        const brickWidth = 8;
        const brickHeight = 4;
        
        for (let by = 0; by < this.height; by += brickHeight) {
            for (let bx = 0; bx < this.width; bx += brickWidth) {
                const offset = (Math.floor(by / brickHeight) % 2) * (brickWidth / 2);
                renderer.strokeRect(
                    x + bx + offset, 
                    y + by, 
                    brickWidth, 
                    brickHeight, 
                    '#654321', 
                    0.5
                );
            }
        }
    }

    /**
     * 渲染钢铁纹理
     */
    renderSteelTexture(renderer, x, y) {
        // 渲染金属光泽
        const gradient = renderer.createLinearGradient(x, y, x + this.width, y + this.height);
        gradient.addColorStop(0, '#E0E0E0');
        gradient.addColorStop(1, '#A0A0A0');
        
        renderer.fillRect(x, y, this.width, this.height, gradient);
        
        // 渲染螺栓
        const boltSize = 2;
        const boltSpacing = 8;
        
        for (let by = boltSpacing; by < this.height - boltSize; by += boltSpacing) {
            for (let bx = boltSpacing; bx < this.width - boltSize; bx += boltSpacing) {
                renderer.fillRect(
                    x + bx, 
                    y + by, 
                    boltSize, 
                    boltSize, 
                    '#808080'
                );
            }
        }
    }

    /**
     * 渲染水面纹理
     */
    renderWaterTexture(renderer, x, y) {
        // 简单的波浪效果
        const time = Date.now() * 0.005;
        const waveHeight = 2;
        
        for (let i = 0; i < this.width; i += 4) {
            const waveY = Math.sin(time + i * 0.1) * waveHeight;
            renderer.strokeLine(
                x + i, 
                y + this.height / 2 + waveY,
                x + i + 4, 
                y + this.height / 2 + waveY,
                '#004080',
                1
            );
        }
    }

    /**
     * 渲染森林纹理
     */
    renderForestTexture(renderer, x, y) {
        // 渲染树木
        const treeCount = Math.floor(this.width * this.height / 200);
        
        for (let i = 0; i < treeCount; i++) {
            const treeX = x + Math.random() * this.width;
            const treeY = y + Math.random() * this.height;
            const treeSize = 3 + Math.random() * 3;
            
            renderer.fillRect(
                treeX - treeSize / 2,
                treeY - treeSize / 2,
                treeSize,
                treeSize,
                '#006400'
            );
        }
    }

    /**
     * 渲染冰面纹理
     */
    renderIceTexture(renderer, x, y) {
        // 渲染裂纹
        const crackCount = 3;
        
        for (let i = 0; i < crackCount; i++) {
            const startX = x + Math.random() * this.width;
            const startY = y + Math.random() * this.height;
            const endX = x + Math.random() * this.width;
            const endY = y + Math.random() * this.height;
            
            renderer.strokeLine(startX, startY, endX, endY, '#B0E0E6', 1);
        }
    }

    /**
     * 渲染损坏效果
     */
    renderDamageEffects(renderer, x, y) {
        if (this.damageLevel === 0) {
            return;
        }
        
        // 渲染裂纹
        const crackCount = this.damageLevel;
        const crackColor = '#000000';
        
        for (let i = 0; i < crackCount; i++) {
            const startX = x + Math.random() * this.width;
            const startY = y + Math.random() * this.height;
            const endX = startX + (Math.random() - 0.5) * this.width * 0.5;
            const endY = startY + (Math.random() - 0.5) * this.height * 0.5;
            
            renderer.strokeLine(startX, startY, endX, endY, crackColor, 1);
        }
        
        // 渲染损坏区域
        if (this.damageLevel >= 2) {
            const alpha = 0.3 * (this.damageLevel - 1);
            renderer.setGlobalAlpha(alpha);
            renderer.fillRect(x, y, this.width, this.height, '#ff0000');
            renderer.resetGlobalAlpha();
        }
    }

    /**
     * 渲染碎片粒子
     */
    renderDebrisParticles(renderer) {
        for (const particle of this.debrisParticles) {
            const alpha = particle.lifetime / particle.maxLifetime;
            
            renderer.setGlobalAlpha(alpha);
            renderer.fillRect(
                particle.x - particle.size / 2,
                particle.y - particle.size / 2,
                particle.size,
                particle.size,
                particle.color
            );
            renderer.resetGlobalAlpha();
        }
    }

    /**
     * 渲染特殊效果
     */
    renderSpecialEffects(renderer, x, y) {
        // 根据类型渲染特殊效果
        switch (this.type) {
            case ObstacleType.WATER:
                this.renderWaterEffects(renderer, x, y);
                break;
            case ObstacleType.ICE:
                this.renderIceEffects(renderer, x, y);
                break;
            case ObstacleType.FOREST:
                this.renderForestEffects(renderer, x, y);
                break;
        }
    }

    /**
     * 渲染水面效果
     */
    renderWaterEffects(renderer, x, y) {
        // 渲染反射光
        const time = Date.now() * 0.003;
        const shimmerAlpha = 0.3 + 0.2 * Math.sin(time);
        
        renderer.setGlobalAlpha(shimmerAlpha);
        renderer.fillRect(x, y, this.width, this.height / 4, '#ffffff');
        renderer.resetGlobalAlpha();
    }

    /**
     * 渲染冰面效果
     */
    renderIceEffects(renderer, x, y) {
        // 渲染冰晶效果
        const time = Date.now() * 0.002;
        const sparkleAlpha = 0.2 + 0.1 * Math.sin(time * 2);
        
        renderer.setGlobalAlpha(sparkleAlpha);
        
        for (let i = 0; i < 5; i++) {
            const sparkleX = x + Math.random() * this.width;
            const sparkleY = y + Math.random() * this.height;
            
            renderer.fillRect(sparkleX, sparkleY, 1, 1, '#ffffff');
        }
        
        renderer.resetGlobalAlpha();
    }

    /**
     * 渲染森林效果
     */
    renderForestEffects(renderer, x, y) {
        // 渲染阴影效果
        renderer.setGlobalAlpha(0.3);
        renderer.fillRect(x, y, this.width, this.height, '#000000');
        renderer.resetGlobalAlpha();
    }

    /**
     * 获取基础颜色
     */
    getColor() {
        switch (this.type) {
            case ObstacleType.BRICK_WALL:
                return '#8B4513';
            case ObstacleType.STEEL_WALL:
                return '#C0C0C0';
            case ObstacleType.CONCRETE_WALL:
                return '#808080';
            case ObstacleType.WATER:
                return '#0066CC';
            case ObstacleType.FOREST:
                return '#228B22';
            case ObstacleType.ICE:
                return '#E0FFFF';
            case ObstacleType.BUNKER:
                return '#696969';
            case ObstacleType.BARRIER:
                return '#654321';
            default:
                return '#666666';
        }
    }

    /**
     * 获取障碍物状态
     */
    getStatus() {
        return {
            type: this.type,
            health: this.health,
            maxHealth: this.maxHealth,
            damageLevel: this.damageLevel,
            isPassable: this.isPassable,
            isShootThrough: this.isShootThrough,
            isDestructible: this.isDestructible,
            environmentalEffect: this.environmentalEffect
        };
    }
}





