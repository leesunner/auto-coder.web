






import { EventEmitter } from '../utils/EventEmitter.js';

/**
 * 地图系统
 * 处理地图数据、障碍物、地形等
 */
export class Map extends EventEmitter {
    constructor(width, height) {
        super();
        
        // 地图尺寸
        this.width = width;
        this.height = height;
        this.tileSize = 32; // 瓦片大小
        this.tilesX = Math.ceil(width / this.tileSize);
        this.tilesY = Math.ceil(height / this.tileSize);
        
        // 地图数据
        this.tiles = [];
        this.obstacles = [];
        this.destructibleWalls = [];
        this.powerUpSpawns = [];
        this.enemySpawns = [];
        this.playerSpawns = [];
        
        // 地图类型
        this.mapType = 'classic';
        this.theme = 'desert';
        
        // 碰撞层
        this.collisionGrid = [];
        this.obstacleQuadTree = null;
        
        // 视觉效果
        this.backgroundPattern = null;
        this.overlayEffects = [];
        
        // 动态元素
        this.movingPlatforms = [];
        this.teleporters = [];
        this.hazards = [];
        
        // 环境效果
        this.weather = {
            type: 'none', // none, rain, snow, sandstorm
            intensity: 0,
            particles: []
        };
        
        this.lighting = {
            enabled: false,
            ambientLight: 1.0,
            shadows: []
        };
        
        // 地图边界
        this.boundaries = {
            left: 0,
            right: width,
            top: 0,
            bottom: height
        };
        
        // 初始化
        this.initialize();
    }

    /**
     * 初始化地图
     */
    initialize() {
        this.initializeTiles();
        this.createCollisionGrid();
        this.setupBoundaries();
    }

    /**
     * 初始化瓦片系统
     */
    initializeTiles() {
        this.tiles = [];
        for (let y = 0; y < this.tilesY; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.tilesX; x++) {
                this.tiles[y][x] = {
                    type: 'ground',
                    variant: 0,
                    solid: false,
                    destructible: false,
                    health: 0,
                    effects: []
                };
            }
        }
    }

    /**
     * 创建碰撞网格
     */
    createCollisionGrid() {
        this.collisionGrid = [];
        for (let y = 0; y < this.tilesY; y++) {
            this.collisionGrid[y] = [];
            for (let x = 0; x < this.tilesX; x++) {
                this.collisionGrid[y][x] = [];
            }
        }
    }

    /**
     * 设置地图边界
     */
    setupBoundaries() {
        // 创建边界墙
        const wallThickness = 16;
        
        this.boundaries.walls = [
            // 上边界
            { x: 0, y: 0, width: this.width, height: wallThickness },
            // 下边界
            { x: 0, y: this.height - wallThickness, width: this.width, height: wallThickness },
            // 左边界
            { x: 0, y: 0, width: wallThickness, height: this.height },
            // 右边界
            { x: this.width - wallThickness, y: 0, width: wallThickness, height: this.height }
        ];
    }

    /**
     * 从数据加载地图
     */
    loadFromData(mapData) {
        this.mapType = mapData.type || 'classic';
        this.theme = mapData.theme || 'desert';
        
        // 加载瓦片数据
        if (mapData.tiles) {
            this.loadTiles(mapData.tiles);
        }
        
        // 加载障碍物
        if (mapData.obstacles) {
            this.loadObstacles(mapData.obstacles);
        }
        
        // 加载生成点
        if (mapData.spawns) {
            this.loadSpawns(mapData.spawns);
        }
        
        // 加载特殊元素
        if (mapData.special) {
            this.loadSpecialElements(mapData.special);
        }
        
        // 重新构建碰撞系统
        this.rebuildCollisionSystem();
        
        this.emit('mapLoaded', { mapData });
    }

    /**
     * 加载瓦片数据
     */
    loadTiles(tilesData) {
        for (let y = 0; y < Math.min(tilesData.length, this.tilesY); y++) {
            for (let x = 0; x < Math.min(tilesData[y].length, this.tilesX); x++) {
                const tileData = tilesData[y][x];
                this.tiles[y][x] = {
                    type: tileData.type || 'ground',
                    variant: tileData.variant || 0,
                    solid: tileData.solid || false,
                    destructible: tileData.destructible || false,
                    health: tileData.health || 0,
                    effects: tileData.effects || []
                };
            }
        }
    }

    /**
     * 加载障碍物
     */
    loadObstacles(obstaclesData) {
        this.obstacles = [];
        this.destructibleWalls = [];
        
        for (const obstacleData of obstaclesData) {
            const obstacle = {
                x: obstacleData.x,
                y: obstacleData.y,
                width: obstacleData.width,
                height: obstacleData.height,
                type: obstacleData.type || 'wall',
                destructible: obstacleData.destructible || false,
                health: obstacleData.health || 100,
                maxHealth: obstacleData.health || 100,
                material: obstacleData.material || 'concrete',
                id: obstacleData.id || this.generateId()
            };
            
            if (obstacle.destructible) {
                this.destructibleWalls.push(obstacle);
            } else {
                this.obstacles.push(obstacle);
            }
        }
    }

    /**
     * 加载生成点
     */
    loadSpawns(spawnsData) {
        this.playerSpawns = spawnsData.players || [];
        this.enemySpawns = spawnsData.enemies || [];
        this.powerUpSpawns = spawnsData.powerUps || [];
    }

    /**
     * 加载特殊元素
     */
    loadSpecialElements(specialData) {
        if (specialData.movingPlatforms) {
            this.loadMovingPlatforms(specialData.movingPlatforms);
        }
        
        if (specialData.teleporters) {
            this.loadTeleporters(specialData.teleporters);
        }
        
        if (specialData.hazards) {
            this.loadHazards(specialData.hazards);
        }
        
        if (specialData.weather) {
            this.setWeather(specialData.weather.type, specialData.weather.intensity);
        }
    }

    /**
     * 加载移动平台
     */
    loadMovingPlatforms(platformsData) {
        this.movingPlatforms = [];
        
        for (const platformData of platformsData) {
            this.movingPlatforms.push({
                x: platformData.x,
                y: platformData.y,
                width: platformData.width,
                height: platformData.height,
                waypoints: platformData.waypoints || [],
                currentWaypoint: 0,
                speed: platformData.speed || 50,
                direction: 1,
                passengers: []
            });
        }
    }

    /**
     * 加载传送门
     */
    loadTeleporters(teleportersData) {
        this.teleporters = [];
        
        for (const teleporterData of teleportersData) {
            this.teleporters.push({
                x: teleporterData.x,
                y: teleporterData.y,
                width: teleporterData.width || 32,
                height: teleporterData.height || 32,
                targetX: teleporterData.targetX,
                targetY: teleporterData.targetY,
                cooldown: teleporterData.cooldown || 1,
                lastUsed: 0,
                id: teleporterData.id || this.generateId()
            });
        }
    }

    /**
     * 加载危险区域
     */
    loadHazards(hazardsData) {
        this.hazards = [];
        
        for (const hazardData of hazardsData) {
            this.hazards.push({
                x: hazardData.x,
                y: hazardData.y,
                width: hazardData.width,
                height: hazardData.height,
                type: hazardData.type || 'damage',
                damage: hazardData.damage || 10,
                interval: hazardData.interval || 1,
                lastDamage: 0,
                effects: hazardData.effects || []
            });
        }
    }

    /**
     * 重建碰撞系统
     */
    rebuildCollisionSystem() {
        this.createCollisionGrid();
        this.updateCollisionGrid();
    }

    /**
     * 更新碰撞网格
     */
    updateCollisionGrid() {
        // 清空网格
        for (let y = 0; y < this.tilesY; y++) {
            for (let x = 0; x < this.tilesX; x++) {
                this.collisionGrid[y][x] = [];
            }
        }
        
        // 添加静态障碍物
        for (const obstacle of this.obstacles) {
            this.addToCollisionGrid(obstacle);
        }
        
        // 添加可破坏墙壁
        for (const wall of this.destructibleWalls) {
            if (wall.health > 0) {
                this.addToCollisionGrid(wall);
            }
        }
        
        // 添加固体瓦片
        for (let y = 0; y < this.tilesY; y++) {
            for (let x = 0; x < this.tilesX; x++) {
                const tile = this.tiles[y][x];
                if (tile.solid) {
                    const tileObj = {
                        x: x * this.tileSize,
                        y: y * this.tileSize,
                        width: this.tileSize,
                        height: this.tileSize,
                        type: 'tile'
                    };
                    this.addToCollisionGrid(tileObj);
                }
            }
        }
    }

    /**
     * 添加对象到碰撞网格
     */
    addToCollisionGrid(obj) {
        const startX = Math.floor(obj.x / this.tileSize);
        const endX = Math.floor((obj.x + obj.width) / this.tileSize);
        const startY = Math.floor(obj.y / this.tileSize);
        const endY = Math.floor((obj.y + obj.height) / this.tileSize);
        
        for (let y = Math.max(0, startY); y <= Math.min(this.tilesY - 1, endY); y++) {
            for (let x = Math.max(0, startX); x <= Math.min(this.tilesX - 1, endX); x++) {
                this.collisionGrid[y][x].push(obj);
            }
        }
    }

    /**
     * 获取位置的碰撞对象
     */
    getCollisionsAt(x, y, width, height) {
        const collisions = [];
        const visited = new Set();
        
        const startX = Math.floor(x / this.tileSize);
        const endX = Math.floor((x + width) / this.tileSize);
        const startY = Math.floor(y / this.tileSize);
        const endY = Math.floor((y + height) / this.tileSize);
        
        for (let gridY = Math.max(0, startY); gridY <= Math.min(this.tilesY - 1, endY); gridY++) {
            for (let gridX = Math.max(0, startX); gridX <= Math.min(this.tilesX - 1, endX); gridX++) {
                for (const obj of this.collisionGrid[gridY][gridX]) {
                    const objId = obj.id || `${obj.x}_${obj.y}_${obj.type}`;
                    if (!visited.has(objId)) {
                        visited.add(objId);
                        
                        // 检查实际碰撞
                        if (this.checkRectCollision(x, y, width, height, obj.x, obj.y, obj.width, obj.height)) {
                            collisions.push(obj);
                        }
                    }
                }
            }
        }
        
        return collisions;
    }

    /**
     * 检查矩形碰撞
     */
    checkRectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }

    /**
     * 检查点是否在地图内
     */
    isPointInBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    /**
     * 检查矩形是否在地图内
     */
    isRectInBounds(x, y, width, height) {
        return x >= 0 && y >= 0 && x + width <= this.width && y + height <= this.height;
    }

    /**
     * 获取安全的生成位置
     */
    getSafeSpawnPosition(width, height, team = 'player') {
        const spawns = team === 'player' ? this.playerSpawns : this.enemySpawns;
        
        for (const spawn of spawns) {
            if (this.isPositionSafe(spawn.x, spawn.y, width, height)) {
                return { x: spawn.x, y: spawn.y };
            }
        }
        
        // 如果没有安全的预设生成点，寻找随机位置
        return this.findRandomSafePosition(width, height);
    }

    /**
     * 检查位置是否安全
     */
    isPositionSafe(x, y, width, height) {
        // 检查边界
        if (!this.isRectInBounds(x, y, width, height)) {
            return false;
        }
        
        // 检查碰撞
        const collisions = this.getCollisionsAt(x, y, width, height);
        return collisions.length === 0;
    }

    /**
     * 寻找随机安全位置
     */
    findRandomSafePosition(width, height, maxAttempts = 50) {
        for (let i = 0; i < maxAttempts; i++) {
            const x = Math.random() * (this.width - width);
            const y = Math.random() * (this.height - height);
            
            if (this.isPositionSafe(x, y, width, height)) {
                return { x, y };
            }
        }
        
        // 如果找不到安全位置，返回中心位置
        return {
            x: this.width / 2 - width / 2,
            y: this.height / 2 - height / 2
        };
    }

    /**
     * 破坏墙壁
     */
    destroyWall(wall, damage) {
        if (!wall.destructible) return false;
        
        wall.health -= damage;
        
        if (wall.health <= 0) {
            // 从可破坏墙壁列表中移除
            const index = this.destructibleWalls.indexOf(wall);
            if (index !== -1) {
                this.destructibleWalls.splice(index, 1);
            }
            
            // 更新碰撞网格
            this.updateCollisionGrid();
            
            // 创建破坏效果
            this.createDestructionEffect(wall);
            
            // 可能生成道具
            if (Math.random() < 0.3) {
                this.emit('spawnPowerUp', {
                    x: wall.x + wall.width / 2,
                    y: wall.y + wall.height / 2
                });
            }
            
            this.emit('wallDestroyed', { wall });
            return true;
        }
        
        this.emit('wallDamaged', { wall, damage });
        return false;
    }

    /**
     * 创建破坏效果
     */
    createDestructionEffect(wall) {
        // 创建碎片粒子
        const particleCount = 8;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: wall.x + Math.random() * wall.width,
                y: wall.y + Math.random() * wall.height,
                velocityX: (Math.random() - 0.5) * 100,
                velocityY: (Math.random() - 0.5) * 100 - 20,
                life: 1 + Math.random(),
                size: 2 + Math.random() * 4,
                color: this.getWallMaterialColor(wall.material)
            });
        }
        
        this.emit('createParticles', { particles });
    }

    /**
     * 获取墙壁材质颜色
     */
    getWallMaterialColor(material) {
        switch (material) {
            case 'brick': return '#cc4444';
            case 'concrete': return '#888888';
            case 'metal': return '#666666';
            case 'wood': return '#8B4513';
            default: return '#999999';
        }
    }

    /**
     * 设置天气
     */
    setWeather(type, intensity = 0.5) {
        this.weather.type = type;
        this.weather.intensity = intensity;
        this.weather.particles = [];
        
        if (type !== 'none') {
            this.createWeatherParticles();
        }
        
        this.emit('weatherChanged', { type, intensity });
    }

    /**
     * 创建天气粒子
     */
    createWeatherParticles() {
        const particleCount = Math.floor(50 * this.weather.intensity);
        
        for (let i = 0; i < particleCount; i++) {
            let particle;
            
            switch (this.weather.type) {
                case 'rain':
                    particle = this.createRainParticle();
                    break;
                case 'snow':
                    particle = this.createSnowParticle();
                    break;
                case 'sandstorm':
                    particle = this.createSandParticle();
                    break;
            }
            
            if (particle) {
                this.weather.particles.push(particle);
            }
        }
    }

    /**
     * 创建雨滴粒子
     */
    createRainParticle() {
        return {
            x: Math.random() * this.width,
            y: -10,
            velocityX: -20 * this.weather.intensity,
            velocityY: 200 * this.weather.intensity,
            size: 1,
            alpha: 0.6,
            color: '#4488ff'
        };
    }

    /**
     * 创建雪花粒子
     */
    createSnowParticle() {
        return {
            x: Math.random() * this.width,
            y: -10,
            velocityX: (Math.random() - 0.5) * 20,
            velocityY: 50 * this.weather.intensity,
            size: 2 + Math.random() * 3,
            alpha: 0.8,
            color: '#ffffff'
        };
    }

    /**
     * 创建沙尘粒子
     */
    createSandParticle() {
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            velocityX: 100 * this.weather.intensity,
            velocityY: (Math.random() - 0.5) * 20,
            size: 1 + Math.random() * 2,
            alpha: 0.3,
            color: '#DEB887'
        };
    }

    /**
     * 更新地图
     */
    update(deltaTime) {
        // 更新移动平台
        this.updateMovingPlatforms(deltaTime);
        
        // 更新天气效果
        this.updateWeather(deltaTime);
        
        // 更新危险区域
        this.updateHazards(deltaTime);
        
        // 更新传送门
        this.updateTeleporters(deltaTime);
    }

    /**
     * 更新移动平台
     */
    updateMovingPlatforms(deltaTime) {
        for (const platform of this.movingPlatforms) {
            if (platform.waypoints.length < 2) continue;
            
            const currentWaypoint = platform.waypoints[platform.currentWaypoint];
            const distance = Math.sqrt(
                Math.pow(currentWaypoint.x - platform.x, 2) + 
                Math.pow(currentWaypoint.y - platform.y, 2)
            );
            
            if (distance < 5) {
                // 到达路径点，选择下一个
                platform.currentWaypoint = (platform.currentWaypoint + 1) % platform.waypoints.length;
            } else {
                // 移动向目标
                const angle = Math.atan2(currentWaypoint.y - platform.y, currentWaypoint.x - platform.x);
                const moveDistance = platform.speed * deltaTime;
                
                platform.x += Math.cos(angle) * moveDistance;
                platform.y += Math.sin(angle) * moveDistance;
                
                // 移动乘客
                for (const passenger of platform.passengers) {
                    passenger.x += Math.cos(angle) * moveDistance;
                    passenger.y += Math.sin(angle) * moveDistance;
                }
            }
        }
    }

    /**
     * 更新天气效果
     */
    updateWeather(deltaTime) {
        if (this.weather.type === 'none') return;
        
        for (let i = this.weather.particles.length - 1; i >= 0; i--) {
            const particle = this.weather.particles[i];
            
            particle.x += particle.velocityX * deltaTime;
            particle.y += particle.velocityY * deltaTime;
            
            // 移除超出边界的粒子
            if (particle.x < -10 || particle.x > this.width + 10 || 
                particle.y < -10 || particle.y > this.height + 10) {
                this.weather.particles.splice(i, 1);
            }
        }
        
        // 补充粒子
        if (this.weather.particles.length < 50 * this.weather.intensity) {
            this.createWeatherParticles();
        }
    }

    /**
     * 更新危险区域
     */
    updateHazards(deltaTime) {
        const currentTime = Date.now() / 1000;
        
        for (const hazard of this.hazards) {
            if (currentTime - hazard.lastDamage >= hazard.interval) {
                this.emit('hazardDamage', { hazard });
                hazard.lastDamage = currentTime;
            }
        }
    }

    /**
     * 更新传送门
     */
    updateTeleporters(deltaTime) {
        // 传送门冷却时间更新在使用时处理
    }

    /**
     * 使用传送门
     */
    useTeleporter(teleporter, user) {
        const currentTime = Date.now() / 1000;
        
        if (currentTime - teleporter.lastUsed < teleporter.cooldown) {
            return false; // 冷却中
        }
        
        teleporter.lastUsed = currentTime;
        
        // 传送用户
        user.x = teleporter.targetX;
        user.y = teleporter.targetY;
        
        this.emit('teleporterUsed', { teleporter, user });
        return true;
    }

    /**
     * 渲染地图
     */
    render(context, camera) {
        // 渲染背景
        this.renderBackground(context, camera);
        
        // 渲染瓦片
        this.renderTiles(context, camera);
        
        // 渲染障碍物
        this.renderObstacles(context, camera);
        
        // 渲染可破坏墙壁
        this.renderDestructibleWalls(context, camera);
        
        // 渲染移动平台
        this.renderMovingPlatforms(context, camera);
        
        // 渲染传送门
        this.renderTeleporters(context, camera);
        
        // 渲染危险区域
        this.renderHazards(context, camera);
        
        // 渲染天气效果
        this.renderWeather(context, camera);
        
        // 渲染边界
        this.renderBoundaries(context, camera);
    }

    /**
     * 渲染背景
     */
    renderBackground(context, camera) {
        context.save();
        
        // 根据主题设置背景色
        switch (this.theme) {
            case 'desert':
                context.fillStyle = '#F4A460';
                break;
            case 'forest':
                context.fillStyle = '#228B22';
                break;
            case 'urban':
                context.fillStyle = '#696969';
                break;
            case 'snow':
                context.fillStyle = '#F0F8FF';
                break;
            default:
                context.fillStyle = '#87CEEB';
        }
        
        context.fillRect(-camera.x, -camera.y, this.width, this.height);
        
        context.restore();
    }

    /**
     * 渲染瓦片
     */
    renderTiles(context, camera) {
        const startX = Math.floor(camera.x / this.tileSize);
        const endX = Math.ceil((camera.x + camera.width) / this.tileSize);
        const startY = Math.floor(camera.y / this.tileSize);
        const endY = Math.ceil((camera.y + camera.height) / this.tileSize);
        
        for (let y = Math.max(0, startY); y < Math.min(this.tilesY, endY); y++) {
            for (let x = Math.max(0, startX); x < Math.min(this.tilesX, endX); x++) {
                const tile = this.tiles[y][x];
                if (tile.type !== 'ground') {
                    this.renderTile(context, tile, x * this.tileSize - camera.x, y * this.tileSize - camera.y);
                }
            }
        }
    }

    /**
     * 渲染单个瓦片
     */
    renderTile(context, tile, x, y) {
        context.save();
        
        switch (tile.type) {
            case 'wall':
                context.fillStyle = '#8B4513';
                break;
            case 'water':
                context.fillStyle = '#4169E1';
                break;
            case 'lava':
                context.fillStyle = '#FF4500';
                break;
            default:
                context.fillStyle = '#D2B48C';
        }
        
        context.fillRect(x, y, this.tileSize, this.tileSize);
        
        if (tile.solid) {
            context.strokeStyle = '#000000';
            context.lineWidth = 1;
            context.strokeRect(x, y, this.tileSize, this.tileSize);
        }
        
        context.restore();
    }

    /**
     * 渲染障碍物
     */
    renderObstacles(context, camera) {
        for (const obstacle of this.obstacles) {
            if (this.isInView(obstacle, camera)) {
                this.renderObstacle(context, obstacle, camera);
            }
        }
    }

    /**
     * 渲染可破坏墙壁
     */
    renderDestructibleWalls(context, camera) {
        for (const wall of this.destructibleWalls) {
            if (wall.health > 0 && this.isInView(wall, camera)) {
                this.renderDestructibleWall(context, wall, camera);
            }
        }
    }

    /**
     * 渲染障碍物
     */
    renderObstacle(context, obstacle, camera) {
        context.save();
        
        context.fillStyle = this.getObstacleColor(obstacle.type);
        context.fillRect(
            obstacle.x - camera.x,
            obstacle.y - camera.y,
            obstacle.width,
            obstacle.height
        );
        
        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        context.strokeRect(
            obstacle.x - camera.x,
            obstacle.y - camera.y,
            obstacle.width,
            obstacle.height
        );
        
        context.restore();
    }

    /**
     * 渲染可破坏墙壁
     */
    renderDestructibleWall(context, wall, camera) {
        context.save();
        
        const healthRatio = wall.health / wall.maxHealth;
        const alpha = 0.5 + 0.5 * healthRatio;
        
        context.globalAlpha = alpha;
        context.fillStyle = this.getWallMaterialColor(wall.material);
        context.fillRect(
            wall.x - camera.x,
            wall.y - camera.y,
            wall.width,
            wall.height
        );
        
        // 显示裂纹效果
        if (healthRatio < 0.7) {
            this.renderCracks(context, wall, camera, 1 - healthRatio);
        }
        
        context.restore();
    }

    /**
     * 渲染裂纹
     */
    renderCracks(context, wall, camera, intensity) {
        context.save();
        context.strokeStyle = '#000000';
        context.lineWidth = Math.floor(intensity * 3) + 1;
        context.globalAlpha = intensity;
        
        const crackCount = Math.floor(intensity * 5);
        for (let i = 0; i < crackCount; i++) {
            context.beginPath();
            context.moveTo(
                wall.x - camera.x + Math.random() * wall.width,
                wall.y - camera.y + Math.random() * wall.height
            );
            context.lineTo(
                wall.x - camera.x + Math.random() * wall.width,
                wall.y - camera.y + Math.random() * wall.height
            );
            context.stroke();
        }
        
        context.restore();
    }

    /**
     * 渲染移动平台
     */
    renderMovingPlatforms(context, camera) {
        for (const platform of this.movingPlatforms) {
            if (this.isInView(platform, camera)) {
                context.save();
                
                context.fillStyle = '#654321';
                context.fillRect(
                    platform.x - camera.x,
                    platform.y - camera.y,
                    platform.width,
                    platform.height
                );
                
                context.strokeStyle = '#000000';
                context.lineWidth = 2;
                context.strokeRect(
                    platform.x - camera.x,
                    platform.y - camera.y,
                    platform.width,
                    platform.height
                );
                
                context.restore();
            }
        }
    }

    /**
     * 渲染传送门
     */
    renderTeleporters(context, camera) {
        for (const teleporter of this.teleporters) {
            if (this.isInView(teleporter, camera)) {
                context.save();
                
                // 创建传送门效果
                const gradient = context.createRadialGradient(
                    teleporter.x + teleporter.width / 2 - camera.x,
                    teleporter.y + teleporter.height / 2 - camera.y,
                    0,
                    teleporter.x + teleporter.width / 2 - camera.x,
                    teleporter.y + teleporter.height / 2 - camera.y,
                    teleporter.width / 2
                );
                gradient.addColorStop(0, '#00ffff');
                gradient.addColorStop(1, 'transparent');
                
                context.fillStyle = gradient;
                context.fillRect(
                    teleporter.x - camera.x,
                    teleporter.y - camera.y,
                    teleporter.width,
                    teleporter.height
                );
                
                context.restore();
            }
        }
    }

    /**
     * 渲染危险区域
     */
    renderHazards(context, camera) {
        for (const hazard of this.hazards) {
            if (this.isInView(hazard, camera)) {
                context.save();
                
                context.fillStyle = this.getHazardColor(hazard.type);
                context.globalAlpha = 0.3;
                context.fillRect(
                    hazard.x - camera.x,
                    hazard.y - camera.y,
                    hazard.width,
                    hazard.height
                );
                
                context.restore();
            }
        }
    }

    /**
     * 渲染天气效果
     */
    renderWeather(context, camera) {
        if (this.weather.type === 'none') return;
        
        for (const particle of this.weather.particles) {
            context.save();
            context.globalAlpha = particle.alpha;
            context.fillStyle = particle.color;
            
            context.beginPath();
            context.arc(
                particle.x - camera.x,
                particle.y - camera.y,
                particle.size,
                0,
                Math.PI * 2
            );
            context.fill();
            
            context.restore();
        }
    }

    /**
     * 渲染边界
     */
    renderBoundaries(context, camera) {
        context.save();
        context.fillStyle = '#444444';
        
        for (const wall of this.boundaries.walls) {
            context.fillRect(
                wall.x - camera.x,
                wall.y - camera.y,
                wall.width,
                wall.height
            );
        }
        
        context.restore();
    }

    /**
     * 检查对象是否在视图内
     */
    isInView(obj, camera) {
        return obj.x < camera.x + camera.width &&
               obj.x + obj.width > camera.x &&
               obj.y < camera.y + camera.height &&
               obj.y + obj.height > camera.y;
    }

    /**
     * 获取障碍物颜色
     */
    getObstacleColor(type) {
        switch (type) {
            case 'wall': return '#8B4513';
            case 'rock': return '#696969';
            case 'tree': return '#228B22';
            case 'building': return '#CD853F';
            default: return '#888888';
        }
    }

    /**
     * 获取危险区域颜色
     */
    getHazardColor(type) {
        switch (type) {
            case 'damage': return '#ff0000';
            case 'slow': return '#0000ff';
            case 'poison': return '#00ff00';
            default: return '#ff0000';
        }
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return 'obj_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 获取地图数据
     */
    getMapData() {
        return {
            width: this.width,
            height: this.height,
            type: this.mapType,
            theme: this.theme,
            tiles: this.tiles,
            obstacles: this.obstacles,
            destructibleWalls: this.destructibleWalls,
            spawns: {
                players: this.playerSpawns,
                enemies: this.enemySpawns,
                powerUps: this.powerUpSpawns
            },
            special: {
                movingPlatforms: this.movingPlatforms,
                teleporters: this.teleporters,
                hazards: this.hazards,
                weather: {
                    type: this.weather.type,
                    intensity: this.weather.intensity
                }
            }
        };
    }
}







