

import { Tank } from './Tank';
import { Wall } from './Wall';

export class Enemy extends Tank {
  private aiState: 'patrol' | 'chase' | 'attack' = 'patrol';
  private patrolDirection: number = 0;
  private lastDirectionChange: number = 0;
  private directionChangeInterval: number = 2000; // 2秒改变一次方向
  private detectionRange: number = 150;
  private attackRange: number = 200;

  constructor(x: number, y: number, angle: number, type: string) {
    super(x, y, angle, type);
    this.speed = 1.5; // 敌人稍微慢一点
    this.shootCooldown = 800; // 射击间隔稍长
    this.patrolDirection = Math.random() * Math.PI * 2;
  }

  public aiUpdate(player: Tank, walls: Wall[]): void {
    const distanceToPlayer = this.getDistanceToPlayer(player);
    
    // 根据距离决定AI状态
    if (distanceToPlayer < this.attackRange) {
      this.aiState = 'attack';
    } else if (distanceToPlayer < this.detectionRange) {
      this.aiState = 'chase';
    } else {
      this.aiState = 'patrol';
    }

    switch (this.aiState) {
      case 'patrol':
        this.patrolBehavior();
        break;
      case 'chase':
        this.chaseBehavior(player);
        break;
      case 'attack':
        this.attackBehavior(player);
        break;
    }
  }

  private patrolBehavior(): void {
    const now = Date.now();
    
    // 定期改变巡逻方向
    if (now - this.lastDirectionChange > this.directionChangeInterval) {
      this.patrolDirection = Math.random() * Math.PI * 2;
      this.lastDirectionChange = now;
    }

    // 转向巡逻方向
    const angleDiff = this.normalizeAngle(this.patrolDirection - this.angle);
    if (Math.abs(angleDiff) > 0.1) {
      if (angleDiff > 0) {
        this.turnRight();
      } else {
        this.turnLeft();
      }
    } else {
      // 向前移动
      this.moveForward();
    }
  }

  private chaseBehavior(player: Tank): void {
    const angleToPlayer = this.getAngleToPlayer(player);
    const angleDiff = this.normalizeAngle(angleToPlayer - this.angle);

    // 转向玩家
    if (Math.abs(angleDiff) > 0.1) {
      if (angleDiff > 0) {
        this.turnRight();
      } else {
        this.turnLeft();
      }
    }

    // 向玩家移动
    this.moveForward();
  }

  private attackBehavior(player: Tank): void {
    const angleToPlayer = this.getAngleToPlayer(player);
    const angleDiff = this.normalizeAngle(angleToPlayer - this.angle);

    // 瞄准玩家
    if (Math.abs(angleDiff) > 0.05) {
      if (angleDiff > 0) {
        this.turnRight();
      } else {
        this.turnLeft();
      }
    }

    // 如果瞄准得差不多了，就射击
    if (Math.abs(angleDiff) < 0.2 && this.canShoot()) {
      this.shoot();
    }

    // 保持一定距离，避免太近
    const distanceToPlayer = this.getDistanceToPlayer(player);
    if (distanceToPlayer < 100) {
      this.moveBackward();
    } else if (distanceToPlayer > 180) {
      this.moveForward();
    }
  }

  private getDistanceToPlayer(player: Tank): number {
    const dx = player.getX() - this.x;
    const dy = player.getY() - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getAngleToPlayer(player: Tank): number {
    const dx = player.getX() - this.x;
    const dy = player.getY() - this.y;
    return Math.atan2(dy, dx);
  }

  private normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  }

  public update(): void {
    super.update();
    
    // 随机改变巡逻方向的概率
    if (this.aiState === 'patrol' && Math.random() < 0.005) {
      this.patrolDirection = Math.random() * Math.PI * 2;
    }
  }
}


