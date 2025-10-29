<!-- 3c02a22f-007e-4a60-ad5d-0da85e9ad0f9 d1620013-6ec8-457b-a8dc-ef69a1f72223 -->
# 蛇对蛇游戏OOP重构开发计划

## OOP架构设计

### 核心类设计

#### 配置与常量类

- **GameConfig**: 游戏配置管理（单例模式）
- 地图尺寸、蛇初始长度、游戏时长
- 食物刷新速率、最大食物数量
- 特殊豆子概率配置
- 提供修改接口和重置方法

#### 游戏主控制器

- **Game**: 游戏主控制器
- 管理游戏状态机（READY/PLAYING/PAUSED/OVER）
- 协调各个子系统
- 游戏主循环控制

#### 蛇相关类

- **Snake**: 蛇类
- 属性：body（身体数组）、direction、color、isAlive、foodEaten、effects（当前效果列表）
- 方法：move()、grow()、die()、respawn()、hasEffect()、addEffect()、removeEffect()

- **SnakeEffect**: 蛇效果基类（策略模式）
- 子类：SpeedEffect（加速）、MagnetEffect（磁铁）
- 方法：apply()、update()、isExpired()

#### 食物相关类

- **Food**: 食物抽象基类
- 属性：position、type、color
- 方法：onEaten(snake)（抽象方法）

- **NormalFood**: 普通豆子
- **SpeedFood**: 加速豆子（速度翻倍，持续效果）
- **SuperFood**: 超级豆子（+5吃豆数，+1长度）
- **MineFood**: 地雷（立即死亡）
- **MagnetFood**: 磁铁豆子（20秒九宫格吸取）

- **FoodFactory**: 食物工厂类（工厂模式）
- 根据概率创建不同类型食物
- 方法：createFood(probabilities)

- **FoodSpawner**: 食物生成管理器
- 定时刷新食物
- 检查数量上限
- 避免与蛇身重叠

#### 碰撞与物理

- **CollisionDetector**: 碰撞检测器（单例模式）
- 检测撞墙、撞自己、撞对方、头对头碰撞
- 检测吃豆子
- 方法：checkWallCollision()、checkSelfCollision()、checkHeadToHead()、checkFoodCollision()

- **Position**: 位置类
- 属性：x、y
- 方法：equals()、distanceTo()、getNeighbors()

#### 游戏逻辑管理

- **ScoreManager**: 分数管理器
- 计算分数：累积吃豆数×50 + 蛇身长度×100
- 方法：calculateScore(snake)、updateScore()

- **Timer**: 计时器类
- 倒计时管理
- 方法：start()、pause()、resume()、reset()、getRemainingTime()

- **RespawnManager**: 重生管理器
- 处理蛇死亡和重生逻辑
- 寻找安全重生位置
- 掉落食物（每3节1颗）

#### AI控制

- **AIController**: AI控制器基类（策略模式）
- 抽象方法：makeDecision(snake, gameState)

- **EasyAI**: 简单AI（反应慢，策略简单）
- **NormalAI**: 中等AI（平衡策略，地图控制）
- **HardAI**: 困难AI（智能预测，阻挡玩家）

- **PathFinder**: 路径查找工具类
- A*算法寻路
- 危险度评估

#### 成就系统

- **AchievementSystem**: 成就系统管理器
- 管理所有成就
- 检查触发条件
- 解锁通知
- 方法：checkAchievements()、unlockAchievement()、getProgress()

- **Achievement**: 成就类
- 属性：id、name、description、type（跨局/单局）、condition、unlocked、progress
- 方法：checkUnlock(stats)、updateProgress(stats)

- **GameStats**: 游戏统计数据类
- 跨局累积：totalDistance、totalFoodEaten、totalDeaths、totalGames等
- 单局数据：currentDistance、currentFoodEaten、currentMaxLength等
- 方法：update()、reset()（单局）、save()、load()

#### 成就设计列表

**跨局累积成就（需持久化）：**

1. 远行者系列：累积移动100/300/1000/3000/10000格
2. 美食家系列：累积吃豆50/100/300/500/1000/3000颗
3. 特殊美食系列：累积吃加速/超级/磁铁豆各10/30/50/100颗
4. 拆弹专家：累积触碰地雷10/30/50次
5. 不屈者系列：累积死亡10/30/50/100次
6. 对决大师：累积对撞5/10/20/50次
7. 自省者：累积撞自己5/10/20/50次
8. 资深玩家：完成游戏局数10/30/50/100/300局
9. 胜利之星：累积获胜10/30/50/100局
10. 速度狂人：累积处于加速状态1000/3000/5000秒

**单局成就：**

1. 大胃王：单局吃豆20/30/40/50颗
2. 巨蟒：单局最大长度20/30/40/50节
3. 完美生存：单局不死亡且获胜
4. 特殊美食家：单局吃特定类型豆子5/10/15个
5. 幸存者：单局死亡后重生并逆转获胜
6. 马拉松选手：单局移动距离500/1000/1500格
7. 闪电战：开局60秒内达到15节长度
8. 地雷清除者：单局吃5个地雷后仍存活
9. 磁力大师：单局通过磁铁效果吸取30颗豆子
10. 完美压制：单局全程保持分数领先且获胜

#### 用户系统

- **UserManager**: 用户管理器（单例模式）
- 用户注册、登录、删除
- 用户数据持久化（localStorage）
- 方法：createUser(name)、getUser(userId)、deleteUser(userId)、listUsers()、saveUserData()

- **User**: 用户类
- 属性：userId、userName、stats（GameStats对象）、achievements（成就列表）、createdAt、lastPlayedAt
- 方法：updateStats()、unlockAchievement()、serialize()、deserialize()

- **GameSession**: 游戏会话类
- 管理当前游戏的玩家信息
- 单人模式：player1User
- 双人模式：player1User、player2User
- 方法：getPlayerUser(playerIndex)、updatePlayerStats(playerIndex, statsDelta)

#### 渲染系统

- **Renderer**: 渲染器类
- 渲染地图、蛇、食物、特效
- Canvas优化（批量绘制、脏矩形）
- 方法：renderGrid()、renderSnakes()、renderFood()、renderEffects()

- **UIManager**: UI管理器
- 管理所有UI元素更新
- 模态窗口控制
- 方法：updateScorePanel()、showGameOverModal()、showAchievementNotification()

#### 输入控制

- **InputHandler**: 输入处理器
- 键盘输入
- 虚拟按键（移动端）
- 事件绑定与解绑
- 方法：bindEvents()、handleKeyPress()、handleVirtualButton()

## 第三阶段：实现开发

### 1. 创建新的snake_oop.html文件

- 保留原有HTML结构和CSS样式（已经很完善）
- 添加成就系统相关UI：
- 成就面板按钮
- 成就列表弹窗（显示已解锁/未解锁成就及进度）
- 成就解锁通知（右上角弹出提示）
- 添加存档系统UI：
- 存档选择界面
- 新建/删除存档按钮
- 存档信息显示（玩家名、累积数据、时间）
- 添加游戏速度设置UI（滑块或选择器）

### 2. 实现配置层

- 实现GameConfig类（单例）
- 定义所有游戏常量和配置项
- 提供修改接口

### 3. 实现数据模型层

- Position类
- GameStats类
- SaveData类
- Achievement类

### 4. 实现食物系统

- Food基类及五个子类
- FoodFactory工厂类
- FoodSpawner管理器
- 特殊豆子效果实现

### 5. 实现蛇系统

- Snake类
- SnakeEffect基类及子类（SpeedEffect、MagnetEffect）
- 磁铁吸取逻辑（九宫格范围检测）

### 6. 实现游戏逻辑层

- CollisionDetector（包含头对头碰撞特殊处理）
- ScoreManager
- Timer
- RespawnManager（全图随机重生、安全位置查找）

### 7. 实现AI系统

- PathFinder工具类
- AIController基类
- EasyAI、NormalAI、HardAI三个实现

### 8. 实现成就系统

- Achievement类（22个成就定义）
- GameStats统计收集（在游戏各个事件中埋点）
- AchievementSystem管理器
- 成就检查与解锁逻辑
- 成就通知UI

### 9. 实现存储系统

- StorageManager类
- 多存档支持
- 自动保存功能
- 存档导入导出（可选）

### 10. 实现渲染系统

- Renderer类
- 特殊豆子视觉区分（不同颜色/形状）
- 特效渲染（加速光环、磁铁范围提示）
- UIManager类

### 11. 实现输入系统

- InputHandler类
- 整合原有的键盘和虚拟按键逻辑

### 12. 实现Game主控制器

- 状态机管理
- 系统协调
- 游戏主循环
- 事件分发

### 13. 整合测试

- 功能测试：所有用例逐一验证
- 边界测试：特殊情况处理
- 性能测试：确保流畅运行
- 跨浏览器测试

## 第四阶段：文档更新

### 1. 更新报告.txt

- 同步所有参数修改
- 补充成就系统详细说明
- 补充本地存储说明
- 补充特殊豆子概率配置

### 2. 更新snake_usecase.puml

- 添加成就相关用例
- 添加存档相关用例
- 确保所有功能都有对应用例

### 3. 创建代码文档（可选）

- 类图UML
- 架构说明文档
- API接口文档

## 技术要点

### OOP设计原则

- 单一职责原则：每个类职责明确
- 开闭原则：食物、AI、效果通过继承扩展
- 依赖倒置：面向接口编程
- 工厂模式：FoodFactory创建食物
- 策略模式：AI和效果系统
- 单例模式：GameConfig、StorageManager、CollisionDetector

### 性能优化

- 使用Set优化碰撞检测（bodySet）
- Canvas批量绘制减少状态切换
- requestAnimationFrame优化渲染
- 事件委托减少监听器数量
- localStorage异步操作防阻塞

### 代码质量

- ES6+语法（class、const/let、箭头函数、模板字符串）
- 严格的类型注释（JSDoc）
- 错误处理与降级策略
- 代码模块化与复用



### To-dos

- [ ] 设计完整的OOP类架构，定义所有类的接口和关系
- [ ] 实现GameConfig配置管理类（单例模式）
- [ ] 实现Position、GameStats、SaveData、Achievement等数据模型类
- [ ] 实现Food类层次结构（基类+5个子类）、FoodFactory、FoodSpawner
- [ ] 实现Snake类、SnakeEffect系统（SpeedEffect、MagnetEffect）
- [ ] 实现CollisionDetector、ScoreManager、Timer、RespawnManager
- [ ] 实现AIController层次结构（EasyAI、NormalAI、HardAI）和PathFinder
- [ ] 实现AchievementSystem、定义22个成就、埋点收集统计数据
- [ ] 实现StorageManager、多存档支持、自动保存功能
- [ ] 实现Renderer类和UIManager类，包含特殊食物渲染和成就通知UI
- [ ] 实现InputHandler类，整合键盘和虚拟按键
- [ ] 实现Game主控制器，协调所有系统，实现游戏主循环
- [ ] 创建snake_oop.html，添加成就面板、存档系统、游戏速度设置等新UI
- [ ] 整合测试：功能测试、边界测试、性能测试
- [ ] 完成最终文档更新，确保报告和UML图与实现一致
- [ ] 更新报告.txt,snake_usecase.puml和class_diagram.puml