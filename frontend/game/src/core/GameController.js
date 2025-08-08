








/**
 * 游戏控制器
 * 管理游戏逻辑、实体交互和游戏流程
 */

import { GameState } from '../states/GameStateManager.js';
import { Tank } from '../entities/Tank.js';
import { PlayerTank } from '../entities/PlayerTank.js';
import { EnemyTank } from '../entities/EnemyTank.js';
import { Bullet } from '../entities/Bullet.js';
import { Explosion } from '../entities/Explosion.js';
import { GameMap } from '../map/GameMap.js';
import { Vector2 } from '../utils/Vector2.js';

/**
 * 关卡配置
 */
const LEVEL_CONFIGS = [
    {
        level: 1,
        enemyCount: 5,
        enemyTypes: ['basic', 'basic', 'basic', 'fast', 'basic'],
        spawnDelay: 2000,
        mapType: 'basic'
    },
    {
        level: 2,
        enemyCount: 8,
        enemyTypes: ['basic', 'fast', 'basic', 'heavy', 'fast', 'basic', 'fast', 'basic'],
        spawnDelay: 1800,
        mapType: 'complex'
    },
    {
        level: 3,
        enemyCount: 10,
        enemyTypes: ['fast', 'heavy', 'fast', 'heavy', 'basic', 'fast', 'heavy', 'fast', 'basic', 'boss'],
        spawnDelay: 1500,
        mapType: 'fortress'
    }
];

/**
 * 游戏控制器类
 */
export class GameController {
    constructor(gameStateManager, audioManager) {
        this.gameStateManager = gameStateManager;
        this.audioManager = audioManager;
        
        // 游戏实体
        this.playerTank = null;
        this.enemies = [];
        this.bullets = [];
        this.explosions = [];
        this.powerUps = [];
        this.particles = [];
        
        // 游戏地图
        this.gameMap = null;
        
        // 游戏状态
        this.gameStarted = false;
        this.levelStartTime = 0;
        this.nextEnemySpawnTime = 0;
        this.enemiesSpawned = 0;
        this.currentLevelConfig = null;
        
        // 碰撞检测
        this.collisionQuadTree = null;
        
        // 性能统计
        this.frameCount = 0;
        this.lastFpsTime = 0;
        this.fps = 0;
        
        // 调试模式
        this.debugMode = false;
        
        // 监听状态变化
        this.gameStateManager.addStateChangeListener((newState, oldState) => {
            this.onStateChange(newState, oldState);
        });
    }

    /**
     * 状态变化处理
     */
    onStateChange(newState, oldState) {
        switch (newState) {
            case GameState.PLAYING:
                this.startGame();
                break;
            case GameState.PAUSED:
                this.pauseGame();
                break;
            case GameState.GAME_OVER:
            case GameState.VICTORY:
                this.endGame();
                break;
            case GameState.MENU:
                this.resetGame();
                break;
        }
    }

    /**
     * 开始游戏
     */
    startGame() {
        console.log('开始游戏');
        
        // 获取当前关卡配置
        const level = this.gameStateManager.gameData.level;
        this.currentLevelConfig = LEVEL_CONFIGS[level - 1] || LEVEL_CONFIGS[0];
        
        // 初始化地图
        this.initializeMap();
        
        // 创建玩家坦克
        this.createPlayerTank();
        
        // 重置游戏状态
        this.gameStarted = true;
        this.levelStartTime = Date.now();
        this.nextEnemySpawnTime = this.levelStartTime + this.currentLevelConfig.spawnDelay;
        this.enemiesSpawned = 0;
        
        // 清空实体列表
        this.enemies = [];
        this.bullets = [];
        this.explosions = [];
        this.powerUps = [];
        this.particles = [];
        
        // 更新游戏数据
        this.gameStateManager.gameData.totalEnemies = this.currentLevelConfig.enemyCount;
        this.gameStateManager.gameData.enemiesDestroyed = 0;
        
        // 播放背景音乐
        this.audioManager.playMusic('background');
    }

    /**
     * 暂停游戏
     */
    pauseGame() {
        console.log('游戏暂停');
        this.audioManager.pauseMusic();
    }

    /**
     * 结束游戏
     */
    endGame() {
        console.log('游戏结束');
        this.gameStarted = false;
        this.audioManager.stopMusic();
    }

    /**
     * 重置游戏
     */
    resetGame() {
        console.log('重置游戏');
        this.gameStarted = false;
        this.playerTank = null;
        this.enemies = [];
        this.bullets = [];
        this.explosions = [];
        this.powerUps = [];
        this.particles = [];
        this.gameMap = null;
    }

    /**
     * 初始化地图
     */
    initializeMap() {
        this.gameMap = new GameMap(800, 600);
        
        // 根据关卡类型生成地图
        switch (this.currentLevelConfig.mapType) {
            case 'basic':
                this.gameMap.generateBasicMap();
                break;
            case 'complex':
                this.gameMap.generateComplexMap();
                break;
            case 'fortress':
                this.gameMap.generateFortressMap();
                break;
            default:
                this.gameMap.generateRandomMap();
                break;
        }
    }

    /**
     * 创建玩家坦克
     */
    createPlayerTank() {
        const spawnPoint = this.gameMap.getPlayerSpawnPoint();
        this.playerTank = new PlayerTank(spawnPoint.x, spawnPoint.y);
        
        // 设置玩家坦克事件监听
        this.playerTank.onShoot = (bullet) => this.addBullet(bullet);
        this.playerTank.onDestroy = () => this.onPlayerDestroyed();
    }

    /**
     * 创建敌方坦克
     */
    createEnemyTank(type = 'basic') {
        const spawnPoint = this.gameMap.getEnemySpawnPoint();
        
        if (!spawnPoint) {
            console.warn('无法找到敌方坦克生成点');
            return null;
        }
        
        const enemy = new EnemyTank(spawnPoint.x, spawnPoint.y, type);
        
        // 设置敌方坦克事件监听
        enemy.onShoot = (bullet) => this.addBullet(bullet);
        enemy.onDestroy = () => this.onEnemyDestroyed(enemy);
        
        this.enemies.push(enemy);
        this.enemiesSpawned++;
        
        console.log(`生成敌方坦克: ${type}, 已生成: ${this.enemiesSpawned}/${this.currentLevelConfig.enemyCount}`);
        
        return enemy;
    }

    /**
     * 添加子弹
     */
    addBullet(bullet) {
        this.bullets.push(bullet);
        
        // 播放射击音效
        this.audioManager.playSound('shoot');
    }

    /**
     * 添加爆炸效果
     */
    addExplosion(x, y, size = 'medium') {
        const explosion = new Explosion(x, y, size);
        this.explosions.push(explosion);
        
        // 播放爆炸音效
        this.audioManager.playSound('explosion');
    }

    /**
     * 玩家坦克被摧毁
     */
    onPlayerDestroyed() {
        console.log('玩家坦克被摧毁');
        
        // 减少生命值
        this.gameStateManager.loseLife();
        
        // 创建爆炸效果
        this.addExplosion(this.playerTank.x, this.playerTank.y, 'large');
        
        // 如果还有生命值，重新生成玩家坦克
        if (this.gameStateManager.gameData.lives > 0) {
            setTimeout(() => {
                this.createPlayerTank();
            }, 2000);
        }
    }

    /**
     * 敌方坦克被摧毁
     */
    onEnemyDestroyed(enemy) {
        console.log('敌方坦克被摧毁');
        
        // 从敌人列表中移除
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
        
        // 创建爆炸效果
        this.addExplosion(enemy.x, enemy.y, 'medium');
        
        // 更新游戏数据
        this.gameStateManager.destroyEnemy(enemy.type);
        
        // 有概率掉落道具
        if (Math.random() < 0.3) {
            this.createPowerUp(enemy.x, enemy.y);
        }
    }

    /**
     * 创建道具
     */
    createPowerUp(x, y) {
        const powerUpTypes = ['health', 'speed', 'fireRate', 'shield'];
        const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        
        const powerUp = {
            x: x,
            y: y,
            width: 20,
            height: 20,
            type: type,
            lifetime: 10000, // 10秒后消失
            createdTime: Date.now(),
            collected: false
        };
        
        this.powerUps.push(powerUp);
    }

    /**
     * 更新游戏逻辑
     */
    update(deltaTime) {
        if (!this.gameStarted || this.gameStateManager.isPaused()) {
            return;
        }
        
        // 更新FPS
        this.updateFPS();
        
        // 生成敌方坦克
        this.updateEnemySpawning();
        
        // 更新玩家坦克
        if (this.playerTank && !this.playerTank.isDestroyed) {
            this.playerTank.update(deltaTime, this.getGameState());
        }
        
        // 更新敌方坦克
        for (const enemy of this.enemies) {
            if (!enemy.isDestroyed) {
                enemy.update(deltaTime, this.getGameState());
            }
        }
        
        // 更新子弹
        this.updateBullets(deltaTime);
        
        // 更新爆炸效果
        this.updateExplosions(deltaTime);
        
        // 更新道具
        this.updatePowerUps(deltaTime);
        
        // 更新粒子效果
        this.updateParticles(deltaTime);
        
        // 处理碰撞
        this.handleCollisions();
        
        // 清理已销毁的实体
        this.cleanupEntities();
        
        // 检查游戏结束条件
        this.checkGameEndConditions();
    }

    /**
     * 更新FPS
     */
    updateFPS() {
        this.frameCount++;
        const currentTime = Date.now();
        
        if (currentTime - this.lastFpsTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsTime = currentTime;
        }
    }

    /**
     * 更新敌方坦克生成
     */
    updateEnemySpawning() {
        const currentTime = Date.now();
        
        // 检查是否需要生成新的敌方坦克
        if (currentTime >= this.nextEnemySpawnTime && 
            this.enemiesSpawned < this.currentLevelConfig.enemyCount) {
            
            const enemyType = this.currentLevelConfig.enemyTypes[this.enemiesSpawned];
            this.createEnemyTank(enemyType);
            
            // 设置下次生成时间
            this.nextEnemySpawnTime = currentTime + this.currentLevelConfig.spawnDelay;
        }
    }

    /**
     * 更新子弹
     */
    updateBullets(deltaTime) {
        for (const bullet of this.bullets) {
            if (!bullet.isDestroyed) {
                bullet.update(deltaTime, this.getGameState());
            }
        }
    }

    /**
     * 更新爆炸效果
     */
    updateExplosions(deltaTime) {
        for (const explosion of this.explosions) {
            explosion.update(deltaTime);
        }
    }

    /**
     * 更新道具
     */
    updatePowerUps(deltaTime) {
        const currentTime = Date.now();
        
        for (const powerUp of this.powerUps) {
            // 检查是否过期
            if (currentTime - powerUp.createdTime > powerUp.lifetime) {
                powerUp.expired = true;
            }
            
            // 检查是否被收集
            if (this.playerTank && !this.playerTank.isDestroyed) {
                if (this.checkCollision(this.playerTank, powerUp)) {
                    this.collectPowerUp(powerUp);
                }
            }
        }
    }

    /**
     * 收集道具
     */
    collectPowerUp(powerUp) {
        if (powerUp.collected) return;
        
        powerUp.collected = true;
        
        // 应用道具效果
        switch (powerUp.type) {
            case 'health':
                this.gameStateManager.gainLife();
                break;
            case 'speed':
                this.playerTank.applySpeedBoost(5000); // 5秒速度提升
                break;
            case 'fireRate':
                this.playerTank.applyFireRateBoost(5000); // 5秒射速提升
                break;
            case 'shield':
                this.playerTank.activateShield(10000); // 10秒护盾
                break;
        }
        
        // 播放收集音效
        this.audioManager.playSound('powerup');
        
        console.log(`收集道具: ${powerUp.type}`);
    }

    /**
     * 更新粒子效果
     */
    updateParticles(deltaTime) {
        for (const particle of this.particles) {
            particle.update(deltaTime);
        }
    }

    /**
     * 处理碰撞检测
     */
    handleCollisions() {
        // 子弹与坦克的碰撞
        this.handleBulletTankCollisions();
        
        // 子弹与障碍物的碰撞
        this.handleBulletObstacleCollisions();
        
        // 坦克与障碍物的碰撞
        this.handleTankObstacleCollisions();
        
        // 坦克与坦克的碰撞
        this.handleTankTankCollisions();
    }

    /**
     * 处理子弹与坦克的碰撞
     */
    handleBulletTankCollisions() {
        for (const bullet of this.bullets) {
            if (bullet.isDestroyed) continue;
            
            // 子弹与玩家坦克碰撞
            if (this.playerTank && !this.playerTank.isDestroyed && 
                bullet.owner !== this.playerTank &&
                this.checkCollision(bullet, this.playerTank)) {
                
                this.playerTank.takeDamage(bullet.damage, bullet);
                bullet.destroy();
                
                // 创建小爆炸效果
                this.addExplosion(bullet.x, bullet.y, 'small');
            }
            
            // 子弹与敌方坦克碰撞
            for (const enemy of this.enemies) {
                if (enemy.isDestroyed) continue;
                
                if (bullet.owner !== enemy && this.checkCollision(bullet, enemy)) {
                    enemy.takeDamage(bullet.damage, bullet);
                    bullet.destroy();
                    
                    // 创建小爆炸效果
                    this.addExplosion(bullet.x, bullet.y, 'small');
                    break;
                }
            }
        }
    }

    /**
     * 处理子弹与障碍物的碰撞
     */
    handleBulletObstacleCollisions() {
        if (!this.gameMap) return;
        
        for (const bullet of this.bullets) {
            if (bullet.isDestroyed) continue;
            
            const collision = this.gameMap.checkBulletCollision(bullet);
            if (collision) {
                bullet.destroy();
                
                // 如果障碍物可以被破坏，造成伤害
                if (collision.obstacle.isDestructible) {
                    collision.obstacle.takeDamage(bullet.damage, bullet);
                }
                
                // 创建小爆炸效果
                this.addExplosion(collision.point.x, collision.point.y, 'small');
            }
        }
    }

    /**
     * 处理坦克与障碍物的碰撞
     */
    handleTankObstacleCollisions() {
        if (!this.gameMap) return;
        
        // 玩家坦克与障碍物碰撞
        if (this.playerTank && !this.playerTank.isDestroyed) {
            this.gameMap.handleTankCollision(this.playerTank);
        }
        
        // 敌方坦克与障碍物碰撞
        for (const enemy of this.enemies) {
            if (!enemy.isDestroyed) {
                this.gameMap.handleTankCollision(enemy);
            }
        }
    }

    /**
     * 处理坦克与坦克的碰撞
     */
    handleTankTankCollisions() {
        // 玩家坦克与敌方坦克碰撞
        if (this.playerTank && !this.playerTank.isDestroyed) {
            for (const enemy of this.enemies) {
                if (!enemy.isDestroyed && this.checkCollision(this.playerTank, enemy)) {
                    this.resolveTankCollision(this.playerTank, enemy);
                }
            }
        }
        
        // 敌方坦克之间的碰撞
        for (let i = 0; i < this.enemies.length; i++) {
            for (let j = i + 1; j < this.enemies.length; j++) {
                const enemy1 = this.enemies[i];
                const enemy2 = this.enemies[j];
                
                if (!enemy1.isDestroyed && !enemy2.isDestroyed && 
                    this.checkCollision(enemy1, enemy2)) {
                    this.resolveTankCollision(enemy1, enemy2);
                }
            }
        }
    }

    /**
     * 解决坦克碰撞
     */
    resolveTankCollision(tank1, tank2) {
        // 计算碰撞方向
        const dx = tank2.x - tank1.x;
        const dy = tank2.y - tank1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return;
        
        // 标准化方向向量
        const nx = dx / distance;
        const ny = dy / distance;
        
        // 分离坦克
        const separationDistance = (tank1.width + tank2.width) / 2;
        const currentDistance = distance;
        const separationAmount = separationDistance - currentDistance + 1;
        
        tank1.x -= nx * separationAmount * 0.5;
        tank1.y -= ny * separationAmount * 0.5;
        tank2.x += nx * separationAmount * 0.5;
        tank2.y += ny * separationAmount * 0.5;
        
        // 停止移动
        tank1.velocity.x = 0;
        tank1.velocity.y = 0;
        tank2.velocity.x = 0;
        tank2.velocity.y = 0;
    }

    /**
     * 检查碰撞
     */
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    /**
     * 清理已销毁的实体
     */
    cleanupEntities() {
        // 清理子弹
        this.bullets = this.bullets.filter(bullet => !bullet.isDestroyed);
        
        // 清理爆炸效果
        this.explosions = this.explosions.filter(explosion => !explosion.isFinished);
        
        // 清理道具
        this.powerUps = this.powerUps.filter(powerUp => !powerUp.collected && !powerUp.expired);
        
        // 清理粒子
        this.particles = this.particles.filter(particle => particle.lifetime > 0);
        
        // 清理敌方坦克
        this.enemies = this.enemies.filter(enemy => !enemy.isDestroyed);
    }

    /**
     * 检查游戏结束条件
     */
    checkGameEndConditions() {
        // 检查玩家是否死亡
        if (this.playerTank && this.playerTank.isDestroyed && this.gameStateManager.gameData.lives <= 0) {
            this.gameStateManager.changeState(GameState.GAME_OVER);
            return;
        }
        
        // 检查是否完成关卡
        if (this.enemiesSpawned >= this.currentLevelConfig.enemyCount && this.enemies.length === 0) {
            this.gameStateManager.changeState(GameState.VICTORY);
            return;
        }
    }

    /**
     * 获取游戏状态
     */
    getGameState() {
        return {
            playerTank: this.playerTank,
            enemies: this.enemies,
            bullets: this.bullets,
            explosions: this.explosions,
            powerUps: this.powerUps,
            particles: this.particles,
            gameMap: this.gameMap,
            gameStateManager: this.gameStateManager
        };
    }

    /**
     * 处理键盘输入
     */
    handleKeyInput(key, pressed) {
        // 调试模式切换
        if (key === 'F3' && pressed) {
            this.debugMode = !this.debugMode;
            console.log(`调试模式: ${this.debugMode ? '开启' : '关闭'}`);
            return;
        }
        
        // 游戏暂停
        if (key === 'Escape' && pressed) {
            if (this.gameStateManager.isInGame()) {
                this.gameStateManager.pauseGame();
            } else if (this.gameStateManager.isPaused()) {
                this.gameStateManager.resumeGame();
            }
            return;
        }
        
        // 玩家坦克控制
        if (this.playerTank && !this.playerTank.isDestroyed && this.gameStateManager.isInGame()) {
            this.playerTank.handleInput(key, pressed);
        }
    }

    /**
     * 渲染游戏
     */
    render(renderer) {
        if (!this.gameStarted) return;
        
        // 渲染地图
        if (this.gameMap) {
            this.gameMap.render(renderer);
        }
        
        // 渲染玩家坦克
        if (this.playerTank && !this.playerTank.isDestroyed) {
            this.playerTank.render(renderer);
        }
        
        // 渲染敌方坦克
        for (const enemy of this.enemies) {
            if (!enemy.isDestroyed) {
                enemy.render(renderer);
            }
        }
        
        // 渲染子弹
        for (const bullet of this.bullets) {
            if (!bullet.isDestroyed) {
                bullet.render(renderer);
            }
        }
        
        // 渲染爆炸效果
        for (const explosion of this.explosions) {
            explosion.render(renderer);
        }
        
        // 渲染道具
        this.renderPowerUps(renderer);
        
        // 渲染粒子效果
        this.renderParticles(renderer);
        
        // 渲染调试信息
        if (this.debugMode) {
            this.renderDebugInfo(renderer);
        }
    }

    /**
     * 渲染道具
     */
    renderPowerUps(renderer) {
        for (const powerUp of this.powerUps) {
            if (powerUp.collected || powerUp.expired) continue;
            
            // 闪烁效果
            const time = Date.now();
            const alpha = 0.7 + 0.3 * Math.sin(time * 0.01);
            
            renderer.setGlobalAlpha(alpha);
            
            // 根据类型选择颜色
            let color;
            switch (powerUp.type) {
                case 'health':
                    color = '#ff4444';
                    break;
                case 'speed':
                    color = '#44ff44';
                    break;
                case 'fireRate':
                    color = '#ffff44';
                    break;
                case 'shield':
                    color = '#4444ff';
                    break;
                default:
                    color = '#ffffff';
            }
            
            renderer.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height, color);
            renderer.strokeRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height, '#ffffff', 2);
            
            renderer.resetGlobalAlpha();
        }
    }

    /**
     * 渲染粒子效果
     */
    renderParticles(renderer) {
        for (const particle of this.particles) {
            const alpha = particle.lifetime / particle.maxLifetime;
            
            renderer.setGlobalAlpha(alpha);
            renderer.fillRect(
                particle.x - particle.size / 2,
                particle.y - particle.size / 2,
                particle.size,
                particle.size,
                particle.color
            );
            renderer.resetGlobalAlpha();
        }
    }

    /**
     * 渲染调试信息
     */
    renderDebugInfo(renderer) {
        const debugInfo = [
            `FPS: ${this.fps}`,
            `玩家坦克: ${this.playerTank ? '存活' : '已销毁'}`,
            `敌方坦克: ${this.enemies.length}`,
            `子弹: ${this.bullets.length}`,
            `爆炸: ${this.explosions.length}`,
            `道具: ${this.powerUps.length}`,
            `粒子: ${this.particles.length}`,
            `已生成敌人: ${this.enemiesSpawned}/${this.currentLevelConfig ? this.currentLevelConfig.enemyCount : 0}`
        ];
        
        renderer.setFont('14px Arial');
        renderer.setTextAlign('left');
        
        for (let i = 0; i < debugInfo.length; i++) {
            renderer.drawText(debugInfo[i], 10, 120 + i * 20, '#ffffff');
        }
    }

    /**
     * 获取控制器状态
     */
    getStatus() {
        return {
            gameStarted: this.gameStarted,
            playerAlive: this.playerTank && !this.playerTank.isDestroyed,
            enemyCount: this.enemies.length,
            bulletCount: this.bullets.length,
            explosionCount: this.explosions.length,
            powerUpCount: this.powerUps.length,
            fps: this.fps,
            debugMode: this.debugMode
        };
    }
}








