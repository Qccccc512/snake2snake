/**
 * 游戏配置管理类（单例模式）
 * 管理所有游戏常量和可配置项
 */
class GameConfig {
    static instance = null;

    constructor() {
        if (GameConfig.instance) {
            return GameConfig.instance;
        }

        // 地图配置
        this.GRID_SIZE = 32;
        this.CELL_SIZE = 16;
        this.GAME_WIDTH = this.GRID_SIZE * this.CELL_SIZE;
        this.GAME_HEIGHT = this.GRID_SIZE * this.CELL_SIZE;

        // 蛇配置
        this.INITIAL_LENGTH = 3;
        this.SNAKE_SPEED = 120; // 移动间隔(ms)

        // 游戏配置
        this.GAME_DURATION = 120; // 2分钟
        this.RESPAWN_DELAY = 2000; // 重生延迟(ms)

        // 食物配置
        this.MAX_FOOD = 20;
        this.FOOD_SPAWN_INTERVAL = 1000; // 每秒刷新
        this.FOOD_SPAWN_COUNT = 2; // 每次刷新2颗

        // 特殊豆子概率配置（总和应为100）
        this.FOOD_PROBABILITIES = {
            normal: 80,    // 普通豆子
            speed: 5,      // 加速豆子
            super: 5,      // 超级豆子
            mine: 5,       // 地雷
            magnet: 5      // 磁铁豆子
        };

        // 特效持续时间配置
        this.SPEED_EFFECT_DURATION = 5000; // 加速效果持续5秒
        this.MAGNET_EFFECT_DURATION = 20000; // 磁铁效果持续20秒
        this.MAGNET_RANGE = 1; // 磁铁九宫格范围（1表示周围一圈）

        // 分数配置
        this.SCORE_PER_FOOD = 50;
        this.SCORE_PER_LENGTH = 100;

        // 死亡掉落配置
        this.FOOD_DROP_RATE = 3; // 每3节身体掉落1颗豆子

        // 颜色配置
        this.COLORS = {
            bg: '#1e1e1e',
            grid: '#333',
            normal: '#ffeb3b',      // 普通豆子：黄色
            speed: '#ff9800',       // 加速豆子：橙色
            super: '#9c27b0',       // 超级豆子：紫色
            mine: '#f44336',        // 地雷：红色
            magnet: '#2196f3',      // 磁铁豆子：蓝色
            player1: { head: '#2196f3', body: '#64b5f6' },
            player2: { head: '#f44336', body: '#ef5350' },
            text: '#e0e0e0'
        };

        // AI配置
        this.AI_SETTINGS = {
            easy: {
                reactionDelay: 200,     // 反应延迟
                errorRate: 0.08,        // 犯错概率
                lookAhead: 1            // 前瞻步数
            },
            normal: {
                reactionDelay: 100,
                errorRate: 0.02,
                lookAhead: 3
            },
            hard: {
                reactionDelay: 50,
                errorRate: 0,
                lookAhead: 5
            }
        };

        GameConfig.instance = this;
    }

    /**
     * 获取单例实例
     */
    static getInstance() {
        if (!GameConfig.instance) {
            GameConfig.instance = new GameConfig();
        }
        return GameConfig.instance;
    }

    /**
     * 更新食物刷新配置
     */
    updateFoodSpawnConfig(interval, count, maxFood) {
        this.FOOD_SPAWN_INTERVAL = interval;
        this.FOOD_SPAWN_COUNT = count;
        this.MAX_FOOD = maxFood;
    }

    /**
     * 更新食物概率配置
     */
    updateFoodProbabilities(probabilities) {
        const total = Object.values(probabilities).reduce((sum, val) => sum + val, 0);
        if (total !== 100) {
            console.warn('Food probabilities do not sum to 100:', total);
        }
        this.FOOD_PROBABILITIES = { ...probabilities };
    }

    /**
     * 更新蛇移动速度
     */
    updateSnakeSpeed(speed) {
        this.SNAKE_SPEED = speed;
    }

    /**
     * 重置为默认配置
     */
    reset() {
        const newConfig = new GameConfig();
        Object.assign(this, newConfig);
    }
}

export default GameConfig;

