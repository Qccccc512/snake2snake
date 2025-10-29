import Food from './Food.js';
import GameConfig from '../../config/GameConfig.js';
import { MagnetEffect } from '../SnakeEffect.js';

/**
 * 磁铁豆子
 * 吃掉后获得磁铁效果，20秒内可以吸取头部九宫格范围内的所有豆子
 */
class MagnetFood extends Food {
    constructor(position) {
        const config = GameConfig.getInstance();
        super(position, 'magnet', config.COLORS.magnet);
    }

    /**
     * 磁铁豆子被吃掉的处理
     * @param {Snake} snake - 吃掉食物的蛇
     * @param {Game} game - 游戏实例
     */
    onEaten(snake, game) {
        // 基础效果：蛇身长度+1
        snake.grow += 1;
        snake.foodEaten += 1;
        
        // 添加磁铁效果
        const config = GameConfig.getInstance();
        const magnetEffect = new MagnetEffect(
            config.MAGNET_EFFECT_DURATION,
            config.MAGNET_RANGE
        );
        snake.addEffect(magnetEffect);
        
        // 记录统计数据
        if (snake.user) {
            snake.user.stats.recordFoodEaten('magnet');
        }
    }

    /**
     * 渲染磁铁豆子（蓝色，U形磁铁）
     */
    render(ctx, cellSize) {
        const x = this.position.x * cellSize + cellSize / 2;
        const y = this.position.y * cellSize + cellSize / 2;
        const size = cellSize / 3;
        
        // 绘制U形磁铁
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, size, Math.PI * 0.8, Math.PI * 2.2);
        ctx.stroke();
        
        // 绘制两端
        ctx.fillStyle = this.color;
        ctx.fillRect(x - size - 2, y - 2, 4, size / 2);
        ctx.fillRect(x + size - 2, y - 2, 4, size / 2);
    }
}

export default MagnetFood;

