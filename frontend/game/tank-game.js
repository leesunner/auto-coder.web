


/**
 * 坦克大战主游戏类
 */
class TankGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.engine = new GameEngine(canvas);
        this.inputManager = new InputManager();
        this.bulletManager = new BulletManager();
        
        // 游戏状态
        this.gameState = 'playing'; // 'playing', 'paused', 'gameOver'
        this.score = 0;
        this.level = 1;
        this.enemiesKilled = 0;
        this.enemiesPerLevel = 5;
        
        // 游戏对象
        this.gameMap = null;
        this.playerTank = null;
        this.enemyTanks = [];
        this.maxEnemies = 3;
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 3000; // 3秒
        
        // 特效
        this.explosions = [];
        this.particles = [];
        
        // UI元素
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        
        this.initialize();
    }

    /**
     * 初始化游戏
     */
    initialize() {
        // 创建地图
        this.gameMap = new GameMap(this.canvas.width, this.canvas.height);
        
        // 创建玩家坦克
        const playerSpawn = this.gameMap.getPlayerSpawnPoint();
        this.playerTank = new PlayerTank(playerSpawn.x, playerSpawn.y);
        
        // 设置游戏引擎回调
        this.engine.setUpdateCallback(this.update.bind(this));
        this.engine.setRenderCallback(this.render.bind(this));
        
        // 绑定重启键
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyR') {
                this.restart();
            }
        });
        
        // 初始化敌人
        this.spawnEnemies();
        
        // 更新UI
        this.updateUI();
    }

    /**
     * 启动游戏
     */
    start() {
        this.engine.start();
    }

    /**
     * 游戏主更新循环
     */
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // 更新玩家坦克
        this.updatePlayer(deltaTime);
        
        // 更新敌人坦克
        this.updateEnemies(deltaTime);
        
        // 更新子弹
        this.bulletManager.update(deltaTime, this.canvas.width, this.canvas.height);
        
        // 更新特效
        this.updateEffects(deltaTime);
        
        // 检查碰撞
        this.checkCollisions();
        
        // 生成敌人
        this.updateEnemySpawning(deltaTime);
        
        // 检查游戏状态
        this.checkGameState();
        
        // 更新UI
        this.updateUI();
    }

    /**
     * 更新玩家
     */
    updatePlayer(deltaTime) {
        if (!this.playerTank.active) return;
        
        // 处理输入
        this.playerTank.handleInput(this.inputManager, this.bulletManager);
        
        // 更新位置
        this.playerTank.update(deltaTime);
        
        // 检查边界碰撞
        this.playerTank.checkBoundaryCollision(this.canvas.width, this.canvas.height);
        
        // 检查地图碰撞
        this.checkMapCollision(this.playerTank);
    }

    /**
     * 更新敌人
     */
    updateEnemies(deltaTime) {
        this.enemyTanks.forEach(enemy => {
            if (!enemy.active) return;
            
            // AI更新
            enemy.updateAI(deltaTime, this.playerTank, this.bulletManager);
            
            // 更新位置
            enemy.update(deltaTime);
            
            // 检查边界碰撞
            enemy.checkBoundaryCollision(this.canvas.width, this.canvas.height);
            
            // 检查地图碰撞
            this.checkMapCollision(enemy);
        });
        
        // 移除死亡的敌人
        this.enemyTanks = this.enemyTanks.filter(enemy => enemy.active);
    }

    /**
     * 检查地图碰撞
     */
    checkMapCollision(tank) {
        const boundingBox = tank.getBoundingBox();
        
        if (this.gameMap.checkCollision(boundingBox)) {
            // 回退到之前的位置
            tank.position.x -= tank.velocity.x * (1/60); // 假设60FPS
            tank.position.y -= tank.velocity.y * (1/60);
        }
    }

    /**
     * 更新特效
     */
    updateEffects(deltaTime) {
        // 更新爆炸效果
        this.explosions.forEach(explosion => {
            explosion.update(deltaTime);
        });
        this.explosions = this.explosions.filter(explosion => explosion.active);
        
        // 更新粒子效果
        this.particles.forEach(particle => {
            particle.update(deltaTime);
        });
        this.particles = this.particles.filter(particle => particle.active);
    }

    /**
     * 检查碰撞
     */
    checkCollisions() {
        // 子弹与坦克碰撞
        this.checkBulletTankCollisions();
        
        // 子弹与地图碰撞
        this.checkBulletMapCollisions();
        
        // 坦克与坦克碰撞
        this.checkTankTankCollisions();
    }

    /**
     * 检查子弹与坦克碰撞
     */
    checkBulletTankCollisions() {
        const bullets = this.bulletManager.getActiveBullets();
        
        bullets.forEach(bullet => {
            // 玩家子弹击中敌人
            if (bullet.owner === 'player') {
                this.enemyTanks.forEach(enemy => {
                    if (bullet.checkCollision(enemy)) {
                        this.handleEnemyHit(enemy, bullet);
                    }
                });
            }
            // 敌人子弹击中玩家
            else if (bullet.owner === 'enemy') {
                if (this.playerTank.active && bullet.checkCollision(this.playerTank)) {
                    this.handlePlayerHit(bullet);
                }
            }
        });
    }

    /**
     * 检查子弹与地图碰撞
     */
    checkBulletMapCollisions() {
        const bullets = this.bulletManager.getActiveBullets();
        
        bullets.forEach(bullet => {
            const bulletBox = bullet.getBoundingBox();
            
            if (this.gameMap.checkCollision(bulletBox)) {
                // 尝试摧毁墙壁
                const destroyed = this.gameMap.destroyTileAt(
                    bullet.position.x,
                    bullet.position.y
                );
                
                // 创建爆炸效果
                this.createExplosion(bullet.position.x, bullet.position.y, 'small');
                
                // 销毁子弹
                this.bulletManager.removeBullet(bullet);
            }
        });
    }

    /**
     * 检查坦克与坦克碰撞
     */
    checkTankTankCollisions() {
        if (!this.playerTank.active) return;
        
        this.enemyTanks.forEach(enemy => {
            if (!enemy.active) return;
            
            const playerBox = this.playerTank.getBoundingBox();
            const enemyBox = enemy.getBoundingBox();
            
            if (CollisionDetector.rectCollision(playerBox, enemyBox)) {
                // 推开坦克
                this.separateTanks(this.playerTank, enemy);
            }
        });
    }

    /**
     * 分离碰撞的坦克
     */
    separateTanks(tank1, tank2) {
        const dx = tank1.position.x - tank2.position.x;
        const dy = tank1.position.y - tank2.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const overlap = (tank1.width + tank2.width) / 2 - distance;
            if (overlap > 0) {
                const separationX = (dx / distance) * overlap * 0.5;
                const separationY = (dy / distance) * overlap * 0.5;
                
                tank1.position.x += separationX;
                tank1.position.y += separationY;
                tank2.position.x -= separationX;
                tank2.position.y -= separationY;
            }
        }
    }

    /**
     * 处理敌人被击中
     */
    handleEnemyHit(enemy, bullet) {
        enemy.takeDamage();
        this.bulletManager.removeBullet(bullet);
        
        // 创建爆炸效果
        this.createExplosion(enemy.position.x, enemy.position.y, 'medium');
        
        if (!enemy.active) {
            // 敌人被摧毁
            this.score += enemy.getKillScore();
            this.enemiesKilled++;
            
            // 创建大爆炸
            this.createExplosion(enemy.position.x, enemy.position.y, 'large');
        }
    }

    /**
     * 处理玩家被击中
     */
    handlePlayerHit(bullet) {
        this.playerTank.takeDamage();
        this.bulletManager.removeBullet(bullet);
        
        // 创建爆炸效果
        this.createExplosion(this.playerTank.position.x, this.playerTank.position.y, 'medium');
        
        if (!this.playerTank.active) {
            // 玩家死亡
            this.createExplosion(this.playerTank.position.x, this.playerTank.position.y, 'large');
            this.gameState = 'gameOver';
        }
    }

    /**
     * 创建爆炸效果
     */
    createExplosion(x, y, size) {
        const explosion = new Explosion(x, y, size);
        this.explosions.push(explosion);
        
        // 创建粒子效果
        this.createParticles(x, y, size);
    }

    /**
     * 创建粒子效果
     */
    createParticles(x, y, size) {
        const particleCount = size === 'large' ? 15 : size === 'medium' ? 10 : 5;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = new Particle(x, y);
            this.particles.push(particle);
        }
    }

    /**
     * 更新敌人生成
     */
    updateEnemySpawning(deltaTime) {
        if (this.enemyTanks.length >= this.maxEnemies) return;
        if (this.enemiesKilled >= this.enemiesPerLevel) return;
        
        this.enemySpawnTimer += deltaTime;
        
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }
    }

    /**
     * 生成敌人
     */
    spawnEnemies() {
        const spawnPoints = this.gameMap.getEnemySpawnPoints();
        const enemiesToSpawn = Math.min(this.maxEnemies, this.enemiesPerLevel - this.enemiesKilled);
        
        for (let i = 0; i < enemiesToSpawn && i < spawnPoints.length; i++) {
            const spawnPoint = spawnPoints[i];
            const difficulty = Math.min(this.level, 3);
            const enemy = new EnemyTank(spawnPoint.x, spawnPoint.y, difficulty);
            this.enemyTanks.push(enemy);
        }
    }

    /**
     * 生成单个敌人
     */
    spawnEnemy() {
        const spawnPoints = this.gameMap.getEnemySpawnPoints();
        const spawnPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
        const difficulty = Math.min(this.level, 3);
        const enemy = new EnemyTank(spawnPoint.x, spawnPoint.y, difficulty);
        this.enemyTanks.push(enemy);
    }

    /**
     * 检查游戏状态
     */
    checkGameState() {
        // 检查是否完成关卡
        if (this.enemiesKilled >= this.enemiesPerLevel && this.enemyTanks.length === 0) {
            this.nextLevel();
        }
        
        // 检查游戏结束
        if (!this.playerTank.active) {
            this.gameState = 'gameOver';
            this.showGameOver();
        }
    }

    /**
     * 下一关
     */
    nextLevel() {
        this.level++;
        this.enemiesKilled = 0;
        this.enemiesPerLevel += 2;
        this.maxEnemies = Math.min(5, this.maxEnemies + 1);
        
        // 恢复玩家生命值
        this.playerTank.health = Math.min(this.playerTank.maxHealth, this.playerTank.health + 1);
        
        // 清空子弹
        this.bulletManager.clear();
        
        // 重新生成地图
        this.gameMap.generateMap();
        
        // 重置玩家位置
        const playerSpawn = this.gameMap.getPlayerSpawnPoint();
        this.playerTank.position = playerSpawn.clone();
        
        // 生成新敌人
        this.spawnEnemies();
    }

    /**
     * 显示游戏结束
     */
    showGameOver() {
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.classList.remove('hidden');
    }

    /**
     * 更新UI
     */
    updateUI() {
        this.scoreElement.textContent = this.score;
        this.livesElement.textContent = this.playerTank.active ? this.playerTank.health : 0;
    }

    /**
     * 游戏渲染
     */
    render(ctx) {
        // 清空画布
        this.engine.clearCanvas();
        
        // 渲染地图
        this.gameMap.render(ctx);
        
        // 渲染玩家坦克
        if (this.playerTank.active) {
            this.playerTank.render(ctx);
        }
        
        // 渲染敌人坦克
        this.enemyTanks.forEach(enemy => {
            enemy.render(ctx);
        });
        
        // 渲染子弹
        this.bulletManager.render(ctx);
        
        // 渲染特效
        this.renderEffects(ctx);
        
        // 渲染UI信息
        this.renderGameInfo(ctx);
    }

    /**
     * 渲染特效
     */
    renderEffects(ctx) {
        // 渲染爆炸
        this.explosions.forEach(explosion => {
            explosion.render(ctx);
        });
        
        // 渲染粒子
        this.particles.forEach(particle => {
            particle.render(ctx);
        });
    }

    /**
     * 渲染游戏信息
     */
    renderGameInfo(ctx) {
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        
        // 关卡信息
        ctx.fillText(`关卡: ${this.level}`, 10, 25);
        ctx.fillText(`敌人: ${this.enemiesKilled}/${this.enemiesPerLevel}`, 10, 45);
        
        ctx.restore();
    }

    /**
     * 重启游戏
     */
    restart() {
        // 重置游戏状态
        this.gameState = 'playing';
        this.score = 0;
        this.level = 1;
        this.enemiesKilled = 0;
        this.enemiesPerLevel = 5;
        this.maxEnemies = 3;
        
        // 清空游戏对象
        this.enemyTanks = [];
        this.explosions = [];
        this.particles = [];
        this.bulletManager.clear();
        
        // 隐藏游戏结束界面
        this.gameOverElement.classList.add('hidden');
        
        // 重新初始化
        this.initialize();
    }
}

/**
 * 爆炸效果类
 */
class Explosion {
    constructor(x, y, size) {
        this.position = new Vector2D(x, y);
        this.size = size;
        this.active = true;
        this.frame = 0;
        this.maxFrames = size === 'large' ? 20 : size === 'medium' ? 15 : 10;
        this.frameTime = 0;
        this.frameInterval = 50;
    }

    update(deltaTime) {
        this.frameTime += deltaTime;
        
        if (this.frameTime >= this.frameInterval) {
            this.frame++;
            this.frameTime = 0;
            
            if (this.frame >= this.maxFrames) {
                this.active = false;
            }
        }
    }

    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        const progress = this.frame / this.maxFrames;
        const alpha = 1 - progress;
        const radius = progress * (this.size === 'large' ? 40 : this.size === 'medium' ? 25 : 15);
        
        // 外圈
        const gradient = ctx.createRadialGradient(
            this.position.x, this.position.y, 0,
            this.position.x, this.position.y, radius
        );
        gradient.addColorStop(0, `rgba(255, 255, 0, ${alpha})`);
        gradient.addColorStop(0.4, `rgba(255, 100, 0, ${alpha})`);
        gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

/**
 * 粒子效果类
 */
class Particle {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200
        );
        this.life = 1.0;
        this.decay = Math.random() * 0.02 + 0.01;
        this.size = Math.random() * 4 + 2;
        this.active = true;
        this.color = {
            r: 255,
            g: Math.random() * 100 + 100,
            b: 0
        };
    }

    update(deltaTime) {
        const dt = deltaTime / 1000;
        
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
        
        this.velocity.y += 100 * dt; // 重力
        this.velocity.x *= 0.98; // 阻力
        this.velocity.y *= 0.98;
        
        this.life -= this.decay;
        
        if (this.life <= 0) {
            this.active = false;
        }
    }

    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        ctx.globalAlpha = this.life;
        ctx.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
        
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}


