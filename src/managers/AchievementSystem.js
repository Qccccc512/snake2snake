/**
 * 成就系统管理器
 * 负责检查成就触发条件、解锁成就、显示通知
 */
class AchievementSystem {
    constructor(game) {
        this.game = game;
        this.newlyUnlockedAchievements = []; // 本次游戏新解锁的成就
        this.achievementQueue = []; // 等待显示的成就通知队列
    }

    /**
     * 检查指定用户的成就
     * @param {User} user - 要检查的用户
     * @param {string} checkType - 检查类型：'cumulative'（跨局）或'session'（单局）
     * @returns {Achievement[]} 新解锁的成就列表
     */
    checkAchievements(user, checkType = 'all') {
        if (!user) return [];

        const newlyUnlocked = [];
        
        for (const achievement of user.achievements) {
            // 跳过已解锁的成就
            if (achievement.unlocked) continue;

            // 根据检查类型过滤
            if (checkType !== 'all' && achievement.type !== checkType) continue;

            // 检查是否达成
            if (achievement.check(user.stats)) {
                newlyUnlocked.push(achievement);
                this.queueAchievementNotification(achievement, user);
            }
        }

        return newlyUnlocked;
    }

    /**
     * 检查所有玩家的成就（游戏中调用）
     */
    checkAllPlayers() {
        const session = this.game.session;
        const newAchievements = [];

        // 检查玩家1
        if (session.player1User) {
            const unlocked = this.checkAchievements(session.player1User, 'session');
            newAchievements.push(...unlocked.map(a => ({ 
                achievement: a, 
                user: session.player1User,
                playerIndex: 0
            })));
        }

        // 检查玩家2（双人模式）
        if (session.player2User) {
            const unlocked = this.checkAchievements(session.player2User, 'session');
            newAchievements.push(...unlocked.map(a => ({ 
                achievement: a, 
                user: session.player2User,
                playerIndex: 1
            })));
        }

        this.newlyUnlockedAchievements.push(...newAchievements);
        return newAchievements;
    }

    /**
     * 游戏结束时检查跨局累积成就
     */
    checkCumulativeAchievements() {
        const session = this.game.session;
        const newAchievements = [];

        // 检查玩家1
        if (session.player1User) {
            const unlocked = this.checkAchievements(session.player1User, 'cumulative');
            newAchievements.push(...unlocked.map(a => ({ 
                achievement: a, 
                user: session.player1User,
                playerIndex: 0
            })));
        }

        // 检查玩家2（双人模式）
        if (session.player2User) {
            const unlocked = this.checkAchievements(session.player2User, 'cumulative');
            newAchievements.push(...unlocked.map(a => ({ 
                achievement: a, 
                user: session.player2User,
                playerIndex: 1
            })));
        }

        this.newlyUnlockedAchievements.push(...newAchievements);
        return newAchievements;
    }

    /**
     * 将成就通知加入队列
     * @param {Achievement} achievement - 成就
     * @param {User} user - 用户
     */
    queueAchievementNotification(achievement, user) {
        this.achievementQueue.push({
            achievement,
            user,
            timestamp: Date.now()
        });
    }

    /**
     * 获取并移除队列中的下一个通知
     * @returns {{achievement: Achievement, user: User}|null}
     */
    getNextNotification() {
        return this.achievementQueue.shift() || null;
    }

    /**
     * 检查是否有待显示的通知
     * @returns {boolean}
     */
    hasNotifications() {
        return this.achievementQueue.length > 0;
    }

    /**
     * 清空通知队列
     */
    clearNotifications() {
        this.achievementQueue = [];
    }

    /**
     * 获取本次游戏新解锁的成就
     * @returns {Array}
     */
    getNewlyUnlockedAchievements() {
        return this.newlyUnlockedAchievements;
    }

    /**
     * 重置本次游戏的成就记录
     */
    reset() {
        this.newlyUnlockedAchievements = [];
        this.clearNotifications();
    }

    /**
     * 获取用户的成就统计
     * @param {User} user - 用户
     * @returns {object}
     */
    getAchievementStats(user) {
        if (!user) return null;

        const total = user.achievements.length;
        const unlocked = user.getUnlockedAchievements().length;
        const locked = user.getLockedAchievements().length;

        // 按类型分组
        const cumulativeTotal = user.achievements.filter(a => a.type === 'cumulative').length;
        const cumulativeUnlocked = user.achievements.filter(a => a.type === 'cumulative' && a.unlocked).length;
        const sessionTotal = user.achievements.filter(a => a.type === 'session').length;
        const sessionUnlocked = user.achievements.filter(a => a.type === 'session' && a.unlocked).length;

        return {
            total,
            unlocked,
            locked,
            percentage: user.getAchievementProgress(),
            cumulative: {
                total: cumulativeTotal,
                unlocked: cumulativeUnlocked,
                locked: cumulativeTotal - cumulativeUnlocked
            },
            session: {
                total: sessionTotal,
                unlocked: sessionUnlocked,
                locked: sessionTotal - sessionUnlocked
            }
        };
    }

    /**
     * 获取用户最近解锁的成就
     * @param {User} user - 用户
     * @param {number} count - 数量
     * @returns {Achievement[]}
     */
    getRecentAchievements(user, count = 5) {
        if (!user) return [];

        return user.getUnlockedAchievements()
            .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
            .slice(0, count);
    }

    /**
     * 获取用户接近完成的成就
     * @param {User} user - 用户
     * @param {number} threshold - 进度阈值（百分比）
     * @param {number} count - 数量
     * @returns {Array<{achievement: Achievement, progress: object}>}
     */
    getAlmostCompletedAchievements(user, threshold = 70, count = 5) {
        if (!user) return [];

        return user.getLockedAchievements()
            .map(achievement => ({
                achievement,
                progress: achievement.getProgressInfo(user.stats)
            }))
            .filter(item => item.progress.percentage >= threshold)
            .sort((a, b) => b.progress.percentage - a.progress.percentage)
            .slice(0, count);
    }
}

export default AchievementSystem;

