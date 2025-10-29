/**
 * 主入口文件
 * 初始化游戏和UI
 */

import Game from './src/core/Game.js';
import UserManager from './src/managers/UserManager.js';

class GameApp {
    constructor() {
        this.game = null;
        this.userManager = UserManager.getInstance();
        this.selectedUsers = {
            player1: null,
            player2: null
        };
        this.gameMode = '2players';
        this.aiDifficulty = 'easy';
        
        this.initializeUI();
        this.bindEvents();
        this.showUserSelectModal();
    }

    /**
     * 初始化UI元素
     */
    initializeUI() {
        // 模态窗口
        this.userSelectModal = document.getElementById('userSelectModal');
        this.createUserModal = document.getElementById('createUserModal');
        this.achievementModal = document.getElementById('achievementModal');
        this.gameOverModal = document.getElementById('gameOverModal');
        this.gameContainer = document.getElementById('gameContainer');
        
        // 用户选择相关
        this.player1Select = document.getElementById('player1Select');
        this.player2Select = document.getElementById('player2Select');
        this.player2SelectContainer = document.getElementById('player2SelectContainer');
        this.userList = document.getElementById('userList');
        this.newUserNameInput = document.getElementById('newUserName');
        
        // 按钮
        this.createUserBtn = document.getElementById('createUserBtn');
        this.confirmUserBtn = document.getElementById('confirmUserBtn');
        this.cancelCreateBtn = document.getElementById('cancelCreateBtn');
        this.confirmCreateBtn = document.getElementById('confirmCreateBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.changeUserBtn = document.getElementById('changeUserBtn');
        this.achievementBtn = document.getElementById('achievementBtn');
        this.achievementCloseBtn = document.getElementById('achievementCloseBtn');
        
        // 模式和难度按钮
        this.modeBtns = document.querySelectorAll('.mode-btn');
        this.difficultyBtns = document.querySelectorAll('.difficulty-btn');
        this.difficultySelector = document.getElementById('difficultySelector');
        
        // 游戏控制按钮
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 游戏控制按钮
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => {
                if (this.game) {
                    this.game.start();
                }
            });
        }
        
        if (this.pauseBtn) {
            this.pauseBtn.addEventListener('click', () => {
                if (this.game) {
                    if (this.game.state === 'playing') {
                        this.game.pause();
                    } else if (this.game.state === 'paused') {
                        this.game.resume();
                    }
                }
            });
        }
        
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => {
                if (this.game) {
                    this.game.reset();
                }
            });
        }
        // 模式选择
        this.modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.gameMode = btn.dataset.mode;
                
                if (this.gameMode === 'ai') {
                    this.difficultySelector.style.display = 'block';
                    this.player2SelectContainer.style.display = 'none';
                } else {
                    this.difficultySelector.style.display = 'none';
                    this.player2SelectContainer.style.display = 'block';
                }
            });
        });

        // 难度选择
        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.aiDifficulty = btn.dataset.difficulty;
            });
        });

        // 创建用户
        this.createUserBtn.addEventListener('click', () => {
            this.showCreateUserModal();
        });

        this.confirmCreateBtn.addEventListener('click', () => {
            this.createUser();
        });

        this.cancelCreateBtn.addEventListener('click', () => {
            this.hideCreateUserModal();
        });

        // 确认开始游戏
        this.confirmUserBtn.addEventListener('click', () => {
            this.startGame();
        });

        // 重新开始
        this.restartBtn.addEventListener('click', () => {
            this.game.reset();
            this.gameOverModal.style.display = 'none';
        });

        // 切换用户
        this.changeUserBtn.addEventListener('click', () => {
            this.showUserSelectModal();
            this.game.destroy();
            this.game = null;
        });

        // 成就面板
        this.achievementBtn.addEventListener('click', () => {
            this.showAchievementModal();
        });

        this.achievementCloseBtn.addEventListener('click', () => {
            this.hideAchievementModal();
        });

        // 成就筛选
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterAchievements(btn.dataset.filter);
            });
        });

        // Enter键创建用户
        this.newUserNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.createUser();
            }
        });
    }

    /**
     * 显示用户选择弹窗
     */
    showUserSelectModal() {
        this.updateUserSelects();
        this.updateUserList();
        this.userSelectModal.style.display = 'flex';
        this.gameContainer.style.display = 'none';
    }

    /**
     * 隐藏用户选择弹窗
     */
    hideUserSelectModal() {
        this.userSelectModal.style.display = 'none';
        
        // 确保游戏界面可见
        if (this.gameContainer) {
            this.gameContainer.style.display = 'flex';
        }
    }

    /**
     * 更新用户下拉列表
     */
    updateUserSelects() {
        const users = this.userManager.getAllUserSummaries();
        
        // 清空并重新填充
        this.player1Select.innerHTML = '<option value="">-- 选择用户 --</option>';
        this.player2Select.innerHTML = '<option value="">-- 选择用户 --</option>';
        
        users.forEach(user => {
            const option1 = document.createElement('option');
            option1.value = user.userId;
            option1.textContent = `${user.userName} (Lv.${user.level})`;
            this.player1Select.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = user.userId;
            option2.textContent = `${user.userName} (Lv.${user.level})`;
            this.player2Select.appendChild(option2);
        });
    }

    /**
     * 更新用户列表显示
     */
    updateUserList() {
        const users = this.userManager.getAllUserSummaries();
        this.userList.innerHTML = '';
        
        if (users.length === 0) {
            this.userList.innerHTML = '<p style="text-align:center;opacity:0.6;">暂无用户，请创建新用户</p>';
            return;
        }

        users.forEach(user => {
            const card = document.createElement('div');
            card.className = 'user-card';
            card.innerHTML = `
                <div class="user-card-name">${user.userName}</div>
                <div class="user-card-stats">
                    等级: ${user.level}<br>
                    胜率: ${user.winRate}%<br>
                    成就: ${user.achievementProgress}%
                </div>
                <div class="user-card-actions">
                    <button class="btn-secondary" onclick="window.selectUser('${user.userId}', 1)">选为P1</button>
                    ${this.gameMode === '2players' ? `<button class="btn-secondary" onclick="window.selectUser('${user.userId}', 2)">选为P2</button>` : ''}
                    <button class="btn-secondary" style="background:#f44336;" onclick="window.deleteUser('${user.userId}')">删除</button>
                </div>
            `;
            this.userList.appendChild(card);
        });
    }

    /**
     * 选择用户
     */
    selectUser(userId, player) {
        if (player === 1) {
            this.player1Select.value = userId;
        } else if (player === 2) {
            this.player2Select.value = userId;
        }
    }

    /**
     * 删除用户
     */
    deleteUser(userId) {
        if (confirm('确定要删除这个用户吗？所有数据将丢失！')) {
            this.userManager.deleteUser(userId);
            this.updateUserSelects();
            this.updateUserList();
        }
    }

    /**
     * 显示创建用户弹窗
     */
    showCreateUserModal() {
        this.newUserNameInput.value = '';
        this.createUserModal.style.display = 'flex';
    }

    /**
     * 隐藏创建用户弹窗
     */
    hideCreateUserModal() {
        this.createUserModal.style.display = 'none';
    }

    /**
     * 创建用户
     */
    createUser() {
        const userName = this.newUserNameInput.value.trim();
        
        if (!userName) {
            alert('请输入用户名');
            return;
        }

        if (!this.userManager.isUserNameAvailable(userName)) {
            alert('用户名已存在，请使用其他名称');
            return;
        }

        try {
            this.userManager.createUser(userName);
            this.hideCreateUserModal();
            this.updateUserSelects();
            this.updateUserList();
            alert(`用户 "${userName}" 创建成功！`);
        } catch (error) {
            alert('创建用户失败：' + error.message);
        }
    }

    /**
     * 开始游戏
     */
    startGame() {
        const player1UserId = this.player1Select.value;
        
        if (!player1UserId) {
            alert('请选择玩家1');
            return;
        }

        const player1User = this.userManager.getUser(player1UserId);
        let player2User = null;

        if (this.gameMode === '2players') {
            const player2UserId = this.player2Select.value;
            if (!player2UserId) {
                alert('请选择玩家2');
                return;
            }
            if (player1UserId === player2UserId) {
                alert('请选择不同的玩家');
                return;
            }
            player2User = this.userManager.getUser(player2UserId);
        }

        // 初始化游戏
        if (!this.game) {
            const canvas = document.getElementById('gameCanvas');
            this.game = new Game(canvas);
        }

        // 设置游戏会话
        this.game.setupSession(this.gameMode, player1User, player2User, this.aiDifficulty);

        // 隐藏用户选择，显示游戏界面
        this.hideUserSelectModal();
        
        // 重置游戏到准备状态
        this.game.reset();
        
        // 确保游戏界面可见
        this.gameContainer.style.display = 'flex';
        
        // 强制渲染一次
        if (this.game && this.game.renderer) {
            this.game.renderer.render(this.game);
        }
    }

    /**
     * 显示成就面板
     */
    showAchievementModal() {
        // 获取当前玩家的成就
        let user = null;
        let userName = '';
        
        if (this.game && this.game.session) {
            // 双人模式：让用户选择查看哪个玩家的成就
            if (this.game.session.isTwoPlayerMode() && 
                this.game.session.player1User && 
                this.game.session.player2User) {
                const choice = confirm(
                    `查看哪个玩家的成就？\n确定 = ${this.game.session.player1User.userName}\n取消 = ${this.game.session.player2User.userName}`
                );
                user = choice ? this.game.session.player1User : this.game.session.player2User;
            } else if (this.game.session.player1User) {
                user = this.game.session.player1User;
            }
        }
        
        // 如果游戏未开始，显示第一个用户的成就
        if (!user) {
            const users = this.userManager.getAllUsers();
            if (users.length > 0) {
                user = users[0];
            }
        }

        if (!user) {
            alert('请先创建用户');
            return;
        }

        this.currentAchievementUser = user;
        this.displayAchievements(user);
        this.achievementModal.style.display = 'flex';
    }

    /**
     * 隐藏成就面板
     */
    hideAchievementModal() {
        this.achievementModal.style.display = 'none';
    }

    /**
     * 显示成就列表
     */
    displayAchievements(user) {
        // 更新统计
        const total = user.achievements.length;
        const unlocked = user.getUnlockedAchievements().length;
        const progress = user.getAchievementProgress();

        document.getElementById('totalAchievements').textContent = total;
        document.getElementById('unlockedAchievements').textContent = unlocked;
        document.getElementById('achievementProgress').textContent = progress + '%';

        // 显示成就列表
        this.renderAchievementList(user, 'all');
    }

    /**
     * 渲染成就列表
     */
    renderAchievementList(user, filter = 'all') {
        const achievementList = document.getElementById('achievementList');
        achievementList.innerHTML = '';

        let achievements = user.achievements;

        // 应用筛选
        if (filter === 'unlocked') {
            achievements = user.getUnlockedAchievements();
        } else if (filter === 'locked') {
            achievements = user.getLockedAchievements();
        } else if (filter === 'cumulative') {
            achievements = achievements.filter(a => a.type === 'cumulative');
        } else if (filter === 'session') {
            achievements = achievements.filter(a => a.type === 'session');
        }

        achievements.forEach(achievement => {
            const item = document.createElement('div');
            item.className = `achievement-item ${achievement.unlocked ? 'unlocked' : ''}`;
            
            const progress = achievement.getProgressInfo(user.stats);
            
            item.innerHTML = `
                <div class="achievement-item-icon">${achievement.icon}</div>
                <div class="achievement-item-info">
                    <div class="achievement-item-name">
                        ${achievement.name}
                        ${achievement.unlocked ? '✓' : ''}
                    </div>
                    <div class="achievement-item-desc">${achievement.description}</div>
                    ${!achievement.unlocked ? `
                        <div class="achievement-item-progress">
                            进度: ${progress.current}/${progress.target} (${progress.percentage}%)
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                        </div>
                    ` : `
                        <div class="achievement-item-progress" style="color: #4caf50;">
                            ✓ 已解锁于 ${new Date(achievement.unlockedAt).toLocaleDateString()}
                        </div>
                    `}
                </div>
            `;
            
            achievementList.appendChild(item);
        });

        if (achievements.length === 0) {
            achievementList.innerHTML = '<p style="text-align:center;opacity:0.6;padding:2rem;">暂无成就</p>';
        }
    }

    /**
     * 筛选成就
     */
    filterAchievements(filter) {
        // 使用当前查看的用户
        const user = this.currentAchievementUser;
        if (user) {
            this.renderAchievementList(user, filter);
        }
    }
}

// 全局工具函数供HTML中使用
window.selectUser = (userId, player) => {
    if (window.app) {
        window.app.selectUser(userId, player);
    }
};

window.deleteUser = (userId) => {
    if (window.app) {
        window.app.deleteUser(userId);
    }
};

// 创建全局应用实例（用于HTML中的onclick调用）
window.app = new GameApp();

// 导出以供其他模块使用
export default GameApp;