









import { EventEmitter } from '../utils/EventEmitter.js';

/**
 * 视觉效果系统
 * 处理游戏中的所有视觉特效，包括粒子系统、动画、光照等
 */
export class EffectsSystem extends EventEmitter {
    constructor(canvas, context) {
        super();
        
        this.canvas = canvas;
        this.context = context;
        
        // 效果管理
        this.effects = new Map();
        this.particleSystems = new Map();
        this.animations = new Map();
        
        // 渲染层级
        this.renderLayers = {
            BACKGROUND: 0,
            ENVIRONMENT: 1,
            ENTITIES: 2,
            PROJECTILES: 3,
            EFFECTS: 4,
            UI: 5,
            OVERLAY: 6
        };
        
        // 效果配置
        this.maxParticles = 1000;
        this.enabledEffects = {
            particles: true,
            lighting: true,
            shadows: true,
            postProcessing: true,
            screenShake: true
        };
        
        // 屏幕震动
        this.screenShake = {
            intensity: 0,
            duration: 0,
            frequency: 30,
            currentTime: 0,
            offset: { x: 0, y: 0 }
        };
        
        // 光照系统
        this.lighting = {
            enabled: false,
            ambientColor: '#333333',
            lights: [],
            shadowBlur: 10
        };
        
        // 后处理效果
        this.postProcessing = {
            enabled: false,
            effects: []
        };
        
        // 性能统计
        this.stats = {
            activeParticles: 0,
            activeEffects: 0,
            renderTime: 0
        };
        
        // 初始化
        this.initialize();
    }

    /**
     * 初始化效果系统
     */
    initialize() {
        // 创建离屏画布用于效果渲染
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenContext = this.offscreenCanvas.getContext('2d');
        
        // 设置画布尺寸
        this.resizeOffscreenCanvas();
        
        // 监听画布尺寸变化
        window.addEventListener('resize', () => {
            this.resizeOffscreenCanvas();
        });
        
        this.emit('initialized');
    }

    /**
     * 调整离屏画布尺寸
     */
    resizeOffscreenCanvas() {
        this.offscreenCanvas.width = this.canvas.width;
        this.offscreenCanvas.height = this.canvas.height;
    }

    /**
     * 创建粒子系统
     */
    createParticleSystem(name, config) {
        const particleSystem = new ParticleSystem(config);
        this.particleSystems.set(name, particleSystem);
        return particleSystem;
    }

    /**
     * 创建爆炸效果
     */
    createExplosion(x, y, config = {}) {
        const defaultConfig = {
            particleCount: 20,
            maxSpeed: 150,
            minSpeed: 50,
            maxLife: 1.5,
            minLife: 0.8,
            startSize: 8,
            endSize: 2,
            startColor: '#ff6600',
            endColor: '#ff0000',
            gravity: 0,
            fadeOut: true
        };
        
        const explosionConfig = { ...defaultConfig, ...config };
        const particles = [];
        
        for (let i = 0; i < explosionConfig.particleCount; i++) {
            const angle = (Math.PI * 2 * i) / explosionConfig.particleCount + (Math.random() - 0.5) * 0.5;
            const speed = explosionConfig.minSpeed + Math.random() * (explosionConfig.maxSpeed - explosionConfig.minSpeed);
            
            particles.push({
                x: x,
                y: y,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                life: explosionConfig.minLife + Math.random() * (explosionConfig.maxLife - explosionConfig.minLife),
                maxLife: explosionConfig.maxLife,
                size: explosionConfig.startSize,
                startSize: explosionConfig.startSize,
                endSize: explosionConfig.endSize,
                color: explosionConfig.startColor,
                startColor: explosionConfig.startColor,
                endColor: explosionConfig.endColor,
                alpha: 1.0,
                gravity: explosionConfig.gravity,
                fadeOut: explosionConfig.fadeOut
            });
        }
        
        const effectId = this.generateId();
        this.effects.set(effectId, {
            type: 'explosion',
            particles: particles,
            startTime: Date.now()
        });
        
        // 添加屏幕震动
        this.addScreenShake(5, 0.3);
        
        return effectId;
    }

    /**
     * 创建火花效果
     */
    createSparks(x, y, direction, config = {}) {
        const defaultConfig = {
            particleCount: 8,
            spread: Math.PI / 3,
            speed: 100,
            life: 0.8,
            size: 3,
            color: '#ffff00'
        };
        
        const sparkConfig = { ...defaultConfig, ...config };
        const particles = [];
        
        for (let i = 0; i < sparkConfig.particleCount; i++) {
            const angle = direction + (Math.random() - 0.5) * sparkConfig.spread;
            const speed = sparkConfig.speed * (0.5 + Math.random() * 0.5);
            
            particles.push({
                x: x,
                y: y,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                life: sparkConfig.life * (0.5 + Math.random() * 0.5),
                maxLife: sparkConfig.life,
                size: sparkConfig.size,
                color: sparkConfig.color,
                alpha: 1.0,
                gravity: 200,
                fadeOut: true
            });
        }
        
        const effectId = this.generateId();
        this.effects.set(effectId, {
            type: 'sparks',
            particles: particles,
            startTime: Date.now()
        });
        
        return effectId;
    }

    /**
     * 创建烟雾效果
     */
    createSmoke(x, y, config = {}) {
        const defaultConfig = {
            particleCount: 15,
            maxSpeed: 30,
            life: 3.0,
            startSize: 5,
            endSize: 20,
            color: '#666666',
            alpha: 0.6
        };
        
        const smokeConfig = { ...defaultConfig, ...config };
        const particles = [];
        
        for (let i = 0; i < smokeConfig.particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * smokeConfig.maxSpeed;
            
            particles.push({
                x: x + (Math.random() - 0.5) * 10,
                y: y + (Math.random() - 0.5) * 10,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed - 20, // 向上飘
                life: smokeConfig.life * (0.7 + Math.random() * 0.3),
                maxLife: smokeConfig.life,
                size: smokeConfig.startSize,
                startSize: smokeConfig.startSize,
                endSize: smokeConfig.endSize,
                color: smokeConfig.color,
                alpha: smokeConfig.alpha,
                startAlpha: smokeConfig.alpha,
                gravity: -10, // 负重力，向上
                fadeOut: true,
                expand: true
            });
        }
        
        const effectId = this.generateId();
        this.effects.set(effectId, {
            type: 'smoke',
            particles: particles,
            startTime: Date.now()
        });
        
        return effectId;
    }

    /**
     * 创建尘土效果
     */
    createDust(x, y, config = {}) {
        const defaultConfig = {
            particleCount: 12,
            spread: Math.PI,
            speed: 50,
            life: 1.5,
            size: 4,
            color: '#8B7355'
        };
        
        const dustConfig = { ...defaultConfig, ...config };
        const particles = [];
        
        for (let i = 0; i < dustConfig.particleCount; i++) {
            const angle = (Math.random() - 0.5) * dustConfig.spread;
            const speed = dustConfig.speed * Math.random();
            
            particles.push({
                x: x,
                y: y,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed - 10,
                life: dustConfig.life * (0.5 + Math.random() * 0.5),
                maxLife: dustConfig.life,
                size: dustConfig.size * (0.5 + Math.random() * 0.5),
                color: dustConfig.color,
                alpha: 0.8,
                gravity: 50,
                fadeOut: true
            });
        }
        
        const effectId = this.generateId();
        this.effects.set(effectId, {
            type: 'dust',
            particles: particles,
            startTime: Date.now()
        });
        
        return effectId;
    }

    /**
     * 创建道具收集效果
     */
    createPowerUpEffect(x, y, config = {}) {
        const defaultConfig = {
            particleCount: 16,
            colors: ['#ffff00', '#00ff00', '#00ffff', '#ff00ff'],
            life: 1.0,
            speed: 80,
            size: 6
        };
        
        const powerUpConfig = { ...defaultConfig, ...config };
        const particles = [];
        
        for (let i = 0; i < powerUpConfig.particleCount; i++) {
            const angle = (Math.PI * 2 * i) / powerUpConfig.particleCount;
            const speed = powerUpConfig.speed * (0.8 + Math.random() * 0.4);
            const color = powerUpConfig.colors[Math.floor(Math.random() * powerUpConfig.colors.length)];
            
            particles.push({
                x: x,
                y: y,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                life: powerUpConfig.life,
                maxLife: powerUpConfig.life,
                size: powerUpConfig.size,
                color: color,
                alpha: 1.0,
                gravity: -30, // 向上飞
                fadeOut: true,
                twinkle: true
            });
        }
        
        const effectId = this.generateId();
        this.effects.set(effectId, {
            type: 'powerup',
            particles: particles,
            startTime: Date.now()
        });
        
        return effectId;
    }

    /**
     * 创建子弹轨迹效果
     */
    createBulletTrail(startX, startY, endX, endY, config = {}) {
        const defaultConfig = {
            width: 3,
            color: '#ffff00',
            life: 0.1,
            fadeOut: true
        };
        
        const trailConfig = { ...defaultConfig, ...config };
        
        const effectId = this.generateId();
        this.effects.set(effectId, {
            type: 'trail',
            startX: startX,
            startY: startY,
            endX: endX,
            endY: endY,
            config: trailConfig,
            life: trailConfig.life,
            maxLife: trailConfig.life,
            startTime: Date.now()
        });
        
        return effectId;
    }

    /**
     * 创建光圈效果
     */
    createRipple(x, y, config = {}) {
        const defaultConfig = {
            maxRadius: 100,
            width: 3,
            color: '#ffffff',
            life: 0.8,
            alpha: 0.8
        };
        
        const rippleConfig = { ...defaultConfig, ...config };
        
        const effectId = this.generateId();
        this.effects.set(effectId, {
            type: 'ripple',
            x: x,
            y: y,
            radius: 0,
            config: rippleConfig,
            life: rippleConfig.life,
            maxLife: rippleConfig.life,
            startTime: Date.now()
        });
        
        return effectId;
    }

    /**
     * 添加屏幕震动
     */
    addScreenShake(intensity, duration) {
        if (!this.enabledEffects.screenShake) return;
        
        this.screenShake.intensity = Math.max(this.screenShake.intensity, intensity);
        this.screenShake.duration = Math.max(this.screenShake.duration, duration);
        this.screenShake.currentTime = 0;
    }

    /**
     * 创建光源
     */
    createLight(x, y, config = {}) {
        const defaultConfig = {
            radius: 100,
            color: '#ffffff',
            intensity: 1.0,
            flickering: false,
            flickerSpeed: 5
        };
        
        const lightConfig = { ...defaultConfig, ...config };
        const lightId = this.generateId();
        
        this.lighting.lights.push({
            id: lightId,
            x: x,
            y: y,
            ...lightConfig,
            originalIntensity: lightConfig.intensity
        });
        
        return lightId;
    }

    /**
     * 移除光源
     */
    removeLight(lightId) {
        const index = this.lighting.lights.findIndex(light => light.id === lightId);
        if (index !== -1) {
            this.lighting.lights.splice(index, 1);
        }
    }

    /**
     * 更新效果系统
     */
    update(deltaTime) {
        const startTime = performance.now();
        
        // 更新屏幕震动
        this.updateScreenShake(deltaTime);
        
        // 更新粒子效果
        this.updateEffects(deltaTime);
        
        // 更新光照
        this.updateLighting(deltaTime);
        
        // 更新统计信息
        this.updateStats();
        
        this.stats.renderTime = performance.now() - startTime;
    }

    /**
     * 更新屏幕震动
     */
    updateScreenShake(deltaTime) {
        if (this.screenShake.duration > 0) {
            this.screenShake.currentTime += deltaTime;
            
            if (this.screenShake.currentTime < this.screenShake.duration) {
                const progress = this.screenShake.currentTime / this.screenShake.duration;
                const intensity = this.screenShake.intensity * (1 - progress);
                const frequency = this.screenShake.frequency;
                
                this.screenShake.offset.x = Math.sin(this.screenShake.currentTime * frequency) * intensity;
                this.screenShake.offset.y = Math.cos(this.screenShake.currentTime * frequency * 1.3) * intensity;
            } else {
                this.screenShake.intensity = 0;
                this.screenShake.duration = 0;
                this.screenShake.offset.x = 0;
                this.screenShake.offset.y = 0;
            }
        }
    }

    /**
     * 更新效果
     */
    updateEffects(deltaTime) {
        const effectsToRemove = [];
        
        for (const [effectId, effect] of this.effects) {
            switch (effect.type) {
                case 'explosion':
                case 'sparks':
                case 'smoke':
                case 'dust':
                case 'powerup':
                    this.updateParticleEffect(effect, deltaTime);
                    break;
                case 'trail':
                    this.updateTrailEffect(effect, deltaTime);
                    break;
                case 'ripple':
                    this.updateRippleEffect(effect, deltaTime);
                    break;
            }
            
            // 检查效果是否应该被移除
            if (this.shouldRemoveEffect(effect)) {
                effectsToRemove.push(effectId);
            }
        }
        
        // 移除过期的效果
        for (const effectId of effectsToRemove) {
            this.effects.delete(effectId);
        }
    }

    /**
     * 更新粒子效果
     */
    updateParticleEffect(effect, deltaTime) {
        const particlesToRemove = [];
        
        for (let i = 0; i < effect.particles.length; i++) {
            const particle = effect.particles[i];
            
            // 更新位置
            particle.x += particle.velocityX * deltaTime;
            particle.y += particle.velocityY * deltaTime;
            
            // 应用重力
            if (particle.gravity) {
                particle.velocityY += particle.gravity * deltaTime;
            }
            
            // 更新生命值
            particle.life -= deltaTime;
            
            // 更新大小
            if (particle.expand) {
                const progress = 1 - (particle.life / particle.maxLife);
                particle.size = particle.startSize + (particle.endSize - particle.startSize) * progress;
            }
            
            // 更新透明度
            if (particle.fadeOut) {
                particle.alpha = particle.life / particle.maxLife;
                if (particle.startAlpha) {
                    particle.alpha *= particle.startAlpha;
                }
            }
            
            // 闪烁效果
            if (particle.twinkle) {
                particle.alpha *= 0.5 + 0.5 * Math.sin(Date.now() * 0.01);
            }
            
            // 颜色变化
            if (particle.startColor && particle.endColor) {
                const progress = 1 - (particle.life / particle.maxLife);
                particle.color = this.interpolateColor(particle.startColor, particle.endColor, progress);
            }
            
            // 标记死亡粒子
            if (particle.life <= 0) {
                particlesToRemove.push(i);
            }
        }
        
        // 移除死亡粒子（从后往前移除以避免索引问题）
        for (let i = particlesToRemove.length - 1; i >= 0; i--) {
            effect.particles.splice(particlesToRemove[i], 1);
        }
    }

    /**
     * 更新轨迹效果
     */
    updateTrailEffect(effect, deltaTime) {
        effect.life -= deltaTime;
    }

    /**
     * 更新光圈效果
     */
    updateRippleEffect(effect, deltaTime) {
        effect.life -= deltaTime;
        const progress = 1 - (effect.life / effect.maxLife);
        effect.radius = effect.config.maxRadius * progress;
    }

    /**
     * 更新光照
     */
    updateLighting(deltaTime) {
        if (!this.lighting.enabled) return;
        
        for (const light of this.lighting.lights) {
            if (light.flickering) {
                const flicker = Math.sin(Date.now() * 0.001 * light.flickerSpeed) * 0.2 + 0.8;
                light.intensity = light.originalIntensity * flicker;
            }
        }
    }

    /**
     * 检查效果是否应该被移除
     */
    shouldRemoveEffect(effect) {
        switch (effect.type) {
            case 'explosion':
            case 'sparks':
            case 'smoke':
            case 'dust':
            case 'powerup':
                return effect.particles.length === 0;
            case 'trail':
            case 'ripple':
                return effect.life <= 0;
            default:
                return false;
        }
    }

    /**
     * 渲染所有效果
     */
    render(camera) {
        if (!this.enabledEffects.particles) return;
        
        this.context.save();
        
        // 应用屏幕震动
        if (this.screenShake.intensity > 0) {
            this.context.translate(this.screenShake.offset.x, this.screenShake.offset.y);
        }
        
        // 渲染光照
        if (this.lighting.enabled) {
            this.renderLighting(camera);
        }
        
        // 渲染效果
        for (const effect of this.effects.values()) {
            this.renderEffect(effect, camera);
        }
        
        this.context.restore();
    }

    /**
     * 渲染单个效果
     */
    renderEffect(effect, camera) {
        switch (effect.type) {
            case 'explosion':
            case 'sparks':
            case 'smoke':
            case 'dust':
            case 'powerup':
                this.renderParticleEffect(effect, camera);
                break;
            case 'trail':
                this.renderTrailEffect(effect, camera);
                break;
            case 'ripple':
                this.renderRippleEffect(effect, camera);
                break;
        }
    }

    /**
     * 渲染粒子效果
     */
    renderParticleEffect(effect, camera) {
        this.context.save();
        
        for (const particle of effect.particles) {
            const screenX = particle.x - camera.x;
            const screenY = particle.y - camera.y;
            
            // 跳过屏幕外的粒子
            if (screenX < -particle.size || screenX > this.canvas.width + particle.size ||
                screenY < -particle.size || screenY > this.canvas.height + particle.size) {
                continue;
            }
            
            this.context.globalAlpha = particle.alpha;
            this.context.fillStyle = particle.color;
            
            this.context.beginPath();
            this.context.arc(screenX, screenY, particle.size, 0, Math.PI * 2);
            this.context.fill();
        }
        
        this.context.restore();
    }

    /**
     * 渲染轨迹效果
     */
    renderTrailEffect(effect, camera) {
        this.context.save();
        
        const alpha = effect.life / effect.maxLife;
        this.context.globalAlpha = alpha;
        this.context.strokeStyle = effect.config.color;
        this.context.lineWidth = effect.config.width;
        this.context.lineCap = 'round';
        
        this.context.beginPath();
        this.context.moveTo(effect.startX - camera.x, effect.startY - camera.y);
        this.context.lineTo(effect.endX - camera.x, effect.endY - camera.y);
        this.context.stroke();
        
        this.context.restore();
    }

    /**
     * 渲染光圈效果
     */
    renderRippleEffect(effect, camera) {
        this.context.save();
        
        const alpha = effect.life / effect.maxLife;
        this.context.globalAlpha = alpha * effect.config.alpha;
        this.context.strokeStyle = effect.config.color;
        this.context.lineWidth = effect.config.width;
        
        this.context.beginPath();
        this.context.arc(
            effect.x - camera.x,
            effect.y - camera.y,
            effect.radius,
            0,
            Math.PI * 2
        );
        this.context.stroke();
        
        this.context.restore();
    }

    /**
     * 渲染光照
     */
    renderLighting(camera) {
        // 创建光照遮罩
        this.offscreenContext.fillStyle = this.lighting.ambientColor;
        this.offscreenContext.fillRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
        
        // 设置混合模式以创建光源
        this.offscreenContext.globalCompositeOperation = 'lighter';
        
        for (const light of this.lighting.lights) {
            const screenX = light.x - camera.x;
            const screenY = light.y - camera.y;
            
            // 跳过屏幕外的光源
            if (screenX < -light.radius || screenX > this.canvas.width + light.radius ||
                screenY < -light.radius || screenY > this.canvas.height + light.radius) {
                continue;
            }
            
            // 创建径向渐变
            const gradient = this.offscreenContext.createRadialGradient(
                screenX, screenY, 0,
                screenX, screenY, light.radius
            );
            
            const lightColor = this.hexToRgba(light.color, light.intensity);
            gradient.addColorStop(0, lightColor);
            gradient.addColorStop(1, 'transparent');
            
            this.offscreenContext.fillStyle = gradient;
            this.offscreenContext.beginPath();
            this.offscreenContext.arc(screenX, screenY, light.radius, 0, Math.PI * 2);
            this.offscreenContext.fill();
        }
        
        // 重置混合模式
        this.offscreenContext.globalCompositeOperation = 'source-over';
        
        // 将光照应用到主画布
        this.context.globalCompositeOperation = 'multiply';
        this.context.drawImage(this.offscreenCanvas, 0, 0);
        this.context.globalCompositeOperation = 'source-over';
    }

    /**
     * 颜色插值
     */
    interpolateColor(startColor, endColor, progress) {
        const start = this.hexToRgb(startColor);
        const end = this.hexToRgb(endColor);
        
        const r = Math.round(start.r + (end.r - start.r) * progress);
        const g = Math.round(start.g + (end.g - start.g) * progress);
        const b = Math.round(start.b + (end.b - start.b) * progress);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * 十六进制颜色转RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }

    /**
     * 十六进制颜色转RGBA
     */
    hexToRgba(hex, alpha) {
        const rgb = this.hexToRgb(hex);
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    }

    /**
     * 更新统计信息
     */
    updateStats() {
        let totalParticles = 0;
        for (const effect of this.effects.values()) {
            if (effect.particles) {
                totalParticles += effect.particles.length;
            }
        }
        
        this.stats.activeParticles = totalParticles;
        this.stats.activeEffects = this.effects.size;
    }

    /**
     * 获取屏幕震动偏移
     */
    getScreenShakeOffset() {
        return { ...this.screenShake.offset };
    }

    /**
     * 设置效果开关
     */
    setEffectEnabled(effectType, enabled) {
        this.enabledEffects[effectType] = enabled;
        this.emit('effectToggled', { effectType, enabled });
    }

    /**
     * 清理所有效果
     */
    clearAllEffects() {
        this.effects.clear();
        this.lighting.lights = [];
        this.screenShake.intensity = 0;
        this.screenShake.duration = 0;
    }

    /**
     * 获取性能统计
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return 'effect_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 清理资源
     */
    dispose() {
        this.clearAllEffects();
        this.particleSystems.clear();
        this.animations.clear();
        
        if (this.offscreenCanvas) {
            this.offscreenCanvas = null;
            this.offscreenContext = null;
        }
        
        this.emit('disposed');
    }
}

/**
 * 粒子系统类
 */
export class ParticleSystem {
    constructor(config = {}) {
        this.config = {
            maxParticles: 100,
            emissionRate: 10,
            particleLife: 2.0,
            startSpeed: 50,
            startSize: 5,
            startColor: '#ffffff',
            gravity: 0,
            ...config
        };
        
        this.particles = [];
        this.emissionTimer = 0;
        this.active = true;
        this.position = { x: 0, y: 0 };
    }

    /**
     * 更新粒子系统
     */
    update(deltaTime) {
        if (!this.active) return;
        
        // 发射新粒子
        this.emissionTimer += deltaTime;
        const emissionInterval = 1 / this.config.emissionRate;
        
        while (this.emissionTimer >= emissionInterval && this.particles.length < this.config.maxParticles) {
            this.emitParticle();
            this.emissionTimer -= emissionInterval;
        }
        
        // 更新现有粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.velocityX * deltaTime;
            particle.y += particle.velocityY * deltaTime;
            particle.velocityY += this.config.gravity * deltaTime;
            particle.life -= deltaTime;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * 发射粒子
     */
    emitParticle() {
        const angle = Math.random() * Math.PI * 2;
        const speed = this.config.startSpeed * (0.5 + Math.random() * 0.5);
        
        this.particles.push({
            x: this.position.x,
            y: this.position.y,
            velocityX: Math.cos(angle) * speed,
            velocityY: Math.sin(angle) * speed,
            life: this.config.particleLife,
            size: this.config.startSize,
            color: this.config.startColor
        });
    }

    /**
     * 设置位置
     */
    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
    }

    /**
     * 开始发射
     */
    start() {
        this.active = true;
    }

    /**
     * 停止发射
     */
    stop() {
        this.active = false;
    }

    /**
     * 清理所有粒子
     */
    clear() {
        this.particles = [];
    }
}










