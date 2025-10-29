import Food from './Food.js';
import GameConfig from '../../config/GameConfig.js';

/**
 * 超级豆子
 * 吃掉后累积吃豆数+5，但蛇身长度只+1
 */
class SuperFood extends Food {
    constructor(position) {
        const config = GameConfig.getInstance();
        super(position, 'super', config.COLORS.super);
    }

    /**
     * 超级豆子被吃掉的处理
     * @param {Snake} snake - 吃掉食物的蛇
     * @param {Game} game - 游戏实例
     */
    onEaten(snake, game) {
        // 蛇身长度只+1
        snake.grow += 1;
        
        // 累积吃豆数+5（特殊效果）
        snake.foodEaten += 5;
        
        // 记录统计数据
        if (snake.user) {
            snake.user.stats.recordFoodEaten('super');
        }
    }

    /**
     * 渲染超级豆子（紫色，星形）
     */
    render(ctx, cellSize) {
        const x = this.position.x * cellSize + cellSize / 2;
        const y = this.position.y * cellSize + cellSize / 2;
        const radius = cellSize / 2 - 2;
        
        // 绘制星形
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            const x1 = x + Math.cos(angle) * radius;
            const y1 = y + Math.sin(angle) * radius;
            if (i === 0) {
                ctx.moveTo(x1, y1);
            } else {
                ctx.lineTo(x1, y1);
            }
            const angle2 = angle + Math.PI / 5;
            const x2 = x + Math.cos(angle2) * (radius * 0.5);
            const y2 = y + Math.sin(angle2) * (radius * 0.5);
            ctx.lineTo(x2, y2);
        }
        ctx.closePath();
        ctx.fill();
    }
}

export default SuperFood;

