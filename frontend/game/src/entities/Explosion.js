




/**
 * 爆炸效果类
 * 处理爆炸动画、粒子效果和范围伤害
 */

import { GameObject } from './GameObject.js';
import { Vector2 } from '../utils/Vector2.js';

/**
 * 爆炸类型枚举
 */
export const ExplosionType = {
    SMALL: 'small',           // 小型爆炸（子弹碰撞）
    MEDIUM: 'medium',         // 中型爆炸（坦克被摧毁）
    LARGE: 'large',           // 大型爆炸（爆炸弹）
    TANK_DESTRUCTION: 'tank_destruction'  // 坦克摧毁特效
};

/**
 * 粒子类
 */
class Particle {
    constructor(x, y, velocity, color, size, lifetime) {
        this.position = new Vector2(x, y);
        this.velocity = velocity.clone();
        this.color = color;
        this.size = size;
        this.maxLifetime = lifetime;
        this.lifetime = lifetime;
        this.alpha = 1.0;
        this.gravity = 50; // 重力加速度
        this.friction = 0.98; // 摩擦系数
    }

    update(deltaTime) {
        // 更新位置
        this.position.add(Vector2.multiply(this.velocity, deltaTime));
        
        // 应用重力
        this.velocity.y += this.gravity * deltaTime;
        
        // 应用摩擦
        this.velocity.multiply(this.friction);
        
        // 更新生命周期
        this.lifetime -= deltaTime;
        
        // 更新透明度
        this.alpha = Math.max(0, this.lifetime / this.maxLifetime);
        
        return this.lifetime > 0;
    }

    render(renderer) {
        if (this.alpha <= 0) return;
        
        renderer.setGlobalAlpha(this.alpha);
        renderer.drawCircle(
            this.position.x,
            this.position.y,
            this.size,
            this.color
        );
        renderer.resetGlobalAlpha();
    }
}

/**
 * 爆炸类
 */
export class Explosion extends GameObject {
    constructor(x, y, type = ExplosionType.SMALL, source = null) {
        super(x, y, 0, 0); // 爆炸大小会根据类型动态设置
        
        // 基本属性
        this.type = type;
        this.source = source;
        
        // 动画相关
        this.animationPhase = 0; // 0: 扩张, 1: 保持, 2: 收缩
        this.animationTimer = 0;
        this.totalDuration = 1.0; // 总持续时间
        
        // 阶段持续时间
        this.phaseDurations = {
            expand: 0.3,
            hold: 0.2,
            shrink: 0.5
        };
        
        // 视觉效果
        this.currentRadius = 0;
        this.maxRadius = 50;
        this.particles = [];
        this.shockwaveRadius = 0;
        this.shockwaveMaxRadius = 80;
        
        // 伤害相关
        this.damage = 1;
        this.damageRadius = 40;
        this.hasDealtDamage = false;
        this.affectedTargets = new Set();
        
        // 颜色和效果
        this.colors = {
            core: '#ffff00',      // 核心颜色
            outer: '#ff4400',     // 外围颜色
            shockwave: '#ffffff'  // 冲击波颜色
        };
        
        // 音效标志
        this.hasPlayedSound = false;
        
        // 根据类型初始化属性
        this.initializeExplosionProperties();
        
        // 创建粒子效果
        this.createParticles();
        
        // 添加标签
        this.addTag('explosion');
        this.addTag('effect');
    }

    /**
     * 根据爆炸类型初始化属性
     */
    initializeExplosionProperties() {
        switch (this.type) {
            case ExplosionType.SMALL:
                this.maxRadius = 30;
                this.shockwaveMaxRadius = 50;
                this.damage = 1;
                this.damageRadius = 25;
                this.totalDuration = 0.8;
                break;
                
            case ExplosionType.MEDIUM:
                this.maxRadius = 50;
                this.shockwaveMaxRadius = 80;
                this.damage = 2;
                this.damageRadius = 45;
                this.totalDuration = 1.2;
                break;
                
            case ExplosionType.LARGE:
                this.maxRadius = 80;
                this.shockwaveMaxRadius = 120;
                this.damage = 3;
                this.damageRadius = 70;
                this.totalDuration = 1.5;
                break;
                
            case ExplosionType.TANK_DESTRUCTION:
                this.maxRadius = 60;
                this.shockwaveMaxRadius = 100;
                this.damage = 0; // 不造成伤害，纯视觉效果
                this.damageRadius = 0;
                this.totalDuration = 2.0;
                this.colors.core = '#ff8800';
                this.colors.outer = '#ff0000';
                break;
        }
        
        // 设置碰撞边界
        this.width = this.maxRadius * 2;
        this.height = this.maxRadius * 2;
        this.x -= this.maxRadius;
        this.y -= this.maxRadius;
    }

    /**
     * 创建粒子效果
     */
    createParticles() {
        const particleCount = this.getParticleCount();
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
            const speed = 50 + Math.random() * 100;
            const velocity = Vector2.fromAngle(angle).multiply(speed);
            
            const colors = ['#ffff00', '#ff8800', '#ff4400', '#ff0000'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 2 + Math.random() * 4;
            const lifetime = 0.5 + Math.random() * 1.0;
            
            this.particles.push(new Particle(
                centerX + (Math.random() - 0.5) * 10,
                centerY + (Math.random() - 0.5) * 10,
                velocity,
                color,
                size,
                lifetime
            ));
        }
    }

    /**
     * 获取粒子数量
     */
    getParticleCount() {
        switch (this.type) {
            case ExplosionType.SMALL:
                return 8;
            case ExplosionType.MEDIUM:
                return 15;
            case ExplosionType.LARGE:
                return 25;
            case ExplosionType.TANK_DESTRUCTION:
                return 30;
            default:
                return 10;
        }
    }

    /**
     * 更新爆炸效果
     */
    update(deltaTime, gameState) {
        if (this.isDestroyed) {
            return;
        }
        
        super.update(deltaTime, gameState);
        
        // 更新动画计时器
        this.animationTimer += deltaTime;
        
        // 更新动画阶段
        this.updateAnimationPhase();
        
        // 更新视觉效果
        this.updateVisualEffects(deltaTime);
        
        // 更新粒子
        this.updateParticles(deltaTime);
        
        // 处理伤害（仅在扩张阶段的开始）
        this.handleDamage(gameState);
        
        // 播放音效
        this.playExplosionSound(gameState.audioManager);
        
        // 检查是否完成
        this.checkCompletion();
    }

    /**
     * 更新动画阶段
     */
    updateAnimationPhase() {
        if (this.animationTimer < this.phaseDurations.expand) {
            this.animationPhase = 0; // 扩张阶段
        } else if (this.animationTimer < this.phaseDurations.expand + this.phaseDurations.hold) {
            this.animationPhase = 1; // 保持阶段
        } else {
            this.animationPhase = 2; // 收缩阶段
        }
    }

    /**
     * 更新视觉效果
     */
    updateVisualEffects(deltaTime) {
        const progress = this.animationTimer / this.totalDuration;
        
        switch (this.animationPhase) {
            case 0: // 扩张阶段
                const expandProgress = this.animationTimer / this.phaseDurations.expand;
                this.currentRadius = this.maxRadius * this.easeOutQuart(expandProgress);
                this.shockwaveRadius = this.shockwaveMaxRadius * expandProgress;
                break;
                
            case 1: // 保持阶段
                this.currentRadius = this.maxRadius;
                this.shockwaveRadius = this.shockwaveMaxRadius;
                break;
                
            case 2: // 收缩阶段
                const shrinkStart = this.phaseDurations.expand + this.phaseDurations.hold;
                const shrinkProgress = (this.animationTimer - shrinkStart) / this.phaseDurations.shrink;
                this.currentRadius = this.maxRadius * (1 - this.easeInQuart(shrinkProgress));
                this.shockwaveRadius = this.shockwaveMaxRadius * (1 - shrinkProgress);
                break;
        }
    }

    /**
     * 缓动函数 - 四次方缓出
     */
    easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    /**
     * 缓动函数 - 四次方缓入
     */
    easeInQuart(t) {
        return t * t * t * t;
    }

    /**
     * 更新粒子
     */
    updateParticles(deltaTime) {
        this.particles = this.particles.filter(particle => 
            particle.update(deltaTime)
        );
    }

    /**
     * 处理伤害
     */
    handleDamage(gameState) {
        if (this.hasDealtDamage || this.damage <= 0 || this.animationPhase !== 0) {
            return;
        }
        
        // 只在扩张阶段的中期造成伤害
        if (this.animationTimer < this.phaseDurations.expand * 0.5) {
            return;
        }
        
        this.hasDealtDamage = true;
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // 检查范围内的目标
        if (gameState.entities) {
            for (const entity of gameState.entities) {
                if (this.canDamageTarget(entity)) {
                    const distance = Vector2.distance(
                        new Vector2(centerX, centerY),
                        entity.getCenter()
                    );
                    
                    if (distance <= this.damageRadius) {
                        this.dealDamageToTarget(entity, distance);
                    }
                }
            }
        }
    }

    /**
     * 检查是否可以伤害目标
     */
    canDamageTarget(target) {
        // 不能伤害自己的来源
        if (target === this.source) {
            return false;
        }
        
        // 不能重复伤害同一目标
        if (this.affectedTargets.has(target.id)) {
            return false;
        }
        
        // 检查目标是否有takeDamage方法
        if (!target.takeDamage) {
            return false;
        }
        
        // 检查目标是否已被摧毁
        if (target.isDestroyed) {
            return false;
        }
        
        return true;
    }

    /**
     * 对目标造成伤害
     */
    dealDamageToTarget(target, distance) {
        // 根据距离计算伤害衰减
        const damageMultiplier = 1 - (distance / this.damageRadius) * 0.5;
        const actualDamage = Math.ceil(this.damage * damageMultiplier);
        
        // 造成伤害
        target.takeDamage(actualDamage, this);
        
        // 标记已受影响
        this.affectedTargets.add(target.id);
        
        console.log(`爆炸对 ${target.constructor.name} 造成 ${actualDamage} 点伤害`);
    }

    /**
     * 播放爆炸音效
     */
    playExplosionSound(audioManager) {
        if (this.hasPlayedSound || !audioManager) {
            return;
        }
        
        this.hasPlayedSound = true;
        
        // 根据爆炸类型播放不同音效
        switch (this.type) {
            case ExplosionType.SMALL:
                audioManager.playSound('explosion', { volume: 0.6 });
                break;
            case ExplosionType.MEDIUM:
                audioManager.playSound('explosion', { volume: 0.8 });
                break;
            case ExplosionType.LARGE:
                audioManager.playSound('explosion', { volume: 1.0 });
                break;
            case ExplosionType.TANK_DESTRUCTION:
                audioManager.playSound('explosion', { volume: 0.9 });
                break;
        }
    }

    /**
     * 检查是否完成
     */
    checkCompletion() {
        if (this.animationTimer >= this.totalDuration) {
            this.destroy();
        }
    }

    /**
     * 渲染爆炸效果
     */
    render(renderer) {
        if (this.isDestroyed) {
            return;
        }
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // 渲染冲击波
        this.renderShockwave(renderer, centerX, centerY);
        
        // 渲染主爆炸效果
        this.renderMainExplosion(renderer, centerX, centerY);
        
        // 渲染粒子
        this.renderParticles(renderer);
    }

    /**
     * 渲染冲击波
     */
    renderShockwave(renderer, centerX, centerY) {
        if (this.shockwaveRadius <= 0) return;
        
        const alpha = Math.max(0, 1 - (this.animationTimer / this.totalDuration));
        
        renderer.setGlobalAlpha(alpha * 0.3);
        renderer.drawCircleOutline(
            centerX,
            centerY,
            this.shockwaveRadius,
            this.colors.shockwave,
            2
        );
        renderer.resetGlobalAlpha();
    }

    /**
     * 渲染主爆炸效果
     */
    renderMainExplosion(renderer, centerX, centerY) {
        if (this.currentRadius <= 0) return;
        
        const progress = this.animationTimer / this.totalDuration;
        const alpha = Math.max(0, 1 - progress);
        
        // 渲染外围火焰
        renderer.setGlobalAlpha(alpha * 0.8);
        renderer.drawCircle(centerX, centerY, this.currentRadius, this.colors.outer);
        
        // 渲染核心
        renderer.setGlobalAlpha(alpha);
        renderer.drawCircle(centerX, centerY, this.currentRadius * 0.6, this.colors.core);
        
        // 渲染内核
        renderer.setGlobalAlpha(alpha * 1.2);
        renderer.drawCircle(centerX, centerY, this.currentRadius * 0.3, '#ffffff');
        
        renderer.resetGlobalAlpha();
    }

    /**
     * 渲染粒子
     */
    renderParticles(renderer) {
        for (const particle of this.particles) {
            particle.render(renderer);
        }
    }

    /**
     * 获取爆炸状态
     */
    getStatus() {
        return {
            type: this.type,
            animationPhase: this.animationPhase,
            progress: this.animationTimer / this.totalDuration,
            currentRadius: this.currentRadius,
            particleCount: this.particles.length,
            hasDealtDamage: this.hasDealtDamage
        };
    }

    /**
     * 销毁爆炸效果
     */
    destroy() {
        super.destroy();
        
        // 清理粒子
        this.particles = [];
        
        // 清理目标集合
        this.affectedTargets.clear();
    }
}




