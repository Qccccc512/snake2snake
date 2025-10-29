import AIController from './AIController.js';
import GameConfig from '../config/GameConfig.js';
import Position from '../models/Position.js';
import { Direction } from '../constants/Directions.js';

/**
 * 简单AI
 * 反应慢，策略简单，偶尔犯错
 */
class EasyAI extends AIController {
    constructor(game) {
        super(game, 'easy');
        this.config = GameConfig.getInstance();
        this.settings = this.config.AI_SETTINGS.easy;
    }

    /**
     * 做出决策
     * @param {Snake} snake - AI控制的蛇
     * @returns {object|null} 决策的方向
     */
    makeDecision(snake) {
        if (!snake.isAlive) return null;

        const now = Date.now();
        // 反应延迟
        if (now - this.lastDecisionTime < this.settings.reactionDelay) {
            return null;
        }
        this.lastDecisionTime = now;

        const head = snake.getHead();
        if (!head) return null;

        // 偶尔犯错：随机选择方向
        if (Math.random() < this.settings.errorRate) {
            const safeDirections = this.getSafeDirections(snake);
            if (safeDirections.length > 0) {
                return safeDirections[Math.floor(Math.random() * safeDirections.length)];
            }
        }

        // 寻找最近的食物
        const targetFood = this.findNearestFood(head);
        if (!targetFood) {
            // 没有食物，随机移动
            const safeDirections = this.getSafeDirections(snake);
            return safeDirections.length > 0 ? safeDirections[0] : null;
        }

        // 简单的方向选择（贪心算法）
        let bestDir = snake.direction;

        if (head.x < targetFood.position.x && snake.direction !== Direction.LEFT) {
            bestDir = Direction.RIGHT;
        } else if (head.x > targetFood.position.x && snake.direction !== Direction.RIGHT) {
            bestDir = Direction.LEFT;
        } else if (head.y < targetFood.position.y && snake.direction !== Direction.UP) {
            bestDir = Direction.DOWN;
        } else if (head.y > targetFood.position.y && snake.direction !== Direction.DOWN) {
            bestDir = Direction.UP;
        }

        // 基本避障
        const nextPos = new Position(head.x + bestDir.x, head.y + bestDir.y);
        const danger = this.pathFinder.evaluateDanger(nextPos, snake);
        
        if (danger >= 1000) {
            // 危险，选择安全方向
            const safeDirections = this.getSafeDirections(snake);
            return safeDirections.length > 0 
                ? safeDirections[Math.floor(Math.random() * safeDirections.length)]
                : null;
        }

        return bestDir;
    }
}

export default EasyAI;

