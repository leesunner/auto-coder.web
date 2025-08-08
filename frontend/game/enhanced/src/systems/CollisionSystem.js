







import { EventEmitter } from '../utils/EventEmitter.js';

/**
 * 碰撞检测系统
 * 处理所有游戏对象之间的碰撞检测和响应
 */
export class CollisionSystem extends EventEmitter {
    constructor() {
        super();
        
        // 碰撞层配置
        this.layers = {
            ENVIRONMENT: 0,     // 环境物体（墙壁、障碍物）
            PLAYER: 1,          // 玩家
            ENEMY: 2,           // 敌人
            BULLET: 3,          // 子弹
            POWERUP: 4,         // 道具
            EFFECT: 5           // 特效
        };
        
        // 碰撞矩阵 - 定义哪些层之间会发生碰撞
        this.collisionMatrix = this.createCollisionMatrix();
        
        // 注册的游戏对象
        this.objects = new Map();
        this.objectsByLayer = new Map();
        
        // 空间分区系统（四叉树）
        this.spatialGrid = null;
        this.gridSize = 64;
        this.gridWidth = 0;
        this.gridHeight = 0;
        this.grid = [];
        
        // 碰撞检测配置
        this.broadPhaseMethod = 'grid'; // 'grid' 或 'quadtree'
        this.enableContinuousCollision = true;
        this.maxCollisionIterations = 3;
        
        // 性能统计
        this.stats = {
            totalChecks: 0,
            actualCollisions: 0,
            broadPhaseFiltered: 0,
            frameTime: 0
        };
        
        // 碰撞回调
        this.collisionCallbacks = new Map();
        
        // 初始化层映射
        this.initializeLayers();
    }

    /**
     * 初始化碰撞层
     */
    initializeLayers() {
        for (const layer of Object.values(this.layers)) {
            this.objectsByLayer.set(layer, new Set());
        }
    }

    /**
     * 创建碰撞矩阵
     */
    createCollisionMatrix() {
        const matrix = {};
        const layers = this.layers;
        
        // 初始化矩阵
        for (const layer1 of Object.values(layers)) {
            matrix[layer1] = {};
            for (const layer2 of Object.values(layers)) {
                matrix[layer1][layer2] = false;
            }
        }
        
        // 设置碰撞规则
        // 环境与所有物理对象碰撞
        matrix[layers.ENVIRONMENT][layers.PLAYER] = true;
        matrix[layers.ENVIRONMENT][layers.ENEMY] = true;
        matrix[layers.ENVIRONMENT][layers.BULLET] = true;
        
        // 玩家与敌人碰撞
        matrix[layers.PLAYER][layers.ENEMY] = true;
        matrix[layers.ENEMY][layers.PLAYER] = true;
        
        // 子弹与坦克碰撞
        matrix[layers.BULLET][layers.PLAYER] = true;
        matrix[layers.BULLET][layers.ENEMY] = true;
        matrix[layers.BULLET][layers.ENVIRONMENT] = true;
        
        // 道具与玩家碰撞
        matrix[layers.POWERUP][layers.PLAYER] = true;
        
        return matrix;
    }

    /**
     * 初始化空间网格
     */
    initializeSpatialGrid(worldWidth, worldHeight) {
        this.gridWidth = Math.ceil(worldWidth / this.gridSize);
        this.gridHeight = Math.ceil(worldHeight / this.gridSize);
        
        this.grid = [];
        for (let y = 0; y < this.gridHeight; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.grid[y][x] = new Set();
            }
        }
    }

    /**
     * 注册游戏对象
     */
    registerObject(object) {
        if (!object.id) {
            object.id = this.generateId();
        }
        
        // 确定对象的碰撞层
        const layer = this.getObjectLayer(object);
        object.collisionLayer = layer;
        
        // 添加到系统
        this.objects.set(object.id, object);
        this.objectsByLayer.get(layer).add(object);
        
        // 添加到空间网格
        this.addToSpatialGrid(object);
        
        this.emit('objectRegistered', { object });
    }

    /**
     * 注销游戏对象
     */
    unregisterObject(object) {
        if (!this.objects.has(object.id)) return;
        
        // 从系统移除
        this.objects.delete(object.id);
        this.objectsByLayer.get(object.collisionLayer).delete(object);
        
        // 从空间网格移除
        this.removeFromSpatialGrid(object);
        
        this.emit('objectUnregistered', { object });
    }

    /**
     * 确定对象的碰撞层
     */
    getObjectLayer(object) {
        if (object.hasTag) {
            if (object.hasTag('player')) return this.layers.PLAYER;
            if (object.hasTag('enemy')) return this.layers.ENEMY;
            if (object.hasTag('bullet')) return this.layers.BULLET;
            if (object.hasTag('powerup')) return this.layers.POWERUP;
            if (object.hasTag('effect')) return this.layers.EFFECT;
            if (object.hasTag('wall') || object.hasTag('obstacle')) return this.layers.ENVIRONMENT;
        }
        
        // 默认为环境层
        return this.layers.ENVIRONMENT;
    }

    /**
     * 添加对象到空间网格
     */
    addToSpatialGrid(object) {
        const bounds = this.getObjectBounds(object);
        const startX = Math.max(0, Math.floor(bounds.left / this.gridSize));
        const endX = Math.min(this.gridWidth - 1, Math.floor(bounds.right / this.gridSize));
        const startY = Math.max(0, Math.floor(bounds.top / this.gridSize));
        const endY = Math.min(this.gridHeight - 1, Math.floor(bounds.bottom / this.gridSize));
        
        // 存储对象占用的网格位置
        object._gridCells = [];
        
        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                this.grid[y][x].add(object);
                object._gridCells.push({ x, y });
            }
        }
    }

    /**
     * 从空间网格移除对象
     */
    removeFromSpatialGrid(object) {
        if (object._gridCells) {
            for (const cell of object._gridCells) {
                if (this.grid[cell.y] && this.grid[cell.y][cell.x]) {
                    this.grid[cell.y][cell.x].delete(object);
                }
            }
            object._gridCells = [];
        }
    }

    /**
     * 更新对象在空间网格中的位置
     */
    updateObjectInSpatialGrid(object) {
        this.removeFromSpatialGrid(object);
        this.addToSpatialGrid(object);
    }

    /**
     * 获取对象边界
     */
    getObjectBounds(object) {
        return {
            left: object.x,
            right: object.x + (object.width || 0),
            top: object.y,
            bottom: object.y + (object.height || 0)
        };
    }

    /**
     * 获取可能碰撞的对象
     */
    getPotentialCollisions(object) {
        const potentials = new Set();
        const objectLayer = object.collisionLayer;
        
        if (this.broadPhaseMethod === 'grid') {
            // 使用空间网格进行广相检测
            const bounds = this.getObjectBounds(object);
            const startX = Math.max(0, Math.floor(bounds.left / this.gridSize));
            const endX = Math.min(this.gridWidth - 1, Math.floor(bounds.right / this.gridSize));
            const startY = Math.max(0, Math.floor(bounds.top / this.gridSize));
            const endY = Math.min(this.gridHeight - 1, Math.floor(bounds.bottom / this.gridSize));
            
            for (let y = startY; y <= endY; y++) {
                for (let x = startX; x <= endX; x++) {
                    for (const other of this.grid[y][x]) {
                        if (other !== object && this.shouldCheckCollision(objectLayer, other.collisionLayer)) {
                            potentials.add(other);
                        }
                    }
                }
            }
        } else {
            // 暴力检测所有对象
            for (const [layerIndex, objects] of this.objectsByLayer) {
                if (this.shouldCheckCollision(objectLayer, layerIndex)) {
                    for (const other of objects) {
                        if (other !== object) {
                            potentials.add(other);
                        }
                    }
                }
            }
        }
        
        return Array.from(potentials);
    }

    /**
     * 检查两个层是否应该进行碰撞检测
     */
    shouldCheckCollision(layer1, layer2) {
        return this.collisionMatrix[layer1] && this.collisionMatrix[layer1][layer2];
    }

    /**
     * 执行碰撞检测
     */
    checkCollisions(deltaTime) {
        const startTime = performance.now();
        this.stats.totalChecks = 0;
        this.stats.actualCollisions = 0;
        this.stats.broadPhaseFiltered = 0;
        
        const collisions = [];
        
        // 更新所有对象在空间网格中的位置
        for (const object of this.objects.values()) {
            if (object.isActive !== false) {
                this.updateObjectInSpatialGrid(object);
            }
        }
        
        // 检测碰撞
        for (const object of this.objects.values()) {
            if (object.isActive === false || !object.isSolid) continue;
            
            const potentials = this.getPotentialCollisions(object);
            this.stats.totalChecks += potentials.length;
            
            for (const other of potentials) {
                if (other.isActive === false || !other.isSolid) continue;
                
                // 精确碰撞检测
                const collision = this.checkObjectCollision(object, other);
                if (collision) {
                    collisions.push(collision);
                    this.stats.actualCollisions++;
                }
            }
        }
        
        // 处理碰撞
        this.processCollisions(collisions, deltaTime);
        
        this.stats.frameTime = performance.now() - startTime;
    }

    /**
     * 检查两个对象的碰撞
     */
    checkObjectCollision(obj1, obj2) {
        // 基本AABB碰撞检测
        const bounds1 = this.getObjectBounds(obj1);
        const bounds2 = this.getObjectBounds(obj2);
        
        if (bounds1.right <= bounds2.left || bounds1.left >= bounds2.right ||
            bounds1.bottom <= bounds2.top || bounds1.top >= bounds2.bottom) {
            return null;
        }
        
        // 计算碰撞信息
        const overlapX = Math.min(bounds1.right - bounds2.left, bounds2.right - bounds1.left);
        const overlapY = Math.min(bounds1.bottom - bounds2.top, bounds2.bottom - bounds1.top);
        
        // 确定碰撞方向
        let normal = { x: 0, y: 0 };
        if (overlapX < overlapY) {
            // 水平碰撞
            normal.x = bounds1.left < bounds2.left ? -1 : 1;
            normal.y = 0;
        } else {
            // 垂直碰撞
            normal.x = 0;
            normal.y = bounds1.top < bounds2.top ? -1 : 1;
        }
        
        return {
            object1: obj1,
            object2: obj2,
            normal: normal,
            overlap: { x: overlapX, y: overlapY },
            point: {
                x: Math.max(bounds1.left, bounds2.left) + Math.min(overlapX, overlapY) / 2,
                y: Math.max(bounds1.top, bounds2.top) + Math.min(overlapX, overlapY) / 2
            }
        };
    }

    /**
     * 处理碰撞
     */
    processCollisions(collisions, deltaTime) {
        // 按优先级排序碰撞
        collisions.sort((a, b) => this.getCollisionPriority(a) - this.getCollisionPriority(b));
        
        for (const collision of collisions) {
            this.resolveCollision(collision, deltaTime);
        }
    }

    /**
     * 获取碰撞优先级
     */
    getCollisionPriority(collision) {
        const obj1Layer = collision.object1.collisionLayer;
        const obj2Layer = collision.object2.collisionLayer;
        
        // 环境碰撞优先级最高
        if (obj1Layer === this.layers.ENVIRONMENT || obj2Layer === this.layers.ENVIRONMENT) {
            return 0;
        }
        
        // 子弹碰撞次之
        if (obj1Layer === this.layers.BULLET || obj2Layer === this.layers.BULLET) {
            return 1;
        }
        
        // 其他碰撞
        return 2;
    }

    /**
     * 解决碰撞
     */
    resolveCollision(collision, deltaTime) {
        const { object1, object2, normal, overlap, point } = collision;
        
        // 通知对象发生碰撞
        let handled1 = false, handled2 = false;
        
        if (object1.onCollision) {
            handled1 = object1.onCollision(object2, collision);
        }
        
        if (object2.onCollision) {
            handled2 = object2.onCollision(object1, collision);
        }
        
        // 如果没有被对象处理，执行默认物理响应
        if (!handled1 && !handled2) {
            this.applyPhysicalResponse(collision);
        }
        
        // 发送碰撞事件
        this.emit('collision', collision);
        
        // 执行碰撞回调
        this.executeCollisionCallbacks(collision);
    }

    /**
     * 应用物理响应
     */
    applyPhysicalResponse(collision) {
        const { object1, object2, normal, overlap } = collision;
        
        // 确定哪个对象应该被推开
        const obj1Static = object1.isStatic || object1.collisionLayer === this.layers.ENVIRONMENT;
        const obj2Static = object2.isStatic || object2.collisionLayer === this.layers.ENVIRONMENT;
        
        if (obj1Static && obj2Static) {
            return; // 两个都是静态对象
        }
        
        const separation = Math.min(overlap.x, overlap.y);
        
        if (obj1Static) {
            // 只移动object2
            object2.x -= normal.x * separation;
            object2.y -= normal.y * separation;
        } else if (obj2Static) {
            // 只移动object1
            object1.x += normal.x * separation;
            object1.y += normal.y * separation;
        } else {
            // 两个都移动
            const mass1 = object1.mass || 1;
            const mass2 = object2.mass || 1;
            const totalMass = mass1 + mass2;
            
            const ratio1 = mass2 / totalMass;
            const ratio2 = mass1 / totalMass;
            
            object1.x += normal.x * separation * ratio1;
            object1.y += normal.y * separation * ratio1;
            
            object2.x -= normal.x * separation * ratio2;
            object2.y -= normal.y * separation * ratio2;
        }
    }

    /**
     * 执行碰撞回调
     */
    executeCollisionCallbacks(collision) {
        const key1 = `${collision.object1.collisionLayer}_${collision.object2.collisionLayer}`;
        const key2 = `${collision.object2.collisionLayer}_${collision.object1.collisionLayer}`;
        
        if (this.collisionCallbacks.has(key1)) {
            this.collisionCallbacks.get(key1)(collision);
        } else if (this.collisionCallbacks.has(key2)) {
            // 交换对象顺序
            const swappedCollision = {
                ...collision,
                object1: collision.object2,
                object2: collision.object1,
                normal: { x: -collision.normal.x, y: -collision.normal.y }
            };
            this.collisionCallbacks.get(key2)(swappedCollision);
        }
    }

    /**
     * 注册碰撞回调
     */
    registerCollisionCallback(layer1, layer2, callback) {
        const key = `${layer1}_${layer2}`;
        this.collisionCallbacks.set(key, callback);
    }

    /**
     * 射线检测
     */
    raycast(startX, startY, endX, endY, layerMask = null) {
        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return null;
        
        const dirX = dx / distance;
        const dirY = dy / distance;
        const stepSize = Math.min(this.gridSize / 4, distance / 10);
        
        const hits = [];
        
        for (let step = 0; step < distance; step += stepSize) {
            const x = startX + dirX * step;
            const y = startY + dirY * step;
            
            // 获取当前位置的网格
            const gridX = Math.floor(x / this.gridSize);
            const gridY = Math.floor(y / this.gridSize);
            
            if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) {
                continue;
            }
            
            // 检查网格中的对象
            for (const object of this.grid[gridY][gridX]) {
                if (layerMask && !layerMask.includes(object.collisionLayer)) {
                    continue;
                }
                
                if (this.pointInObject(x, y, object)) {
                    const hitDistance = Math.sqrt((x - startX) ** 2 + (y - startY) ** 2);
                    hits.push({
                        object: object,
                        point: { x, y },
                        distance: hitDistance,
                        normal: this.calculateSurfaceNormal(x, y, object)
                    });
                }
            }
        }
        
        // 返回最近的命中
        return hits.length > 0 ? hits.sort((a, b) => a.distance - b.distance)[0] : null;
    }

    /**
     * 检查点是否在对象内
     */
    pointInObject(x, y, object) {
        const bounds = this.getObjectBounds(object);
        return x >= bounds.left && x <= bounds.right && 
               y >= bounds.top && y <= bounds.bottom;
    }

    /**
     * 计算表面法向量
     */
    calculateSurfaceNormal(x, y, object) {
        const bounds = this.getObjectBounds(object);
        const centerX = bounds.left + (bounds.right - bounds.left) / 2;
        const centerY = bounds.top + (bounds.bottom - bounds.top) / 2;
        
        const dx = x - centerX;
        const dy = y - centerY;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        return length > 0 ? { x: dx / length, y: dy / length } : { x: 0, y: -1 };
    }

    /**
     * 范围查询
     */
    queryRange(x, y, width, height, layerMask = null) {
        const objects = new Set();
        
        const startX = Math.max(0, Math.floor(x / this.gridSize));
        const endX = Math.min(this.gridWidth - 1, Math.floor((x + width) / this.gridSize));
        const startY = Math.max(0, Math.floor(y / this.gridSize));
        const endY = Math.min(this.gridHeight - 1, Math.floor((y + height) / this.gridSize));
        
        for (let gridY = startY; gridY <= endY; gridY++) {
            for (let gridX = startX; gridX <= endX; gridX++) {
                for (const object of this.grid[gridY][gridX]) {
                    if (layerMask && !layerMask.includes(object.collisionLayer)) {
                        continue;
                    }
                    
                    const bounds = this.getObjectBounds(object);
                    if (bounds.right > x && bounds.left < x + width &&
                        bounds.bottom > y && bounds.top < y + height) {
                        objects.add(object);
                    }
                }
            }
        }
        
        return Array.from(objects);
    }

    /**
     * 圆形范围查询
     */
    queryCircle(centerX, centerY, radius, layerMask = null) {
        const objects = [];
        const radiusSquared = radius * radius;
        
        const rangeObjects = this.queryRange(
            centerX - radius, 
            centerY - radius, 
            radius * 2, 
            radius * 2, 
            layerMask
        );
        
        for (const object of rangeObjects) {
            const bounds = this.getObjectBounds(object);
            const objCenterX = bounds.left + (bounds.right - bounds.left) / 2;
            const objCenterY = bounds.top + (bounds.bottom - bounds.top) / 2;
            
            const distanceSquared = (objCenterX - centerX) ** 2 + (objCenterY - centerY) ** 2;
            if (distanceSquared <= radiusSquared) {
                objects.push(object);
            }
        }
        
        return objects;
    }

    /**
     * 设置碰撞层规则
     */
    setLayerCollision(layer1, layer2, shouldCollide) {
        if (this.collisionMatrix[layer1]) {
            this.collisionMatrix[layer1][layer2] = shouldCollide;
        }
        if (this.collisionMatrix[layer2]) {
            this.collisionMatrix[layer2][layer1] = shouldCollide;
        }
    }

    /**
     * 获取性能统计
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * 清理系统
     */
    clear() {
        this.objects.clear();
        for (const layerObjects of this.objectsByLayer.values()) {
            layerObjects.clear();
        }
        
        if (this.grid) {
            for (let y = 0; y < this.gridHeight; y++) {
                for (let x = 0; x < this.gridWidth; x++) {
                    this.grid[y][x].clear();
                }
            }
        }
        
        this.collisionCallbacks.clear();
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return 'collision_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 调试渲染
     */
    debugRender(context, camera) {
        if (!this.grid) return;
        
        context.save();
        context.strokeStyle = '#ff0000';
        context.lineWidth = 1;
        context.globalAlpha = 0.3;
        
        // 渲染网格
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const screenX = x * this.gridSize - camera.x;
                const screenY = y * this.gridSize - camera.y;
                
                context.strokeRect(screenX, screenY, this.gridSize, this.gridSize);
                
                // 显示网格中的对象数量
                if (this.grid[y][x].size > 0) {
                    context.fillStyle = '#ff0000';
                    context.font = '10px Arial';
                    context.fillText(
                        this.grid[y][x].size.toString(),
                        screenX + 2,
                        screenY + 12
                    );
                }
            }
        }
        
        // 渲染对象边界
        context.strokeStyle = '#00ff00';
        context.lineWidth = 2;
        context.globalAlpha = 0.5;
        
        for (const object of this.objects.values()) {
            if (object.isActive !== false) {
                const bounds = this.getObjectBounds(object);
                context.strokeRect(
                    bounds.left - camera.x,
                    bounds.top - camera.y,
                    bounds.right - bounds.left,
                    bounds.bottom - bounds.top
                );
            }
        }
        
        context.restore();
    }
}

/**
 * 碰撞形状类
 */
export class CollisionShape {
    constructor(type = 'rectangle') {
        this.type = type; // 'rectangle', 'circle', 'polygon'
        this.offset = { x: 0, y: 0 };
    }
}

/**
 * 矩形碰撞形状
 */
export class RectangleShape extends CollisionShape {
    constructor(width, height) {
        super('rectangle');
        this.width = width;
        this.height = height;
    }
}

/**
 * 圆形碰撞形状
 */
export class CircleShape extends CollisionShape {
    constructor(radius) {
        super('circle');
        this.radius = radius;
    }
}

/**
 * 多边形碰撞形状
 */
export class PolygonShape extends CollisionShape {
    constructor(vertices) {
        super('polygon');
        this.vertices = vertices; // 顶点数组 [{x, y}, ...]
    }
}








