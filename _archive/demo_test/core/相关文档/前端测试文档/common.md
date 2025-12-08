# 测试覆盖率追踪报告

## 概览与配比
- 总子需求数: 8 (针对 Components 模块)
- 当前规划统计（近似值）:
  - Unit: ≈1
  - Component: ≈5
  - Integration: ≈2
  - E2E: ≈0 (通常包含在页面级 E2E 中)

## src/components/Header.jsx

### ✅ 单元测试 (Unit)
- 导航配置验证 (tests/frontend/components/Header/unit/nav_config.spec.ts)
- (如果导航项是配置化的) 验证导航菜单数组包含首页、车票、团购服务等预期项目
- 验证每个导航项的路径(path)配置正确

### 🧩 组件测试 (Component)
- 静态结构渲染 (tests/frontend/components/Header/component/structure.spec.tsx)
- 验证组件包含Logo图片且点击Logo能跳转回首页(/)
- 验证主导航菜单(首页、车票、会员服务等)的所有链接文本存在且href属性正确
- 验证搜索框(如有)是否存在
- 未登录态视图 (tests/frontend/components/Header/component/guest_view.spec.tsx)
- Mock用户上下文为null(未登录)
- 验证右上角显示“登录”和“注册”链接
- 验证不显示“我的12306”或用户名下拉菜单
- 登录态视图 (tests/frontend/components/Header/component/user_view.spec.tsx)
- Mock用户上下文包含用户信息({username: 'test_user'})
- 验证右上角显示“欢迎您，test_user”或类似欢迎语
- 验证显示“退出”按钮或链接
- 验证“登录/注册”链接不再显示
- 交互行为验证 (tests/frontend/components/Header/component/interactions.spec.tsx)
- 验证点击“退出”按钮触发登出逻辑(如清除localStorage)
- (如有下拉菜单) 验证鼠标悬停在“我的12306”上时显示下拉菜单项(我的订单、个人中心)

### 🔗 集成测试 (Integration)
- 路由联动测试 (tests/frontend/components/Header/integration/routing.spec.tsx)
- 在Router上下文中渲染Header
- 点击“登录”链接 -> 验证路由变更为/login
- 点击“我的订单”链接(登录态) -> 验证路由变更为/my-orders
- 状态持久化响应 (tests/frontend/components/Header/integration/auth_state.spec.tsx)
- 模拟用户在其他页面(如登录页)完成登录操作 -> 验证Header组件自动更新为登录态视图(检查Context或Store订阅)

### 🚀 E2E 测试 (Playwright)
- (注：Header 的 E2E 测试通常融合在其他页面的流程中，如“登录后检查 Header 变化”，故此处不单独列出)