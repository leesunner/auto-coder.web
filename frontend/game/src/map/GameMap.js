






/**
 * 游戏地图类
 * 管理地图数据、障碍物、碰撞检测和地图渲染
 */

import { GameObject } from '../entities/GameObject.js';
import { Vector2 } from '../utils/Vector2.js';

/**
 * 地图瓦片类型枚举
 */
export const TileType = {
    EMPTY: 0,           // 空地
    WALL: 1,            // 墙壁
    STEEL: 2,           // 钢墙
    WATER: 3,           // 水域
    FOREST: 4,          // 森林
    ICE: 5,             // 冰面
    BASE: 6,            // 基地
    SPAWN_POINT: 7      // 出生点
};

/**
 * 地图瓦片类
 */
class MapTile {
    constructor(x, y, type = TileType.EMPTY) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.health = this.getMaxHealth();
        this.maxHealth = this.health;
        this.isDestroyed = false;
        this.canPassThrough = this.getPassability();
        this.canShootThrough = this.getShootability();
    }

    /**
     * 获取瓦片的最大生命值
     */
    getMaxHealth() {
        switch (this.type) {
            case TileType.WALL:
                return 1;
            case TileType.STEEL:
                return 3;
            case TileType.BASE:
                return 1;
            default:
                return 0; // 不可破坏
        }
    }

    /**
     * 获取瓦片的通行性
     */
    getPassability() {
        switch (this.type) {
            case TileType.EMPTY:
            case TileType.ICE:
            case TileType.SPAWN_POINT:
                return true;
            case TileType.WALL:
            case TileType.STEEL:
            case TileType.WATER:
            case TileType.BASE:
                return false;
            case TileType.FOREST:
                return true; // 森林可以通过但会遮挡视线
            default:
                return false;
        }
    }

    /**
     * 获取瓦片的射击穿透性
     */
    getShootability() {
        switch (this.type) {
            case TileType.EMPTY:
            case TileType.ICE:
            case TileType.SPAWN_POINT:
                return true;
            case TileType.WALL:
            case TileType.STEEL:
            case TileType.WATER:
            case TileType.BASE:
                return false;
            case TileType.FOREST:
                return true; // 子弹可以穿过森林
            default:
                return false;
        }
    }

    /**
     * 瓦片受到伤害
     */
    takeDamage(damage = 1) {
        if (this.health <= 0) {
            return false;
        }

        this.health -= damage;
        
        if (this.health <= 0) {
            this.destroy();
            return true;
        }
        
        return false;
    }

    /**
     * 销毁瓦片
     */
    destroy() {
        this.isDestroyed = true;
        this.health = 0;
        
        // 被摧毁后变为空地
        if (this.type === TileType.WALL || this.type === TileType.BASE) {
            this.type = TileType.EMPTY;
            this.canPassThrough = true;
            this.canShootThrough = true;
        }
    }

    /**
     * 修复瓦片
     */
    repair() {
        this.health = this.maxHealth;
        this.isDestroyed = false;
    }

    /**
     * 获取瓦片颜色
     */
    getColor() {
        switch (this.type) {
            case TileType.EMPTY:
                return '#2d2d2d';
            case TileType.WALL:
                return this.isDestroyed ? '#2d2d2d' : '#8B4513';
            case TileType.STEEL:
                return '#C0C0C0';
            case TileType.WATER:
                return '#0066CC';
            case TileType.FOREST:
                return '#228B22';
            case TileType.ICE:
                return '#E0FFFF';
            case TileType.BASE:
                return this.isDestroyed ? '#FF0000' : '#FFD700';
            case TileType.SPAWN_POINT:
                return '#90EE90';
            default:
                return '#000000';
        }
    }
}

/**
 * 游戏地图类
 */
export class GameMap extends GameObject {
    constructor(width = 800, height = 600, tileSize = 32) {
        super(0, 0, width, height);
        
        // 地图基本属性
        this.mapWidth = width;
        this.mapHeight = height;
        this.tileSize = tileSize;
        this.tilesX = Math.floor(width / tileSize);
        this.tilesY = Math.floor(height / tileSize);
        
        // 地图数据
        this.tiles = [];
        this.obstacles = [];
        this.spawnPoints = [];
        this.basePosition = null;
        
        // 碰撞检测优化
        this.collisionGrid = [];
        this.gridSize = tileSize * 2; // 碰撞网格大小
        this.gridWidth = Math.ceil(width / this.gridSize);
        this.gridHeight = Math.ceil(height / this.gridSize);
        
        // 地图主题
        this.theme = 'classic';
        this.backgroundColor = '#2d2d2d';
        
        // 初始化地图
        this.initializeMap();
        this.initializeCollisionGrid();
        
        // 添加标签
        this.addTag('map');
    }

    /**
     * 初始化地图
     */
    initializeMap() {
        // 创建空的地图
        for (let y = 0; y < this.tilesY; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.tilesX; x++) {
                this.tiles[y][x] = new MapTile(x, y, TileType.EMPTY);
            }
        }
        
        // 生成默认地图布局
        this.generateDefaultMap();
    }

    /**
     * 生成默认地图布局
     */
    generateDefaultMap() {
        // 生成边界墙
        this.generateBorderWalls();
        
        // 生成一些障碍物
        this.generateRandomObstacles();
        
        // 设置出生点
        this.setupSpawnPoints();
        
        // 设置基地
        this.setupBase();
    }

    /**
     * 生成边界墙
     */
    generateBorderWalls() {
        for (let x = 0; x < this.tilesX; x++) {
            // 上下边界
            this.setTile(x, 0, TileType.STEEL);
            this.setTile(x, this.tilesY - 1, TileType.STEEL);
        }
        
        for (let y = 0; y < this.tilesY; y++) {
            // 左右边界
            this.setTile(0, y, TileType.STEEL);
            this.setTile(this.tilesX - 1, y, TileType.STEEL);
        }
    }

    /**
     * 生成随机障碍物
     */
    generateRandomObstacles() {
        const obstacleCount = Math.floor((this.tilesX * this.tilesY) * 0.15);
        
        for (let i = 0; i < obstacleCount; i++) {
            const x = Math.floor(Math.random() * (this.tilesX - 4)) + 2;
            const y = Math.floor(Math.random() * (this.tilesY - 4)) + 2;
            
            // 随机选择障碍物类型
            const types = [TileType.WALL, TileType.STEEL, TileType.WATER, TileType.FOREST];
            const type = types[Math.floor(Math.random() * types.length)];
            
            // 生成小块障碍物
            this.generateObstacleCluster(x, y, type);
        }
    }

    /**
     * 生成障碍物集群
     */
    generateObstacleCluster(centerX, centerY, type) {
        const size = Math.random() < 0.3 ? 2 : 1; // 30%概率生成2x2障碍物
        
        for (let dx = 0; dx < size; dx++) {
            for (let dy = 0; dy < size; dy++) {
                const x = centerX + dx;
                const y = centerY + dy;
                
                if (this.isValidTilePosition(x, y) && this.getTile(x, y).type === TileType.EMPTY) {
                    this.setTile(x, y, type);
                }
            }
        }
    }

    /**
     * 设置出生点
     */
    setupSpawnPoints() {
        // 玩家出生点（左下角）
        this.spawnPoints.push({
            type: 'player',
            x: 2 * this.tileSize,
            y: (this.tilesY - 3) * this.tileSize,
            direction: 'up'
        });
        
        // 敌方出生点
        const enemySpawnPositions = [
            { x: this.tilesX - 3, y: 2 }, // 右上
            { x: Math.floor(this.tilesX / 2), y: 2 }, // 中上
            { x: 2, y: 2 } // 左上
        ];
        
        for (const pos of enemySpawnPositions) {
            this.spawnPoints.push({
                type: 'enemy',
                x: pos.x * this.tileSize,
                y: pos.y * this.tileSize,
                direction: 'down'
            });
            
            // 清理出生点周围
            this.clearArea(pos.x, pos.y, 2);
        }
    }

    /**
     * 设置基地
     */
    setupBase() {
        const baseX = Math.floor(this.tilesX / 2);
        const baseY = this.tilesY - 2;
        
        this.basePosition = {
            x: baseX * this.tileSize,
            y: baseY * this.tileSize
        };
        
        this.setTile(baseX, baseY, TileType.BASE);
        
        // 在基地周围建造保护墙
        this.buildBaseProtection(baseX, baseY);
    }

    /**
     * 建造基地保护
     */
    buildBaseProtection(baseX, baseY) {
        const protectionPattern = [
            [-1, -1], [0, -1], [1, -1],
            [-1, 0],           [1, 0],
            [-1, 1],  [0, 1],  [1, 1]
        ];
        
        for (const [dx, dy] of protectionPattern) {
            const x = baseX + dx;
            const y = baseY + dy;
            
            if (this.isValidTilePosition(x, y)) {
                this.setTile(x, y, TileType.WALL);
            }
        }
    }

    /**
     * 清理区域
     */
    clearArea(centerX, centerY, radius) {
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                const x = centerX + dx;
                const y = centerY + dy;
                
                if (this.isValidTilePosition(x, y)) {
                    this.setTile(x, y, TileType.EMPTY);
                }
            }
        }
    }

    /**
     * 初始化碰撞网格
     */
    initializeCollisionGrid() {
        for (let y = 0; y < this.gridHeight; y++) {
            this.collisionGrid[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.collisionGrid[y][x] = [];
            }
        }
    }

    /**
     * 设置瓦片
     */
    setTile(x, y, type) {
        if (this.isValidTilePosition(x, y)) {
            this.tiles[y][x] = new MapTile(x, y, type);
        }
    }

    /**
     * 获取瓦片
     */
    getTile(x, y) {
        if (this.isValidTilePosition(x, y)) {
            return this.tiles[y][x];
        }
        return null;
    }

    /**
     * 检查瓦片位置是否有效
     */
    isValidTilePosition(x, y) {
        return x >= 0 && x < this.tilesX && y >= 0 && y < this.tilesY;
    }

    /**
     * 世界坐标转瓦片坐标
     */
    worldToTile(worldX, worldY) {
        return {
            x: Math.floor(worldX / this.tileSize),
            y: Math.floor(worldY / this.tileSize)
        };
    }

    /**
     * 瓦片坐标转世界坐标
     */
    tileToWorld(tileX, tileY) {
        return {
            x: tileX * this.tileSize,
            y: tileY * this.tileSize
        };
    }

    /**
     * 检查位置是否可通行
     */
    isPassable(worldX, worldY, width = this.tileSize, height = this.tileSize) {
        // 检查对象占用的所有瓦片
        const left = Math.floor(worldX / this.tileSize);
        const right = Math.floor((worldX + width - 1) / this.tileSize);
        const top = Math.floor(worldY / this.tileSize);
        const bottom = Math.floor((worldY + height - 1) / this.tileSize);
        
        for (let y = top; y <= bottom; y++) {
            for (let x = left; x <= right; x++) {
                const tile = this.getTile(x, y);
                if (!tile || !tile.canPassThrough) {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * 检查射线是否可穿透
     */
    canShootThrough(startX, startY, endX, endY) {
        // 使用Bresenham直线算法检查路径上的瓦片
        const tiles = this.getLineOfSightTiles(startX, startY, endX, endY);
        
        for (const tile of tiles) {
            if (!tile.canShootThrough) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * 获取视线路径上的瓦片
     */
    getLineOfSightTiles(startX, startY, endX, endY) {
        const tiles = [];
        const start = this.worldToTile(startX, startY);
        const end = this.worldToTile(endX, endY);
        
        // Bresenham直线算法
        let x0 = start.x, y0 = start.y;
        let x1 = end.x, y1 = end.y;
        
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;
        
        while (true) {
            const tile = this.getTile(x0, y0);
            if (tile) {
                tiles.push(tile);
            }
            
            if (x0 === x1 && y0 === y1) break;
            
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
        
        return tiles;
    }

    /**
     * 检查矩形区域碰撞
     */
    checkRectangleCollision(x, y, width, height) {
        const collisions = [];
        
        const left = Math.floor(x / this.tileSize);
        const right = Math.floor((x + width - 1) / this.tileSize);
        const top = Math.floor(y / this.tileSize);
        const bottom = Math.floor((y + height - 1) / this.tileSize);
        
        for (let tileY = top; tileY <= bottom; tileY++) {
            for (let tileX = left; tileX <= right; tileX++) {
                const tile = this.getTile(tileX, tileY);
                if (tile && !tile.canPassThrough) {
                    collisions.push({
                        tile: tile,
                        x: tileX * this.tileSize,
                        y: tileY * this.tileSize,
                        width: this.tileSize,
                        height: this.tileSize
                    });
                }
            }
        }
        
        return collisions;
    }

    /**
     * 子弹碰撞检测
     */
    checkBulletCollision(bulletX, bulletY, bulletWidth, bulletHeight) {
        const tilePos = this.worldToTile(bulletX + bulletWidth / 2, bulletY + bulletHeight / 2);
        const tile = this.getTile(tilePos.x, tilePos.y);
        
        if (tile && !tile.canShootThrough) {
            return {
                hit: true,
                tile: tile,
                x: tilePos.x * this.tileSize,
                y: tilePos.y * this.tileSize
            };
        }
        
        return { hit: false };
    }

    /**
     * 获取最近的出生点
     */
    getNearestSpawnPoint(x, y, type = null) {
        let nearest = null;
        let minDistance = Infinity;
        
        for (const spawn of this.spawnPoints) {
            if (type && spawn.type !== type) {
                continue;
            }
            
            const distance = Vector2.distance(
                new Vector2(x, y),
                new Vector2(spawn.x, spawn.y)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                nearest = spawn;
            }
        }
        
        return nearest;
    }

    /**
     * 获取随机空位置
     */
    getRandomEmptyPosition(width = this.tileSize, height = this.tileSize) {
        let attempts = 0;
        const maxAttempts = 100;
        
        while (attempts < maxAttempts) {
            const x = Math.random() * (this.mapWidth - width);
            const y = Math.random() * (this.mapHeight - height);
            
            if (this.isPassable(x, y, width, height)) {
                return { x, y };
            }
            
            attempts++;
        }
        
        // 如果找不到空位置，返回地图中心
        return {
            x: this.mapWidth / 2 - width / 2,
            y: this.mapHeight / 2 - height / 2
        };
    }

    /**
     * 更新地图
     */
    update(deltaTime, gameState) {
        super.update(deltaTime, gameState);
        
        // 更新动态地图元素（如果有的话）
        this.updateDynamicElements(deltaTime);
    }

    /**
     * 更新动态元素
     */
    updateDynamicElements(deltaTime) {
        // 这里可以添加动态地图元素的更新逻辑
        // 例如：水面动画、传送带等
    }

    /**
     * 渲染地图
     */
    render(renderer) {
        // 渲染背景
        renderer.fillRect(0, 0, this.mapWidth, this.mapHeight, this.backgroundColor);
        
        // 渲染瓦片
        this.renderTiles(renderer);
        
        // 渲染出生点（调试模式）
        if (renderer.debugMode) {
            this.renderSpawnPoints(renderer);
        }
    }

    /**
     * 渲染瓦片
     */
    renderTiles(renderer) {
        for (let y = 0; y < this.tilesY; y++) {
            for (let x = 0; x < this.tilesX; x++) {
                const tile = this.tiles[y][x];
                
                if (tile.type !== TileType.EMPTY) {
                    const worldX = x * this.tileSize;
                    const worldY = y * this.tileSize;
                    
                    renderer.fillRect(
                        worldX,
                        worldY,
                        this.tileSize,
                        this.tileSize,
                        tile.getColor()
                    );
                    
                    // 渲染瓦片边框
                    if (tile.type === TileType.WALL || tile.type === TileType.STEEL) {
                        renderer.strokeRect(
                            worldX,
                            worldY,
                            this.tileSize,
                            this.tileSize,
                            '#000000',
                            1
                        );
                    }
                    
                    // 渲染损坏效果
                    if (tile.health < tile.maxHealth && tile.maxHealth > 0) {
                        this.renderDamageEffect(renderer, worldX, worldY, tile);
                    }
                }
            }
        }
    }

    /**
     * 渲染损坏效果
     */
    renderDamageEffect(renderer, x, y, tile) {
        const damageRatio = 1 - (tile.health / tile.maxHealth);
        const alpha = damageRatio * 0.5;
        
        renderer.setGlobalAlpha(alpha);
        renderer.fillRect(x, y, this.tileSize, this.tileSize, '#ff0000');
        renderer.resetGlobalAlpha();
    }

    /**
     * 渲染出生点
     */
    renderSpawnPoints(renderer) {
        for (const spawn of this.spawnPoints) {
            const color = spawn.type === 'player' ? '#00ff00' : '#ff0000';
            
            renderer.setGlobalAlpha(0.5);
            renderer.fillRect(
                spawn.x,
                spawn.y,
                this.tileSize,
                this.tileSize,
                color
            );
            renderer.resetGlobalAlpha();
            
            // 渲染方向箭头
            renderer.drawText(
                spawn.direction === 'up' ? '↑' : spawn.direction === 'down' ? '↓' : 
                spawn.direction === 'left' ? '←' : '→',
                spawn.x + this.tileSize / 2,
                spawn.y + this.tileSize / 2,
                '#ffffff',
                '16px Arial'
            );
        }
    }

    /**
     * 从地图数据加载
     */
    loadFromData(mapData) {
        if (!mapData || !mapData.tiles) {
            return false;
        }
        
        this.tilesX = mapData.width || this.tilesX;
        this.tilesY = mapData.height || this.tilesY;
        this.theme = mapData.theme || this.theme;
        
        // 重新初始化地图
        this.initializeMap();
        
        // 加载瓦片数据
        for (let y = 0; y < this.tilesY && y < mapData.tiles.length; y++) {
            for (let x = 0; x < this.tilesX && x < mapData.tiles[y].length; x++) {
                this.setTile(x, y, mapData.tiles[y][x]);
            }
        }
        
        // 加载出生点
        if (mapData.spawnPoints) {
            this.spawnPoints = mapData.spawnPoints;
        }
        
        // 加载基地位置
        if (mapData.basePosition) {
            this.basePosition = mapData.basePosition;
        }
        
        return true;
    }

    /**
     * 导出地图数据
     */
    exportData() {
        const tileData = [];
        
        for (let y = 0; y < this.tilesY; y++) {
            tileData[y] = [];
            for (let x = 0; x < this.tilesX; x++) {
                tileData[y][x] = this.tiles[y][x].type;
            }
        }
        
        return {
            width: this.tilesX,
            height: this.tilesY,
            tileSize: this.tileSize,
            theme: this.theme,
            tiles: tileData,
            spawnPoints: this.spawnPoints,
            basePosition: this.basePosition
        };
    }

    /**
     * 获取地图状态
     */
    getMapStatus() {
        return {
            width: this.mapWidth,
            height: this.mapHeight,
            tileSize: this.tileSize,
            tilesX: this.tilesX,
            tilesY: this.tilesY,
            theme: this.theme,
            spawnPointCount: this.spawnPoints.length,
            basePosition: this.basePosition
        };
    }
}






