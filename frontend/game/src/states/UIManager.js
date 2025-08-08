







/**
 * UI管理器
 * 管理游戏中的所有用户界面元素
 */

import { GameState } from './GameStateManager.js';

/**
 * UI元素类型枚举
 */
export const UIElementType = {
    BUTTON: 'button',
    LABEL: 'label',
    PROGRESS_BAR: 'progress_bar',
    PANEL: 'panel',
    MENU: 'menu',
    HUD: 'hud'
};

/**
 * UI元素基类
 */
class UIElement {
    constructor(x, y, width, height, type = UIElementType.PANEL) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        
        // 显示状态
        this.visible = true;
        this.enabled = true;
        this.focused = false;
        
        // 样式
        this.backgroundColor = '#333333';
        this.borderColor = '#666666';
        this.textColor = '#ffffff';
        this.font = '16px Arial';
        this.borderWidth = 1;
        
        // 动画
        this.alpha = 1.0;
        this.scale = 1.0;
        this.rotation = 0;
        
        // 事件
        this.onClick = null;
        this.onHover = null;
        this.onFocus = null;
        
        // 子元素
        this.children = [];
        this.parent = null;
    }

    /**
     * 更新UI元素
     */
    update(deltaTime) {
        if (!this.visible) return;
        
        // 更新子元素
        for (const child of this.children) {
            child.update(deltaTime);
        }
    }

    /**
     * 渲染UI元素
     */
    render(renderer) {
        if (!this.visible) return;
        
        renderer.save();
        
        // 应用变换
        renderer.setGlobalAlpha(this.alpha);
        renderer.translate(this.x + this.width / 2, this.y + this.height / 2);
        renderer.rotate(this.rotation);
        renderer.scale(this.scale, this.scale);
        renderer.translate(-this.width / 2, -this.height / 2);
        
        // 渲染背景
        if (this.backgroundColor) {
            renderer.fillRect(0, 0, this.width, this.height, this.backgroundColor);
        }
        
        // 渲染边框
        if (this.borderColor && this.borderWidth > 0) {
            renderer.strokeRect(0, 0, this.width, this.height, this.borderColor, this.borderWidth);
        }
        
        // 渲染内容
        this.renderContent(renderer);
        
        // 渲染子元素
        for (const child of this.children) {
            child.render(renderer);
        }
        
        renderer.restore();
    }

    /**
     * 渲染内容（子类重写）
     */
    renderContent(renderer) {
        // 子类实现
    }

    /**
     * 检查点击
     */
    containsPoint(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }

    /**
     * 处理点击事件
     */
    handleClick(x, y) {
        if (!this.visible || !this.enabled) return false;
        
        // 检查子元素
        for (const child of this.children) {
            if (child.handleClick(x - this.x, y - this.y)) {
                return true;
            }
        }
        
        // 检查自身
        if (this.containsPoint(x, y)) {
            if (this.onClick) {
                this.onClick(this);
            }
            return true;
        }
        
        return false;
    }

    /**
     * 添加子元素
     */
    addChild(child) {
        child.parent = this;
        this.children.push(child);
    }

    /**
     * 移除子元素
     */
    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index > -1) {
            this.children.splice(index, 1);
            child.parent = null;
        }
    }
}

/**
 * 按钮UI元素
 */
class UIButton extends UIElement {
    constructor(x, y, width, height, text = '') {
        super(x, y, width, height, UIElementType.BUTTON);
        
        this.text = text;
        this.hovered = false;
        this.pressed = false;
        
        // 按钮样式
        this.backgroundColor = '#4CAF50';
        this.hoverColor = '#45a049';
        this.pressedColor = '#3d8b40';
        this.disabledColor = '#cccccc';
        
        this.textColor = '#ffffff';
        this.font = '16px Arial';
    }

    /**
     * 渲染按钮内容
     */
    renderContent(renderer) {
        // 确定背景颜色
        let bgColor = this.backgroundColor;
        if (!this.enabled) {
            bgColor = this.disabledColor;
        } else if (this.pressed) {
            bgColor = this.pressedColor;
        } else if (this.hovered) {
            bgColor = this.hoverColor;
        }
        
        // 重新渲染背景
        renderer.fillRect(0, 0, this.width, this.height, bgColor);
        
        // 渲染文本
        if (this.text) {
            renderer.setFont(this.font);
            renderer.setTextAlign('center');
            renderer.drawText(
                this.text,
                this.width / 2,
                this.height / 2 + 6,
                this.textColor
            );
        }
    }

    /**
     * 处理鼠标悬停
     */
    handleHover(x, y) {
        const wasHovered = this.hovered;
        this.hovered = this.containsPoint(x, y) && this.enabled;
        
        if (this.hovered && !wasHovered && this.onHover) {
            this.onHover(this);
        }
    }
}

/**
 * 标签UI元素
 */
class UILabel extends UIElement {
    constructor(x, y, width, height, text = '') {
        super(x, y, width, height, UIElementType.LABEL);
        
        this.text = text;
        this.textAlign = 'left';
        this.verticalAlign = 'top';
        this.backgroundColor = null; // 透明背景
        this.borderColor = null; // 无边框
    }

    /**
     * 渲染标签内容
     */
    renderContent(renderer) {
        if (!this.text) return;
        
        renderer.setFont(this.font);
        renderer.setTextAlign(this.textAlign);
        
        let textX, textY;
        
        // 水平对齐
        switch (this.textAlign) {
            case 'center':
                textX = this.width / 2;
                break;
            case 'right':
                textX = this.width;
                break;
            default:
                textX = 0;
                break;
        }
        
        // 垂直对齐
        switch (this.verticalAlign) {
            case 'center':
                textY = this.height / 2 + 6;
                break;
            case 'bottom':
                textY = this.height;
                break;
            default:
                textY = 16;
                break;
        }
        
        renderer.drawText(this.text, textX, textY, this.textColor);
    }
}

/**
 * 进度条UI元素
 */
class UIProgressBar extends UIElement {
    constructor(x, y, width, height) {
        super(x, y, width, height, UIElementType.PROGRESS_BAR);
        
        this.value = 0; // 0-1
        this.maxValue = 1;
        this.fillColor = '#4CAF50';
        this.emptyColor = '#cccccc';
        this.showText = true;
    }

    /**
     * 渲染进度条内容
     */
    renderContent(renderer) {
        const fillWidth = (this.value / this.maxValue) * this.width;
        
        // 渲染空的部分
        renderer.fillRect(0, 0, this.width, this.height, this.emptyColor);
        
        // 渲染填充的部分
        if (fillWidth > 0) {
            renderer.fillRect(0, 0, fillWidth, this.height, this.fillColor);
        }
        
        // 渲染文本
        if (this.showText) {
            const percentage = Math.round((this.value / this.maxValue) * 100);
            renderer.setFont(this.font);
            renderer.setTextAlign('center');
            renderer.drawText(
                `${percentage}%`,
                this.width / 2,
                this.height / 2 + 6,
                this.textColor
            );
        }
    }

    /**
     * 设置进度值
     */
    setValue(value) {
        this.value = Math.max(0, Math.min(this.maxValue, value));
    }
}

/**
 * 面板UI元素
 */
class UIPanel extends UIElement {
    constructor(x, y, width, height) {
        super(x, y, width, height, UIElementType.PANEL);
        
        this.title = '';
        this.titleHeight = 30;
        this.titleBackgroundColor = '#2196F3';
        this.padding = 10;
    }

    /**
     * 渲染面板内容
     */
    renderContent(renderer) {
        // 渲染标题栏
        if (this.title) {
            renderer.fillRect(0, 0, this.width, this.titleHeight, this.titleBackgroundColor);
            
            renderer.setFont('bold 14px Arial');
            renderer.setTextAlign('center');
            renderer.drawText(
                this.title,
                this.width / 2,
                this.titleHeight / 2 + 5,
                '#ffffff'
            );
        }
    }
}

/**
 * HUD（头部显示器）UI元素
 */
class UIHud extends UIElement {
    constructor(gameStateManager) {
        super(0, 0, 800, 100, UIElementType.HUD);
        
        this.gameStateManager = gameStateManager;
        this.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        
        // 创建HUD元素
        this.createHudElements();
    }

    /**
     * 创建HUD元素
     */
    createHudElements() {
        // 分数标签
        this.scoreLabel = new UILabel(10, 10, 150, 30, '分数: 0');
        this.scoreLabel.font = 'bold 18px Arial';
        this.addChild(this.scoreLabel);
        
        // 生命值标签
        this.livesLabel = new UILabel(170, 10, 100, 30, '生命: 3');
        this.livesLabel.font = 'bold 18px Arial';
        this.addChild(this.livesLabel);
        
        // 关卡标签
        this.levelLabel = new UILabel(280, 10, 100, 30, '关卡: 1');
        this.levelLabel.font = 'bold 18px Arial';
        this.addChild(this.levelLabel);
        
        // 敌人计数
        this.enemyLabel = new UILabel(390, 10, 150, 30, '敌人: 0/0');
        this.enemyLabel.font = 'bold 18px Arial';
        this.addChild(this.enemyLabel);
        
        // 时间标签
        this.timeLabel = new UILabel(550, 10, 150, 30, '时间: 00:00');
        this.timeLabel.font = 'bold 18px Arial';
        this.addChild(this.timeLabel);
        
        // 生命值进度条
        this.healthBar = new UIProgressBar(10, 50, 200, 20);
        this.healthBar.fillColor = '#ff4444';
        this.healthBar.showText = false;
        this.addChild(this.healthBar);
        
        // 弹药进度条
        this.ammoBar = new UIProgressBar(220, 50, 100, 20);
        this.ammoBar.fillColor = '#ffaa00';
        this.ammoBar.showText = false;
        this.addChild(this.ammoBar);
    }

    /**
     * 更新HUD
     */
    update(deltaTime) {
        if (!this.gameStateManager.isInGame()) {
            this.visible = false;
            return;
        }
        
        this.visible = true;
        const gameData = this.gameStateManager.gameData;
        
        // 更新文本
        this.scoreLabel.text = `分数: ${gameData.score}`;
        this.livesLabel.text = `生命: ${gameData.lives}`;
        this.levelLabel.text = `关卡: ${gameData.level}`;
        this.enemyLabel.text = `敌人: ${gameData.enemiesDestroyed}/${gameData.totalEnemies}`;
        
        // 更新时间
        const totalTime = gameData.timeElapsed + (gameData.startTime ? Date.now() - gameData.startTime : 0);
        const minutes = Math.floor(totalTime / 60000);
        const seconds = Math.floor((totalTime % 60000) / 1000);
        this.timeLabel.text = `时间: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        super.update(deltaTime);
    }
}

/**
 * 菜单UI元素
 */
class UIMenu extends UIElement {
    constructor(x, y, width, height, options = []) {
        super(x, y, width, height, UIElementType.MENU);
        
        this.options = options;
        this.selectedIndex = 0;
        this.optionHeight = 50;
        this.optionSpacing = 10;
        
        // 菜单样式
        this.selectedColor = '#2196F3';
        this.normalColor = '#333333';
        this.hoverColor = '#555555';
        
        this.createMenuButtons();
    }

    /**
     * 创建菜单按钮
     */
    createMenuButtons() {
        this.children = [];
        
        for (let i = 0; i < this.options.length; i++) {
            const button = new UIButton(
                0,
                i * (this.optionHeight + this.optionSpacing),
                this.width,
                this.optionHeight,
                this.options[i]
            );
            
            button.onClick = () => this.selectOption(i);
            this.addChild(button);
        }
    }

    /**
     * 选择选项
     */
    selectOption(index) {
        this.selectedIndex = index;
        this.updateSelection();
        
        if (this.onOptionSelected) {
            this.onOptionSelected(index, this.options[index]);
        }
    }

    /**
     * 更新选择状态
     */
    updateSelection() {
        for (let i = 0; i < this.children.length; i++) {
            const button = this.children[i];
            button.backgroundColor = i === this.selectedIndex ? this.selectedColor : this.normalColor;
        }
    }

    /**
     * 处理键盘输入
     */
    handleKeyInput(key) {
        switch (key) {
            case 'ArrowUp':
                this.selectedIndex = Math.max(0, this.selectedIndex - 1);
                this.updateSelection();
                break;
            case 'ArrowDown':
                this.selectedIndex = Math.min(this.options.length - 1, this.selectedIndex + 1);
                this.updateSelection();
                break;
            case 'Enter':
                this.selectOption(this.selectedIndex);
                break;
        }
    }
}

/**
 * UI管理器主类
 */
export class UIManager {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        
        // UI元素容器
        this.elements = new Map();
        this.activeElements = [];
        
        // 输入处理
        this.mouseX = 0;
        this.mouseY = 0;
        this.mousePressed = false;
        
        // 创建UI元素
        this.createUIElements();
        
        // 监听状态变化
        this.gameStateManager.addStateChangeListener((newState, oldState) => {
            this.onStateChange(newState, oldState);
        });
    }

    /**
     * 创建UI元素
     */
    createUIElements() {
        // 主菜单
        const mainMenu = new UIMenu(300, 200, 200, 300, ['开始游戏', '设置', '帮助', '退出']);
        mainMenu.onOptionSelected = (index, option) => this.handleMenuSelection('main', index, option);
        this.elements.set('mainMenu', mainMenu);
        
        // 暂停菜单
        const pauseMenu = new UIMenu(300, 200, 200, 250, ['继续游戏', '重新开始', '设置', '返回主菜单']);
        pauseMenu.onOptionSelected = (index, option) => this.handleMenuSelection('pause', index, option);
        this.elements.set('pauseMenu', pauseMenu);
        
        // HUD
        const hud = new UIHud(this.gameStateManager);
        this.elements.set('hud', hud);
        
        // 游戏结束面板
        this.createGameOverPanel();
        
        // 胜利面板
        this.createVictoryPanel();
        
        // 设置面板
        this.createSettingsPanel();
    }

    /**
     * 创建游戏结束面板
     */
    createGameOverPanel() {
        const panel = new UIPanel(250, 150, 300, 300);
        panel.title = '游戏结束';
        
        // 分数显示
        const scoreLabel = new UILabel(20, 60, 260, 30, '最终分数: 0');
        scoreLabel.textAlign = 'center';
        scoreLabel.font = 'bold 18px Arial';
        panel.addChild(scoreLabel);
        
        // 最佳分数
        const bestScoreLabel = new UILabel(20, 100, 260, 30, '最佳分数: 0');
        bestScoreLabel.textAlign = 'center';
        bestScoreLabel.font = '16px Arial';
        panel.addChild(bestScoreLabel);
        
        // 重新开始按钮
        const restartButton = new UIButton(50, 150, 200, 40, '重新开始');
        restartButton.onClick = () => this.gameStateManager.restartGame();
        panel.addChild(restartButton);
        
        // 返回菜单按钮
        const menuButton = new UIButton(50, 200, 200, 40, '返回主菜单');
        menuButton.onClick = () => this.gameStateManager.returnToMenu();
        panel.addChild(menuButton);
        
        this.elements.set('gameOverPanel', panel);
    }

    /**
     * 创建胜利面板
     */
    createVictoryPanel() {
        const panel = new UIPanel(250, 150, 300, 350);
        panel.title = '关卡完成！';
        
        // 分数显示
        const scoreLabel = new UILabel(20, 60, 260, 30, '分数: 0');
        scoreLabel.textAlign = 'center';
        scoreLabel.font = 'bold 18px Arial';
        panel.addChild(scoreLabel);
        
        // 奖励分数
        const bonusLabel = new UILabel(20, 100, 260, 30, '奖励: 0');
        bonusLabel.textAlign = 'center';
        bonusLabel.font = '16px Arial';
        panel.addChild(bonusLabel);
        
        // 总分数
        const totalLabel = new UILabel(20, 140, 260, 30, '总分: 0');
        totalLabel.textAlign = 'center';
        totalLabel.font = 'bold 18px Arial';
        panel.addChild(totalLabel);
        
        // 下一关按钮
        const nextButton = new UIButton(50, 180, 200, 40, '下一关');
        nextButton.onClick = () => this.startNextLevel();
        panel.addChild(nextButton);
        
        // 重新开始按钮
        const restartButton = new UIButton(50, 230, 200, 40, '重新开始');
        restartButton.onClick = () => this.gameStateManager.restartGame();
        panel.addChild(restartButton);
        
        // 返回菜单按钮
        const menuButton = new UIButton(50, 280, 200, 40, '返回主菜单');
        menuButton.onClick = () => this.gameStateManager.returnToMenu();
        panel.addChild(menuButton);
        
        this.elements.set('victoryPanel', panel);
    }

    /**
     * 创建设置面板
     */
    createSettingsPanel() {
        const panel = new UIPanel(200, 100, 400, 400);
        panel.title = '设置';
        
        // 音效音量
        const soundLabel = new UILabel(20, 60, 100, 30, '音效音量:');
        panel.addChild(soundLabel);
        
        const soundSlider = new UIProgressBar(130, 60, 200, 30);
        soundSlider.setValue(this.gameStateManager.getSetting('soundVolume'));
        panel.addChild(soundSlider);
        
        // 音乐音量
        const musicLabel = new UILabel(20, 110, 100, 30, '音乐音量:');
        panel.addChild(musicLabel);
        
        const musicSlider = new UIProgressBar(130, 110, 200, 30);
        musicSlider.setValue(this.gameStateManager.getSetting('musicVolume'));
        panel.addChild(musicSlider);
        
        // 难度设置
        const difficultyLabel = new UILabel(20, 160, 100, 30, '难度:');
        panel.addChild(difficultyLabel);
        
        const difficultyMenu = new UIMenu(130, 160, 200, 150, ['简单', '普通', '困难']);
        panel.addChild(difficultyMenu);
        
        // 返回按钮
        const backButton = new UIButton(150, 330, 100, 40, '返回');
        backButton.onClick = () => this.gameStateManager.goBack();
        panel.addChild(backButton);
        
        this.elements.set('settingsPanel', panel);
    }

    /**
     * 状态变化处理
     */
    onStateChange(newState, oldState) {
        // 清空当前活动元素
        this.activeElements = [];
        
        // 根据新状态添加相应的UI元素
        switch (newState) {
            case GameState.MENU:
                this.activeElements.push(this.elements.get('mainMenu'));
                break;
            case GameState.PLAYING:
                this.activeElements.push(this.elements.get('hud'));
                break;
            case GameState.PAUSED:
                this.activeElements.push(this.elements.get('hud'));
                this.activeElements.push(this.elements.get('pauseMenu'));
                break;
            case GameState.GAME_OVER:
                this.updateGameOverPanel();
                this.activeElements.push(this.elements.get('gameOverPanel'));
                break;
            case GameState.VICTORY:
                this.updateVictoryPanel();
                this.activeElements.push(this.elements.get('victoryPanel'));
                break;
            case GameState.SETTINGS:
                this.activeElements.push(this.elements.get('settingsPanel'));
                break;
        }
    }

    /**
     * 更新游戏结束面板
     */
    updateGameOverPanel() {
        const panel = this.elements.get('gameOverPanel');
        const gameData = this.gameStateManager.gameData;
        const statistics = this.gameStateManager.statistics;
        
        // 更新分数显示
        panel.children[0].text = `最终分数: ${gameData.score}`;
        panel.children[1].text = `最佳分数: ${statistics.bestScore}`;
    }

    /**
     * 更新胜利面板
     */
    updateVictoryPanel() {
        const panel = this.elements.get('victoryPanel');
        const gameData = this.gameStateManager.gameData;
        const victoryData = this.gameStateManager.getCurrentStateData();
        
        // 更新分数显示
        panel.children[0].text = `分数: ${gameData.score - victoryData.bonusPoints}`;
        panel.children[1].text = `奖励: ${victoryData.bonusPoints}`;
        panel.children[2].text = `总分: ${gameData.score}`;
    }

    /**
     * 处理菜单选择
     */
    handleMenuSelection(menuType, index, option) {
        switch (menuType) {
            case 'main':
                this.handleMainMenuSelection(index, option);
                break;
            case 'pause':
                this.handlePauseMenuSelection(index, option);
                break;
        }
    }

    /**
     * 处理主菜单选择
     */
    handleMainMenuSelection(index, option) {
        switch (index) {
            case 0: // 开始游戏
                this.gameStateManager.changeState(GameState.PLAYING, { newGame: true });
                break;
            case 1: // 设置
                this.gameStateManager.changeState(GameState.SETTINGS);
                break;
            case 2: // 帮助
                this.gameStateManager.changeState(GameState.HELP);
                break;
            case 3: // 退出
                if (confirm('确定要退出游戏吗？')) {
                    window.close();
                }
                break;
        }
    }

    /**
     * 处理暂停菜单选择
     */
    handlePauseMenuSelection(index, option) {
        switch (index) {
            case 0: // 继续游戏
                this.gameStateManager.resumeGame();
                break;
            case 1: // 重新开始
                this.gameStateManager.restartGame();
                break;
            case 2: // 设置
                this.gameStateManager.changeState(GameState.SETTINGS);
                break;
            case 3: // 返回主菜单
                this.gameStateManager.returnToMenu();
                break;
        }
    }

    /**
     * 开始下一关
     */
    startNextLevel() {
        const gameData = this.gameStateManager.gameData;
        gameData.level++;
        this.gameStateManager.changeState(GameState.PLAYING, { newGame: true, level: gameData.level });
    }

    /**
     * 更新UI管理器
     */
    update(deltaTime) {
        for (const element of this.activeElements) {
            if (element) {
                element.update(deltaTime);
            }
        }
    }

    /**
     * 渲染UI
     */
    render(renderer) {
        for (const element of this.activeElements) {
            if (element) {
                element.render(renderer);
            }
        }
    }

    /**
     * 处理鼠标移动
     */
    handleMouseMove(x, y) {
        this.mouseX = x;
        this.mouseY = y;
        
        // 处理悬停效果
        for (const element of this.activeElements) {
            if (element && element.handleHover) {
                element.handleHover(x, y);
            }
        }
    }

    /**
     * 处理鼠标点击
     */
    handleMouseClick(x, y) {
        for (const element of this.activeElements) {
            if (element && element.handleClick && element.handleClick(x, y)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 处理键盘输入
     */
    handleKeyInput(key) {
        for (const element of this.activeElements) {
            if (element && element.handleKeyInput) {
                element.handleKeyInput(key);
            }
        }
    }

    /**
     * 获取UI状态
     */
    getStatus() {
        return {
            activeElementCount: this.activeElements.length,
            mousePosition: { x: this.mouseX, y: this.mouseY },
            mousePressed: this.mousePressed
        };
    }
}







