# 🐍 蛇对蛇对战游戏 (Snake vs Snake)

<div align="center">

![Game Version](https://img.shields.io/badge/version-2.0-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-ES6-orange.svg)
![License](https://img.shields.io/badge/license-CC%20BY--NC%204.0-green.svg)
![Platform](https://img.shields.io/badge/platform-Desktop-lightgrey.svg)

一款基于原生 HTML5 + ES6 模块开发的桌面端贪吃蛇对战游戏  
支持双人对战与人机对战，包含多种特殊道具与完整的成就系统

[快速开始](#-快速开始) • [游戏特色](#-游戏特色) • [技术架构](#-技术架构) • [开发指南](#-开发指南)

</div>

---

## 📋 目录

- [游戏简介](#-游戏简介)
- [游戏特色](#-游戏特色)
- [快速开始](#-快速开始)
- [游戏玩法](#-游戏玩法)
- [技术架构](#-技术架构)
- [项目结构](#-项目结构)
- [开发指南](#-开发指南)
- [扩展指南](#-扩展指南)
- [贡献指南](#-贡献指南)
- [许可证](#-许可证)

---

## 🎮 游戏简介

本项目是一款**面向对象设计**的贪吃蛇对战游戏，采用纯前端技术栈开发。游戏在 32×32 的固定地图上展开激烈竞技，玩家需要通过控制蛇的移动方向来收集豆子、增长蛇身、累积分数，并在 2 分钟的限时内获得更多得分赢得胜利。

### 核心亮点

- 🎯 **双人对战** - 本地双人同屏竞技
- 🤖 **AI对战** - 三种难度的智能AI对手
- 🎁 **特殊道具** - 加速、超级、磁铁、地雷等特殊豆子
- 🏆 **成就系统** - 40+ 种成就，跨局累积与单局挑战
- 👤 **用户系统** - 多用户管理，数据持久化
- 🎨 **流畅动画** - 基于 requestAnimationFrame 的流畅渲染
- 📱 **响应式设计** - 适配不同屏幕尺寸

---

## ✨ 游戏特色

### 🎯 游戏模式

| 模式 | 说明 | 操作 |
|------|------|------|
| **双人对战** | 玩家1 vs 玩家2 本地同屏对战 | 玩家1: WASD / 玩家2: 方向键 |
| **AI对战** | 玩家 vs AI，支持简单/普通/困难三种难度 | 玩家: WASD / AI: 自动控制 |

### 🎁 特殊道具

| 道具 | 概率 | 效果 |
|------|------|------|
| 🟢 普通豆子 | 80% | 蛇身长度 +1 |
| ⚡ 加速豆子 | 5% | 移动速度翻倍（持续效果） |
| ⭐ 超级豆子 | 5% | 累积吃豆数 +5，蛇身长度只 +1 |
| 🧲 磁铁豆子 | 5% | 20秒内吸取九宫格范围内所有豆子 |
| 💣 地雷 | 5% | 碰到立即死亡 |

### 🏆 成就系统

#### 跨局累积成就
- **远行者系列** - 累积移动 100/300/1000/3000/10000 格
- **美食家系列** - 累积吃豆 50/100/300/500/1000/3000 颗
- **特殊美食系列** - 累积吃特定类型豆子 10/30/50/100 颗
- **拆弹专家** - 累积触碰地雷 10/30/50 次
- **不屈者系列** - 累积死亡 10/30/50/100 次
- **胜利之星** - 累积获胜 10/30/50/100 局
- 等等...

#### 单局成就
- **大胃王** - 单局吃豆 20/30/40/50 颗
- **巨蟒** - 单局最大长度 20/30/40/50 节
- **完美生存** - 单局不死亡且获胜
- **闪电战** - 开局60秒内达到15节长度
- **磁力大师** - 单局通过磁铁吸取30颗豆子
- 等等...

### 💀 死亡与重生机制

- **死亡触发** - 撞墙、撞自身、对撞（双方同时死亡）、触碰地雷
- **死亡掉落** - 每3节身体掉落1颗普通豆子（向下取整），随机散落
- **重生规则** - 2秒后在安全位置重生，恢复初始长度（3节）

### 📊 计分规则

```
总分 = 累积吃豆数 × 50 + 蛇身长度 × 100
```

---

## 🚀 快速开始

### 环境要求

- 现代浏览器（支持 ES6 模块）
  - Chrome 61+
  - Firefox 60+
  - Safari 11+
  - Edge 16+
- 本地 HTTP 服务器（必需，因为使用 ES6 模块）

### 安装与运行

#### 方式一：使用 VS Code Live Server

1. 克隆项目
```bash
git clone https://github.com/Qccccc512/snake2snake.git
cd snake2snake
```

2. 使用 VS Code 打开项目

3. 安装 Live Server 插件

4. 右键 `index.html` → "Open with Live Server"

#### 方式二：使用 Python HTTP 服务器

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

然后在浏览器中访问 `http://localhost:8000`

#### 方式三：使用 Node.js http-server

```bash
# 安装 http-server
npm install -g http-server

# 启动服务器
http-server -p 8000
```

---

## 🎯 游戏玩法

### 基本操作

| 玩家 | 控制键 | 功能 |
|------|--------|------|
| 玩家1 | W/A/S/D | 上/左/下/右移动 |
| 玩家2 | ↑/←/↓/→ | 上/左/下/右移动 |
| 通用 | 空格键 | 暂停/继续游戏 |

### 游戏流程

1. **选择用户** - 创建或选择已有用户账号
2. **选择模式** - 双人对战 或 AI对战（选择难度）
3. **开始游戏** - 点击"开始游戏"按钮
4. **控制蛇** - 使用对应按键控制蛇的移动方向
5. **收集豆子** - 吃豆子增长蛇身和得分
6. **避免死亡** - 避免撞墙、撞自身、对撞、触碰地雷
7. **游戏结束** - 2分钟倒计时结束，得分高者获胜

### 游戏界面

```
┌─────────────────────────────────────┐
│ 玩家1: xxx  分数: 1500  时间: 1:30  │ ← 顶部信息栏
│ 玩家2: xxx  分数: 1200              │
├─────────────────────────────────────┤
│                                     │
│        🐍 ← 玩家1（蓝色）           │
│                                     │
│   🟢 ⚡ 💣 ← 豆子                   │
│                                     │
│        🐍 ← 玩家2（红色）           │
│                                     │
├─────────────────────────────────────┤
│ [开始] [暂停] [重置] [成就] [换人] │ ← 控制按钮
└─────────────────────────────────────┘
```

---

## 🏗️ 技术架构

### 技术栈

- **前端框架** - 原生 HTML5 + CSS3
- **JavaScript** - ES6 模块化
- **渲染引擎** - Canvas 2D API + requestAnimationFrame
- **数据存储** - localStorage
- **模块化** - ES6 Import/Export
- **设计模式** - 单例、策略、工厂、观察者

### 架构设计

项目采用**面向对象设计（OOD）**，基于**需求分析与用例建模**构建核心业务逻辑。

```
┌─────────────────────────────────────────────┐
│              Presentation Layer             │
│  (Renderer, UIManager, InputHandler)        │
├─────────────────────────────────────────────┤
│              Control Layer                  │
│    (Game, Timer, GameSession)               │
├─────────────────────────────────────────────┤
│              Business Logic Layer           │
│  (CollisionDetector, FoodSpawner,           │
│   RespawnManager, ScoreManager,             │
│   AchievementSystem)                        │
├─────────────────────────────────────────────┤
│              Entity Layer                   │
│  (Snake, Food, SnakeEffect)                 │
├─────────────────────────────────────────────┤
│              AI Strategy Layer              │
│  (AIController, EasyAI, NormalAI, HardAI)   │
├─────────────────────────────────────────────┤
│              Data Layer                     │
│  (User, GameStats, Achievement,             │
│   UserManager)                              │
├─────────────────────────────────────────────┤
│              Foundation Layer               │
│  (Position, Direction, GameConfig)          │
└─────────────────────────────────────────────┘
```

### 核心设计模式

| 模式 | 应用场景 | 实现类 |
|------|----------|--------|
| **单例模式** | 全局唯一实例 | `GameConfig`, `CollisionDetector`, `ScoreManager`, `UserManager` |
| **策略模式** | 不同AI策略 | `AIController` → `EasyAI`, `NormalAI`, `HardAI` |
| **策略模式** | 不同食物效果 | `Food` → `NormalFood`, `SpeedFood`, `SuperFood`, `MineFood`, `MagnetFood` |
| **工厂模式** | 食物创建 | `FoodFactory` |
| **状态模式** | 游戏状态管理 | `Game` (ready → playing ⇄ paused → over) |
| **观察者模式** | 成就系统 | `AchievementSystem` 监听 `GameStats` |

---

## 📁 项目结构

```
hw1/
├── index.html                 # 主HTML文件
├── main.js                    # 主入口文件
├── styles.css                 # 样式文件
├── README.md                  # 本文档
├── .github/
│   └── copilot-instructions.md  # AI助手开发指南
├── src/                       # 源代码目录
│   ├── ai/                    # AI控制器
│   │   ├── AIController.js    # AI抽象基类
│   │   ├── EasyAI.js          # 简单AI
│   │   ├── NormalAI.js        # 普通AI
│   │   ├── HardAI.js          # 困难AI
│   │   └── PathFinder.js      # 路径搜索算法
│   ├── config/
│   │   └── GameConfig.js      # 游戏配置（单例）
│   ├── constants/
│   │   └── Directions.js      # 方向常量
│   ├── core/                  # 核心控制层
│   │   ├── Game.js            # 游戏主控制器（主动对象）
│   │   ├── GameSession.js     # 游戏会话管理
│   │   └── User.js            # 用户模型
│   ├── entities/              # 游戏实体
│   │   ├── Snake.js           # 蛇实体
│   │   ├── SnakeEffect.js     # 蛇特效抽象类
│   │   └── food/              # 食物实体
│   │       ├── Food.js        # 食物抽象类
│   │       ├── NormalFood.js  # 普通豆子
│   │       ├── SpeedFood.js   # 加速豆子
│   │       ├── SuperFood.js   # 超级豆子
│   │       ├── MineFood.js    # 地雷
│   │       └── MagnetFood.js  # 磁铁豆子
│   ├── input/
│   │   └── InputHandler.js    # 输入处理
│   ├── managers/              # 业务逻辑层
│   │   ├── AchievementSystem.js      # 成就系统
│   │   ├── CollisionDetector.js      # 碰撞检测（单例）
│   │   ├── FoodFactory.js            # 食物工厂
│   │   ├── FoodSpawner.js            # 食物刷新器
│   │   ├── RespawnManager.js         # 重生管理器
│   │   ├── ScoreManager.js           # 计分管理器（单例）
│   │   ├── Timer.js                  # 计时器
│   │   └── UserManager.js            # 用户管理器（单例）
│   ├── models/                # 数据模型
│   │   ├── Achievement.js     # 成就模型
│   │   ├── GameStats.js       # 游戏统计
│   │   └── Position.js        # 位置值对象
│   └── rendering/             # 渲染层
│       ├── Renderer.js        # Canvas渲染器
│       └── UIManager.js       # UI管理器
├── 报告/                      # 项目报告
│   ├── 报告.txt               # 需求分析报告
│   ├── snake_usecase.puml     # 用例图
│   ├── class_diagram.puml     # 类图
│   ├── class_diagram_说明.md  # 类图说明
│   ├── 类图合理性检查报告.md   # 检查报告
│   └── 类图第二次检查报告.md   # 优化报告
└── 文档/                      # 开发文档
    ├── ARCHITECTURE.md        # 架构设计文档
    └── PROJECT_OVERVIEW.md    # 项目概览
```

---

## 🛠️ 开发指南

### 核心类说明

#### Game (核心控制器)

游戏的主动对象，协调所有子系统。

```javascript
class Game {
    // 状态机：ready → playing ⇄ paused → over
    start()    // UC4: 开始游戏
    pause()    // UC5: 暂停游戏
    resume()   // UC5: 继续游戏
    reset()    // UC6: 重置游戏
    end()      // 结束游戏
    update()   // UC8: 游戏主循环
}
```

#### Snake (蛇实体)

```javascript
class Snake {
    move()                    // UC7: 移动
    changeDirection(dir)      // 改变方向
    die(type)                 // UC10: 死亡
    respawn(pos, dir)         // UC10: 重生
    addEffect(effect)         // 添加特效
    updateEffects(game)       // 更新特效状态
}
```

#### CollisionDetector (碰撞检测)

单例模式，全局统一的碰撞检测。

```javascript
class CollisionDetector {
    checkWallCollision(snake)           // UC19: 撞墙检测
    checkSelfCollision(snake)           // UC19: 撞自身检测
    checkHeadToHeadCollision(s1, s2)    // UC19: 对撞检测
    checkFoodCollision(snake, foods)    // 食物碰撞检测
}
```

#### AIController (AI策略)

策略模式，不同难度的AI实现。

```javascript
abstract class AIController {
    makeDecision(snake, game)  // UC22: AI决策
}

class EasyAI extends AIController {
    // 简单策略：随机移动 + 基本躲避
}

class NormalAI extends AIController {
    // 中等策略：贪心算法 + 空间评估
}

class HardAI extends AIController {
    // 困难策略：路径规划 + 对手预测
}
```

### 游戏配置

所有游戏参数都在 `GameConfig.js` 中统一管理：

```javascript
const config = GameConfig.getInstance();

// 地图配置
config.GRID_SIZE = 32;        // 32×32 网格
config.CELL_SIZE = 20;        // 每格20像素

// 蛇的配置
config.INITIAL_LENGTH = 3;    // 初始长度3节
config.SNAKE_SPEED = 10;      // 移动速度（格/秒）

// 游戏配置
config.GAME_DURATION = 120;   // 2分钟倒计时
config.RESPAWN_DELAY = 2000;  // 2秒重生延迟

// 食物配置
config.MAX_FOOD = 20;         // 最多20颗豆子
config.FOOD_SPAWN_COUNT = 2;  // 每秒刷新2颗
config.FOOD_PROBABILITIES = {
    normal: 80,  // 普通豆子 80%
    speed: 5,    // 加速豆子 5%
    super: 5,    // 超级豆子 5%
    mine: 5,     // 地雷 5%
    magnet: 5    // 磁铁豆子 5%
};

// 计分配置
config.SCORE_PER_FOOD = 50;   // 每颗豆子50分
config.SCORE_PER_LENGTH = 100; // 每节蛇身100分
```

### 调试技巧

#### 浏览器控制台

```javascript
// 查看游戏对象
window.app.game

// 查看用户管理器
window.app.userManager

// 查看localStorage数据
JSON.parse(localStorage.getItem('snake_game_users'))

// 清除所有用户数据
UserManager.getInstance().clearAllUsers()

// 修改游戏配置（仅当前会话）
GameConfig.getInstance().SNAKE_SPEED = 15
```

#### 常见陷阱

⚠️ **切勿直接实例化单例类**
```javascript
// ❌ 错误
const config = new GameConfig();

// ✅ 正确
const config = GameConfig.getInstance();
```

⚠️ **食物创建必须通过工厂**
```javascript
// ❌ 错误
const food = new SpeedFood(position);

// ✅ 正确
const food = foodFactory.createFoodByType('speed', position);
```

⚠️ **修改Game.state时同步UI**
```javascript
// ❌ 错误
this.state = 'playing';

// ✅ 正确
this.state = 'playing';
this.uiManager.updateButtons(this.state);
this.uiManager.hideStatusMessage();
```

---

## 🔧 扩展指南

### 添加新的特殊豆子

#### 1. 创建食物类

```javascript
// src/entities/food/CustomFood.js
import Food from './Food.js';

class CustomFood extends Food {
    constructor(position) {
        super(position, 'custom');
    }
    
    onEaten(snake, game) {
        // 实现自定义效果
        snake.foodEaten++;
        snake.grow++;
        
        // 记录统计
        if (snake.user) {
            snake.user.stats.recordFoodEaten('custom');
        }
        
        // 更新分数
        game.uiManager.updateScores();
    }
}

export default CustomFood;
```

#### 2. 在工厂中注册

```javascript
// src/managers/FoodFactory.js
import CustomFood from '../entities/food/CustomFood.js';

createFoodByType(type, position) {
    switch (type) {
        // ... 其他类型
        case 'custom':
            return new CustomFood(position);
        default:
            return new NormalFood(position);
    }
}
```

#### 3. 修改概率配置

```javascript
// src/config/GameConfig.js
FOOD_PROBABILITIES = {
    normal: 75,   // 调低普通豆子
    speed: 5,
    super: 5,
    mine: 5,
    magnet: 5,
    custom: 5     // 新增自定义豆子
    // 总和必须为 100
}
```

### 添加新的AI难度

#### 1. 创建AI类

```javascript
// src/ai/ExpertAI.js
import AIController from './AIController.js';

class ExpertAI extends AIController {
    constructor(game) {
        super(game, 'expert');
    }
    
    makeDecision(snake, game) {
        // 实现专家级AI策略
        // 例如：深度学习、蒙特卡洛树搜索等
        
        return direction; // 返回Direction对象
    }
}

export default ExpertAI;
```

#### 2. 在Game中注册

```javascript
// src/core/Game.js
initializeAI() {
    const difficulty = this.session.difficulty;
    
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
        case 'expert':  // 新增
            this.aiController = new ExpertAI(this);
            break;
    }
}
```

#### 3. 添加UI选项

```html
<!-- index.html -->
<button class="difficulty-btn" data-difficulty="expert">
    <span class="difficulty-name">专家</span>
    <span class="difficulty-desc">神级操作，无情碾压</span>
</button>
```

### 添加新的成就

```javascript
// src/managers/AchievementSystem.js
this.achievements = [
    // ... 现有成就
    {
        id: 'custom_achievement',
        name: '自定义成就',
        description: '完成某个特定条件',
        type: 'session',  // 或 'cumulative'
        requirement: 10,
        checkCondition: (user) => {
            return user.stats.某个统计数据 >= this.requirement;
        }
    }
];
```

---

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 贡献流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 使用 ES6+ 语法
- 遵循面向对象设计原则
- 保持单一职责原则
- 添加必要的注释
- 遵循现有的代码风格

### 提交规范

```
feat: 添加新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具链相关
```

---

## 📄 许可证

本项目采用 **CC BY-NC 4.0**（知识共享 署名-非商业性使用 4.0 国际）许可协议。

### 许可说明

✅ **允许：**
- 共享 - 复制、发行本作品
- 演绎 - 修改、转换或二次创作
- 私人使用和学习

❌ **禁止：**
- 商业使用 - 不得将本作品用于商业目的

📋 **要求：**
- 署名 - 必须给出适当的署名
- 标明修改 - 如果修改了原作品，需要标明

详见 [LICENSE](LICENSE) 文件或访问 [CC BY-NC 4.0 官方页面](https://creativecommons.org/licenses/by-nc/4.0/)。

---

## 📞 联系方式

- GitHub Issues: [提交问题](https://github.com/Qccccc512/snake2snake/issues)
- GitHub Discussions: [讨论交流](https://github.com/Qccccc512/snake2snake/discussions)

---

## 📚 相关文档

- [需求分析报告](报告/报告.txt)
- [架构设计文档](文档/ARCHITECTURE.md)
- [类图说明](报告/class_diagram_说明.md)
- [开发指南](.github/copilot-instructions.md)

---

<div align="center">

**享受游戏，愉快编码！** 🐍🎮

</div>
