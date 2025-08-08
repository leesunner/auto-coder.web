




import { Tank } from './Tank';
import { Bullet } from './Bullet';
import { Wall } from './Wall';

export class CollisionDetector {
  
  public checkCollision(obj1: any, obj2: any): boolean {
    // 获取对象的边界框
    const rect1 = this.getBoundingBox(obj1);
    const rect2 = this.getBoundingBox(obj2);

    // AABB碰撞检测
    return rect1.left < rect2.right &&
           rect1.right > rect2.left &&
           rect1.top < rect2.bottom &&
           rect1.bottom > rect2.top;
  }

  private getBoundingBox(obj: any): { left: number; right: number; top: number; bottom: number } {
    const x = obj.getX();
    const y = obj.getY();
    const width = obj.getWidth();
    const height = obj.getHeight();

    return {
      left: x - width / 2,
      right: x + width / 2,
      top: y - height / 2,
      bottom: y + height / 2
    };
  }

  public checkCircleCollision(obj1: any, obj2: any): boolean {
    const dx = obj1.getX() - obj2.getX();
    const dy = obj1.getY() - obj2.getY();
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const radius1 = Math.max(obj1.getWidth(), obj1.getHeight()) / 2;
    const radius2 = Math.max(obj2.getWidth(), obj2.getHeight()) / 2;
    
    return distance < radius1 + radius2;
  }

  public checkPointInRect(pointX: number, pointY: number, obj: any): boolean {
    const rect = this.getBoundingBox(obj);
    return pointX >= rect.left && pointX <= rect.right &&
           pointY >= rect.top && pointY <= rect.bottom;
  }
}





