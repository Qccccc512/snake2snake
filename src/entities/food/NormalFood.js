import Food from './Food.js';
import GameConfig from '../../config/GameConfig.js';

/**
 * 普通豆子
 * 吃掉后蛇身长度+1，累积吃豆数+1
 */
class NormalFood extends Food {
    constructor(position) {
        const config = GameConfig.getInstance();
        super(position, 'normal', config.COLORS.normal);
    }

    /**
     * 普通豆子被吃掉的处理
     * @param {Snake} snake - 吃掉食物的蛇
     * @param {Game} game - 游戏实例
     */
    onEaten(snake, game) {
        // 蛇身长度+1（通过grow计数器实现）
        snake.grow += 1;
        
        // 累积吃豆数+1
        snake.foodEaten += 1;
        
        // 记录统计数据
        if (snake.user) {
            snake.user.stats.recordFoodEaten('normal');
        }
    }
}

export default NormalFood;

