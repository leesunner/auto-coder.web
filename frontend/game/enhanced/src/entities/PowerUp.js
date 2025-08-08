






import { GameObject } from './GameObject.js';

/**
 * 道具基类
 * 所有道具的基础类
 */
export class PowerUp extends GameObject {
    constructor(x, y, powerUpType = 'health') {
        super(x, y, 20, 20);
        
        // 道具属性
        this.powerUpType = powerUpType;
        this.value = 0; // 道具的数值效果
        this.duration = 0; // 持续时间（0表示永久）
        
        // 生命周期
        this.lifeTime = 30; // 30秒后消失
        this.blinkTime = 25; // 25秒后开始闪烁
        this.isBlinking = false;
        this.blinkTimer = 0;
        this.blinkInterval = 0.3;
        
        // 动画属性
        this.animationTimer = 0;
        this.floatAmplitude = 3;
        this.floatSpeed = 2;
        this.rotationSpeed = 1;
        this.rotation = 0;
        this.baseY = y;
        
        // 磁力效果
        this.magnetRange = 50;
        this.magnetStrength = 100;
        this.isMagnetic = false;
        
        // 视觉效果
        this.glowEffect = {
            active: true,
            intensity: 1,
            pulseSpeed: 3,
            color: '#ffffff'
        };
        
        this.sparkles = [];
        this.maxSparkles = 5;
        
        // 音效
        this.sounds = {
            spawn: null,
            collect: null,
            warning: null // 即将消失警告
        };
        
        // 收集状态
        this.isCollected = false;
        this.collectAnimation = {
            active: false,
            timer: 0,
            duration: 0.3,
            targetX: 0,
            targetY: 0
        };
        
        // 设置属性
        this.isSolid = false; // 道具不阻挡移动
        this.collisionLayer = 4; // 道具层
        
        // 设置标签
        this.addTag('powerup');
        this.addTag('collectible');
        
        // 初始化
        this.initialize();
    }

    /**
     * 初始化道具
     */
    initialize() {
        this.setupPowerUpType();
        this.createSparkles();
        this.playSpawnSound();
    }

    /**
     * 设置道具类型属性
     */
    setupPowerUpType() {
        switch (this.powerUpType) {
            case 'health':
                this.setupHealthPowerUp();
                break;
            case 'shield':
                this.setupShieldPowerUp();
                break;
            case 'ammo':
                this.setupAmmoPowerUp();
                break;
            case 'speed':
                this.setupSpeedPowerUp();
                break;
            case 'damage':
                this.setupDamagePowerUp();
                break;
            case 'rapid_fire':
                this.setupRapidFirePowerUp();
                break;
            case 'armor':
                this.setupArmorPowerUp();
                break;
            case 'extra_life':
                this.setupExtraLifePowerUp();
                break;
            case 'energy':
                this.setupEnergyPowerUp();
                break;
            case 'weapon_upgrade':
                this.setupWeaponUpgradePowerUp();
                break;
        }
    }

    /**
     * 设置生命值道具
     */
    setupHealthPowerUp() {
        this.value = 50;
        this.glowEffect.color = '#00ff00';
        this.description = '恢复生命值';
    }

    /**
     * 设置护盾道具
     */
    setupShieldPowerUp() {
        this.value = 100;
        this.glowEffect.color = '#00aaff';
        this.description = '恢复护盾';
    }

    /**
     * 设置弹药道具
     */
    setupAmmoPowerUp() {
        this.value = 50;
        this.glowEffect.color = '#ffaa00';
        this.description = '补充弹药';
    }

    /**
     * 设置速度道具
     */
    setupSpeedPowerUp() {
        this.value = 1.5; // 速度倍数
        this.duration = 10;
        this.glowEffect.color = '#ffff00';
        this.description = '提升移动速度';
        this.isMagnetic = true;
    }

    /**
     * 设置伤害道具
     */
    setupDamagePowerUp() {
        this.value = 1.5; // 伤害倍数
        this.duration = 15;
        this.glowEffect.color = '#ff4400';
        this.description = '提升攻击力';
    }

    /**
     * 设置快速射击道具
     */
    setupRapidFirePowerUp() {
        this.value = 2; // 射击速度倍数
        this.duration = 12;
        this.glowEffect.color = '#ff00ff';
        this.description = '提升射击速度';
    }

    /**
     * 设置护甲道具
     */
    setupArmorPowerUp() {
        this.value = 3; // 护甲值
        this.duration = 20;
        this.glowEffect.color = '#888888';
        this.description = '增加护甲';
    }

    /**
     * 设置额外生命道具
     */
    setupExtraLifePowerUp() {
        this.value = 1;
        this.glowEffect.color = '#ff0088';
        this.description = '额外生命';
        this.lifeTime = 60; // 更长的存在时间
    }

    /**
     * 设置能量道具
     */
    setupEnergyPowerUp() {
        this.value = 100;
        this.glowEffect.color = '#00ffff';
        this.description = '恢复能量';
    }

    /**
     * 设置武器升级道具
     */
    setupWeaponUpgradePowerUp() {
        this.value = 1;
        this.glowEffect.color = '#8800ff';
        this.description = '武器升级';
        this.lifeTime = 45;
    }

    /**
     * 创建闪烁粒子
     */
    createSparkles() {
        for (let i = 0; i < this.maxSparkles; i++) {
            this.sparkles.push({
                x: (Math.random() - 0.5) * this.width,
                y: (Math.random() - 0.5) * this.height,
                life: Math.random() * 2,
                maxLife: 2,
                size: 1 + Math.random() * 2,
                alpha: 1
            });
        }
    }

    /**
     * 播放生成音效
     */
    playSpawnSound() {
        if (this.sounds.spawn) {
            this.sounds.spawn.currentTime = 0;
            this.sounds.spawn.play();
        }
    }

    /**
     * 更新道具
     */
    onUpdate(deltaTime) {
        // 更新生命周期
        this.lifeTime -= deltaTime;
        
        // 检查是否开始闪烁
        if (this.lifeTime <= this.blinkTime && !this.isBlinking) {
            this.isBlinking = true;
            this.playWarningSound();
        }
        
        // 更新闪烁
        if (this.isBlinking) {
            this.updateBlinking(deltaTime);
        }
        
        // 更新动画
        this.updateAnimation(deltaTime);
        
        // 更新磁力效果
        if (this.isMagnetic) {
            this.updateMagnetism(deltaTime);
        }
        
        // 更新视觉效果
        this.updateVisualEffects(deltaTime);
        
        // 更新收集动画
        if (this.collectAnimation.active) {
            this.updateCollectAnimation(deltaTime);
        }
        
        // 检查是否过期
        if (this.lifeTime <= 0) {
            this.destroy();
        }
    }

    /**
     * 更新闪烁效果
     */
    updateBlinking(deltaTime) {
        this.blinkTimer += deltaTime;
        
        if (this.blinkTimer >= this.blinkInterval) {
            this.blinkTimer = 0;
            this.isVisible = !this.isVisible;
        }
    }

    /**
     * 更新动画
     */
    updateAnimation(deltaTime) {
        this.animationTimer += deltaTime;
        
        // 浮动效果
        this.y = this.baseY + Math.sin(this.animationTimer * this.floatSpeed) * this.floatAmplitude;
        
        // 旋转效果
        this.rotation += this.rotationSpeed * deltaTime;
        if (this.rotation >= Math.PI * 2) {
            this.rotation -= Math.PI * 2;
        }
    }

    /**
     * 更新磁力效果
     */
    updateMagnetism(deltaTime) {
        // 请求附近的玩家
        this.emit('requestNearbyPlayers', {
            position: { x: this.x, y: this.y },
            range: this.magnetRange
        });
    }

    /**
     * 应用磁力效果
     */
    applyMagnetism(players) {
        for (const player of players) {
            const distance = this.getDistanceTo(player);
            
            if (distance <= this.magnetRange && distance > 5) {
                const pullStrength = this.magnetStrength * (1 - distance / this.magnetRange);
                const angle = this.getAngleTo(player);
                
                const pullX = Math.cos(angle) * pullStrength * 0.016; // 假设60fps
                const pullY = Math.sin(angle) * pullStrength * 0.016;
                
                this.x += pullX;
                this.y += pullY;
            }
        }
    }

    /**
     * 更新视觉效果
     */
    updateVisualEffects(deltaTime) {
        // 更新光晕效果
        this.glowEffect.intensity = 0.8 + 0.2 * Math.sin(this.animationTimer * this.glowEffect.pulseSpeed);
        
        // 更新闪烁粒子
        for (let i = this.sparkles.length - 1; i >= 0; i--) {
            const sparkle = this.sparkles[i];
            sparkle.life -= deltaTime;
            sparkle.alpha = sparkle.life / sparkle.maxLife;
            
            if (sparkle.life <= 0) {
                // 重新生成粒子
                sparkle.x = (Math.random() - 0.5) * this.width;
                sparkle.y = (Math.random() - 0.5) * this.height;
                sparkle.life = sparkle.maxLife;
                sparkle.alpha = 1;
            }
        }
    }

    /**
     * 更新收集动画
     */
    updateCollectAnimation(deltaTime) {
        this.collectAnimation.timer += deltaTime;
        const progress = this.collectAnimation.timer / this.collectAnimation.duration;
        
        if (progress >= 1) {
            this.destroy();
            return;
        }
        
        // 移动到目标位置
        const easedProgress = this.easeInOut(progress);
        this.x = this.x + (this.collectAnimation.targetX - this.x) * easedProgress * deltaTime * 5;
        this.y = this.y + (this.collectAnimation.targetY - this.y) * easedProgress * deltaTime * 5;
        
        // 缩放效果
        const scale = 1 - easedProgress;
        this.width = 20 * scale;
        this.height = 20 * scale;
        
        // 透明度
        this.alpha = 1 - easedProgress;
    }

    /**
     * 碰撞检测
     */
    onCollision(other) {
        // 只与玩家碰撞
        if (other.hasTag && other.hasTag('player') && !this.isCollected) {
            this.collect(other);
            return true;
        }
        
        return false;
    }

    /**
     * 被收集
     */
    collect(collector) {
        if (this.isCollected) return;
        
        this.isCollected = true;
        
        // 应用道具效果
        this.applyEffect(collector);
        
        // 播放收集音效
        this.playCollectSound();
        
        // 开始收集动画
        this.startCollectAnimation(collector);
        
        // 发送收集事件
        this.emit('collected', { 
            collector: collector,
            powerUpType: this.powerUpType,
            value: this.value,
            duration: this.duration
        });
    }

    /**
     * 应用道具效果
     */
    applyEffect(target) {
        switch (this.powerUpType) {
            case 'health':
                if (target.heal) {
                    target.heal(this.value);
                }
                break;
                
            case 'shield':
                if (target.shield !== undefined) {
                    target.shield = Math.min(target.maxShield, target.shield + this.value);
                }
                break;
                
            case 'ammo':
                if (target.ammo !== undefined) {
                    target.ammo = Math.min(target.maxAmmo, target.ammo + this.value);
                }
                break;
                
            case 'extra_life':
                if (target.lives !== undefined) {
                    target.lives += this.value;
                }
                break;
                
            case 'energy':
                if (target.energy !== undefined) {
                    target.energy = Math.min(target.maxEnergy, target.energy + this.value);
                }
                break;
                
            case 'weapon_upgrade':
                if (target.switchWeapon) {
                    target.switchWeapon();
                }
                break;
                
            default:
                // 临时效果道具
                if (target.addPowerUp) {
                    target.addPowerUp(this.powerUpType, this.duration, {
                        apply: (tank) => this.applyTemporaryEffect(tank),
                        remove: (tank) => this.removeTemporaryEffect(tank)
                    });
                }
                break;
        }
    }

    /**
     * 应用临时效果
     */
    applyTemporaryEffect(target) {
        switch (this.powerUpType) {
            case 'speed':
                target.maxSpeed *= this.value;
                break;
            case 'damage':
                target.bulletDamage *= this.value;
                break;
            case 'rapid_fire':
                target.fireRate *= this.value;
                break;
            case 'armor':
                target.armor += this.value;
                break;
        }
    }

    /**
     * 移除临时效果
     */
    removeTemporaryEffect(target) {
        switch (this.powerUpType) {
            case 'speed':
                target.maxSpeed /= this.value;
                break;
            case 'damage':
                target.bulletDamage /= this.value;
                break;
            case 'rapid_fire':
                target.fireRate /= this.value;
                break;
            case 'armor':
                target.armor -= this.value;
                break;
        }
    }

    /**
     * 开始收集动画
     */
    startCollectAnimation(collector) {
        this.collectAnimation.active = true;
        this.collectAnimation.timer = 0;
        this.collectAnimation.targetX = collector.x;
        this.collectAnimation.targetY = collector.y - 20;
    }

    /**
     * 播放收集音效
     */
    playCollectSound() {
        if (this.sounds.collect) {
            this.sounds.collect.currentTime = 0;
            this.sounds.collect.play();
        }
    }

    /**
     * 播放警告音效
     */
    playWarningSound() {
        if (this.sounds.warning) {
            this.sounds.warning.currentTime = 0;
            this.sounds.warning.play();
        }
    }

    /**
     * 渲染道具
     */
    onRender(context) {
        if (!this.isVisible) return;
        
        context.save();
        
        // 应用透明度
        if (this.alpha !== undefined) {
            context.globalAlpha = this.alpha;
        }
        
        // 应用旋转
        context.rotate(this.rotation);
        
        // 渲染光晕效果
        if (this.glowEffect.active) {
            this.renderGlow(context);
        }
        
        // 渲染道具主体
        this.renderPowerUpBody(context);
        
        // 渲染闪烁粒子
        this.renderSparkles(context);
        
        // 渲染道具图标
        this.renderIcon(context);
        
        context.restore();
    }

    /**
     * 渲染光晕效果
     */
    renderGlow(context) {
        context.save();
        
        const glowRadius = this.width * 1.5;
        const gradient = context.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
        gradient.addColorStop(0, this.glowEffect.color + '80'); // 50% 透明度
        gradient.addColorStop(1, 'transparent');
        
        context.fillStyle = gradient;
        context.globalAlpha = this.glowEffect.intensity * 0.5;
        context.fillRect(-glowRadius, -glowRadius, glowRadius * 2, glowRadius * 2);
        
        context.restore();
    }

    /**
     * 渲染道具主体
     */
    renderPowerUpBody(context) {
        context.save();
        
        // 主体颜色
        context.fillStyle = this.glowEffect.color;
        context.strokeStyle = '#ffffff';
        context.lineWidth = 2;
        
        // 绘制圆形主体
        context.beginPath();
        context.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        
        context.restore();
    }

    /**
     * 渲染闪烁粒子
     */
    renderSparkles(context) {
        for (const sparkle of this.sparkles) {
            context.save();
            context.globalAlpha = sparkle.alpha;
            context.fillStyle = '#ffffff';
            
            context.beginPath();
            context.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
            context.fill();
            
            context.restore();
        }
    }

    /**
     * 渲染道具图标
     */
    renderIcon(context) {
        context.save();
        context.fillStyle = '#ffffff';
        context.strokeStyle = '#000000';
        context.lineWidth = 1;
        context.font = '12px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // 根据道具类型绘制不同的图标
        switch (this.powerUpType) {
            case 'health':
                this.drawHealthIcon(context);
                break;
            case 'shield':
                this.drawShieldIcon(context);
                break;
            case 'ammo':
                this.drawAmmoIcon(context);
                break;
            case 'speed':
                this.drawSpeedIcon(context);
                break;
            case 'damage':
                this.drawDamageIcon(context);
                break;
            case 'rapid_fire':
                this.drawRapidFireIcon(context);
                break;
            case 'armor':
                this.drawArmorIcon(context);
                break;
            case 'extra_life':
                this.drawExtraLifeIcon(context);
                break;
            case 'energy':
                this.drawEnergyIcon(context);
                break;
            case 'weapon_upgrade':
                this.drawWeaponUpgradeIcon(context);
                break;
            default:
                context.fillText('?', 0, 0);
                break;
        }
        
        context.restore();
    }

    /**
     * 绘制生命值图标
     */
    drawHealthIcon(context) {
        // 绘制十字
        context.fillRect(-1, -6, 2, 12);
        context.fillRect(-6, -1, 12, 2);
    }

    /**
     * 绘制护盾图标
     */
    drawShieldIcon(context) {
        context.beginPath();
        context.moveTo(0, -8);
        context.lineTo(-6, -2);
        context.lineTo(-6, 4);
        context.lineTo(0, 8);
        context.lineTo(6, 4);
        context.lineTo(6, -2);
        context.closePath();
        context.stroke();
    }

    /**
     * 绘制弹药图标
     */
    drawAmmoIcon(context) {
        context.fillRect(-2, -6, 4, 12);
        context.fillRect(-4, -8, 8, 4);
    }

    /**
     * 绘制速度图标
     */
    drawSpeedIcon(context) {
        context.beginPath();
        context.moveTo(-6, -4);
        context.lineTo(6, 0);
        context.lineTo(-6, 4);
        context.closePath();
        context.fill();
    }

    /**
     * 绘制伤害图标
     */
    drawDamageIcon(context) {
        context.fillText('!', 0, 0);
    }

    /**
     * 绘制快速射击图标
     */
    drawRapidFireIcon(context) {
        for (let i = 0; i < 3; i++) {
            context.fillRect(-6 + i * 4, -2, 2, 4);
        }
    }

    /**
     * 绘制护甲图标
     */
    drawArmorIcon(context) {
        context.strokeRect(-6, -6, 12, 12);
        context.strokeRect(-4, -4, 8, 8);
    }

    /**
     * 绘制额外生命图标
     */
    drawExtraLifeIcon(context) {
        // 绘制心形
        context.beginPath();
        context.arc(-3, -2, 3, 0, Math.PI, true);
        context.arc(3, -2, 3, 0, Math.PI, true);
        context.lineTo(0, 6);
        context.closePath();
        context.fill();
    }

    /**
     * 绘制能量图标
     */
    drawEnergyIcon(context) {
        // 绘制闪电
        context.beginPath();
        context.moveTo(-2, -6);
        context.lineTo(4, -2);
        context.lineTo(0, 0);
        context.lineTo(2, 6);
        context.lineTo(-4, 2);
        context.lineTo(0, 0);
        context.closePath();
        context.fill();
    }

    /**
     * 绘制武器升级图标
     */
    drawWeaponUpgradeIcon(context) {
        context.fillText('W', 0, 0);
    }

    /**
     * 缓动函数
     */
    easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    /**
     * 销毁道具
     */
    onDestroy() {
        // 清理粒子
        this.sparkles = [];
        
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
 * 道具工厂类
 */
export class PowerUpFactory {
    /**
     * 创建随机道具
     */
    static createRandom(x, y) {
        const types = [
            'health', 'shield', 'ammo', 'speed', 'damage', 
            'rapid_fire', 'armor', 'energy'
        ];
        
        // 稀有道具有更低的概率
        const rareTypes = ['extra_life', 'weapon_upgrade'];
        
        let selectedType;
        if (Math.random() < 0.1) { // 10% 概率获得稀有道具
            selectedType = rareTypes[Math.floor(Math.random() * rareTypes.length)];
        } else {
            selectedType = types[Math.floor(Math.random() * types.length)];
        }
        
        return new PowerUp(x, y, selectedType);
    }

    /**
     * 创建特定类型的道具
     */
    static create(x, y, type) {
        return new PowerUp(x, y, type);
    }

    /**
     * 根据玩家状态创建合适的道具
     */
    static createSuitable(x, y, player) {
        const healthRatio = player.health / player.maxHealth;
        const shieldRatio = player.shield / player.maxShield;
        
        // 根据玩家状态选择道具
        if (healthRatio < 0.3) {
            return new PowerUp(x, y, 'health');
        } else if (shieldRatio < 0.5) {
            return new PowerUp(x, y, 'shield');
        } else {
            return PowerUpFactory.createRandom(x, y);
        }
    }
}







