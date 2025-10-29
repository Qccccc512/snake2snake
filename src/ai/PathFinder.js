import Position from '../models/Position.js';
import GameConfig from '../config/GameConfig.js';
import { Direction } from '../constants/Directions.js';

/**
 * 路径查找工具类
 * 提供寻路和危险度评估功能
 */
class PathFinder {
    constructor(game) {
        this.game = game;
        this.config = GameConfig.getInstance();
    }

    /**
     * 计算从起点到终点的曼哈顿距离
     * @param {Position} start - 起点
     * @param {Position} end - 终点
     * @returns {number}
     */
    manhattanDistance(start, end) {
        return Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
    }

    /**
     * 评估位置的危险度
     * @param {Position} position - 要评估的位置
     * @param {Snake} snake - 蛇实例
     * @returns {number} 危险度分数（越高越危险）
     */
    evaluateDanger(position, snake) {
        let danger = 0;

        // 检查是否超出边界
        if (position.x < 0 || position.x >= this.config.GRID_SIZE ||
            position.y < 0 || position.y >= this.config.GRID_SIZE) {
            return 1000; // 极高危险
        }

        // 检查是否撞到蛇身
        for (const s of this.game.snakes) {
            if (s.isAlive && s.occupies(position)) {
                return 1000; // 极高危险
            }
        }

        // 检查周围障碍物数量
        const neighbors = position.getNeighbors();
        for (const neighbor of neighbors) {
            if (neighbor.x < 0 || neighbor.x >= this.config.GRID_SIZE ||
                neighbor.y < 0 || neighbor.y >= this.config.GRID_SIZE) {
                danger += 2; // 靠近边界
            }
            
            for (const s of this.game.snakes) {
                if (s.isAlive && s.occupies(neighbor)) {
                    danger += 1; // 靠近蛇身
                }
            }
        }

        // 靠近边界增加危险度
        if (position.x <= 1 || position.x >= this.config.GRID_SIZE - 2) danger += 1;
        if (position.y <= 1 || position.y >= this.config.GRID_SIZE - 2) danger += 1;

        return danger;
    }

    /**
     * 评估位置的战略价值
     * @param {Position} position - 要评估的位置
     * @returns {number} 战略价值分数（越高越好）
     */
    evaluateStrategicValue(position) {
        const centerX = this.config.GRID_SIZE / 2;
        const centerY = this.config.GRID_SIZE / 2;
        
        // 距离中心的距离
        const distToCenter = Math.hypot(position.x - centerX, position.y - centerY);
        
        // 中心控制价值：越靠近中心价值越高
        const centerValue = (this.config.GRID_SIZE / 2 - distToCenter) / (this.config.GRID_SIZE / 2);
        
        // 边角惩罚
        const edgePenalty = Math.min(
            Math.min(position.x, this.config.GRID_SIZE - 1 - position.x),
            Math.min(position.y, this.config.GRID_SIZE - 1 - position.y)
        ) / (this.config.GRID_SIZE / 2);
        
        return centerValue * 0.6 + edgePenalty * 0.4;
    }

    /**
     * 寻找从起点到终点的最佳方向
     * @param {Position} start - 起点
     * @param {Position} end - 终点
     * @param {Snake} snake - 蛇实例
     * @param {boolean} avoidDanger - 是否避免危险
     * @returns {object|null} 最佳方向
     */
    findBestDirection(start, end, snake, avoidDanger = true) {
        const directions = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
        
        let bestDir = null;
        let bestScore = -Infinity;

        for (const dir of directions) {
            // 不能掉头
            if ((dir === Direction.UP && snake.direction === Direction.DOWN) ||
                (dir === Direction.DOWN && snake.direction === Direction.UP) ||
                (dir === Direction.LEFT && snake.direction === Direction.RIGHT) ||
                (dir === Direction.RIGHT && snake.direction === Direction.LEFT)) {
                continue;
            }

            const nextPos = new Position(start.x + dir.x, start.y + dir.y);
            
            // 检查基本碰撞
            let score = 0;
            const danger = this.evaluateDanger(nextPos, snake);
            
            if (danger >= 1000) {
                continue; // 跳过致命位置
            }

            // 计算距离改善
            const currentDist = this.manhattanDistance(start, end);
            const newDist = this.manhattanDistance(nextPos, end);
            score += (currentDist - newDist) * 10; // 距离减少越多分数越高

            // 考虑危险度
            if (avoidDanger) {
                score -= danger * 5;
            }

            if (score > bestScore) {
                bestScore = score;
                bestDir = dir;
            }
        }

        return bestDir;
    }

    /**
     * 估算路径长度（简化版）
     * @param {Position} start - 起点
     * @param {Position} end - 终点
     * @param {Snake} snake - 蛇实例
     * @returns {number} 估算的路径长度，-1表示无法到达
     */
    estimatePathLength(start, end, snake) {
        if (start.equals(end)) return 0;
        
        const manhattanDist = this.manhattanDistance(start, end);
        
        // 如果距离太远，直接返回估计值
        if (manhattanDist > this.config.GRID_SIZE) {
            return manhattanDist + 5;
        }

        // 简单检查直线路径
        const dx = Math.sign(end.x - start.x);
        const dy = Math.sign(end.y - start.y);
        
        let current = start.clone();
        let steps = 0;
        const maxSteps = manhattanDist + 10;

        while (!current.equals(end) && steps < maxSteps) {
            steps++;
            
            // 优先移动距离更远的轴
            if (Math.abs(end.x - current.x) > Math.abs(end.y - current.y)) {
                if (dx !== 0) current.x += dx;
                else if (dy !== 0) current.y += dy;
            } else {
                if (dy !== 0) current.y += dy;
                else if (dx !== 0) current.x += dx;
            }

            // 检查碰撞
            const danger = this.evaluateDanger(current, snake);
            if (danger >= 1000) {
                return manhattanDist + 3; // 路径被阻挡
            }
        }

        return steps;
    }
}

export default PathFinder;

