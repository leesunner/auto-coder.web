
import { Bullet } from './Bullet';

export class Tank {
  protected x: number;
  protected y: number;
  protected previousX: number;
  protected previousY: number;
  protected angle: number;
  protected speed: number = 2;
  protected turnSpeed: number = 0.05;
  protected width: number = 30;
  protected height: number = 30;
  protected health: number = 100;
  protected maxHealth: number = 100;
  protected type: string;
  protected lastShotTime: number = 0;
  protected shootCooldown: number = 500; // 毫秒

  constructor(x: number, y: number, angle: number, type: string) {
    this.x = x;
    this.y = y;
    this.previousX = x;
    this.previousY = y;
    this.angle = angle;
    this.type = type;
  }

  public update(): void {
    // 保存当前位置作为上一个位置
    this.previousX = this.x;
    this.previousY = this.y;
  }

  public moveForward(): void {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
  }

  public moveBackward(): void {
    this.x -= Math.cos(this.angle) * this.speed;
    this.y -= Math.sin(this.angle) * this.speed;
  }

  public turnLeft(): void {
    this.angle -= this.turnSpeed;
  }

  public turnRight(): void {
    this.angle += this.turnSpeed;
  }

  public shoot(): Bullet | null {
    if (!this.canShoot()) return null;

    this.lastShotTime = Date.now();
    
    // 计算子弹发射位置（坦克前方）
    const bulletX = this.x + Math.cos(this.angle) * (this.width / 2 + 10);
    const bulletY = this.y + Math.sin(this.angle) * (this.height / 2 + 10);
    
    return new Bullet(bulletX, bulletY, this.angle, this.type);
  }

  public canShoot(): boolean {
    return Date.now() - this.lastShotTime >= this.shootCooldown;
  }

  public takeDamage(damage: number = 25): void {
    this.health -= damage;
    if (this.health < 0) this.health = 0;
  }

  public revertPosition(): void {
    this.x = this.previousX;
    this.y = this.previousY;
  }

  public constrainToCanvas(canvasWidth: number, canvasHeight: number): void {
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;

    if (this.x - halfWidth < 0) this.x = halfWidth;
    if (this.x + halfWidth > canvasWidth) this.x = canvasWidth - halfWidth;
    if (this.y - halfHeight < 0) this.y = halfHeight;
    if (this.y + halfHeight > canvasHeight) this.y = canvasHeight - halfHeight;
  }

  // Getters
  public getX(): number { return this.x; }
  public getY(): number { return this.y; }
  public getAngle(): number { return this.angle; }
  public getWidth(): number { return this.width; }
  public getHeight(): number { return this.height; }
  public getHealth(): number { return this.health; }
  public getMaxHealth(): number { return this.maxHealth; }
  public getType(): string { return this.type; }

  // Setters
  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  public setAngle(angle: number): void {
    this.angle = angle;
  }
}

