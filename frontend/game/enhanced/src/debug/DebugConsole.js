














import { EventEmitter } from '../utils/EventEmitter.js';
import { Logger } from '../utils/Logger.js';

/**
 * 调试控制台
 * 提供游戏运行时的调试信息和控制功能
 */
export class DebugConsole extends EventEmitter {
    constructor(game) {
        super();
        
        this.game = game;
        this.isVisible = false;
        this.isEnabled = false;
        
        // 调试面板元素
        this.consoleElement = null;
        this.logContainer = null;
        this.inputElement = null;
        this.statsContainer = null;
        
        // 调试统计
        this.stats = {
            fps: 0,
            frameTime: 0,
            entities: 0,
            memoryUsage: 0,
            drawCalls: 0,
            collisionChecks: 0
        };
        
        // 性能监控
        this.performanceMonitor = {
            frameCount: 0,
            lastTime: 0,
            fpsHistory: [],
            frameTimeHistory: []
        };
        
        // 调试命令
        this.commands = new Map();
        this.initializeCommands();
        
        // 日志历史
        this.logHistory = [];
        this.maxLogHistory = 100;
        
        // 创建调试界面
        this.createDebugUI();
        
        // 绑定事件
        this.bindEvents();
    }

    /**
     * 初始化调试命令
     */
    initializeCommands() {
        // 基础命令
        this.commands.set('help', {
            description: '显示所有可用命令',
            execute: () => this.showHelp()
        });

        this.commands.set('clear', {
            description: '清空控制台',
            execute: () => this.clearLog()
        });

        this.commands.set('fps', {
            description: '显示FPS信息',
            execute: () => this.showFPS()
        });

        this.commands.set('stats', {
            description: '显示游戏统计信息',
            execute: () => this.showStats()
        });

        // 游戏控制命令
        this.commands.set('pause', {
            description: '暂停/恢复游戏',
            execute: () => this.togglePause()
        });

        this.commands.set('speed', {
            description: '设置游戏速度 (0.1-5.0)',
            execute: (args) => this.setGameSpeed(parseFloat(args[0]) || 1.0)
        });

        this.commands.set('god', {
            description: '切换无敌模式',
            execute: () => this.toggleGodMode()
        });

        this.commands.set('noclip', {
            description: '切换穿墙模式',
            execute: () => this.toggleNoClip()
        });

        // 实体控制命令
        this.commands.set('spawn', {
            description: '生成实体 spawn <type> [x] [y]',
            execute: (args) => this.spawnEntity(args[0], parseFloat(args[1]), parseFloat(args[2]))
        });

        this.commands.set('kill', {
            description: '销毁所有敌人',
            execute: () => this.killAllEnemies()
        });

        this.commands.set('heal', {
            description: '治疗玩家',
            execute: () => this.healPlayer()
        });

        // 关卡控制命令
        this.commands.set('level', {
            description: '跳转到指定关卡 level <number>',
            execute: (args) => this.setLevel(parseInt(args[0]))
        });

        this.commands.set('complete', {
            description: '完成当前关卡',
            execute: () => this.completeLevel()
        });

        // 渲染调试命令
        this.commands.set('wireframe', {
            description: '切换线框模式',
            execute: () => this.toggleWireframe()
        });

        this.commands.set('hitbox', {
            description: '切换碰撞盒显示',
            execute: () => this.toggleHitboxes()
        });

        this.commands.set('grid', {
            description: '切换网格显示',
            execute: () => this.toggleGrid()
        });

        // 性能调试命令
        this.commands.set('profile', {
            description: '开始/停止性能分析',
            execute: () => this.toggleProfiling()
        });

        this.commands.set('memory', {
            description: '显示内存使用情况',
            execute: () => this.showMemoryUsage()
        });
    }

    /**
     * 创建调试UI
     */
    createDebugUI() {
        // 创建主容器
        this.consoleElement = document.createElement('div');
        this.consoleElement.id = 'debug-console';
        this.consoleElement.className = 'debug-console hidden';
        
        // 创建样式
        const style = document.createElement('style');
        style.textContent = `
            .debug-console {
                position: fixed;
                top: 10px;
                right: 10px;
                width: 400px;
                height: 500px;
                background: rgba(0, 0, 0, 0.9);
                border: 2px solid #00ff00;
                border-radius: 5px;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                color: #00ff00;
                z-index: 10000;
                display: flex;
                flex-direction: column;
            }
            
            .debug-console.hidden {
                display: none;
            }
            
            .debug-header {
                background: #003300;
                padding: 5px 10px;
                border-bottom: 1px solid #00ff00;
                font-weight: bold;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .debug-close {
                cursor: pointer;
                color: #ff0000;
                font-weight: bold;
            }
            
            .debug-tabs {
                display: flex;
                background: #002200;
                border-bottom: 1px solid #00ff00;
            }
            
            .debug-tab {
                padding: 5px 10px;
                cursor: pointer;
                border-right: 1px solid #00ff00;
                background: #002200;
            }
            
            .debug-tab.active {
                background: #004400;
            }
            
            .debug-content {
                flex: 1;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            
            .debug-log {
                flex: 1;
                overflow-y: auto;
                padding: 5px;
                background: rgba(0, 0, 0, 0.8);
            }
            
            .debug-stats {
                padding: 10px;
                background: rgba(0, 0, 0, 0.8);
                display: none;
            }
            
            .debug-stats.active {
                display: block;
            }
            
            .debug-input {
                display: flex;
                border-top: 1px solid #00ff00;
                background: #001100;
            }
            
            .debug-prompt {
                padding: 5px;
                color: #00ff00;
            }
            
            .debug-input input {
                flex: 1;
                background: transparent;
                border: none;
                color: #00ff00;
                font-family: inherit;
                font-size: inherit;
                outline: none;
                padding: 5px;
            }
            
            .log-entry {
                margin: 2px 0;
                padding: 2px;
                border-left: 3px solid transparent;
            }
            
            .log-info { border-left-color: #00ff00; }
            .log-warn { border-left-color: #ffff00; color: #ffff00; }
            .log-error { border-left-color: #ff0000; color: #ff0000; }
            .log-debug { border-left-color: #0088ff; color: #0088ff; }
            
            .stat-row {
                display: flex;
                justify-content: space-between;
                margin: 2px 0;
                padding: 2px 5px;
                background: rgba(0, 255, 0, 0.1);
            }
            
            .stat-label {
                font-weight: bold;
            }
            
            .stat-value {
                color: #ffff00;
            }
        `;
        
        document.head.appendChild(style);
        
        // 创建HTML结构
        this.consoleElement.innerHTML = `
            <div class="debug-header">
                <span>调试控制台</span>
                <span class="debug-close">×</span>
            </div>
            <div class="debug-tabs">
                <div class="debug-tab active" data-tab="log">日志</div>
                <div class="debug-tab" data-tab="stats">统计</div>
                <div class="debug-tab" data-tab="entities">实体</div>
            </div>
            <div class="debug-content">
                <div class="debug-log" id="debug-log-content"></div>
                <div class="debug-stats" id="debug-stats-content"></div>
                <div class="debug-entities" id="debug-entities-content" style="display: none;"></div>
            </div>
            <div class="debug-input">
                <span class="debug-prompt">></span>
                <input type="text" id="debug-input" placeholder="输入命令... (输入 'help' 查看帮助)">
            </div>
        `;
        
        document.body.appendChild(this.consoleElement);
        
        // 获取元素引用
        this.logContainer = document.getElementById('debug-log-content');
        this.inputElement = document.getElementById('debug-input');
        this.statsContainer = document.getElementById('debug-stats-content');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 关闭按钮
        this.consoleElement.querySelector('.debug-close').addEventListener('click', () => {
            this.hide();
        });
        
        // 标签切换
        this.consoleElement.querySelectorAll('.debug-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // 命令输入
        this.inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand(this.inputElement.value);
                this.inputElement.value = '';
            }
        });
        
        // 全局快捷键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || (e.key === '`' && e.ctrlKey)) {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    /**
     * 切换标签
     */
    switchTab(tabName) {
        // 更新标签状态
        this.consoleElement.querySelectorAll('.debug-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // 显示对应内容
        this.consoleElement.querySelector('.debug-log').style.display = 
            tabName === 'log' ? 'block' : 'none';
        this.consoleElement.querySelector('.debug-stats').style.display = 
            tabName === 'stats' ? 'block' : 'none';
        this.consoleElement.querySelector('.debug-entities').style.display = 
            tabName === 'entities' ? 'block' : 'none';
    }

    /**
     * 显示调试控制台
     */
    show() {
        this.isVisible = true;
        this.consoleElement.classList.remove('hidden');
        this.inputElement.focus();
    }

    /**
     * 隐藏调试控制台
     */
    hide() {
        this.isVisible = false;
        this.consoleElement.classList.add('hidden');
    }

    /**
     * 切换显示状态
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * 启用调试模式
     */
    enable() {
        this.isEnabled = true;
        Logger.info('调试模式已启用');
    }

    /**
     * 禁用调试模式
     */
    disable() {
        this.isEnabled = false;
        this.hide();
        Logger.info('调试模式已禁用');
    }

    /**
     * 记录日志
     */
    log(message, level = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            timestamp,
            message,
            level
        };
        
        this.logHistory.push(logEntry);
        
        // 限制历史记录数量
        if (this.logHistory.length > this.maxLogHistory) {
            this.logHistory.shift();
        }
        
        // 更新UI
        this.updateLogDisplay();
    }

    /**
     * 更新日志显示
     */
    updateLogDisplay() {
        if (!this.logContainer) return;
        
        this.logContainer.innerHTML = this.logHistory.map(entry => 
            `<div class="log-entry log-${entry.level}">
                [${entry.timestamp}] ${entry.message}
            </div>`
        ).join('');
        
        // 自动滚动到底部
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }

    /**
     * 执行命令
     */
    executeCommand(commandLine) {
        if (!commandLine.trim()) return;
        
        this.log(`> ${commandLine}`, 'debug');
        
        const parts = commandLine.trim().split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        const cmd = this.commands.get(command);
        if (cmd) {
            try {
                cmd.execute(args);
            } catch (error) {
                this.log(`命令执行错误: ${error.message}`, 'error');
            }
        } else {
            this.log(`未知命令: ${command}. 输入 'help' 查看可用命令`, 'warn');
        }
    }

    /**
     * 显示帮助
     */
    showHelp() {
        this.log('可用命令:', 'info');
        for (const [name, cmd] of this.commands) {
            this.log(`  ${name} - ${cmd.description}`, 'info');
        }
    }

    /**
     * 清空日志
     */
    clearLog() {
        this.logHistory = [];
        this.updateLogDisplay();
    }

    /**
     * 显示FPS信息
     */
    showFPS() {
        this.log(`当前FPS: ${this.stats.fps}`, 'info');
        this.log(`帧时间: ${this.stats.frameTime.toFixed(2)}ms`, 'info');
    }

    /**
     * 显示统计信息
     */
    showStats() {
        this.log('游戏统计:', 'info');
        this.log(`  实体数量: ${this.stats.entities}`, 'info');
        this.log(`  内存使用: ${this.stats.memoryUsage}MB`, 'info');
        this.log(`  绘制调用: ${this.stats.drawCalls}`, 'info');
        this.log(`  碰撞检测: ${this.stats.collisionChecks}`, 'info');
    }

    /**
     * 切换暂停
     */
    togglePause() {
        if (this.game.isPaused) {
            this.game.resumeGame();
            this.log('游戏已恢复', 'info');
        } else {
            this.game.pauseGame();
            this.log('游戏已暂停', 'info');
        }
    }

    /**
     * 设置游戏速度
     */
    setGameSpeed(speed) {
        speed = Math.max(0.1, Math.min(5.0, speed));
        this.game.engine.setTimeScale(speed);
        this.log(`游戏速度设置为: ${speed}x`, 'info');
    }

    /**
     * 切换无敌模式
     */
    toggleGodMode() {
        if (this.game.player) {
            this.game.player.godMode = !this.game.player.godMode;
            this.log(`无敌模式: ${this.game.player.godMode ? '开启' : '关闭'}`, 'info');
        }
    }

    /**
     * 切换穿墙模式
     */
    toggleNoClip() {
        if (this.game.player) {
            this.game.player.noClip = !this.game.player.noClip;
            this.log(`穿墙模式: ${this.game.player.noClip ? '开启' : '关闭'}`, 'info');
        }
    }

    /**
     * 生成实体
     */
    spawnEntity(type, x, y) {
        if (!type) {
            this.log('请指定实体类型', 'warn');
            return;
        }
        
        x = x || this.game.canvas.width / 2;
        y = y || this.game.canvas.height / 2;
        
        try {
            this.game.createEnemy(type);
            this.log(`已生成 ${type} 在位置 (${x}, ${y})`, 'info');
        } catch (error) {
            this.log(`生成实体失败: ${error.message}`, 'error');
        }
    }

    /**
     * 销毁所有敌人
     */
    killAllEnemies() {
        const count = this.game.enemies.length;
        this.game.enemies.forEach(enemy => enemy.destroy());
        this.game.enemies = [];
        this.log(`已销毁 ${count} 个敌人`, 'info');
    }

    /**
     * 治疗玩家
     */
    healPlayer() {
        if (this.game.player) {
            this.game.player.health = this.game.player.maxHealth;
            this.log('玩家已满血', 'info');
        }
    }

    /**
     * 设置关卡
     */
    setLevel(levelNumber) {
        if (!levelNumber || levelNumber < 1) {
            this.log('请指定有效的关卡号', 'warn');
            return;
        }
        
        try {
            this.game.stateManager.setLevel(levelNumber);
            this.log(`已跳转到关卡 ${levelNumber}`, 'info');
        } catch (error) {
            this.log(`跳转关卡失败: ${error.message}`, 'error');
        }
    }

    /**
     * 完成当前关卡
     */
    completeLevel() {
        this.game.stateManager.completeLevel();
        this.log('当前关卡已完成', 'info');
    }

    /**
     * 切换线框模式
     */
    toggleWireframe() {
        this.game.engine.wireframeMode = !this.game.engine.wireframeMode;
        this.log(`线框模式: ${this.game.engine.wireframeMode ? '开启' : '关闭'}`, 'info');
    }

    /**
     * 切换碰撞盒显示
     */
    toggleHitboxes() {
        this.game.engine.showHitboxes = !this.game.engine.showHitboxes;
        this.log(`碰撞盒显示: ${this.game.engine.showHitboxes ? '开启' : '关闭'}`, 'info');
    }

    /**
     * 切换网格显示
     */
    toggleGrid() {
        this.game.engine.showGrid = !this.game.engine.showGrid;
        this.log(`网格显示: ${this.game.engine.showGrid ? '开启' : '关闭'}`, 'info');
    }

    /**
     * 切换性能分析
     */
    toggleProfiling() {
        this.game.engine.profiling = !this.game.engine.profiling;
        this.log(`性能分析: ${this.game.engine.profiling ? '开启' : '关闭'}`, 'info');
    }

    /**
     * 显示内存使用情况
     */
    showMemoryUsage() {
        if (performance.memory) {
            const memory = performance.memory;
            this.log('内存使用情况:', 'info');
            this.log(`  已使用: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`, 'info');
            this.log(`  总分配: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`, 'info');
            this.log(`  限制: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`, 'info');
        } else {
            this.log('浏览器不支持内存信息', 'warn');
        }
    }

    /**
     * 更新性能统计
     */
    updatePerformanceStats(deltaTime) {
        const now = performance.now();
        this.performanceMonitor.frameCount++;
        
        // 计算FPS
        if (now - this.performanceMonitor.lastTime >= 1000) {
            this.stats.fps = this.performanceMonitor.frameCount;
            this.performanceMonitor.frameCount = 0;
            this.performanceMonitor.lastTime = now;
        }
        
        // 记录帧时间
        this.stats.frameTime = deltaTime;
        this.performanceMonitor.frameTimeHistory.push(deltaTime);
        if (this.performanceMonitor.frameTimeHistory.length > 60) {
            this.performanceMonitor.frameTimeHistory.shift();
        }
        
        // 更新其他统计
        this.stats.entities = this.game.enemies.length + this.game.bullets.length + 1; // +1 for player
        
        if (performance.memory) {
            this.stats.memoryUsage = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
        }
        
        // 更新统计显示
        this.updateStatsDisplay();
    }

    /**
     * 更新统计显示
     */
    updateStatsDisplay() {
        if (!this.statsContainer) return;
        
        const avgFrameTime = this.performanceMonitor.frameTimeHistory.reduce((a, b) => a + b, 0) / 
                           this.performanceMonitor.frameTimeHistory.length || 0;
        
        this.statsContainer.innerHTML = `
            <div class="stat-row">
                <span class="stat-label">FPS:</span>
                <span class="stat-value">${this.stats.fps}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">帧时间:</span>
                <span class="stat-value">${this.stats.frameTime.toFixed(2)}ms</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">平均帧时间:</span>
                <span class="stat-value">${avgFrameTime.toFixed(2)}ms</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">实体数量:</span>
                <span class="stat-value">${this.stats.entities}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">内存使用:</span>
                <span class="stat-value">${this.stats.memoryUsage}MB</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">绘制调用:</span>
                <span class="stat-value">${this.stats.drawCalls}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">碰撞检测:</span>
                <span class="stat-value">${this.stats.collisionChecks}</span>
            </div>
        `;
    }

    /**
     * 更新调试信息
     */
    update(deltaTime) {
        if (!this.isEnabled) return;
        
        this.updatePerformanceStats(deltaTime);
    }

    /**
     * 销毁调试控制台
     */
    dispose() {
        if (this.consoleElement && this.consoleElement.parentNode) {
            this.consoleElement.parentNode.removeChild(this.consoleElement);
        }
        
        this.commands.clear();
        this.logHistory = [];
        
        this.emit('disposed');
    }
}















