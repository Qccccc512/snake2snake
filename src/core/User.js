import GameStats from '../models/GameStats.js';
import { AchievementDefinitions } from '../models/Achievement.js';

/**
 * 用户类
 * 代表一个玩家账号，包含统计数据和成就
 */
class User {
    /**
     * @param {string} userName - 用户名
     * @param {string} userId - 用户ID（可选，自动生成）
     */
    constructor(userName, userId = null) {
        this.userId = userId || this.generateUserId();
        this.userName = userName;
        this.stats = new GameStats();
        this.achievements = AchievementDefinitions.createAllAchievements();
        this.createdAt = new Date().toISOString();
        this.lastPlayedAt = new Date().toISOString();
    }

    /**
     * 生成唯一的用户ID
     * @returns {string}
     */
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 更新统计数据
     * @param {object} statsDelta - 统计数据变化
     */
    updateStats(statsDelta) {
        Object.assign(this.stats, statsDelta);
        this.lastPlayedAt = new Date().toISOString();
    }

    /**
     * 解锁成就
     * @param {string} achievementId - 成就ID
     * @returns {boolean} 是否成功解锁
     */
    unlockAchievement(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
            achievement.unlock();
            return true;
        }
        return false;
    }

    /**
     * 获取已解锁的成就列表
     * @returns {Achievement[]}
     */
    getUnlockedAchievements() {
        return this.achievements.filter(a => a.unlocked);
    }

    /**
     * 获取未解锁的成就列表
     * @returns {Achievement[]}
     */
    getLockedAchievements() {
        return this.achievements.filter(a => !a.unlocked);
    }

    /**
     * 获取成就完成百分比
     * @returns {number} 0-100之间的百分比
     */
    getAchievementProgress() {
        const unlockedCount = this.getUnlockedAchievements().length;
        const totalCount = this.achievements.length;
        return totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
    }

    /**
     * 获取用户等级（基于总游戏局数）
     * @returns {number}
     */
    getLevel() {
        return Math.floor(this.stats.totalGames / 10) + 1;
    }

    /**
     * 获取胜率
     * @returns {number} 0-100之间的百分比
     */
    getWinRate() {
        if (this.stats.totalGames === 0) return 0;
        return Math.round((this.stats.totalWins / this.stats.totalGames) * 100);
    }

    /**
     * 序列化为JSON（用于存储）
     * @returns {object}
     */
    serialize() {
        return {
            userId: this.userId,
            userName: this.userName,
            stats: this.stats.serialize(),
            achievements: this.achievements.map(a => a.serialize()),
            createdAt: this.createdAt,
            lastPlayedAt: this.lastPlayedAt
        };
    }

    /**
     * 从JSON反序列化
     * @param {object} data - 序列化的数据
     * @returns {User}
     */
    static deserialize(data) {
        const user = new User(data.userName, data.userId);
        user.stats = GameStats.deserialize(data.stats);
        user.createdAt = data.createdAt;
        user.lastPlayedAt = data.lastPlayedAt;

        // 恢复成就状态
        if (data.achievements) {
            for (const achievementData of data.achievements) {
                const achievement = user.achievements.find(a => a.id === achievementData.id);
                if (achievement) {
                    achievement.unlocked = achievementData.unlocked;
                    achievement.unlockedAt = achievementData.unlockedAt;
                }
            }
        }

        return user;
    }

    /**
     * 获取用户摘要信息
     * @returns {object}
     */
    getSummary() {
        return {
            userId: this.userId,
            userName: this.userName,
            level: this.getLevel(),
            totalGames: this.stats.totalGames,
            totalWins: this.stats.totalWins,
            winRate: this.getWinRate(),
            achievementProgress: this.getAchievementProgress(),
            lastPlayedAt: this.lastPlayedAt
        };
    }
}

export default User;

