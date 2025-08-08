


/**
 * 输入管理器类
 * 负责处理键盘和鼠标输入事件
 */

/**
 * 输入管理器
 */
export class InputManager {
    constructor() {
        // 键盘状态
        this.keys = new Map();
        this.keysPressed = new Map();
        this.keysReleased = new Map();
        
        // 鼠标状态
        this.mouse = {
            x: 0,
            y: 0,
            buttons: new Map(),
            buttonsPressed: new Map(),
            buttonsReleased: new Map()
        };
        
        // 事件监听器
        this.keyPressListeners = new Map();
        this.keyReleaseListeners = new Map();
        this.mousePressListeners = new Map();
        this.mouseReleaseListeners = new Map();
        
        // 绑定方法上下文
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);
        
        // 输入配置
        this.inputConfig = {
            // 玩家控制键位映射
            playerControls: {
                up: ['KeyW', 'ArrowUp'],
                down: ['KeyS', 'ArrowDown'],
                left: ['KeyA', 'ArrowLeft'],
                right: ['KeyD', 'ArrowRight'],
                shoot: ['Space', 'Enter'],
                pause: ['KeyP', 'Escape']
            },
            
            // 系统控制键位
            systemControls: {
                pause: ['KeyP'],
                menu: ['Escape'],
                debug: ['F1'],
                fullscreen: ['F11']
            }
        };
        
        // 输入缓冲（防止输入丢失）
        this.inputBuffer = [];
        this.bufferSize = 10;
    }

    /**
     * 初始化输入管理器
     */
    init() {
        console.log('初始化输入管理器...');
        
        // 添加键盘事件监听器
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        
        // 添加鼠标事件监听器
        document.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('contextmenu', this.handleContextMenu);
        
        // 防止默认的键盘行为
        document.addEventListener('keydown', (e) => {
            // 防止空格键滚动页面
            if (e.code === 'Space') {
                e.preventDefault();
            }
            // 防止方向键滚动页面
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });
        
        console.log('输入管理器初始化完成');
    }

    /**
     * 处理键盘按下事件
     */
    handleKeyDown(event) {
        const keyCode = event.code;
        
        // 防止重复触发
        if (this.keys.get(keyCode)) {
            return;
        }
        
        // 设置键盘状态
        this.keys.set(keyCode, true);
        this.keysPressed.set(keyCode, true);
        
        // 添加到输入缓冲
        this.addToInputBuffer({
            type: 'keydown',
            code: keyCode,
            timestamp: performance.now()
        });
        
        // 触发键盘按下监听器
        const listeners = this.keyPressListeners.get(keyCode);
        if (listeners) {
            listeners.forEach(listener => listener(event));
        }
        
        // 阻止默认行为（如果需要）
        if (this.shouldPreventDefault(keyCode)) {
            event.preventDefault();
        }
    }

    /**
     * 处理键盘释放事件
     */
    handleKeyUp(event) {
        const keyCode = event.code;
        
        // 设置键盘状态
        this.keys.set(keyCode, false);
        this.keysReleased.set(keyCode, true);
        
        // 添加到输入缓冲
        this.addToInputBuffer({
            type: 'keyup',
            code: keyCode,
            timestamp: performance.now()
        });
        
        // 触发键盘释放监听器
        const listeners = this.keyReleaseListeners.get(keyCode);
        if (listeners) {
            listeners.forEach(listener => listener(event));
        }
    }

    /**
     * 处理鼠标按下事件
     */
    handleMouseDown(event) {
        const button = event.button;
        
        // 设置鼠标状态
        this.mouse.buttons.set(button, true);
        this.mouse.buttonsPressed.set(button, true);
        
        // 更新鼠标位置
        this.updateMousePosition(event);
        
        // 添加到输入缓冲
        this.addToInputBuffer({
            type: 'mousedown',
            button: button,
            x: this.mouse.x,
            y: this.mouse.y,
            timestamp: performance.now()
        });
        
        // 触发鼠标按下监听器
        const listeners = this.mousePressListeners.get(button);
        if (listeners) {
            listeners.forEach(listener => listener(event));
        }
    }

    /**
     * 处理鼠标释放事件
     */
    handleMouseUp(event) {
        const button = event.button;
        
        // 设置鼠标状态
        this.mouse.buttons.set(button, false);
        this.mouse.buttonsReleased.set(button, true);
        
        // 更新鼠标位置
        this.updateMousePosition(event);
        
        // 添加到输入缓冲
        this.addToInputBuffer({
            type: 'mouseup',
            button: button,
            x: this.mouse.x,
            y: this.mouse.y,
            timestamp: performance.now()
        });
        
        // 触发鼠标释放监听器
        const listeners = this.mouseReleaseListeners.get(button);
        if (listeners) {
            listeners.forEach(listener => listener(event));
        }
    }

    /**
     * 处理鼠标移动事件
     */
    handleMouseMove(event) {
        this.updateMousePosition(event);
    }

    /**
     * 处理右键菜单事件（禁用）
     */
    handleContextMenu(event) {
        event.preventDefault();
    }

    /**
     * 更新鼠标位置
     */
    updateMousePosition(event) {
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = event.clientX - rect.left;
            this.mouse.y = event.clientY - rect.top;
        }
    }

    /**
     * 添加到输入缓冲
     */
    addToInputBuffer(input) {
        this.inputBuffer.push(input);
        
        // 限制缓冲区大小
        if (this.inputBuffer.length > this.bufferSize) {
            this.inputBuffer.shift();
        }
    }

    /**
     * 检查是否应该阻止默认行为
     */
    shouldPreventDefault(keyCode) {
        const preventKeys = [
            'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'KeyW', 'KeyA', 'KeyS', 'KeyD'
        ];
        return preventKeys.includes(keyCode);
    }

    /**
     * 检查键是否被按下
     */
    isKeyDown(keyCode) {
        return this.keys.get(keyCode) || false;
    }

    /**
     * 检查键是否刚被按下
     */
    isKeyPressed(keyCode) {
        return this.keysPressed.get(keyCode) || false;
    }

    /**
     * 检查键是否刚被释放
     */
    isKeyReleased(keyCode) {
        return this.keysReleased.get(keyCode) || false;
    }

    /**
     * 检查鼠标按钮是否被按下
     */
    isMouseButtonDown(button) {
        return this.mouse.buttons.get(button) || false;
    }

    /**
     * 检查鼠标按钮是否刚被按下
     */
    isMouseButtonPressed(button) {
        return this.mouse.buttonsPressed.get(button) || false;
    }

    /**
     * 检查鼠标按钮是否刚被释放
     */
    isMouseButtonReleased(button) {
        return this.mouse.buttonsReleased.get(button) || false;
    }

    /**
     * 获取鼠标位置
     */
    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }

    /**
     * 检查玩家控制输入
     */
    getPlayerInput() {
        const input = {
            up: false,
            down: false,
            left: false,
            right: false,
            shoot: false,
            shootPressed: false
        };

        // 检查移动输入
        input.up = this.inputConfig.playerControls.up.some(key => this.isKeyDown(key));
        input.down = this.inputConfig.playerControls.down.some(key => this.isKeyDown(key));
        input.left = this.inputConfig.playerControls.left.some(key => this.isKeyDown(key));
        input.right = this.inputConfig.playerControls.right.some(key => this.isKeyDown(key));
        
        // 检查射击输入
        input.shoot = this.inputConfig.playerControls.shoot.some(key => this.isKeyDown(key));
        input.shootPressed = this.inputConfig.playerControls.shoot.some(key => this.isKeyPressed(key));

        return input;
    }

    /**
     * 添加键盘按下监听器
     */
    onKeyPress(keyCode, callback) {
        if (!this.keyPressListeners.has(keyCode)) {
            this.keyPressListeners.set(keyCode, []);
        }
        this.keyPressListeners.get(keyCode).push(callback);
    }

    /**
     * 添加键盘释放监听器
     */
    onKeyRelease(keyCode, callback) {
        if (!this.keyReleaseListeners.has(keyCode)) {
            this.keyReleaseListeners.set(keyCode, []);
        }
        this.keyReleaseListeners.get(keyCode).push(callback);
    }

    /**
     * 添加鼠标按下监听器
     */
    onMousePress(button, callback) {
        if (!this.mousePressListeners.has(button)) {
            this.mousePressListeners.set(button, []);
        }
        this.mousePressListeners.get(button).push(callback);
    }

    /**
     * 添加鼠标释放监听器
     */
    onMouseRelease(button, callback) {
        if (!this.mouseReleaseListeners.has(button)) {
            this.mouseReleaseListeners.set(button, []);
        }
        this.mouseReleaseListeners.get(button).push(callback);
    }

    /**
     * 移除键盘按下监听器
     */
    removeKeyPressListener(keyCode, callback) {
        const listeners = this.keyPressListeners.get(keyCode);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * 移除键盘释放监听器
     */
    removeKeyReleaseListener(keyCode, callback) {
        const listeners = this.keyReleaseListeners.get(keyCode);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * 清除所有监听器
     */
    clearAllListeners() {
        this.keyPressListeners.clear();
        this.keyReleaseListeners.clear();
        this.mousePressListeners.clear();
        this.mouseReleaseListeners.clear();
    }

    /**
     * 更新输入状态（每帧调用）
     */
    update() {
        // 清除上一帧的按下/释放状态
        this.keysPressed.clear();
        this.keysReleased.clear();
        this.mouse.buttonsPressed.clear();
        this.mouse.buttonsReleased.clear();
    }

    /**
     * 获取输入历史（调试用）
     */
    getInputHistory() {
        return [...this.inputBuffer];
    }

    /**
     * 清除输入缓冲
     */
    clearInputBuffer() {
        this.inputBuffer = [];
    }

    /**
     * 设置输入配置
     */
    setInputConfig(config) {
        this.inputConfig = { ...this.inputConfig, ...config };
        console.log('输入配置已更新');
    }

    /**
     * 获取当前输入配置
     */
    getInputConfig() {
        return { ...this.inputConfig };
    }

    /**
     * 检查组合键
     */
    isKeyComboPressed(keys) {
        return keys.every(key => this.isKeyDown(key));
    }

    /**
     * 禁用输入
     */
    disable() {
        this.keys.clear();
        this.mouse.buttons.clear();
        console.log('输入已禁用');
    }

    /**
     * 启用输入
     */
    enable() {
        console.log('输入已启用');
    }

    /**
     * 清理资源
     */
    cleanup() {
        console.log('清理输入管理器...');
        
        // 移除事件监听器
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        document.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('contextmenu', this.handleContextMenu);
        
        // 清除所有状态
        this.keys.clear();
        this.keysPressed.clear();
        this.keysReleased.clear();
        this.mouse.buttons.clear();
        this.mouse.buttonsPressed.clear();
        this.mouse.buttonsReleased.clear();
        
        // 清除所有监听器
        this.clearAllListeners();
        
        // 清除输入缓冲
        this.clearInputBuffer();
        
        console.log('输入管理器清理完成');
    }
}


