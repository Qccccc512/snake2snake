import GameConfig from '../config/GameConfig.js';
import Position from '../models/Position.js';
import { Direction } from '../constants/Directions.js';
import CollisionDetector from './CollisionDetector.js';

/**
 * 重生管理器
 * 负责处理蛇的死亡和重生逻辑
 */
class RespawnManager {
    constructor(game) {
        this.game = game;
        this.config = GameConfig.getInstance();
        this.collisionDetector = CollisionDetector.getInstance();
        this.respawnQueue = []; // 等待重生的蛇列表
    }

    /**
     * 处理蛇的死亡
     * @param {Snake} snake - 死亡的蛇
     * @param {string} deathType - 死亡类型
     */
    handleDeath(snake, deathType) {
        if (!snake.isAlive) return;

        // 蛇死亡
        snake.die(deathType);

        // 掉落食物
        this.game.foodManager.dropFoodFromSnake(snake);

        // 加入重生队列
        this.respawnQueue.push({
            snake: snake,
            timeLeft: this.config.RESPAWN_DELAY
        });
    }

    /**
     * 更新重生队列（每帧调用）
     * @param {number} deltaTime - 距离上次更新的时间（毫秒）
     */
    update(deltaTime) {
        for (let i = this.respawnQueue.length - 1; i >= 0; i--) {
            const item = this.respawnQueue[i];
            item.timeLeft -= deltaTime;

            if (item.timeLeft <= 0) {
                // 时间到，尝试重生
                this.tryRespawn(item.snake);
                this.respawnQueue.splice(i, 1);
            }
        }
    }

    /**
     * 尝试让蛇重生
     * @param {Snake} snake - 要重生的蛇
     */
    tryRespawn(snake) {
        const respawnData = this.findSafeRespawnPosition();
        
        if (respawnData) {
            snake.respawn(respawnData.x, respawnData.y, respawnData.direction);
        } else {
            // 找不到安全位置，使用降级策略
            console.warn('No safe respawn position found, using fallback');
            this.forceRespawn(snake);
        }
    }

    /**
     * 寻找安全的重生位置
     * @returns {{x: number, y: number, direction: object}|null}
     */
    findSafeRespawnPosition() {
        const directions = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
        const maxAttempts = 100;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            // 随机选择位置（留出边界空间）
            const x = Math.floor(Math.random() * (this.config.GRID_SIZE - 6)) + 3;
            const y = Math.floor(Math.random() * (this.config.GRID_SIZE - 6)) + 3;
            const direction = directions[Math.floor(Math.random() * directions.length)];

            // 检查这个位置是否可以放置完整的初始蛇身
            if (this.isValidRespawnPosition(x, y, direction)) {
                return { x, y, direction };
            }
        }

        return null;
    }

    /**
     * 检查重生位置是否有效
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {object} direction - 方向
     * @returns {boolean}
     */
    isValidRespawnPosition(x, y, direction) {
        // 检查整个蛇身的位置
        for (let i = 0; i < this.config.INITIAL_LENGTH; i++) {
            const segmentPos = new Position(
                x - direction.x * i,
                y - direction.y * i
            );

            // 检查边界
            if (!this.collisionDetector.isInBounds(segmentPos)) {
                return false;
            }

            // 检查是否与其他蛇重叠
            if (this.collisionDetector.checkPositionOccupied(segmentPos, this.game.snakes)) {
                return false;
            }

            // 检查是否与食物重叠
            for (const food of this.game.foodManager.foods) {
                if (food.position.equals(segmentPos)) {
                    return false;
                }
            }
        }

        // 检查头部周围是否有至少一个安全方向
        const headPos = new Position(x, y);
        const neighbors = headPos.getNeighbors();
        const safeNeighbors = neighbors.filter(pos => 
            this.collisionDetector.isInBounds(pos) &&
            !this.collisionDetector.checkPositionOccupied(pos, this.game.snakes)
        );

        return safeNeighbors.length >= 1;
    }

    /**
     * 强制重生（降级策略）
     * @param {Snake} snake - 要重生的蛇
     */
    forceRespawn(snake) {
        const fallbackPositions = [
            { x: 3, y: 3, direction: Direction.RIGHT },
            { x: this.config.GRID_SIZE - 4, y: this.config.GRID_SIZE - 4, direction: Direction.LEFT },
            { x: Math.floor(this.config.GRID_SIZE / 2), y: 3, direction: Direction.DOWN },
            { x: Math.floor(this.config.GRID_SIZE / 2), y: this.config.GRID_SIZE - 4, direction: Direction.UP }
        ];
        const directions = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];

        // 优先使用预设的安全点
        for (const fallback of fallbackPositions) {
            this.clearAreaForRespawn(fallback.x, fallback.y);
            if (this.isValidRespawnPosition(fallback.x, fallback.y, fallback.direction)) {
                snake.respawn(fallback.x, fallback.y, fallback.direction);
                return;
            }
        }

        // 遍历全图寻找可用位置
        for (let x = 2; x < this.config.GRID_SIZE - 2; x++) {
            for (let y = 2; y < this.config.GRID_SIZE - 2; y++) {
                for (const direction of directions) {
                    if (this.isValidRespawnPosition(x, y, direction)) {
                        this.clearAreaForRespawn(x, y);
                        snake.respawn(x, y, direction);
                        return;
                    }
                }
            }
        }

        // 兜底方案：至少保证不被食物阻挡
        const fallbackPos = fallbackPositions[0];
        this.clearAreaForRespawn(fallbackPos.x, fallbackPos.y);
        console.error('Failed to locate a safe respawn position; forcing fallback respawn');
        snake.respawn(fallbackPos.x, fallbackPos.y, fallbackPos.direction);
    }

    /**
     * 清理重生位置附近的食物
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    clearAreaForRespawn(x, y) {
        const clearRange = 2;
        this.game.foodManager.foods = this.game.foodManager.foods.filter(food => {
            const distance = Math.abs(food.position.x - x) + Math.abs(food.position.y - y);
            return distance > clearRange;
        });
    }

    /**
     * 获取蛇的重生倒计时
     * @param {Snake} snake - 蛇实例
     * @returns {number} 剩余毫秒数，0表示不在重生中
     */
    getRespawnTimeLeft(snake) {
        const item = this.respawnQueue.find(i => i.snake === snake);
        return item ? item.timeLeft : 0;
    }

    /**
     * 清空重生队列
     */
    clear() {
        this.respawnQueue = [];
    }
}

export default RespawnManager;

