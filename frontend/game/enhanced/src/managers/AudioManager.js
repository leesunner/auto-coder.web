








import { EventEmitter } from '../utils/EventEmitter.js';

/**
 * 音效管理器
 * 处理游戏中的所有音效播放和音频控制
 */
export class AudioManager extends EventEmitter {
    constructor() {
        super();
        
        // 音频上下文
        this.audioContext = null;
        this.masterGain = null;
        
        // 音效库
        this.sounds = new Map();
        this.music = new Map();
        
        // 音量控制
        this.masterVolume = 1.0;
        this.sfxVolume = 0.8;
        this.musicVolume = 0.6;
        
        // 播放状态
        this.currentMusic = null;
        this.activeSounds = new Set();
        
        // 音效配置
        this.maxConcurrentSounds = 32;
        this.soundPools = new Map();
        
        // 3D音效支持
        this.listenerPosition = { x: 0, y: 0, z: 0 };
        this.spatialAudioEnabled = true;
        
        // 音效预设
        this.presets = {
            tank: {
                engine: { volume: 0.3, loop: true, fadeIn: 0.5 },
                shoot: { volume: 0.7, pitch: 1.0 },
                hit: { volume: 0.8, pitch: 1.0 },
                destroy: { volume: 1.0, pitch: 1.0 }
            },
            ui: {
                click: { volume: 0.5, pitch: 1.0 },
                hover: { volume: 0.3, pitch: 1.2 },
                select: { volume: 0.6, pitch: 1.0 },
                error: { volume: 0.7, pitch: 0.8 }
            },
            environment: {
                explosion: { volume: 1.0, pitch: 1.0 },
                powerup: { volume: 0.6, pitch: 1.2 },
                ambient: { volume: 0.2, loop: true, fadeIn: 2.0 }
            }
        };
        
        // 初始化
        this.initialize();
    }

    /**
     * 初始化音频系统
     */
    async initialize() {
        try {
            // 创建音频上下文
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // 创建主增益节点
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.masterVolume;
            
            // 监听页面可见性变化
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.pauseAll();
                } else {
                    this.resumeAll();
                }
            });
            
            // 加载默认音效
            await this.loadDefaultSounds();
            
            this.emit('initialized');
        } catch (error) {
            console.error('音频系统初始化失败:', error);
            this.emit('initializationFailed', { error });
        }
    }

    /**
     * 加载默认音效
     */
    async loadDefaultSounds() {
        // 生成程序化音效
        await this.generateTankSounds();
        await this.generateUIJSounds();
        await this.generateEnvironmentSounds();
        
        console.log('默认音效加载完成');
    }

    /**
     * 生成坦克相关音效
     */
    async generateTankSounds() {
        // 引擎声音
        const engineSound = this.generateEngineSound();
        this.sounds.set('tank_engine', engineSound);
        
        // 射击声音
        const shootSound = this.generateShootSound();
        this.sounds.set('tank_shoot', shootSound);
        
        // 命中声音
        const hitSound = this.generateHitSound();
        this.sounds.set('tank_hit', hitSound);
        
        // 爆炸声音
        const explodeSound = this.generateExplosionSound();
        this.sounds.set('tank_destroy', explodeSound);
        
        // 移动声音
        const moveSound = this.generateMoveSound();
        this.sounds.set('tank_move', moveSound);
    }

    /**
     * 生成UI音效
     */
    async generateUIJSounds() {
        // 点击声音
        const clickSound = this.generateClickSound();
        this.sounds.set('ui_click', clickSound);
        
        // 悬停声音
        const hoverSound = this.generateHoverSound();
        this.sounds.set('ui_hover', hoverSound);
        
        // 选择声音
        const selectSound = this.generateSelectSound();
        this.sounds.set('ui_select', selectSound);
        
        // 错误声音
        const errorSound = this.generateErrorSound();
        this.sounds.set('ui_error', errorSound);
    }

    /**
     * 生成环境音效
     */
    async generateEnvironmentSounds() {
        // 道具收集声音
        const powerupSound = this.generatePowerUpSound();
        this.sounds.set('powerup_collect', powerupSound);
        
        // 墙壁破坏声音
        const wallBreakSound = this.generateWallBreakSound();
        this.sounds.set('wall_break', wallBreakSound);
        
        // 环境音效
        const ambientSound = this.generateAmbientSound();
        this.sounds.set('ambient', ambientSound);
    }

    /**
     * 生成引擎声音
     */
    generateEngineSound() {
        const duration = 2;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // 低频引擎声音
            const noise = (Math.random() - 0.5) * 0.1;
            const engine = Math.sin(t * 60 * Math.PI * 2) * 0.3 + 
                          Math.sin(t * 120 * Math.PI * 2) * 0.2;
            data[i] = (engine + noise) * Math.exp(-t * 0.5);
        }
        
        return buffer;
    }

    /**
     * 生成射击声音
     */
    generateShootSound() {
        const duration = 0.3;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // 尖锐的爆破声
            const noise = (Math.random() - 0.5) * 0.8;
            const bang = Math.sin(t * 800 * Math.PI * 2) * Math.exp(-t * 15);
            data[i] = (bang + noise) * Math.exp(-t * 10);
        }
        
        return buffer;
    }

    /**
     * 生成命中声音
     */
    generateHitSound() {
        const duration = 0.2;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // 金属碰撞声
            const noise = (Math.random() - 0.5) * 0.4;
            const clang = Math.sin(t * 1200 * Math.PI * 2) * Math.exp(-t * 8) +
                         Math.sin(t * 2400 * Math.PI * 2) * Math.exp(-t * 12);
            data[i] = (clang + noise) * 0.6;
        }
        
        return buffer;
    }

    /**
     * 生成爆炸声音
     */
    generateExplosionSound() {
        const duration = 1.5;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // 大爆炸声
            const noise = (Math.random() - 0.5) * 0.8;
            const boom = Math.sin(t * 80 * Math.PI * 2) * Math.exp(-t * 2) +
                        Math.sin(t * 160 * Math.PI * 2) * Math.exp(-t * 4) +
                        noise * Math.exp(-t * 3);
            data[i] = boom * 0.8;
        }
        
        return buffer;
    }

    /**
     * 生成移动声音
     */
    generateMoveSound() {
        const duration = 1;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // 履带声音
            const noise = (Math.random() - 0.5) * 0.2;
            const track = Math.sin(t * 40 * Math.PI * 2) * 0.1 + noise;
            data[i] = track * Math.exp(-t * 0.8);
        }
        
        return buffer;
    }

    /**
     * 生成点击声音
     */
    generateClickSound() {
        const duration = 0.1;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const click = Math.sin(t * 1000 * Math.PI * 2) * Math.exp(-t * 20);
            data[i] = click * 0.3;
        }
        
        return buffer;
    }

    /**
     * 生成悬停声音
     */
    generateHoverSound() {
        const duration = 0.15;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const hover = Math.sin(t * 800 * Math.PI * 2) * Math.exp(-t * 15);
            data[i] = hover * 0.2;
        }
        
        return buffer;
    }

    /**
     * 生成选择声音
     */
    generateSelectSound() {
        const duration = 0.2;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const select = Math.sin(t * 600 * Math.PI * 2) * Math.exp(-t * 10) +
                          Math.sin(t * 1200 * Math.PI * 2) * Math.exp(-t * 15);
            data[i] = select * 0.4;
        }
        
        return buffer;
    }

    /**
     * 生成错误声音
     */
    generateErrorSound() {
        const duration = 0.3;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const error = Math.sin(t * 200 * Math.PI * 2) * Math.exp(-t * 8);
            data[i] = error * 0.5;
        }
        
        return buffer;
    }

    /**
     * 生成道具收集声音
     */
    generatePowerUpSound() {
        const duration = 0.5;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // 上升音调
            const freq = 400 + t * 800;
            const powerup = Math.sin(t * freq * Math.PI * 2) * Math.exp(-t * 3);
            data[i] = powerup * 0.6;
        }
        
        return buffer;
    }

    /**
     * 生成墙壁破坏声音
     */
    generateWallBreakSound() {
        const duration = 0.8;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // 碎裂声
            const noise = (Math.random() - 0.5) * 0.6;
            const crack = Math.sin(t * 300 * Math.PI * 2) * Math.exp(-t * 5) + noise;
            data[i] = crack * 0.7;
        }
        
        return buffer;
    }

    /**
     * 生成环境音效
     */
    generateAmbientSound() {
        const duration = 10;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // 环境白噪声
            const noise = (Math.random() - 0.5) * 0.1;
            const wind = Math.sin(t * 0.5 * Math.PI * 2) * 0.05;
            data[i] = noise + wind;
        }
        
        return buffer;
    }

    /**
     * 播放音效
     */
    playSound(soundName, options = {}) {
        if (!this.audioContext || !this.sounds.has(soundName)) {
            console.warn(`音效不存在: ${soundName}`);
            return null;
        }
        
        const buffer = this.sounds.get(soundName);
        const preset = this.getPreset(soundName);
        const config = { ...preset, ...options };
        
        // 检查并发音效限制
        if (this.activeSounds.size >= this.maxConcurrentSounds) {
            this.stopOldestSound();
        }
        
        // 创建音频节点
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        source.loop = config.loop || false;
        
        // 设置音量
        const volume = (config.volume || 1.0) * this.sfxVolume * this.masterVolume;
        gainNode.gain.value = volume;
        
        // 设置音调
        if (config.pitch) {
            source.playbackRate.value = config.pitch;
        }
        
        // 3D音效
        let pannerNode = null;
        if (config.position && this.spatialAudioEnabled) {
            pannerNode = this.create3DAudio(config.position);
            source.connect(pannerNode);
            pannerNode.connect(gainNode);
        } else {
            source.connect(gainNode);
        }
        
        gainNode.connect(this.masterGain);
        
        // 淡入效果
        if (config.fadeIn) {
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + config.fadeIn);
        }
        
        // 播放
        source.start(0);
        
        // 创建音效实例
        const soundInstance = {
            id: this.generateId(),
            source,
            gainNode,
            pannerNode,
            name: soundName,
            startTime: this.audioContext.currentTime,
            config
        };
        
        // 设置结束回调
        source.onended = () => {
            this.activeSounds.delete(soundInstance);
            this.emit('soundEnded', { soundInstance });
        };
        
        this.activeSounds.add(soundInstance);
        this.emit('soundPlayed', { soundInstance });
        
        return soundInstance;
    }

    /**
     * 创建3D音效
     */
    create3DAudio(position) {
        const pannerNode = this.audioContext.createPanner();
        pannerNode.panningModel = 'HRTF';
        pannerNode.distanceModel = 'exponential';
        pannerNode.refDistance = 100;
        pannerNode.maxDistance = 1000;
        pannerNode.rolloffFactor = 1;
        
        pannerNode.setPosition(position.x, position.y, position.z || 0);
        
        return pannerNode;
    }

    /**
     * 停止音效
     */
    stopSound(soundInstance) {
        if (!soundInstance || !this.activeSounds.has(soundInstance)) return;
        
        const config = soundInstance.config;
        
        if (config.fadeOut) {
            // 淡出效果
            const currentVolume = soundInstance.gainNode.gain.value;
            soundInstance.gainNode.gain.setValueAtTime(currentVolume, this.audioContext.currentTime);
            soundInstance.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + config.fadeOut);
            
            setTimeout(() => {
                soundInstance.source.stop();
            }, config.fadeOut * 1000);
        } else {
            soundInstance.source.stop();
        }
        
        this.activeSounds.delete(soundInstance);
    }

    /**
     * 停止所有音效
     */
    stopAllSounds() {
        for (const soundInstance of this.activeSounds) {
            soundInstance.source.stop();
        }
        this.activeSounds.clear();
    }

    /**
     * 停止最旧的音效
     */
    stopOldestSound() {
        let oldestSound = null;
        let oldestTime = Infinity;
        
        for (const soundInstance of this.activeSounds) {
            if (soundInstance.startTime < oldestTime) {
                oldestTime = soundInstance.startTime;
                oldestSound = soundInstance;
            }
        }
        
        if (oldestSound) {
            this.stopSound(oldestSound);
        }
    }

    /**
     * 播放背景音乐
     */
    playMusic(musicName, options = {}) {
        // 停止当前音乐
        if (this.currentMusic) {
            this.stopMusic();
        }
        
        const config = { loop: true, volume: 1.0, fadeIn: 2.0, ...options };
        const musicInstance = this.playSound(musicName, config);
        
        if (musicInstance) {
            this.currentMusic = musicInstance;
        }
        
        return musicInstance;
    }

    /**
     * 停止背景音乐
     */
    stopMusic() {
        if (this.currentMusic) {
            this.stopSound(this.currentMusic);
            this.currentMusic = null;
        }
    }

    /**
     * 设置监听者位置（3D音效）
     */
    setListenerPosition(x, y, z = 0) {
        if (this.audioContext && this.audioContext.listener) {
            this.listenerPosition = { x, y, z };
            this.audioContext.listener.setPosition(x, y, z);
        }
    }

    /**
     * 更新3D音效位置
     */
    updateSoundPosition(soundInstance, position) {
        if (soundInstance.pannerNode) {
            soundInstance.pannerNode.setPosition(position.x, position.y, position.z || 0);
        }
    }

    /**
     * 设置主音量
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
        this.emit('volumeChanged', { type: 'master', volume: this.masterVolume });
    }

    /**
     * 设置音效音量
     */
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.emit('volumeChanged', { type: 'sfx', volume: this.sfxVolume });
    }

    /**
     * 设置音乐音量
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        // 更新当前音乐音量
        if (this.currentMusic) {
            const newVolume = this.musicVolume * this.masterVolume;
            this.currentMusic.gainNode.gain.value = newVolume;
        }
        
        this.emit('volumeChanged', { type: 'music', volume: this.musicVolume });
    }

    /**
     * 获取音效预设
     */
    getPreset(soundName) {
        for (const [category, presets] of Object.entries(this.presets)) {
            for (const [name, preset] of Object.entries(presets)) {
                if (soundName.includes(name)) {
                    return preset;
                }
            }
        }
        return {};
    }

    /**
     * 暂停所有音效
     */
    pauseAll() {
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend();
        }
    }

    /**
     * 恢复所有音效
     */
    resumeAll() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    /**
     * 加载外部音频文件
     */
    async loadAudioFile(name, url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.sounds.set(name, audioBuffer);
            this.emit('audioLoaded', { name, url });
            
            return audioBuffer;
        } catch (error) {
            console.error(`加载音频文件失败: ${url}`, error);
            this.emit('audioLoadFailed', { name, url, error });
            return null;
        }
    }

    /**
     * 批量加载音频文件
     */
    async loadAudioFiles(audioList) {
        const promises = audioList.map(({ name, url }) => this.loadAudioFile(name, url));
        const results = await Promise.allSettled(promises);
        
        const loaded = results.filter(result => result.status === 'fulfilled').length;
        const failed = results.length - loaded;
        
        this.emit('batchAudioLoaded', { loaded, failed, total: results.length });
        
        return results;
    }

    /**
     * 获取音频状态
     */
    getAudioState() {
        return {
            context: this.audioContext ? this.audioContext.state : 'closed',
            masterVolume: this.masterVolume,
            sfxVolume: this.sfxVolume,
            musicVolume: this.musicVolume,
            activeSounds: this.activeSounds.size,
            loadedSounds: this.sounds.size,
            currentMusic: this.currentMusic ? this.currentMusic.name : null
        };
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return 'audio_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 清理资源
     */
    dispose() {
        this.stopAllSounds();
        this.stopMusic();
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.sounds.clear();
        this.music.clear();
        this.activeSounds.clear();
        
        this.emit('disposed');
    }
}









