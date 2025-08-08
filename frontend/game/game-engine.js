
/**
 * 游戏引擎类 - 负责游戏循环、渲染和事件处理
 */
class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isRunning = false;
        this.lastTime = 0;
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;
        
        // 绑定方法上下文
        this.gameLoop = this.gameLoop.bind(this);
    }

    /**
     * 启动游戏引擎
     */
    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * 停止游戏引擎
     */
    stop() {
        this.isRunning = false;
    }

    /**
     * 游戏主循环
     */
    gameLoop(currentTime) {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastTime;

        if (deltaTime >= this.frameInterval) {
            // 更新游戏逻辑
            if (this.updateCallback) {
                this.updateCallback(deltaTime);
            }

            // 渲染游戏画面
            if (this.renderCallback) {
                this.renderCallback(this.ctx);
            }

            this.lastTime = currentTime;
        }

        requestAnimationFrame(this.gameLoop);
    }

    /**
     * 设置更新回调函数
     */
    setUpdateCallback(callback) {
        this.updateCallback = callback;
    }

    /**
     * 设置渲染回调函数
     */
    setRenderCallback(callback) {
        this.renderCallback = callback;
    }

    /**
     * 清空画布
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * 获取画布尺寸
     */
    getCanvasSize() {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }
}

/**
 * 向量类 - 用于位置和速度计算
 */
class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * 向量加法
     */
    add(vector) {
        return new Vector2D(this.x + vector.x, this.y + vector.y);
    }

    /**
     * 向量减法
     */
    subtract(vector) {
        return new Vector2D(this.x - vector.x, this.y - vector.y);
    }

    /**
     * 向量乘以标量
     */
    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    /**
     * 获取向量长度
     */
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * 归一化向量
     */
    normalize() {
        const mag = this.magnitude();
        if (mag === 0) return new Vector2D(0, 0);
        return new Vector2D(this.x / mag, this.y / mag);
    }

    /**
     * 复制向量
     */
    clone() {
        return new Vector2D(this.x, this.y);
    }
}

/**
 * 碰撞检测工具类
 */
class CollisionDetector {
    /**
     * 矩形碰撞检测
     */
    static rectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    /**
     * 圆形碰撞检测
     */
    static circleCollision(circle1, circle2) {
        const dx = circle1.x - circle2.x;
        const dy = circle1.y - circle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < circle1.radius + circle2.radius;
    }

    /**
     * 点与矩形碰撞检测
     */
    static pointInRect(point, rect) {
        return point.x >= rect.x &&
               point.x <= rect.x + rect.width &&
               point.y >= rect.y &&
               point.y <= rect.y + rect.height;
    }
}

/**
 * 输入管理器类
 */
class InputManager {
    constructor() {
        this.keys = {};
        this.mousePosition = new Vector2D();
        this.mouseButtons = {};
        
        this.setupEventListeners();
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // 鼠标事件
        document.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
        });

        document.addEventListener('mousedown', (e) => {
            this.mouseButtons[e.button] = true;
        });

        document.addEventListener('mouseup', (e) => {
            this.mouseButtons[e.button] = false;
        });
    }

    /**
     * 检查按键是否被按下
     */
    isKeyPressed(keyCode) {
        return !!this.keys[keyCode];
    }

    /**
     * 检查鼠标按钮是否被按下
     */
    isMouseButtonPressed(button) {
        return !!this.mouseButtons[button];
    }

    /**
     * 获取鼠标位置
     */
    getMousePosition() {
        return this.mousePosition.clone();
    }
}
