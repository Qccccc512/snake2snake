import Food from './Food.js';
import GameConfig from '../../config/GameConfig.js';
import { SpeedEffect } from '../SnakeEffect.js';

/**
 * 加速豆子
 * 吃掉后蛇身长度+1，并获得速度翻倍效果
 */
class SpeedFood extends Food {
    constructor(position) {
        const config = GameConfig.getInstance();
        super(position, 'speed', config.COLORS.speed);
    }

    /**
     * 加速豆子被吃掉的处理
     * @param {Snake} snake - 吃掉食物的蛇
     * @param {Game} game - 游戏实例
     */
    onEaten(snake, game) {
        // 基础效果：蛇身长度+1
        snake.grow += 1;
        snake.foodEaten += 1;
        
        // 添加加速效果
        const config = GameConfig.getInstance();
        const speedEffect = new SpeedEffect(config.SPEED_EFFECT_DURATION);
        snake.addEffect(speedEffect);
        
        // 记录统计数据
        if (snake.user) {
            snake.user.stats.recordFoodEaten('speed');
        }
    }

    /**
     * 渲染加速豆子（橙色，带光晕效果）
     */
    render(ctx, cellSize) {
        const x = this.position.x * cellSize + cellSize / 2;
        const y = this.position.y * cellSize + cellSize / 2;
        const radius = cellSize / 2 - 2;
        
        // 绘制光晕
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius + 3);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(255, 152, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制主体
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

export default SpeedFood;

