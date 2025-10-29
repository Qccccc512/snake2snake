import Food from './Food.js';
import GameConfig from '../../config/GameConfig.js';

/**
 * 地雷
 * 触碰后立即死亡
 */
class MineFood extends Food {
    constructor(position) {
        const config = GameConfig.getInstance();
        super(position, 'mine', config.COLORS.mine);
    }

    /**
     * 地雷被触碰的处理
     * @param {Snake} snake - 触碰地雷的蛇
     * @param {Game} game - 游戏实例
     */
    onEaten(snake, game) {
        // 记录触碰地雷
        if (snake.user) {
            snake.user.stats.recordMineHit();
        }
        
        // 通过RespawnManager处理死亡（确保能正常重生）
        game.respawnManager.handleDeath(snake, 'mine');
    }

    /**
     * 渲染地雷（红色，十字形）
     */
    render(ctx, cellSize) {
        const x = this.position.x * cellSize + cellSize / 2;
        const y = this.position.y * cellSize + cellSize / 2;
        const size = cellSize / 2 - 2;
        
        // 绘制X形地雷标志
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - size, y - size);
        ctx.lineTo(x + size, y + size);
        ctx.moveTo(x + size, y - size);
        ctx.lineTo(x - size, y + size);
        ctx.stroke();
        
        // 绘制圆形外框
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.stroke();
    }
}

export default MineFood;

