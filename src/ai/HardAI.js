import AIController from './AIController.js';
import GameConfig from '../config/GameConfig.js';
import Position from '../models/Position.js';
import { Direction } from '../constants/Directions.js';

/**
 * 困难AI
 * 智能预测，地图控制，考虑对手位置
 */
class HardAI extends AIController {
    constructor(game) {
        super(game, 'hard');
        this.config = GameConfig.getInstance();
        this.settings = this.config.AI_SETTINGS.hard;
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

        // 获取玩家蛇
        const playerSnake = this.getPlayerSnake(snake);
        
        // 计算分数差距，决定策略激进程度
        const aiScore = this.game.scoreManager.calculateScore(snake);
        const playerScore = playerSnake ? this.game.scoreManager.calculateScore(playerSnake) : 0;
        const isLeading = aiScore > playerScore;

        // 寻找最佳食物
        const targetFood = this.selectBestFood(head, snake, playerSnake, isLeading);
        if (!targetFood) {
            // 没有食物，采用战略移动
            return this.strategicMove(snake, playerSnake, isLeading);
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

            // 到目标的距离改善
            const currentDist = head.manhattanDistance(targetFood.position);
            const newDist = nextPos.manhattanDistance(targetFood.position);
            d.priority = (currentDist - newDist) * 10;

            // 危险度（领先时更保守）
            d.priority -= danger * (isLeading ? 4 : 2);

            // 战略价值
            const strategicValue = this.pathFinder.evaluateStrategicValue(nextPos);
            d.priority += strategicValue * 3;

            // 考虑前瞻（预测几步后的情况）
            const lookaheadScore = this.evaluateLookahead(nextPos, d.dir, snake, 2);
            d.priority += lookaheadScore;
        }

        // 选择优先级最高的方向
        const bestDirection = directions.reduce((best, current) => 
            current.priority > best.priority ? current : best);
        
        return bestDirection.priority > -500 ? bestDirection.dir : null;
    }

    /**
     * 选择最佳食物
     * @param {Position} position - 当前位置
     * @param {Snake} snake - AI蛇
     * @param {Snake} playerSnake - 玩家蛇
     * @param {boolean} isLeading - 是否领先
     * @returns {Food|null}
     */
    selectBestFood(position, snake, playerSnake, isLeading) {
        let bestFood = null;
        let bestScore = -Infinity;

        const centerX = this.config.GRID_SIZE / 2;
        const centerY = this.config.GRID_SIZE / 2;

        for (const food of this.game.foodManager.foods) {
            // 跳过地雷
            if (food.type === 'mine') continue;
            
            const pathLength = this.pathFinder.estimatePathLength(position, food.position, snake);
            if (pathLength === -1) continue;
            
            // 竞争考虑：如果玩家更近，降低优先级
            let competitionPenalty = 0;
            if (playerSnake && playerSnake.isAlive) {
                const playerDist = playerSnake.getHead().manhattanDistance(food.position);
                if (playerDist < pathLength) {
                    competitionPenalty = 5;
                }
            }
            
            // 安全性
            const dangerPenalty = this.pathFinder.evaluateDanger(food.position, snake) * (isLeading ? 3 : 2);
            
            // 地图中心偏好
            const distToCenter = Math.hypot(food.position.x - centerX, food.position.y - centerY);
            const centerBonus = (this.config.GRID_SIZE / 2 - distToCenter) * 0.4;
            
            const score = -pathLength - competitionPenalty - dangerPenalty + centerBonus;
            if (score > bestScore) {
                bestScore = score;
                bestFood = food;
            }
        }

        return bestFood || this.findNearestFood(position);
    }

    /**
     * 战略移动（没有食物时）
     * @param {Snake} snake - AI蛇
     * @param {Snake} playerSnake - 玩家蛇
     * @param {boolean} isLeading - 是否领先
     * @returns {object|null}
     */
    strategicMove(snake, playerSnake, isLeading) {
        const head = snake.getHead();
        const centerX = Math.floor(this.config.GRID_SIZE / 2);
        const centerY = Math.floor(this.config.GRID_SIZE / 2);
        const centerPos = new Position(centerX, centerY);

        // 领先时保持中心控制
        if (isLeading) {
            return this.pathFinder.findBestDirection(head, centerPos, snake, true);
        }
        
        // 落后时寻找开放空间
        return this.findOpenSpace(snake);
    }

    /**
     * 寻找开放空间
     * @param {Snake} snake - 蛇实例
     * @returns {object|null}
     */
    findOpenSpace(snake) {
        const safeDirections = this.getSafeDirections(snake);
        if (safeDirections.length === 0) return null;

        let bestDir = null;
        let bestOpenness = -1;

        const head = snake.getHead();
        for (const dir of safeDirections) {
            const nextPos = new Position(head.x + dir.x, head.y + dir.y);
            const openness = this.evaluateOpenness(nextPos, snake);
            
            if (openness > bestOpenness) {
                bestOpenness = openness;
                bestDir = dir;
            }
        }

        return bestDir;
    }

    /**
     * 评估位置的开放度
     * @param {Position} position - 位置
     * @param {Snake} snake - 蛇实例
     * @returns {number}
     */
    evaluateOpenness(position, snake) {
        let openness = 0;
        const checkRange = 3;

        for (let dx = -checkRange; dx <= checkRange; dx++) {
            for (let dy = -checkRange; dy <= checkRange; dy++) {
                const checkPos = new Position(position.x + dx, position.y + dy);
                const danger = this.pathFinder.evaluateDanger(checkPos, snake);
                if (danger < 1000) {
                    openness++;
                }
            }
        }

        return openness;
    }

    /**
     * 前瞻评估
     * @param {Position} position - 当前位置
     * @param {object} direction - 方向
     * @param {Snake} snake - 蛇实例
     * @param {number} depth - 前瞻深度
     * @returns {number}
     */
    evaluateLookahead(position, direction, snake, depth) {
        if (depth === 0) return 0;

        const nextPos = new Position(position.x + direction.x, position.y + direction.y);
        const danger = this.pathFinder.evaluateDanger(nextPos, snake);
        
        if (danger >= 1000) return -50;
        
        // 递归评估下一步
        const strategicValue = this.pathFinder.evaluateStrategicValue(nextPos);
        return strategicValue + this.evaluateLookahead(nextPos, direction, snake, depth - 1) * 0.5;
    }

    /**
     * 获取玩家蛇
     * @param {Snake} aiSnake - AI蛇
     * @returns {Snake|null}
     */
    getPlayerSnake(aiSnake) {
        return this.game.snakes.find(s => s !== aiSnake) || null;
    }
}

export default HardAI;

