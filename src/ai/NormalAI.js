import AIController from './AIController.js';
import GameConfig from '../config/GameConfig.js';
import Position from '../models/Position.js';
import { Direction } from '../constants/Directions.js';

/**
 * 中等AI
 * 平衡的策略，更好的避障能力，考虑地图控制
 */
class NormalAI extends AIController {
    constructor(game) {
        super(game, 'normal');
        this.config = GameConfig.getInstance();
        this.settings = this.config.AI_SETTINGS.normal;
    }

    /**
     * 做出决策
     * @param {Snake} snake - AI控制的蛇
     * @returns {object|null} 决策的方向
     */
    makeDecision(snake) {
        if (!snake.isAlive) return null;

        const now = Date.now();
        if (now - this.lastDecisionTime < this.settings.reactionDelay) {
            return null;
        }
        this.lastDecisionTime = now;

        const head = snake.getHead();
        if (!head) return null;

        // 偶尔犯错
        if (Math.random() < this.settings.errorRate) {
            const safeDirections = this.getSafeDirections(snake);
            if (safeDirections.length > 0) {
                return safeDirections[Math.floor(Math.random() * safeDirections.length)];
            }
        }

        // 寻找最佳食物（考虑距离和安全性）
        const targetFood = this.findBestFood(head, snake);
        if (!targetFood) {
            // 没有食物，向地图中心移动
            return this.moveTowardCenter(snake);
        }

        // 智能方向选择
        const directions = [
            { dir: Direction.UP, priority: 0 },
            { dir: Direction.DOWN, priority: 0 },
            { dir: Direction.LEFT, priority: 0 },
            { dir: Direction.RIGHT, priority: 0 }
        ];

        // 计算每个方向的优先级
        for (const d of directions) {
            // 不能掉头
            if ((d.dir === Direction.UP && snake.direction === Direction.DOWN) ||
                (d.dir === Direction.DOWN && snake.direction === Direction.UP) ||
                (d.dir === Direction.LEFT && snake.direction === Direction.RIGHT) ||
                (d.dir === Direction.RIGHT && snake.direction === Direction.LEFT)) {
                d.priority = -1000;
                continue;
            }

            const nextPos = new Position(head.x + d.dir.x, head.y + d.dir.y);
            
            // 检查碰撞
            const danger = this.pathFinder.evaluateDanger(nextPos, snake);
            if (danger >= 1000) {
                d.priority = -500;
                continue;
            }

            // 计算到目标的距离改善
            const currentDist = head.manhattanDistance(targetFood.position);
            const newDist = nextPos.manhattanDistance(targetFood.position);
            d.priority = (currentDist - newDist) * 10;

            // 考虑危险度
            d.priority -= danger * 3;

            // 考虑战略价值
            const strategicValue = this.pathFinder.evaluateStrategicValue(nextPos);
            d.priority += strategicValue * 2;
        }

        // 选择优先级最高的方向
        const bestDirection = directions.reduce((best, current) => 
            current.priority > best.priority ? current : best);
        
        return bestDirection.priority > -500 ? bestDirection.dir : null;
    }

    /**
     * 向地图中心移动
     * @param {Snake} snake - 蛇实例
     * @returns {object|null}
     */
    moveTowardCenter(snake) {
        const head = snake.getHead();
        const centerX = this.config.GRID_SIZE / 2;
        const centerY = this.config.GRID_SIZE / 2;
        const centerPos = new Position(
            Math.floor(centerX),
            Math.floor(centerY)
        );

        return this.pathFinder.findBestDirection(head, centerPos, snake, true);
    }
}

export default NormalAI;

