import PathFinder from './PathFinder.js';
import { Direction } from '../constants/Directions.js';
import Position from '../models/Position.js';

/**
 * AI控制器基类（策略模式）
 * 定义AI的通用行为
 */
class AIController {
    /**
     * @param {Game} game - 游戏实例
     * @param {string} difficulty - 难度级别
     */
    constructor(game, difficulty) {
        this.game = game;
        this.difficulty = difficulty;
        this.pathFinder = new PathFinder(game);
        this.lastDecisionTime = 0;
    }

    /**
     * 做出决策（抽象方法，子类必须实现）
     * @param {Snake} snake - AI控制的蛇
     * @abstract
     * @returns {object|null} 决策的方向
     */
    makeDecision(snake) {
        throw new Error('makeDecision() must be implemented by subclass');
    }

    /**
     * 寻找最近的食物
     * @param {Position} position - 当前位置
     * @returns {Food|null} 最近的食物
     */
    findNearestFood(position) {
        let nearestFood = null;
        let minDist = Infinity;

        for (const food of this.game.foodManager.foods) {
            // 跳过地雷
            if (food.type === 'mine') continue;
            
            const dist = position.manhattanDistance(food.position);
            if (dist < minDist) {
                minDist = dist;
                nearestFood = food;
            }
        }

        return nearestFood;
    }

    /**
     * 寻找最有价值的食物
     * @param {Position} position - 当前位置
     * @param {Snake} snake - 蛇实例
     * @returns {Food|null}
     */
    findBestFood(position, snake) {
        let bestFood = null;
        let bestScore = -Infinity;

        for (const food of this.game.foodManager.foods) {
            // 跳过地雷
            if (food.type === 'mine') continue;
            
            const dist = this.pathFinder.estimatePathLength(position, food.position, snake);
            if (dist === -1) continue; // 无法到达
            
            const danger = this.pathFinder.evaluateDanger(food.position, snake);
            
            // 综合评分：距离越近越好，危险度越低越好
            const score = -dist - danger * 2;
            
            if (score > bestScore) {
                bestScore = score;
                bestFood = food;
            }
        }

        return bestFood || this.findNearestFood(position);
    }

    /**
     * 获取所有安全的方向
     * @param {Snake} snake - 蛇实例
     * @returns {object[]} 安全的方向列表
     */
    getSafeDirections(snake) {
        const directions = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
        const safeDirections = [];

        const head = snake.getHead();

        for (const dir of directions) {
            // 不能掉头
            if ((dir === Direction.UP && snake.direction === Direction.DOWN) ||
                (dir === Direction.DOWN && snake.direction === Direction.UP) ||
                (dir === Direction.LEFT && snake.direction === Direction.RIGHT) ||
                (dir === Direction.RIGHT && snake.direction === Direction.LEFT)) {
                continue;
            }

            const nextPos = new Position(head.x + dir.x, head.y + dir.y);
            const danger = this.pathFinder.evaluateDanger(nextPos, snake);
            
            if (danger < 1000) { // 不是致命危险
                safeDirections.push(dir);
            }
        }

        return safeDirections;
    }
}

export default AIController;

