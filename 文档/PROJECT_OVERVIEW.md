# 📋 项目概览

## 项目信息

- **项目名称**：蛇对蛇 - OOP版本
- **开发方式**：严格面向对象编程（OOP）
- **技术栈**：HTML5 + CSS3 + ES6+ JavaScript
- **模块系统**：ES6 Modules
- **数据存储**：localStorage（浏览器本地存储）

## 核心功能清单

### ✅ 已实现功能

#### 1. 用户系统
- [x] 多用户创建和管理
- [x] 用户数据持久化
- [x] 用户统计信息
- [x] 用户等级和胜率计算

#### 2. 游戏模式
- [x] 双人对战模式
- [x] 人机对战模式（3种难度）
- [x] 游戏开始/暂停/继续/重置

#### 3. 核心玩法
- [x] 32x32地图
- [x] 蛇移动控制
- [x] 碰撞检测（撞墙/撞自己/头对头）
- [x] 死亡和重生机制
- [x] 2分钟倒计时
- [x] 分数系统

#### 4. 食物系统
- [x] 5种豆子类型（普通/加速/超级/地雷/磁铁）
- [x] 概率配置（80/5/5/5/5）
- [x] 自动刷新（每秒2颗，上限20颗）
- [x] 特殊效果实现
- [x] 视觉区分（不同颜色和形状）

#### 5. 特效系统
- [x] 加速效果（速度翻倍）
- [x] 磁铁效果（20秒九宫格吸取）
- [x] 效果时间管理
- [x] 效果视觉提示

#### 6. AI系统
- [x] 简单AI（反应慢，策略简单）
- [x] 中等AI（平衡策略，地图控制）
- [x] 困难AI（智能预测，阻挡玩家）
- [x] 路径查找和危险评估

#### 7. 成就系统
- [x] 50+种成就定义
- [x] 跨局累积成就（10类40+个）
- [x] 单局成就（10+个）
- [x] 成就进度追踪
- [x] 成就解锁通知
- [x] 成就面板界面
- [x] 成就筛选功能

#### 8. 数据统计
- [x] 跨局累积数据（移动距离、吃豆数、死亡次数等）
- [x] 单局数据（当前吃豆、最大长度等）
- [x] 分类统计（普通豆、特殊豆、各种死亡方式）
- [x] 游戏局数和胜率

#### 9. UI/UX
- [x] 现代化深色主题
- [x] 响应式设计
- [x] 移动端虚拟按键
- [x] 实时信息显示
- [x] 模态窗口系统
- [x] 动画和特效

## OOP设计模式应用

### 1. 单例模式（Singleton）
- `GameConfig` - 游戏配置
- `UserManager` - 用户管理
- `CollisionDetector` - 碰撞检测

### 2. 工厂模式（Factory）
- `FoodFactory` - 根据概率创建不同类型的食物

### 3. 策略模式（Strategy）
- `AIController`及其子类 - 不同难度的AI策略
- `SnakeEffect`及其子类 - 不同的效果策略

### 4. 观察者模式（Observer）
- `Timer`的回调机制 - onTick、onEnd
- 成就系统监听游戏事件

### 5. 状态模式（State）
- `Game`的状态机 - READY/PLAYING/PAUSED/OVER

## 类关系总结

### 继承关系
```
Food (抽象基类)
├── NormalFood (普通豆子)
├── SpeedFood (加速豆子)
├── SuperFood (超级豆子)
├── MineFood (地雷)
└── MagnetFood (磁铁豆子)

SnakeEffect (抽象基类)
├── SpeedEffect (加速效果)
└── MagnetEffect (磁铁效果)

AIController (抽象基类)
├── EasyAI (简单AI)
├── NormalAI (中等AI)
└── HardAI (困难AI)
```

### 组合关系
```
Game
├── GameSession (会话管理)
├── Snake[] (蛇数组)
├── FoodSpawner (食物管理)
├── Timer (计时器)
├── ScoreManager (分数管理)
├── RespawnManager (重生管理)
├── AchievementSystem (成就系统)
├── Renderer (渲染器)
├── UIManager (UI管理)
├── InputHandler (输入处理)
└── AIController (AI控制)

Snake
├── Position[] (身体)
├── SnakeEffect[] (效果列表)
└── User (关联用户)

User
├── GameStats (统计数据)
└── Achievement[] (成就列表)
```
