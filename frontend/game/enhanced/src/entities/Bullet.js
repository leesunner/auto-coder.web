




import { GameObject } from './GameObject.js';

/**
 * 子弹基类
 * 所有子弹类型的基础类
 */
export class Bullet extends GameObject {
    constructor(x, y, direction, speed, damage, owner) {
        super(x, y, 4, 4);
        
        // 子弹基础属性
        this.direction = direction;
        this.speed = speed;
        this.damage = damage;
        this.owner = owner;
        this.team = owner ? owner.team : 'neutral';
        
        // 运动属性
        this.velocityX = Math.cos(direction) * speed;
        this.velocityY = Math.sin(direction) * speed;
        this.maxSpeed = speed;
        
        // 子弹类型
        this.bulletType = 'basic';
        this.penetration = 1; // 穿透次数
        this.remainingPenetration = this.penetration;
        
        // 生命周期
        this.lifeTime = 5; // 5秒后自动销毁
        this.range = speed * this.lifeTime;
        this.distanceTraveled = 0;
        
        // 特效属性
        this.trailParticles = [];
        this.maxTrailParticles = 10;
        this.hasTrail = false;
        this.glowEffect = false;
        this.sparkEffect = false;
        
        // 爆炸属性
        this.explosionRadius = 0;
        this.explosionDamage = 0;
        this.hasExplosion = false;
        
        // 特殊效果
        this.ricochetCount = 0;
        this.maxRicochet = 0;
        this.homingTarget = null;
        this.homingStrength = 0;
        
        // 音效
        this.sounds = {
            fire: null,
            hit: null,
            ricochet: null,
            explosion: null
        };
        
        // 设置标签
        this.addTag('bullet');
        this.addTag(this.team);
        
        // 设置碰撞
        this.collisionLayer = 3; // 子弹层
        this.isSolid = true;
        
        // 初始化
        this.initialize();
    }

    /**
     * 初始化子弹
     */
    initialize() {
        this.setupBulletType();
        this.setupVisualEffects();
    }

    /**
     * 设置子弹类型
     */
    setupBulletType() {
        // 子类重写
    }

    /**
     * 设置视觉效果
     */
    setupVisualEffects() {
        // 子类重写
    }

    /**
     * 更新子弹
     */
    onUpdate(deltaTime) {
        // 更新距离
        const frameDistance = this.speed * deltaTime;
        this.distanceTraveled += frameDistance;
        
        // 检查射程
        if (this.distanceTraveled >= this.range) {
            this.destroy();
            return;
        }
        
        // 更新导引
        if (this.homingTarget && this.homingStrength > 0) {
            this.updateHoming(deltaTime);
        }
        
        // 更新轨迹粒子
        if (this.hasTrail) {
            this.updateTrail(deltaTime);
        }
        
        // 更新特效
        this.updateEffects(deltaTime);
    }

    /**
     * 更新导引系统
     */
    updateHoming(deltaTime) {
        if (!this.homingTarget || this.homingTarget.isDestroyed) {
            this.homingTarget = null;
            return;
        }

        const targetAngle = this.getAngleTo(this.homingTarget);
        const angleDiff = targetAngle - this.direction;
        
        // 标准化角度差
        let normalizedDiff = angleDiff;
        while (normalizedDiff > Math.PI) normalizedDiff -= 2 * Math.PI;
        while (normalizedDiff < -Math.PI) normalizedDiff += 2 * Math.PI;
        
        // 应用导引
        const turnRate = this.homingStrength * deltaTime;
        const actualTurn = Math.sign(normalizedDiff) * Math.min(Math.abs(normalizedDiff), turnRate);
        
        this.direction += actualTurn;
        this.velocityX = Math.cos(this.direction) * this.speed;
        this.velocityY = Math.sin(this.direction) * this.speed;
    }

    /**
     * 更新轨迹效果
     */
    updateTrail(deltaTime) {
        // 添加新的轨迹粒子
        if (this.trailParticles.length < this.maxTrailParticles) {
            this.addTrailParticle();
        }

        // 更新现有粒子
        for (let i = this.trailParticles.length - 1; i >= 0; i--) {
            const particle = this.trailParticles[i];
            particle.life -= deltaTime;
            particle.alpha = particle.life / particle.maxLife;
            
            if (particle.life <= 0) {
                this.trailParticles.splice(i, 1);
            }
        }
    }

    /**
     * 添加轨迹粒子
     */
    addTrailParticle() {
        const particle = {
            x: this.x,
            y: this.y,
            life: 0.3,
            maxLife: 0.3,
            alpha: 1.0,
            size: 2
        };
        
        this.trailParticles.push(particle);
    }

    /**
     * 更新特效
     */
    updateEffects(deltaTime) {
        // 子类可重写
    }

    /**
     * 碰撞处理
     */
    onCollision(other) {
        // 不与发射者碰撞
        if (other === this.owner) {
            return false;
        }

        // 不与同队伍对象碰撞
        if (other.team === this.team) {
            return false;
        }

        // 处理碰撞
        this.handleCollision(other);
        
        return true;
    }

    /**
     * 处理碰撞
     */
    handleCollision(target) {
        // 造成伤害
        if (target.takeDamage) {
            const actualDamage = target.takeDamage(this.damage, this.owner);
            
            // 通知发射者命中
            if (this.owner && this.owner.onBulletHit) {
                this.owner.onBulletHit(target, actualDamage);
            }
            
            this.emit('hit', { target, damage: actualDamage });
        }

        // 处理穿透
        this.remainingPenetration--;
        if (this.remainingPenetration <= 0) {
            this.explode();
        }

        // 播放命中音效
        if (this.sounds.hit) {
            this.sounds.hit.currentTime = 0;
            this.sounds.hit.play();
        }
    }

    /**
     * 墙壁碰撞处理
     */
    onWallCollision(wall) {
        if (this.maxRicochet > 0 && this.ricochetCount < this.maxRicochet) {
            this.ricochet(wall);
        } else {
            this.explode();
        }
    }

    /**
     * 弹跳处理
     */
    ricochet(wall) {
        this.ricochetCount++;
        
        // 计算反射角度
        const wallNormal = this.getWallNormal(wall);
        const incident = this.direction;
        const reflected = incident - 2 * this.dotProduct(incident, wallNormal) * wallNormal;
        
        this.direction = reflected;
        this.velocityX = Math.cos(this.direction) * this.speed;
        this.velocityY = Math.sin(this.direction) * this.speed;
        
        // 减少一些伤害
        this.damage *= 0.8;
        
        // 播放弹跳音效
        if (this.sounds.ricochet) {
            this.sounds.ricochet.currentTime = 0;
            this.sounds.ricochet.play();
        }
        
        this.emit('ricochet', { wall, remainingRicochets: this.maxRicochet - this.ricochetCount });
    }

    /**
     * 获取墙壁法向量
     */
    getWallNormal(wall) {
        // 简化处理，返回垂直或水平法向量
        if (wall.width > wall.height) {
            return this.y < wall.y ? -1 : 1; // 垂直法向量
        } else {
            return this.x < wall.x ? -1 : 1; // 水平法向量
        }
    }

    /**
     * 向量点积
     */
    dotProduct(a, b) {
        return a * b;
    }

    /**
     * 爆炸
     */
    explode() {
        if (this.hasExplosion && this.explosionRadius > 0) {
            // 创建爆炸效果
            this.createExplosion();
            
            // 播放爆炸音效
            if (this.sounds.explosion) {
                this.sounds.explosion.currentTime = 0;
                this.sounds.explosion.play();
            }
        }
        
        this.emit('explode', { 
            position: { x: this.x, y: this.y },
            radius: this.explosionRadius,
            damage: this.explosionDamage
        });
        
        this.destroy();
    }

    /**
     * 创建爆炸效果
     */
    createExplosion() {
        const explosionData = {
            x: this.x,
            y: this.y,
            radius: this.explosionRadius,
            damage: this.explosionDamage,
            owner: this.owner,
            team: this.team
        };
        
        this.emit('createExplosion', explosionData);
    }

    /**
     * 渲染子弹
     */
    onRender(context) {
        // 渲染轨迹
        if (this.hasTrail) {
            this.renderTrail(context);
        }
        
        // 渲染子弹主体
        this.renderBulletBody(context);
        
        // 渲染光晕效果
        if (this.glowEffect) {
            this.renderGlow(context);
        }
    }

    /**
     * 渲染子弹主体
     */
    renderBulletBody(context) {
        context.save();
        
        // 旋转到飞行方向
        context.rotate(this.direction);
        
        // 设置颜色
        context.fillStyle = this.getBulletColor();
        
        // 绘制子弹
        context.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        context.restore();
    }

    /**
     * 渲染轨迹
     */
    renderTrail(context) {
        if (this.trailParticles.length < 2) return;
        
        context.save();
        context.strokeStyle = this.getTrailColor();
        context.lineWidth = 2;
        
        context.beginPath();
        for (let i = 0; i < this.trailParticles.length; i++) {
            const particle = this.trailParticles[i];
            context.globalAlpha = particle.alpha;
            
            if (i === 0) {
                context.moveTo(particle.x - this.x, particle.y - this.y);
            } else {
                context.lineTo(particle.x - this.x, particle.y - this.y);
            }
        }
        context.stroke();
        
        context.restore();
    }

    /**
     * 渲染光晕
     */
    renderGlow(context) {
        context.save();
        
        const gradient = context.createRadialGradient(0, 0, 0, 0, 0, this.width * 2);
        gradient.addColorStop(0, this.getBulletColor());
        gradient.addColorStop(1, 'transparent');
        
        context.fillStyle = gradient;
        context.globalAlpha = 0.5;
        context.fillRect(-this.width * 2, -this.height * 2, this.width * 4, this.height * 4);
        
        context.restore();
    }

    /**
     * 获取子弹颜色
     */
    getBulletColor() {
        switch (this.bulletType) {
            case 'basic': return '#ffff00';
            case 'heavy': return '#ff8800';
            case 'rapid': return '#00ff00';
            case 'explosive': return '#ff0000';
            case 'energy': return '#00ffff';
            default: return '#ffffff';
        }
    }

    /**
     * 获取轨迹颜色
     */
    getTrailColor() {
        return this.getBulletColor();
    }

    /**
     * 销毁子弹
     */
    onDestroy() {
        // 清理轨迹粒子
        this.trailParticles = [];
        
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
 * 基础子弹
 */
export class BasicBullet extends Bullet {
    constructor(x, y, direction, speed, damage, owner) {
        super(x, y, direction, speed, damage, owner);
        this.bulletType = 'basic';
    }
}

/**
 * 重型子弹
 */
export class HeavyBullet extends Bullet {
    constructor(x, y, direction, speed, damage, owner) {
        super(x, y, direction, speed, damage, owner);
        this.bulletType = 'heavy';
        this.width = 6;
        this.height = 6;
        this.penetration = 2;
        this.remainingPenetration = this.penetration;
        this.damage *= 1.5;
    }
}

/**
 * 快速子弹
 */
export class RapidBullet extends Bullet {
    constructor(x, y, direction, speed, damage, owner) {
        super(x, y, direction, speed * 1.5, damage * 0.7, owner);
        this.bulletType = 'rapid';
        this.width = 3;
        this.height = 3;
        this.hasTrail = true;
    }
}

/**
 * 爆炸子弹
 */
export class ExplosiveBullet extends Bullet {
    constructor(x, y, direction, speed, damage, owner) {
        super(x, y, direction, speed, damage, owner);
        this.bulletType = 'explosive';
        this.hasExplosion = true;
        this.explosionRadius = 40;
        this.explosionDamage = damage * 0.8;
        this.glowEffect = true;
    }
}

/**
 * 能量子弹
 */
export class EnergyBullet extends Bullet {
    constructor(x, y, direction, speed, damage, owner) {
        super(x, y, direction, speed, damage, owner);
        this.bulletType = 'energy';
        this.hasTrail = true;
        this.glowEffect = true;
        this.penetration = 3;
        this.remainingPenetration = this.penetration;
    }
}

/**
 * 导引导弹
 */
export class HomingMissile extends Bullet {
    constructor(x, y, direction, speed, damage, owner, target = null) {
        super(x, y, direction, speed, damage, owner);
        this.bulletType = 'homing';
        this.width = 8;
        this.height = 8;
        this.homingTarget = target;
        this.homingStrength = 2; // 转向速度
        this.hasTrail = true;
        this.hasExplosion = true;
        this.explosionRadius = 30;
        this.explosionDamage = damage;
        this.lifeTime = 8; // 更长的生命周期
    }

    /**
     * 设置目标
     */
    setTarget(target) {
        this.homingTarget = target;
    }

    /**
     * 渲染导弹
     */
    renderBulletBody(context) {
        context.save();
        
        // 旋转到飞行方向
        context.rotate(this.direction);
        
        // 绘制导弹主体
        context.fillStyle = '#ff4444';
        context.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // 绘制尾翼
        context.fillStyle = '#888888';
        context.fillRect(-this.width / 2 - 3, -2, 3, 4);
        
        context.restore();
    }
}





