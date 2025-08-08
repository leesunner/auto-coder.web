





import { GameObject } from './GameObject.js';

/**
 * 爆炸效果类
 * 处理各种爆炸效果和伤害
 */
export class Explosion extends GameObject {
    constructor(x, y, radius, damage, owner = null) {
        super(x, y, radius * 2, radius * 2);
        
        // 爆炸属性
        this.radius = radius;
        this.maxRadius = radius;
        this.damage = damage;
        this.owner = owner;
        this.team = owner ? owner.team : 'neutral';
        
        // 爆炸类型
        this.explosionType = 'normal';
        
        // 动画属性
        this.animationDuration = 0.8;
        this.animationTimer = 0;
        this.expandPhase = 0.3; // 扩张阶段时长
        this.fadePhase = 0.5; // 淡出阶段时长
        
        // 当前状态
        this.currentRadius = 0;
        this.currentAlpha = 1;
        this.phase = 'expanding'; // expanding, fading, finished
        
        // 粒子系统
        this.particles = [];
        this.maxParticles = 20;
        this.particleSpeed = 100;
        
        // 冲击波
        this.shockwave = {
            active: true,
            radius: 0,
            maxRadius: radius * 1.5,
            speed: 200,
            alpha: 0.8
        };
        
        // 伤害处理
        this.damagedTargets = new Set(); // 防止重复伤害
        this.damageRadius = radius;
        this.knockbackForce = 150;
        
        // 视觉效果
        this.flashEffect = {
            active: true,
            duration: 0.1,
            timer: 0.1,
            intensity: 1
        };
        
        this.fireEffect = {
            active: true,
            particles: [],
            duration: 0.6
        };
        
        this.smokeEffect = {
            active: true,
            particles: [],
            duration: 1.2
        };
        
        // 音效
        this.sounds = {
            explosion: null,
            debris: null
        };
        
        // 设置属性
        this.isSolid = false; // 爆炸不参与物理碰撞
        this.lifeTime = this.animationDuration;
        
        // 设置标签
        this.addTag('explosion');
        this.addTag('effect');
        
        // 初始化
        this.initialize();
    }

    /**
     * 初始化爆炸
     */
    initialize() {
        this.createParticles();
        this.createFireParticles();
        this.createSmokeParticles();
        this.playExplosionSound();
        
        // 立即处理伤害
        this.processDamage();
    }

    /**
     * 创建爆炸粒子
     */
    createParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            const angle = (i / this.maxParticles) * Math.PI * 2;
            const speed = this.particleSpeed * (0.5 + Math.random() * 0.5);
            
            this.particles.push({
                x: 0,
                y: 0,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                life: 0.6 + Math.random() * 0.4,
                maxLife: 0.6 + Math.random() * 0.4,
                size: 2 + Math.random() * 4,
                color: this.getRandomExplosionColor(),
                alpha: 1,
                gravity: 50
            });
        }
    }

    /**
     * 创建火焰粒子
     */
    createFireParticles() {
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * this.radius * 0.5;
            
            this.fireEffect.particles.push({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                velocityX: (Math.random() - 0.5) * 30,
                velocityY: (Math.random() - 0.5) * 30 - 20,
                life: 0.4 + Math.random() * 0.3,
                maxLife: 0.4 + Math.random() * 0.3,
                size: 3 + Math.random() * 6,
                alpha: 1
            });
        }
    }

    /**
     * 创建烟雾粒子
     */
    createSmokeParticles() {
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * this.radius * 0.3;
            
            this.smokeEffect.particles.push({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                velocityX: (Math.random() - 0.5) * 20,
                velocityY: (Math.random() - 0.5) * 20 - 10,
                life: 1.0 + Math.random() * 0.5,
                maxLife: 1.0 + Math.random() * 0.5,
                size: 4 + Math.random() * 8,
                alpha: 0.6,
                expansion: 20 // 烟雾扩散速度
            });
        }
    }

    /**
     * 播放爆炸音效
     */
    playExplosionSound() {
        if (this.sounds.explosion) {
            this.sounds.explosion.currentTime = 0;
            this.sounds.explosion.play();
        }
    }

    /**
     * 处理爆炸伤害
     */
    processDamage() {
        // 请求附近的目标
        this.emit('requestTargetsInRadius', {
            position: { x: this.x, y: this.y },
            radius: this.damageRadius,
            excludeTeam: this.team,
            excludeOwner: this.owner
        });
    }

    /**
     * 对目标造成伤害
     */
    damageTargets(targets) {
        for (const target of targets) {
            if (this.damagedTargets.has(target.id)) {
                continue; // 已经受过伤害
            }
            
            const distance = this.getDistanceTo(target);
            if (distance <= this.damageRadius) {
                // 根据距离计算伤害衰减
                const damageRatio = 1 - (distance / this.damageRadius);
                const actualDamage = this.damage * damageRatio;
                
                // 造成伤害
                if (target.takeDamage) {
                    target.takeDamage(actualDamage, this.owner);
                }
                
                // 施加击退效果
                this.applyKnockback(target, distance);
                
                // 记录已伤害的目标
                this.damagedTargets.add(target.id);
                
                this.emit('targetDamaged', { target, damage: actualDamage });
            }
        }
    }

    /**
     * 施加击退效果
     */
    applyKnockback(target, distance) {
        if (!target.addForce) return;
        
        const knockbackRatio = 1 - (distance / this.damageRadius);
        const force = this.knockbackForce * knockbackRatio;
        
        const angle = this.getAngleTo(target);
        const forceX = Math.cos(angle) * force;
        const forceY = Math.sin(angle) * force;
        
        target.addForce(forceX, forceY, 0.1);
    }

    /**
     * 更新爆炸效果
     */
    onUpdate(deltaTime) {
        this.animationTimer += deltaTime;
        
        // 更新动画阶段
        this.updateAnimationPhase();
        
        // 更新各种效果
        this.updateExpansion(deltaTime);
        this.updateShockwave(deltaTime);
        this.updateParticles(deltaTime);
        this.updateFireEffect(deltaTime);
        this.updateSmokeEffect(deltaTime);
        this.updateFlashEffect(deltaTime);
        
        // 检查是否结束
        if (this.animationTimer >= this.animationDuration) {
            this.destroy();
        }
    }

    /**
     * 更新动画阶段
     */
    updateAnimationPhase() {
        if (this.animationTimer < this.expandPhase) {
            this.phase = 'expanding';
        } else if (this.animationTimer < this.expandPhase + this.fadePhase) {
            this.phase = 'fading';
        } else {
            this.phase = 'finished';
        }
    }

    /**
     * 更新扩张效果
     */
    updateExpansion(deltaTime) {
        if (this.phase === 'expanding') {
            const progress = this.animationTimer / this.expandPhase;
            this.currentRadius = this.maxRadius * this.easeOut(progress);
            this.currentAlpha = 1;
        } else if (this.phase === 'fading') {
            this.currentRadius = this.maxRadius;
            const fadeProgress = (this.animationTimer - this.expandPhase) / this.fadePhase;
            this.currentAlpha = 1 - this.easeIn(fadeProgress);
        }
    }

    /**
     * 更新冲击波
     */
    updateShockwave(deltaTime) {
        if (this.shockwave.active) {
            this.shockwave.radius += this.shockwave.speed * deltaTime;
            
            if (this.shockwave.radius >= this.shockwave.maxRadius) {
                this.shockwave.active = false;
            } else {
                const progress = this.shockwave.radius / this.shockwave.maxRadius;
                this.shockwave.alpha = 0.8 * (1 - progress);
            }
        }
    }

    /**
     * 更新爆炸粒子
     */
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // 更新位置
            particle.x += particle.velocityX * deltaTime;
            particle.y += particle.velocityY * deltaTime;
            
            // 应用重力
            particle.velocityY += particle.gravity * deltaTime;
            
            // 更新生命
            particle.life -= deltaTime;
            particle.alpha = particle.life / particle.maxLife;
            
            // 移除死亡粒子
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * 更新火焰效果
     */
    updateFireEffect(deltaTime) {
        if (!this.fireEffect.active) return;
        
        for (let i = this.fireEffect.particles.length - 1; i >= 0; i--) {
            const particle = this.fireEffect.particles[i];
            
            particle.x += particle.velocityX * deltaTime;
            particle.y += particle.velocityY * deltaTime;
            particle.life -= deltaTime;
            particle.alpha = particle.life / particle.maxLife;
            
            if (particle.life <= 0) {
                this.fireEffect.particles.splice(i, 1);
            }
        }
        
        // 检查火焰效果是否结束
        if (this.animationTimer > this.fireEffect.duration) {
            this.fireEffect.active = false;
        }
    }

    /**
     * 更新烟雾效果
     */
    updateSmokeEffect(deltaTime) {
        if (!this.smokeEffect.active) return;
        
        for (let i = this.smokeEffect.particles.length - 1; i >= 0; i--) {
            const particle = this.smokeEffect.particles[i];
            
            particle.x += particle.velocityX * deltaTime;
            particle.y += particle.velocityY * deltaTime;
            particle.size += particle.expansion * deltaTime;
            particle.life -= deltaTime;
            particle.alpha = (particle.life / particle.maxLife) * 0.6;
            
            if (particle.life <= 0) {
                this.smokeEffect.particles.splice(i, 1);
            }
        }
        
        // 检查烟雾效果是否结束
        if (this.animationTimer > this.smokeEffect.duration) {
            this.smokeEffect.active = false;
        }
    }

    /**
     * 更新闪光效果
     */
    updateFlashEffect(deltaTime) {
        if (this.flashEffect.active) {
            this.flashEffect.timer -= deltaTime;
            
            if (this.flashEffect.timer <= 0) {
                this.flashEffect.active = false;
            } else {
                this.flashEffect.intensity = this.flashEffect.timer / this.flashEffect.duration;
            }
        }
    }

    /**
     * 渲染爆炸效果
     */
    onRender(context) {
        // 渲染闪光效果
        if (this.flashEffect.active) {
            this.renderFlash(context);
        }
        
        // 渲染冲击波
        if (this.shockwave.active) {
            this.renderShockwave(context);
        }
        
        // 渲染主爆炸
        this.renderMainExplosion(context);
        
        // 渲染火焰粒子
        this.renderFireParticles(context);
        
        // 渲染烟雾粒子
        this.renderSmokeParticles(context);
        
        // 渲染爆炸粒子
        this.renderExplosionParticles(context);
    }

    /**
     * 渲染主爆炸
     */
    renderMainExplosion(context) {
        if (this.currentAlpha <= 0) return;
        
        context.save();
        context.globalAlpha = this.currentAlpha;
        
        // 创建径向渐变
        const gradient = context.createRadialGradient(0, 0, 0, 0, 0, this.currentRadius);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, '#ffaa00');
        gradient.addColorStop(0.6, '#ff4400');
        gradient.addColorStop(1, 'transparent');
        
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(0, 0, this.currentRadius, 0, Math.PI * 2);
        context.fill();
        
        context.restore();
    }

    /**
     * 渲染冲击波
     */
    renderShockwave(context) {
        if (!this.shockwave.active) return;
        
        context.save();
        context.globalAlpha = this.shockwave.alpha;
        context.strokeStyle = '#ffffff';
        context.lineWidth = 3;
        
        context.beginPath();
        context.arc(0, 0, this.shockwave.radius, 0, Math.PI * 2);
        context.stroke();
        
        context.restore();
    }

    /**
     * 渲染闪光效果
     */
    renderFlash(context) {
        context.save();
        context.globalAlpha = this.flashEffect.intensity * 0.8;
        context.fillStyle = '#ffffff';
        
        const flashRadius = this.maxRadius * 2;
        context.beginPath();
        context.arc(0, 0, flashRadius, 0, Math.PI * 2);
        context.fill();
        
        context.restore();
    }

    /**
     * 渲染火焰粒子
     */
    renderFireParticles(context) {
        for (const particle of this.fireEffect.particles) {
            context.save();
            context.globalAlpha = particle.alpha;
            
            const colors = ['#ff4400', '#ff8800', '#ffaa00'];
            const colorIndex = Math.floor((1 - particle.alpha) * colors.length);
            context.fillStyle = colors[Math.min(colorIndex, colors.length - 1)];
            
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            context.fill();
            
            context.restore();
        }
    }

    /**
     * 渲染烟雾粒子
     */
    renderSmokeParticles(context) {
        for (const particle of this.smokeEffect.particles) {
            context.save();
            context.globalAlpha = particle.alpha;
            context.fillStyle = '#666666';
            
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            context.fill();
            
            context.restore();
        }
    }

    /**
     * 渲染爆炸粒子
     */
    renderExplosionParticles(context) {
        for (const particle of this.particles) {
            context.save();
            context.globalAlpha = particle.alpha;
            context.fillStyle = particle.color;
            
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            context.fill();
            
            context.restore();
        }
    }

    /**
     * 获取随机爆炸颜色
     */
    getRandomExplosionColor() {
        const colors = ['#ff4400', '#ff8800', '#ffaa00', '#ffffff', '#ff0000'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * 缓动函数
     */
    easeOut(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    easeIn(t) {
        return t * t * t;
    }

    /**
     * 销毁爆炸
     */
    onDestroy() {
        // 清理所有粒子
        this.particles = [];
        this.fireEffect.particles = [];
        this.smokeEffect.particles = [];
        
        // 停止音效
        for (const sound of Object.values(this.sounds)) {
            if (sound) {
                sound.pause();
                sound.currentTime = 0;
            }
        }
    }
}

/**
 * 具体的爆炸类型
 */

/**
 * 小型爆炸
 */
export class SmallExplosion extends Explosion {
    constructor(x, y, owner = null) {
        super(x, y, 20, 15, owner);
        this.explosionType = 'small';
        this.animationDuration = 0.5;
        this.maxParticles = 10;
    }
}

/**
 * 大型爆炸
 */
export class LargeExplosion extends Explosion {
    constructor(x, y, owner = null) {
        super(x, y, 60, 40, owner);
        this.explosionType = 'large';
        this.animationDuration = 1.2;
        this.maxParticles = 30;
        this.knockbackForce = 250;
    }
}

/**
 * 燃烧爆炸
 */
export class FireExplosion extends Explosion {
    constructor(x, y, owner = null) {
        super(x, y, 40, 25, owner);
        this.explosionType = 'fire';
        this.fireEffect.duration = 1.0;
        this.smokeEffect.duration = 2.0;
    }

    /**
     * 创建更多火焰粒子
     */
    createFireParticles() {
        super.createFireParticles();
        
        // 额外的火焰粒子
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * this.radius;
            
            this.fireEffect.particles.push({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                velocityX: (Math.random() - 0.5) * 40,
                velocityY: (Math.random() - 0.5) * 40 - 30,
                life: 0.8 + Math.random() * 0.4,
                maxLife: 0.8 + Math.random() * 0.4,
                size: 4 + Math.random() * 8,
                alpha: 1
            });
        }
    }
}

/**
 * 冰冻爆炸
 */
export class IceExplosion extends Explosion {
    constructor(x, y, owner = null) {
        super(x, y, 35, 20, owner);
        this.explosionType = 'ice';
        this.freezeEffect = {
            duration: 2,
            slowFactor: 0.5
        };
    }

    /**
     * 对目标造成伤害并附加冰冻效果
     */
    damageTargets(targets) {
        super.damageTargets(targets);
        
        // 附加冰冻效果
        for (const target of targets) {
            if (target.addPowerUp) {
                target.addPowerUp('frozen', this.freezeEffect.duration, {
                    apply: (tank) => { 
                        tank.maxSpeed *= this.freezeEffect.slowFactor;
                        tank.fireRate *= this.freezeEffect.slowFactor;
                    },
                    remove: (tank) => { 
                        tank.maxSpeed /= this.freezeEffect.slowFactor;
                        tank.fireRate /= this.freezeEffect.slowFactor;
                    }
                });
            }
        }
    }

    /**
     * 渲染主爆炸（冰蓝色）
     */
    renderMainExplosion(context) {
        if (this.currentAlpha <= 0) return;
        
        context.save();
        context.globalAlpha = this.currentAlpha;
        
        const gradient = context.createRadialGradient(0, 0, 0, 0, 0, this.currentRadius);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, '#88ddff');
        gradient.addColorStop(0.6, '#0088ff');
        gradient.addColorStop(1, 'transparent');
        
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(0, 0, this.currentRadius, 0, Math.PI * 2);
        context.fill();
        
        context.restore();
    }
}






