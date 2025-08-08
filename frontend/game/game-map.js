


/**
 * 游戏地图类
 */
class GameMap {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tileSize = 32;
        this.cols = Math.floor(width / this.tileSize);
        this.rows = Math.floor(height / this.tileSize);
        
        // 地图数据 0: 空地, 1: 墙壁, 2: 钢墙, 3: 草地
        this.tiles = [];
        this.obstacles = [];
        
        this.generateMap();
    }

    /**
     * 生成地图
     */
    generateMap() {
        // 初始化空地图
        for (let row = 0; row < this.rows; row++) {
            this.tiles[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.tiles[row][col] = 0; // 空地
            }
        }
        
        // 生成边界墙
        this.generateBorderWalls();
        
        // 生成随机障碍物
        this.generateRandomObstacles();
        
        // 生成对称障碍物
        this.generateSymmetricObstacles();
        
        // 更新障碍物列表
        this.updateObstacleList();
    }

    /**
     * 生成边界墙
     */
    generateBorderWalls() {
        // 上下边界
        for (let col = 0; col < this.cols; col++) {
            if (this.rows > 0) this.tiles[0][col] = 2; // 钢墙
            if (this.rows > 1) this.tiles[this.rows - 1][col] = 2;
        }
        
        // 左右边界
        for (let row = 0; row < this.rows; row++) {
            if (this.cols > 0) this.tiles[row][0] = 2; // 钢墙
            if (this.cols > 1) this.tiles[row][this.cols - 1] = 2;
        }
    }

    /**
     * 生成随机障碍物
     */
    generateRandomObstacles() {
        const obstacleCount = Math.floor((this.cols * this.rows) * 0.15);
        
        for (let i = 0; i < obstacleCount; i++) {
            const row = Math.floor(Math.random() * (this.rows - 4)) + 2;
            const col = Math.floor(Math.random() * (this.cols - 4)) + 2;
            
            // 避免在玩家和敌人出生点附近放置障碍物
            if (this.isSpawnArea(row, col)) continue;
            
            // 随机选择障碍物类型
            const obstacleType = Math.random() < 0.7 ? 1 : 2; // 70%概率是普通墙，30%是钢墙
            this.tiles[row][col] = obstacleType;
        }
    }

    /**
     * 生成对称障碍物
     */
    generateSymmetricObstacles() {
        const patterns = [
            // 十字形
            [
                [0, 1, 0],
                [1, 1, 1],
                [0, 1, 0]
            ],
            // L形
            [
                [1, 0],
                [1, 1]
            ],
            // 直线
            [
                [1, 1, 1]
            ]
        ];
        
        const patternCount = 5;
        for (let i = 0; i < patternCount; i++) {
            const pattern = patterns[Math.floor(Math.random() * patterns.length)];
            const startRow = Math.floor(Math.random() * (this.rows - pattern.length - 2)) + 1;
            const startCol = Math.floor(Math.random() * (this.cols - pattern[0].length - 2)) + 1;
            
            // 检查是否与出生点冲突
            if (this.isPatternInSpawnArea(startRow, startCol, pattern)) continue;
            
            // 放置图案
            this.placePattern(startRow, startCol, pattern, 1);
        }
    }

    /**
     * 放置图案
     */
    placePattern(startRow, startCol, pattern, tileType) {
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col] === 1) {
                    const mapRow = startRow + row;
                    const mapCol = startCol + col;
                    if (mapRow < this.rows && mapCol < this.cols) {
                        this.tiles[mapRow][mapCol] = tileType;
                    }
                }
            }
        }
    }

    /**
     * 检查是否在出生区域
     */
    isSpawnArea(row, col) {
        // 玩家出生区域（左下角）
        if (row >= this.rows - 4 && col <= 3) return true;
        
        // 敌人出生区域（右上角）
        if (row <= 3 && col >= this.cols - 4) return true;
        
        return false;
    }

    /**
     * 检查图案是否与出生区域冲突
     */
    isPatternInSpawnArea(startRow, startCol, pattern) {
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col] === 1) {
                    const mapRow = startRow + row;
                    const mapCol = startCol + col;
                    if (this.isSpawnArea(mapRow, mapCol)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * 更新障碍物列表
     */
    updateObstacleList() {
        this.obstacles = [];
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.tiles[row][col] > 0) {
                    this.obstacles.push({
                        x: col * this.tileSize,
                        y: row * this.tileSize,
                        width: this.tileSize,
                        height: this.tileSize,
                        type: this.tiles[row][col],
                        row: row,
                        col: col
                    });
                }
            }
        }
    }

    /**
     * 渲染地图
     */
    render(ctx) {
        // 绘制背景
        ctx.fillStyle = '#34495e';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // 绘制网格（可选）
        this.renderGrid(ctx);
        
        // 绘制障碍物
        this.renderObstacles(ctx);
    }

    /**
     * 渲染网格
     */
    renderGrid(ctx) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        // 垂直线
        for (let col = 0; col <= this.cols; col++) {
            const x = col * this.tileSize;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        
        // 水平线
        for (let row = 0; row <= this.rows; row++) {
            const y = row * this.tileSize;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
    }

    /**
     * 渲染障碍物
     */
    renderObstacles(ctx) {
        this.obstacles.forEach(obstacle => {
            this.renderObstacle(ctx, obstacle);
        });
    }

    /**
     * 渲染单个障碍物
     */
    renderObstacle(ctx, obstacle) {
        ctx.save();
        
        switch (obstacle.type) {
            case 1: // 普通墙
                this.renderBrickWall(ctx, obstacle);
                break;
            case 2: // 钢墙
                this.renderSteelWall(ctx, obstacle);
                break;
            case 3: // 草地
                this.renderGrass(ctx, obstacle);
                break;
        }
        
        ctx.restore();
    }

    /**
     * 渲染砖墙
     */
    renderBrickWall(ctx, obstacle) {
        // 主体颜色
        ctx.fillStyle = '#d35400';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // 砖块纹理
        ctx.fillStyle = '#e67e22';
        const brickWidth = obstacle.width / 4;
        const brickHeight = obstacle.height / 4;
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if ((row + col) % 2 === 0) {
                    ctx.fillRect(
                        obstacle.x + col * brickWidth,
                        obstacle.y + row * brickHeight,
                        brickWidth - 1,
                        brickHeight - 1
                    );
                }
            }
        }
        
        // 边框
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 2;
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }

    /**
     * 渲染钢墙
     */
    renderSteelWall(ctx, obstacle) {
        // 主体颜色
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // 金属纹理
        const gradient = ctx.createLinearGradient(
            obstacle.x, obstacle.y,
            obstacle.x + obstacle.width, obstacle.y + obstacle.height
        );
        gradient.addColorStop(0, '#95a5a6');
        gradient.addColorStop(0.5, '#7f8c8d');
        gradient.addColorStop(1, '#34495e');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(obstacle.x + 2, obstacle.y + 2, obstacle.width - 4, obstacle.height - 4);
        
        // 高光
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(obstacle.x + 2, obstacle.y + 2, obstacle.width - 4, 4);
        ctx.fillRect(obstacle.x + 2, obstacle.y + 2, 4, obstacle.height - 4);
        
        // 边框
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }

    /**
     * 渲染草地
     */
    renderGrass(ctx, obstacle) {
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // 草的纹理
        ctx.fillStyle = '#2ecc71';
        for (let i = 0; i < 20; i++) {
            const x = obstacle.x + Math.random() * obstacle.width;
            const y = obstacle.y + Math.random() * obstacle.height;
            ctx.fillRect(x, y, 2, 4);
        }
    }

    /**
     * 检查碰撞
     */
    checkCollision(boundingBox) {
        return this.obstacles.some(obstacle => {
            return CollisionDetector.rectCollision(boundingBox, obstacle);
        });
    }

    /**
     * 获取指定位置的瓦片类型
     */
    getTileAt(x, y) {
        const col = Math.floor(x / this.tileSize);
        const row = Math.floor(y / this.tileSize);
        
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return this.tiles[row][col];
        }
        
        return -1; // 超出边界
    }

    /**
     * 销毁指定位置的瓦片
     */
    destroyTileAt(x, y) {
        const col = Math.floor(x / this.tileSize);
        const row = Math.floor(y / this.tileSize);
        
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            const tileType = this.tiles[row][col];
            
            // 只有普通墙可以被摧毁
            if (tileType === 1) {
                this.tiles[row][col] = 0;
                this.updateObstacleList();
                return true;
            }
        }
        
        return false;
    }

    /**
     * 获取玩家出生点
     */
    getPlayerSpawnPoint() {
        return new Vector2D(
            this.tileSize * 2,
            this.height - this.tileSize * 2
        );
    }

    /**
     * 获取敌人出生点
     */
    getEnemySpawnPoints() {
        return [
            new Vector2D(this.width - this.tileSize * 2, this.tileSize * 2),
            new Vector2D(this.width - this.tileSize * 4, this.tileSize * 2),
            new Vector2D(this.width - this.tileSize * 2, this.tileSize * 4)
        ];
    }

    /**
     * 检查位置是否可通行
     */
    isPassable(x, y, width, height) {
        // 检查四个角落
        const corners = [
            { x: x, y: y },
            { x: x + width, y: y },
            { x: x, y: y + height },
            { x: x + width, y: y + height }
        ];
        
        return corners.every(corner => {
            const tileType = this.getTileAt(corner.x, corner.y);
            return tileType === 0 || tileType === 3; // 空地或草地
        });
    }
}


