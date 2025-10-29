import { Direction } from '../constants/Directions.js';

/**
 * 输入处理器
 * 处理键盘输入和虚拟按键
 */
class InputHandler {
    constructor(game) {
        this.game = game;
        this.keyBindings = {
            player1: {
                'w': Direction.UP,
                'a': Direction.LEFT,
                's': Direction.DOWN,
                'd': Direction.RIGHT
            },
            player2: {
                'ArrowUp': Direction.UP,
                'ArrowLeft': Direction.LEFT,
                'ArrowDown': Direction.DOWN,
                'ArrowRight': Direction.RIGHT
            }
        };
        this.boundHandlers = {};
    }

    /**
     * 绑定所有事件监听器
     */
    bindEvents() {
        // 键盘事件
        this.boundHandlers.keydown = (e) => this.handleKeyDown(e);
        document.addEventListener('keydown', this.boundHandlers.keydown);
        
        // 防止页面滚动
        this.boundHandlers.preventDefault = (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd'].includes(e.key)) {
                e.preventDefault();
            }
        };
        document.addEventListener('keydown', this.boundHandlers.preventDefault);
        
        // 虚拟按键
        this.bindVirtualButtons();
    }

    /**
     * 解绑所有事件监听器
     */
    unbindEvents() {
        if (this.boundHandlers.keydown) {
            document.removeEventListener('keydown', this.boundHandlers.keydown);
        }
        if (this.boundHandlers.preventDefault) {
            document.removeEventListener('keydown', this.boundHandlers.preventDefault);
        }
    }

    /**
     * 处理键盘按下
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        
        // 空格键：开始/暂停
        if (e.key === ' ') {
            e.preventDefault();
            if (this.game.state === 'ready') {
                this.game.start();
            } else if (this.game.state === 'playing') {
                this.game.pause();
            } else if (this.game.state === 'paused') {
                this.game.resume();
            }
            return;
        }
        
        // 只在游戏进行中处理移动指令
        if (this.game.state !== 'playing') return;
        
        // 玩家1控制（WASD）
        const player1Dir = this.keyBindings.player1[key];
        if (player1Dir && this.game.snakes[0] && this.game.snakes[0].isAlive) {
            this.game.snakes[0].changeDirection(player1Dir);
        }
        
        // 玩家2控制（方向键）- 仅在双人模式
        if (this.game.session.isTwoPlayerMode()) {
            const player2Dir = this.keyBindings.player2[e.key];
            if (player2Dir && this.game.snakes[1] && this.game.snakes[1].isAlive) {
                this.game.snakes[1].changeDirection(player2Dir);
            }
        }
    }

    /**
     * 绑定虚拟按键事件
     */
    bindVirtualButtons() {
        const virtualBtns = document.querySelectorAll('.control-btn-virtual');
        
        for (const btn of virtualBtns) {
            if (btn.classList.contains('btn-center')) continue;
            
            // 触摸开始
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                
                // 视觉反馈
                btn.style.background = 'rgba(187, 134, 252, 0.8)';
                btn.style.color = '#121212';
                btn.style.transform = 'scale(0.95)';
                
                // 触觉反馈
                if ('vibrate' in navigator) {
                    navigator.vibrate(50);
                }
                
                // 处理按键
                this.handleVirtualButton(btn.dataset.key);
            }, { passive: false });
            
            // 触摸结束
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                btn.style.background = '';
                btn.style.color = '';
                btn.style.transform = '';
            }, { passive: false });
        }
    }

    /**
     * 处理虚拟按键
     * @param {string} key - 按键值
     */
    handleVirtualButton(key) {
        // 模拟键盘事件
        this.handleKeyDown({ key, preventDefault: () => {} });
    }
}

export default InputHandler;

