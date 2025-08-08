


/**
 * 游戏对象基类
 * 所有游戏实体的基础类，定义了基本的属性和行为
 */

/**
 * 游戏对象基类
 */
export class GameObject {
    constructor(x = 0, y = 0, width = 32, height = 32) {
        // 位置和尺寸
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        // 状态标志
        this.isActive = true;
        this.isVisible = true;
        this.isDestroyed = false;
        
        // 唯一标识符
        this.id = this.generateId();
        
        // 创建时间
        this.createdTime = performance.now();
        
        // 标签系统（用于分类和查找）
        this.tags = new Set();
        
        // 自定义数据
        this.userData = {};
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 更新游戏对象
     */
    update(deltaTime, gameState) {
        // 基类默认不做任何操作
        // 子类应该重写此方法
    }

    /**
     * 渲染游戏对象
     */
    render(renderer) {
        // 基类默认不做任何操作
        // 子类应该重写此方法
    }

    /**
     * 销毁游戏对象
     */
    destroy() {
        this.isDestroyed = true;
        this.isActive = false;
        this.isVisible = false;
    }

    /**
     * 获取边界框
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    /**
     * 获取中心点
     */
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    /**
     * 设置位置
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * 设置尺寸
     */
    setSize(width, height) {
        this.width = width;
        this.height = height;
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
     * 获取所有标签
     */
    getTags() {
        return Array.from(this.tags);
    }

    /**
     * 设置用户数据
     */
    setUserData(key, value) {
        this.userData[key] = value;
    }

    /**
     * 获取用户数据
     */
    getUserData(key) {
        return this.userData[key];
    }

    /**
     * 检查与另一个游戏对象的碰撞
     */
    intersects(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }

    /**
     * 检查点是否在对象内
     */
    containsPoint(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }

    /**
     * 计算与另一个对象的距离
     */
    distanceTo(other) {
        const thisCenter = this.getCenter();
        const otherCenter = other.getCenter();
        const dx = thisCenter.x - otherCenter.x;
        const dy = thisCenter.y - otherCenter.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 获取对象信息字符串
     */
    toString() {
        return `${this.constructor.name}(${this.id}) at (${this.x}, ${this.y})`;
    }

    /**
     * 克隆对象
     */
    clone() {
        const cloned = new this.constructor(this.x, this.y, this.width, this.height);
        cloned.isActive = this.isActive;
        cloned.isVisible = this.isVisible;
        cloned.tags = new Set(this.tags);
        cloned.userData = { ...this.userData };
        return cloned;
    }

    /**
     * 获取生存时间
     */
    getAge() {
        return performance.now() - this.createdTime;
    }
}


