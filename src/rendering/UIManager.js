/**
 * UI管理器
 * 负责管理所有UI元素的更新和交互
 */
class UIManager {
    constructor(game) {
        this.game = game;
        this.initializeElements();
        this.achievementNotificationTimeout = null;
    }

    /**
     * 初始化DOM元素引用
     */
    initializeElements() {
        // 得分显示
        this.score1El = document.getElementById('score1');
        this.score2El = document.getElementById('score2');
        this.length1El = document.getElementById('length1');
        this.length2El = document.getElementById('length2');
        
        // 计时器
        this.timerEl = document.getElementById('timer');
        
        // 玩家名称
        this.playerName1El = document.querySelector('.player1-name');
        this.playerName2El = document.querySelector('.player2-name');
        
        // 按钮
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        // 模态窗口
        this.gameOverModal = document.getElementById('gameOverModal');
        this.userSelectModal = document.getElementById('userSelectModal');
        this.achievementModal = document.getElementById('achievementModal');
        
        // 成就通知
        this.achievementNotification = document.getElementById('achievementNotification');
    }

    /**
     * 更新分数显示
     */
    updateScores() {
        const session = this.game.session;
        const snakes = this.game.snakes;
        
        if (snakes[0]) {
            const score1 = this.game.scoreManager.calculateScore(snakes[0]);
            this.score1El.textContent = score1;
            this.length1El.textContent = snakes[0].body.length;
        }
        
        if (snakes[1]) {
            const score2 = this.game.scoreManager.calculateScore(snakes[1]);
            this.score2El.textContent = score2;
            this.length2El.textContent = snakes[1].body.length;
        }
    }

    /**
     * 更新计时器显示
     * @param {number} timeRemaining - 剩余时间（秒）
     */
    updateTimer(timeRemaining) {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        this.timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * 更新玩家名称显示
     */
    updatePlayerNames() {
        const session = this.game.session;
        if (this.playerName1El) {
            this.playerName1El.textContent = session.getPlayerName(0);
        }
        if (this.playerName2El) {
            this.playerName2El.textContent = session.getPlayerName(1);
        }
    }

    /**
     * 显示游戏结束弹窗
     * @param {number} winnerIndex - 获胜者索引，-1表示平局
     */
    showGameOverModal(winnerIndex) {
        const session = this.game.session;
        const snakes = this.game.snakes;
        
        const winnerTextEl = document.getElementById('winnerText');
        const finalScore1El = document.getElementById('finalScore1');
        const finalScore2El = document.getElementById('finalScore2');
        
        if (winnerIndex === -1) {
            winnerTextEl.textContent = '平局！';
        } else {
            const winnerName = session.getPlayerName(winnerIndex);
            winnerTextEl.textContent = `${winnerName} 获胜！`;
        }
        
        finalScore1El.textContent = this.game.scoreManager.calculateScore(snakes[0]);
        finalScore2El.textContent = this.game.scoreManager.calculateScore(snakes[1]);
        
        this.gameOverModal.style.display = 'flex';
    }

    /**
     * 隐藏游戏结束弹窗
     */
    hideGameOverModal() {
        this.gameOverModal.style.display = 'none';
    }

    /**
     * 显示成就解锁通知
     * @param {Achievement} achievement - 成就
     * @param {User} user - 用户
     * @param {number} duration - 显示时长（毫秒）
     */
    showAchievementNotification(achievement, user, duration = 3000) {
        if (!this.achievementNotification) return;
        
        // 清除之前的超时
        if (this.achievementNotificationTimeout) {
            clearTimeout(this.achievementNotificationTimeout);
        }
        
        // 设置通知内容
        const iconEl = this.achievementNotification.querySelector('.achievement-icon');
        const nameEl = this.achievementNotification.querySelector('.achievement-name');
        const descEl = this.achievementNotification.querySelector('.achievement-desc');
        const userEl = this.achievementNotification.querySelector('.achievement-user');
        
        if (iconEl) iconEl.textContent = achievement.icon;
        if (nameEl) nameEl.textContent = achievement.name;
        if (descEl) descEl.textContent = achievement.description;
        if (userEl) userEl.textContent = user.userName;
        
        // 显示通知
        this.achievementNotification.classList.add('show');
        
        // 自动隐藏
        this.achievementNotificationTimeout = setTimeout(() => {
            this.achievementNotification.classList.remove('show');
        }, duration);
    }

    /**
     * 更新按钮状态
     * @param {string} gameState - 游戏状态
     */
    updateButtons(gameState) {
        switch(gameState) {
            case 'ready':
                this.startBtn.disabled = false;
                this.pauseBtn.disabled = true;
                this.resetBtn.disabled = false;
                this.pauseBtn.textContent = '暂停';
                break;
            case 'playing':
                this.startBtn.disabled = true;
                this.pauseBtn.disabled = false;
                this.resetBtn.disabled = false;
                this.pauseBtn.textContent = '暂停';
                break;
            case 'paused':
                this.startBtn.disabled = true;
                this.pauseBtn.disabled = false;
                this.resetBtn.disabled = false;
                this.pauseBtn.textContent = '继续';
                break;
            case 'over':
                this.startBtn.disabled = true;
                this.pauseBtn.disabled = true;
                this.resetBtn.disabled = false;
                break;
        }
    }

    /**
     * 显示状态消息
     * @param {string} message - 消息内容
     */
    showStatusMessage(message) {
        const statusEl = document.getElementById('statusMessage');
        if (statusEl) {
            statusEl.innerHTML = message;
            statusEl.style.display = 'block';
        }
    }

    /**
     * 隐藏状态消息
     */
    hideStatusMessage() {
        const statusEl = document.getElementById('statusMessage');
        if (statusEl) {
            statusEl.style.display = 'none';
        }
    }

    /**
     * 显示重生倒计时
     * @param {number} playerIndex - 玩家索引
     * @param {number} timeLeft - 剩余时间（毫秒）
     * @param {Position} position - 显示位置
     */
    showRespawnTimer(playerIndex, timeLeft, position) {
        const timerId = `respawnTimer${playerIndex + 1}`;
        const timerEl = document.getElementById(timerId);
        if (!timerEl) return;
        
        const seconds = Math.ceil(timeLeft / 1000);
        timerEl.textContent = seconds;
        timerEl.style.display = 'block';
        timerEl.style.left = `${position.x * 16}px`;
        timerEl.style.top = `${position.y * 16}px`;
        
        const snake = this.game.snakes[playerIndex];
        timerEl.style.color = snake ? snake.color.head : '#fff';
    }

    /**
     * 隐藏重生倒计时
     * @param {number} playerIndex - 玩家索引
     */
    hideRespawnTimer(playerIndex) {
        const timerId = `respawnTimer${playerIndex + 1}`;
        const timerEl = document.getElementById(timerId);
        if (timerEl) {
            timerEl.style.display = 'none';
        }
    }
}

export default UIManager;

