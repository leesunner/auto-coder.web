















import { EventEmitter } from '../utils/EventEmitter.js';
import { Logger } from '../utils/Logger.js';

/**
 * 性能优化器
 * 监控游戏性能并自动调整设置以保持流畅运行
 */
export class PerformanceOptimizer extends EventEmitter {
    constructor(game) {
        super();
        
        this.game = game;
        
        // 性能监控
        this.performanceMetrics = {
            fps: 60,
            frameTime: 16.67,
            averageFPS: 60,
            minFPS: 60,
            maxFPS: 60,
            frameDrops: 0,
            memoryUsage: 0,
            drawCalls: 0,
            entities: 0,
            particleCount: 0
        };
        
        // 性能历史记录
        this.history = {
            fps: [],
            frameTime: [],
            memoryUsage: [],
            maxHistoryLength: 300 // 5秒的历史记录 (60fps)
        };
        
        // 优化设置
        this.optimizationSettings = {
            targetFPS: 60,
            minAcceptableFPS: 30,
            adaptiveQuality: true,
            autoOptimize: true,
            maxParticles: 500,
            maxEnemies: 20,
            cullDistance: 1000,
            lodDistance: 500
        };
        
        // 质量级别
        this.qualityLevels = {
            ultra: {
                name: '超高',
                particleMultiplier: 1.5,
                effectQuality: 1.0,
                shadowQuality: 1.0,
                textureQuality: 1.0,
                antiAliasing: true,
                vsync: true
            },
            high: {
                name: '高',
                particleMultiplier: 1.0,
                effectQuality: 0.9,
                shadowQuality: 0.8,
                textureQuality: 1.0,
                antiAliasing: true,
                vsync: true
            },
            medium: {
                name: '中',
                particleMultiplier: 0.7,
                effectQuality: 0.7,
                shadowQuality: 0.6,
                textureQuality: 0.8,
                antiAliasing: false,
                vsync: false
            },
            low: {
                name: '低',
                particleMultiplier: 0.4,
                effectQuality: 0.5,
                shadowQuality: 0.3,
                textureQuality: 0.6,
                antiAliasing: false,
                vsync: false
            },
            potato: {
                name: '最低',
                particleMultiplier: 0.2,
                effectQuality: 0.3,
                shadowQuality: 0.0,
                textureQuality: 0.4,
                antiAliasing: false,
                vsync: false
            }
        };
        
        this.currentQuality = 'high';
        
        // 优化策略
        this.optimizationStrategies = [
            {
                name: 'reduceParticles',
                priority: 1,
                condition: () => this.performanceMetrics.averageFPS < 45,
                action: () => this.reduceParticleCount(),
                description: '减少粒子数量'
            },
            {
                name: 'cullDistantObjects',
                priority: 2,
                condition: () => this.performanceMetrics.averageFPS < 40,
                action: () => this.enableDistanceCulling(),
                description: '启用距离剔除'
            },
            {
                name: 'reduceEffectQuality',
                priority: 3,
                condition: () => this.performanceMetrics.averageFPS < 35,
                action: () => this.reduceEffectQuality(),
                description: '降低效果质量'
            },
            {
                name: 'lowerQuality',
                priority: 4,
                condition: () => this.performanceMetrics.averageFPS < 30,
                action: () => this.lowerQualityLevel(),
                description: '降低画质等级'
            },
            {
                name: 'emergencyMode',
                priority: 5,
                condition: () => this.performanceMetrics.averageFPS < 20,
                action: () => this.enableEmergencyMode(),
                description: '启用紧急模式'
            }
        ];
        
        // 优化状态
        this.optimizationState = {
            appliedStrategies: new Set(),
            lastOptimizationTime: 0,
            optimizationCooldown: 2000, // 2秒冷却时间
            emergencyMode: false
        };
        
        // 对象池管理
        this.objectPools = {
            bullets: [],
            particles: [],
            effects: [],
            enemies: []
        };
        
        // 渲染优化
        this.renderOptimizations = {
            frustumCulling: true,
            occlusionCulling: false,
            batchRendering: true,
            instancedRendering: false,
            levelOfDetail: true
        };
        
        // 内存管理
        this.memoryManager = {
            gcThreshold: 100, // MB
            lastGCTime: 0,
            gcCooldown: 5000, // 5秒
            textureCache: new Map(),
            audioCache: new Map()
        };
        
        // 开始监控
        this.startMonitoring();
    }

    /**
     * 开始性能监控
     */
    startMonitoring() {
        this.monitoringInterval = setInterval(() => {
            this.updateMetrics();
            this.analyzePerformance();
            
            if (this.optimizationSettings.autoOptimize) {
                this.performAutoOptimization();
            }
        }, 100); // 每100ms检查一次
    }

    /**
     * 停止性能监控
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }

    /**
     * 更新性能指标
     */
    updateMetrics() {
        const now = performance.now();
        
        // 计算FPS
        if (this.lastFrameTime) {
            const deltaTime = now - this.lastFrameTime;
            this.performanceMetrics.frameTime = deltaTime;
            this.performanceMetrics.fps = 1000 / deltaTime;
            
            // 更新历史记录
            this.history.fps.push(this.performanceMetrics.fps);
            this.history.frameTime.push(deltaTime);
            
            // 限制历史记录长度
            if (this.history.fps.length > this.history.maxHistoryLength) {
                this.history.fps.shift();
                this.history.frameTime.shift();
            }
            
            // 计算平均FPS
            this.performanceMetrics.averageFPS = 
                this.history.fps.reduce((a, b) => a + b, 0) / this.history.fps.length;
            
            // 计算最小和最大FPS
            this.performanceMetrics.minFPS = Math.min(...this.history.fps);
            this.performanceMetrics.maxFPS = Math.max(...this.history.fps);
            
            // 检测帧数下降
            if (this.performanceMetrics.fps < this.optimizationSettings.minAcceptableFPS) {
                this.performanceMetrics.frameDrops++;
            }
        }
        
        this.lastFrameTime = now;
        
        // 更新内存使用情况
        if (performance.memory) {
            this.performanceMetrics.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
            this.history.memoryUsage.push(this.performanceMetrics.memoryUsage);
            
            if (this.history.memoryUsage.length > this.history.maxHistoryLength) {
                this.history.memoryUsage.shift();
            }
        }
        
        // 更新游戏对象计数
        if (this.game) {
            this.performanceMetrics.entities = this.countEntities();
            this.performanceMetrics.particleCount = this.countParticles();
            this.performanceMetrics.drawCalls = this.estimateDrawCalls();
        }
    }

    /**
     * 分析性能
     */
    analyzePerformance() {
        const metrics = this.performanceMetrics;
        
        // 性能等级评估
        let performanceLevel = 'excellent';
        
        if (metrics.averageFPS < 20) {
            performanceLevel = 'critical';
        } else if (metrics.averageFPS < 30) {
            performanceLevel = 'poor';
        } else if (metrics.averageFPS < 45) {
            performanceLevel = 'fair';
        } else if (metrics.averageFPS < 55) {
            performanceLevel = 'good';
        }
        
        // 内存压力评估
        let memoryPressure = 'low';
        if (metrics.memoryUsage > 200) {
            memoryPressure = 'critical';
        } else if (metrics.memoryUsage > 150) {
            memoryPressure = 'high';
        } else if (metrics.memoryUsage > 100) {
            memoryPressure = 'medium';
        }
        
        // 发出性能事件
        this.emit('performanceUpdate', {
            level: performanceLevel,
            memoryPressure: memoryPressure,
            metrics: { ...metrics }
        });
        
        // 检查是否需要垃圾回收
        if (memoryPressure === 'high' && this.shouldTriggerGC()) {
            this.triggerGarbageCollection();
        }
    }

    /**
     * 执行自动优化
     */
    performAutoOptimization() {
        const now = performance.now();
        
        // 检查冷却时间
        if (now - this.optimizationState.lastOptimizationTime < this.optimizationState.optimizationCooldown) {
            return;
        }
        
        // 按优先级执行优化策略
        for (const strategy of this.optimizationStrategies) {
            if (strategy.condition() && !this.optimizationState.appliedStrategies.has(strategy.name)) {
                Logger.info(`执行优化策略: ${strategy.description}`);
                strategy.action();
                this.optimizationState.appliedStrategies.add(strategy.name);
                this.optimizationState.lastOptimizationTime = now;
                
                this.emit('optimizationApplied', {
                    strategy: strategy.name,
                    description: strategy.description
                });
                
                break; // 一次只执行一个策略
            }
        }
        
        // 如果性能恢复，可以撤销某些优化
        if (this.performanceMetrics.averageFPS > 55) {
            this.revertOptimizations();
        }
    }

    /**
     * 减少粒子数量
     */
    reduceParticleCount() {
        const currentQuality = this.qualityLevels[this.currentQuality];
        if (currentQuality.particleMultiplier > 0.2) {
            currentQuality.particleMultiplier *= 0.8;
            this.applyQualitySettings();
        }
    }

    /**
     * 启用距离剔除
     */
    enableDistanceCulling() {
        this.renderOptimizations.frustumCulling = true;
        this.optimizationSettings.cullDistance *= 0.8;
        
        // 应用到游戏对象
        if (this.game.enemies) {
            this.game.enemies.forEach(enemy => {
                enemy.cullDistance = this.optimizationSettings.cullDistance;
            });
        }
    }

    /**
     * 降低效果质量
     */
    reduceEffectQuality() {
        const currentQuality = this.qualityLevels[this.currentQuality];
        if (currentQuality.effectQuality > 0.3) {
            currentQuality.effectQuality *= 0.8;
            currentQuality.shadowQuality *= 0.7;
            this.applyQualitySettings();
        }
    }

    /**
     * 降低画质等级
     */
    lowerQualityLevel() {
        const qualityOrder = ['ultra', 'high', 'medium', 'low', 'potato'];
        const currentIndex = qualityOrder.indexOf(this.currentQuality);
        
        if (currentIndex < qualityOrder.length - 1) {
            this.setQualityLevel(qualityOrder[currentIndex + 1]);
        }
    }

    /**
     * 启用紧急模式
     */
    enableEmergencyMode() {
        if (this.optimizationState.emergencyMode) return;
        
        this.optimizationState.emergencyMode = true;
        
        // 极端优化措施
        this.setQualityLevel('potato');
        this.optimizationSettings.maxParticles = 50;
        this.optimizationSettings.maxEnemies = 10;
        this.renderOptimizations.batchRendering = true;
        this.renderOptimizations.occlusionCulling = true;
        
        // 清理不必要的对象
        this.cleanupObjects();
        
        Logger.warn('紧急模式已启用 - 性能严重不足');
        
        this.emit('emergencyModeEnabled');
    }

    /**
     * 撤销优化
     */
    revertOptimizations() {
        if (this.optimizationState.appliedStrategies.size === 0) return;
        
        // 逐步撤销优化
        const strategiesToRevert = ['reduceParticles'];
        
        for (const strategyName of strategiesToRevert) {
            if (this.optimizationState.appliedStrategies.has(strategyName)) {
                this.optimizationState.appliedStrategies.delete(strategyName);
                
                // 恢复设置
                if (strategyName === 'reduceParticles') {
                    const currentQuality = this.qualityLevels[this.currentQuality];
                    currentQuality.particleMultiplier = Math.min(1.0, currentQuality.particleMultiplier * 1.2);
                    this.applyQualitySettings();
                }
                
                break; // 一次只撤销一个
            }
        }
    }

    /**
     * 设置画质等级
     */
    setQualityLevel(level) {
        if (!this.qualityLevels[level]) {
            Logger.warn(`未知的画质等级: ${level}`);
            return;
        }
        
        const oldQuality = this.currentQuality;
        this.currentQuality = level;
        
        this.applyQualitySettings();
        
        Logger.info(`画质等级从 ${this.qualityLevels[oldQuality].name} 切换到 ${this.qualityLevels[level].name}`);
        
        this.emit('qualityChanged', {
            from: oldQuality,
            to: level,
            settings: this.qualityLevels[level]
        });
    }

    /**
     * 应用画质设置
     */
    applyQualitySettings() {
        const settings = this.qualityLevels[this.currentQuality];
        
        // 应用到游戏系统
        if (this.game.effectsSystem) {
            this.game.effectsSystem.setQuality(settings.effectQuality);
            this.game.effectsSystem.setParticleMultiplier(settings.particleMultiplier);
        }
        
        if (this.game.audioManager) {
            this.game.audioManager.setQuality(settings.effectQuality);
        }
        
        // 应用渲染设置
        if (this.game.renderer) {
            this.game.renderer.antiAliasing = settings.antiAliasing;
            this.game.renderer.textureQuality = settings.textureQuality;
            this.game.renderer.shadowQuality = settings.shadowQuality;
        }
    }

    /**
     * 统计实体数量
     */
    countEntities() {
        let count = 0;
        
        if (this.game.player) count++;
        if (this.game.enemies) count += this.game.enemies.length;
        if (this.game.bullets) count += this.game.bullets.length;
        if (this.game.powerUps) count += this.game.powerUps.length;
        
        return count;
    }

    /**
     * 统计粒子数量
     */
    countParticles() {
        if (this.game.effectsSystem && this.game.effectsSystem.particleSystem) {
            return this.game.effectsSystem.particleSystem.getParticleCount();
        }
        return 0;
    }

    /**
     * 估算绘制调用次数
     */
    estimateDrawCalls() {
        let drawCalls = 0;
        
        // 基础绘制调用
        drawCalls += this.countEntities();
        
        // 粒子系统
        if (this.countParticles() > 0) {
            drawCalls += Math.ceil(this.countParticles() / 100); // 假设每100个粒子一次调用
        }
        
        // UI元素
        drawCalls += 5;
        
        return drawCcalls;
    }

    /**
     * 检查是否应该触发垃圾回收
     */
    shouldTriggerGC() {
        const now = performance.now();
        return (
            this.performanceMetrics.memoryUsage > this.memoryManager.gcThreshold &&
            now - this.memoryManager.lastGCTime > this.memoryManager.gcCooldown
        );
    }

    /**
     * 触发垃圾回收
     */
    triggerGarbageCollection() {
        // 清理对象池
        this.cleanupObjectPools();
        
        // 清理缓存
        this.cleanupCaches();
        
        // 强制垃圾回收（如果可用）
        if (window.gc) {
            window.gc();
        }
        
        this.memoryManager.lastGCTime = performance.now();
        
        Logger.info('执行垃圾回收');
        this.emit('garbageCollected');
    }

    /**
     * 清理对象池
     */
    cleanupObjectPools() {
        for (const [poolName, pool] of Object.entries(this.objectPools)) {
            // 保留最近使用的对象，清理其余的
            const keepCount = Math.floor(pool.length * 0.3);
            this.objectPools[poolName] = pool.slice(0, keepCount);
        }
    }

    /**
     * 清理缓存
     */
    cleanupCaches() {
        // 清理纹理缓存
        const textureCache = this.memoryManager.textureCache;
        if (textureCache.size > 50) {
            const entries = Array.from(textureCache.entries());
            const keepCount = Math.floor(entries.length * 0.7);
            textureCache.clear();
            
            entries.slice(0, keepCount).forEach(([key, value]) => {
                textureCache.set(key, value);
            });
        }
        
        // 清理音频缓存
        const audioCache = this.memoryManager.audioCache;
        if (audioCache.size > 20) {
            const entries = Array.from(audioCache.entries());
            const keepCount = Math.floor(entries.length * 0.8);
            audioCache.clear();
            
            entries.slice(0, keepCount).forEach(([key, value]) => {
                audioCache.set(key, value);
            });
        }
    }

    /**
     * 清理游戏对象
     */
    cleanupObjects() {
        // 清理无效的子弹
        if (this.game.bullets) {
            this.game.bullets = this.game.bullets.filter(bullet => bullet.isActive);
        }
        
        // 清理无效的粒子效果
        if (this.game.effects) {
            this.game.effects = this.game.effects.filter(effect => effect.isActive);
        }
        
        // 清理无效的道具
        if (this.game.powerUps) {
            this.game.powerUps = this.game.powerUps.filter(powerUp => powerUp.isActive);
        }
    }

    /**
     * 获取性能报告
     */
    getPerformanceReport() {
        const avgMemory = this.history.memoryUsage.length > 0 ?
            this.history.memoryUsage.reduce((a, b) => a + b, 0) / this.history.memoryUsage.length : 0;
        
        return {
            metrics: { ...this.performanceMetrics },
            averageMemoryUsage: avgMemory,
            currentQuality: this.currentQuality,
            qualitySettings: { ...this.qualityLevels[this.currentQuality] },
            appliedOptimizations: Array.from(this.optimizationState.appliedStrategies),
            emergencyMode: this.optimizationState.emergencyMode,
            renderOptimizations: { ...this.renderOptimizations }
        };
    }

    /**
     * 获取优化建议
     */
    getOptimizationSuggestions() {
        const suggestions = [];
        const metrics = this.performanceMetrics;
        
        if (metrics.averageFPS < 45) {
            suggestions.push({
                type: 'performance',
                priority: 'high',
                message: '帧率较低，建议降低画质设置',
                action: 'lowerQuality'
            });
        }
        
        if (metrics.memoryUsage > 150) {
            suggestions.push({
                type: 'memory',
                priority: 'medium',
                message: '内存使用较高，建议清理缓存',
                action: 'cleanupMemory'
            });
        }
        
        if (metrics.entities > 100) {
            suggestions.push({
                type: 'entities',
                priority: 'medium',
                message: '实体数量过多，建议启用距离剔除',
                action: 'enableCulling'
            });
        }
        
        if (metrics.particleCount > 1000) {
            suggestions.push({
                type: 'particles',
                priority: 'low',
                message: '粒子数量过多，建议减少粒子效果',
                action: 'reduceParticles'
            });
        }
        
        return suggestions;
    }

    /**
     * 应用优化建议
     */
    applySuggestion(action) {
        switch (action) {
            case 'lowerQuality':
                this.lowerQualityLevel();
                break;
            case 'cleanupMemory':
                this.triggerGarbageCollection();
                break;
            case 'enableCulling':
                this.enableDistanceCulling();
                break;
            case 'reduceParticles':
                this.reduceParticleCount();
                break;
            default:
                Logger.warn(`未知的优化建议: ${action}`);
        }
    }

    /**
     * 重置优化器
     */
    reset() {
        this.optimizationState.appliedStrategies.clear();
        this.optimizationState.emergencyMode = false;
        this.optimizationState.lastOptimizationTime = 0;
        
        this.currentQuality = 'high';
        this.applyQualitySettings();
        
        // 清空历史记录
        this.history.fps = [];
        this.history.frameTime = [];
        this.history.memoryUsage = [];
        
        Logger.info('性能优化器已重置');
    }

    /**
     * 销毁优化器
     */
    dispose() {
        this.stopMonitoring();
        
        // 清理对象池
        for (const poolName in this.objectPools) {
            this.objectPools[poolName] = [];
        }
        
        // 清理缓存
        this.memoryManager.textureCache.clear();
        this.memoryManager.audioCache.clear();
        
        this.emit('disposed');
    }
}
















