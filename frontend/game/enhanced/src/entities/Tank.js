


import { GameObject } from './GameObject.js';

/**
 * 坦克基类
 * 所有坦克类型的基础类
 */
export class Tank extends GameObject {
    constructor(x, y, team = 'neutral') {
        super(x, y, 32, 32);
        
        // 坦克基础属性
        this.team = team;
        this.tankType = 'basic';
        this.level = 1;
        
        // 移动属性
        this.maxSpeed = 80;
        this.acceleration = 200;
        this.turnSpeed = 3; // 转向速度（弧度/秒）
        this.moveDirection = 0; // 移动方向
        this.turretDirection = 0; // 炮塔方向
        
        // 武器属性
        this.weaponType = 'basic';
        this.fireRate = 1; // 每秒射击次数
        this.lastFireTime = 0;
        this.bulletSpeed = 300;
        this.bulletDamage = 25;
        this.ammunition = -1; // -1 表示无限弹药
        this.maxAmmunition = 100;
        
        // 防御属性
        this.armor = 1;
        this.shield = 0;
        this.maxShield = 0;
        this.shieldRegenRate = 0;
        this.lastDamageTime = 0;
        
        // 状态属性
        this.isMoving = false;
        this.isTurning = false;
        this.isReloading = false;
        this.reloadTime = 0;
        this.maxReloadTime = 1;
        
        // 特殊能力
        this.abilities = new Map();
        this.powerUps = new Map();
        this.effects = new Map();
        
        // AI相关（对于AI坦克）
        this.target = null;
        this.aiState = 'idle';
        this.lastTargetScanTime = 0;
        this.targetScanInterval = 0.5;
        this.viewDistance = 200;
        this.attackRange = 150;
        
        // 视觉效果
        this.muzzleFlash = {
            active: false,
            duration: 0.1,
            timer: 0
        };
        
        this.engineSmoke = {
            active: false,
            particles: []
        };
        
        // 音效
        this.sounds = {
            engine: null,
            shoot: null,
            explosion: null,
            reload: null
        };
        
        // 设置标签
        this.addTag('tank');
        this.addTag(team);
        
        // 设置碰撞层
        this.collisionLayer = 2; // 坦克层
        
        // 初始化
        this.initialize();
    }

    /**
     * 初始化坦克
     */
    initialize() {
        this.setupTankType();
        this.setupAbilities();
        this.setupSounds();
    }

    /**
     * 设置坦克类型属性
     */
    setupTankType() {
        // 子类重写
    }

    /**
     * 设置特殊能力
     */
    setupAbilities() {
        // 子类重写
    }

    /**
     * 设置音效
     */
    setupSounds() {
        // 子类重写
    }

    /**
     * 更新坦克
     */
    onUpdate(deltaTime) {
        // 更新护盾
        this.updateShield(deltaTime);
        
        // 更新装填
        this.updateReload(deltaTime);
        
        // 更新特效
        this.updateEffects(deltaTime);
        
        // 更新能力冷却
        this.updateAbilities(deltaTime);
        
        // 更新AI（如果是AI坦克）
        if (this.hasTag('ai')) {
            this.updateAI(deltaTime);
        }
        
        // 更新移动
        this.updateMovement(deltaTime);
    }

    /**
     * 更新护盾
     */
    updateShield(deltaTime) {
        if (this.shield < this.maxShield && this.shieldRegenRate > 0) {
            // 受伤后等待一段时间再恢复护盾
            if (Date.now() - this.lastDamageTime > 3000) {
                this.shield = Math.min(this.shield + this.shieldRegenRate * deltaTime, this.maxShield);
            }
        }
    }

    /**
     * 更新装填
     */
    updateReload(deltaTime) {
        if (this.isReloading) {
            this.reloadTime -= deltaTime;
            if (this.reloadTime <= 0) {
                this.isReloading = false;
                this.reloadTime = 0;
                this.emit('reloadComplete');
            }
        }
    }

    /**
     * 更新特效
     */
    updateEffects(deltaTime) {
        // 更新枪口火焰
        if (this.muzzleFlash.active) {
            this.muzzleFlash.timer -= deltaTime;
            if (this.muzzleFlash.timer <= 0) {
                this.muzzleFlash.active = false;
            }
        }

        // 更新引擎烟雾
        if (this.isMoving && this.engineSmoke.active) {
            // 添加烟雾粒子
            if (Math.random() < 0.3) {
                this.addSmokeParticle();
            }
        }

        // 更新烟雾粒子
        this.updateSmokeParticles(deltaTime);
    }

    /**
     * 更新能力冷却
     */
    updateAbilities(deltaTime) {
        for (const [name, ability] of this.abilities) {
            if (ability.cooldownTimer > 0) {
                ability.cooldownTimer -= deltaTime;
            }
        }
    }

    /**
     * 更新AI逻辑
     */
    updateAI(deltaTime) {
        // 子类重写
    }

    /**
     * 更新移动
     */
    updateMovement(deltaTime) {
        // 如果有移动输入，更新方向和速度
        if (this.isMoving) {
            const targetVelX = Math.cos(this.moveDirection) * this.maxSpeed;
            const targetVelY = Math.sin(this.moveDirection) * this.maxSpeed;
            
            // 平滑加速
            this.velocityX += (targetVelX - this.velocityX) * this.acceleration * deltaTime / this.maxSpeed;
            this.velocityY += (targetVelY - this.velocityY) * this.acceleration * deltaTime / this.maxSpeed;
        }
    }

    /**
     * 移动控制
     */
    move(direction, deltaTime) {
        this.isMoving = true;
        this.moveDirection = direction;
        
        // 播放引擎音效
        if (this.sounds.engine && this.sounds.engine.paused) {
            this.sounds.engine.play();
        }
    }

    /**
     * 停止移动
     */
    stopMoving() {
        this.isMoving = false;
        
        // 停止引擎音效
        if (this.sounds.engine && !this.sounds.engine.paused) {
            this.sounds.engine.pause();
        }
    }

    /**
     * 转向
     */
    turn(direction, deltaTime) {
        this.isTurning = true;
        const angleDiff = direction - this.moveDirection;
        
        // 标准化角度差
        let normalizedDiff = angleDiff;
        while (normalizedDiff > Math.PI) normalizedDiff -= 2 * Math.PI;
        while (normalizedDiff < -Math.PI) normalizedDiff += 2 * Math.PI;
        
        // 平滑转向
        const turnAmount = Math.sign(normalizedDiff) * Math.min(Math.abs(normalizedDiff), this.turnSpeed * deltaTime);
        this.moveDirection += turnAmount;
        this.rotation = this.moveDirection;
    }

    /**
     * 瞄准
     */
    aimAt(targetX, targetY) {
        this.turretDirection = Math.atan2(targetY - this.y, targetX - this.x);
    }

    /**
     * 射击
     */
    shoot() {
        // 检查是否可以射击
        if (!this.canShoot()) {
            return null;
        }

        // 检查弹药
        if (this.ammunition === 0) {
            return null;
        }

        // 消耗弹药
        if (this.ammunition > 0) {
            this.ammunition--;
        }

        // 更新射击时间
        this.lastFireTime = Date.now();

        // 开始装填
        this.startReload();

        // 创建子弹
        const bullet = this.createBullet();

        // 显示枪口火焰
        this.showMuzzleFlash();

        // 播放射击音效
        if (this.sounds.shoot) {
            this.sounds.shoot.currentTime = 0;
            this.sounds.shoot.play();
        }

        // 发射事件
        this.emit('shoot', { bullet });

        return bullet;
    }

    /**
     * 检查是否可以射击
     */
    canShoot() {
        const now = Date.now();
        const timeSinceLastShot = (now - this.lastFireTime) / 1000;
        const minInterval = 1 / this.fireRate;
        
        return !this.isReloading && 
               timeSinceLastShot >= minInterval &&
               this.ammunition !== 0;
    }

    /**
     * 开始装填
     */
    startReload() {
        this.isReloading = true;
        this.reloadTime = this.maxReloadTime;
        
        if (this.sounds.reload) {
            this.sounds.reload.currentTime = 0;
            this.sounds.reload.play();
        }
    }

    /**
     * 创建子弹
     */
    createBullet() {
        // 计算子弹生成位置（炮管前端）
        const barrelLength = this.width / 2 + 5;
        const bulletX = this.x + Math.cos(this.turretDirection) * barrelLength;
        const bulletY = this.y + Math.sin(this.turretDirection) * barrelLength;

        // 创建子弹数据
        const bulletData = {
            x: bulletX,
            y: bulletY,
            direction: this.turretDirection,
            speed: this.bulletSpeed,
            damage: this.bulletDamage,
            owner: this,
            team: this.team,
            weaponType: this.weaponType
        };

        return bulletData;
    }

    /**
     * 显示枪口火焰
     */
    showMuzzleFlash() {
        this.muzzleFlash.active = true;
        this.muzzleFlash.timer = this.muzzleFlash.duration;
    }

    /**
     * 添加烟雾粒子
     */
    addSmokeParticle() {
        const particle = {
            x: this.x - Math.cos(this.moveDirection) * this.width / 2,
            y: this.y - Math.sin(this.moveDirection) * this.height / 2,
            velocityX: (Math.random() - 0.5) * 20,
            velocityY: (Math.random() - 0.5) * 20,
            life: 1.0,
            maxLife: 1.0,
            size: Math.random() * 4 + 2
        };
        
        this.engineSmoke.particles.push(particle);
    }

    /**
     * 更新烟雾粒子
     */
    updateSmokeParticles(deltaTime) {
        for (let i = this.engineSmoke.particles.length - 1; i >= 0; i--) {
            const particle = this.engineSmoke.particles[i];
            
            particle.x += particle.velocityX * deltaTime;
            particle.y += particle.velocityY * deltaTime;
            particle.life -= deltaTime;
            
            if (particle.life <= 0) {
                this.engineSmoke.particles.splice(i, 1);
            }
        }
    }

    /**
     * 受到伤害
     */
    takeDamage(damage, source = null) {
        // 先消耗护盾
        if (this.shield > 0) {
            const shieldDamage = Math.min(damage, this.shield);
            this.shield -= shieldDamage;
            damage -= shieldDamage;
        }

        // 应用护甲减免
        const actualDamage = Math.max(1, damage - this.armor);
        
        this.lastDamageTime = Date.now();
        
        return super.takeDamage(actualDamage, source);
    }

    /**
     * 使用能力
     */
    useAbility(abilityName) {
        const ability = this.abilities.get(abilityName);
        if (!ability) {
            return false;
        }

        // 检查冷却时间
        if (ability.cooldownTimer > 0) {
            return false;
        }

        // 执行能力
        const success = ability.execute(this);
        if (success) {
            ability.cooldownTimer = ability.cooldown;
            this.emit('abilityUsed', { ability: abilityName });
        }

        return success;
    }

    /**
     * 添加道具效果
     */
    addPowerUp(powerUpType, duration, effect) {
        this.powerUps.set(powerUpType, {
            duration: duration,
            effect: effect,
            timer: duration
        });

        effect.apply(this);
        this.emit('powerUpAdded', { type: powerUpType, duration });
    }

    /**
     * 移除道具效果
     */
    removePowerUp(powerUpType) {
        const powerUp = this.powerUps.get(powerUpType);
        if (powerUp) {
            powerUp.effect.remove(this);
            this.powerUps.delete(powerUpType);
            this.emit('powerUpRemoved', { type: powerUpType });
        }
    }

    /**
     * 升级坦克
     */
    upgrade() {
        this.level++;
        
        // 提升基础属性
        this.maxHealth += 25;
        this.health = this.maxHealth;
        this.armor++;
        this.fireRate += 0.2;
        this.bulletDamage += 5;
        
        this.emit('upgrade', { level: this.level });
    }

    /**
     * 渲染坦克
     */
    onRender(context) {
        // 渲染坦克主体
        this.renderTankBody(context);
        
        // 渲染炮塔
        this.renderTurret(context);
        
        // 渲染特效
        this.renderEffects(context);
        
        // 渲染UI元素
        this.renderUI(context);
    }

    /**
     * 渲染坦克主体
     */
    renderTankBody(context) {
        context.save();
        
        // 设置颜色
        context.fillStyle = this.getTeamColor();
        
        // 绘制主体
        context.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // 绘制履带
        context.fillStyle = '#333333';
        context.fillRect(-this.width / 2, -this.height / 2 + 2, this.width, 4);
        context.fillRect(-this.width / 2, this.height / 2 - 6, this.width, 4);
        
        context.restore();
    }

    /**
     * 渲染炮塔
     */
    renderTurret(context) {
        context.save();
        
        // 旋转到炮塔方向
        context.rotate(this.turretDirection - this.rotation);
        
        // 绘制炮塔
        context.fillStyle = this.getTeamColor();
        context.fillRect(-8, -8, 16, 16);
        
        // 绘制炮管
        context.fillStyle = '#666666';
        context.fillRect(8, -2, 12, 4);
        
        // 渲染枪口火焰
        if (this.muzzleFlash.active) {
            context.fillStyle = '#ffff00';
            context.fillRect(18, -3, 8, 6);
            context.fillStyle = '#ff8800';
            context.fillRect(20, -2, 6, 4);
        }
        
        context.restore();
    }

    /**
     * 渲染特效
     */
    renderEffects(context) {
        // 渲染烟雾粒子
        for (const particle of this.engineSmoke.particles) {
            const alpha = particle.life / particle.maxLife;
            context.save();
            context.globalAlpha = alpha * 0.5;
            context.fillStyle = '#666666';
            context.fillRect(
                particle.x - this.x - particle.size / 2,
                particle.y - this.y - particle.size / 2,
                particle.size,
                particle.size
            );
            context.restore();
        }
    }

    /**
     * 渲染UI元素
     */
    renderUI(context) {
        // 渲染护盾条
        if (this.maxShield > 0) {
            const barWidth = this.width;
            const barHeight = 3;
            const shieldRatio = this.shield / this.maxShield;

            context.fillStyle = '#0088ff';
            context.fillRect(-barWidth / 2, -this.height / 2 - 12, barWidth * shieldRatio, barHeight);
        }

        // 渲染等级
        if (this.level > 1) {
            context.fillStyle = '#ffff00';
            context.font = '10px Arial';
            context.textAlign = 'center';
            context.fillText(this.level.toString(), 0, -this.height / 2 - 15);
        }
    }

    /**
     * 获取队伍颜色
     */
    getTeamColor() {
        switch (this.team) {
            case 'player': return '#00ff00';
            case 'enemy': return '#ff0000';
            case 'ally': return '#0088ff';
            default: return '#888888';
        }
    }

    /**
     * 获取坦克状态
     */
    getStatus() {
        return {
            ...this.getInfo(),
            team: this.team,
            tankType: this.tankType,
            level: this.level,
            ammunition: this.ammunition,
            maxAmmunition: this.maxAmmunition,
            shield: this.shield,
            maxShield: this.maxShield,
            armor: this.armor,
            isMoving: this.isMoving,
            isReloading: this.isReloading,
            abilities: Array.from(this.abilities.keys()),
            powerUps: Array.from(this.powerUps.keys())
        };
    }

    /**
     * 销毁坦克
     */
    onDestroy() {
        // 停止所有音效
        for (const sound of Object.values(this.sounds)) {
            if (sound) {
                sound.pause();
                sound.currentTime = 0;
            }
        }

        // 清理粒子
        this.engineSmoke.particles = [];

        // 发送销毁事件
        this.emit('tankDestroyed', { team: this.team, type: this.tankType });
    }
}




