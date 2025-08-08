




/**
 * 二维向量类
 * 用于处理2D游戏中的位置、速度、方向等向量运算
 */

export class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * 设置向量值
     */
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * 复制另一个向量的值
     */
    copy(other) {
        this.x = other.x;
        this.y = other.y;
        return this;
    }

    /**
     * 克隆向量
     */
    clone() {
        return new Vector2(this.x, this.y);
    }

    /**
     * 向量加法
     */
    add(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    /**
     * 向量减法
     */
    subtract(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    /**
     * 向量乘法（标量）
     */
    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    /**
     * 向量除法（标量）
     */
    divide(scalar) {
        if (scalar !== 0) {
            this.x /= scalar;
            this.y /= scalar;
        }
        return this;
    }

    /**
     * 计算向量长度（模）
     */
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * 计算向量长度的平方
     */
    lengthSquared() {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * 归一化向量（单位向量）
     */
    normalize() {
        const len = this.length();
        if (len > 0) {
            this.divide(len);
        }
        return this;
    }

    /**
     * 获取归一化后的向量（不修改原向量）
     */
    normalized() {
        return this.clone().normalize();
    }

    /**
     * 点积
     */
    dot(other) {
        return this.x * other.x + this.y * other.y;
    }

    /**
     * 叉积（2D中返回标量）
     */
    cross(other) {
        return this.x * other.y - this.y * other.x;
    }

    /**
     * 计算与另一个向量的距离
     */
    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 计算与另一个向量距离的平方
     */
    distanceToSquared(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return dx * dx + dy * dy;
    }

    /**
     * 计算向量角度（弧度）
     */
    angle() {
        return Math.atan2(this.y, this.x);
    }

    /**
     * 计算与另一个向量的夹角
     */
    angleTo(other) {
        return Math.atan2(other.y - this.y, other.x - this.x);
    }

    /**
     * 旋转向量
     */
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const newX = this.x * cos - this.y * sin;
        const newY = this.x * sin + this.y * cos;
        this.x = newX;
        this.y = newY;
        return this;
    }

    /**
     * 线性插值
     */
    lerp(target, t) {
        this.x += (target.x - this.x) * t;
        this.y += (target.y - this.y) * t;
        return this;
    }

    /**
     * 限制向量长度
     */
    clamp(maxLength) {
        const len = this.length();
        if (len > maxLength) {
            this.normalize().multiply(maxLength);
        }
        return this;
    }

    /**
     * 反射向量（根据法向量）
     */
    reflect(normal) {
        const dot = this.dot(normal);
        this.x -= 2 * dot * normal.x;
        this.y -= 2 * dot * normal.y;
        return this;
    }

    /**
     * 投影到另一个向量上
     */
    project(other) {
        const dot = this.dot(other);
        const lenSq = other.lengthSquared();
        if (lenSq > 0) {
            const scalar = dot / lenSq;
            this.x = other.x * scalar;
            this.y = other.y * scalar;
        }
        return this;
    }

    /**
     * 检查向量是否为零向量
     */
    isZero() {
        return this.x === 0 && this.y === 0;
    }

    /**
     * 检查两个向量是否相等
     */
    equals(other, tolerance = 0.0001) {
        return Math.abs(this.x - other.x) < tolerance && 
               Math.abs(this.y - other.y) < tolerance;
    }

    /**
     * 获取垂直向量（逆时针90度）
     */
    perpendicular() {
        return new Vector2(-this.y, this.x);
    }

    /**
     * 转换为字符串
     */
    toString() {
        return `Vector2(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }

    /**
     * 转换为数组
     */
    toArray() {
        return [this.x, this.y];
    }

    /**
     * 转换为对象
     */
    toObject() {
        return { x: this.x, y: this.y };
    }

    // 静态方法

    /**
     * 创建零向量
     */
    static zero() {
        return new Vector2(0, 0);
    }

    /**
     * 创建单位向量（1, 0）
     */
    static one() {
        return new Vector2(1, 1);
    }

    /**
     * 创建上方向向量
     */
    static up() {
        return new Vector2(0, -1);
    }

    /**
     * 创建下方向向量
     */
    static down() {
        return new Vector2(0, 1);
    }

    /**
     * 创建左方向向量
     */
    static left() {
        return new Vector2(-1, 0);
    }

    /**
     * 创建右方向向量
     */
    static right() {
        return new Vector2(1, 0);
    }

    /**
     * 从角度创建单位向量
     */
    static fromAngle(angle) {
        return new Vector2(Math.cos(angle), Math.sin(angle));
    }

    /**
     * 从两点创建向量
     */
    static fromPoints(point1, point2) {
        return new Vector2(point2.x - point1.x, point2.y - point1.y);
    }

    /**
     * 向量加法（静态）
     */
    static add(v1, v2) {
        return new Vector2(v1.x + v2.x, v1.y + v2.y);
    }

    /**
     * 向量减法（静态）
     */
    static subtract(v1, v2) {
        return new Vector2(v1.x - v2.x, v1.y - v2.y);
    }

    /**
     * 向量乘法（静态）
     */
    static multiply(vector, scalar) {
        return new Vector2(vector.x * scalar, vector.y * scalar);
    }

    /**
     * 向量除法（静态）
     */
    static divide(vector, scalar) {
        if (scalar !== 0) {
            return new Vector2(vector.x / scalar, vector.y / scalar);
        }
        return vector.clone();
    }

    /**
     * 点积（静态）
     */
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }

    /**
     * 叉积（静态）
     */
    static cross(v1, v2) {
        return v1.x * v2.y - v1.y * v2.x;
    }

    /**
     * 距离计算（静态）
     */
    static distance(v1, v2) {
        const dx = v1.x - v2.x;
        const dy = v1.y - v2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 线性插值（静态）
     */
    static lerp(v1, v2, t) {
        return new Vector2(
            v1.x + (v2.x - v1.x) * t,
            v1.y + (v2.y - v1.y) * t
        );
    }

    /**
     * 随机向量
     */
    static random(minLength = 0, maxLength = 1) {
        const angle = Math.random() * Math.PI * 2;
        const length = minLength + Math.random() * (maxLength - minLength);
        return Vector2.fromAngle(angle).multiply(length);
    }

    /**
     * 从数组创建向量
     */
    static fromArray(array) {
        return new Vector2(array[0] || 0, array[1] || 0);
    }

    /**
     * 从对象创建向量
     */
    static fromObject(obj) {
        return new Vector2(obj.x || 0, obj.y || 0);
    }
}




