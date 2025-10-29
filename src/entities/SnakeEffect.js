/**
 * 蛇效果基类（策略模式）
 * 定义所有蛇效果的通用行为
 */
class SnakeEffect {
    /**
     * @param {string} type - 效果类型
     * @param {number} duration - 持续时间（毫秒）
     */
    constructor(type, duration) {
        this.type = type;
        this.duration = duration;
        this.startTime = Date.now();
    }

    /**
     * 应用效果到蛇（抽象方法，子类必须实现）
     * @param {Snake} snake - 蛇实例
     * @abstract
     */
    apply(snake) {
        throw new Error('apply() must be implemented by subclass');
    }

    /**
     * 每帧更新效果
     * @param {Snake} snake - 蛇实例
     * @param {Game} game - 游戏实例
     */
    update(snake, game) {
        // 子类可以覆盖以实现特殊逻辑
    }

    /**
     * 移除效果时的处理
     * @param {Snake} snake - 蛇实例
     */
    remove(snake) {
        // 子类可以覆盖以实现清理逻辑
    }

    /**
     * 检查效果是否已过期
     * @returns {boolean}
     */
    isExpired() {
        return Date.now() - this.startTime >= this.duration;
    }

    /**
     * 获取剩余时间（秒）
     * @returns {number}
     */
    getRemainingTime() {
        const remaining = this.duration - (Date.now() - this.startTime);
        return Math.max(0, Math.ceil(remaining / 1000));
    }
}

/**
 * 加速效果
 * 使蛇的移动速度翻倍
 */
class SpeedEffect extends SnakeEffect {
    constructor(duration) {
        super('speed', duration);
        this.speedMultiplier = 2; // 速度翻倍
    }

    apply(snake) {
        // 标记蛇拥有加速效果
        snake.speedMultiplier = this.speedMultiplier;
    }

    remove(snake) {
        // 移除加速效果
        snake.speedMultiplier = 1;
    }

    update(snake, game) {
        // 记录加速时间（每帧约1/60秒）
        if (snake.user) {
            // 每秒更新一次
            const currentSecond = Math.floor((Date.now() - this.startTime) / 1000);
            if (!this.lastSecond || currentSecond > this.lastSecond) {
                this.lastSecond = currentSecond;
                snake.user.stats.recordSpeedTime(1);
            }
        }
    }
}

/**
 * 磁铁效果
 * 自动吸取头部九宫格范围内的所有豆子
 */
class MagnetEffect extends SnakeEffect {
    constructor(duration, range = 1) {
        super('magnet', duration);
        this.range = range; // 九宫格范围
    }

    apply(snake) {
        // 标记蛇拥有磁铁效果
        snake.hasMagnetEffect = true;
    }

    remove(snake) {
        // 移除磁铁效果
        snake.hasMagnetEffect = false;
    }

    /**
     * 每帧更新磁铁效果，吸取周围的豆子
     * @param {Snake} snake - 蛇实例
     * @param {Game} game - 游戏实例
     */
    update(snake, game) {
        if (!snake.isAlive || !snake.body || snake.body.length === 0) return;
        
        const head = snake.body[0];
        if (!head) return;

        // 获取九宫格范围内的位置
        const surroundingPositions = [];
        for (let dx = -this.range; dx <= this.range; dx++) {
            for (let dy = -this.range; dy <= this.range; dy++) {
                if (dx === 0 && dy === 0) continue; // 排除头部自己的位置
                surroundingPositions.push({
                    x: head.x + dx,
                    y: head.y + dy
                });
            }
        }

        // 检查并吸取范围内的食物
        const foodToAbsorb = [];
        for (const food of game.foodManager.foods) {
            // 跳过地雷
            if (food.type === 'mine') continue;

            // 检查食物是否在范围内
            const inRange = surroundingPositions.some(pos =>
                pos.x === food.position.x && pos.y === food.position.y
            );

            if (inRange) {
                foodToAbsorb.push(food);
            }
        }

        for (const food of foodToAbsorb) {
            // 复用原有吃豆逻辑，确保各类食物效果和统计一致
            food.onEaten(snake, game);

            if (snake.user) {
                snake.user.stats.recordMagnetCollected(1);
            }

            game.foodManager.removeFood(food);
        }
    }
}

export { SnakeEffect, SpeedEffect, MagnetEffect };
export default SnakeEffect;

