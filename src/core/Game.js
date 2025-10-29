import GameConfig from '../config/GameConfig.js';
import GameSession from './GameSession.js';
import Snake from '../entities/Snake.js';
import { Direction } from '../constants/Directions.js';
import FoodSpawner from '../managers/FoodSpawner.js';
import CollisionDetector from '../managers/CollisionDetector.js';
import ScoreManager from '../managers/ScoreManager.js';
import Timer from '../managers/Timer.js';
import RespawnManager from '../managers/RespawnManager.js';
import UserManager from '../managers/UserManager.js';
import AchievementSystem from '../managers/AchievementSystem.js';
import Renderer from '../rendering/Renderer.js';
import UIManager from '../rendering/UIManager.js';
import InputHandler from '../input/InputHandler.js';
import EasyAI from '../ai/EasyAI.js';
import NormalAI from '../ai/NormalAI.js';
import HardAI from '../ai/HardAI.js';

/**
 * 游戏主控制器
 * 协调所有子系统，管理游戏主循环
 */
class Game {
    constructor(canvas) {
        this.config = GameConfig.getInstance();
        this.state = 'ready'; // ready, playing, paused, over
        
        // 初始化系统
        this.session = new GameSession();
        this.userManager = UserManager.getInstance();
        this.collisionDetector = CollisionDetector.getInstance();
        this.scoreManager = new ScoreManager();
        this.timer = new Timer();
        this.foodManager = new FoodSpawner(this);
        this.respawnManager = new RespawnManager(this);
        this.achievementSystem = new AchievementSystem(this);
        this.renderer = new Renderer(canvas);
        this.uiManager = new UIManager(this);
        this.inputHandler = new InputHandler(this);
        
        // 游戏对象
        this.snakes = [];
        this.aiController = null;
        
        // 时间管理
        this.lastUpdate = 0;
        this.animationFrameId = null;
        
        // 初始化
        this.init();
    }

    /**
     * 初始化游戏
     */
    init() {
        // 绑定计时器回调
        this.timer.onTick((timeRemaining) => {
            this.uiManager.updateTimer(timeRemaining);
        });
        
        this.timer.onEnd(() => {
            this.end();
        });
        
        // 绑定输入
        this.inputHandler.bindEvents();
        
        // 调整Canvas大小
        window.addEventListener('resize', () => this.renderer.adjustSize());
        this.renderer.adjustSize();
        
        // 启动渲染循环
        this.startRenderLoop();
    }

    /**
     * 设置游戏会话
     * @param {string} mode - 游戏模式
     * @param {User} user1 - 玩家1
     * @param {User} user2 - 玩家2（可选）
     * @param {string} difficulty - AI难度（可选）
     */
    setupSession(mode, user1, user2 = null, difficulty = 'easy') {
        if (mode === 'ai') {
            this.session.setupSinglePlayer(user1, difficulty);
        } else {
            this.session.setupTwoPlayers(user1, user2);
        }
        
        this.uiManager.updatePlayerNames();
    }

    /**
     * 开始游戏
     */
    start() {
        if (this.state !== 'ready') {
            return;
        }
        if (!this.session.isValid()) {
            alert('请先选择用户！');
            return;
        }
        
        this.state = 'playing';
        
        // 重置单局统计
        if (this.session.player1User) {
            this.session.player1User.stats.resetSession();
        }
        if (this.session.player2User) {
            this.session.player2User.stats.resetSession();
        }
        
        // 初始化蛇
        this.initializeSnakes();
        for (const snake of this.snakes) {
            snake.moveAccumulator = 0;
        }
        
        // 初始化AI
        if (this.session.isAIMode()) {
            this.initializeAI();
        }
        
        // 启动系统
        this.timer.start();
        this.foodManager.startSpawning();
        this.lastUpdate = performance.now();
        
        // 更新UI
        this.uiManager.hideStatusMessage();
        this.uiManager.updateButtons(this.state);
        this.uiManager.updateScores();
        
        // 强制渲染一次以显示游戏画面
        this.renderer.render(this);
    }

    /**
     * 暂停游戏
     */
    pause() {
        if (this.state !== 'playing') return;
        
        this.state = 'paused';
        this.timer.pause();
        this.uiManager.updateButtons(this.state);
        this.uiManager.showStatusMessage('游戏暂停<br>按空格键继续');
    }

    /**
     * 继续游戏
     */
    resume() {
        if (this.state !== 'paused') return;
        
        this.state = 'playing';
        this.timer.resume();
        for (const snake of this.snakes) {
            snake.moveAccumulator = 0;
        }
        this.uiManager.updateButtons(this.state);
        this.uiManager.hideStatusMessage();
    }

    /**
     * 重置游戏
     */
    reset() {
        // 停止所有系统
        this.timer.stop();
        this.foodManager.stopSpawning();
        
        // 重置状态
        this.state = 'ready';
        this.timer.reset();
        this.foodManager.clear();
        this.respawnManager.clear();
        this.achievementSystem.reset();
        
        // 重置游戏对象
        this.snakes = [];
        this.aiController = null;
        
        // 重新初始化蛇
        this.initializeSnakes();
        for (const snake of this.snakes) {
            snake.moveAccumulator = 0;
        }
        
        // 重新初始化AI
        if (this.session.isAIMode()) {
            this.initializeAI();
        }
        
        // 生成初始食物（不启动自动生成，等待start()）
        this.foodManager.spawnFood(5);
        
        // 更新UI
        this.uiManager.updateButtons(this.state);
        this.uiManager.updateScores();
        this.uiManager.updateTimer(this.config.GAME_DURATION);
        this.uiManager.hideGameOverModal();
        this.uiManager.showStatusMessage('准备开始游戏<br>按空格键或点击开始按钮');
        
        // 强制渲染一次
        this.renderer.render(this);
    }

    /**
     * 结束游戏
     */
    end() {
        this.state = 'over';
        this.timer.stop();
        this.foodManager.stopSpawning();
        
        // 确定获胜者
        const winnerIndex = this.scoreManager.determineWinner(this.snakes);

        const notifyUnlocks = (achievements, user) => {
            for (const achievement of achievements) {
                this.uiManager.showAchievementNotification(achievement, user);
            }
        };
        
        // 更新用户统计
        if (this.session.player1User) {
            const user = this.session.player1User;
            const isWin = winnerIndex === 0;
            user.stats.currentGameWon = isWin;
            
            // 检查单局成就（在endGame之前）
            const sessionUnlocks = this.achievementSystem.checkAchievements(user, 'session');
            
            user.stats.endGame(isWin);
            
            // 检查跨局成就
            const cumulativeUnlocks = this.achievementSystem.checkAchievements(user, 'cumulative');

            this.userManager.saveUserData(user);
            notifyUnlocks([...sessionUnlocks, ...cumulativeUnlocks], user);
        }
        
        if (this.session.player2User) {
            const user = this.session.player2User;
            const isWin = winnerIndex === 1;
            user.stats.currentGameWon = isWin;
            
            // 检查单局成就（在endGame之前）
            const sessionUnlocks = this.achievementSystem.checkAchievements(user, 'session');
            
            user.stats.endGame(isWin);
            
            // 检查跨局成就
            const cumulativeUnlocks = this.achievementSystem.checkAchievements(user, 'cumulative');

            this.userManager.saveUserData(user);
            notifyUnlocks([...sessionUnlocks, ...cumulativeUnlocks], user);
        }
        
        // 显示游戏结束界面
        this.uiManager.showGameOverModal(winnerIndex);
        this.uiManager.updateButtons(this.state);
    }

    /**
     * 初始化蛇
     */
    initializeSnakes() {
        this.snakes = [];
        
        // 玩家1
        const snake1 = new Snake(
            5,
            Math.floor(this.config.GRID_SIZE / 2),
            Direction.RIGHT,
            this.config.COLORS.player1,
            this.session.player1User
        );
        this.snakes.push(snake1);
        
        // 玩家2或AI
        const snake2 = new Snake(
            this.config.GRID_SIZE - 6,
            Math.floor(this.config.GRID_SIZE / 2),
            Direction.LEFT,
            this.config.COLORS.player2,
            this.session.player2User
        );
        this.snakes.push(snake2);
    }

    /**
     * 初始化AI
     */
    initializeAI() {
        const difficulty = this.session.aiDifficulty;
        
        switch (difficulty) {
            case 'easy':
                this.aiController = new EasyAI(this);
                break;
            case 'normal':
                this.aiController = new NormalAI(this);
                break;
            case 'hard':
                this.aiController = new HardAI(this);
                break;
            default:
                this.aiController = new EasyAI(this);
        }
    }

    /**
     * 游戏主循环更新
     * @param {number} currentTime - 当前时间戳
     */
    update(currentTime) {
        // 只有playing状态才更新游戏逻辑
        if (this.state !== 'playing') {
            return;
        }
        
        const deltaTime = currentTime - this.lastUpdate;
        this.lastUpdate = currentTime;
        
        // 更新重生管理器
        this.respawnManager.update(deltaTime);
        
        // 更新重生倒计时显示
        this.updateRespawnTimers();
        
        // 蛇移动更新（按个体速度调度）
        const snakesToMove = [];
        for (const snake of this.snakes) {
            if (!snake.isAlive) {
                snake.moveAccumulator = 0;
                continue;
            }

            snake.moveAccumulator += deltaTime;
            const speed = snake.getSpeed();
            if (snake.moveAccumulator >= speed) {
                snakesToMove.push(snake);
                snake.moveAccumulator -= speed;
            }
        }

        if (snakesToMove.length > 0) {
            this.updateSnakes(snakesToMove);
        }
        
        // 更新效果
        for (const snake of this.snakes) {
            if (snake.isAlive) {
                snake.updateEffects(this);
            }
        }
        
        // 检查成就（每秒一次）
        if (Math.floor(currentTime / 1000) !== Math.floor((currentTime - deltaTime) / 1000)) {
            this.checkAchievements();
        }
    }

    /**
     * 更新所有蛇
     */
    updateSnakes(snakesToMove) {
        if (!snakesToMove || snakesToMove.length === 0) {
            return;
        }

        // AI决策
        const aiSnake = this.snakes[1];
        if (this.aiController && aiSnake && aiSnake.isAlive && snakesToMove.includes(aiSnake)) {
            const decision = this.aiController.makeDecision(aiSnake);
            if (decision) {
                aiSnake.changeDirection(decision);
            }
        }
        
        // 移动蛇
        for (const snake of snakesToMove) {
            if (snake.isAlive) {
                snake.move();
            }
        }
        
        // 检测碰撞
        this.handleCollisions();
        
        // 检测吃食物
        this.handleFoodCollision();
        
        // 检查领先状态
        this.checkLeadingStatus();
        
        // 更新UI
        this.uiManager.updateScores();
    }

    /**
     * 处理碰撞
     */
    handleCollisions() {
        const { deadSnakes, collisionTypes } = this.collisionDetector.detectAllCollisions(this.snakes);
        
        for (const index of deadSnakes) {
            const snake = this.snakes[index];
            const deathType = collisionTypes.get(index);
            this.respawnManager.handleDeath(snake, deathType);
        }
    }

    /**
     * 处理吃食物
     */
    handleFoodCollision() {
        for (const snake of this.snakes) {
            if (!snake.isAlive) continue;
            
            const food = this.collisionDetector.checkFoodCollision(snake, this.foodManager.foods);
            if (food) {
                food.onEaten(snake, this);
                this.foodManager.removeFood(food);
            }
        }
    }

    /**
     * 检查成就
     */
    checkAchievements() {
        const newAchievements = this.achievementSystem.checkAllPlayers();
        
        // 显示通知
        for (const {achievement, user} of newAchievements) {
            this.uiManager.showAchievementNotification(achievement, user);
        }
    }

    /**
     * 更新重生倒计时显示
     */
    updateRespawnTimers() {
        for (let i = 0; i < this.snakes.length; i++) {
            const snake = this.snakes[i];
            if (!snake.isAlive) {
                const timeLeft = this.respawnManager.getRespawnTimeLeft(snake);
                if (timeLeft > 0 && snake.respawnPosition) {
                    this.uiManager.showRespawnTimer(i, timeLeft, snake.respawnPosition);
                } else {
                    this.uiManager.hideRespawnTimer(i);
                }
            } else {
                this.uiManager.hideRespawnTimer(i);
            }
        }
    }

    /**
     * 检查分数领先状态（用于成就系统）
     */
    checkLeadingStatus() {
        if (this.snakes.length < 2) return;
        
        const score1 = this.scoreManager.calculateScore(this.snakes[0]);
        const score2 = this.scoreManager.calculateScore(this.snakes[1]);
        
        // 玩家1失去领先
        if (score2 > score1 && this.session.player1User) {
            this.session.player1User.stats.markLostLeading();
        }
        
        // 玩家2失去领先
        if (score1 > score2 && this.session.player2User) {
            this.session.player2User.stats.markLostLeading();
        }
    }

    /**
     * 渲染循环
     * @param {number} time - 时间戳
     */
    renderLoop(time) {
        // 更新游戏逻辑
        this.update(time);
        
        // 渲染画面
        this.renderer.render(this);
        
        // 继续循环
        this.animationFrameId = requestAnimationFrame((t) => this.renderLoop(t));
    }

    /**
     * 启动渲染循环
     */
    startRenderLoop() {
        this.animationFrameId = requestAnimationFrame((t) => this.renderLoop(t));
    }

    /**
     * 停止渲染循环
     */
    stopRenderLoop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * 检查是否暂停
     * @returns {boolean}
     */
    isPaused() {
        return this.state !== 'playing';
    }

    /**
     * 清理资源
     */
    destroy() {
        this.stopRenderLoop();
        this.timer.stop();
        this.foodManager.stopSpawning();
        this.inputHandler.unbindEvents();
    }
}

export default Game;

