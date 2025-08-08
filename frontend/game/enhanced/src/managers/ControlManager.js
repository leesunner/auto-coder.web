











import { EventEmitter } from '../utils/EventEmitter.js';

/**
 * 控制管理器
 * 处理游戏中的所有输入控制，包括键盘、鼠标、触摸等
 */
export class ControlManager extends EventEmitter {
    constructor() {
        super();
        
        // 输入状态
        this.keys = new Map();
        this.mouse = {
            x: 0,
            y: 0,
            leftButton: false,
            rightButton: false,
            middleButton: false,
            wheel: 0
        };
        
        // 触摸状态（移动设备支持）
        this.touches = new Map();
        
        // 控制方案
        this.controlSchemes = {
            player1: {
                up: ['ArrowUp', 'KeyW'],
                down: ['ArrowDown', 'KeyS'],
                left: ['ArrowLeft', 'KeyA'],
                right: ['ArrowRight', 'KeyD'],
                shoot: ['Space', 'KeyJ'],
                special: ['ShiftLeft', 'KeyK'],
                pause: ['Escape', 'KeyP']
            },
            player2: {
                up: ['KeyI'],
                down: ['KeyK'],
                left: ['KeyJ'],
                right: ['KeyL'],
                shoot: ['KeyU'],
                special: ['KeyO'],
                pause: ['KeyP']
            },
            menu: {
                up: ['ArrowUp', 'KeyW'],
                down: ['ArrowDown', 'KeyS'],
                left: ['ArrowLeft', 'KeyA'],
                right: ['ArrowRight', 'KeyD'],
                select: ['Enter', 'Space'],
                back: ['Escape', 'Backspace']
            }
        };
        
        // 当前激活的控制方案
        this.activeScheme = 'player1';
        
        // 输入历史（用于组合键检测）
        this.inputHistory = [];
        this.maxHistoryLength = 10;
        
        // 重复键处理
        this.keyRepeat = {
            delay: 300,    // 首次重复延迟（毫秒）
            interval: 50,  // 重复间隔（毫秒）
            keys: new Map() // 记录按键时间
        };
        
        // 手柄支持
        this.gamepads = new Map();
        this.gamepadDeadzone = 0.1;
        
        // 虚拟控制器（移动设备）
        this.virtualController = {
            enabled: false,
            joystick: {
                x: 0,
                y: 0,
                active: false,
                element: null
            },
            buttons: new Map()
        };
        
        // 组合键定义
        this.combos = new Map();
        this.comboTimeout = 1000; // 组合键超时时间
        
        // 输入过滤器
        this.inputFilters = new Map();
        
        // 事件绑定状态
        this.eventsBound = false;
        
        // 初始化
        this.initialize();
    }

    /**
     * 初始化控制管理器
     */
    initialize() {
        // 检测设备类型
        this.detectDeviceType();
        
        // 绑定事件监听器
        this.bindEventListeners();
        
        // 初始化虚拟控制器（如果需要）
        if (this.isMobileDevice()) {
            this.initializeVirtualController();
        }
        
        // 定义默认组合键
        this.setupDefaultCombos();
        
        this.emit('initialized');
    }

    /**
     * 检测设备类型
     */
    detectDeviceType() {
        this.deviceType = {
            isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            isTablet: /iPad|Android/i.test(navigator.userAgent) && window.innerWidth > 768,
            hasTouch: 'ontouchstart' in window,
            hasGamepad: 'getGamepads' in navigator
        };
    }

    /**
     * 绑定事件监听器
     */
    bindEventListeners() {
        if (this.eventsBound) return;
        
        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // 鼠标事件
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('wheel', (e) => this.handleMouseWheel(e));
        
        // 触摸事件
        if (this.deviceType.hasTouch) {
            document.addEventListener('touchstart', (e) => this.handleTouchStart(e));
            document.addEventListener('touchend', (e) => this.handleTouchEnd(e));
            document.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        }
        
        // 手柄事件
        if (this.deviceType.hasGamepad) {
            window.addEventListener('gamepadconnected', (e) => this.handleGamepadConnected(e));
            window.addEventListener('gamepaddisconnected', (e) => this.handleGamepadDisconnected(e));
        }
        
        // 窗口焦点事件
        window.addEventListener('blur', () => this.handleWindowBlur());
        window.addEventListener('focus', () => this.handleWindowFocus());
        
        this.eventsBound = true;
    }

    /**
     * 解绑事件监听器
     */
    unbindEventListeners() {
        if (!this.eventsBound) return;
        
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        document.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('wheel', this.handleMouseWheel);
        
        if (this.deviceType.hasTouch) {
            document.removeEventListener('touchstart', this.handleTouchStart);
            document.removeEventListener('touchend', this.handleTouchEnd);
            document.removeEventListener('touchmove', this.handleTouchMove);
        }
        
        if (this.deviceType.hasGamepad) {
            window.removeEventListener('gamepadconnected', this.handleGamepadConnected);
            window.removeEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
        }
        
        window.removeEventListener('blur', this.handleWindowBlur);
        window.removeEventListener('focus', this.handleWindowFocus);
        
        this.eventsBound = false;
    }

    /**
     * 键盘按下事件处理
     */
    handleKeyDown(event) {
        const keyCode = event.code;
        
        // 防止浏览器默认行为
        if (this.shouldPreventDefault(keyCode)) {
            event.preventDefault();
        }
        
        // 如果键已经按下，则忽略（防止重复触发）
        if (this.keys.get(keyCode)) {
            return;
        }
        
        // 记录按键状态
        this.keys.set(keyCode, true);
        this.keyRepeat.keys.set(keyCode, Date.now());
        
        // 添加到输入历史
        this.addToInputHistory('keydown', keyCode);
        
        // 检查组合键
        this.checkCombos();
        
        // 发送按键事件
        this.emit('keydown', {
            code: keyCode,
            key: event.key,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey
        });
        
        // 检查动作映射
        this.checkActionMapping('keydown', keyCode);
    }

    /**
     * 键盘释放事件处理
     */
    handleKeyUp(event) {
        const keyCode = event.code;
        
        // 更新按键状态
        this.keys.set(keyCode, false);
        this.keyRepeat.keys.delete(keyCode);
        
        // 添加到输入历史
        this.addToInputHistory('keyup', keyCode);
        
        // 发送释放事件
        this.emit('keyup', {
            code: keyCode,
            key: event.key,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey
        });
        
        // 检查动作映射
        this.checkActionMapping('keyup', keyCode);
    }

    /**
     * 鼠标按下事件处理
     */
    handleMouseDown(event) {
        switch (event.button) {
            case 0: // 左键
                this.mouse.leftButton = true;
                break;
            case 1: // 中键
                this.mouse.middleButton = true;
                break;
            case 2: // 右键
                this.mouse.rightButton = true;
                break;
        }
        
        this.emit('mousedown', {
            button: event.button,
            x: this.mouse.x,
            y: this.mouse.y,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey
        });
    }

    /**
     * 鼠标释放事件处理
     */
    handleMouseUp(event) {
        switch (event.button) {
            case 0: // 左键
                this.mouse.leftButton = false;
                break;
            case 1: // 中键
                this.mouse.middleButton = false;
                break;
            case 2: // 右键
                this.mouse.rightButton = false;
                break;
        }
        
        this.emit('mouseup', {
            button: event.button,
            x: this.mouse.x,
            y: this.mouse.y,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey
        });
    }

    /**
     * 鼠标移动事件处理
     */
    handleMouseMove(event) {
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
        
        this.emit('mousemove', {
            x: this.mouse.x,
            y: this.mouse.y,
            deltaX: event.movementX || 0,
            deltaY: event.movementY || 0
        });
    }

    /**
     * 鼠标滚轮事件处理
     */
    handleMouseWheel(event) {
        this.mouse.wheel = event.deltaY;
        
        this.emit('mousewheel', {
            delta: event.deltaY,
            x: this.mouse.x,
            y: this.mouse.y
        });
        
        // 重置滚轮值
        setTimeout(() => {
            this.mouse.wheel = 0;
        }, 100);
    }

    /**
     * 触摸开始事件处理
     */
    handleTouchStart(event) {
        event.preventDefault();
        
        for (const touch of event.changedTouches) {
            this.touches.set(touch.identifier, {
                id: touch.identifier,
                x: touch.clientX,
                y: touch.clientY,
                startX: touch.clientX,
                startY: touch.clientY,
                startTime: Date.now()
            });
        }
        
        this.emit('touchstart', {
            touches: Array.from(this.touches.values())
        });
    }

    /**
     * 触摸结束事件处理
     */
    handleTouchEnd(event) {
        event.preventDefault();
        
        for (const touch of event.changedTouches) {
            const touchData = this.touches.get(touch.identifier);
            if (touchData) {
                this.touches.delete(touch.identifier);
                
                // 检测点击/轻触
                const duration = Date.now() - touchData.startTime;
                const distance = Math.sqrt(
                    Math.pow(touch.clientX - touchData.startX, 2) +
                    Math.pow(touch.clientY - touchData.startY, 2)
                );
                
                if (duration < 300 && distance < 10) {
                    this.emit('tap', {
                        x: touch.clientX,
                        y: touch.clientY
                    });
                }
            }
        }
        
        this.emit('touchend', {
            touches: Array.from(this.touches.values())
        });
    }

    /**
     * 触摸移动事件处理
     */
    handleTouchMove(event) {
        event.preventDefault();
        
        for (const touch of event.changedTouches) {
            const touchData = this.touches.get(touch.identifier);
            if (touchData) {
                touchData.x = touch.clientX;
                touchData.y = touch.clientY;
            }
        }
        
        this.emit('touchmove', {
            touches: Array.from(this.touches.values())
        });
    }

    /**
     * 手柄连接事件处理
     */
    handleGamepadConnected(event) {
        const gamepad = event.gamepad;
        this.gamepads.set(gamepad.index, gamepad);
        
        this.emit('gamepadconnected', {
            gamepad: gamepad,
            index: gamepad.index
        });
    }

    /**
     * 手柄断开事件处理
     */
    handleGamepadDisconnected(event) {
        const gamepad = event.gamepad;
        this.gamepads.delete(gamepad.index);
        
        this.emit('gamepaddisconnected', {
            gamepad: gamepad,
            index: gamepad.index
        });
    }

    /**
     * 窗口失焦事件处理
     */
    handleWindowBlur() {
        // 清除所有按键状态
        this.keys.clear();
        this.mouse.leftButton = false;
        this.mouse.rightButton = false;
        this.mouse.middleButton = false;
        
        this.emit('windowblur');
    }

    /**
     * 窗口获焦事件处理
     */
    handleWindowFocus() {
        this.emit('windowfocus');
    }

    /**
     * 添加到输入历史
     */
    addToInputHistory(type, code) {
        this.inputHistory.push({
            type: type,
            code: code,
            timestamp: Date.now()
        });
        
        // 限制历史长度
        if (this.inputHistory.length > this.maxHistoryLength) {
            this.inputHistory.shift();
        }
    }

    /**
     * 检查组合键
     */
    checkCombos() {
        const now = Date.now();
        
        for (const [comboName, combo] of this.combos) {
            if (this.isComboActive(combo, now)) {
                this.emit('combo', {
                    name: comboName,
                    combo: combo
                });
            }
        }
    }

    /**
     * 检查组合键是否激活
     */
    isComboActive(combo, currentTime) {
        // 检查序列组合键
        if (combo.sequence) {
            return this.checkSequenceCombo(combo.sequence, currentTime);
        }
        
        // 检查同时按键组合
        if (combo.keys) {
            return combo.keys.every(key => this.isKeyPressed(key));
        }
        
        return false;
    }

    /**
     * 检查序列组合键
     */
    checkSequenceCombo(sequence, currentTime) {
        if (sequence.length === 0) return false;
        
        let sequenceIndex = 0;
        let lastTimestamp = 0;
        
        for (let i = this.inputHistory.length - 1; i >= 0; i--) {
            const input = this.inputHistory[i];
            
            if (currentTime - input.timestamp > this.comboTimeout) {
                break;
            }
            
            if (input.type === 'keydown' && input.code === sequence[sequenceIndex]) {
                if (sequenceIndex === 0 || input.timestamp > lastTimestamp) {
                    sequenceIndex++;
                    lastTimestamp = input.timestamp;
                    
                    if (sequenceIndex === sequence.length) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    /**
     * 检查动作映射
     */
    checkActionMapping(eventType, keyCode) {
        const scheme = this.controlSchemes[this.activeScheme];
        if (!scheme) return;
        
        for (const [action, keys] of Object.entries(scheme)) {
            if (keys.includes(keyCode)) {
                this.emit('action', {
                    action: action,
                    type: eventType,
                    key: keyCode
                });
            }
        }
    }

    /**
     * 更新手柄状态
     */
    updateGamepads() {
        if (!this.deviceType.hasGamepad) return;
        
        const gamepads = navigator.getGamepads();
        
        for (let i = 0; i < gamepads.length; i++) {
            const gamepad = gamepads[i];
            if (!gamepad) continue;
            
            const previousState = this.gamepads.get(i);
            this.gamepads.set(i, gamepad);
            
            // 检查按钮状态变化
            if (previousState) {
                for (let j = 0; j < gamepad.buttons.length; j++) {
                    const button = gamepad.buttons[j];
                    const prevButton = previousState.buttons[j];
                    
                    if (button.pressed && !prevButton.pressed) {
                        this.emit('gamepadbutton', {
                            gamepadIndex: i,
                            buttonIndex: j,
                            pressed: true
                        });
                    } else if (!button.pressed && prevButton.pressed) {
                        this.emit('gamepadbutton', {
                            gamepadIndex: i,
                            buttonIndex: j,
                            pressed: false
                        });
                    }
                }
                
                // 检查摇杆状态
                for (let j = 0; j < gamepad.axes.length; j += 2) {
                    const x = gamepad.axes[j];
                    const y = gamepad.axes[j + 1];
                    
                    if (Math.abs(x) > this.gamepadDeadzone || Math.abs(y) > this.gamepadDeadzone) {
                        this.emit('gamepadstick', {
                            gamepadIndex: i,
                            stickIndex: j / 2,
                            x: x,
                            y: y
                        });
                    }
                }
            }
        }
    }

    /**
     * 设置默认组合键
     */
    setupDefaultCombos() {
        // 调试模式组合键
        this.addCombo('debugMode', {
            keys: ['ControlLeft', 'ShiftLeft', 'KeyD']
        });
        
        // 快速重启组合键
        this.addCombo('quickRestart', {
            sequence: ['KeyR', 'KeyR']
        });
        
        // 暂停/恢复组合键
        this.addCombo('pauseToggle', {
            keys: ['ControlLeft', 'KeyP']
        });
    }

    /**
     * 初始化虚拟控制器
     */
    initializeVirtualController() {
        this.virtualController.enabled = true;
        // 这里可以创建虚拟控制器的DOM元素
        // 由于这是一个较复杂的功能，这里只做基础设置
    }

    /**
     * 添加组合键
     */
    addCombo(name, combo) {
        this.combos.set(name, combo);
    }

    /**
     * 移除组合键
     */
    removeCombo(name) {
        this.combos.delete(name);
    }

    /**
     * 设置控制方案
     */
    setControlScheme(schemeName) {
        if (this.controlSchemes[schemeName]) {
            this.activeScheme = schemeName;
            this.emit('schemeChanged', { scheme: schemeName });
        }
    }

    /**
     * 自定义控制映射
     */
    setControlMapping(scheme, action, keys) {
        if (!this.controlSchemes[scheme]) {
            this.controlSchemes[scheme] = {};
        }
        
        this.controlSchemes[scheme][action] = Array.isArray(keys) ? keys : [keys];
        this.emit('mappingChanged', { scheme, action, keys });
    }

    /**
     * 检查按键是否按下
     */
    isKeyPressed(keyCode) {
        return this.keys.get(keyCode) || false;
    }

    /**
     * 检查动作是否激活
     */
    isActionActive(action) {
        const scheme = this.controlSchemes[this.activeScheme];
        if (!scheme || !scheme[action]) return false;
        
        return scheme[action].some(key => this.isKeyPressed(key));
    }

    /**
     * 获取鼠标位置
     */
    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }

    /**
     * 检查鼠标按钮是否按下
     */
    isMouseButtonPressed(button) {
        switch (button) {
            case 0:
            case 'left':
                return this.mouse.leftButton;
            case 1:
            case 'middle':
                return this.mouse.middleButton;
            case 2:
            case 'right':
                return this.mouse.rightButton;
            default:
                return false;
        }
    }

    /**
     * 获取手柄状态
     */
    getGamepadState(index) {
        return this.gamepads.get(index) || null;
    }

    /**
     * 检查是否应该阻止默认行为
     */
    shouldPreventDefault(keyCode) {
        // 阻止方向键、空格键等的默认行为
        const preventKeys = [
            'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'Space', 'Tab'
        ];
        
        return preventKeys.includes(keyCode);
    }

    /**
     * 是否为移动设备
     */
    isMobileDevice() {
        return this.deviceType.isMobile;
    }

    /**
     * 更新控制管理器
     */
    update(deltaTime) {
        // 更新手柄状态
        this.updateGamepads();
        
        // 处理按键重复
        this.handleKeyRepeat(deltaTime);
        
        // 清理过期的输入历史
        this.cleanupInputHistory();
    }

    /**
     * 处理按键重复
     */
    handleKeyRepeat(deltaTime) {
        const now = Date.now();
        
        for (const [keyCode, pressTime] of this.keyRepeat.keys) {
            if (this.isKeyPressed(keyCode)) {
                const elapsed = now - pressTime;
                
                if (elapsed > this.keyRepeat.delay) {
                    const repeatCount = Math.floor((elapsed - this.keyRepeat.delay) / this.keyRepeat.interval);
                    
                    if (repeatCount > 0) {
                        this.emit('keyrepeat', {
                            code: keyCode,
                            repeatCount: repeatCount
                        });
                    }
                }
            }
        }
    }

    /**
     * 清理输入历史
     */
    cleanupInputHistory() {
        const now = Date.now();
        const maxAge = this.comboTimeout * 2;
        
        this.inputHistory = this.inputHistory.filter(
            input => now - input.timestamp < maxAge
        );
    }

    /**
     * 重置所有输入状态
     */
    reset() {
        this.keys.clear();
        this.mouse.leftButton = false;
        this.mouse.rightButton = false;
        this.mouse.middleButton = false;
        this.mouse.wheel = 0;
        this.touches.clear();
        this.inputHistory = [];
        this.keyRepeat.keys.clear();
    }

    /**
     * 获取设备信息
     */
    getDeviceInfo() {
        return { ...this.deviceType };
    }

    /**
     * 清理资源
     */
    dispose() {
        // 解绑事件监听器
        this.unbindEventListeners();
        
        // 清理状态
        this.reset();
        this.combos.clear();
        this.gamepads.clear();
        
        this.emit('disposed');
    }
}












