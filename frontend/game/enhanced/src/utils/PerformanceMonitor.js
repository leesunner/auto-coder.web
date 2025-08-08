


/**
 * 性能监控器类
 * 监控游戏的性能指标，包括FPS、帧时间等
 */
export class PerformanceMonitor {
    constructor() {
        this.isRunning = false;
        this.startTime = 0;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        
        // 性能统计
        this.stats = {
            fps: 0,
            frameTime: 0,
            updateTime: 0,
            renderTime: 0,
            memoryUsage: 0,
            averageFrameTime: 0,
            minFrameTime: Infinity,
            maxFrameTime: 0,
            totalFrames: 0
        };

        // 历史数据
        this.frameTimeHistory = [];
        this.fpsHistory = [];
        this.maxHistorySize = 60; // 保存60帧的历史数据

        // 性能阈值
        this.thresholds = {
            lowFPS: 30,
            highFrameTime: 33.33, // 30fps对应的帧时间
            memoryWarning: 100 * 1024 * 1024 // 100MB
        };

        // 警告计数
        this.warnings = {
            lowFPS: 0,
            highFrameTime: 0,
            memoryLeak: 0
        };
    }

    /**
     * 开始监控
     */
    start() {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        this.startTime = performance.now();
        this.lastFrameTime = this.startTime;
        this.lastFpsUpdate = this.startTime;
        this.frameCount = 0;

        console.log('性能监控器已启动');
    }

    /**
     * 停止监控
     */
    stop() {
        this.isRunning = false;
        console.log('性能监控器已停止');
    }

    /**
     * 更新性能统计
     */
    update(currentTime) {
        if (!this.isRunning) {
            return;
        }

        // 计算帧时间
        const frameTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        // 更新帧计数
        this.frameCount++;
        this.stats.totalFrames++;

        // 更新帧时间统计
        this.updateFrameTimeStats(frameTime);

        // 每秒更新一次FPS
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.updateFPSStats(currentTime);
        }

        // 更新内存使用情况
        this.updateMemoryStats();

        // 检查性能警告
        this.checkPerformanceWarnings();
    }

    /**
     * 更新帧时间统计
     */
    updateFrameTimeStats(frameTime) {
        this.stats.frameTime = frameTime;

        // 更新最小/最大帧时间
        this.stats.minFrameTime = Math.min(this.stats.minFrameTime, frameTime);
        this.stats.maxFrameTime = Math.max(this.stats.maxFrameTime, frameTime);

        // 添加到历史记录
        this.frameTimeHistory.push(frameTime);
        if (this.frameTimeHistory.length > this.maxHistorySize) {
            this.frameTimeHistory.shift();
        }

        // 计算平均帧时间
        this.stats.averageFrameTime = this.frameTimeHistory.reduce((sum, time) => sum + time, 0) / this.frameTimeHistory.length;
    }

    /**
     * 更新FPS统计
     */
    updateFPSStats(currentTime) {
        const elapsed = currentTime - this.lastFpsUpdate;
        this.stats.fps = Math.round((this.frameCount * 1000) / elapsed);

        // 添加到FPS历史记录
        this.fpsHistory.push(this.stats.fps);
        if (this.fpsHistory.length > this.maxHistorySize) {
            this.fpsHistory.shift();
        }

        // 重置计数器
        this.frameCount = 0;
        this.lastFpsUpdate = currentTime;
    }

    /**
     * 更新内存使用统计
     */
    updateMemoryStats() {
        if (performance.memory) {
            this.stats.memoryUsage = performance.memory.usedJSHeapSize;
        }
    }

    /**
     * 检查性能警告
     */
    checkPerformanceWarnings() {
        // 检查低FPS
        if (this.stats.fps < this.thresholds.lowFPS && this.stats.fps > 0) {
            this.warnings.lowFPS++;
            if (this.warnings.lowFPS % 60 === 0) { // 每60帧警告一次
                console.warn(`性能警告: FPS过低 (${this.stats.fps})`);
            }
        } else {
            this.warnings.lowFPS = 0;
        }

        // 检查高帧时间
        if (this.stats.frameTime > this.thresholds.highFrameTime) {
            this.warnings.highFrameTime++;
            if (this.warnings.highFrameTime % 60 === 0) {
                console.warn(`性能警告: 帧时间过长 (${this.stats.frameTime.toFixed(2)}ms)`);
            }
        } else {
            this.warnings.highFrameTime = 0;
        }

        // 检查内存使用
        if (this.stats.memoryUsage > this.thresholds.memoryWarning) {
            this.warnings.memoryLeak++;
            if (this.warnings.memoryLeak % 300 === 0) { // 每300帧警告一次
                console.warn(`内存警告: 内存使用过高 (${(this.stats.memoryUsage / 1024 / 1024).toFixed(2)}MB)`);
            }
        } else {
            this.warnings.memoryLeak = 0;
        }
    }

    /**
     * 标记更新开始
     */
    markUpdateStart() {
        this.updateStartTime = performance.now();
    }

    /**
     * 标记更新结束
     */
    markUpdateEnd() {
        if (this.updateStartTime) {
            this.stats.updateTime = performance.now() - this.updateStartTime;
        }
    }

    /**
     * 标记渲染开始
     */
    markRenderStart() {
        this.renderStartTime = performance.now();
    }

    /**
     * 标记渲染结束
     */
    markRenderEnd() {
        if (this.renderStartTime) {
            this.stats.renderTime = performance.now() - this.renderStartTime;
        }
    }

    /**
     * 获取当前统计信息
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * 获取详细性能报告
     */
    getDetailedReport() {
        const avgFPS = this.fpsHistory.length > 0 ? 
            this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length : 0;

        const minFPS = this.fpsHistory.length > 0 ? Math.min(...this.fpsHistory) : 0;
        const maxFPS = this.fpsHistory.length > 0 ? Math.max(...this.fpsHistory) : 0;

        return {
            ...this.stats,
            averageFPS: Math.round(avgFPS),
            minFPS,
            maxFPS,
            frameTimeVariance: this.calculateVariance(this.frameTimeHistory),
            fpsVariance: this.calculateVariance(this.fpsHistory),
            uptime: performance.now() - this.startTime,
            warnings: { ...this.warnings },
            isPerformanceGood: this.isPerformanceGood()
        };
    }

    /**
     * 计算方差
     */
    calculateVariance(data) {
        if (data.length === 0) return 0;
        
        const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
        const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length;
        
        return variance;
    }

    /**
     * 判断性能是否良好
     */
    isPerformanceGood() {
        return this.stats.fps >= this.thresholds.lowFPS &&
               this.stats.frameTime <= this.thresholds.highFrameTime &&
               this.stats.memoryUsage < this.thresholds.memoryWarning;
    }

    /**
     * 重置统计信息
     */
    reset() {
        this.frameCount = 0;
        this.frameTimeHistory = [];
        this.fpsHistory = [];
        this.stats.minFrameTime = Infinity;
        this.stats.maxFrameTime = 0;
        this.stats.totalFrames = 0;
        this.warnings = {
            lowFPS: 0,
            highFrameTime: 0,
            memoryLeak: 0
        };

        console.log('性能监控器统计信息已重置');
    }

    /**
     * 导出性能数据
     */
    exportData() {
        return {
            stats: this.getStats(),
            detailedReport: this.getDetailedReport(),
            frameTimeHistory: [...this.frameTimeHistory],
            fpsHistory: [...this.fpsHistory],
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 设置性能阈值
     */
    setThresholds(newThresholds) {
        this.thresholds = { ...this.thresholds, ...newThresholds };
    }

    /**
     * 获取性能等级
     */
    getPerformanceGrade() {
        const avgFPS = this.fpsHistory.length > 0 ? 
            this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length : 0;

        if (avgFPS >= 55) return 'A';
        if (avgFPS >= 45) return 'B';
        if (avgFPS >= 30) return 'C';
        if (avgFPS >= 20) return 'D';
        return 'F';
    }
}



