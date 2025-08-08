

export class Bullet {
  private x: number;
  private y: number;
  private angle: number;
  private speed: number = 5;
  private width: number = 4;
  private height: number = 4;
  private owner: string; // 'player' 或 'enemy'

  constructor(x: number, y: number, angle: number, owner: string) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.owner = owner;
  }

  public update(): void {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
  }

  public isOutOfBounds(canvasWidth: number, canvasHeight: number): boolean {
    return this.x < 0 || this.x > canvasWidth || this.y < 0 || this.y > canvasHeight;
  }

  // Getters
  public getX(): number { return this.x; }
  public getY(): number { return this.y; }
  public getAngle(): number { return this.angle; }
  public getWidth(): number { return this.width; }
  public getHeight(): number { return this.height; }
  public getOwner(): string { return this.owner; }
}


