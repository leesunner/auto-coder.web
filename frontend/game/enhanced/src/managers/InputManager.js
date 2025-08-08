



/**
 * 输入管理器类
 * 处理键盘、鼠标等输入设备的事件
 */
export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.isInitialized = false;

        // 键盘状态
        this.keys = new Map();
        this.keysPrevious = new Map();
        this.keysPressed = new Set();
        this.keysReleased = new Set();

        // 鼠标状态
        this.mouse = {
            x: 0,
            y: 0,
            buttons: new Map(),
            buttonsPrevious: new Map(),
            wheel: 0,
            isInCanvas: false
        };

        // 触摸状态（移动设备支持）
        this.touches = new Map();

        // 输入配置
        this.config = {
            preventDefaultKeys: ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'],
            enableMouse: true,
            enableTouch: true,
            enableGamepad: false
        };

        // 键位映射
        this.keyMappings = {
            // 移动控制
            'KeyW': 'moveUp',
            'KeyS': 'moveDown',
            'KeyA': 'moveLeft',
            'KeyD': 'moveRight',
            'ArrowUp': 'moveUp',
            'ArrowDown': 'moveDown',
            'ArrowLeft': 'moveLeft',
            'ArrowRight': 'moveRight',

            // 游戏操作
            'Space': 'shoot',
            'Enter': 'confirm',
            'Escape': 'menu',
            'KeyP': 'pause',
            'KeyR': 'restart',

            // 调试功能
            'KeyF': 'debug',
            'KeyG': 'god_mode',
            'KeyT': 'slow_motion'
        };

        // 组合键状态
        this.combos = new Map();
        this.comboTimeout = 500; // 组合键超时时间（毫秒）

        // 事件监听器绑定
        this.boundHandlers = {
            keydown: this.handleKeyDown.bind(this),
            keyup: this.handleKeyUp.bind(this),
            mousedown: this.handleMouseDown.bind(this),
            mouseup: this.handleMouseUp.bind(this),
            mousemove: this.handleMouseMove.bind(this),
            mouseenter: this.handleMouseEnter.bind(this),
            mouseleave: this.handleMouseLeave.bind(this),
            wheel: this.handleWheel.bind(this),
            contextmenu: this.handleContextMenu.bind(this),
            touchstart: this.handleTouchStart.bind(this),
            touchend: this.handleTouchEnd.bind(this),
            touchmove: this.handleTouchMove.bind(this),
            touchcancel: this.handleTouchCancel.bind(this)
        };
    }

    /**
     * 初始化输入管理器
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }

        // 绑定键盘事件
        document.addEventListener('keydown', this.boundHandlers.keydown);
        document.addEventListener('keyup', this.boundHandlers.keyup);

        // 绑定鼠标事件
        if (this.config.enableMouse) {
            this.canvas.addEventListener('mousedown', this.boundHandlers.mousedown);
            this.canvas.addEventListener('mouseup', this.boundHandlers.mouseup);
            this.canvas.addEventListener('mousemove', this.boundHandlers.mousemove);
            this.canvas.addEventListener('mouseenter', this.boundHandlers.mouseenter);
            this.canvas.addEventListener('mouseleave', this.boundHandlers.mouseleave);
            this.canvas.addEventListener('wheel', this.boundHandlers.wheel);
            this.canvas.addEventListener('contextmenu', this.boundHandlers.contextmenu);
        }

        // 绑定触摸事件
        if (this.config.enableTouch) {
            this.canvas.addEventListener('touchstart', this.boundHandlers.touchstart, { passive: false });
            this.canvas.addEventListener('touchend', this.boundHandlers.touchend, { passive: false });
            this.canvas.addEventListener('touchmove', this.boundHandlers.touchmove, { passive: false });
            this.canvas.addEventListener('touchcancel', this.boundHandlers.touchcancel, { passive: false });
        }

        this.isInitialized = true;
        console.log('输入管理器初始化完成');
    }

    /**
     * 更新输入状态
     */
    update(deltaTime) {
        // 保存上一帧的键盘状态
        this.keysPrevious.clear();
        for (const [key, value] of this.keys) {
            this.keysPrevious.set(key, value);
        }

        // 保存上一帧的鼠标状态
        this.mouse.buttonsPrevious.clear();
        for (const [button, value] of this.mouse.buttons) {
            this.mouse.buttonsPrevious.set(button, value);
        }

        // 清空单帧事件
        this.keysPressed.clear();
        this.keysReleased.clear();
        this.mouse.wheel = 0;

        // 更新组合键状态
        this.updateCombos(deltaTime);
    }

    /**
     * 键盘按下事件处理
     */
    handleKeyDown(event) {
        const key = event.code;

        // 防止默认行为
        if (this.config.preventDefaultKeys.includes(key)) {
            event.preventDefault();
        }

        // 更新键盘状态
        if (!this.keys.get(key)) {
            this.keysPressed.add(key);
        }
        this.keys.set(key, true);

        // 检查组合键
        this.checkCombos(key);

        console.debug(`键盘按下: ${key}`);
    }

    /**
     * 键盘释放事件处理
     */
    handleKeyUp(event) {
        const key = event.code;
        
        this.keys.set(key, false);
        this.keysReleased.add(key);

        console.debug(`键盘释放: ${key}`);
    }

    /**
     * 鼠标按下事件处理
     */
    handleMouseDown(event) {
        event.preventDefault();
        
        const button = event.button;
        this.mouse.buttons.set(button, true);
        
        console.debug(`鼠标按下: ${button}`);
    }

    /**
     * 鼠标释放事件处理
     */
    handleMouseUp(event) {
        event.preventDefault();
        
        const button = event.button;
        this.mouse.buttons.set(button, false);
        
        console.debug(`鼠标释放: ${button}`);
    }

    /**
     * 鼠标移动事件处理
     */
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = event.clientX - rect.left;
        this.mouse.y = event.clientY - rect.top;
    }

    /**
     * 鼠标进入画布事件处理
     */
    handleMouseEnter(event) {
        this.mouse.isInCanvas = true;
    }

    /**
     * 鼠标离开画布事件处理
     */
    handleMouseLeave(event) {
        this.mouse.isInCanvas = false;
        // 清空鼠标按键状态
        this.mouse.buttons.clear();
    }

    /**
     * 鼠标滚轮事件处理
     */
    handleWheel(event) {
        event.preventDefault();
        this.mouse.wheel = event.deltaY;
    }

    /**
     * 右键菜单事件处理
     */
    handleContextMenu(event) {
        event.preventDefault();
    }

    /**
     * 触摸开始事件处理
     */
    handleTouchStart(event) {
        event.preventDefault();
        
        for (const touch of event.changedTouches) {
            const rect = this.canvas.getBoundingClientRect();
            this.touches.set(touch.identifier, {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top,
                startX: touch.clientX - rect.left,
                startY: touch.clientY - rect.top,
                startTime: Date.now()
            });
        }
        
        console.debug(`触摸开始: ${event.changedTouches.length} 个触点`);
    }

    /**
     * 触摸结束事件处理
     */
    handleTouchEnd(event) {
        event.preventDefault();
        
        for (const touch of event.changedTouches) {
            this.touches.delete(touch.identifier);
        }
        
        console.debug(`触摸结束: ${event.changedTouches.length} 个触点`);
    }

    /**
     * 触摸移动事件处理
     */
    handleTouchMove(event) {
        event.preventDefault();
        
        for (const touch of event.changedTouches) {
            if (this.touches.has(touch.identifier)) {
                const rect = this.canvas.getBoundingClientRect();
                const touchData = this.touches.get(touch.identifier);
                touchData.x = touch.clientX - rect.left;
                touchData.y = touch.clientY - rect.top;
            }
        }
    }

    /**
     * 触摸取消事件处理
     */
    handleTouchCancel(event) {
        event.preventDefault();
        this.touches.clear();
    }

    /**
     * 检查键是否被按下
     */
    isKeyDown(key) {
        return this.keys.get(key) || false;
    }

    /**
     * 检查键是否刚被按下
     */
    isKeyPressed(key) {
        return this.keysPressed.has(key);
    }

    /**
     * 检查键是否刚被释放
     */
    isKeyReleased(key) {
        return this.keysReleased.has(key);
    }

    /**
     * 检查动作是否被触发
     */
    isActionDown(action) {
        for (const [key, mappedAction] of Object.entries(this.keyMappings)) {
            if (mappedAction === action && this.isKeyDown(key)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检查动作是否刚被触发
     */
    isActionPressed(action) {
        for (const [key, mappedAction] of Object.entries(this.keyMappings)) {
            if (mappedAction === action && this.isKeyPressed(key)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检查鼠标按键状态
     */
    isMouseButtonDown(button) {
        return this.mouse.buttons.get(button) || false;
    }

    /**
     * 检查鼠标按键是否刚被按下
     */
    isMouseButtonPressed(button) {
        return this.mouse.buttons.get(button) && !this.mouse.buttonsPrevious.get(button);
    }

    /**
     * 获取鼠标位置
     */
    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }

    /**
     * 获取鼠标滚轮值
     */
    getMouseWheel() {
        return this.mouse.wheel;
    }

    /**
     * 获取触摸数据
     */
    getTouches() {
        return Array.from(this.touches.values());
    }

    /**
     * 获取主要触摸点
     */
    getPrimaryTouch() {
        const touches = this.getTouches();
        return touches.length > 0 ? touches[0] : null;
    }

    /**
     * 注册组合键
     */
    registerCombo(keys, callback, timeout = this.comboTimeout) {
        const comboId = keys.join('+');
        this.combos.set(comboId, {
            keys: keys,
            callback: callback,
            timeout: timeout,
            currentIndex: 0,
            lastKeyTime: 0
        });
    }

    /**
     * 检查组合键
     */
    checkCombos(key) {
        const currentTime = Date.now();
        
        for (const [comboId, combo] of this.combos) {
            if (combo.keys[combo.currentIndex] === key) {
                if (combo.currentIndex === 0 || currentTime - combo.lastKeyTime < combo.timeout) {
                    combo.currentIndex++;
                    combo.lastKeyTime = currentTime;
                    
                    if (combo.currentIndex === combo.keys.length) {
                        // 组合键完成
                        combo.callback();
                        combo.currentIndex = 0;
                    }
                } else {
                    // 超时，重置
                    combo.currentIndex = key === combo.keys[0] ? 1 : 0;
                    combo.lastKeyTime = currentTime;
                }
            } else {
                // 错误的键，重置
                combo.currentIndex = key === combo.keys[0] ? 1 : 0;
                combo.lastKeyTime = key === combo.keys[0] ? currentTime : 0;
            }
        }
    }

    /**
     * 更新组合键状态
     */
    updateCombos(deltaTime) {
        const currentTime = Date.now();
        
        for (const combo of this.combos.values()) {
            if (combo.currentIndex > 0 && currentTime - combo.lastKeyTime > combo.timeout) {
                combo.currentIndex = 0;
            }
        }
    }

    /**
     * 设置键位映射
     */
    setKeyMapping(key, action) {
        this.keyMappings[key] = action;
    }

    /**
     * 获取键位映射
     */
    getKeyMapping(action) {
        for (const [key, mappedAction] of Object.entries(this.keyMappings)) {
            if (mappedAction === action) {
                return key;
            }
        }
        return null;
    }

    /**
     * 获取移动方向
     */
    getMovementDirection() {
        const direction = { x: 0, y: 0 };
        
        if (this.isActionDown('moveUp')) direction.y -= 1;
        if (this.isActionDown('moveDown')) direction.y += 1;
        if (this.isActionDown('moveLeft')) direction.x -= 1;
        if (this.isActionDown('moveRight')) direction.x += 1;
        
        // 归一化对角线移动
        if (direction.x !== 0 && direction.y !== 0) {
            const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
            direction.x /= length;
            direction.y /= length;
        }
        
        return direction;
    }

    /**
     * 获取输入状态摘要
     */
    getInputSummary() {
        return {
            keys: {
                active: Array.from(this.keys.entries()).filter(([key, pressed]) => pressed).map(([key]) => key),
                pressed: Array.from(this.keysPressed),
                released: Array.from(this.keysReleased)
            },
            mouse: {
                position: { x: this.mouse.x, y: this.mouse.y },
                buttons: Array.from(this.mouse.buttons.entries()).filter(([button, pressed]) => pressed).map(([button]) => button),
                wheel: this.mouse.wheel,
                inCanvas: this.mouse.isInCanvas
            },
            touches: this.getTouches().length
        };
    }

    /**
     * 清理输入管理器
     */
    cleanup() {
        // 移除键盘事件监听器
        document.removeEventListener('keydown', this.boundHandlers.keydown);
        document.removeEventListener('keyup', this.boundHandlers.keyup);

        // 移除鼠标事件监听器
        if (this.config.enableMouse) {
            this.canvas.removeEventListener('mousedown', this.boundHandlers.mousedown);
            this.canvas.removeEventListener('mouseup', this.boundHandlers.mouseup);
            this.canvas.removeEventListener('mousemove', this.boundHandlers.mousemove);
            this.canvas.removeEventListener('mouseenter', this.boundHandlers.mouseenter);
            this.canvas.removeEventListener('mouseleave', this.boundHandlers.mouseleave);
            this.canvas.removeEventListener('wheel', this.boundHandlers.wheel);
            this.canvas.removeEventListener('contextmenu', this.boundHandlers.contextmenu);
        }

        // 移除触摸事件监听器
        if (this.config.enableTouch) {
            this.canvas.removeEventListener('touchstart', this.boundHandlers.touchstart);
            this.canvas.removeEventListener('touchend', this.boundHandlers.touchend);
            this.canvas.removeEventListener('touchmove', this.boundHandlers.touchmove);
            this.canvas.removeEventListener('touchcancel', this.boundHandlers.touchcancel);
        }

        // 清空状态
        this.keys.clear();
        this.keysPrevious.clear();
        this.keysPressed.clear();
        this.keysReleased.clear();
        this.mouse.buttons.clear();
        this.mouse.buttonsPrevious.clear();
        this.touches.clear();
        this.combos.clear();

        this.isInitialized = false;
        console.log('输入管理器已清理');
    }
}




