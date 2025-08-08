



import { Tank } from './Tank.js';

/**
 * 玩家坦克类
 * 玩家控制的坦克，具有特殊能力和升级系统
 */
export class PlayerTank extends Tank {
    constructor(x, y) {
        super(x, y, 'player');
        
        // 玩家特有属性
        this.lives = 3;
        this.score = 0;
        this.experience = 0;
        this.experienceToNextLevel = 100;
        
        // 增强属性
        this.maxSpeed = 100;
        this.acceleration = 250;
        this.fireRate = 2;
        this.bulletDamage = 30;
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.armor = 2;
        
        // 护盾系统
        this.maxShield = 50;
        this.shield = 0;
        this.shieldRegenRate = 10;
        
        // 特殊武器系统
        this.weaponTypes = ['basic', 'rapid', 'heavy', 'spread'];
        this.currentWeaponIndex = 0;
        this.weaponType = this.weaponTypes[0];
        
        // 能力系统
        this.skillPoints = 0;
        this.skills = new Map();
        
        // 控制状态
        this.inputState = {
            moveUp: false,
            moveDown: false,
            moveLeft: false,
            moveRight: false,
            shoot: false,
            useAbility1: false,
            useAbility2: false,
            useAbility3: false
        };
        
        // 无敌时间（复活后）
        this.invulnerabilityTime = 0;
        this.maxInvulnerabilityTime = 3;
        
        // 视觉效果
        this.levelUpEffect = {
            active: false,
            timer: 0,
            duration: 1
        };
        
        this.damageEffect = {
            active: false,
            timer: 0,
            duration: 0.3
        };
        
        // 统计数据
        this.stats = {
            shotsFired: 0,
            shotsHit: 0,
            enemiesKilled: 0,
            damageDealt: 0,
            damageTaken: 0,
            distanceTraveled: 0,
            timeAlive: 0,
            powerUpsCollected: 0
        };
        
        // 设置标签
        this.addTag('player');
        
        // 初始化
        this.initialize();
    }

    /**
     * 设置坦克类型属性
     */
    setupTankType() {
        this.tankType = 'player';
    }

    /**
     * 设置特殊能力
     */
    setupAbilities() {
        // 冲刺能力
        this.abilities.set('dash', {
            name: '冲刺',
            description: '快速向前冲刺，无视障碍物',
            cooldown: 5,
            cooldownTimer: 0,
            execute: (tank) => this.executeDash()
        });

        // 护盾强化
        this.abilities.set('shield_boost', {
            name: '护盾强化',
            description: '立即恢复护盾并暂时增强护盾容量',
            cooldown: 15,
            cooldownTimer: 0,
            execute: (tank) => this.executeShieldBoost()
        });

        // 时间减缓
        this.abilities.set('slow_time', {
            name: '时间减缓',
            description: '减缓敌人的移动和射击速度',
            cooldown: 20,
            cooldownTimer: 0,
            execute: (tank) => this.executeSlowTime()
        });
    }

    /**
     * 更新玩家坦克
     */
    onUpdate(deltaTime) {
        super.onUpdate(deltaTime);
        
        // 更新无敌时间
        this.updateInvulnerability(deltaTime);
        
        // 更新视觉效果
        this.updateVisualEffects(deltaTime);
        
        // 更新统计数据
        this.updateStats(deltaTime);
        
        // 处理输入
        this.handleInput(deltaTime);
        
        // 检查升级
        this.checkLevelUp();
    }

    /**
     * 更新无敌时间
     */
    updateInvulnerability(deltaTime) {
        if (this.invulnerabilityTime > 0) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerabilityTime = 0;
                this.emit('invulnerabilityEnd');
            }
        }
    }

    /**
     * 更新视觉效果
     */
    updateVisualEffects(deltaTime) {
        // 升级特效
        if (this.levelUpEffect.active) {
            this.levelUpEffect.timer -= deltaTime;
            if (this.levelUpEffect.timer <= 0) {
                this.levelUpEffect.active = false;
            }
        }

        // 受伤特效
        if (this.damageEffect.active) {
            this.damageEffect.timer -= deltaTime;
            if (this.damageEffect.timer <= 0) {
                this.damageEffect.active = false;
            }
        }
    }

    /**
     * 更新统计数据
     */
    updateStats(deltaTime) {
        this.stats.timeAlive += deltaTime;
        
        if (this.isMoving) {
            const distance = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY) * deltaTime;
            this.stats.distanceTraveled += distance;
        }
    }

    /**
     * 处理输入
     */
    handleInput(deltaTime) {
        // 移动处理
        let moveX = 0;
        let moveY = 0;
        
        if (this.inputState.moveUp) moveY -= 1;
        if (this.inputState.moveDown) moveY += 1;
        if (this.inputState.moveLeft) moveX -= 1;
        if (this.inputState.moveRight) moveX += 1;
        
        // 归一化移动向量
        if (moveX !== 0 || moveY !== 0) {
            const length = Math.sqrt(moveX * moveX + moveY * moveY);
            moveX /= length;
            moveY /= length;
            
            const direction = Math.atan2(moveY, moveX);
            this.move(direction, deltaTime);
            
            // 自动瞄准移动方向
            this.turretDirection = direction;
        } else {
            this.stopMoving();
        }
        
        // 射击处理
        if (this.inputState.shoot) {
            const bullet = this.shoot();
            if (bullet) {
                this.stats.shotsFired++;
                this.emit('bulletCreated', bullet);
            }
        }
        
        // 能力使用
        if (this.inputState.useAbility1) {
            this.useAbility('dash');
            this.inputState.useAbility1 = false; // 防止连续触发
        }
        
        if (this.inputState.useAbility2) {
            this.useAbility('shield_boost');
            this.inputState.useAbility2 = false;
        }
        
        if (this.inputState.useAbility3) {
            this.useAbility('slow_time');
            this.inputState.useAbility3 = false;
        }
    }

    /**
     * 设置输入状态
     */
    setInputState(inputState) {
        this.inputState = { ...this.inputState, ...inputState };
    }

    /**
     * 瞄准鼠标位置
     */
    aimAtMouse(mouseX, mouseY) {
        this.turretDirection = Math.atan2(mouseY - this.y, mouseX - this.x);
    }

    /**
     * 切换武器
     */
    switchWeapon() {
        this.currentWeaponIndex = (this.currentWeaponIndex + 1) % this.weaponTypes.length;
        this.weaponType = this.weaponTypes[this.currentWeaponIndex];
        
        // 更新武器属性
        this.updateWeaponStats();
        
        this.emit('weaponSwitched', { weaponType: this.weaponType });
    }

    /**
     * 更新武器属性
     */
    updateWeaponStats() {
        switch (this.weaponType) {
            case 'basic':
                this.fireRate = 2;
                this.bulletDamage = 30;
                this.bulletSpeed = 300;
                break;
            case 'rapid':
                this.fireRate = 5;
                this.bulletDamage = 15;
                this.bulletSpeed = 350;
                break;
            case 'heavy':
                this.fireRate = 0.8;
                this.bulletDamage = 60;
                this.bulletSpeed = 250;
                break;
            case 'spread':
                this.fireRate = 1.5;
                this.bulletDamage = 20;
                this.bulletSpeed = 280;
                break;
        }
    }

    /**
     * 创建子弹（重写以支持特殊武器）
     */
    createBullet() {
        const bullets = [];
        
        switch (this.weaponType) {
            case 'spread':
                // 散弹枪效果
                for (let i = -1; i <= 1; i++) {
                    const angle = this.turretDirection + (i * Math.PI / 12);
                    bullets.push(this.createSingleBullet(angle));
                }
                break;
            default:
                bullets.push(this.createSingleBullet(this.turretDirection));
                break;
        }
        
        return bullets.length === 1 ? bullets[0] : bullets;
    }

    /**
     * 创建单个子弹
     */
    createSingleBullet(direction) {
        const barrelLength = this.width / 2 + 5;
        const bulletX = this.x + Math.cos(direction) * barrelLength;
        const bulletY = this.y + Math.sin(direction) * barrelLength;

        return {
            x: bulletX,
            y: bulletY,
            direction: direction,
            speed: this.bulletSpeed,
            damage: this.bulletDamage,
            owner: this,
            team: this.team,
            weaponType: this.weaponType
        };
    }

    /**
     * 执行冲刺能力
     */
    executeDash() {
        const dashDistance = 100;
        const dashX = Math.cos(this.moveDirection) * dashDistance;
        const dashY = Math.sin(this.moveDirection) * dashDistance;
        
        // 设置冲刺速度
        this.velocityX = dashX * 5;
        this.velocityY = dashY * 5;
        
        // 短暂无敌
        this.invulnerabilityTime = 0.5;
        
        this.emit('dashExecuted');
        return true;
    }

    /**
     * 执行护盾强化能力
     */
    executeShieldBoost() {
        this.shield = this.maxShield;
        
        // 临时增强护盾容量
        const originalMaxShield = this.maxShield;
        this.maxShield *= 1.5;
        this.shield = this.maxShield;
        
        // 5秒后恢复
        setTimeout(() => {
            this.maxShield = originalMaxShield;
            if (this.shield > this.maxShield) {
                this.shield = this.maxShield;
            }
        }, 5000);
        
        this.emit('shieldBoostExecuted');
        return true;
    }

    /**
     * 执行时间减缓能力
     */
    executeSlowTime() {
        // 通过事件通知游戏引擎应用时间减缓效果
        this.emit('slowTimeExecuted', { duration: 3, factor: 0.5 });
        return true;
    }

    /**
     * 获得经验值
     */
    gainExperience(amount) {
        this.experience += amount;
        this.emit('experienceGained', { amount, total: this.experience });
    }

    /**
     * 检查升级
     */
    checkLevelUp() {
        if (this.experience >= this.experienceToNextLevel) {
            this.levelUp();
        }
    }

    /**
     * 升级
     */
    levelUp() {
        this.experience -= this.experienceToNextLevel;
        this.level++;
        this.skillPoints++;
        
        // 提升属性
        this.maxHealth += 20;
        this.health = this.maxHealth;
        this.maxShield += 10;
        this.armor++;
        this.fireRate += 0.1;
        this.bulletDamage += 3;
        
        // 增加下次升级所需经验
        this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.2);
        
        // 播放升级特效
        this.levelUpEffect.active = true;
        this.levelUpEffect.timer = this.levelUpEffect.duration;
        
        this.emit('levelUp', { level: this.level, skillPoints: this.skillPoints });
    }

    /**
     * 学习技能
     */
    learnSkill(skillName) {
        if (this.skillPoints <= 0) {
            return false;
        }

        const skill = this.getAvailableSkills().find(s => s.name === skillName);
        if (!skill) {
            return false;
        }

        this.skillPoints--;
        this.skills.set(skillName, skill);
        skill.apply(this);
        
        this.emit('skillLearned', { skill: skillName, remainingPoints: this.skillPoints });
        return true;
    }

    /**
     * 获取可用技能
     */
    getAvailableSkills() {
        return [
            {
                name: 'speed_boost',
                description: '增加移动速度',
                apply: (tank) => { tank.maxSpeed += 20; }
            },
            {
                name: 'armor_upgrade',
                description: '增加护甲值',
                apply: (tank) => { tank.armor += 1; }
            },
            {
                name: 'rapid_fire',
                description: '增加射击速度',
                apply: (tank) => { tank.fireRate += 0.5; }
            },
            {
                name: 'health_boost',
                description: '增加最大生命值',
                apply: (tank) => { tank.maxHealth += 30; tank.health = tank.maxHealth; }
            },
            {
                name: 'shield_capacity',
                description: '增加护盾容量',
                apply: (tank) => { tank.maxShield += 20; }
            }
        ];
    }

    /**
     * 受到伤害（重写以处理无敌时间）
     */
    takeDamage(damage, source = null) {
        if (this.invulnerabilityTime > 0) {
            return false;
        }

        this.stats.damageTaken += damage;
        
        // 播放受伤特效
        this.damageEffect.active = true;
        this.damageEffect.timer = this.damageEffect.duration;
        
        const result = super.takeDamage(damage, source);
        
        if (result) {
            // 坦克被摧毁
            this.onPlayerDeath();
        }
        
        return result;
    }

    /**
     * 玩家死亡处理
     */
    onPlayerDeath() {
        this.lives--;
        
        if (this.lives > 0) {
            // 还有生命，准备重生
            this.emit('playerDied', { lives: this.lives });
        } else {
            // 游戏结束
            this.emit('gameOver', { 
                finalScore: this.score,
                stats: this.stats,
                level: this.level
            });
        }
    }

    /**
     * 重生
     */
    respawn(x, y) {
        this.x = x;
        this.y = y;
        this.health = this.maxHealth;
        this.shield = this.maxShield;
        this.isDestroyed = false;
        this.isActive = true;
        this.invulnerabilityTime = this.maxInvulnerabilityTime;
        
        // 重置速度
        this.velocityX = 0;
        this.velocityY = 0;
        
        this.emit('playerRespawned');
    }

    /**
     * 收集道具
     */
    collectPowerUp(powerUpType) {
        this.stats.powerUpsCollected++;
        
        switch (powerUpType) {
            case 'health':
                this.heal(50);
                break;
            case 'shield':
                this.shield = this.maxShield;
                break;
            case 'weapon_upgrade':
                this.switchWeapon();
                break;
            case 'speed_boost':
                this.addPowerUp('speed', 10, {
                    apply: (tank) => { tank.maxSpeed *= 1.5; },
                    remove: (tank) => { tank.maxSpeed /= 1.5; }
                });
                break;
            case 'rapid_fire':
                this.addPowerUp('rapidFire', 8, {
                    apply: (tank) => { tank.fireRate *= 2; },
                    remove: (tank) => { tank.fireRate /= 2; }
                });
                break;
            case 'extra_life':
                this.lives++;
                break;
        }
        
        this.emit('powerUpCollected', { type: powerUpType });
    }

    /**
     * 击杀敌人
     */
    onEnemyKilled(enemy) {
        this.stats.enemiesKilled++;
        
        // 根据敌人类型给予不同奖励
        let scoreReward = 100;
        let expReward = 25;
        
        switch (enemy.tankType) {
            case 'basic':
                scoreReward = 100;
                expReward = 25;
                break;
            case 'fast':
                scoreReward = 150;
                expReward = 35;
                break;
            case 'heavy':
                scoreReward = 200;
                expReward = 50;
                break;
            case 'armor':
                scoreReward = 300;
                expReward = 75;
                break;
        }
        
        this.score += scoreReward;
        this.gainExperience(expReward);
        
        this.emit('enemyKilled', { 
            enemy: enemy,
            scoreReward: scoreReward,
            expReward: expReward
        });
    }

    /**
     * 子弹命中目标
     */
    onBulletHit(target, damage) {
        this.stats.shotsHit++;
        this.stats.damageDealt += damage;
    }

    /**
     * 渲染玩家坦克
     */
    onRender(context) {
        // 无敌时闪烁效果
        if (this.invulnerabilityTime > 0) {
            const blinkRate = 10;
            const visible = Math.floor(this.invulnerabilityTime * blinkRate) % 2 === 0;
            if (!visible) {
                return;
            }
        }

        // 受伤红色闪烁
        if (this.damageEffect.active) {
            context.save();
            context.globalCompositeOperation = 'overlay';
            context.fillStyle = 'red';
            context.fillRect(-this.width, -this.height, this.width * 2, this.height * 2);
            context.restore();
        }

        // 渲染基础坦克
        super.onRender(context);

        // 升级特效
        if (this.levelUpEffect.active) {
            this.renderLevelUpEffect(context);
        }
    }

    /**
     * 渲染升级特效
     */
    renderLevelUpEffect(context) {
        const progress = 1 - (this.levelUpEffect.timer / this.levelUpEffect.duration);
        const radius = progress * 50;
        
        context.save();
        context.strokeStyle = '#ffff00';
        context.lineWidth = 3;
        context.globalAlpha = 1 - progress;
        context.beginPath();
        context.arc(0, 0, radius, 0, Math.PI * 2);
        context.stroke();
        context.restore();
    }

    /**
     * 获取玩家状态
     */
    getPlayerStatus() {
        return {
            ...this.getStatus(),
            lives: this.lives,
            score: this.score,
            experience: this.experience,
            experienceToNextLevel: this.experienceToNextLevel,
            skillPoints: this.skillPoints,
            weaponType: this.weaponType,
            invulnerabilityTime: this.invulnerabilityTime,
            stats: { ...this.stats },
            skills: Array.from(this.skills.keys())
        };
    }
}




