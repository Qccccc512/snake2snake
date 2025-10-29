import Position from '../../models/Position.js';

/**
 * 食物抽象基类
 * 定义所有食物的通用行为
 */
class Food {
    /**
     * @param {Position} position - 食物位置
     * @param {string} type - 食物类型
     * @param {string} color - 食物颜色
     */
    constructor(position, type, color) {
        this.position = position;
        this.type = type;
        this.color = color;
    }

    /**
     * 当食物被吃掉时的处理（抽象方法，子类必须实现）
     * @param {Snake} snake - 吃掉食物的蛇
     * @param {Game} game - 游戏实例
     * @abstract
     */
    onEaten(snake, game) {
        throw new Error('onEaten() must be implemented by subclass');
    }

    /**
     * 渲染食物（可以被子类覆盖以实现不同的视觉效果）
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {number} cellSize - 单元格大小
     */
    render(ctx, cellSize) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(
            this.position.x * cellSize + cellSize / 2,
            this.position.y * cellSize + cellSize / 2,
            cellSize / 2 - 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

export default Food;

