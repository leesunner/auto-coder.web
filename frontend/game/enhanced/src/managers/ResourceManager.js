


/**
 * 资源管理器类
 * 负责游戏资源的加载、缓存和管理
 */
export class ResourceManager {
    constructor() {
        this.resources = new Map();
        this.loadingPromises = new Map();
        this.loadedCount = 0;
        this.totalCount = 0;
        this.isInitialized = false;

        // 资源类型定义
        this.resourceTypes = {
            IMAGE: 'image',
            AUDIO: 'audio',
            JSON: 'json',
            FONT: 'font'
        };

        // 支持的文件格式
        this.supportedFormats = {
            image: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
            audio: ['.mp3', '.ogg', '.wav', '.m4a'],
            json: ['.json'],
            font: ['.woff', '.woff2', '.ttf', '.otf']
        };
    }

    /**
     * 初始化资源管理器
     */
    async initialize() {
        this.isInitialized = true;
        console.log('资源管理器初始化完成');
    }

    /**
     * 加载单个资源
     */
    async loadResource(id, url, type = null) {
        // 如果资源已经存在，直接返回
        if (this.resources.has(id)) {
            return this.resources.get(id);
        }

        // 如果正在加载，返回加载Promise
        if (this.loadingPromises.has(id)) {
            return this.loadingPromises.get(id);
        }

        // 自动检测资源类型
        if (!type) {
            type = this.detectResourceType(url);
        }

        // 创建加载Promise
        const loadPromise = this.createLoadPromise(id, url, type);
        this.loadingPromises.set(id, loadPromise);

        try {
            const resource = await loadPromise;
            this.resources.set(id, resource);
            this.loadingPromises.delete(id);
            this.loadedCount++;
            
            console.log(`资源加载完成: ${id} (${type})`);
            return resource;
        } catch (error) {
            this.loadingPromises.delete(id);
            console.error(`资源加载失败: ${id}`, error);
            throw error;
        }
    }

    /**
     * 批量加载资源
     */
    async loadResources(resourceList, onProgress = null) {
        this.totalCount = resourceList.length;
        this.loadedCount = 0;

        const loadPromises = resourceList.map(async (resource, index) => {
            try {
                const result = await this.loadResource(resource.id, resource.url, resource.type);
                
                if (onProgress) {
                    onProgress({
                        loaded: this.loadedCount,
                        total: this.totalCount,
                        progress: this.loadedCount / this.totalCount,
                        current: resource
                    });
                }
                
                return result;
            } catch (error) {
                console.error(`批量加载失败: ${resource.id}`, error);
                throw error;
            }
        });

        return Promise.all(loadPromises);
    }

    /**
     * 创建加载Promise
     */
    createLoadPromise(id, url, type) {
        switch (type) {
            case this.resourceTypes.IMAGE:
                return this.loadImage(url);
            case this.resourceTypes.AUDIO:
                return this.loadAudio(url);
            case this.resourceTypes.JSON:
                return this.loadJSON(url);
            case this.resourceTypes.FONT:
                return this.loadFont(id, url);
            default:
                throw new Error(`不支持的资源类型: ${type}`);
        }
    }

    /**
     * 加载图片资源
     */
    loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                resolve({
                    type: this.resourceTypes.IMAGE,
                    data: img,
                    width: img.width,
                    height: img.height,
                    url: url
                });
            };
            
            img.onerror = () => {
                reject(new Error(`图片加载失败: ${url}`));
            };
            
            img.src = url;
        });
    }

    /**
     * 加载音频资源
     */
    loadAudio(url) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            
            audio.addEventListener('canplaythrough', () => {
                resolve({
                    type: this.resourceTypes.AUDIO,
                    data: audio,
                    duration: audio.duration,
                    url: url
                });
            }, { once: true });
            
            audio.addEventListener('error', () => {
                reject(new Error(`音频加载失败: ${url}`));
            }, { once: true });
            
            audio.preload = 'auto';
            audio.src = url;
        });
    }

    /**
     * 加载JSON资源
     */
    async loadJSON(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            
            const data = await response.json();
            return {
                type: this.resourceTypes.JSON,
                data: data,
                url: url
            };
        } catch (error) {
            throw new Error(`JSON加载失败: ${url} - ${error.message}`);
        }
    }

    /**
     * 加载字体资源
     */
    async loadFont(name, url) {
        try {
            const font = new FontFace(name, `url(${url})`);
            const loadedFont = await font.load();
            document.fonts.add(loadedFont);
            
            return {
                type: this.resourceTypes.FONT,
                data: loadedFont,
                name: name,
                url: url
            };
        } catch (error) {
            throw new Error(`字体加载失败: ${name} - ${error.message}`);
        }
    }

    /**
     * 检测资源类型
     */
    detectResourceType(url) {
        const extension = url.toLowerCase().substring(url.lastIndexOf('.'));
        
        for (const [type, formats] of Object.entries(this.supportedFormats)) {
            if (formats.includes(extension)) {
                return this.resourceTypes[type.toUpperCase()];
            }
        }
        
        return this.resourceTypes.IMAGE; // 默认为图片类型
    }

    /**
     * 获取资源
     */
    getResource(id) {
        return this.resources.get(id);
    }

    /**
     * 检查资源是否存在
     */
    hasResource(id) {
        return this.resources.has(id);
    }

    /**
     * 移除资源
     */
    removeResource(id) {
        if (this.resources.has(id)) {
            const resource = this.resources.get(id);
            
            // 清理特定类型的资源
            if (resource.type === this.resourceTypes.AUDIO) {
                resource.data.src = '';
                resource.data.load();
            }
            
            this.resources.delete(id);
            console.log(`资源已移除: ${id}`);
            return true;
        }
        
        return false;
    }

    /**
     * 清理所有资源
     */
    cleanup() {
        for (const [id, resource] of this.resources) {
            if (resource.type === this.resourceTypes.AUDIO) {
                resource.data.src = '';
                resource.data.load();
            }
        }
        
        this.resources.clear();
        this.loadingPromises.clear();
        this.loadedCount = 0;
        this.totalCount = 0;
        
        console.log('所有资源已清理');
    }

    /**
     * 获取加载进度
     */
    getLoadProgress() {
        return {
            loaded: this.loadedCount,
            total: this.totalCount,
            progress: this.totalCount > 0 ? this.loadedCount / this.totalCount : 0,
            isComplete: this.loadedCount === this.totalCount && this.totalCount > 0
        };
    }

    /**
     * 预加载游戏资源
     */
    async preloadGameAssets(onProgress = null) {
        const gameAssets = [
            // 坦克图片
            { id: 'tank_player', url: 'assets/images/tank_player.png', type: 'image' },
            { id: 'tank_enemy_basic', url: 'assets/images/tank_enemy_basic.png', type: 'image' },
            { id: 'tank_enemy_fast', url: 'assets/images/tank_enemy_fast.png', type: 'image' },
            { id: 'tank_enemy_heavy', url: 'assets/images/tank_enemy_heavy.png', type: 'image' },
            { id: 'tank_enemy_armor', url: 'assets/images/tank_enemy_armor.png', type: 'image' },
            
            // 子弹和爆炸效果
            { id: 'bullet', url: 'assets/images/bullet.png', type: 'image' },
            { id: 'explosion', url: 'assets/images/explosion.png', type: 'image' },
            { id: 'explosion_small', url: 'assets/images/explosion_small.png', type: 'image' },
            
            // 地形和障碍物
            { id: 'wall_brick', url: 'assets/images/wall_brick.png', type: 'image' },
            { id: 'wall_steel', url: 'assets/images/wall_steel.png', type: 'image' },
            { id: 'water', url: 'assets/images/water.png', type: 'image' },
            { id: 'grass', url: 'assets/images/grass.png', type: 'image' },
            { id: 'base', url: 'assets/images/base.png', type: 'image' },
            
            // 道具
            { id: 'powerup_life', url: 'assets/images/powerup_life.png', type: 'image' },
            { id: 'powerup_armor', url: 'assets/images/powerup_armor.png', type: 'image' },
            { id: 'powerup_weapon', url: 'assets/images/powerup_weapon.png', type: 'image' },
            { id: 'powerup_speed', url: 'assets/images/powerup_speed.png', type: 'image' },
            
            // 音效
            { id: 'sound_shoot', url: 'assets/sounds/shoot.mp3', type: 'audio' },
            { id: 'sound_explosion', url: 'assets/sounds/explosion.mp3', type: 'audio' },
            { id: 'sound_engine', url: 'assets/sounds/engine.mp3', type: 'audio' },
            { id: 'sound_powerup', url: 'assets/sounds/powerup.mp3', type: 'audio' },
            { id: 'sound_game_over', url: 'assets/sounds/game_over.mp3', type: 'audio' },
            { id: 'sound_level_complete', url: 'assets/sounds/level_complete.mp3', type: 'audio' },
            
            // 背景音乐
            { id: 'music_menu', url: 'assets/music/menu.mp3', type: 'audio' },
            { id: 'music_game', url: 'assets/music/game.mp3', type: 'audio' },
            
            // 关卡数据
            { id: 'levels', url: 'assets/data/levels.json', type: 'json' },
            { id: 'achievements', url: 'assets/data/achievements.json', type: 'json' },
            { id: 'localization', url: 'assets/data/localization.json', type: 'json' }
        ];

        try {
            await this.loadResources(gameAssets, onProgress);
            console.log('游戏资源预加载完成');
            return true;
        } catch (error) {
            console.error('游戏资源预加载失败:', error);
            return false;
        }
    }

    /**
     * 创建默认资源（用于测试和开发）
     */
    createDefaultAssets() {
        // 创建默认的像素图形资源
        const defaultAssets = new Map();

        // 创建默认坦克图片
        defaultAssets.set('tank_player', this.createPixelTank('#00ff00'));
        defaultAssets.set('tank_enemy_basic', this.createPixelTank('#ff0000'));
        defaultAssets.set('tank_enemy_fast', this.createPixelTank('#ff8800'));
        defaultAssets.set('tank_enemy_heavy', this.createPixelTank('#8800ff'));
        defaultAssets.set('tank_enemy_armor', this.createPixelTank('#ffff00'));

        // 创建默认子弹
        defaultAssets.set('bullet', this.createPixelBullet('#ffffff'));

        // 创建默认墙体
        defaultAssets.set('wall_brick', this.createPixelWall('#8B4513'));
        defaultAssets.set('wall_steel', this.createPixelWall('#C0C0C0'));

        // 将默认资源添加到资源管理器
        for (const [id, resource] of defaultAssets) {
            this.resources.set(id, resource);
        }

        console.log('默认资源创建完成');
    }

    /**
     * 创建像素坦克图片
     */
    createPixelTank(color) {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');

        // 绘制简单的坦克形状
        ctx.fillStyle = color;
        ctx.fillRect(8, 4, 16, 24);  // 主体
        ctx.fillRect(4, 8, 24, 16);  // 履带
        ctx.fillRect(14, 0, 4, 8);   // 炮管

        // 添加细节
        ctx.fillStyle = '#000000';
        ctx.fillRect(12, 12, 8, 8);  // 炮塔

        return {
            type: this.resourceTypes.IMAGE,
            data: canvas,
            width: 32,
            height: 32,
            url: 'default'
        };
    }

    /**
     * 创建像素子弹图片
     */
    createPixelBullet(color) {
        const canvas = document.createElement('canvas');
        canvas.width = 8;
        canvas.height = 8;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = color;
        ctx.fillRect(2, 2, 4, 4);

        return {
            type: this.resourceTypes.IMAGE,
            data: canvas,
            width: 8,
            height: 8,
            url: 'default'
        };
    }

    /**
     * 创建像素墙体图片
     */
    createPixelWall(color) {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 32, 32);

        // 添加纹理
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (let i = 0; i < 32; i += 8) {
            for (let j = 0; j < 32; j += 8) {
                if ((i + j) % 16 === 0) {
                    ctx.fillRect(i, j, 8, 8);
                }
            }
        }

        return {
            type: this.resourceTypes.IMAGE,
            data: canvas,
            width: 32,
            height: 32,
            url: 'default'
        };
    }

    /**
     * 获取资源统计信息
     */
    getStats() {
        const stats = {
            total: this.resources.size,
            byType: {}
        };

        for (const resource of this.resources.values()) {
            const type = resource.type;
            stats.byType[type] = (stats.byType[type] || 0) + 1;
        }

        return stats;
    }
}



