/**
 * 位置类
 * 表示游戏地图上的一个坐标点
 */
class Position {
    /**
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * 判断两个位置是否相等
     * @param {Position} other - 另一个位置
     * @returns {boolean}
     */
    equals(other) {
        return this.x === other.x && this.y === other.y;
    }

    /**
     * 计算到另一个位置的曼哈顿距离
     * @param {Position} other - 另一个位置
     * @returns {number}
     */
    manhattanDistance(other) {
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
    }

    /**
     * 计算到另一个位置的欧几里得距离
     * @param {Position} other - 另一个位置
     * @returns {number}
     */
    euclideanDistance(other) {
        return Math.hypot(this.x - other.x, this.y - other.y);
    }

    /**
     * 获取相邻的四个位置（上下左右）
     * @returns {Position[]}
     */
    getNeighbors() {
        return [
            new Position(this.x, this.y - 1), // 上
            new Position(this.x, this.y + 1), // 下
            new Position(this.x - 1, this.y), // 左
            new Position(this.x + 1, this.y)  // 右
        ];
    }

    /**
     * 获取九宫格范围内的所有位置
     * @param {number} range - 范围（1表示周围一圈）
     * @returns {Position[]}
     */
    getSurrounding(range = 1) {
        const positions = [];
        for (let dx = -range; dx <= range; dx++) {
            for (let dy = -range; dy <= range; dy++) {
                if (dx === 0 && dy === 0) continue; // 排除自己
                positions.push(new Position(this.x + dx, this.y + dy));
            }
        }
        return positions;
    }

    /**
     * 复制位置
     * @returns {Position}
     */
    clone() {
        return new Position(this.x, this.y);
    }

    /**
     * 转换为字符串键（用于Set/Map）
     * @returns {string}
     */
    toString() {
        return `${this.x},${this.y}`;
    }

    /**
     * 从字符串键创建Position
     * @param {string} str - 字符串键
     * @returns {Position}
     */
    static fromString(str) {
        const [x, y] = str.split(',').map(Number);
        return new Position(x, y);
    }
}

export default Position;

