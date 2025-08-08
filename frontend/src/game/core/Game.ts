
import { Tank } from './Tank';
import { Enemy } from './Enemy';
import { Bullet } from './Bullet';
import { Wall } from './Wall';
import { InputManager } from './InputManager';
import { CollisionDetector } from './CollisionDetector';
import { GameRenderer } from './GameRenderer';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Tank;
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private walls: Wall[] = [];
  private inputManager: InputManager;
  private collisionDetector: CollisionDetector;
  private renderer: GameRenderer;
  private gameLoop: number | null = null;
  private isRunning: boolean = false;
  private score: number = 0;
  private level: number = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法获取2D渲染上下文');
    }
    this.ctx = ctx;

    // 初始化游戏组件
    this.inputManager = new InputManager();
    this.collisionDetector = new CollisionDetector();
    this.renderer = new GameRenderer(this.ctx);

    // 创建玩家坦克
    this.player = new Tank(100, 500, 0, 'player');

    // 初始化游戏世界
    this.initializeLevel();
  }

  private initializeLevel(): void {
    // 清空现有对象
    this.enemies = [];
    this.bullets = [];
    this.walls = [];

    // 创建墙壁
    this.createWalls();

    // 创建敌人
    this.createEnemies();
  }

  private createWalls(): void {
    // 创建边界墙
    for (let x = 0; x < this.canvas.width; x += 40) {
      this.walls.push(new Wall(x, 0, 40, 40)); // 顶部墙
      this.walls.push(new Wall(x, this.canvas.height - 40, 40, 40)); // 底部墙
    }
    for (let y = 40; y < this.canvas.height - 40; y += 40) {
      this.walls.push(new Wall(0, y, 40, 40)); // 左侧墙
      this.walls.push(new Wall(this.canvas.width - 40, y, 40, 40)); // 右侧墙
    }

    // 创建一些内部障碍物
    this.walls.push(new Wall(200, 200, 40, 120));
    this.walls.push(new Wall(400, 150, 80, 40));
    this.walls.push(new Wall(600, 300, 40, 160));
    this.walls.push(new Wall(300, 400, 120, 40));
  }

  private createEnemies(): void {
    const enemyPositions = [
      { x: 700, y: 100 },
      { x: 600, y: 100 },
      { x: 500, y: 100 },
      { x: 700, y: 200 },
      { x: 200, y: 100 }
    ];

    enemyPositions.forEach(pos => {
      this.enemies.push(new Enemy(pos.x, pos.y, Math.PI, 'enemy'));
    });
  }

  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.inputManager.enable();
    this.gameLoop = requestAnimationFrame(() => this.update());
  }

  public stop(): void {
    this.isRunning = false;
    this.inputManager.disable();
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
      this.gameLoop = null;
    }
  }

  private update(): void {
    if (!this.isRunning) return;

    // 处理输入
    this.handleInput();

    // 更新游戏对象
    this.updatePlayer();
    this.updateEnemies();
    this.updateBullets();

    // 碰撞检测
    this.handleCollisions();

    // 渲染
    this.render();

    // 检查游戏状态
    this.checkGameState();

    // 继续游戏循环
    this.gameLoop = requestAnimationFrame(() => this.update());
  }

  private handleInput(): void {
    const input = this.inputManager.getInput();
    
    if (input.up) this.player.moveForward();
    if (input.down) this.player.moveBackward();
    if (input.left) this.player.turnLeft();
    if (input.right) this.player.turnRight();
    if (input.shoot && this.player.canShoot()) {
      const bullet = this.player.shoot();
      if (bullet) {
        this.bullets.push(bullet);
      }
    }
  }

  private updatePlayer(): void {
    this.player.update();
    
    // 检查玩家与墙壁的碰撞
    for (const wall of this.walls) {
      if (this.collisionDetector.checkCollision(this.player, wall)) {
        this.player.revertPosition();
        break;
      }
    }

    // 保持玩家在画布内
    this.player.constrainToCanvas(this.canvas.width, this.canvas.height);
  }

  private updateEnemies(): void {
    this.enemies.forEach(enemy => {
      enemy.update();
      enemy.aiUpdate(this.player, this.walls);
      
      // 敌人射击
      if (enemy.canShoot() && Math.random() < 0.02) {
        const bullet = enemy.shoot();
        if (bullet) {
          this.bullets.push(bullet);
        }
      }

      // 检查敌人与墙壁的碰撞
      for (const wall of this.walls) {
        if (this.collisionDetector.checkCollision(enemy, wall)) {
          enemy.revertPosition();
          break;
        }
      }

      enemy.constrainToCanvas(this.canvas.width, this.canvas.height);
    });
  }

  private updateBullets(): void {
    this.bullets = this.bullets.filter(bullet => {
      bullet.update();
      
      // 检查子弹是否超出边界
      if (bullet.isOutOfBounds(this.canvas.width, this.canvas.height)) {
        return false;
      }

      // 检查子弹与墙壁的碰撞
      for (const wall of this.walls) {
        if (this.collisionDetector.checkCollision(bullet, wall)) {
          return false;
        }
      }

      return true;
    });
  }

  private handleCollisions(): void {
    // 子弹与坦克的碰撞
    this.bullets = this.bullets.filter(bullet => {
      // 玩家子弹击中敌人
      if (bullet.getOwner() === 'player') {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
          if (this.collisionDetector.checkCollision(bullet, this.enemies[i])) {
            this.enemies.splice(i, 1);
            this.score += 100;
            return false;
          }
        }
      }
      // 敌人子弹击中玩家
      else if (bullet.getOwner() === 'enemy') {
        if (this.collisionDetector.checkCollision(bullet, this.player)) {
          this.player.takeDamage();
          return false;
        }
      }
      return true;
    });
  }

  private checkGameState(): void {
    // 检查是否所有敌人都被消灭
    if (this.enemies.length === 0) {
      this.level++;
      this.initializeLevel();
    }

    // 检查玩家是否死亡
    if (this.player.getHealth() <= 0) {
      this.gameOver();
    }
  }

  private gameOver(): void {
    this.stop();
    alert(`游戏结束！最终得分: ${this.score}`);
  }

  private render(): void {
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 渲染游戏对象
    this.renderer.renderWalls(this.walls);
    this.renderer.renderTank(this.player);
    this.enemies.forEach(enemy => this.renderer.renderTank(enemy));
    this.bullets.forEach(bullet => this.renderer.renderBullet(bullet));

    // 渲染UI
    this.renderer.renderUI(this.score, this.level, this.player.getHealth());
  }
}

