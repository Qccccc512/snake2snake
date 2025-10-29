# 蛇对蛇游戏 - AI 代码助手须知

## 项目速览
- 使用原生 ES6 模块，无打包流程；入口 `main.js` 创建 `window.app` 以配合 HTML 中的 onclick。
- UI 通过多个模态框选择用户/模式，`Game` 只在完成 `setupSession` 后才进入 `start()` 阶段。
- 推荐以静态服务器打开 `index.html`（VS Code Live Server 或 `python -m http.server 8000`）。

## 游戏流程
- `src/core/Game.js` 管理状态机：`ready → playing ⇄ paused → over`，`reset()` 会回到 ready 并预生成豆子。
- 渲染循环由 `requestAnimationFrame` 驱动，暂停时逻辑停止但画面仍由 `Renderer.render()` 负责。
- 游戏时钟 `Timer`（120 秒）驱动倒计时，结束自动调用 `Game.end()` 并弹出结算模态。
- `GameSession` 保存当前玩家、模式与 AI 难度，UI 中的变更必须通过 `setupSession` 重建。

## 子系统与职责
- `FoodSpawner`（2 粒/秒，上限 20）使用 `FoodFactory` 生成豆子；所有新食物都要走 `createFoodByType` 分支。
- `CollisionDetector.getInstance()` 负责墙体、自撞、头撞与身体碰撞，并返回死亡类型供 `RespawnManager` 处理。
- `RespawnManager` 在 2 秒后寻找安全点重生（必要时 `clearAreaForRespawn`），并按 `FOOD_DROP_RATE` 调用 `FoodSpawner.dropFoodFromSnake()`。
- `ScoreManager` 将 `snake.foodEaten` 与 `snake.body.length` 按配置加权，用于 UI 排名与 `AchievementSystem` 统计。
- `Renderer` 绘制网格、蛇与豆子；`UIManager` 更新分数、计时、模态和成就提示，改动 UI 逻辑时优先修改 `src/rendering/UIManager.js`。
- `InputHandler` 抽象键盘与触摸控制，`Game.isPaused()` 允许输入与定时器跳过更新。

## 数据与持久化
- `UserManager.getInstance()` 将用户信息存入 localStorage 键 `snake_game_users`，序列化/反序列化由 `core/User.js` 负责。
- `User.stats`（见 `src/models/GameStats.js`）驱动成就、胜率、等级显示；修改结构时需兼容已有存档。
- `main.js` 通过 `window.selectUser`、`window.deleteUser` 等全局函数配合模态 UI 操作用户数据。

## AI 与特效
- AI 控制器位于 `src/ai`：`AIController` 封装冷却/随机失误，`Easy/Normal/Hard` 通过 `PathFinder` 评估危险和空间。
- `SnakeEffect` 定义策略接口；`SpeedEffect` 调整 `snake.speedMultiplier`，`MagnetEffect` 吸取九宫格食物并跳过地雷。
- 食物子类在 `src/entities/food`，`onEaten` 负责增长、特效与统计；禁止直接 `new SpeedFood()` 跳过工厂。
- `Game.update` 每帧遍历 `snake.updateEffects(this)`，因此效果内务必须幂等且考虑死亡/重生。

## 扩展指南
- 新食物：继承 `Food`、实现 `onEaten`、在 `FoodFactory.createFoodByType` 注册并调整 `GameConfig.FOOD_PROBABILITIES`（总和 100）。
- 新特效：继承 `SnakeEffect`，在相应的 `Food.onEaten` 中 `snake.addEffect(new CustomEffect())`，注意清理与并发效果。
- 新 AI：扩展 `AIController`，实现 `makeDecision`，并在 `Game.initializeAI` 的 switch 中注册标识。
- 修改地图或速度需同步更新 `GameConfig` 中的 `GRID_SIZE`、`CELL_SIZE`、`SNAKE_SPEED`，以及渲染/碰撞相关逻辑。

## 开发流程提示
- 初始调试：浏览器控制台查看 `window.app.game`、`window.app.userManager`，或读取 `JSON.parse(localStorage.getItem('snake_game_users'))`。
- 调整 UI 文案和模式按钮时修改 `main.js` 内的绑定逻辑，保持 `mode-btn`/`difficulty-btn` 的 `data-*` 属性与 `GameSession` 一致。
- `Game.renderer.adjustSize()` 在 resize 时运行，如需自适应策略请在此函数中更新。
- 老存档若造成异常，可调用 `UserManager.getInstance().clearAllUsers()`，开发阶段建议在控制台执行。

## 常见陷阱
- 切勿直接实例化单例（`new GameConfig()` 等），否则会导致配置和状态分叉。
- `FoodSpawner.spawnFood` 会在 `Game.reset()` 再次预生成豆子，新增初始化逻辑时避免重复调用。
- `CollisionDetector.checkFoodCollision` 与 `Game.handleFoodCollision` 假设蛇头唯一；自定义多头或分体玩法需重写碰撞流程。
- 变更 `Game.state` 时务必调用 `UIManager.updateButtons`/`hideStatusMessage`，否则按钮与状态提示会不同步。
