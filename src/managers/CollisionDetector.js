import GameConfig from '../config/GameConfig.js';

/**
 * 碰撞检测器（单例模式）
 * 负责检测各种碰撞情况
 */
class CollisionDetector {
    static instance = null;

    constructor() {
        if (CollisionDetector.instance) {
            return CollisionDetector.instance;
        }
        this.config = GameConfig.getInstance();
        CollisionDetector.instance = this;
    }

    static getInstance() {
        if (!CollisionDetector.instance) {
            CollisionDetector.instance = new CollisionDetector();
        }
        return CollisionDetector.instance;
    }

    /**
     * 检查蛇是否撞墙
     * @param {Snake} snake - 要检查的蛇
     * @returns {boolean}
     */
    checkWallCollision(snake) {
        if (!snake.isAlive || !snake.body || snake.body.length === 0) return false;
        
        const head = snake.getHead();
        return head.x < 0 || head.x >= this.config.GRID_SIZE ||
               head.y < 0 || head.y >= this.config.GRID_SIZE;
    }

    /**
     * 检查蛇是否撞自己
     * @param {Snake} snake - 要检查的蛇
     * @returns {boolean}
     */
    checkSelfCollision(snake) {
        if (!snake.isAlive || !snake.body || snake.body.length < 2) return false;
        
        const head = snake.getHead();
        // 检查头部是否与身体其他部分重叠（跳过头部自己）
        for (let i = 1; i < snake.body.length; i++) {
            if (head.equals(snake.body[i])) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检查蛇是否撞到另一条蛇的身体
     * @param {Snake} snake - 要检查的蛇
     * @param {Snake} otherSnake - 另一条蛇
     * @returns {boolean}
     */
    checkSnakeBodyCollision(snake, otherSnake) {
        if (!snake.isAlive || !otherSnake.isAlive) return false;
        if (!snake.body || snake.body.length === 0) return false;
        
        const head = snake.getHead();
        return otherSnake.occupies(head);
    }

    /**
     * 检查两条蛇是否头对头碰撞
     * @param {Snake} snake1 - 蛇1
     * @param {Snake} snake2 - 蛇2
     * @returns {boolean}
     */
    checkHeadToHeadCollision(snake1, snake2) {
        if (!snake1.isAlive || !snake2.isAlive) return false;
        if (!snake1.body || !snake2.body || 
            snake1.body.length === 0 || snake2.body.length === 0) return false;
        
        const head1 = snake1.getHead();
        const head2 = snake2.getHead();
        return head1.equals(head2);
    }

    /**
     * 检查蛇是否吃到食物
     * @param {Snake} snake - 蛇
     * @param {Food[]} foods - 食物列表
     * @returns {Food|null} 被吃掉的食物，如果没有则返回null
     */
    checkFoodCollision(snake, foods) {
        if (!snake.isAlive || !snake.body || snake.body.length === 0) return null;
        
        const head = snake.getHead();
        for (const food of foods) {
            if (head.equals(food.position)) {
                return food;
            }
        }
        return null;
    }

    /**
     * 检测所有蛇的碰撞情况
     * @param {Snake[]} snakes - 所有蛇的数组
     * @returns {Object} 碰撞结果 {deadSnakes: Set, collisionTypes: Map}
     */
    detectAllCollisions(snakes) {
        const deadSnakes = new Set();
        const collisionTypes = new Map(); // 记录每条蛇的死亡类型

        // 先检查头对头碰撞
        for (let i = 0; i < snakes.length; i++) {
            for (let j = i + 1; j < snakes.length; j++) {
                if (this.checkHeadToHeadCollision(snakes[i], snakes[j])) {
                    deadSnakes.add(i);
                    deadSnakes.add(j);
                    collisionTypes.set(i, 'headToHead');
                    collisionTypes.set(j, 'headToHead');
                }
            }
        }

        // 检查其他碰撞（但跳过已经在头对头碰撞中死亡的蛇）
        for (let i = 0; i < snakes.length; i++) {
            if (deadSnakes.has(i)) continue; // 已经死亡，跳过
            
            const snake = snakes[i];
            if (!snake.isAlive) continue;

            // 检查撞墙
            if (this.checkWallCollision(snake)) {
                deadSnakes.add(i);
                collisionTypes.set(i, 'wall');
                continue;
            }

            // 检查撞自己
            if (this.checkSelfCollision(snake)) {
                deadSnakes.add(i);
                collisionTypes.set(i, 'self');
                continue;
            }

            // 检查撞其他蛇的身体
            for (let j = 0; j < snakes.length; j++) {
                if (i === j) continue;
                if (this.checkSnakeBodyCollision(snake, snakes[j])) {
                    deadSnakes.add(i);
                    collisionTypes.set(i, 'other');
                    break;
                }
            }
        }

        return { deadSnakes, collisionTypes };
    }

    /**
     * 检查位置是否与任何蛇碰撞
     * @param {Position} position - 要检查的位置
     * @param {Snake[]} snakes - 蛇的数组
     * @returns {boolean}
     */
    checkPositionOccupied(position, snakes) {
        for (const snake of snakes) {
            if (snake.isAlive && snake.occupies(position)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检查位置是否在地图边界内
     * @param {Position} position - 要检查的位置
     * @returns {boolean}
     */
    isInBounds(position) {
        return position.x >= 0 && position.x < this.config.GRID_SIZE &&
               position.y >= 0 && position.y < this.config.GRID_SIZE;
    }
}

export default CollisionDetector;

