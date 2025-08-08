

/**
 * 坦克基类
 */
class Tank {
    constructor(x, y, type = 'player') {
        this.position = new Vector2D(x, y);
        this.direction = 0; // 0: 上, 1: 右, 2: 下, 3: 左
        this.speed = 150;
        this.width = 32;
        this.height = 32;
        this.type = type;
        this.active = true;
        this.health = 1;
        this.maxHealth = 1;
        
        // 射击相关
        this.canShoot = true;
        this.shootCooldown = 500; // 毫秒
        this.lastShotTime = 0;
        
        // 移动相关
        this.velocity = new Vector2D(0, 0);
        this.isMoving = false;
        
        // 动画相关
        this.animationFrame = 0;
        this.animationSpeed = 200; // 毫秒
        this.lastAnimationTime = 0;
    }

    /**
     * 更新坦克状态
     */
    update(deltaTime) {
        if (!this.active) return;
        
        // 更新位置
        const dt = deltaTime / 1000;
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
        
        // 更新射击冷却
        this.updateShootCooldown(deltaTime);
        
        // 更新动画
        this.updateAnimation(deltaTime);
        
        // 重置移动状态
        this.isMoving = false;
        this.velocity.x = 0;
        this.velocity.y = 0;
    }

    /**
     * 更新射击冷却时间
     */
    updateShootCooldown(deltaTime) {
        if (!this.canShoot) {
            this.lastShotTime += deltaTime;
            if (this.lastShotTime >= this.shootCooldown) {
                this.canShoot = true;
                this.lastShotTime = 0;
            }
        }
    }

    /**
     * 更新动画帧
     */
    updateAnimation(deltaTime) {
        if (this.isMoving) {
            this.lastAnimationTime += deltaTime;
            if (this.lastAnimationTime >= this.animationSpeed) {
                this.animationFrame = (this.animationFrame + 1) % 2;
                this.lastAnimationTime = 0;
            }
        }
    }

    /**
     * 移动坦克
     */
    move(direction) {
        if (!this.active) return;
        
        this.direction = direction;
        this.isMoving = true;
        
        // 根据方向设置速度
        const directions = [
            new Vector2D(0, -1), // 上
            new Vector2D(1, 0),  // 右
            new Vector2D(0, 1),  // 下
            new Vector2D(-1, 0)  // 左
        ];
        
        this.velocity = directions[direction].multiply(this.speed);
    }

    /**
     * 射击
     */
    shoot(bulletManager) {
        if (!this.active || !this.canShoot) return null;
        
        // 计算子弹发射位置
        const bulletPos = this.getBulletSpawnPosition();
        
        // 创建子弹
        const bullet = bulletManager.createBullet(
            bulletPos.x,
            bulletPos.y,
            this.direction,
            400,
            this.type
        );
        
        // 设置射击冷却
        this.canShoot = false;
        this.lastShotTime = 0;
        
        return bullet;
    }

    /**
     * 获取子弹发射位置
     */
    getBulletSpawnPosition() {
        const offset = 20;
        const positions = [
            new Vector2D(this.position.x, this.position.y - offset), // 上
            new Vector2D(this.position.x + offset, this.position.y), // 右
            new Vector2D(this.position.x, this.position.y + offset), // 下
            new Vector2D(this.position.x - offset, this.position.y)  // 左
        ];
        
        return positions[this.direction];
    }

    /**
     * 渲染坦克
     */
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // 移动到坦克中心
        ctx.translate(this.position.x, this.position.y);
        
        // 根据方向旋转
        ctx.rotate(this.direction * Math.PI / 2);
        
        // 绘制坦克主体
        this.drawTankBody(ctx);
        
        // 绘制坦克炮管
        this.drawTankBarrel(ctx);
        
        ctx.restore();
        
        // 绘制生命值
        this.drawHealthBar(ctx);
    }

    /**
     * 绘制坦克主体
     */
    drawTankBody(ctx) {
        const size = this.width / 2;
        
        // 设置坦克颜色
        if (this.type === 'player') {
            ctx.fillStyle = '#2ecc71';
        } else {
            ctx.fillStyle = '#e74c3c';
        }
        
        // 绘制主体
        ctx.fillRect(-size, -size, this.width, this.height);
        
        // 绘制边框
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 2;
        ctx.strokeRect(-size, -size, this.width, this.height);
        
        // 绘制履带
        ctx.fillStyle = '#34495e';
        ctx.fillRect(-size, -size + 4, this.width, 4);
        ctx.fillRect(-size, size - 8, this.width, 4);
        
        // 绘制中心
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 绘制坦克炮管
     */
    drawTankBarrel(ctx) {
        ctx.fillStyle = '#34495e';
        ctx.fillRect(-2, -this.height / 2 - 8, 4, 12);
        
        // 炮管末端
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(-1, -this.height / 2 - 8, 2, 4);
    }

    /**
     * 绘制生命值条
     */
    drawHealthBar(ctx) {
        if (this.type === 'player' || this.health === this.maxHealth) return;
        
        const barWidth = this.width;
        const barHeight = 4;
        const x = this.position.x - barWidth / 2;
        const y = this.position.y - this.height / 2 - 10;
        
        // 背景
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // 生命值
        ctx.fillStyle = '#2ecc71';
        const healthWidth = (this.health / this.maxHealth) * barWidth;
        ctx.fillRect(x, y, healthWidth, barHeight);
        
        // 边框
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
    }

    /**
     * 受到伤害
     */
    takeDamage(damage = 1) {
        if (!this.active) return;
        
        this.health -= damage;
        if (this.health <= 0) {
            this.destroy();
        }
    }

    /**
     * 销毁坦克
     */
    destroy() {
        this.active = false;
        this.health = 0;
    }

    /**
     * 获取碰撞盒
     */
    getBoundingBox() {
        return {
            x: this.position.x - this.width / 2,
            y: this.position.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }

    /**
     * 检查与边界的碰撞
     */
    checkBoundaryCollision(canvasWidth, canvasHeight) {
        const box = this.getBoundingBox();
        
        if (box.x < 0) {
            this.position.x = this.width / 2;
        } else if (box.x + box.width > canvasWidth) {
            this.position.x = canvasWidth - this.width / 2;
        }
        
        if (box.y < 0) {
            this.position.y = this.height / 2;
        } else if (box.y + box.height > canvasHeight) {
            this.position.y = canvasHeight - this.height / 2;
        }
    }
}

/**
 * 玩家坦克类
 */
class PlayerTank extends Tank {
    constructor(x, y) {
        super(x, y, 'player');
        this.health = 3;
        this.maxHealth = 3;
        this.speed = 180;
        this.shootCooldown = 300;
        this.score = 0;
    }

    /**
     * 处理输入
     */
    handleInput(inputManager, bulletManager) {
        if (!this.active) return;
        
        // 移动控制
        if (inputManager.isKeyPressed('KeyW') || inputManager.isKeyPressed('ArrowUp')) {
            this.move(0); // 上
        } else if (inputManager.isKeyPressed('KeyD') || inputManager.isKeyPressed('ArrowRight')) {
            this.move(1); // 右
        } else if (inputManager.isKeyPressed('KeyS') || inputManager.isKeyPressed('ArrowDown')) {
            this.move(2); // 下
        } else if (inputManager.isKeyPressed('KeyA') || inputManager.isKeyPressed('ArrowLeft')) {
            this.move(3); // 左
        }
        
        // 射击控制
        if (inputManager.isKeyPressed('Space')) {
            this.shoot(bulletManager);
        }
    }

    /**
     * 增加分数
     */
    addScore(points) {
        this.score += points;
    }

    /**
     * 获取分数
     */
    getScore() {
        return this.score;
    }
}

/**
 * 敌人坦克类
 */
class EnemyTank extends Tank {
    constructor(x, y, difficulty = 1) {
        super(x, y, 'enemy');
        this.difficulty = difficulty;
        this.health = difficulty;
        this.maxHealth = difficulty;
        this.speed = 100 + difficulty * 20;
        this.shootCooldown = 1000 - difficulty * 100;
        
        // AI相关
        this.aiTimer = 0;
        this.aiInterval = 1000 + Math.random() * 1000;
        this.targetDirection = Math.floor(Math.random() * 4);
        this.shootTimer = 0;
        this.shootInterval = 2000 + Math.random() * 2000;
    }

    /**
     * AI更新
     */
    updateAI(deltaTime, playerTank, bulletManager) {
        if (!this.active) return;
        
        // 更新AI计时器
        this.aiTimer += deltaTime;
        this.shootTimer += deltaTime;
        
        // 改变移动方向
        if (this.aiTimer >= this.aiInterval) {
            this.targetDirection = Math.floor(Math.random() * 4);
            this.aiTimer = 0;
            this.aiInterval = 1000 + Math.random() * 1000;
        }
        
        // 移动
        this.move(this.targetDirection);
        
        // 射击
        if (this.shootTimer >= this.shootInterval) {
            // 有概率朝向玩家
            if (Math.random() < 0.3 && playerTank.active) {
                this.aimAtPlayer(playerTank);
            }
            
            this.shoot(bulletManager);
            this.shootTimer = 0;
            this.shootInterval = 1500 + Math.random() * 1500;
        }
    }

    /**
     * 瞄准玩家
     */
    aimAtPlayer(playerTank) {
        const dx = playerTank.position.x - this.position.x;
        const dy = playerTank.position.y - this.position.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            this.direction = dx > 0 ? 1 : 3; // 右或左
        } else {
            this.direction = dy > 0 ? 2 : 0; // 下或上
        }
    }

    /**
     * 获取击败分数
     */
    getKillScore() {
        return this.difficulty * 100;
    }
}

