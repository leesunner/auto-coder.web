


/**
 * 音频管理器类
 * 负责游戏音效和背景音乐的播放管理
 */

/**
 * 音频管理器
 */
export class AudioManager {
    constructor() {
        // 音频上下文
        this.audioContext = null;
        this.isAudioSupported = false;
        
        // 音频缓存
        this.soundBuffers = new Map();
        this.musicBuffers = new Map();
        
        // 当前播放的音频
        this.currentMusic = null;
        this.activeSounds = new Map();
        
        // 音量设置
        this.masterVolume = 1.0;
        this.soundVolume = 0.7;
        this.musicVolume = 0.5;
        this.isMuted = false;
        
        // 音频节点
        this.masterGain = null;
        this.soundGain = null;
        this.musicGain = null;
        
        // 音频配置
        this.audioConfig = {
            maxConcurrentSounds: 10,
            fadeInDuration: 0.5,
            fadeOutDuration: 0.3,
            musicLoopEnabled: true
        };
        
        // 音频文件映射（程序化生成的音频）
        this.soundDefinitions = {
            // 射击音效
            shoot: {
                frequency: 800,
                duration: 0.1,
                type: 'square',
                volume: 0.3
            },
            
            // 爆炸音效
            explosion: {
                frequency: 200,
                duration: 0.5,
                type: 'sawtooth',
                volume: 0.6,
                noise: true
            },
            
            // 坦克移动音效
            tankMove: {
                frequency: 150,
                duration: 0.2,
                type: 'triangle',
                volume: 0.2,
                loop: true
            },
            
            // 拾取道具音效
            powerUp: {
                frequency: 1200,
                duration: 0.3,
                type: 'sine',
                volume: 0.4
            },
            
            // 游戏开始音效
            gameStart: {
                frequency: 600,
                duration: 1.0,
                type: 'sine',
                volume: 0.5
            },
            
            // 游戏结束音效
            gameOver: {
                frequency: 300,
                duration: 2.0,
                type: 'triangle',
                volume: 0.4
            },
            
            // 胜利音效
            victory: {
                frequency: 800,
                duration: 2.0,
                type: 'sine',
                volume: 0.6
            },
            
            // UI点击音效
            uiClick: {
                frequency: 1000,
                duration: 0.1,
                type: 'sine',
                volume: 0.3
            }
        };
    }

    /**
     * 初始化音频管理器
     */
    async init() {
        console.log('初始化音频管理器...');
        
        try {
            // 检查音频支持
            this.checkAudioSupport();
            
            if (this.isAudioSupported) {
                // 创建音频上下文
                await this.createAudioContext();
                
                // 设置音频节点
                this.setupAudioNodes();
                
                // 生成音频缓冲
                await this.generateAudioBuffers();
                
                console.log('音频管理器初始化完成');
            } else {
                console.warn('音频不受支持，音频功能将被禁用');
            }
            
        } catch (error) {
            console.error('音频管理器初始化失败:', error);
            this.isAudioSupported = false;
        }
    }

    /**
     * 检查音频支持
     */
    checkAudioSupport() {
        this.isAudioSupported = !!(window.AudioContext || window.webkitAudioContext);
    }

    /**
     * 创建音频上下文
     */
    async createAudioContext() {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContextClass();
        
        // 处理自动播放策略
        if (this.audioContext.state === 'suspended') {
            // 等待用户交互后恢复音频上下文
            const resumeAudio = async () => {
                if (this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                    console.log('音频上下文已恢复');
                }
                document.removeEventListener('click', resumeAudio);
                document.removeEventListener('keydown', resumeAudio);
            };
            
            document.addEventListener('click', resumeAudio);
            document.addEventListener('keydown', resumeAudio);
        }
    }

    /**
     * 设置音频节点
     */
    setupAudioNodes() {
        // 创建增益节点
        this.masterGain = this.audioContext.createGain();
        this.soundGain = this.audioContext.createGain();
        this.musicGain = this.audioContext.createGain();
        
        // 连接音频节点
        this.soundGain.connect(this.masterGain);
        this.musicGain.connect(this.masterGain);
        this.masterGain.connect(this.audioContext.destination);
        
        // 设置初始音量
        this.updateVolumeNodes();
    }

    /**
     * 生成音频缓冲
     */
    async generateAudioBuffers() {
        console.log('生成音频缓冲...');
        
        for (const [soundName, definition] of Object.entries(this.soundDefinitions)) {
            try {
                const buffer = await this.generateSoundBuffer(definition);
                this.soundBuffers.set(soundName, buffer);
            } catch (error) {
                console.error(`生成音频缓冲失败 (${soundName}):`, error);
            }
        }
        
        console.log(`已生成 ${this.soundBuffers.size} 个音频缓冲`);
    }

    /**
     * 生成单个音频缓冲
     */
    async generateSoundBuffer(definition) {
        const sampleRate = this.audioContext.sampleRate;
        const duration = definition.duration;
        const length = sampleRate * duration;
        
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        
        const frequency = definition.frequency;
        const type = definition.type || 'sine';
        
        for (let i = 0; i < length; i++) {
            const time = i / sampleRate;
            let sample = 0;
            
            // 生成基础波形
            switch (type) {
                case 'sine':
                    sample = Math.sin(2 * Math.PI * frequency * time);
                    break;
                case 'square':
                    sample = Math.sign(Math.sin(2 * Math.PI * frequency * time));
                    break;
                case 'sawtooth':
                    sample = 2 * (time * frequency - Math.floor(time * frequency + 0.5));
                    break;
                case 'triangle':
                    sample = 2 * Math.abs(2 * (time * frequency - Math.floor(time * frequency + 0.5))) - 1;
                    break;
            }
            
            // 添加噪音（如果需要）
            if (definition.noise) {
                sample += (Math.random() * 2 - 1) * 0.3;
            }
            
            // 应用包络
            const envelope = this.calculateEnvelope(time, duration);
            sample *= envelope;
            
            // 应用音量
            sample *= definition.volume || 1.0;
            
            data[i] = sample;
        }
        
        return buffer;
    }

    /**
     * 计算音频包络
     */
    calculateEnvelope(time, duration) {
        const attackTime = 0.01;
        const releaseTime = 0.1;
        
        if (time < attackTime) {
            // 攻击阶段
            return time / attackTime;
        } else if (time > duration - releaseTime) {
            // 释放阶段
            return (duration - time) / releaseTime;
        } else {
            // 保持阶段
            return 1.0;
        }
    }

    /**
     * 播放音效
     */
    playSound(soundName, options = {}) {
        if (!this.isAudioSupported || this.isMuted) {
            return null;
        }
        
        const buffer = this.soundBuffers.get(soundName);
        if (!buffer) {
            console.warn(`音效未找到: ${soundName}`);
            return null;
        }
        
        try {
            // 检查并发音效数量
            if (this.activeSounds.size >= this.audioConfig.maxConcurrentSounds) {
                this.stopOldestSound();
            }
            
            // 创建音源节点
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = buffer;
            source.connect(gainNode);
            gainNode.connect(this.soundGain);
            
            // 设置音量
            const volume = options.volume !== undefined ? options.volume : 1.0;
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            
            // 设置播放速率（音调）
            if (options.playbackRate) {
                source.playbackRate.setValueAtTime(options.playbackRate, this.audioContext.currentTime);
            }
            
            // 设置循环
            if (options.loop) {
                source.loop = true;
            }
            
            // 生成唯一ID
            const soundId = Date.now() + Math.random();
            
            // 添加到活跃音效列表
            this.activeSounds.set(soundId, {
                source,
                gainNode,
                startTime: this.audioContext.currentTime,
                soundName
            });
            
            // 设置结束回调
            source.onended = () => {
                this.activeSounds.delete(soundId);
            };
            
            // 开始播放
            source.start(0);
            
            return soundId;
            
        } catch (error) {
            console.error(`播放音效失败 (${soundName}):`, error);
            return null;
        }
    }

    /**
     * 停止音效
     */
    stopSound(soundId) {
        const sound = this.activeSounds.get(soundId);
        if (sound) {
            try {
                sound.source.stop();
                this.activeSounds.delete(soundId);
            } catch (error) {
                console.error('停止音效失败:', error);
            }
        }
    }

    /**
     * 停止所有音效
     */
    stopAllSounds() {
        for (const [soundId, sound] of this.activeSounds) {
            try {
                sound.source.stop();
            } catch (error) {
                console.error('停止音效失败:', error);
            }
        }
        this.activeSounds.clear();
    }

    /**
     * 停止最旧的音效
     */
    stopOldestSound() {
        let oldestId = null;
        let oldestTime = Infinity;
        
        for (const [soundId, sound] of this.activeSounds) {
            if (sound.startTime < oldestTime) {
                oldestTime = sound.startTime;
                oldestId = soundId;
            }
        }
        
        if (oldestId) {
            this.stopSound(oldestId);
        }
    }

    /**
     * 播放背景音乐
     */
    playMusic(musicName, options = {}) {
        if (!this.isAudioSupported || this.isMuted) {
            return;
        }
        
        // 停止当前音乐
        this.stopMusic();
        
        // 这里应该加载和播放背景音乐
        // 由于这是简化版本，我们跳过背景音乐实现
        console.log(`播放背景音乐: ${musicName}`);
    }

    /**
     * 停止背景音乐
     */
    stopMusic() {
        if (this.currentMusic) {
            try {
                this.currentMusic.stop();
                this.currentMusic = null;
            } catch (error) {
                console.error('停止背景音乐失败:', error);
            }
        }
    }

    /**
     * 设置主音量
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumeNodes();
    }

    /**
     * 设置音效音量
     */
    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumeNodes();
    }

    /**
     * 设置音乐音量
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumeNodes();
    }

    /**
     * 更新音量节点
     */
    updateVolumeNodes() {
        if (!this.isAudioSupported) return;
        
        const currentTime = this.audioContext.currentTime;
        
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(
                this.isMuted ? 0 : this.masterVolume,
                currentTime
            );
        }
        
        if (this.soundGain) {
            this.soundGain.gain.setValueAtTime(this.soundVolume, currentTime);
        }
        
        if (this.musicGain) {
            this.musicGain.gain.setValueAtTime(this.musicVolume, currentTime);
        }
    }

    /**
     * 静音/取消静音
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.updateVolumeNodes();
        console.log(`音频${this.isMuted ? '已静音' : '已取消静音'}`);
    }

    /**
     * 设置静音状态
     */
    setMuted(muted) {
        this.isMuted = muted;
        this.updateVolumeNodes();
    }

    /**
     * 获取音频状态
     */
    getAudioState() {
        return {
            isSupported: this.isAudioSupported,
            isMuted: this.isMuted,
            masterVolume: this.masterVolume,
            soundVolume: this.soundVolume,
            musicVolume: this.musicVolume,
            activeSounds: this.activeSounds.size,
            contextState: this.audioContext ? this.audioContext.state : 'unavailable'
        };
    }

    /**
     * 预加载音效
     */
    preloadSounds(soundNames) {
        console.log(`预加载音效: ${soundNames.join(', ')}`);
        // 在实际项目中，这里会预加载指定的音效文件
        // 由于我们使用程序化生成的音频，这里只是占位符
    }

    /**
     * 清理资源
     */
    cleanup() {
        console.log('清理音频管理器...');
        
        // 停止所有音效
        this.stopAllSounds();
        
        // 停止背景音乐
        this.stopMusic();
        
        // 关闭音频上下文
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        // 清理缓存
        this.soundBuffers.clear();
        this.musicBuffers.clear();
        
        console.log('音频管理器清理完成');
    }
}


