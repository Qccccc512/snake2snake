import GameConfig from '../config/GameConfig.js';

/**
 * 计时器类
 * 管理游戏倒计时
 */
class Timer {
    constructor() {
        this.config = GameConfig.getInstance();
        this.timeRemaining = this.config.GAME_DURATION;
        this.isRunning = false;
        this.intervalId = null;
        this.callbacks = {
            onTick: null,
            onEnd: null
        };
    }

    /**
     * 开始计时
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.intervalId = setInterval(() => {
            if (this.isRunning) {
                this.tick();
            }
        }, 1000);
    }

    /**
     * 暂停计时
     */
    pause() {
        this.isRunning = false;
    }

    /**
     * 继续计时
     */
    resume() {
        this.isRunning = true;
    }

    /**
     * 停止计时
     */
    stop() {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * 重置计时器
     */
    reset() {
        this.stop();
        this.timeRemaining = this.config.GAME_DURATION;
    }

    /**
     * 每秒执行一次
     */
    tick() {
        this.timeRemaining--;
        
        // 触发更新回调
        if (this.callbacks.onTick) {
            this.callbacks.onTick(this.timeRemaining);
        }

        // 检查是否结束
        if (this.timeRemaining <= 0) {
            this.stop();
            if (this.callbacks.onEnd) {
                this.callbacks.onEnd();
            }
        }
    }

    /**
     * 设置更新回调
     * @param {Function} callback - 回调函数 (timeRemaining) => {}
     */
    onTick(callback) {
        this.callbacks.onTick = callback;
    }

    /**
     * 设置结束回调
     * @param {Function} callback - 回调函数 () => {}
     */
    onEnd(callback) {
        this.callbacks.onEnd = callback;
    }

    /**
     * 获取剩余时间
     * @returns {number} 剩余秒数
     */
    getRemainingTime() {
        return this.timeRemaining;
    }

    /**
     * 格式化时间显示
     * @param {number} seconds - 秒数（可选，默认使用当前剩余时间）
     * @returns {string} 格式化的时间字符串 MM:SS
     */
    formatTime(seconds = this.timeRemaining) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * 检查计时器是否正在运行
     * @returns {boolean}
     */
    isActive() {
        return this.isRunning;
    }
}

export default Timer;

