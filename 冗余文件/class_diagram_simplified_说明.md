# 蛇对蛇游戏简化类图说明文档

## 一、类图简化原则

### 1. 精简策略
- **属性精简**：仅保留核心属性，去除冗余和派生属性
- **方法精简**：保留关键公有接口，隐藏内部实现细节
- **关系简化**：聚焦主要的结构关系，弱化次要依赖
- **包组织**：按职责分为7个包，清晰体现系统架构

### 2. UML标准规范应用
- **可见性标记**：严格使用 `+`（公有）、`-`（私有）、`#`（受保护）
- **关系箭头**：
  - `*--` 组合（强拥有，生命周期一致）
  - `o--` 聚合（弱拥有，可独立存在）
  - `<|--` 泛化/继承
  - `..>` 依赖（临时使用）
  - `-->` 关联（长期引用）
- **多重性标注**：明确标注集合关系的数量（如 `*`、`1..2`）
- **抽象标识**：使用 `{abstract}` 标记抽象方法
- **构造型**：使用 `<<Singleton>>`、`<<Factory>>`、`<<Enumeration>>` 等

---

## 二、包结构说明

### Package 1: 核心控制
**职责**：游戏主循环与会话管理

| 类名 | 核心职责 | 关键简化点 |
|------|---------|-----------|
| `Game` | 游戏主控制器，协调所有子系统 | 仅保留状态管理和核心生命周期方法，隐藏 `animationFrameId`、`moveAccumulator` 等实现细节 |
| `GameSession` | 封装游戏模式和玩家配置 | 去除 `getGameModeText()` 等辅助方法，保留核心设置接口 |

**设计意图**：
- `Game` 作为 Facade 模式的外观类，对外提供统一控制接口
- `GameSession` 采用 Strategy 模式思想，封装不同游戏模式的配置策略

---

### Package 2: 用户管理
**职责**：用户数据持久化与成就系统

| 类名 | 核心职责 | 关键简化点 |
|------|---------|-----------|
| `User` | 用户实体，关联统计与成就 | 隐藏序列化方法和时间戳属性 |
| `GameStats` | 游戏统计数据 | 仅保留核心统计字段，合并相似方法（如 `recordDeath` 系列） |
| `UserManager` | 用户管理单例 | 隐藏存储细节和导入导出功能 |

**设计意图**：
- `UserManager` 采用 Singleton 模式确保全局唯一
- `User` 与 `GameStats` 采用组合关系（强拥有）
- `Achievement` 与 `User` 为聚合关系（可独立定义成就规则）

---

### Package 3: 游戏实体
**职责**：核心游戏对象模型

| 类名 | 核心职责 | 关键简化点 |
|------|---------|-----------|
| `Snake` | 蛇实体，包含移动、死亡、特效 | 隐藏 `bodySet`、`grow` 等实现细节，保留核心行为接口 |
| `Food` (抽象) | 食物基类 | 统一 `onEaten` 抽象接口 |
| 5个具体食物类 | 实现不同吃豆效果 | 仅声明覆盖方法，不重复父类成员 |
| `SnakeEffect` (抽象) | 特效基类 | 简化为时间管理和应用接口 |
| `Position` | 位置值对象 | 仅保留坐标和基本比较方法 |

**设计意图**：
- `Food` 体系采用 Template Method 模式，`onEaten` 为钩子方法
- `Snake` 与 `SnakeEffect` 为聚合关系（特效可动态添加/移除）
- `Position` 为 Value Object，支持不可变语义

**多重性说明**：
- `Snake` → `Position` (`*`)：一条蛇的身体由多个位置节点组成
- `Snake` → `SnakeEffect` (`*`)：可同时拥有多个特效（如加速+磁铁）

---

### Package 4: 游戏管理器
**职责**：游戏规则与资源管理

| 类名 | 核心职责 | 关键简化点 |
|------|---------|-----------|
| `FoodSpawner` | 食物生成与管理 | 隐藏 `isValidPosition` 等校验逻辑 |
| `FoodFactory` | 食物工厂 | 仅保留创建接口，隐藏概率计算 |
| `CollisionDetector` | 碰撞检测单例 | 合并为统一的 `detectAllCollisions` |
| `RespawnManager` | 重生逻辑管理 | 隐藏 `forceRespawn`、`clearAreaForRespawn` 等边界处理 |
| `ScoreManager` | 分数计算 | 简化为核心算法接口 |
| `Timer` | 倒计时器 | 隐藏回调机制和格式化方法 |
| `AchievementSystem` | 成就检测 | 简化为检测和通知两个核心功能 |

**设计意图**：
- `FoodFactory` 采用 Factory Method 模式
- `CollisionDetector` 采用 Singleton 模式（全局唯一规则）
- `RespawnManager` 使用队列管理异步重生，与 `CollisionDetector` 依赖关系用于安全位置检测

---

### Package 5: AI系统
**职责**：AI决策策略

| 类名 | 核心职责 | 关键简化点 |
|------|---------|-----------|
| `AIController` (抽象) | AI策略基类 | 隐藏 `PathFinder` 和决策冷却机制 |
| `EasyAI/NormalAI/HardAI` | 三种难度实现 | 仅声明覆盖的决策方法 |

**设计意图**：
- 采用 Strategy 模式，`Game` 根据难度选择不同 AI 实现
- `AIController` 为抽象类，定义算法框架
- 隐藏 `PathFinder` 工具类，避免暴露寻路细节

---

### Package 6: 渲染与交互
**职责**：视图与输入处理

| 类名 | 核心职责 | 关键简化点 |
|------|---------|-----------|
| `Renderer` | Canvas 渲染 | 合并渲染方法，隐藏画布尺寸调整 |
| `UIManager` | UI 状态更新 | 仅保留核心更新接口，隐藏 DOM 缓存 |
| `InputHandler` | 输入监听 | 简化为键盘和虚拟按钮两类接口 |

**设计意图**：
- MVC 模式中的 View 层
- `Game` 通过依赖关系使用这些类（虚线箭头），体现松耦合

---

### 独立类：配置与枚举

| 类名 | 类型 | 说明 |
|------|------|------|
| `GameConfig` | Singleton | 全局配置中心，隐藏大部分常量字段 |
| `Direction` | Enumeration | 方向枚举，展示四个值 |
| `Achievement` | Entity | 成就实体，独立于用户存在 |

---

## 三、关键关系解读

### 1. 组合关系 (`*--`)
表示强拥有，部分不能独立于整体存在：

```
Game *-- GameSession    // 游戏结束，会话随之销毁
Game *-- Snake          // 游戏管理蛇的生命周期
User *-- GameStats      // 统计数据属于用户
Snake *-- Position      // 蛇的身体节点由蛇管理
```

### 2. 聚合关系 (`o--`)
表示弱拥有，部分可独立存在：

```
Game o-- AIController        // AI可独立测试
GameSession o-- User         // 用户可在多个会话中复用
User o-- Achievement         // 成就定义独立于用户
Snake o-- SnakeEffect        // 特效可独立配置
FoodSpawner o-- Food         // 食物可在生成器外创建
```

### 3. 依赖关系 (`..>`)
表示临时使用关系，通常作为方法参数或局部变量：

```
Game ..> CollisionDetector   // 每帧调用碰撞检测
Game ..> ScoreManager        // 结算时计算分数
RespawnManager ..> CollisionDetector  // 检测安全位置
```

### 4. 继承关系 (`<|--`)
体现泛化/特化：

```
Food <|-- NormalFood/SpeedFood/...   // 食物类型继承
AIController <|-- EasyAI/...         // AI策略继承
```

### 5. 关联关系 (`-->`)
表示稳定的引用关系：

```
Snake --> User               // 蛇需要知道所属玩家
FoodSpawner --> FoodFactory  // 生成器持续使用工厂
```

---

## 四、与需求分析的对应

### 用例 UC8 - 游戏进行
- **对应类**：`Game`（主循环）、`Timer`（倒计时）、`Snake`（移动）
- **关系体现**：`Game` 依赖各管理器实现用例中的"包含关系"

### 用例 UC9 - 吃豆子
- **对应类**：`Food` 及其子类（策略模式实现不同效果）
- **关系体现**：`Food.onEaten()` 抽象方法对应"扩展关系"

### 用例 UC10 - 死亡与重生
- **对应类**：`RespawnManager`、`CollisionDetector`
- **关系体现**：`handleDeath()` 触发掉落，`findSafeRespawnPosition()` 保证安全

### 用例 UC18 - 豆子刷新
- **对应类**：`FoodSpawner`、`FoodFactory`
- **关系体现**：工厂模式实现按概率生成不同类型食物

### 用例 UC19 - 碰撞检测
- **对应类**：`CollisionDetector` 单例
- **关系体现**：统一的 `detectAllCollisions()` 整合多种碰撞类型

---

## 五、设计模式应用总结

| 模式 | 应用位置 | 作用 |
|------|---------|------|
| **Singleton** | `GameConfig`、`CollisionDetector`、`UserManager` | 确保全局唯一实例 |
| **Factory Method** | `FoodFactory` | 封装食物创建逻辑 |
| **Strategy** | `AIController` 体系、`GameSession` | 运行时切换算法/配置 |
| **Template Method** | `Food.onEaten()`、`SnakeEffect.update()` | 定义算法骨架 |
| **Facade** | `Game` | 简化子系统访问 |
| **Observer** | `Timer` 回调机制（隐藏） | 时间事件通知 |

---

## 六、简化对比说明

### 原完整类图 vs 简化类图

| 维度 | 完整类图 | 简化类图 | 简化率 |
|------|---------|---------|--------|
| **类数量** | 28 个 | 28 个（保持完整） | 0% |
| **每类平均属性** | 8-12 个 | 3-5 个 | ~60% |
| **每类平均方法** | 6-10 个 | 3-5 个 | ~50% |
| **关系数量** | 45+ 条 | 30 条 | ~33% |
| **包层次** | 9 个包 | 7 个包（合并渲染与输入） | ~22% |

### 主要简化点
1. **属性**：
   - 去除：`lastUpdate`、`animationFrameId`、`bodySet`、`grow`
   - 保留：状态、核心数据、引用关系
   
2. **方法**：
   - 去除：辅助方法（`formatScore`、`toString`）、内部方法（`clearAreaForRespawn`）
   - 保留：公有接口、抽象方法、关键生命周期方法

3. **关系**：
   - 合并：`Game` 对多个管理器的依赖用统一虚线
   - 去除：值对象间的弱关系（如 `Position` 的邻居计算）

---

## 七、使用建议

### 阅读顺序
1. **自顶向下**：核心控制 → 用户管理 → 游戏实体
2. **关注关系**：先看组合/聚合（结构关系），再看依赖（行为关系）
3. **对照需求**：结合用例图理解各类职责

### 扩展指引
- **新增食物**：继承 `Food`，在 `FoodFactory` 注册
- **新增AI难度**：继承 `AIController`，在 `Game.setupSession` 中实例化
- **新增统计项**：扩展 `GameStats`，同步修改 `Achievement.check()` 逻辑

### PlantUML 渲染
```bash
# 本地渲染（需安装 PlantUML）
plantuml class_diagram_simplified.puml

# 在线渲染
访问 http://www.plantuml.com/plantuml/uml/
```

---

## 八、附录：关系符号速查

| UML 符号 | 含义 | PlantUML 语法 | 示例 |
|---------|------|--------------|------|
| `───────▷` | 泛化/继承 | `<\|--` | `Food <\|-- NormalFood` |
| `───────◆` | 组合 | `*--` | `Game *-- Snake` |
| `───────◇` | 聚合 | `o--` | `Game o-- AIController` |
| `- - - - ▷` | 依赖 | `..>` | `Game ..> ScoreManager` |
| `───────>` | 关联 | `-->` | `Snake --> User` |
| `1`, `*`, `0..1` | 多重性 | 跟在关系后 | `"2" Snake` |

---

**文档版本**：v1.0  
**创建日期**：2025-10-27  
**适用代码版本**：当前项目主分支  
**维护者**：开发团队
