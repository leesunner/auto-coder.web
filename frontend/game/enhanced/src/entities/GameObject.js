


/**
 * 游戏对象基类
 * 所有游戏实体的基础类，提供通用的属性和方法
 */
export class GameObject {
    constructor(x = 0, y = 0, width = 32, height = 32) {
        // 基础属性
        this.id = GameObject.generateId();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        // 运动属性
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 0;
        this.maxSpeed = 100;
        this.acceleration = 500;
        this.friction = 0.9;
        
        // 方向属性
        this.direction = 0; // 弧度
        this.rotation = 0;  // 弧度
        
        // 状态属性
        this.isActive = true;
        this.isVisible = true;
        this.isDestroyed = false;
        this.health = 100;
        this.maxHealth = 100;
        
        // 渲染属性
        this.sprite = null;
        this.color = '#ffffff';
        this.alpha = 1.0;
        this.scale = 1.0;
        this.zIndex = 0;
        
        // 碰撞属性
        this.isSolid = true;
        this.collisionMask = 0xFFFFFFFF;
        this.collisionLayer = 1;
        this.boundingBox = {
            x: 0,
            y: 0,
            width: width,
            height: height
        };
        
        // 时间属性
        this.age = 0;
        this.lifeTime = -1; // -1 表示无限生命
        
        // 标签系统
        this.tags = new Set();
        
        // 事件系统
        this.eventListeners = new Map();
        
        // 调试信息
        this.debugInfo = {
            showBoundingBox: false,
            showVelocity: false,
            showHealth: false
        };
    }

    /**
     * 生成唯一ID
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 更新游戏对象
     */
    update(deltaTime) {
        if (!this.isActive || this.isDestroyed) {
            return;
        }

        // 更新年龄
        this.age += deltaTime;

        // 检查生命周期
        if (this.lifeTime > 0 && this.age >= this.lifeTime) {
            this.destroy();
            return;
        }

        // 更新物理
        this.updatePhysics(deltaTime);

        // 更新边界框
        this.updateBoundingBox();

        // 子类可重写的更新方法
        this.onUpdate(deltaTime);
    }

    /**
     * 更新物理运动
     */
    updatePhysics(deltaTime) {
        // 应用摩擦力
        this.velocityX *= this.friction;
        this.velocityY *= this.friction;

        // 限制最大速度
        const currentSpeed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
        if (currentSpeed > this.maxSpeed) {
            const ratio = this.maxSpeed / currentSpeed;
            this.velocityX *= ratio;
            this.velocityY *= ratio;
        }

        // 更新位置
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
    }

    /**
     * 更新边界框
     */
    updateBoundingBox() {
        this.boundingBox.x = this.x - this.width / 2;
        this.boundingBox.y = this.y - this.height / 2;
        this.boundingBox.width = this.width * this.scale;
        this.boundingBox.height = this.height * this.scale;
    }

    /**
     * 渲染游戏对象
     */
    render(context) {
        if (!this.isVisible || this.isDestroyed || this.alpha <= 0) {
            return;
        }

        context.save();

        // 设置透明度
        context.globalAlpha = this.alpha;

        // 移动到对象位置
        context.translate(this.x, this.y);

        // 应用旋转
        if (this.rotation !== 0) {
            context.rotate(this.rotation);
        }

        // 应用缩放
        if (this.scale !== 1) {
            context.scale(this.scale, this.scale);
        }

        // 渲染对象
        this.onRender(context);

        // 渲染调试信息
        if (this.debugInfo.showBoundingBox) {
            this.renderBoundingBox(context);
        }

        if (this.debugInfo.showVelocity) {
            this.renderVelocity(context);
        }

        if (this.debugInfo.showHealth) {
            this.renderHealth(context);
        }

        context.restore();
    }

    /**
     * 子类重写的渲染方法
     */
    onRender(context) {
        // 默认渲染为矩形
        context.fillStyle = this.color;
        context.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }

    /**
     * 子类重写的更新方法
     */
    onUpdate(deltaTime) {
        // 子类实现
    }

    /**
     * 渲染边界框
     */
    renderBoundingBox(context) {
        context.strokeStyle = '#ff0000';
        context.lineWidth = 1;
        context.strokeRect(
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );
    }

    /**
     * 渲染速度向量
     */
    renderVelocity(context) {
        const scale = 0.1;
        context.strokeStyle = '#00ff00';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(this.velocityX * scale, this.velocityY * scale);
        context.stroke();
    }

    /**
     * 渲染血量条
     */
    renderHealth(context) {
        if (this.health < this.maxHealth) {
            const barWidth = this.width;
            const barHeight = 4;
            const healthRatio = this.health / this.maxHealth;

            // 背景
            context.fillStyle = '#ff0000';
            context.fillRect(-barWidth / 2, -this.height / 2 - 8, barWidth, barHeight);

            // 血量
            context.fillStyle = '#00ff00';
            context.fillRect(-barWidth / 2, -this.height / 2 - 8, barWidth * healthRatio, barHeight);
        }
    }

    /**
     * 设置位置
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.updateBoundingBox();
    }

    /**
     * 获取位置
     */
    getPosition() {
        return { x: this.x, y: this.y };
    }

    /**
     * 设置速度
     */
    setVelocity(x, y) {
        this.velocityX = x;
        this.velocityY = y;
    }

    /**
     * 获取速度
     */
    getVelocity() {
        return { x: this.velocityX, y: this.velocityY };
    }

    /**
     * 添加力
     */
    addForce(forceX, forceY, deltaTime) {
        this.velocityX += forceX * deltaTime;
        this.velocityY += forceY * deltaTime;
    }

    /**
     * 朝指定方向移动
     */
    moveInDirection(direction, speed, deltaTime) {
        const forceX = Math.cos(direction) * speed;
        const forceY = Math.sin(direction) * speed;
        this.addForce(forceX, forceY, deltaTime);
    }

    /**
     * 碰撞检测
     */
    intersects(other) {
        if (!this.isSolid || !other.isSolid) {
            return false;
        }

        const thisBox = this.boundingBox;
        const otherBox = other.boundingBox;

        return thisBox.x < otherBox.x + otherBox.width &&
               thisBox.x + thisBox.width > otherBox.x &&
               thisBox.y < otherBox.y + otherBox.height &&
               thisBox.y + thisBox.height > otherBox.y;
    }

    /**
     * 圆形碰撞检测
     */
    intersectsCircle(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const radius1 = Math.max(this.width, this.height) / 2;
        const radius2 = Math.max(other.width, other.height) / 2;
        
        return distance < radius1 + radius2;
    }

    /**
     * 获取到另一个对象的距离
     */
    getDistanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 获取到另一个对象的角度
     */
    getAngleTo(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        return Math.atan2(dy, dx);
    }

    /**
     * 受到伤害
     */
    takeDamage(damage, source = null) {
        if (this.isDestroyed) {
            return false;
        }

        this.health -= damage;
        this.emit('damage', { damage, source, health: this.health });

        if (this.health <= 0) {
            this.health = 0;
            this.destroy();
            return true;
        }

        return false;
    }

    /**
     * 治疗
     */
    heal(amount) {
        if (this.isDestroyed) {
            return;
        }

        this.health = Math.min(this.health + amount, this.maxHealth);
        this.emit('heal', { amount, health: this.health });
    }

    /**
     * 销毁对象
     */
    destroy() {
        if (this.isDestroyed) {
            return;
        }

        this.isDestroyed = true;
        this.isActive = false;
        this.emit('destroy');
        this.onDestroy();
    }

    /**
     * 子类重写的销毁方法
     */
    onDestroy() {
        // 子类实现
    }

    /**
     * 添加标签
     */
    addTag(tag) {
        this.tags.add(tag);
    }

    /**
     * 移除标签
     */
    removeTag(tag) {
        this.tags.delete(tag);
    }

    /**
     * 检查是否有标签
     */
    hasTag(tag) {
        return this.tags.has(tag);
    }

    /**
     * 事件监听
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    /**
     * 移除事件监听
     */
    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * 触发事件
     */
    emit(event, data = null) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            for (const listener of listeners) {
                try {
                    listener(data);
                } catch (error) {
                    console.error(`事件监听器执行错误: ${event}`, error);
                }
            }
        }
    }

    /**
     * 克隆对象
     */
    clone() {
        const cloned = new this.constructor(this.x, this.y, this.width, this.height);
        
        // 复制基础属性
        cloned.velocityX = this.velocityX;
        cloned.velocityY = this.velocityY;
        cloned.speed = this.speed;
        cloned.maxSpeed = this.maxSpeed;
        cloned.direction = this.direction;
        cloned.rotation = this.rotation;
        cloned.health = this.health;
        cloned.maxHealth = this.maxHealth;
        cloned.color = this.color;
        cloned.alpha = this.alpha;
        cloned.scale = this.scale;
        cloned.zIndex = this.zIndex;
        
        // 复制标签
        cloned.tags = new Set(this.tags);
        
        return cloned;
    }

    /**
     * 获取对象信息
     */
    getInfo() {
        return {
            id: this.id,
            type: this.constructor.name,
            position: { x: this.x, y: this.y },
            velocity: { x: this.velocityX, y: this.velocityY },
            health: this.health,
            maxHealth: this.maxHealth,
            isActive: this.isActive,
            isVisible: this.isVisible,
            isDestroyed: this.isDestroyed,
            age: this.age,
            tags: Array.from(this.tags)
        };
    }

    /**
     * 设置调试模式
     */
    setDebugMode(showBoundingBox = false, showVelocity = false, showHealth = false) {
        this.debugInfo.showBoundingBox = showBoundingBox;
        this.debugInfo.showVelocity = showVelocity;
        this.debugInfo.showHealth = showHealth;
    }
}



