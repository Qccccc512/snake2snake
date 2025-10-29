/**
 * 成就类
 * 定义单个成就的属性和检查逻辑
 */
class Achievement {
    /**
     * @param {string} id - 成就ID
     * @param {string} name - 成就名称
     * @param {string} description - 成就描述
     * @param {string} type - 成就类型：'cumulative'（跨局累积）或'session'（单局）
     * @param {Function} checkCondition - 检查是否达成的函数 (stats) => boolean
     * @param {Function} getProgress - 获取进度的函数 (stats) => {current, target}
     * @param {string} icon - 成就图标（可选）
     */
    constructor(id, name, description, type, checkCondition, getProgress, icon = '🏆') {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type; // 'cumulative' or 'session'
        this.checkCondition = checkCondition;
        this.getProgress = getProgress;
        this.icon = icon;
        this.unlocked = false;
        this.unlockedAt = null;
    }

    /**
     * 检查成就是否解锁
     * @param {GameStats} stats - 游戏统计数据
     * @returns {boolean}
     */
    check(stats) {
        if (this.unlocked) return false; // 已解锁的不再检查
        
        const shouldUnlock = this.checkCondition(stats);
        if (shouldUnlock) {
            this.unlock();
            return true;
        }
        return false;
    }

    /**
     * 解锁成就
     */
    unlock() {
        this.unlocked = true;
        this.unlockedAt = new Date().toISOString();
    }

    /**
     * 获取成就进度
     * @param {GameStats} stats - 游戏统计数据
     * @returns {{current: number, target: number, percentage: number}}
     */
    getProgressInfo(stats) {
        const progress = this.getProgress(stats);
        const percentage = Math.min(100, (progress.current / progress.target) * 100);
        return {
            ...progress,
            percentage: Math.round(percentage)
        };
    }

    /**
     * 序列化为JSON
     */
    serialize() {
        return {
            id: this.id,
            unlocked: this.unlocked,
            unlockedAt: this.unlockedAt
        };
    }
}

/**
 * 成就定义工厂
 * 创建所有游戏成就
 */
class AchievementDefinitions {
    static createAllAchievements() {
        const achievements = [];

        // ========== 跨局累积成就 ==========
        
        // 远行者系列
        achievements.push(new Achievement(
            'traveler_1', '初级旅行者', '累积移动100格',
            'cumulative',
            (stats) => stats.totalDistance >= 100,
            (stats) => ({ current: stats.totalDistance, target: 100 }),
            '🚶'
        ));
        achievements.push(new Achievement(
            'traveler_2', '中级旅行者', '累积移动300格',
            'cumulative',
            (stats) => stats.totalDistance >= 300,
            (stats) => ({ current: stats.totalDistance, target: 300 }),
            '🏃'
        ));
        achievements.push(new Achievement(
            'traveler_3', '高级旅行者', '累积移动1000格',
            'cumulative',
            (stats) => stats.totalDistance >= 1000,
            (stats) => ({ current: stats.totalDistance, target: 1000 }),
            '🚀'
        ));
        achievements.push(new Achievement(
            'traveler_4', '资深旅行者', '累积移动3000格',
            'cumulative',
            (stats) => stats.totalDistance >= 3000,
            (stats) => ({ current: stats.totalDistance, target: 3000 }),
            '✈️'
        ));
        achievements.push(new Achievement(
            'traveler_5', '传奇旅行者', '累积移动10000格',
            'cumulative',
            (stats) => stats.totalDistance >= 10000,
            (stats) => ({ current: stats.totalDistance, target: 10000 }),
            '🌍'
        ));

        // 美食家系列
        achievements.push(new Achievement(
            'foodie_1', '美食新手', '累积吃豆50颗',
            'cumulative',
            (stats) => stats.totalFoodEaten >= 50,
            (stats) => ({ current: stats.totalFoodEaten, target: 50 }),
            '🍎'
        ));
        achievements.push(new Achievement(
            'foodie_2', '美食爱好者', '累积吃豆100颗',
            'cumulative',
            (stats) => stats.totalFoodEaten >= 100,
            (stats) => ({ current: stats.totalFoodEaten, target: 100 }),
            '🍕'
        ));
        achievements.push(new Achievement(
            'foodie_3', '美食专家', '累积吃豆300颗',
            'cumulative',
            (stats) => stats.totalFoodEaten >= 300,
            (stats) => ({ current: stats.totalFoodEaten, target: 300 }),
            '🍔'
        ));
        achievements.push(new Achievement(
            'foodie_4', '美食大师', '累积吃豆500颗',
            'cumulative',
            (stats) => stats.totalFoodEaten >= 500,
            (stats) => ({ current: stats.totalFoodEaten, target: 500 }),
            '🍰'
        ));
        achievements.push(new Achievement(
            'foodie_5', '美食之王', '累积吃豆1000颗',
            'cumulative',
            (stats) => stats.totalFoodEaten >= 1000,
            (stats) => ({ current: stats.totalFoodEaten, target: 1000 }),
            '👑'
        ));
        achievements.push(new Achievement(
            'foodie_6', '美食传说', '累积吃豆3000颗',
            'cumulative',
            (stats) => stats.totalFoodEaten >= 3000,
            (stats) => ({ current: stats.totalFoodEaten, target: 3000 }),
            '⭐'
        ));

        // 速度狂人系列
        achievements.push(new Achievement(
            'speedster_1', '速度新手', '累积加速状态1000秒',
            'cumulative',
            (stats) => stats.totalSpeedTime >= 1000,
            (stats) => ({ current: stats.totalSpeedTime, target: 1000 }),
            '⚡'
        ));
        achievements.push(new Achievement(
            'speedster_2', '速度大师', '累积加速状态3000秒',
            'cumulative',
            (stats) => stats.totalSpeedTime >= 3000,
            (stats) => ({ current: stats.totalSpeedTime, target: 3000 }),
            '💨'
        ));
        achievements.push(new Achievement(
            'speedster_3', '速度之神', '累积加速状态5000秒',
            'cumulative',
            (stats) => stats.totalSpeedTime >= 5000,
            (stats) => ({ current: stats.totalSpeedTime, target: 5000 }),
            '🌟'
        ));

        // 特殊美食系列
        achievements.push(new Achievement(
            'special_speed_1', '加速爱好者', '累积吃加速豆10颗',
            'cumulative',
            (stats) => stats.totalSpeedFoodEaten >= 10,
            (stats) => ({ current: stats.totalSpeedFoodEaten, target: 10 }),
            '🟠'
        ));
        achievements.push(new Achievement(
            'special_speed_2', '加速专家', '累积吃加速豆30颗',
            'cumulative',
            (stats) => stats.totalSpeedFoodEaten >= 30,
            (stats) => ({ current: stats.totalSpeedFoodEaten, target: 30 }),
            '🟠'
        ));
        
        achievements.push(new Achievement(
            'special_super_1', '超级收集者', '累积吃超级豆10颗',
            'cumulative',
            (stats) => stats.totalSuperFoodEaten >= 10,
            (stats) => ({ current: stats.totalSuperFoodEaten, target: 10 }),
            '🟣'
        ));
        achievements.push(new Achievement(
            'special_super_2', '超级大师', '累积吃超级豆30颗',
            'cumulative',
            (stats) => stats.totalSuperFoodEaten >= 30,
            (stats) => ({ current: stats.totalSuperFoodEaten, target: 30 }),
            '🟣'
        ));
        
        achievements.push(new Achievement(
            'special_magnet_1', '磁力新手', '累积吃磁铁豆10颗',
            'cumulative',
            (stats) => stats.totalMagnetFoodEaten >= 10,
            (stats) => ({ current: stats.totalMagnetFoodEaten, target: 10 }),
            '🔵'
        ));
        achievements.push(new Achievement(
            'special_magnet_2', '磁力专家', '累积吃磁铁豆30颗',
            'cumulative',
            (stats) => stats.totalMagnetFoodEaten >= 30,
            (stats) => ({ current: stats.totalMagnetFoodEaten, target: 30 }),
            '🔵'
        ));

        // 拆弹专家系列
        achievements.push(new Achievement(
            'bomb_1', '不怕炸', '累积触碰地雷10次',
            'cumulative',
            (stats) => stats.totalMineHit >= 10,
            (stats) => ({ current: stats.totalMineHit, target: 10 }),
            '💣'
        ));
        achievements.push(new Achievement(
            'bomb_2', '炸弹狂人', '累积触碰地雷30次',
            'cumulative',
            (stats) => stats.totalMineHit >= 30,
            (stats) => ({ current: stats.totalMineHit, target: 30 }),
            '💥'
        ));
        achievements.push(new Achievement(
            'bomb_3', '炸弹之王', '累积触碰地雷50次',
            'cumulative',
            (stats) => stats.totalMineHit >= 50,
            (stats) => ({ current: stats.totalMineHit, target: 50 }),
            '🎆'
        ));

        // 不屈者系列
        achievements.push(new Achievement(
            'undying_1', '不屈新手', '累积死亡10次',
            'cumulative',
            (stats) => stats.totalDeaths >= 10,
            (stats) => ({ current: stats.totalDeaths, target: 10 }),
            '💀'
        ));
        achievements.push(new Achievement(
            'undying_2', '不屈战士', '累积死亡30次',
            'cumulative',
            (stats) => stats.totalDeaths >= 30,
            (stats) => ({ current: stats.totalDeaths, target: 30 }),
            '⚰️'
        ));
        achievements.push(new Achievement(
            'undying_3', '不屈勇者', '累积死亡50次',
            'cumulative',
            (stats) => stats.totalDeaths >= 50,
            (stats) => ({ current: stats.totalDeaths, target: 50 }),
            '🔥'
        ));
        achievements.push(new Achievement(
            'undying_4', '不屈传说', '累积死亡100次',
            'cumulative',
            (stats) => stats.totalDeaths >= 100,
            (stats) => ({ current: stats.totalDeaths, target: 100 }),
            '⭐'
        ));

        // 对决大师系列
        achievements.push(new Achievement(
            'duel_1', '对决新手', '累积对撞5次',
            'cumulative',
            (stats) => stats.totalHeadToHeadCollisions >= 5,
            (stats) => ({ current: stats.totalHeadToHeadCollisions, target: 5 }),
            '⚔️'
        ));
        achievements.push(new Achievement(
            'duel_2', '对决高手', '累积对撞10次',
            'cumulative',
            (stats) => stats.totalHeadToHeadCollisions >= 10,
            (stats) => ({ current: stats.totalHeadToHeadCollisions, target: 10 }),
            '🗡️'
        ));
        achievements.push(new Achievement(
            'duel_3', '对决大师', '累积对撞20次',
            'cumulative',
            (stats) => stats.totalHeadToHeadCollisions >= 20,
            (stats) => ({ current: stats.totalHeadToHeadCollisions, target: 20 }),
            '🛡️'
        ));
        achievements.push(new Achievement(
            'duel_4', '对决传说', '累积对撞50次',
            'cumulative',
            (stats) => stats.totalHeadToHeadCollisions >= 50,
            (stats) => ({ current: stats.totalHeadToHeadCollisions, target: 50 }),
            '👑'
        ));

        // 自省者系列
        achievements.push(new Achievement(
            'self_1', '粗心大意', '累积撞自己5次',
            'cumulative',
            (stats) => stats.totalSelfCollisions >= 5,
            (stats) => ({ current: stats.totalSelfCollisions, target: 5 }),
            '😅'
        ));
        achievements.push(new Achievement(
            'self_2', '老是失误', '累积撞自己10次',
            'cumulative',
            (stats) => stats.totalSelfCollisions >= 10,
            (stats) => ({ current: stats.totalSelfCollisions, target: 10 }),
            '😓'
        ));
        achievements.push(new Achievement(
            'self_3', '需要练习', '累积撞自己20次',
            'cumulative',
            (stats) => stats.totalSelfCollisions >= 20,
            (stats) => ({ current: stats.totalSelfCollisions, target: 20 }),
            '😰'
        ));
        achievements.push(new Achievement(
            'self_4', '自我反省大师', '累积撞自己50次',
            'cumulative',
            (stats) => stats.totalSelfCollisions >= 50,
            (stats) => ({ current: stats.totalSelfCollisions, target: 50 }),
            '🤦'
        ));

        // 资深玩家系列
        achievements.push(new Achievement(
            'veteran_1', '初级玩家', '完成游戏10局',
            'cumulative',
            (stats) => stats.totalGames >= 10,
            (stats) => ({ current: stats.totalGames, target: 10 }),
            '🎮'
        ));
        achievements.push(new Achievement(
            'veteran_2', '经验玩家', '完成游戏30局',
            'cumulative',
            (stats) => stats.totalGames >= 30,
            (stats) => ({ current: stats.totalGames, target: 30 }),
            '🕹️'
        ));
        achievements.push(new Achievement(
            'veteran_3', '资深玩家', '完成游戏50局',
            'cumulative',
            (stats) => stats.totalGames >= 50,
            (stats) => ({ current: stats.totalGames, target: 50 }),
            '🎯'
        ));
        achievements.push(new Achievement(
            'veteran_4', '老兵玩家', '完成游戏100局',
            'cumulative',
            (stats) => stats.totalGames >= 100,
            (stats) => ({ current: stats.totalGames, target: 100 }),
            '🏅'
        ));
        achievements.push(new Achievement(
            'veteran_5', '传奇玩家', '完成游戏300局',
            'cumulative',
            (stats) => stats.totalGames >= 300,
            (stats) => ({ current: stats.totalGames, target: 300 }),
            '🏆'
        ));

        // 胜利之星系列
        achievements.push(new Achievement(
            'winner_1', '初次胜利', '累积获胜10局',
            'cumulative',
            (stats) => stats.totalWins >= 10,
            (stats) => ({ current: stats.totalWins, target: 10 }),
            '🥉'
        ));
        achievements.push(new Achievement(
            'winner_2', '常胜将军', '累积获胜30局',
            'cumulative',
            (stats) => stats.totalWins >= 30,
            (stats) => ({ current: stats.totalWins, target: 30 }),
            '🥈'
        ));
        achievements.push(new Achievement(
            'winner_3', '胜利专家', '累积获胜50局',
            'cumulative',
            (stats) => stats.totalWins >= 50,
            (stats) => ({ current: stats.totalWins, target: 50 }),
            '🥇'
        ));
        achievements.push(new Achievement(
            'winner_4', '胜利之星', '累积获胜100局',
            'cumulative',
            (stats) => stats.totalWins >= 100,
            (stats) => ({ current: stats.totalWins, target: 100 }),
            '⭐'
        ));

        // ========== 单局成就 ==========
        
        // 大胃王系列
        achievements.push(new Achievement(
            'session_food_1', '大胃王', '单局吃豆20颗',
            'session',
            (stats) => stats.currentFoodEaten >= 20,
            (stats) => ({ current: stats.currentFoodEaten, target: 20 }),
            '🍽️'
        ));
        achievements.push(new Achievement(
            'session_food_2', '超级大胃王', '单局吃豆30颗',
            'session',
            (stats) => stats.currentFoodEaten >= 30,
            (stats) => ({ current: stats.currentFoodEaten, target: 30 }),
            '🍴'
        ));
        achievements.push(new Achievement(
            'session_food_3', '食神', '单局吃豆40颗',
            'session',
            (stats) => stats.currentFoodEaten >= 40,
            (stats) => ({ current: stats.currentFoodEaten, target: 40 }),
            '🥘'
        ));
        achievements.push(new Achievement(
            'session_food_4', '食王', '单局吃豆50颗',
            'session',
            (stats) => stats.currentFoodEaten >= 50,
            (stats) => ({ current: stats.currentFoodEaten, target: 50 }),
            '👨‍🍳'
        ));

        // 巨蟒系列
        achievements.push(new Achievement(
            'session_length_1', '小巨蟒', '单局最大长度20节',
            'session',
            (stats) => stats.currentMaxLength >= 20,
            (stats) => ({ current: stats.currentMaxLength, target: 20 }),
            '🐍'
        ));
        achievements.push(new Achievement(
            'session_length_2', '中巨蟒', '单局最大长度30节',
            'session',
            (stats) => stats.currentMaxLength >= 30,
            (stats) => ({ current: stats.currentMaxLength, target: 30 }),
            '🐉'
        ));
        achievements.push(new Achievement(
            'session_length_3', '大巨蟒', '单局最大长度40节',
            'session',
            (stats) => stats.currentMaxLength >= 40,
            (stats) => ({ current: stats.currentMaxLength, target: 40 }),
            '🦎'
        ));
        achievements.push(new Achievement(
            'session_length_4', '超级巨蟒', '单局最大长度50节',
            'session',
            (stats) => stats.currentMaxLength >= 50,
            (stats) => ({ current: stats.currentMaxLength, target: 50 }),
            '🦖'
        ));

        // 特殊单局成就
        achievements.push(new Achievement(
            'perfect_survival', '完美生存', '单局不死亡且获胜',
            'session',
            (stats) => stats.currentDeaths === 0 && stats.currentGameWon,
            (stats) => ({ current: stats.currentDeaths === 0 && stats.currentGameWon ? 1 : 0, target: 1 }),
            '💪'
        ));

        achievements.push(new Achievement(
            'survivor', '幸存者', '单局死亡后重生并逆转获胜',
            'session',
            (stats) => stats.hasResurrected && stats.currentGameWon,
            (stats) => ({ current: stats.hasResurrected && stats.currentGameWon ? 1 : 0, target: 1 }),
            '🔄'
        ));

        achievements.push(new Achievement(
            'marathon', '马拉松选手', '单局移动距离500格',
            'session',
            (stats) => stats.currentDistance >= 500,
            (stats) => ({ current: stats.currentDistance, target: 500 }),
            '🏃‍♂️'
        ));

        achievements.push(new Achievement(
            'marathon_2', '超级马拉松', '单局移动距离1000格',
            'session',
            (stats) => stats.currentDistance >= 1000,
            (stats) => ({ current: stats.currentDistance, target: 1000 }),
            '🏃‍♀️'
        ));

        achievements.push(new Achievement(
            'marathon_3', '马拉松之王', '单局移动距离1500格',
            'session',
            (stats) => stats.currentDistance >= 1500,
            (stats) => ({ current: stats.currentDistance, target: 1500 }),
            '👟'
        ));

        achievements.push(new Achievement(
            'blitz', '闪电战', '开局60秒内达到15节长度',
            'session',
            (stats) => {
                if (!stats.startTime) return false;
                const elapsed = (Date.now() - stats.startTime) / 1000;
                return elapsed <= 60 && stats.currentMaxLength >= 15;
            },
            (stats) => ({ current: stats.currentMaxLength, target: 15 }),
            '⚡'
        ));

        achievements.push(new Achievement(
            'mine_clearer', '地雷清除者', '单局触碰5个地雷后仍存活',
            'session',
            (stats) => stats.currentMineHit >= 5,
            (stats) => ({ current: stats.currentMineHit, target: 5 }),
            '💣'
        ));

        achievements.push(new Achievement(
            'magnet_master', '磁力大师', '单局通过磁铁效果吸取30颗豆子',
            'session',
            (stats) => stats.currentMagnetFoodCollected >= 30,
            (stats) => ({ current: stats.currentMagnetFoodCollected, target: 30 }),
            '🧲'
        ));

        achievements.push(new Achievement(
            'dominator', '完美压制', '单局全程保持分数领先且获胜',
            'session',
            (stats) => stats.hasLeading && stats.currentGameWon,
            (stats) => ({ current: stats.hasLeading && stats.currentGameWon ? 1 : 0, target: 1 }),
            '👑'
        ));

        return achievements;
    }
}

export { Achievement, AchievementDefinitions };
export default Achievement;

