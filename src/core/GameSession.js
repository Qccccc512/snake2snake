/**
 * 游戏会话类
 * 管理当前游戏的玩家信息和游戏模式
 */
class GameSession {
    constructor() {
        this.player1User = null;  // 玩家1的用户
        this.player2User = null;  // 玩家2的用户（双人模式）或AI（单人模式为null）
        this.gameMode = '2players'; // '2players' 或 'ai'
        this.aiDifficulty = 'easy'; // AI难度
    }

    /**
     * 设置单人模式
     * @param {User} user - 玩家用户
     * @param {string} difficulty - AI难度
     */
    setupSinglePlayer(user, difficulty = 'easy') {
        this.player1User = user;
        this.player2User = null;
        this.gameMode = 'ai';
        this.aiDifficulty = difficulty;
    }

    /**
     * 设置双人模式
     * @param {User} user1 - 玩家1的用户
     * @param {User} user2 - 玩家2的用户
     */
    setupTwoPlayers(user1, user2) {
        this.player1User = user1;
        this.player2User = user2;
        this.gameMode = '2players';
    }

    /**
     * 获取指定玩家的用户
     * @param {number} playerIndex - 玩家索引（0或1）
     * @returns {User|null}
     */
    getPlayerUser(playerIndex) {
        return playerIndex === 0 ? this.player1User : this.player2User;
    }

    /**
     * 更新玩家统计数据
     * @param {number} playerIndex - 玩家索引
     * @param {object} statsDelta - 统计数据变化
     */
    updatePlayerStats(playerIndex, statsDelta) {
        const user = this.getPlayerUser(playerIndex);
        if (user) {
            user.updateStats(statsDelta);
        }
    }

    /**
     * 检查会话是否有效（已选择必要的用户）
     * @returns {boolean}
     */
    isValid() {
        if (this.gameMode === 'ai') {
            return this.player1User !== null;
        } else {
            return this.player1User !== null && this.player2User !== null;
        }
    }

    /**
     * 获取游戏模式显示名称
     * @returns {string}
     */
    getGameModeText() {
        if (this.gameMode === 'ai') {
            const difficultyMap = {
                'easy': '简单',
                'normal': '中等',
                'hard': '困难'
            };
            return `人机对战 (${difficultyMap[this.aiDifficulty] || 'AI'})`;
        } else {
            return '双人对战';
        }
    }

    /**
     * 获取玩家显示名称
     * @param {number} playerIndex - 玩家索引
     * @returns {string}
     */
    getPlayerName(playerIndex) {
        const user = this.getPlayerUser(playerIndex);
        if (user) {
            return user.userName;
        }
        if (playerIndex === 1 && this.gameMode === 'ai') {
            const difficultyMap = {
                'easy': '简单AI',
                'normal': '中等AI',
                'hard': '困难AI'
            };
            return difficultyMap[this.aiDifficulty] || 'AI';
        }
        return `玩家${playerIndex + 1}`;
    }

    /**
     * 重置会话
     */
    reset() {
        this.player1User = null;
        this.player2User = null;
        this.gameMode = '2players';
        this.aiDifficulty = 'easy';
    }

    /**
     * 是否为AI模式
     * @returns {boolean}
     */
    isAIMode() {
        return this.gameMode === 'ai';
    }

    /**
     * 是否为双人模式
     * @returns {boolean}
     */
    isTwoPlayerMode() {
        return this.gameMode === '2players';
    }
}

export default GameSession;

