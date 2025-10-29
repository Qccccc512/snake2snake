# 🏛️ 架构设计文档

## 系统架构图

```
┌──────────────────────────────────────────────────────────┐
│                     用户界面层 (UI Layer)                  │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐        │
│  │   HTML     │  │    CSS     │  │   main.js    │        │
│  │  (视图)     │  │  (样式)     │  │ (应用控制)   │        │
│  └────────────┘  └────────────┘  └──────────────┘        │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│                   核心控制层 (Core Layer)                  │
│  ┌────────────────────────────────────────────────┐      │
│  │           Game (游戏主控制器)                    │      │
│  │  - 状态机管理 (READY/PLAYING/PAUSED/OVER)      │      │
│  │  - 系统协调                                     │      │
│  │  - 游戏主循环                                   │      │
│  └────────────────────────────────────────────────┘      │
│                         ↓                                 │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │ GameSession  │  │     User     │                     │
│  │  (会话管理)   │  │  (用户模型)   │                     │
│  └──────────────┘  └──────────────┘                     │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│                    业务逻辑层 (Business Layer)             │
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐    │
│  │FoodSpawner  │  │ScoreManager │  │    Timer     │    │
│  │ (食物管理)   │  │ (分数管理)   │  │  (计时器)     │    │
│  └─────────────┘  └─────────────┘  └──────────────┘    │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐   │
│  │RespawnManager│  │UserManager   │  │Achievement  │   │
│  │  (重生管理)   │  │ (用户管理)    │  │   System    │   │
│  └──────────────┘  └──────────────┘  └─────────────┘   │
│                                                           │
│  ┌──────────────────────────────────────┐               │
│  │      CollisionDetector (单例)         │               │
│  │         (碰撞检测)                     │               │
│  └──────────────────────────────────────┘               │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│                    实体层 (Entity Layer)                   │
│                                                           │
│  ┌──────────────────┐       ┌───────────────────┐       │
│  │      Snake       │       │      Food         │       │
│  │  ┌───────────┐  │       │  ┌──────────┐     │       │
│  │  │   body    │  │       │  │  Normal  │     │       │
│  │  │ direction │  │       │  │  Speed   │     │       │
│  │  │  effects  │  │       │  │  Super   │     │       │
│  │  │   user    │  │       │  │  Mine    │     │       │
│  │  └───────────┘  │       │  │  Magnet  │     │       │
│  └──────────────────┘       │  └──────────┘     │       │
│          ↓                   └───────────────────┘       │
│  ┌──────────────────┐              ↑                     │
│  │   SnakeEffect    │              │                     │
│  │  ┌───────────┐  │       ┌──────────────┐            │
│  │  │   Speed   │  │       │ FoodFactory  │            │
│  │  │  Magnet   │  │       │  (工厂模式)   │            │
│  │  └───────────┘  │       └──────────────┘            │
│  └──────────────────┘                                    │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│                     AI层 (AI Layer)                        │
│  ┌──────────────────────────────────────────────┐        │
│  │           AIController (策略模式)              │        │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐   │        │
│  │  │ EasyAI  │  │NormalAI  │  │ HardAI   │   │        │
│  │  └─────────┘  └──────────┘  └──────────┘   │        │
│  │              PathFinder                      │        │
│  └──────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│              渲染和输入层 (Rendering & Input Layer)        │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐│
│  │   Renderer   │  │  UIManager   │  │ InputHandler  ││
│  │  (渲染画面)   │  │  (UI更新)     │  │ (输入处理)     ││
│  └──────────────┘  └──────────────┘  └────────────────┘│
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│                数据持久化层 (Persistence Layer)            │
│  ┌──────────────────────────────────────────────┐        │
│  │        localStorage (浏览器本地存储)          │        │
│  │  - 用户数据                                   │        │
│  │  - 游戏统计                                   │        │
│  │  - 成就进度                                   │        │
│  └──────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────┘
```

---

## 数据流图

### 游戏开始流程
```
用户选择 → GameSession → Game.start()
    ↓
初始化蛇 → Snake实例化 → 关联User
    ↓
启动系统 → Timer.start() + FoodSpawner.start()
    ↓
游戏循环 → Game.update() → 渲染和逻辑更新
```

### 吃豆子流程
```
Snake移动 → CollisionDetector.checkFoodCollision()
    ↓
检测到食物 → Food.onEaten()
    ↓
应用效果 → Snake.grow++ / addEffect()
    ↓
更新统计 → User.stats.recordFoodEaten()
    ↓
更新分数 → ScoreManager.calculateScore()
    ↓
检查成就 → AchievementSystem.checkAchievements()
```

### 死亡重生流程
```
碰撞检测 → CollisionDetector.detectAllCollisions()
    ↓
检测到碰撞 → RespawnManager.handleDeath()
    ↓
蛇死亡 → Snake.die() + 记录统计
    ↓
掉落食物 → FoodSpawner.dropFoodFromSnake()
    ↓
2秒后 → RespawnManager.tryRespawn()
    ↓
重生 → Snake.respawn() at 随机安全位置
```

### 成就解锁流程
```
游戏事件 → 更新User.stats
    ↓
定期检查 → AchievementSystem.checkAchievements()
    ↓
条件达成 → Achievement.check() → true
    ↓
解锁成就 → Achievement.unlock()
    ↓
显示通知 → UIManager.showAchievementNotification()
    ↓
保存数据 → UserManager.saveUserData()
```

---

## 模块依赖关系

### 核心依赖（从上到下）
```
main.js
  └─→ Game
       ├─→ GameSession
       │    └─→ User
       │         └─→ GameStats
       │         └─→ Achievement
       ├─→ Snake
       │    └─→ Position
       │    └─→ SnakeEffect
       │    └─→ User
       ├─→ FoodSpawner
       │    └─→ FoodFactory
       │         └─→ Food子类
       ├─→ CollisionDetector (单例)
       ├─→ ScoreManager
       ├─→ Timer
       ├─→ RespawnManager
       ├─→ UserManager (单例)
       ├─→ AchievementSystem
       ├─→ Renderer
       ├─→ UIManager
       ├─→ InputHandler
       └─→ AIController子类
            └─→ PathFinder
```

### 配置依赖（全局）
```
GameConfig (单例) ←── 几乎所有类都依赖
Direction (常量) ←── Snake, AI, 管理器
```

---

## 关键接口说明

### Food接口
```javascript
abstract class Food {
    abstract onEaten(snake, game): void
    render(ctx, cellSize): void
}
```
**作用**：定义所有食物的行为规范

### AIController接口
```javascript
abstract class AIController {
    abstract makeDecision(snake): Direction
    findNearestFood(position): Food
    getSafeDirections(snake): Direction[]
}
```
**作用**：定义AI的决策接口

### SnakeEffect接口
```javascript
abstract class SnakeEffect {
    abstract apply(snake): void
    abstract remove(snake): void
    update(snake, game): void
    isExpired(): boolean
}
```
**作用**：定义蛇效果的生命周期

---

## 配置系统

### GameConfig配置项
```javascript
{
    // 地图配置
    GRID_SIZE: 32,
    CELL_SIZE: 16,
    
    // 蛇配置
    INITIAL_LENGTH: 3,
    SNAKE_SPEED: 120,
    
    // 游戏配置
    GAME_DURATION: 120,
    RESPAWN_DELAY: 2000,
    
    // 食物配置
    MAX_FOOD: 20,
    FOOD_SPAWN_INTERVAL: 1000,
    FOOD_SPAWN_COUNT: 2,
    FOOD_PROBABILITIES: {
        normal: 80,
        speed: 5,
        super: 5,
        mine: 5,
        magnet: 5
    },
    
    // 效果配置
    SPEED_EFFECT_DURATION: 5000,
    MAGNET_EFFECT_DURATION: 20000,
    MAGNET_RANGE: 1,
    
    // 分数配置
    SCORE_PER_FOOD: 50,
    SCORE_PER_LENGTH: 100,
    
    // 颜色配置
    COLORS: { ... }
}
```

### 修改配置的方法
```javascript
const config = GameConfig.getInstance();

// 修改食物刷新
config.updateFoodSpawnConfig(2000, 3, 30);

// 修改食物概率
config.updateFoodProbabilities({
    normal: 70,
    speed: 10,
    super: 10,
    mine: 5,
    magnet: 5
});

// 修改蛇速度
config.updateSnakeSpeed(100);
```

---

## 状态管理

### 游戏状态机
```
     start()
  ┌──────────┐
  │  READY   │
  └─────┬────┘
        │ start()
        ↓
  ┌──────────┐ pause()    ┌──────────┐
  │ PLAYING  │ ←────────→ │  PAUSED  │
  └─────┬────┘  resume()  └──────────┘
        │
        │ timeEnd()
        ↓
  ┌──────────┐
  │   OVER   │
  └─────┬────┘
        │ reset()
        ↓
      READY
```

### 蛇的状态
```
  ┌────────┐ die()      ┌────────┐
  │ ALIVE  │ ────────→ │  DEAD  │
  └────┬───┘            └───┬────┘
       ↑                     │
       └─────────────────────┘
          respawn() after 2s
```

---

## 事件系统

### 游戏事件流
```
用户输入
  ↓
InputHandler.handleKeyDown()
  ↓
Snake.changeDirection()
  ↓
(每帧) Game.update()
  ↓
Snake.move()
  ↓
CollisionDetector检测
  ├─→ 碰撞 → RespawnManager.handleDeath()
  └─→ 吃豆 → Food.onEaten() → 更新stats → 检查成就
  ↓
Renderer.render()
```

### 成就检测流
```
游戏事件
  ↓
更新 User.stats (各种recordXXX方法)
  ↓
(定期) AchievementSystem.checkAchievements()
  ↓
遍历所有成就 → Achievement.check(stats)
  ↓
条件满足 → Achievement.unlock()
  ↓
加入通知队列 → UIManager显示通知
  ↓
保存数据 → UserManager.saveUserData()
```
