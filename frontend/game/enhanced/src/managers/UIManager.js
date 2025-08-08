










import { EventEmitter } from '../utils/EventEmitter.js';

/**
 * UI管理器
 * 管理游戏中的所有用户界面元素，包括菜单、HUD、对话框等
 */
export class UIManager extends EventEmitter {
    constructor(canvas, context) {
        super();
        
        this.canvas = canvas;
        this.context = context;
        
        // UI元素容器
        this.uiElements = new Map();
        this.activeMenus = new Map();
        this.notifications = [];
        
        // UI层级
        this.layers = {
            BACKGROUND: 0,
            GAME_UI: 1,
            MENUS: 2,
            DIALOGS: 3,
            NOTIFICATIONS: 4,
            TOOLTIPS: 5
        };
        
        // 字体设置
        this.fonts = {
            small: '12px Arial',
            normal: '16px Arial',
            large: '24px Arial',
            title: '32px Arial, bold',
            score: '20px monospace'
        };
        
        // 颜色主题
        this.theme = {
            primary: '#4CAF50',
            secondary: '#2196F3',
            accent: '#FF9800',
            background: '#263238',
            surface: '#37474F',
            text: '#FFFFFF',
            textSecondary: '#B0BEC5',
            success: '#4CAF50',
            warning: '#FF9800',
            error: '#F44336',
            transparent: 'rgba(0, 0, 0, 0.7)'
        };
        
        // 动画系统
        this.animations = new Map();
        this.animationId = 0;
        
        // 输入处理
        this.mousePosition = { x: 0, y: 0 };
        this.hoveredElement = null;
        this.pressedElement = null;
        
        // 通知系统
        this.notificationSettings = {
            maxNotifications: 5,
            defaultDuration: 3000,
            slideSpeed: 300
        };
        
        // 初始化
        this.initialize();
    }

    /**
     * 初始化UI管理器
     */
    initialize() {
        // 创建基础UI元素
        this.createBaseUI();
        
        // 绑定事件监听器
        this.bindEventListeners();
        
        this.emit('initialized');
    }

    /**
     * 创建基础UI元素
     */
    createBaseUI() {
        // 创建主菜单
        this.createMainMenu();
        
        // 创建游戏HUD
        this.createGameHUD();
        
        // 创建暂停菜单
        this.createPauseMenu();
        
        // 创建游戏结束界面
        this.createGameOverScreen();
        
        // 创建设置界面
        this.createSettingsScreen();
    }

    /**
     * 创建主菜单
     */
    createMainMenu() {
        const mainMenu = {
            id: 'mainMenu',
            type: 'menu',
            layer: this.layers.MENUS,
            visible: false,
            elements: [
                {
                    type: 'title',
                    text: '坦克大战',
                    x: this.canvas.width / 2,
                    y: 150,
                    font: this.fonts.title,
                    color: this.theme.text,
                    align: 'center'
                },
                {
                    type: 'button',
                    id: 'startGame',
                    text: '开始游戏',
                    x: this.canvas.width / 2 - 100,
                    y: 250,
                    width: 200,
                    height: 50,
                    action: 'startGame'
                },
                {
                    type: 'button',
                    id: 'settings',
                    text: '设置',
                    x: this.canvas.width / 2 - 100,
                    y: 320,
                    width: 200,
                    height: 50,
                    action: 'showSettings'
                },
                {
                    type: 'button',
                    id: 'help',
                    text: '帮助',
                    x: this.canvas.width / 2 - 100,
                    y: 390,
                    width: 200,
                    height: 50,
                    action: 'showHelp'
                },
                {
                    type: 'text',
                    text: '最高分: 0',
                    x: this.canvas.width / 2,
                    y: 500,
                    font: this.fonts.normal,
                    color: this.theme.textSecondary,
                    align: 'center'
                }
            ]
        };
        
        this.uiElements.set('mainMenu', mainMenu);
    }

    /**
     * 创建游戏HUD
     */
    createGameHUD() {
        const gameHUD = {
            id: 'gameHUD',
            type: 'hud',
            layer: this.layers.GAME_UI,
            visible: false,
            elements: [
                {
                    type: 'text',
                    id: 'score',
                    text: '分数: 0',
                    x: 20,
                    y: 30,
                    font: this.fonts.score,
                    color: this.theme.text
                },
                {
                    type: 'text',
                    id: 'lives',
                    text: '生命: 3',
                    x: 20,
                    y: 60,
                    font: this.fonts.normal,
                    color: this.theme.text
                },
                {
                    type: 'text',
                    id: 'level',
                    text: '关卡: 1',
                    x: 20,
                    y: 90,
                    font: this.fonts.normal,
                    color: this.theme.text
                },
                {
                    type: 'text',
                    id: 'enemies',
                    text: '敌人: 0',
                    x: this.canvas.width - 120,
                    y: 30,
                    font: this.fonts.normal,
                    color: this.theme.text
                },
                {
                    type: 'progressBar',
                    id: 'timeBar',
                    x: this.canvas.width / 2 - 100,
                    y: 20,
                    width: 200,
                    height: 10,
                    value: 100,
                    maxValue: 100,
                    color: this.theme.warning,
                    backgroundColor: this.theme.surface
                }
            ]
        };
        
        this.uiElements.set('gameHUD', gameHUD);
    }

    /**
     * 创建暂停菜单
     */
    createPauseMenu() {
        const pauseMenu = {
            id: 'pauseMenu',
            type: 'menu',
            layer: this.layers.MENUS,
            visible: false,
            modal: true,
            elements: [
                {
                    type: 'background',
                    color: this.theme.transparent,
                    x: 0,
                    y: 0,
                    width: this.canvas.width,
                    height: this.canvas.height
                },
                {
                    type: 'panel',
                    x: this.canvas.width / 2 - 150,
                    y: this.canvas.height / 2 - 150,
                    width: 300,
                    height: 300,
                    color: this.theme.surface,
                    borderColor: this.theme.primary,
                    borderWidth: 2
                },
                {
                    type: 'title',
                    text: '游戏暂停',
                    x: this.canvas.width / 2,
                    y: this.canvas.height / 2 - 100,
                    font: this.fonts.large,
                    color: this.theme.text,
                    align: 'center'
                },
                {
                    type: 'button',
                    id: 'resume',
                    text: '继续游戏',
                    x: this.canvas.width / 2 - 75,
                    y: this.canvas.height / 2 - 25,
                    width: 150,
                    height: 40,
                    action: 'resumeGame'
                },
                {
                    type: 'button',
                    id: 'mainMenu',
                    text: '返回主菜单',
                    x: this.canvas.width / 2 - 75,
                    y: this.canvas.height / 2 + 25,
                    width: 150,
                    height: 40,
                    action: 'backToMenu'
                }
            ]
        };
        
        this.uiElements.set('pauseMenu', pauseMenu);
    }

    /**
     * 创建游戏结束界面
     */
    createGameOverScreen() {
        const gameOverScreen = {
            id: 'gameOverScreen',
            type: 'screen',
            layer: this.layers.MENUS,
            visible: false,
            modal: true,
            elements: [
                {
                    type: 'background',
                    color: this.theme.transparent,
                    x: 0,
                    y: 0,
                    width: this.canvas.width,
                    height: this.canvas.height
                },
                {
                    type: 'panel',
                    x: this.canvas.width / 2 - 200,
                    y: this.canvas.height / 2 - 200,
                    width: 400,
                    height: 400,
                    color: this.theme.surface,
                    borderColor: this.theme.error,
                    borderWidth: 3
                },
                {
                    type: 'title',
                    text: '游戏结束',
                    x: this.canvas.width / 2,
                    y: this.canvas.height / 2 - 150,
                    font: this.fonts.title,
                    color: this.theme.error,
                    align: 'center'
                },
                {
                    type: 'text',
                    id: 'finalScore',
                    text: '最终分数: 0',
                    x: this.canvas.width / 2,
                    y: this.canvas.height / 2 - 100,
                    font: this.fonts.large,
                    color: this.theme.text,
                    align: 'center'
                },
                {
                    type: 'text',
                    id: 'highScore',
                    text: '最高分: 0',
                    x: this.canvas.width / 2,
                    y: this.canvas.height / 2 - 60,
                    font: this.fonts.normal,
                    color: this.theme.textSecondary,
                    align: 'center'
                },
                {
                    type: 'button',
                    id: 'playAgain',
                    text: '再玩一次',
                    x: this.canvas.width / 2 - 75,
                    y: this.canvas.height / 2,
                    width: 150,
                    height: 40,
                    action: 'restartGame'
                },
                {
                    type: 'button',
                    id: 'mainMenu',
                    text: '返回主菜单',
                    x: this.canvas.width / 2 - 75,
                    y: this.canvas.height / 2 + 50,
                    width: 150,
                    height: 40,
                    action: 'backToMenu'
                }
            ]
        };
        
        this.uiElements.set('gameOverScreen', gameOverScreen);
    }

    /**
     * 创建设置界面
     */
    createSettingsScreen() {
        const settingsScreen = {
            id: 'settingsScreen',
            type: 'screen',
            layer: this.layers.MENUS,
            visible: false,
            modal: true,
            elements: [
                {
                    type: 'background',
                    color: this.theme.transparent,
                    x: 0,
                    y: 0,
                    width: this.canvas.width,
                    height: this.canvas.height
                },
                {
                    type: 'panel',
                    x: this.canvas.width / 2 - 250,
                    y: this.canvas.height / 2 - 250,
                    width: 500,
                    height: 500,
                    color: this.theme.surface,
                    borderColor: this.theme.primary,
                    borderWidth: 2
                },
                {
                    type: 'title',
                    text: '设置',
                    x: this.canvas.width / 2,
                    y: this.canvas.height / 2 - 200,
                    font: this.fonts.title,
                    color: this.theme.text,
                    align: 'center'
                },
                // 音量设置
                {
                    type: 'text',
                    text: '主音量',
                    x: this.canvas.width / 2 - 200,
                    y: this.canvas.height / 2 - 150,
                    font: this.fonts.normal,
                    color: this.theme.text
                },
                {
                    type: 'slider',
                    id: 'masterVolume',
                    x: this.canvas.width / 2 - 100,
                    y: this.canvas.height / 2 - 160,
                    width: 200,
                    height: 20,
                    value: 100,
                    minValue: 0,
                    maxValue: 100,
                    action: 'setMasterVolume'
                },
                // 音效音量
                {
                    type: 'text',
                    text: '音效音量',
                    x: this.canvas.width / 2 - 200,
                    y: this.canvas.height / 2 - 100,
                    font: this.fonts.normal,
                    color: this.theme.text
                },
                {
                    type: 'slider',
                    id: 'sfxVolume',
                    x: this.canvas.width / 2 - 100,
                    y: this.canvas.height / 2 - 110,
                    width: 200,
                    height: 20,
                    value: 80,
                    minValue: 0,
                    maxValue: 100,
                    action: 'setSFXVolume'
                },
                // 难度设置
                {
                    type: 'text',
                    text: '难度',
                    x: this.canvas.width / 2 - 200,
                    y: this.canvas.height / 2 - 50,
                    font: this.fonts.normal,
                    color: this.theme.text
                },
                {
                    type: 'dropdown',
                    id: 'difficulty',
                    x: this.canvas.width / 2 - 100,
                    y: this.canvas.height / 2 - 60,
                    width: 150,
                    height: 30,
                    options: ['简单', '普通', '困难'],
                    selectedIndex: 1,
                    action: 'setDifficulty'
                },
                // 按钮
                {
                    type: 'button',
                    id: 'back',
                    text: '返回',
                    x: this.canvas.width / 2 - 75,
                    y: this.canvas.height / 2 + 150,
                    width: 150,
                    height: 40,
                    action: 'backFromSettings'
                }
            ]
        };
        
        this.uiElements.set('settingsScreen', settingsScreen);
    }

    /**
     * 绑定事件监听器
     */
    bindEventListeners() {
        // 鼠标事件
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    /**
     * 处理鼠标移动
     */
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePosition.x = event.clientX - rect.left;
        this.mousePosition.y = event.clientY - rect.top;
        
        // 检查悬停元素
        const element = this.getElementAt(this.mousePosition.x, this.mousePosition.y);
        
        if (element !== this.hoveredElement) {
            if (this.hoveredElement) {
                this.emit('elementHoverExit', { element: this.hoveredElement });
            }
            
            this.hoveredElement = element;
            
            if (this.hoveredElement) {
                this.emit('elementHoverEnter', { element: this.hoveredElement });
            }
        }
        
        // 更新鼠标样式
        this.updateCursor();
    }

    /**
     * 处理鼠标按下
     */
    handleMouseDown(event) {
        const element = this.getElementAt(this.mousePosition.x, this.mousePosition.y);
        
        if (element && this.isInteractable(element)) {
            this.pressedElement = element;
            this.emit('elementPressed', { element: element });
        }
    }

    /**
     * 处理鼠标释放
     */
    handleMouseUp(event) {
        if (this.pressedElement) {
            this.emit('elementReleased', { element: this.pressedElement });
            this.pressedElement = null;
        }
    }

    /**
     * 处理点击
     */
    handleClick(event) {
        const element = this.getElementAt(this.mousePosition.x, this.mousePosition.y);
        
        if (element && this.isInteractable(element)) {
            this.handleElementAction(element);
        }
    }

    /**
     * 处理键盘按下
     */
    handleKeyDown(event) {
        // 处理全局快捷键
        switch (event.code) {
            case 'Escape':
                this.emit('escapePressed');
                break;
            case 'Enter':
                this.emit('enterPressed');
                break;
        }
    }

    /**
     * 获取指定位置的UI元素
     */
    getElementAt(x, y) {
        // 按层级从高到低检查
        const sortedElements = Array.from(this.uiElements.values())
            .filter(ui => ui.visible)
            .sort((a, b) => b.layer - a.layer);
        
        for (const ui of sortedElements) {
            for (const element of ui.elements) {
                if (this.isPointInElement(x, y, element)) {
                    return element;
                }
            }
        }
        
        return null;
    }

    /**
     * 检查点是否在元素内
     */
    isPointInElement(x, y, element) {
        switch (element.type) {
            case 'button':
            case 'panel':
            case 'slider':
            case 'dropdown':
                return x >= element.x && x <= element.x + element.width &&
                       y >= element.y && y <= element.y + element.height;
            
            case 'progressBar':
                return x >= element.x && x <= element.x + element.width &&
                       y >= element.y && y <= element.y + element.height;
            
            default:
                return false;
        }
    }

    /**
     * 检查元素是否可交互
     */
    isInteractable(element) {
        return element && (
            element.type === 'button' ||
            element.type === 'slider' ||
            element.type === 'dropdown'
        );
    }

    /**
     * 处理元素动作
     */
    handleElementAction(element) {
        if (!element.action) return;
        
        this.emit('uiAction', {
            action: element.action,
            element: element,
            value: this.getElementValue(element)
        });
    }

    /**
     * 获取元素值
     */
    getElementValue(element) {
        switch (element.type) {
            case 'slider':
                return element.value;
            case 'dropdown':
                return element.selectedIndex;
            default:
                return null;
        }
    }

    /**
     * 更新鼠标样式
     */
    updateCursor() {
        if (this.hoveredElement && this.isInteractable(this.hoveredElement)) {
            this.canvas.style.cursor = 'pointer';
        } else {
            this.canvas.style.cursor = 'default';
        }
    }

    /**
     * 显示UI元素
     */
    showUI(uiId) {
        const ui = this.uiElements.get(uiId);
        if (ui) {
            ui.visible = true;
            this.emit('uiShown', { uiId: uiId });
        }
    }

    /**
     * 隐藏UI元素
     */
    hideUI(uiId) {
        const ui = this.uiElements.get(uiId);
        if (ui) {
            ui.visible = false;
            this.emit('uiHidden', { uiId: uiId });
        }
    }

    /**
     * 更新UI元素
     */
    updateUIElement(uiId, elementId, properties) {
        const ui = this.uiElements.get(uiId);
        if (!ui) return;
        
        const element = ui.elements.find(el => el.id === elementId);
        if (element) {
            Object.assign(element, properties);
        }
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info', duration = null) {
        const notification = {
            id: this.generateId(),
            message: message,
            type: type,
            duration: duration || this.notificationSettings.defaultDuration,
            startTime: Date.now(),
            y: -50, // 开始位置在屏幕外
            targetY: 20 + this.notifications.length * 60,
            alpha: 0
        };
        
        this.notifications.push(notification);
        
        // 限制通知数量
        if (this.notifications.length > this.notificationSettings.maxNotifications) {
            this.notifications.shift();
        }
        
        // 重新计算位置
        this.updateNotificationPositions();
        
        // 动画进入
        this.animateNotificationIn(notification);
        
        return notification.id;
    }

    /**
     * 移除通知
     */
    removeNotification(notificationId) {
        const index = this.notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
            const notification = this.notifications[index];
            this.animateNotificationOut(notification, () => {
                this.notifications.splice(index, 1);
                this.updateNotificationPositions();
            });
        }
    }

    /**
     * 更新通知位置
     */
    updateNotificationPositions() {
        this.notifications.forEach((notification, index) => {
            notification.targetY = 20 + index * 60;
        });
    }

    /**
     * 通知进入动画
     */
    animateNotificationIn(notification) {
        const animation = {
            id: this.generateAnimationId(),
            target: notification,
            duration: 300,
            startTime: Date.now(),
            properties: {
                y: { from: notification.y, to: notification.targetY },
                alpha: { from: 0, to: 1 }
            }
        };
        
        this.animations.set(animation.id, animation);
    }

    /**
     * 通知退出动画
     */
    animateNotificationOut(notification, callback) {
        const animation = {
            id: this.generateAnimationId(),
            target: notification,
            duration: 200,
            startTime: Date.now(),
            properties: {
                alpha: { from: notification.alpha, to: 0 }
            },
            onComplete: callback
        };
        
        this.animations.set(animation.id, animation);
    }

    /**
     * 更新UI系统
     */
    update(deltaTime) {
        // 更新动画
        this.updateAnimations(deltaTime);
        
        // 更新通知
        this.updateNotifications(deltaTime);
    }

    /**
     * 更新动画
     */
    updateAnimations(deltaTime) {
        const completedAnimations = [];
        
        for (const [id, animation] of this.animations) {
            const elapsed = Date.now() - animation.startTime;
            const progress = Math.min(elapsed / animation.duration, 1);
            
            // 缓动函数
            const easedProgress = this.easeOutCubic(progress);
            
            // 更新属性
            for (const [prop, values] of Object.entries(animation.properties)) {
                const value = values.from + (values.to - values.from) * easedProgress;
                animation.target[prop] = value;
            }
            
            // 检查动画是否完成
            if (progress >= 1) {
                if (animation.onComplete) {
                    animation.onComplete();
                }
                completedAnimations.push(id);
            }
        }
        
        // 移除完成的动画
        for (const id of completedAnimations) {
            this.animations.delete(id);
        }
    }

    /**
     * 更新通知
     */
    updateNotifications(deltaTime) {
        const expiredNotifications = [];
        
        for (const notification of this.notifications) {
            const elapsed = Date.now() - notification.startTime;
            
            if (elapsed > notification.duration) {
                expiredNotifications.push(notification.id);
            }
        }
        
        // 移除过期通知
        for (const id of expiredNotifications) {
            this.removeNotification(id);
        }
    }

    /**
     * 渲染UI系统
     */
    render() {
        // 按层级渲染UI元素
        const sortedElements = Array.from(this.uiElements.values())
            .filter(ui => ui.visible)
            .sort((a, b) => a.layer - b.layer);
        
        for (const ui of sortedElements) {
            this.renderUI(ui);
        }
        
        // 渲染通知
        this.renderNotifications();
    }

    /**
     * 渲染单个UI
     */
    renderUI(ui) {
        this.context.save();
        
        for (const element of ui.elements) {
            this.renderElement(element);
        }
        
        this.context.restore();
    }

    /**
     * 渲染UI元素
     */
    renderElement(element) {
        switch (element.type) {
            case 'background':
                this.renderBackground(element);
                break;
            case 'panel':
                this.renderPanel(element);
                break;
            case 'title':
            case 'text':
                this.renderText(element);
                break;
            case 'button':
                this.renderButton(element);
                break;
            case 'slider':
                this.renderSlider(element);
                break;
            case 'progressBar':
                this.renderProgressBar(element);
                break;
            case 'dropdown':
                this.renderDropdown(element);
                break;
        }
    }

    /**
     * 渲染背景
     */
    renderBackground(element) {
        this.context.fillStyle = element.color;
        this.context.fillRect(element.x, element.y, element.width, element.height);
    }

    /**
     * 渲染面板
     */
    renderPanel(element) {
        // 背景
        this.context.fillStyle = element.color;
        this.context.fillRect(element.x, element.y, element.width, element.height);
        
        // 边框
        if (element.borderColor) {
            this.context.strokeStyle = element.borderColor;
            this.context.lineWidth = element.borderWidth || 1;
            this.context.strokeRect(element.x, element.y, element.width, element.height);
        }
    }

    /**
     * 渲染文本
     */
    renderText(element) {
        this.context.font = element.font;
        this.context.fillStyle = element.color;
        this.context.textAlign = element.align || 'left';
        this.context.textBaseline = 'middle';
        
        this.context.fillText(element.text, element.x, element.y);
    }

    /**
     * 渲染按钮
     */
    renderButton(element) {
        const isHovered = this.hoveredElement === element;
        const isPressed = this.pressedElement === element;
        
        // 按钮背景
        let bgColor = this.theme.primary;
        if (isPressed) {
            bgColor = this.theme.accent;
        } else if (isHovered) {
            bgColor = this.lightenColor(this.theme.primary, 20);
        }
        
        this.context.fillStyle = bgColor;
        this.context.fillRect(element.x, element.y, element.width, element.height);
        
        // 按钮边框
        this.context.strokeStyle = this.theme.text;
        this.context.lineWidth = 2;
        this.context.strokeRect(element.x, element.y, element.width, element.height);
        
        // 按钮文本
        this.context.font = this.fonts.normal;
        this.context.fillStyle = this.theme.text;
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        
        const textX = element.x + element.width / 2;
        const textY = element.y + element.height / 2;
        this.context.fillText(element.text, textX, textY);
    }

    /**
     * 渲染滑块
     */
    renderSlider(element) {
        // 滑块轨道
        this.context.fillStyle = this.theme.surface;
        this.context.fillRect(element.x, element.y, element.width, element.height);
        
        // 滑块进度
        const progress = element.value / element.maxValue;
        const progressWidth = element.width * progress;
        
        this.context.fillStyle = this.theme.primary;
        this.context.fillRect(element.x, element.y, progressWidth, element.height);
        
        // 滑块手柄
        const handleX = element.x + progressWidth - 5;
        this.context.fillStyle = this.theme.text;
        this.context.fillRect(handleX, element.y - 2, 10, element.height + 4);
        
        // 值显示
        this.context.font = this.fonts.small;
        this.context.fillStyle = this.theme.text;
        this.context.textAlign = 'center';
        this.context.fillText(
            element.value.toString(),
            element.x + element.width / 2,
            element.y + element.height + 15
        );
    }

    /**
     * 渲染进度条
     */
    renderProgressBar(element) {
        // 背景
        this.context.fillStyle = element.backgroundColor;
        this.context.fillRect(element.x, element.y, element.width, element.height);
        
        // 进度
        const progress = element.value / element.maxValue;
        const progressWidth = element.width * progress;
        
        this.context.fillStyle = element.color;
        this.context.fillRect(element.x, element.y, progressWidth, element.height);
        
        // 边框
        this.context.strokeStyle = this.theme.text;
        this.context.lineWidth = 1;
        this.context.strokeRect(element.x, element.y, element.width, element.height);
    }

    /**
     * 渲染下拉框
     */
    renderDropdown(element) {
        // 下拉框背景
        this.context.fillStyle = this.theme.surface;
        this.context.fillRect(element.x, element.y, element.width, element.height);
        
        // 边框
        this.context.strokeStyle = this.theme.primary;
        this.context.lineWidth = 1;
        this.context.strokeRect(element.x, element.y, element.width, element.height);
        
        // 选中的文本
        const selectedText = element.options[element.selectedIndex];
        this.context.font = this.fonts.normal;
        this.context.fillStyle = this.theme.text;
        this.context.textAlign = 'left';
        this.context.textBaseline = 'middle';
        
        this.context.fillText(
            selectedText,
            element.x + 10,
            element.y + element.height / 2
        );
        
        // 下拉箭头
        const arrowX = element.x + element.width - 20;
        const arrowY = element.y + element.height / 2;
        
        this.context.beginPath();
        this.context.moveTo(arrowX - 5, arrowY - 3);
        this.context.lineTo(arrowX, arrowY + 3);
        this.context.lineTo(arrowX + 5, arrowY - 3);
        this.context.strokeStyle = this.theme.text;
        this.context.lineWidth = 2;
        this.context.stroke();
    }

    /**
     * 渲染通知
     */
    renderNotifications() {
        for (const notification of this.notifications) {
            this.renderNotification(notification);
        }
    }

    /**
     * 渲染单个通知
     */
    renderNotification(notification) {
        this.context.save();
        this.context.globalAlpha = notification.alpha;
        
        const x = this.canvas.width - 320;
        const y = notification.y;
        const width = 300;
        const height = 50;
        
        // 通知背景
        let bgColor = this.theme.primary;
        switch (notification.type) {
            case 'success':
                bgColor = this.theme.success;
                break;
            case 'warning':
                bgColor = this.theme.warning;
                break;
            case 'error':
                bgColor = this.theme.error;
                break;
        }
        
        this.context.fillStyle = bgColor;
        this.context.fillRect(x, y, width, height);
        
        // 通知边框
        this.context.strokeStyle = this.theme.text;
        this.context.lineWidth = 1;
        this.context.strokeRect(x, y, width, height);
        
        // 通知文本
        this.context.font = this.fonts.normal;
        this.context.fillStyle = this.theme.text;
        this.context.textAlign = 'left';
        this.context.textBaseline = 'middle';
        
        this.context.fillText(
            notification.message,
            x + 10,
            y + height / 2
        );
        
        this.context.restore();
    }

    /**
     * 缓动函数
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * 颜色处理函数
     */
    lightenColor(color, percent) {
        // 简单的颜色亮化函数
        return color; // 这里可以实现更复杂的颜色处理
    }

    /**
     * 生成ID
     */
    generateId() {
        return 'ui_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 生成动画ID
     */
    generateAnimationId() {
        return ++this.animationId;
    }

    /**
     * 清理资源
     */
    dispose() {
        // 移除事件监听器
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('click', this.handleClick);
        
        // 清理数据
        this.uiElements.clear();
        this.activeMenus.clear();
        this.notifications = [];
        this.animations.clear();
        
        this.emit('disposed');
    }
}











