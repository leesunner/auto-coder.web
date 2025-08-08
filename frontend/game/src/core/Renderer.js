

/**
 * 渲染引擎类
 * 负责所有图形绘制和渲染相关功能
 */

/**
 * 渲染器类
 */
export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        
        // 渲染设置
        this.pixelRatio = window.devicePixelRatio || 1;
        this.smoothing = false;
        
        // 颜色常量
        this.colors = {
            background: '#000000',
            playerTank: '#00ff00',
            enemyTank: '#ff0000',
            bullet: '#ffff00',
            wall: '#8B4513',
            steelWall: '#C0C0C0',
            explosion: ['#ff0000', '#ff8800', '#ffff00'],
            ui: '#ffffff',
            scoreBoard: '#ffd700'
        };
        
        // 图像缓存
        this.imageCache = new Map();
        this.isImagesLoaded = false;
    }

    /**
     * 初始化渲染器
     */
    async init() {
        console.log('初始化渲染器...');
        
        // 设置画布分辨率
        this.setupCanvas();
        
        // 设置渲染上下文
        this.setupContext();
        
        // 加载图像资源
        await this.loadImages();
        
        console.log('渲染器初始化完成');
    }

    /**
     * 设置画布
     */
    setupCanvas() {
        // 设置画布大小适应设备像素比
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * this.pixelRatio;
        this.canvas.height = rect.height * this.pixelRatio;
        
        // 缩放上下文以匹配设备像素比
        this.context.scale(this.pixelRatio, this.pixelRatio);
        
        // 设置CSS大小
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    /**
     * 设置渲染上下文
     */
    setupContext() {
        // 禁用图像平滑以获得像素完美的渲染
        this.context.imageSmoothingEnabled = this.smoothing;
        this.context.webkitImageSmoothingEnabled = this.smoothing;
        this.context.mozImageSmoothingEnabled = this.smoothing;
        this.context.msImageSmoothingEnabled = this.smoothing;
        
        // 设置默认字体
        this.context.font = '16px Arial';
        this.context.textAlign = 'left';
        this.context.textBaseline = 'top';
    }

    /**
     * 加载图像资源
     */
    async loadImages() {
        console.log('加载图像资源...');
        
        // 由于这是一个简化版本，我们将使用程序化生成的图像
        // 在实际项目中，这里会加载真实的图像文件
        
        this.generateTankImages();
        this.generateBulletImages();
        this.generateWallImages();
        this.generateExplosionImages();
        
        this.isImagesLoaded = true;
        console.log('图像资源加载完成');
    }

    /**
     * 生成坦克图像
     */
    generateTankImages() {
        const tankSize = 32;
        
        // 玩家坦克
        const playerTankCanvas = document.createElement('canvas');
        playerTankCanvas.width = tankSize;
        playerTankCanvas.height = tankSize;
        const playerCtx = playerTankCanvas.getContext('2d');
        
        // 绘制玩家坦克
        playerCtx.fillStyle = this.colors.playerTank;
        playerCtx.fillRect(4, 8, 24, 16);
        playerCtx.fillRect(12, 4, 8, 8);
        playerCtx.fillRect(12, 20, 8, 8);
        playerCtx.fillRect(14, 0, 4, 32);
        
        this.imageCache.set('playerTank', playerTankCanvas);
        
        // 敌方坦克
        const enemyTankCanvas = document.createElement('canvas');
        enemyTankCanvas.width = tankSize;
        enemyTankCanvas.height = tankSize;
        const enemyCtx = enemyTankCanvas.getContext('2d');
        
        // 绘制敌方坦克
        enemyCtx.fillStyle = this.colors.enemyTank;
        enemyCtx.fillRect(4, 8, 24, 16);
        enemyCtx.fillRect(12, 4, 8, 8);
        enemyCtx.fillRect(12, 20, 8, 8);
        enemyCtx.fillRect(14, 0, 4, 32);
        
        this.imageCache.set('enemyTank', enemyTankCanvas);
    }

    /**
     * 生成子弹图像
     */
    generateBulletImages() {
        const bulletSize = 8;
        
        const bulletCanvas = document.createElement('canvas');
        bulletCanvas.width = bulletSize;
        bulletCanvas.height = bulletSize;
        const bulletCtx = bulletCanvas.getContext('2d');
        
        bulletCtx.fillStyle = this.colors.bullet;
        bulletCtx.fillRect(0, 0, bulletSize, bulletSize);
        
        this.imageCache.set('bullet', bulletCanvas);
    }

    /**
     * 生成墙体图像
     */
    generateWallImages() {
        const wallSize = 16;
        
        // 砖墙
        const brickWallCanvas = document.createElement('canvas');
        brickWallCanvas.width = wallSize;
        brickWallCanvas.height = wallSize;
        const brickCtx = brickWallCanvas.getContext('2d');
        
        brickCtx.fillStyle = this.colors.wall;
        brickCtx.fillRect(0, 0, wallSize, wallSize);
        brickCtx.strokeStyle = '#654321';
        brickCtx.lineWidth = 1;
        brickCtx.strokeRect(0, 0, wallSize, wallSize);
        brickCtx.strokeRect(0, wallSize/2, wallSize, wallSize/2);
        brickCtx.strokeRect(wallSize/2, 0, wallSize/2, wallSize/2);
        
        this.imageCache.set('brickWall', brickWallCanvas);
        
        // 钢墙
        const steelWallCanvas = document.createElement('canvas');
        steelWallCanvas.width = wallSize;
        steelWallCanvas.height = wallSize;
        const steelCtx = steelWallCanvas.getContext('2d');
        
        steelCtx.fillStyle = this.colors.steelWall;
        steelCtx.fillRect(0, 0, wallSize, wallSize);
        steelCtx.strokeStyle = '#808080';
        steelCtx.lineWidth = 2;
        steelCtx.strokeRect(0, 0, wallSize, wallSize);
        
        this.imageCache.set('steelWall', steelWallCanvas);
    }

    /**
     * 生成爆炸图像
     */
    generateExplosionImages() {
        const explosionSize = 48;
        
        for (let frame = 0; frame < 3; frame++) {
            const explosionCanvas = document.createElement('canvas');
            explosionCanvas.width = explosionSize;
            explosionCanvas.height = explosionSize;
            const explosionCtx = explosionCanvas.getContext('2d');
            
            const radius = (frame + 1) * 8;
            const gradient = explosionCtx.createRadialGradient(
                explosionSize/2, explosionSize/2, 0,
                explosionSize/2, explosionSize/2, radius
            );
            
            gradient.addColorStop(0, this.colors.explosion[0]);
            gradient.addColorStop(0.5, this.colors.explosion[1]);
            gradient.addColorStop(1, this.colors.explosion[2]);
            
            explosionCtx.fillStyle = gradient;
            explosionCtx.beginPath();
            explosionCtx.arc(explosionSize/2, explosionSize/2, radius, 0, Math.PI * 2);
            explosionCtx.fill();
            
            this.imageCache.set(`explosion${frame}`, explosionCanvas);
        }
    }

    /**
     * 清空画布
     */
    clear() {
        this.context.fillStyle = this.colors.background;
        this.context.fillRect(0, 0, this.canvas.width / this.pixelRatio, this.canvas.height / this.pixelRatio);
    }

    /**
     * 绘制矩形
     */
    drawRect(x, y, width, height, color) {
        this.context.fillStyle = color;
        this.context.fillRect(x, y, width, height);
    }

    /**
     * 绘制描边矩形
     */
    drawStrokeRect(x, y, width, height, color, lineWidth = 1) {
        this.context.strokeStyle = color;
        this.context.lineWidth = lineWidth;
        this.context.strokeRect(x, y, width, height);
    }

    /**
     * 绘制圆形
     */
    drawCircle(x, y, radius, color) {
        this.context.fillStyle = color;
        this.context.beginPath();
        this.context.arc(x, y, radius, 0, Math.PI * 2);
        this.context.fill();
    }

    /**
     * 绘制文本
     */
    drawText(text, x, y, color = this.colors.ui, font = '16px Arial') {
        this.context.fillStyle = color;
        this.context.font = font;
        this.context.fillText(text, x, y);
    }

    /**
     * 绘制居中文本
     */
    drawCenteredText(text, x, y, color = this.colors.ui, font = '16px Arial') {
        this.context.fillStyle = color;
        this.context.font = font;
        this.context.textAlign = 'center';
        this.context.fillText(text, x, y);
        this.context.textAlign = 'left'; // 重置对齐方式
    }

    /**
     * 绘制图像
     */
    drawImage(imageName, x, y, width = null, height = null, rotation = 0) {
        const image = this.imageCache.get(imageName);
        if (!image) {
            console.warn(`图像未找到: ${imageName}`);
            return;
        }

        this.context.save();
        
        // 如果有旋转，移动到图像中心进行旋转
        if (rotation !== 0) {
            const centerX = x + (width || image.width) / 2;
            const centerY = y + (height || image.height) / 2;
            this.context.translate(centerX, centerY);
            this.context.rotate(rotation);
            this.context.translate(-centerX, -centerY);
        }
        
        if (width !== null && height !== null) {
            this.context.drawImage(image, x, y, width, height);
        } else {
            this.context.drawImage(image, x, y);
        }
        
        this.context.restore();
    }

    /**
     * 绘制坦克
     */
    drawTank(tank) {
        const imageName = tank.isPlayer ? 'playerTank' : 'enemyTank';
        this.drawImage(imageName, tank.x, tank.y, tank.width, tank.height, tank.rotation);
        
        // 绘制生命值条（如果需要）
        if (tank.showHealthBar && tank.health < tank.maxHealth) {
            this.drawHealthBar(tank.x, tank.y - 8, tank.width, tank.health, tank.maxHealth);
        }
    }

    /**
     * 绘制子弹
     */
    drawBullet(bullet) {
        this.drawImage('bullet', bullet.x, bullet.y, bullet.width, bullet.height, bullet.rotation);
    }

    /**
     * 绘制爆炸
     */
    drawExplosion(explosion) {
        const frame = Math.floor(explosion.animationFrame);
        const imageName = `explosion${Math.min(frame, 2)}`;
        this.drawImage(imageName, explosion.x - 24, explosion.y - 24, 48, 48);
    }

    /**
     * 绘制墙体
     */
    drawWall(wall) {
        const imageName = wall.type === 'steel' ? 'steelWall' : 'brickWall';
        this.drawImage(imageName, wall.x, wall.y, wall.width, wall.height);
    }

    /**
     * 绘制生命值条
     */
    drawHealthBar(x, y, width, currentHealth, maxHealth) {
        const barHeight = 4;
        const healthPercent = currentHealth / maxHealth;
        
        // 背景
        this.drawRect(x, y, width, barHeight, '#333333');
        
        // 生命值
        const healthColor = healthPercent > 0.6 ? '#00ff00' : 
                           healthPercent > 0.3 ? '#ffff00' : '#ff0000';
        this.drawRect(x, y, width * healthPercent, barHeight, healthColor);
        
        // 边框
        this.drawStrokeRect(x, y, width, barHeight, '#ffffff', 1);
    }

    /**
     * 绘制游戏网格（调试用）
     */
    drawGrid(cellSize = 16) {
        this.context.strokeStyle = '#333333';
        this.context.lineWidth = 0.5;
        
        const width = this.canvas.width / this.pixelRatio;
        const height = this.canvas.height / this.pixelRatio;
        
        // 垂直线
        for (let x = 0; x <= width; x += cellSize) {
            this.context.beginPath();
            this.context.moveTo(x, 0);
            this.context.lineTo(x, height);
            this.context.stroke();
        }
        
        // 水平线
        for (let y = 0; y <= height; y += cellSize) {
            this.context.beginPath();
            this.context.moveTo(0, y);
            this.context.lineTo(width, y);
            this.context.stroke();
        }
    }

    /**
     * 绘制背景
     */
    drawBackground() {
        this.clear();
    }

    /**
     * 绘制UI覆盖层
     */
    drawUIOverlay(alpha = 0.7) {
        this.context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        this.context.fillRect(0, 0, this.canvas.width / this.pixelRatio, this.canvas.height / this.pixelRatio);
    }

    /**
     * 开始批量绘制（优化性能）
     */
    beginBatch() {
        this.context.save();
    }

    /**
     * 结束批量绘制
     */
    endBatch() {
        this.context.restore();
    }

    /**
     * 设置全局透明度
     */
    setGlobalAlpha(alpha) {
        this.context.globalAlpha = alpha;
    }

    /**
     * 重置全局透明度
     */
    resetGlobalAlpha() {
        this.context.globalAlpha = 1.0;
    }

    /**
     * 处理窗口大小改变
     */
    handleResize() {
        this.setupCanvas();
        console.log('渲染器已适应新的窗口大小');
    }

    /**
     * 获取画布尺寸
     */
    getCanvasSize() {
        return {
            width: this.canvas.width / this.pixelRatio,
            height: this.canvas.height / this.pixelRatio
        };
    }

    /**
     * 清理资源
     */
    cleanup() {
        // 清理图像缓存
        this.imageCache.clear();
        console.log('渲染器资源已清理');
    }
}


