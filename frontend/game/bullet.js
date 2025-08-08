

/**
 * 子弹类
 */
class Bullet {
    constructor(x, y, direction, speed = 300, owner = 'player') {
        this.position = new Vector2D(x, y);
        this.direction = direction; // 0: 上, 1: 右, 2: 下, 3: 左
        this.speed = speed;
        this.owner = owner; // 'player' 或 'enemy'
        this.width = 4;
        this.height = 8;
        this.active = true;
        
        // 根据方向设置速度向量
        this.velocity = this.getVelocityFromDirection();
        
        // 根据方向调整子弹尺寸
        if (this.direction === 1 || this.direction === 3) {
            // 水平方向，交换宽高
            [this.width, this.height] = [this.height, this.width];
        }
    }

    /**
     * 根据方向获取速度向量
     */
    getVelocityFromDirection() {
        const directions = [
            new Vector2D(0, -1), // 上
            new Vector2D(1, 0),  // 右
            new Vector2D(0, 1),  // 下
            new Vector2D(-1, 0)  // 左
        ];
        
        return directions[this.direction].multiply(this.speed);
    }

    /**
     * 更新子弹位置
     */
    update(deltaTime) {
        if (!this.active) return;

        const dt = deltaTime / 1000; // 转换为秒
        
        // 更新位置
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
    }

    /**
     * 渲染子弹
     */
    render(ctx) {
        if (!this.active) return;

        ctx.save();
        
        // 设置子弹颜色
        if (this.owner === 'player') {
            ctx.fillStyle = '#f1c40f'; // 玩家子弹为黄色
        } else {
            ctx.fillStyle = '#e74c3c'; // 敌人子弹为红色
        }
        
        // 绘制子弹
        ctx.fillRect(
            Math.round(this.position.x - this.width / 2),
            Math.round(this.position.y - this.height / 2),
            this.width,
            this.height
        );
        
        // 添加发光效果
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 5;
        ctx.fillRect(
            Math.round(this.position.x - this.width / 2),
            Math.round(this.position.y - this.height / 2),
            this.width,
            this.height
        );
        
        ctx.restore();
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
     * 检查是否超出边界
     */
    isOutOfBounds(canvasWidth, canvasHeight) {
        return this.position.x < -10 || 
               this.position.x > canvasWidth + 10 ||
               this.position.y < -10 || 
               this.position.y > canvasHeight + 10;
    }

    /**
     * 销毁子弹
     */
    destroy() {
        this.active = false;
    }

    /**
     * 检查与目标的碰撞
     */
    checkCollision(target) {
        if (!this.active || !target.active) return false;
        
        const bulletBox = this.getBoundingBox();
        const targetBox = target.getBoundingBox();
        
        return CollisionDetector.rectCollision(bulletBox, targetBox);
    }
}

/**
 * 子弹管理器类
 */
class BulletManager {
    constructor() {
        this.bullets = [];
        this.maxBullets = 50; // 最大子弹数量限制
    }

    /**
     * 创建子弹
     */
    createBullet(x, y, direction, speed, owner) {
        // 限制子弹数量
        if (this.bullets.length >= this.maxBullets) {
            // 移除最老的子弹
            this.bullets.shift();
        }
        
        const bullet = new Bullet(x, y, direction, speed, owner);
        this.bullets.push(bullet);
        return bullet;
    }

    /**
     * 更新所有子弹
     */
    update(deltaTime, canvasWidth, canvasHeight) {
        // 更新子弹位置
        this.bullets.forEach(bullet => {
            bullet.update(deltaTime);
            
            // 检查是否超出边界
            if (bullet.isOutOfBounds(canvasWidth, canvasHeight)) {
                bullet.destroy();
            }
        });
        
        // 移除非活跃的子弹
        this.bullets = this.bullets.filter(bullet => bullet.active);
    }

    /**
     * 渲染所有子弹
     */
    render(ctx) {
        this.bullets.forEach(bullet => {
            bullet.render(ctx);
        });
    }

    /**
     * 获取指定拥有者的子弹
     */
    getBulletsByOwner(owner) {
        return this.bullets.filter(bullet => bullet.owner === owner && bullet.active);
    }

    /**
     * 获取所有活跃子弹
     */
    getActiveBullets() {
        return this.bullets.filter(bullet => bullet.active);
    }

    /**
     * 清空所有子弹
     */
    clear() {
        this.bullets = [];
    }

    /**
     * 移除指定子弹
     */
    removeBullet(bullet) {
        bullet.destroy();
    }

    /**
     * 获取子弹数量
     */
    getBulletCount() {
        return this.bullets.filter(bullet => bullet.active).length;
    }
}

