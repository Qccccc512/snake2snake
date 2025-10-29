/**
 * 游戏统计数据类
 * 记录玩家的游戏数据，包括跨局累积和单局数据
 */
class GameStats {
    constructor() {
        // 跨局累积数据（持久化）
        this.totalGames = 0;              // 总游戏局数
        this.totalWins = 0;               // 总获胜次数
        this.totalDistance = 0;           // 累积移动距离
        this.totalFoodEaten = 0;          // 累积吃豆数
        this.totalNormalFoodEaten = 0;    // 累积吃普通豆子数
        this.totalSpeedFoodEaten = 0;     // 累积吃加速豆子数
        this.totalSuperFoodEaten = 0;     // 累积吃超级豆子数
        this.totalMagnetFoodEaten = 0;    // 累积吃磁铁豆子数
        this.totalMineHit = 0;            // 累积触碰地雷数
        this.totalDeaths = 0;             // 累积死亡次数
        this.totalHeadToHeadCollisions = 0; // 累积对撞次数
        this.totalSelfCollisions = 0;     // 累积撞自己次数
        this.totalSpeedTime = 0;          // 累积加速状态时间（秒）

        // 单局数据（游戏结束后重置）
        this.currentDistance = 0;          // 当前局移动距离
        this.currentFoodEaten = 0;         // 当前局吃豆数
        this.currentNormalFoodEaten = 0;   // 当前局吃普通豆子数
        this.currentSpeedFoodEaten = 0;    // 当前局吃加速豆子数
        this.currentSuperFoodEaten = 0;    // 当前局吃超级豆子数
        this.currentMagnetFoodEaten = 0;   // 当前局吃磁铁豆子数
        this.currentMineHit = 0;           // 当前局触碰地雷数
        this.currentMaxLength = 0;         // 当前局最大长度
        this.currentDeaths = 0;            // 当前局死亡次数
        this.currentHeadToHeadCollisions = 0; // 当前局对撞次数
        this.currentSelfCollisions = 0;    // 当前局撞自己次数
        this.currentSpeedTime = 0;         // 当前局加速状态时间（秒）
        this.currentMagnetFoodCollected = 0; // 当前局通过磁铁吸取的豆子数
        this.hasResurrected = false;       // 当前局是否重生过
        this.hasLeading = true;            // 当前局是否全程领先
        this.startTime = null;             // 当前局开始时间
        this.currentGameWon = false;       // 当前局是否获胜（临时标记）
    }

    /**
     * 记录移动
     */
    recordMove() {
        this.currentDistance++;
    }

    /**
     * 记录吃豆子
     * @param {string} foodType - 豆子类型
     */
    recordFoodEaten(foodType) {
        this.currentFoodEaten++;
        
        switch(foodType) {
            case 'normal':
                this.currentNormalFoodEaten++;
                break;
            case 'speed':
                this.currentSpeedFoodEaten++;
                break;
            case 'super':
                this.currentSuperFoodEaten++;
                break;
            case 'magnet':
                this.currentMagnetFoodEaten++;
                break;
        }
    }

    /**
     * 记录触碰地雷
     */
    recordMineHit() {
        this.currentMineHit++;
    }

    /**
     * 记录死亡
     * @param {string} deathType - 死亡类型：'wall', 'self', 'headToHead', 'mine'
     */
    recordDeath(deathType) {
        this.currentDeaths++;
        this.hasResurrected = true;

        if (deathType === 'headToHead') {
            this.currentHeadToHeadCollisions++;
        } else if (deathType === 'self') {
            this.currentSelfCollisions++;
        }
    }

    /**
     * 更新当前最大长度
     * @param {number} length - 蛇的长度
     */
    updateMaxLength(length) {
        if (length > this.currentMaxLength) {
            this.currentMaxLength = length;
        }
    }

    /**
     * 记录加速时间
     * @param {number} seconds - 加速持续秒数
     */
    recordSpeedTime(seconds) {
        this.currentSpeedTime += seconds;
    }

    /**
     * 记录磁铁吸取的豆子
     * @param {number} count - 吸取的豆子数量
     */
    recordMagnetCollected(count) {
        this.currentMagnetFoodCollected += count;
    }

    /**
     * 标记失去领先
     */
    markLostLeading() {
        this.hasLeading = false;
    }

    /**
     * 游戏结束时，将单局数据累加到总数据
     * @param {boolean} isWin - 是否获胜
     */
    endGame(isWin) {
        // 累加单局数据到总数据
        this.totalGames++;
        if (isWin) this.totalWins++;
        
        this.totalDistance += this.currentDistance;
        this.totalFoodEaten += this.currentFoodEaten;
        this.totalNormalFoodEaten += this.currentNormalFoodEaten;
        this.totalSpeedFoodEaten += this.currentSpeedFoodEaten;
        this.totalSuperFoodEaten += this.currentSuperFoodEaten;
        this.totalMagnetFoodEaten += this.currentMagnetFoodEaten;
        this.totalMineHit += this.currentMineHit;
        this.totalDeaths += this.currentDeaths;
        this.totalHeadToHeadCollisions += this.currentHeadToHeadCollisions;
        this.totalSelfCollisions += this.currentSelfCollisions;
        this.totalSpeedTime += this.currentSpeedTime;
    }

    /**
     * 重置单局数据（游戏开始或重置时调用）
     */
    resetSession() {
        this.currentDistance = 0;
        this.currentFoodEaten = 0;
        this.currentNormalFoodEaten = 0;
        this.currentSpeedFoodEaten = 0;
        this.currentSuperFoodEaten = 0;
        this.currentMagnetFoodEaten = 0;
        this.currentMineHit = 0;
        this.currentMaxLength = 0;
        this.currentDeaths = 0;
        this.currentHeadToHeadCollisions = 0;
        this.currentSelfCollisions = 0;
        this.currentSpeedTime = 0;
        this.currentMagnetFoodCollected = 0;
        this.hasResurrected = false;
        this.hasLeading = true;
        this.startTime = Date.now();
        this.currentGameWon = false;
    }

    /**
     * 序列化为JSON（用于存储）
     */
    serialize() {
        return {
            totalGames: this.totalGames,
            totalWins: this.totalWins,
            totalDistance: this.totalDistance,
            totalFoodEaten: this.totalFoodEaten,
            totalNormalFoodEaten: this.totalNormalFoodEaten,
            totalSpeedFoodEaten: this.totalSpeedFoodEaten,
            totalSuperFoodEaten: this.totalSuperFoodEaten,
            totalMagnetFoodEaten: this.totalMagnetFoodEaten,
            totalMineHit: this.totalMineHit,
            totalDeaths: this.totalDeaths,
            totalHeadToHeadCollisions: this.totalHeadToHeadCollisions,
            totalSelfCollisions: this.totalSelfCollisions,
            totalSpeedTime: this.totalSpeedTime
        };
    }

    /**
     * 从JSON反序列化
     */
    static deserialize(data) {
        const stats = new GameStats();
        Object.assign(stats, data);
        return stats;
    }
}

export default GameStats;

