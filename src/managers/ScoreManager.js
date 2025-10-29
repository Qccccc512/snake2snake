import GameConfig from '../config/GameConfig.js';

/**
 * 分数管理器
 * 负责计算和更新玩家分数
 */
class ScoreManager {
    constructor() {
        this.config = GameConfig.getInstance();
    }

    /**
     * 计算蛇的分数
     * 公式：累积吃豆数×50 + 蛇身长度×100
     * @param {Snake} snake - 蛇实例
     * @returns {number} 分数
     */
    calculateScore(snake) {
        if (!snake || !snake.body) return 0;
        
        const foodScore = snake.foodEaten * this.config.SCORE_PER_FOOD;
        const lengthScore = snake.body.length * this.config.SCORE_PER_LENGTH;
        
        return foodScore + lengthScore;
    }

    /**
     * 获取所有蛇的分数
     * @param {Snake[]} snakes - 蛇的数组
     * @returns {number[]} 分数数组
     */
    getAllScores(snakes) {
        return snakes.map(snake => this.calculateScore(snake));
    }

    /**
     * 确定获胜者
     * @param {Snake[]} snakes - 蛇的数组
     * @returns {number} 获胜者的索引，-1表示平局
     */
    determineWinner(snakes) {
        const scores = this.getAllScores(snakes);
        
        if (scores.length === 0) return -1;
        if (scores.length === 1) return 0;

        const maxScore = Math.max(...scores);
        const winners = scores.filter(score => score === maxScore);
        
        // 如果有多个相同的最高分，则平局
        if (winners.length > 1) return -1;
        
        return scores.indexOf(maxScore);
    }

    /**
     * 格式化分数显示
     * @param {number} score - 分数
     * @returns {string} 格式化后的分数字符串
     */
    formatScore(score) {
        return score.toString().padStart(4, '0');
    }
}

export default ScoreManager;

