import GameConfig from '../config/GameConfig.js';
import NormalFood from '../entities/food/NormalFood.js';
import SpeedFood from '../entities/food/SpeedFood.js';
import SuperFood from '../entities/food/SuperFood.js';
import MineFood from '../entities/food/MineFood.js';
import MagnetFood from '../entities/food/MagnetFood.js';
import Position from '../models/Position.js';

/**
 * 食物工厂类（工厂模式）
 * 根据概率创建不同类型的食物
 */
class FoodFactory {
    constructor() {
        this.config = GameConfig.getInstance();
    }

    /**
     * 创建一个随机类型的食物
     * @param {Position} position - 食物位置
     * @returns {Food}
     */
    createFood(position) {
        const foodType = this.selectFoodType();
        return this.createFoodByType(foodType, position);
    }

    /**
     * 根据类型创建食物
     * @param {string} type - 食物类型
     * @param {Position} position - 食物位置
     * @returns {Food}
     */
    createFoodByType(type, position) {
        switch (type) {
            case 'normal':
                return new NormalFood(position);
            case 'speed':
                return new SpeedFood(position);
            case 'super':
                return new SuperFood(position);
            case 'mine':
                return new MineFood(position);
            case 'magnet':
                return new MagnetFood(position);
            default:
                return new NormalFood(position);
        }
    }

    /**
     * 根据概率选择食物类型
     * @returns {string} 食物类型
     */
    selectFoodType() {
        const probabilities = this.config.FOOD_PROBABILITIES;
        const rand = Math.random() * 100;
        
        let accumulatedProbability = 0;
        for (const [type, probability] of Object.entries(probabilities)) {
            accumulatedProbability += probability;
            if (rand < accumulatedProbability) {
                return type;
            }
        }
        
        // 默认返回普通豆子
        return 'normal';
    }

    /**
     * 批量创建食物
     * @param {number} count - 创建数量
     * @param {Function} isValidPosition - 验证位置是否有效的函数
     * @returns {Food[]}
     */
    createMultipleFood(count, isValidPosition) {
        const config = this.config;
        const foods = [];
        const maxAttempts = count * 10; // 最大尝试次数
        let attempts = 0;

        while (foods.length < count && attempts < maxAttempts) {
            attempts++;
            
            // 生成随机位置
            const x = Math.floor(Math.random() * config.GRID_SIZE);
            const y = Math.floor(Math.random() * config.GRID_SIZE);
            const position = new Position(x, y);

            // 验证位置
            if (isValidPosition(position)) {
                const food = this.createFood(position);
                foods.push(food);
            }
        }

        return foods;
    }
}

export default FoodFactory;

