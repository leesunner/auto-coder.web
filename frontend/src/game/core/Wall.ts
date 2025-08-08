


export class Wall {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private type: string = 'wall';

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  // Getters
  public getX(): number { return this.x; }
  public getY(): number { return this.y; }
  public getWidth(): number { return this.width; }
  public getHeight(): number { return this.height; }
  public getType(): string { return this.type; }
}



