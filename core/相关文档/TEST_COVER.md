# GUI 测试覆盖率与代码映射文档

本此文档总结了 `tests-12306` 目录下的所有 GUI 测试用例，并按功能模块分类，标注了对应的源代码位置。

## 1. 注册模块 (Register)
**测试文件前缀**: `register-`
**测试功能**: 用户注册流程的字段校验、错误提示及成功注册。

| 测试文件 | 测试描述 |
| :--- | :--- |
| `register-username-required.json` | 校验用户名必填 |
| `register-password-required.json` | 校验密码必填 |
| `register-name-required.json` | 校验姓名必填 |
| `register-id-required.json` | 校验证件号码必填 |
| `register-confirm-password.json` | 校验两次密码输入是否一致 |
| `register-password-validation.json` | 校验密码强度/格式 |
| `register-phone-validation.json` | 校验手机号格式及必填 |
| `register-terms-checked.json` | 校验服务条款必须勾选 |
| `register-username-already-exist.json` | 校验用户名重复时的错误提示 |
| `register-success.json` | 验证完整信息的成功注册流程 |

**核心代码位置**:
- **前端页面**: [`core/frontend/src/pages/P004/RegisterPage.jsx`](/core/frontend/src/pages/P004/RegisterPage.jsx)
- **后端路由**: [`core/backend/src/routes/auth.js`](/core/backend/src/routes/auth.js) (涉及 `/check-username`, `/send-code`, `/register` 接口)

---

## 2. 登录模块 (Login)
**测试文件前缀**: `login-`
**测试功能**: 用户登录流程。

| 测试文件 | 测试描述 |
| :--- | :--- |
| `login-phone-code.json` | 验证使用手机号+验证码的登录方式 |

**核心代码位置**:
- **前端页面**: [`core/frontend/src/pages/P003/LoginPage.jsx`](/core/frontend/src/pages/P003/LoginPage.jsx)
- **后端路由**: [`core/backend/src/routes/auth.js`](/core/backend/src/routes/auth.js) (涉及 `/login`, `/verify-2fa` 接口)

---

## 3. 车票查询与过滤 (Tickets)
**测试文件前缀**: `tickets-`
**测试功能**: 车票搜索结果的展示、筛选及异常处理。

| 测试文件 | 测试描述 |
| :--- | :--- |
| `tickets-filter-seat-business-class.json` | 筛选：商务座 |
| `tickets-filter-seat-first-class.json` | 筛选：一等座 |
| `tickets-filter-seat-second-class.json` | 筛选：二等座 |
| `tickets-filter-seat-hard-sleeper.json` | 筛选：硬卧 |
| `tickets-filter-seat-soft-sleeper.json` | 筛选：软卧 |
| `tickets-filter-train-type-g.json` | 筛选：高铁 (G) |
| `tickets-filter-train-type-d.json` | 筛选：动车 (D) |
| `tickets-filter-train-type-k.json` | 筛选：普快 (K) |
| `tickets-filter-train-type-fuxing.json` | 筛选：复兴号 |
| `tickets-modify-search-conditions.json` | 修改搜索条件（出发地/目的地/日期） |
| `tickets-prevent-same-origin-destination.json` | 校验出发地与目的地不能相同 |
| `tickets-graceful-empty-results.json` | 验证无搜索结果时的友好提示 |

**核心代码位置**:
- **前端页面**: 
    - 搜索页: [`core/frontend/src/pages/P002/SearchResultsPage.jsx`](/core/frontend/src/pages/P002/SearchResultsPage.jsx)
    - 首页(入口): [`core/frontend/src/pages/P001/HomePage.jsx`](/core/frontend/src/pages/P001/HomePage.jsx)
- **后端路由**: [`core/backend/src/routes/trains.js`](/core/backend/src/routes/trains.js) (涉及 `/search` 接口)

---

## 4. 乘车人管理 (Traveler)
**测试文件前缀**: `traveler-`
**测试功能**: 常用乘车人的增删改查。

| 测试文件 | 测试描述 |
| :--- | :--- |
| `traveler-add-traveler.json` | 添加新乘车人 |
| `traveler-view-travelers.json` | 查看乘车人列表 |
| `traveler-delete-traveler.json` | 删除乘车人 |
| `traveler-prevent-duplicate-traveler.json` | 校验重复添加乘车人 |
| `traveler-graceful-empty-results.json` | 验证列表为空时的展示 |

**核心代码位置**:
- **前端页面**: [`core/frontend/src/pages/P006/PassengerPage.jsx`](/core/frontend/src/pages/P006/PassengerPage.jsx)
- **后端路由**: [`core/backend/src/routes/passengers.js`](/core/backend/src/routes/passengers.js)

---

## 5. 订单流程 (Orders)
**测试文件前缀**: `orders-`
**测试功能**: 提交订单及流程。

| 测试文件 | 测试描述 |
| :--- | :--- |
| `orders-submit-order.json` | 提交订单流程（选择乘车人、提交） |

**核心代码位置**:
- **前端页面**: 
    - 预订页: [`core/frontend/src/pages/P005/BookingPage.jsx`](/core/frontend/src/pages/P005/BookingPage.jsx)
    - 确认页: [`core/frontend/src/pages/P005/OrderConfirmationPage.jsx`](/core/frontend/src/pages/P005/OrderConfirmationPage.jsx)
- **后端路由**: [`core/backend/src/routes/orders.js`](/core/backend/src/routes/orders.js)

---

## 6. 个人信息 (Profile)
**测试文件前缀**: `profile-`
**测试功能**: 查看用户个人信息。

| 测试文件 | 测试描述 |
| :--- | :--- |
| `profile-view-profile.json` | 查看个人基本信息 |

**核心代码位置**:
- **前端页面**: [`core/frontend/src/pages/P006/UserInfoPage.jsx`](/core/frontend/src/pages/P006/UserInfoPage.jsx)
- **后端路由**: [`core/backend/src/routes/auth.js`](/core/backend/src/routes/auth.js) (涉及 `/me` 接口)
