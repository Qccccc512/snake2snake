import GameConfig from '../config/GameConfig.js';
import FoodFactory from './FoodFactory.js';

/**
 * 食物生成管理器
 * 负责定时刷新食物、检查数量上限、避免与蛇身重叠
 */
class FoodSpawner {
    constructor(game) {
        this.game = game;
        this.config = GameConfig.getInstance();
        this.foodFactory = new FoodFactory();
        this.foods = []; // 当前场上的所有食物
        this.spawnTimer = null;
    }

    /**
     * 开始自动生成食物
     */
    startSpawning() {
        if (this.spawnTimer) {
            clearInterval(this.spawnTimer);
        }

        // 定时生成食物
        this.spawnTimer = setInterval(() => {
            if (this.game.isPaused()) return;
            this.spawnFood(this.config.FOOD_SPAWN_COUNT);
        }, this.config.FOOD_SPAWN_INTERVAL);

        // 初始生成一些食物
        this.spawnFood(5);
    }

    /**
     * 停止自动生成食物
     */
    stopSpawning() {
        if (this.spawnTimer) {
            clearInterval(this.spawnTimer);
            this.spawnTimer = null;
        }
    }

    /**
     * 生成指定数量的食物
     * @param {number} count - 要生成的食物数量
     */
    spawnFood(count) {
        // 检查是否达到上限
        const availableSlots = this.config.MAX_FOOD - this.foods.length;
        const actualCount = Math.min(count, availableSlots);

        if (actualCount <= 0) return;

        // 批量创建食物
        const newFoods = this.foodFactory.createMultipleFood(
            actualCount,
            (position) => this.isValidPosition(position)
        );

        this.foods.push(...newFoods);
    }

    /**
     * 在指定位置生成食物
     * @param {Position} position - 位置
     * @param {string} type - 食物类型（可选）
     */
    spawnFoodAt(position, type = null) {
        if (this.foods.length >= this.config.MAX_FOOD) return;
        if (!this.isValidPosition(position)) return;

        const food = type 
            ? this.foodFactory.createFoodByType(type, position)
            : this.foodFactory.createFood(position);
        
        this.foods.push(food);
    }

    /**
     * 蛇死亡时掉落食物
     * @param {Snake} snake - 死亡的蛇
     */
    dropFoodFromSnake(snake) {
        const dropCount = snake.getDropFoodCount();
        this.spawnFood(dropCount);
    }

    /**
     * 移除指定食物
     * @param {Food} food - 要移除的食物
     */
    removeFood(food) {
        const index = this.foods.indexOf(food);
        if (index !== -1) {
            this.foods.splice(index, 1);
        }
    }

    /**
     * 检查位置是否有效（不与蛇身重叠，不与其他食物重叠）
     * @param {Position} position - 要检查的位置
     * @returns {boolean}
     */
    isValidPosition(position) {
        // 检查是否与蛇身重叠
        for (const snake of this.game.snakes) {
            if (snake.isAlive && snake.occupies(position)) {
                return false;
            }
        }

        // 检查是否与已有食物重叠
        for (const food of this.foods) {
            if (food.position.equals(position)) {
                return false;
            }
        }

        // 检查是否在地图边界内
        if (position.x < 0 || position.x >= this.config.GRID_SIZE ||
            position.y < 0 || position.y >= this.config.GRID_SIZE) {
            return false;
        }

        return true;
    }

    /**
     * 清空所有食物
     */
    clear() {
        this.foods = [];
    }

    /**
     * 获取当前食物列表
     * @returns {Food[]}
     */
    getFoods() {
        return this.foods;
    }

    /**
     * 获取当前食物数量
     * @returns {number}
     */
    getFoodCount() {
        return this.foods.length;
    }
}

export default FoodSpawner;

