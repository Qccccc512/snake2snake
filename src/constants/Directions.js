/**
 * 方向常量
 * 独立文件避免循环依赖
 */
const Direction = {
    UP: { x: 0, y: -1, name: 'UP' },
    DOWN: { x: 0, y: 1, name: 'DOWN' },
    LEFT: { x: -1, y: 0, name: 'LEFT' },
    RIGHT: { x: 1, y: 0, name: 'RIGHT' }
};

export { Direction };
export default Direction;

