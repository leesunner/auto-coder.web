

/**
 * 事件发射器类
 * 提供事件的注册、触发和移除功能
 */
export class EventEmitter {
    constructor() {
        this.events = new Map();
        this.maxListeners = 10;
    }

    /**
     * 注册事件监听器
     */
    on(event, listener) {
        if (typeof listener !== 'function') {
            throw new TypeError('监听器必须是一个函数');
        }

        if (!this.events.has(event)) {
            this.events.set(event, []);
        }

        const listeners = this.events.get(event);
        
        // 检查监听器数量限制
        if (listeners.length >= this.maxListeners) {
            console.warn(`事件 "${event}" 的监听器数量已达到最大限制 ${this.maxListeners}`);
        }

        listeners.push(listener);
        return this;
    }

    /**
     * 注册一次性事件监听器
     */
    once(event, listener) {
        const onceWrapper = (...args) => {
            this.off(event, onceWrapper);
            listener.apply(this, args);
        };
        
        return this.on(event, onceWrapper);
    }

    /**
     * 移除事件监听器
     */
    off(event, listener) {
        if (!this.events.has(event)) {
            return this;
        }

        if (!listener) {
            // 移除所有监听器
            this.events.delete(event);
            return this;
        }

        const listeners = this.events.get(event);
        const index = listeners.indexOf(listener);
        
        if (index !== -1) {
            listeners.splice(index, 1);
            
            // 如果没有监听器了，删除事件
            if (listeners.length === 0) {
                this.events.delete(event);
            }
        }

        return this;
    }

    /**
     * 触发事件
     */
    emit(event, ...args) {
        if (!this.events.has(event)) {
            return false;
        }

        const listeners = this.events.get(event).slice(); // 创建副本防止在执行过程中被修改
        
        for (const listener of listeners) {
            try {
                listener.apply(this, args);
            } catch (error) {
                console.error(`事件 "${event}" 的监听器执行时发生错误:`, error);
            }
        }

        return true;
    }

    /**
     * 获取事件的监听器数量
     */
    listenerCount(event) {
        return this.events.has(event) ? this.events.get(event).length : 0;
    }

    /**
     * 获取所有事件名称
     */
    eventNames() {
        return Array.from(this.events.keys());
    }

    /**
     * 移除所有事件监听器
     */
    removeAllListeners(event) {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
        return this;
    }

    /**
     * 设置最大监听器数量
     */
    setMaxListeners(n) {
        this.maxListeners = n;
        return this;
    }

    /**
     * 获取最大监听器数量
     */
    getMaxListeners() {
        return this.maxListeners;
    }
}


