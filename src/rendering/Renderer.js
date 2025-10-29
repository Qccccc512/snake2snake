import GameConfig from '../config/GameConfig.js';
import { Direction } from '../constants/Directions.js';

/**
 * 渲染器类
 * 负责游戏画面的渲染
 */
class Renderer {
    constructor(canvas) {
        if (!canvas) {
            throw new Error('Canvas element is required');
        }
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = GameConfig.getInstance();
        
        // 初始化Canvas
        this.initCanvas();
    }

    /**
     * 初始化Canvas
     */
    initCanvas() {
        // 设置Canvas尺寸
        this.canvas.width = this.config.GAME_WIDTH;
        this.canvas.height = this.config.GAME_HEIGHT;
        this.ctx.imageSmoothingEnabled = false;
    }

    /**
     * 渲染游戏画面
     * @param {Game} game - 游戏实例
     */
    render(game) {
        // 清空画布
        this.clear();
        
        // 绘制网格
        this.renderGrid();
        
        // 绘制食物
        this.renderFood(game.foodManager.foods);
        
        // 绘制蛇
        this.renderSnakes(game.snakes);
        
        // 绘制特效
        this.renderEffects(game.snakes);
    }

    /**
     * 清空画布
     */
    clear() {
        this.ctx.fillStyle = this.config.COLORS.bg;
        this.ctx.fillRect(0, 0, this.config.GAME_WIDTH, this.config.GAME_HEIGHT);
    }

    /**
     * 渲染网格
     */
    renderGrid() {
        this.ctx.strokeStyle = this.config.COLORS.grid;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        
        // 垂直线
        for (let x = 0; x <= this.config.GRID_SIZE; x++) {
            this.ctx.moveTo(x * this.config.CELL_SIZE, 0);
            this.ctx.lineTo(x * this.config.CELL_SIZE, this.config.GAME_HEIGHT);
        }
        
        // 水平线
        for (let y = 0; y <= this.config.GRID_SIZE; y++) {
            this.ctx.moveTo(0, y * this.config.CELL_SIZE);
            this.ctx.lineTo(this.config.GAME_WIDTH, y * this.config.CELL_SIZE);
        }
        
        this.ctx.stroke();
    }

    /**
     * 渲染食物
     * @param {Food[]} foods - 食物列表
     */
    renderFood(foods) {
        for (const food of foods) {
            food.render(this.ctx, this.config.CELL_SIZE);
        }
    }

    /**
     * 渲染蛇
     * @param {Snake[]} snakes - 蛇列表
     */
    renderSnakes(snakes) {
        for (const snake of snakes) {
            if (!snake.isAlive || !snake.body || snake.body.length === 0) continue;
            
            // 绘制身体
            for (let i = 0; i < snake.body.length; i++) {
                const segment = snake.body[i];
                const isHead = i === 0;
                this.ctx.fillStyle = isHead ? snake.color.head : snake.color.body;
                this.ctx.fillRect(
                    segment.x * this.config.CELL_SIZE + 1,
                    segment.y * this.config.CELL_SIZE + 1,
                    this.config.CELL_SIZE - 2,
                    this.config.CELL_SIZE - 2
                );
            }
            
            // 绘制眼睛
            const head = snake.getHead();
            if (head) {
                this.renderEyes(head, snake.direction, snake.color.head);
            }
        }
    }

    /**
     * 渲染蛇的眼睛
     */
    renderEyes(head, direction, color) {
        const eyeSize = this.config.CELL_SIZE / 6;
        const offset = this.config.CELL_SIZE / 4;
        let eyes = [];

        if (direction === Direction.UP) {
            eyes = [{x: -offset, y: -offset}, {x: offset, y: -offset}];
        } else if (direction === Direction.DOWN) {
            eyes = [{x: -offset, y: offset}, {x: offset, y: offset}];
        } else if (direction === Direction.LEFT) {
            eyes = [{x: -offset, y: -offset}, {x: -offset, y: offset}];
        } else if (direction === Direction.RIGHT) {
            eyes = [{x: offset, y: -offset}, {x: offset, y: offset}];
        }

        this.ctx.fillStyle = '#fff';
        for (const eye of eyes) {
            this.ctx.beginPath();
            this.ctx.arc(
                head.x * this.config.CELL_SIZE + this.config.CELL_SIZE / 2 + eye.x,
                head.y * this.config.CELL_SIZE + this.config.CELL_SIZE / 2 + eye.y,
                eyeSize,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        }
    }

    /**
     * 渲染特效
     * @param {Snake[]} snakes - 蛇列表
     */
    renderEffects(snakes) {
        for (const snake of snakes) {
            if (!snake.isAlive || !snake.body || snake.body.length === 0) continue;
            
            const head = snake.getHead();
            if (!head) continue;
            
            // 加速效果光环
            if (snake.hasEffect('speed')) {
                this.ctx.strokeStyle = 'rgba(255, 152, 0, 0.6)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(
                    head.x * this.config.CELL_SIZE + this.config.CELL_SIZE / 2,
                    head.y * this.config.CELL_SIZE + this.config.CELL_SIZE / 2,
                    this.config.CELL_SIZE * 0.8,
                    0,
                    Math.PI * 2
                );
                this.ctx.stroke();
            }
            
            // 磁铁效果范围提示
            if (snake.hasMagnetEffect) {
                this.ctx.strokeStyle = 'rgba(33, 150, 243, 0.4)';
                this.ctx.lineWidth = 1;
                const range = this.config.MAGNET_RANGE;
                this.ctx.strokeRect(
                    (head.x - range) * this.config.CELL_SIZE,
                    (head.y - range) * this.config.CELL_SIZE,
                    (2 * range + 1) * this.config.CELL_SIZE,
                    (2 * range + 1) * this.config.CELL_SIZE
                );
            }
        }
    }

    /**
     * 调整Canvas大小
     */
    adjustSize() {
        // 简化Canvas调整，确保Canvas可见
        this.canvas.style.width = '512px';
        this.canvas.style.height = '512px';
        this.canvas.style.display = 'block';
    }
}

export default Renderer;

