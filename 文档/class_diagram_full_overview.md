# 类图同步说明

## 更新背景
- 2025-10-27：依据最新实现补齐 `Game`、`Snake`、`GameStats` 等核心类的属性与方法，解决旧类图遗漏 `moveAccumulator`、`respawnQueue`、计时回调等问题。
- 类图新增 `Game → UserManager` 与 `RespawnManager → CollisionDetector` 依赖，反映当前对象图上的显式引用关系。
- 配套说明文件用于帮助后续审阅快速对照源码理解设计意图。

## 核心结构概览

### 配置层
- **GameConfig** 持有全部运行时常量（网格、刷新、计时、特效、配色、AI 参数）。`updateFoodSpawnConfig(interval, count, maxFood)`、`updateFoodProbabilities(probabilities)`、`reset()` 等接口支持在调试阶段快速调整全局行为。
- `Direction` 提供四向向量，作为蛇移动与寻路的共用枚举。

### 核心循环
- **Game** 连接全部子系统：
  - 以 `update(currentTime)` 驱动 `respawnManager.update(delta)`、`updateSnakes(snakesToMove)`、`handleFoodCollision()`、`checkAchievements()` 等步骤；
  - 每条蛇维护独立的 `moveAccumulator`，在 `snake.getSpeed()`（含加速倍率）满足时才调度移动；
  - `updateRespawnTimers()` 将重生倒计时透传给 `UIManager`。
- **GameSession** 描述玩家/模式选择，`getPlayerName()`、`isAIMode()`、`isTwoPlayerMode()` 直接服务 UI 与输入逻辑。
- **Timer** 负责 120 秒倒计时，`onTick`、`onEnd` 回调用于同步 UI 及游戏结束。
- **ScoreManager** 统一分数算法，提供 `determineWinner()` 供结算面板与成就检查使用。
- **RespawnManager** 维护 `respawnQueue`：
  - `handleDeath()` 触发掉落与排队；
  - `findSafeRespawnPosition()` → `tryRespawn()` 正常重生；
  - 多轮失败后调用 `forceRespawn()`，必要时 `clearAreaForRespawn()` 释放空间；
  - `getRespawnTimeLeft()` 供 UI 显示毫秒级剩余时间。
- **FoodSpawner** 通过 `createMultipleFood(count, isValidPosition)` 生成食物，`isValidPosition()` 排除蛇身/已有食物/越界，`dropFoodFromSnake()` 按比例掉落额外豆子。

### 实体与效果
- **Snake**：
  - 状态字段涵盖 `nextDirection`、`grow`、`moveAccumulator`、`speedMultiplier`、`hasMagnetEffect`；
  - `die()` 重置计数并记录统计，`respawn()` 清空效果与累积速度；
  - `addEffect()`、`removeAllEffects()` 保证同类效果不会并存；
  - `getDropFoodCount()` 按 `FOOD_DROP_RATE` 计算掉落量。
- **Food** 及其子类：
  - `MineFood.onEaten()` 现统一委托 `game.respawnManager.handleDeath()`，避免漏入队列；
  - `SpeedFood` / `MagnetFood` 分别附加 `SpeedEffect`、磁吸逻辑。
- **SnakeEffect** 提供计时基类，`getRemainingTime()` 支持 UI/调试，`SpeedEffect.update()` 每秒累计加速时长供成就统计。

### 管理器
- **FoodFactory** 的 `createMultipleFood(count, isValidPosition)` 增加位置校验回调，保证工厂层逻辑与生成策略解耦。
- **UserManager** 新增 `getAllUserSummaries()`、`exportAllUsers()`、`importUsers()` 等接口以支持数据维护。
- **AchievementSystem** 拓展 `checkCumulativeAchievements()`、`getAchievementStats()`、`getAlmostCompletedAchievements()`，兼顾会中提示与结算统计。

### AI 系统
- **AIController** 保存 `game` 与 `difficulty`，`lastDecisionTime` 控制决策节奏；
- **PathFinder** 注入 `GameConfig`，`evaluateDanger()` 同时考虑边界和蛇体，`findBestDirection()` 可配置避险。

### 渲染与输入
- **Renderer** 在 `adjustSize()` 保证画布适配，同时通过 `renderEffects()` 绘制加速光环与磁铁范围；
- **UIManager** 负责按钮态、计时文本、重生倒计时覆盖层与成就弹窗，`initializeElements()` 集中缓存 DOM；
- **InputHandler** 除键盘监听外，`bindVirtualButtons()` 支撑移动端触控，空格键统一处理开始/暂停/继续。

## 关键交互链路
1. **死亡处理**：`CollisionDetector.detectAllCollisions()` → `Game.handleCollisions()` → `RespawnManager.handleDeath()` → `FoodSpawner.dropFoodFromSnake()` → `UIManager.showRespawnTimer()`。
2. **食物生成**：`FoodSpawner.spawnFood()` → `FoodFactory.createMultipleFood()`（传入 `isValidPosition`）→ 新食物写入 `foodManager.foods`，由 `Renderer.renderFood()` 绘制。
3. **成就统计**：`Snake.move()`、`SnakeEffect.update()` 等对 `user.stats` 写入；`Game.checkAchievements()` 和 `Game.end()` 分别触发会中与结算检查，`UIManager.showAchievementNotification()` 负责展示。

## 维护建议
- 新增实体或管理器时，先在类图中声明核心属性与交互，再补充说明文档，以免与既有结构脱节。
- 涉及统计/成就的字段调整需同步更新 `GameStats.serialize()` 与 `User.deserialize()`，避免破坏存档兼容。
- 若修改重生或移动节奏，请同时审视 `RespawnManager.forceRespawn()` 与 `Game.updateSnakes()` 的协同关系。
