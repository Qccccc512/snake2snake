import Position from '../models/Position.js';
import GameConfig from '../config/GameConfig.js';
import { Direction } from '../constants/Directions.js';

/**
 * 蛇类
 * 代表游戏中的一条蛇
 */
class Snake {
    /**
     * @param {number} startX - 起始X坐标
     * @param {number} startY - 起始Y坐标
     * @param {object} direction - 初始方向
     * @param {object} color - 颜色配置 {head, body}
     * @param {User} user - 关联的用户（可选）
     */
    constructor(startX, startY, direction, color, user = null) {
        const config = GameConfig.getInstance();
        
        // 初始化蛇身
        this.body = [];
        this.bodySet = new Set(); // 用于快速碰撞检测
        
        for (let i = 0; i < config.INITIAL_LENGTH; i++) {
            const segment = new Position(
                startX - direction.x * i,
                startY - direction.y * i
            );
            this.body.push(segment);
            this.bodySet.add(segment.toString());
        }

        // 方向控制
        this.direction = direction;
        this.nextDirection = direction;

        // 视觉属性
        this.color = color;

        // 游戏状态
        this.isAlive = true;
        this.foodEaten = 0; // 累积吃豆数（不会因死亡重置）
        this.grow = 0; // 待增长节数
        
        // 重生相关
        this.respawnTimer = 0;
        this.respawnPosition = null;
        this.moveAccumulator = 0; // 累积的移动时间间隔

        // 效果系统
        this.effects = []; // 当前激活的效果列表
        this.speedMultiplier = 1; // 速度倍数
        this.hasMagnetEffect = false; // 是否拥有磁铁效果

        // 关联的用户
        this.user = user;
    }

    /**
     * 移动蛇
     */
    move() {
        if (!this.isAlive) return;

        // 更新方向
        this.direction = this.nextDirection;

        // 计算新头部位置
        const head = this.body[0];
        const newHead = new Position(
            head.x + this.direction.x,
            head.y + this.direction.y
        );

        // 添加新头部
        this.body.unshift(newHead);
        this.bodySet.add(newHead.toString());

        // 记录移动距离
        if (this.user) {
            this.user.stats.recordMove();
        }

        // 处理生长
        if (this.grow > 0) {
            this.grow--;
        } else {
            // 移除尾部
            const tail = this.body.pop();
            this.bodySet.delete(tail.toString());
        }

        // 更新最大长度统计
        if (this.user) {
            this.user.stats.updateMaxLength(this.body.length);
        }
    }

    /**
     * 改变方向（不能掉头）
     * @param {object} newDirection - 新方向
     */
    changeDirection(newDirection) {
        // 防止掉头
        if (this.direction === Direction.UP && newDirection === Direction.DOWN) return;
        if (this.direction === Direction.DOWN && newDirection === Direction.UP) return;
        if (this.direction === Direction.LEFT && newDirection === Direction.RIGHT) return;
        if (this.direction === Direction.RIGHT && newDirection === Direction.LEFT) return;

        this.nextDirection = newDirection;
    }

    /**
     * 蛇死亡
     * @param {string} deathType - 死亡类型：'wall', 'self', 'headToHead', 'mine', 'other'
     */
    die(deathType) {
        if (!this.isAlive) return;

        this.isAlive = false;
        this.respawnTimer = GameConfig.getInstance().RESPAWN_DELAY;
        this.respawnPosition = this.body[0] ? this.body[0].clone() : new Position(0, 0);
        this.moveAccumulator = 0;

        // 记录死亡统计
        if (this.user) {
            this.user.stats.recordDeath(deathType);
        }

        // 清除所有效果
        this.removeAllEffects();
    }

    /**
     * 重生蛇
     * @param {number} x - 重生X坐标
     * @param {number} y - 重生Y坐标
     * @param {object} direction - 重生方向
     */
    respawn(x, y, direction) {
        const config = GameConfig.getInstance();

        // 重新生成身体
        this.body = [];
        this.bodySet.clear();
        
        for (let i = 0; i < config.INITIAL_LENGTH; i++) {
            const segment = new Position(
                x - direction.x * i,
                y - direction.y * i
            );
            this.body.push(segment);
            this.bodySet.add(segment.toString());
        }

        // 重置状态
        this.direction = direction;
        this.nextDirection = direction;
        this.isAlive = true;
        this.grow = 0;
        this.respawnTimer = 0;
        this.speedMultiplier = 1;
        this.hasMagnetEffect = false;
        this.moveAccumulator = 0;
        
        // foodEaten不重置，这是累积数据
    }

    /**
     * 添加效果
     * @param {SnakeEffect} effect - 要添加的效果
     */
    addEffect(effect) {
        // 如果已有同类型效果，先移除
        const existingIndex = this.effects.findIndex(e => e.type === effect.type);
        if (existingIndex !== -1) {
            this.effects[existingIndex].remove(this);
            this.effects.splice(existingIndex, 1);
        }

        // 添加新效果
        this.effects.push(effect);
        effect.apply(this);
    }

    /**
     * 移除效果
     * @param {SnakeEffect} effect - 要移除的效果
     */
    removeEffect(effect) {
        const index = this.effects.indexOf(effect);
        if (index !== -1) {
            effect.remove(this);
            this.effects.splice(index, 1);
        }
    }

    /**
     * 移除所有效果
     */
    removeAllEffects() {
        for (const effect of this.effects) {
            effect.remove(this);
        }
        this.effects = [];
    }

    /**
     * 检查是否拥有某种效果
     * @param {string} effectType - 效果类型
     * @returns {boolean}
     */
    hasEffect(effectType) {
        return this.effects.some(e => e.type === effectType);
    }

    /**
     * 更新效果（每帧调用）
     * @param {Game} game - 游戏实例
     */
    updateEffects(game) {
        // 更新所有效果
        for (const effect of this.effects) {
            effect.update(this, game);
        }

        // 移除过期的效果
        const expiredEffects = this.effects.filter(e => e.isExpired());
        for (const effect of expiredEffects) {
            this.removeEffect(effect);
        }
    }

    /**
     * 获取头部位置
     * @returns {Position}
     */
    getHead() {
        return this.body[0];
    }

    /**
     * 检查位置是否在蛇身上
     * @param {Position} position - 要检查的位置
     * @returns {boolean}
     */
    occupies(position) {
        return this.bodySet.has(position.toString());
    }

    /**
     * 获取移动速度（考虑加速效果）
     * @returns {number} 移动间隔（毫秒）
     */
    getSpeed() {
        const config = GameConfig.getInstance();
        return config.SNAKE_SPEED / this.speedMultiplier;
    }

    /**
     * 计算掉落的食物数量
     * @returns {number}
     */
    getDropFoodCount() {
        const config = GameConfig.getInstance();
        return Math.floor(this.body.length / config.FOOD_DROP_RATE);
    }
}

export { Snake, Direction };
export default Snake;

