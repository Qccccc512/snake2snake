# 蛇对蛇游戏系统分析类图报告

## 1. 建模依据与假设
1.1 需求驱动
- 用例 UC0–UC22 覆盖用户管理、对局控制、AI 决策、成就统计等业务。
- 需求强调 2 分钟限时、双蛇对战、食物刷新与掉落、AI 难度切换。

1.2 建模假设
- GUI、存储、网络等实现层对象不入图，保持 OOA 视角。
- 仅保留算法复杂服务与必要属性，简单 CRUD 方法省略。
- 主动对象仅 `Game`，其余对象由 `Game` 协调。

1.3 参考资料
- 《贪吃蛇对战游戏需求分析报告》
- 用例图 `snake_usecase.puml` 

## 2. 类图总览

![类图](../蛇对蛇游戏类图.png)

## 3. 分层结构概述
3.1 核心控制层（UC4–UC8）
- `Game` 负责状态机 `ready→playing⇄paused→over`、循环驱动与服务编排。
- `Timer` 提供 120 秒倒计时、暂停保持与过期检测。
- `GameSession` 负责模式、玩家、速度与 AI 难度配置，对应 UC1–UC3。

3.2 实体层（UC7, UC9–UC14）
- `Snake` 管理蛇身、方向、特效、统计。
- `Food` 策略层涵盖普通、加速、超级、地雷、磁铁食物。
- `SnakeEffect` 封装加速与磁铁两类特效的生命周期。

3.3 业务逻辑层（UC18–UC21）
- `CollisionDetector` 单例负责墙体、自撞、对撞、食物碰撞检测。
- `FoodSpawner` 管理刷新、掉落、数量上限与概率分布。
- `FoodFactory` 提供权重随机的食物创建。
- `RespawnManager` 协调死亡、延迟重生与安全点搜索。
- `ScoreManager` 计算得分、判定胜负。
- `AchievementSystem` 追踪与通知成就解锁。

3.4 AI 策略层（UC22）
- `AIController` 抽象决策流程，聚合 `PathFinder`。
- `EasyAI`、`NormalAI`、`HardAI` 通过随机因子、安全权重、预测窗口体现难度差异。
- `PathFinder` 评估危险度、空间余量与未来占位。

3.5 用户与统计层（UC0, UC16）
- `User` 聚合 `GameStats`、`Achievement`，体现档案与成就。
- `GameStats` 记录跨局与单局指标。
- `Achievement` 定义目标、进度与解锁状态。
- `UserManager` 单例提供增删查与校验。

3.6 基础数据模型
- `Position` 与 `Direction` 作为值对象，支持距离、相反方向计算。

## 4. 核心类职责表
| 类名 | 所在包 | 主要职责 | 关键属性及说明 | 关键方法及说明 |
| --- | --- | --- | --- | --- |
| Game | 核心控制层 | 主动调度对局生命周期 | `state` 状态机；`snakes[2]` 双蛇引用；`timer` 倒计时；`session` 当前会话 | `setupSession()` 会话装配；`start()/pause()/resume()/reset()` 控制状态；`update()` 帧驱动；`handleCollisions()` 协调碰撞；`processDeath()` 死亡处理 |
| Timer | 核心控制层 | 倒计时与暂停管理 | `timeRemaining` 剩余秒数；`isRunning` 状态标记 | `start()/pause()/reset()` 控制计时；`tick()` 递减；`isExpired()` 超时判断 |
| GameSession | 核心控制层 | 模式、玩家、速度、AI 难度配置 | `mode` 模式文本；`player1User/ player2User` 用户引用；`difficulty` AI 难度；`speedSetting` 蛇速档位 | `setupSinglePlayer()/setupTwoPlayers()` 建立会话；`configureSpeed()` 对应 UC2；`isAIMode()/isValid()` 校验 |
| Snake | 游戏实体层 | 管理蛇体、移动、特效 | `body` 坐标链；`direction` 当前方向；`speedMultiplier` 速度倍率；`effects` 激活特效；`foodEaten` 累积吃豆 | `move()/changeDirection()` 实现 UC7；`die()/respawn()` 映射 UC10；`getDropFoodCount()` UC21；`updateEffects()` 调用特效 |
| Food(抽象) | 游戏实体层 | 定义吃豆行为接口 | `position` 坐标；`type` 类型标识 | `onEaten()` 策略接口；`getPosition()` 查询位置 |
| SpeedFood 等子类 | 游戏实体层 | 各类特殊豆子效果 | 例如 `speedMultiplier`、`effectDuration`、`magnetRange` | `onEaten()` 触发 UC11–UC14；内部调用相应特效或死亡逻辑 |
| SnakeEffect(抽象) | 游戏实体层 | 特效生命周期管理 | `duration` 毫秒；`type` 枚举 | `apply()/remove()` 状态切换；`update()` 每帧处理；`isExpired()` 判断过期 |
| CollisionDetector | 业务逻辑层 | 全局碰撞检测 | `arenaWidth/arenaHeight` 地图尺寸 | `checkWallCollision()/checkSelfCollision()/checkHeadToHeadCollision()` 对应 UC19；`checkFoodCollision()` 触发 UC9 |
| FoodSpawner | 业务逻辑层 | 刷新与掉落管理 | `maxFood` 上限；`spawnRate` 频率；`activeFoods` 当前列表；`factory` 工厂引用 | `spawnFood()` 刷新 UC18；`dropFoodFromSnake()` UC21；`canSpawn()` 控制数量 |
| RespawnManager | 业务逻辑层 | 死亡与重生策略 | `respawnDelay` 2 秒；内部引用碰撞与刷新服务 | `handleDeath()` UC10 主入口；`scheduleRespawn()` 延迟重生；`findSafeRespawnPosition()` 安全点搜索 |
| ScoreManager | 业务逻辑层 | 分数与胜负计算 | `scorePerFood`=50；`scorePerLength`=100 | `calculateScore()` UC20；`determineWinner()` 胜负；`getScoreDifference()` 差距提示 |
| AIController | AI 策略层 | AI 决策抽象 | `difficulty` 难度；`pathFinder` 路径助手；`reactionDelay` 反应延迟 | `makeDecision()` UC22 主逻辑；`findNearestFood()/getSafeDirections()/evaluateDanger()` 决策支撑 |
| PathFinder | AI 策略层 | 危险评估与路径生成 | `dangerThreshold` 风险阈值 | `evaluateSpace()` 空间评估；`buildSafePath()` 构建路径；`predictOccupation()` 预测占位 |
| User | 用户与统计层 | 用户档案与成就 | `userId/userName` 标识；`stats` 统计；`achievements` 成就列表 | `getProfile()/getStats()` UC0-4；`unlockAchievement()` UC16 |
| GameStats | 用户与统计层 | 数据追踪 | `totalGames/totalWins` 等跨局；`currentDistance` 等单局 | `recordMove()/recordFoodEaten()/recordDeath()` 数据累计；`endGame()` 结算；`resetSession()` 重置 |
| AchievementSystem | 业务逻辑层 | 成就检测与通知 | `achievements` 当前清单 | `checkAchievements()` UC16-3；`notifyUnlock()` 推送；`trackProgress()` 统计 |
| UserManager | 用户与统计层 | 用户管理单例 | `users` Map | `createUser()/getUser()/deleteUser()` UC0-1~UC0-3；`userExists()` 校验 |

## 5. 用例映射概览
| 用例 | 关键类 | 说明 |
| --- | --- | --- |
| UC0-1/0-2/0-3/0-4 | `UserManager`, `User`, `GameSession` | 用户创建、选择、删除与信息查看 |
| UC1–UC3 | `GameSession`, `AIController` | 选择模式、设定速度与 AI 难度 |
| UC4–UC6 | `Game`, `Timer` | 开始、暂停、重置到初始状态 |
| UC7 | `Snake` | 移动控制与方向限制 |
| UC8 | `Game` | 主循环驱动所有子系统 |
| UC9–UC14 | `Food` 子类，`SnakeEffect` | 吃豆与特殊效果处理 |
| UC18–UC21 | `FoodSpawner`, `RespawnManager`, `ScoreManager` | 刷新、掉落、计分、重生流程 |
| UC22 | `AIController`, `PathFinder` | AI 决策与路径评估 |
| UC16 系列 | `AchievementSystem`, `Achievement`, `User` | 成就解锁、查看、通知 |

## 6. 主要关系说明
6.1 组合（Composition）
- `Game *-- Timer`: 倒计时随对局创建/销毁。
- `Game *-- GameSession`: 会话与对局同生命周期。
- `Game *-- Snake[2]`: 双蛇在重置时重新构造。
- `User *-- GameStats`: 统计数据依附于用户。
- `Snake *-- Position[]`: 身体节点由蛇管理。

6.2 聚合（Aggregation）
- `Game o-- AIController`: AI 控制器按需挂载，生命周期可独立。
- `FoodSpawner o-- FoodFactory/Food`: 刷新器维护活动食物集合。
- `AIController o-- PathFinder`: 路径分析可替换。
- `UserManager o-- User`: 用户对象可跨会话存在。
- `Snake o-- SnakeEffect[]`: 特效可添加移除。

6.3 依赖（Dependency）
- `Game ..> CollisionDetector/ScoreManager/FoodSpawner/RespawnManager/AchievementSystem`: 调用各管理器服务。
- `RespawnManager ..> CollisionDetector/FoodSpawner`: 重生流程依赖碰撞检查与掉落能力。
- `FoodFactory ..> Food`: 工厂创建具体食物策略。
- `SnakeEffect ..> Game`: 某些效果需访问 Game 状态。

6.4 泛化（Generalization）
- `Food` 与 `Food` 子类满足策略扩展。
- `SnakeEffect` 与特效子类支持状态对象。
- `AIController` 与难度子类实现多态决策。

6.5 关联（Association）
- `GameSession --> User[1..2]`: 记录当前参与的 1–2 名玩家。
- `Snake --> User[0..1]`: 蛇可绑定控制用户（AI 时为空）。

## 7. 关系合理性评估
- 组合关系仅在生命周期完全随宿主的场景使用，符合系统启动/重置流程。
- 聚合关系表现弱拥有，例如 AI 控制器或食物集合可在宿主外独立存在或替换。
- 依赖关系集中在算法服务调用链上，避免不必要的强耦合。
- 泛化层次保持两层以内，避免继承过深，提高可维护性。
- 关联关系聚焦在玩家与控制权，避免过多双向耦合。