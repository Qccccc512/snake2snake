# 蛇对蛇游戏类图说明文档

## 概述

本类图基于《贪吃蛇对战游戏需求分析报告》（报告.txt）和用例图（snake_usecase.puml）构建，专注于展示游戏的核心业务逻辑，遵循面向对象分析（OOA）的建模原则。类图剔除了与GUI系统、数据持久化实现、硬件和操作系统紧密相关的对象，只保留了算法复杂的核心业务服务。

## 设计原则

### 1. 符合需求分析的要求
- **以用例为驱动**：每个核心类和服务都对应需求分析中的具体用例（UC0-UC22）
- **体现业务价值**：只包含具有明确业务语义的对象和服务
- **满足系统责任**：类图覆盖了游戏的所有核心功能需求

### 2. 遵循OOA原则
- **精简对象**：移除只有单一属性或单一服务的无用对象
- **关注主动对象**：明确标注主动对象（Game类），体现控制流起点
- **算法复杂服务**：只保留算法复杂的业务服务，移除简单的CRUD操作
- **问题域对象**：聚焦问题域的核心实体（蛇、豆子、用户等）

### 3. 标准UML语法
- 使用标准的UML类图符号和关系表示法
- 明确区分泛化、关联、聚合、组合、依赖关系
- 使用构造型（Stereotype）标注特殊对象（如<<单例>>、<<策略>>）

---

## 类图结构

类图采用**分包结构**，将系统划分为6个逻辑包：

### 1. 核心控制层（对应UC4-UC8：游戏控制与进行）

#### Game（主动对象）
- **职责**：游戏主控制器，协调所有子系统，管理游戏生命周期
- **状态机**：ready → playing ⇄ paused → over
- **核心服务**：
  - `start()`: 对应 UC4 开始游戏
  - `pause() / resume()`: 对应 UC5 暂停/继续游戏
  - `reset()`: 对应 UC6 重置游戏
  - `update(deltaTime)`: 对应 UC8 游戏进行（核心主循环）
  - `handleCollisions()`: 碰撞处理协调
  - `handleFoodCollision()`: 食物碰撞处理
  - `processDeath(snake)`: 死亡事件处理
- **为何是主动对象**：
  - 游戏循环的起点，由玩家触发start()后主动驱动所有业务逻辑
  - 持续监控游戏状态，协调各子系统的执行
  - 与参与者（玩家）直接交互

#### Timer
- **职责**：游戏倒计时管理（2分钟）
- **核心服务**：
  - `tick(deltaTime)`: UC8中的倒计时监控
  - `isExpired()`: 判定游戏结束条件
- **算法复杂性**：时间监控、暂停/恢复同步、到期触发

#### GameSession
- **职责**：游戏会话配置管理
- **核心服务**：
  - `setupSinglePlayer()`: UC1 选择单人AI对战模式
  - `setupTwoPlayers()`: UC1 选择双人对战模式
- **业务价值**：封装游戏模式、用户选择、AI难度等配置

---

### 2. 游戏实体层（对应领域模型）

#### Snake（核心实体）
- **职责**：表示游戏中的蛇，管理移动、状态、特效
- **核心属性**：
  - `body: Position[]`: 蛇身坐标序列
  - `direction`: 当前移动方向
  - `isAlive`: 存活状态
  - `foodEaten`: 累积吃豆数（跨死亡保留）
  - `effects: SnakeEffect[]`: 激活的特效列表
  - `user: User`: 关联的用户对象
- **核心服务**：
  - `move()`: UC7 控制蛇移动的核心逻辑
  - `changeDirection(dir)`: 方向控制（含防掉头逻辑）
  - `die(type)`: UC10 死亡处理
  - `respawn(pos, dir)`: UC10 重生处理
  - `addEffect(effect)`: 添加特效
  - `updateEffects(game)`: 更新特效状态（算法复杂）
  - `getDropFoodCount()`: UC21 计算死亡掉落豆子数

#### Food（抽象类 - 策略模式）
- **职责**：食物的抽象表示，定义吃豆行为接口
- **核心服务**：
  - `onEaten(snake, game)`: UC9 吃豆子的抽象策略
- **具体子类**：
  - `NormalFood`: 普通豆子（UC9基本流程）
  - `SpeedFood`: 加速豆子（UC11扩展用例）
  - `SuperFood`: 超级豆子（UC12扩展用例）
  - `MineFood`: 地雷（UC13扩展用例）
  - `MagnetFood`: 磁铁豆子（UC14扩展用例）
- **设计模式**：策略模式，每种食物实现不同的`onEaten`策略

#### SnakeEffect（抽象类 - 状态模式）
- **职责**：蛇的特效状态管理
- **核心服务**：
  - `apply(snake, game)`: 应用特效
  - `remove(snake, game)`: 移除特效
  - `update(deltaTime)`: 更新持续时间（算法复杂）
- **具体子类**：
  - `SpeedEffect`: 速度翻倍效果（UC11）
  - `MagnetEffect`: 磁铁吸取效果（UC14，含九宫格范围计算）

---

### 3. 业务逻辑层（算法复杂的核心服务）

#### CollisionDetector（单例）
- **职责**：UC19 碰撞检测的核心实现
- **核心服务**：
  - `checkWallCollision(snake)`: 撞墙检测
  - `checkSelfCollision(snake)`: 撞自身检测
  - `checkHeadToHeadCollision(s1, s2)`: 对撞检测
  - `checkFoodCollision(snake, foods)`: 食物碰撞检测
- **算法复杂性**：多种碰撞条件的综合判断，需要高效的空间检索

#### FoodSpawner
- **职责**：UC18 豆子刷新的系统自动行为
- **核心服务**：
  - `spawnFood()`: 按规则生成豆子（每秒2颗，最多20颗）
  - `dropFoodFromSnake(snake)`: UC21 死亡掉落豆子（每3节掉1颗）
- **算法复杂性**：
  - 空位随机选择
  - 数量限制控制
  - 概率分布计算（普通80%，特殊各5%）

#### FoodFactory
- **职责**：食物对象的创建工厂
- **核心服务**：
  - `createFood(position)`: 根据概率创建食物
  - `selectFoodType()`: 按概率分布选择食物类型
- **算法复杂性**：加权随机算法

#### RespawnManager
- **职责**：UC10 处理死亡与重生的复杂逻辑
- **核心服务**：
  - `handleDeath(snake, type)`: 死亡事件处理
  - `scheduleRespawn(snake)`: 调度2秒后重生
  - `findSafeRespawnPosition()`: 寻找安全重生点（算法复杂）
  - `clearAreaForRespawn(pos)`: 清理重生区域
  - `isPositionSafe(pos)`: 安全性判断
- **算法复杂性**：
  - 多次随机尝试 + 预设点回退策略
  - 避开蛇身、墙体、其他蛇的复杂逻辑
  - 豆子掉落的随机分布计算

#### ScoreManager
- **职责**：UC20 更新分数的计算逻辑
- **核心服务**：
  - `calculateScore(snake)`: 分数计算（累积吃豆数×50 + 蛇身长度×100）
  - `determineWinner(snakes)`: 胜负判定
- **算法复杂性**：多因素加权计算

#### AchievementSystem
- **职责**：UC16-3 成就解锁通知，成就检测
- **核心服务**：
  - `checkAchievements(user)`: 检测用户成就（跨局与单局）
  - `notifyUnlock(achievement)`: 解锁通知
  - `trackProgress(user)`: 进度追踪
- **算法复杂性**：多维度统计数据的阈值判断与进度计算

---

### 4. AI策略层（对应UC22：AI控制蛇移动）

#### AIController（抽象类 - 策略模式）
- **职责**：AI控制策略的抽象接口
- **核心服务**：
  - `makeDecision(snake)`: UC22 AI控制蛇移动的核心算法
  - `findNearestFood(position)`: 寻找最近食物
  - `getSafeDirections(snake)`: 获取安全方向
  - `evaluateDanger(position)`: 危险评估
- **具体子类**：
  - `EasyAI`: UC3 简单难度（随机策略 + 基本躲避）
  - `NormalAI`: UC3 普通难度（贪心算法 + 空间评估）
  - `HardAI`: UC3 困难难度（路径规划 + 对手预测）
- **算法复杂性**：不同难度的AI决策算法差异显著

---

### 5. 用户与统计层（对应UC0-x：用户管理）

#### User
- **职责**：表示游戏用户
- **核心属性**：
  - `userId`: 用户唯一标识
  - `stats: GameStats`: 统计数据
  - `achievements: Achievement[]`: 拥有的成就
- **核心服务**：
  - `getProfile()`: UC0-4 查看用户信息
  - `unlockAchievement(id)`: 解锁成就

#### GameStats
- **职责**：用户的游戏统计数据（支持成就系统）
- **跨局累积统计**：
  - `totalGames`, `totalWins`, `totalDistance`, `totalFoodEaten`, `totalDeaths`
- **单局统计**：
  - `currentDistance`, `currentFoodEaten`, `currentMaxLength`
- **核心服务**：
  - `recordMove()`: 记录移动
  - `recordFoodEaten(type)`: 记录吃豆（分类型）
  - `recordDeath(type)`: 记录死亡（分类型）
  - `updateMaxLength(length)`: 更新最大长度
  - `endGame(isWin)`: 游戏结算
  - `resetSession()`: UC6 重置单局数据

#### Achievement
- **职责**：成就的定义与检测
- **核心属性**：
  - `type`: 跨局/单局成就类型
  - `requirement`: 达成条件（数值）
  - `progress`: 当前进度
  - `unlocked`: 是否已解锁
- **核心服务**：
  - `check(stats)`: UC16-2 检查成就进度
  - `getProgress()`: 获取完成百分比

#### UserManager（单例）
- **职责**：用户管理器
- **核心服务**：
  - `createUser(name)`: UC0-1 创建用户
  - `getUser(userId)`: UC0-2 选择用户
  - `deleteUser(userId)`: UC0-3 删除用户
  - `saveToStorage()` / `loadFromStorage()`: 持久化（注：实现细节已抽象）

---

### 6. 基础数据模型

#### Position
- **职责**：表示地图上的坐标位置（值对象）
- **核心服务**：
  - `equals(other)`: 位置相等判断
  - `manhattanDistance(other)`: 曼哈顿距离计算（用于AI寻路）
  - `clone()`: 深拷贝

#### Direction
- **职责**：表示移动方向（值对象 + 枚举）
- **静态常量**：UP, DOWN, LEFT, RIGHT
- **核心服务**：
  - `opposite()`: 获取相反方向（用于防掉头）

---

## 关系说明

### 组合关系（Composition，实心菱形）
表示强"拥有"关系，部分不能独立于整体存在：
- `Game *-- Timer`: 游戏拥有唯一的计时器
- `Game *-- GameSession`: 游戏拥有唯一的会话配置
- `Game *-- Snake[2]`: 游戏拥有2条蛇
- `User *-- GameStats`: 用户拥有统计数据
- `Snake *-- Position[]`: 蛇拥有身体节点序列
- `Snake *-- Direction`: 蛇拥有当前方向
- `Food *-- Position`: 食物拥有位置
- `FoodSpawner *-- FoodFactory`: 刷新器拥有工厂

### 聚合关系（Aggregation，空心菱形）
表示弱"拥有"关系，部分可以独立存在：
- `Game o-- Food[*]`: 游戏管理食物（食物可独立存在）
- `Game o-- AIController`: 游戏使用AI控制器（可选，仅AI模式）
- `Snake o-- User`: 蛇关联用户（用户独立存在）
- `Snake o-- SnakeEffect[*]`: 蛇拥有特效（特效可移除）
- `User o-- Achievement[*]`: 用户拥有成就（成就独立定义）
- `UserManager o-- User[*]`: 用户管理器管理用户

### 泛化关系（Generalization，空心三角箭头）
表示继承/实现关系：
- `Food <|-- NormalFood/SpeedFood/SuperFood/MineFood/MagnetFood`: 食物子类继承抽象食物
- `SnakeEffect <|-- SpeedEffect/MagnetEffect`: 特效子类继承抽象特效
- `AIController <|-- EasyAI/NormalAI/HardAI`: AI子类继承抽象AI

### 依赖关系（Dependency，虚线箭头）
表示使用关系，一个类使用另一个类的服务：
- `Game --> CollisionDetector/ScoreManager/FoodSpawner/RespawnManager/AchievementSystem`: Game使用各管理器
- `FoodFactory ..> Food`: 工厂创建食物
- `RespawnManager --> CollisionDetector`: 重生管理器使用碰撞检测器
- `AchievementSystem --> User`: 成就系统检查用户数据
- `CollisionDetector ..> Snake/Position`: 碰撞检测器检测蛇和位置
- `AIController --> Game/Snake/Food`: AI访问游戏状态
- `SnakeEffect ..> Snake/Game`: 特效修改蛇和游戏状态

### 关联关系（Association，实线箭头）
表示对象间的语义连接：
- `GameSession --> User[1..2]`: 会话关联1-2个用户

---

## 设计模式应用

### 1. 单例模式（Singleton）
- `CollisionDetector`: 全局唯一的碰撞检测器
- `UserManager`: 全局唯一的用户管理器
- **理由**：这些对象需要全局访问，且只需一个实例

### 2. 策略模式（Strategy）
- `Food`及其子类：不同的吃豆策略
- `AIController`及其子类：不同的AI决策策略
- **理由**：算法族可互换，支持运行时切换

### 3. 状态模式（State）
- `SnakeEffect`及其子类：不同的特效状态
- **理由**：特效有生命周期，可动态添加/移除

### 4. 工厂模式（Factory）
- `FoodFactory`: 根据概率创建不同类型的食物
- **理由**：对象创建逻辑复杂（概率分布）

---

## 与需求分析的对应关系

| 用例编号 | 用例名称 | 对应类/服务 |
|---------|---------|-----------|
| UC0-1 | 创建用户 | `UserManager.createUser()` |
| UC0-2 | 选择用户 | `UserManager.getUser()`, `GameSession.setup*()` |
| UC0-3 | 删除用户 | `UserManager.deleteUser()` |
| UC0-4 | 查看用户信息 | `User.getProfile()` |
| UC1 | 选择游戏模式 | `GameSession.setupSinglePlayer() / setupTwoPlayers()` |
| UC2 | 设置游戏速度 | （配置类，已抽象） |
| UC3 | 选择AI难度 | `GameSession.difficulty`, `AIController`子类 |
| UC4 | 开始游戏 | `Game.start()` |
| UC5 | 暂停/继续游戏 | `Game.pause() / resume()` |
| UC6 | 重置游戏 | `Game.reset()` |
| UC7 | 控制蛇移动 | `Snake.move()`, `Snake.changeDirection()` |
| UC8 | 游戏进行 | `Game.update()`, 协调所有子系统 |
| UC9 | 吃豆子 | `Food.onEaten()`, `Snake.foodEaten++` |
| UC10 | 处理死亡与重生 | `RespawnManager.handleDeath()`, `Snake.die() / respawn()` |
| UC11 | 加速效果 | `SpeedEffect.apply()`, `Snake.speedMultiplier` |
| UC12 | 超级豆子效果 | `SuperFood.onEaten()` |
| UC13 | 触碰地雷 | `MineFood.onEaten()`, 触发`Snake.die()` |
| UC14 | 磁铁吸取效果 | `MagnetEffect.collectNearbyFood()` |
| UC15 | 显示实时信息 | （UI类，不在类图中） |
| UC16 | 查看成就系统 | `User.achievements`, `Achievement` |
| UC16-1 | 查看已解锁成就 | `Achievement.unlocked == true` |
| UC16-2 | 查看成就进度 | `Achievement.getProgress()` |
| UC16-3 | 成就解锁通知 | `AchievementSystem.notifyUnlock()` |
| UC17 | 查看游戏指南 | （UI类，不在类图中） |
| UC18 | 豆子刷新 | `FoodSpawner.spawnFood()` |
| UC19 | 碰撞检测 | `CollisionDetector.*()` |
| UC20 | 更新分数 | `ScoreManager.calculateScore()` |
| UC21 | 死亡掉落豆子 | `FoodSpawner.dropFoodFromSnake()` |
| UC22 | AI控制蛇移动 | `AIController.makeDecision()` |

---

## 不在类图中的对象

以下对象**未在类图中体现**：

### 1. 与GUI有关的对象
- `Renderer`: 渲染器（HTML Canvas绘制）
- `UIManager`: UI管理器（模态框、按钮、分数显示）
- `InputHandler`: 输入处理器（键盘、触摸事件）
- 属于表现层，不涉及核心业务逻辑

### 2. 与实现环境有关的对象
- `GameConfig`: 配置单例（常量定义）
- 持久化的具体实现（localStorage操作）

### 3. 算法简单的服务
- 简单的getter/setter方法
- 创建、删除、访问、连接的简单操作

---

## 主动对象识别

### Game类为主动对象
**依据**：
1. **与参与者交互**：玩家通过UI触发`Game.start()`，是系统响应外部交互的第一个对象
2. **控制流起点**：`Game.update()`主循环是所有业务逻辑的驱动源
3. **主动行为**：游戏循环通过`requestAnimationFrame`主动执行，而非被动响应

**非主动对象**：
- `Snake`: 被动对象，由`Game.update()`调用`move()`
- `FoodSpawner`: 被动对象，由`Game.update()`触发`spawnFood()`
- `CollisionDetector`: 被动对象，由`Game.handleCollisions()`调用
- `AIController`: 被动对象，由`Game.update()`调用`makeDecision()`

---

## 属性设计说明

### 遵循的属性设计原则
1. **语义一致性**：属性与对象所在的语义域一致（如`Snake.body`表示蛇身）
2. **原子性**：属性无内部结构（如`foodEaten: number`而非`foodEaten: {normal, speed, ...}`）
3. **整体特征**：属性是整个实体的特征（如`Snake.direction`而非`Snake.head.direction`）
4. **对象相关性**：属性与对象相关（如`Snake.speedMultiplier`而非`Game.snakeSpeed`）
5. **避免关系值**：属性不是关系或关系中其他对象的值（如`Snake.user`是关联关系，不是`Snake.userName`）

### 不在类图中的属性
- 直接导出的属性（如`score`可由`foodEaten`和`body.length`计算）
- 实现相关的属性（如`bodySet: Set`用于优化，已推迟到设计阶段）

---

## 服务设计说明

### 遵循的服务设计原则
1. **算法复杂性**：只保留算法复杂的服务（如`RespawnManager.findSafeRespawnPosition()`）
2. **业务价值**：服务必须提供明确的业务功能（如`ScoreManager.calculateScore()`）
3. **高内聚**：一个服务完成单一、完整的功能（如`Snake.die()`只处理死亡）
4. **系统责任驱动**：服务满足需求分析中的系统责任（对应用例）

### 不在类图中的服务
- 简单的CRUD操作（如`getPosition()`, `setDirection()`）
- 实现细节方法（如`_updateBodySet()`, `_validateDirection()`）
- GUI相关方法（如`render()`, `updateUI()`）

---

## 类图的完备性验证

### 覆盖的需求
✅ 用户管理（UC0-1至UC0-4）  
✅ 游戏设置（UC1至UC3）  
✅ 游戏控制（UC4至UC7, UC22）  
✅ 游戏核心逻辑（UC8至UC14, UC18至UC21）  
✅ 成就系统（UC16, UC16-1至UC16-3）  

### 未覆盖的需求（符合OOA范围）
❌ UC15 显示实时信息（GUI，不在类图中）  
❌ UC17 查看游戏指南（UI功能，不在类图中）  
❌ UC2 设置游戏速度（配置功能，已抽象）  

---

## 与已实现代码的差异说明

### 类图简化之处
1. **移除了渲染系统**：`Renderer`, `UIManager`不在类图中
2. **移除了输入系统**：`InputHandler`不在类图中
3. **移除了配置系统**：`GameConfig`不在类图中
4. **简化了属性**：移除了实现优化相关的属性（如`bodySet`, `moveAccumulator`）
5. **简化了服务**：移除了简单的getter/setter和内部辅助方法

### 为何简化
- **OOA阶段目标**：专注核心业务逻辑，不涉及实现细节
- **需求驱动**：只包含需求分析中明确要求的功能
- **可读性**：避免类图过于复杂，突出重点

---

## 总结

本类图完整、准确地反映了《贪吃蛇对战游戏需求分析报告》中的核心业务逻辑，满足以下要求：

1. ✅ **符合需求分析**：所有核心用例（UC0-UC22）都有对应的类和服务
2. ✅ **标准UML语法**：使用标准的类图符号和关系表示法
3. ✅ **OOA原则**：剔除无用对象、精简服务、识别主动对象、关注算法复杂服务
4. ✅ **设计模式应用**：单例、策略、状态、工厂模式清晰体现
5. ✅ **可扩展性**：清晰的分层结构和松耦合设计，易于后续扩展

本类图可作为后续详细设计（OOD）和代码实现的蓝图，为开发团队提供清晰的业务逻辑指导。
