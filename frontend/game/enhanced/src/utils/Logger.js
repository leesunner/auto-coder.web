

/**
 * 日志记录器类
 * 提供分级日志记录功能
 */
export class Logger {
    static LogLevel = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        NONE: 4
    };

    constructor(name = 'App', enableDebug = false) {
        this.name = name;
        this.level = enableDebug ? Logger.LogLevel.DEBUG : Logger.LogLevel.INFO;
        this.history = [];
        this.maxHistorySize = 1000;
    }

    /**
     * 设置日志级别
     */
    setLevel(level) {
        this.level = level;
    }

    /**
     * 格式化日志消息
     */
    formatMessage(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const levelName = Object.keys(Logger.LogLevel)[level];
        const prefix = `[${timestamp}] [${this.name}] [${levelName}]`;
        
        return {
            prefix,
            message,
            args,
            timestamp,
            level,
            levelName
        };
    }

    /**
     * 记录日志到历史
     */
    addToHistory(logData) {
        this.history.push(logData);
        
        // 限制历史记录大小
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    /**
     * 输出日志
     */
    log(level, message, ...args) {
        if (level < this.level) {
            return;
        }

        const logData = this.formatMessage(level, message, ...args);
        this.addToHistory(logData);

        const fullMessage = `${logData.prefix} ${message}`;

        switch (level) {
            case Logger.LogLevel.DEBUG:
                console.debug(fullMessage, ...args);
                break;
            case Logger.LogLevel.INFO:
                console.info(fullMessage, ...args);
                break;
            case Logger.LogLevel.WARN:
                console.warn(fullMessage, ...args);
                break;
            case Logger.LogLevel.ERROR:
                console.error(fullMessage, ...args);
                break;
        }
    }

    /**
     * 调试日志
     */
    debug(message, ...args) {
        this.log(Logger.LogLevel.DEBUG, message, ...args);
    }

    /**
     * 信息日志
     */
    info(message, ...args) {
        this.log(Logger.LogLevel.INFO, message, ...args);
    }

    /**
     * 警告日志
     */
    warn(message, ...args) {
        this.log(Logger.LogLevel.WARN, message, ...args);
    }

    /**
     * 错误日志
     */
    error(message, ...args) {
        this.log(Logger.LogLevel.ERROR, message, ...args);
    }

    /**
     * 获取日志历史
     */
    getHistory(level = null, limit = null) {
        let history = this.history;

        if (level !== null) {
            history = history.filter(log => log.level >= level);
        }

        if (limit) {
            history = history.slice(-limit);
        }

        return history;
    }

    /**
     * 清空日志历史
     */
    clearHistory() {
        this.history = [];
    }

    /**
     * 导出日志
     */
    exportLogs(level = null) {
        const logs = this.getHistory(level);
        return logs.map(log => 
            `${log.prefix} ${log.message} ${log.args.length > 0 ? JSON.stringify(log.args) : ''}`
        ).join('\n');
    }
}


