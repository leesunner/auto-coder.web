






import { Tank } from './Tank';
import { Bullet } from './Bullet';
import { Wall } from './Wall';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public renderTank(tank: Tank): void {
    const ctx = this.ctx;
    const x = tank.getX();
    const y = tank.getY();
    const angle = tank.getAngle();
    const width = tank.getWidth();
    const height = tank.getHeight();

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // 绘制坦克主体
    if (tank.getType() === 'player') {
      ctx.fillStyle = '#4CAF50'; // 绿色玩家坦克
    } else {
      ctx.fillStyle = '#F44336'; // 红色敌人坦克
    }
    
    ctx.fillRect(-width/2, -height/2, width, height);

    // 绘制坦克炮管
    ctx.fillStyle = '#333';
    ctx.fillRect(width/2 - 2, -3, 15, 6);

    // 绘制坦克方向指示器
    ctx.fillStyle = '#FFF';
    ctx.fillRect(width/2 - 5, -2, 8, 4);

    ctx.restore();

    // 绘制血条
    this.renderHealthBar(tank);
  }

  private renderHealthBar(tank: Tank): void {
    const ctx = this.ctx;
    const x = tank.getX();
    const y = tank.getY();
    const width = tank.getWidth();
    const health = tank.getHealth();
    const maxHealth = tank.getMaxHealth();

    if (health < maxHealth) {
      const barWidth = width;
      const barHeight = 4;
      const barX = x - barWidth / 2;
      const barY = y - tank.getHeight() / 2 - 10;

      // 背景
      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // 血量
      ctx.fillStyle = health > maxHealth * 0.5 ? '#4CAF50' : health > maxHealth * 0.25 ? '#FF9800' : '#F44336';
      ctx.fillRect(barX, barY, (health / maxHealth) * barWidth, barHeight);
    }
  }

  public renderBullet(bullet: Bullet): void {
    const ctx = this.ctx;
    const x = bullet.getX();
    const y = bullet.getY();
    const width = bullet.getWidth();
    const height = bullet.getHeight();

    ctx.fillStyle = bullet.getOwner() === 'player' ? '#2196F3' : '#FF5722';
    ctx.fillRect(x - width/2, y - height/2, width, height);
  }

  public renderWall(wall: Wall): void {
    const ctx = this.ctx;
    const x = wall.getX();
    const y = wall.getY();
    const width = wall.getWidth();
    const height = wall.getHeight();

    ctx.fillStyle = '#795548';
    ctx.fillRect(x, y, width, height);

    // 添加边框效果
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
  }

  public renderWalls(walls: Wall[]): void {
    walls.forEach(wall => this.renderWall(wall));
  }

  public renderUI(score: number, level: number, playerHealth: number): void {
    const ctx = this.ctx;
    
    ctx.fillStyle = '#FFF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    
    // 得分
    ctx.fillText(`得分: ${score}`, 10, 25);
    
    // 关卡
    ctx.fillText(`关卡: ${level}`, 10, 45);
    
    // 玩家血量
    ctx.fillText(`生命值: ${playerHealth}`, 10, 65);

    // 右上角显示控制说明
    ctx.textAlign = 'right';
    ctx.font = '12px Arial';
    ctx.fillStyle = '#CCC';
    ctx.fillText('WASD: 移动', ctx.canvas.width - 10, 25);
    ctx.fillText('空格: 射击', ctx.canvas.width - 10, 40);
  }

  public renderGameOver(score: number): void {
    const ctx = this.ctx;
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;

    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 游戏结束文本
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', centerX, centerY - 40);

    ctx.font = '24px Arial';
    ctx.fillText(`最终得分: ${score}`, centerX, centerY + 20);

    ctx.font = '16px Arial';
    ctx.fillText('刷新页面重新开始', centerX, centerY + 60);
  }
}







