# 后端测试覆盖率追踪与规划

## 概览与配比
- 路由模块数: 5（auth、trains、orders、payments、passengers）
- 建议配比（近似值）：
  - Unit（模型/工具函数）：≈20%
  - Integration（路由+中间件+DB）：≈70%
  - E2E（跨模块业务链路）：≈10%
- 测试环境：`jest + supertest`；`NODE_ENV='test'` 使用内存数据库，统一通过 `POST /api/auth/clear-test-data` 清理（`backend/src/routes/auth.js:344-369`）

## 测试约定
- 路由级测试文件放在 `backend/test/routes/*.test.js`
- 模型级测试文件放在 `backend/test/models/*.model.test.js`
- 端到端测试放在 `backend/test/e2e/*.e2e.test.js`
- 统一引用 `app`：`const app = require('../../src/app')`（`backend/src/app.js:72`）

## /api/auth（认证与账号）
- 源码参考：`backend/src/routes/auth.js`

### ✅ 集成测试 (Integration) — 文件：`backend/test/routes/auth.test.js`
- 发送验证码
  - 手机号缺失或格式错误 -> `400 {success:false,message:'手机号格式不正确'}`（`auth.js:41-46`）
  - 1分钟内重复发送 -> `429 {success:false,message:'发送过于频繁，请稍后再试'}`（`auth.js:51-56`）
  - 成功返回 -> `200 {success:true,data:{codeId,(dev含code)}}`（`auth.js:80-88`）
- 注册
  - 参数缺失 -> `400 {message:'参数错误或验证码无效'}`（`auth.js:102-109`）
  - 用户名/邮箱/手机号/身份证格式非法 -> `400`（`auth.js:111-134`）
  - 验证码无效或过期 -> `400 {message:'验证码错误或已过期'}`（`auth.js:146-152`）
  - 唯一性冲突（手机号/身份证/邮箱/用户名） -> `400`（`auth.js:155-166`）
  - 成功 -> `201 {success:true,data:{userId,token}}`（`auth.js:178-187`）
- 登录
  - 缺失 identifier/password -> `400`（`auth.js:201-203`）
  - 用户不存在 -> `404`（`auth.js:221-224`）
  - 密码错误 -> `401`（`auth.js:225-228`）
  - 尝试过多 -> `429`（`auth.js:206-210`）
  - 成功 -> `200 {data:{userId,token,user}}`（`auth.js:232-245`）
- 忘记密码
  - 发送验证码：参数缺失/账号格式错误/身份证格式错误/用户不存在 -> `400/404`；成功 -> `200 {data:{codeId,(dev含code)}}`（`auth.js:252-287`）
  - 重置密码：参数缺失/账号格式错误/身份证格式错误/验证码错误 -> `400`；用户不存在 -> `404`；成功 -> `200`（`auth.js:289-320`）
- 当前用户信息 `GET /me`
  - 缺失或非法 token -> `401`（`auth.js:375-381`）
  - 用户不存在 -> `404`（`auth.js:382-384`）
  - 成功 -> `200 {data:{userId,phone,realName,idNumber,email,createdAt,lastLogin}}`（`auth.js:384-392`）
- 修改密码 `POST /change-password`
  - 未授权 -> `401`（`auth.js:400-406`）
  - 参数缺失 -> `400`（`auth.js:407-409`）
  - 新密码长度非法 -> `400`（`auth.js:409-410`）
  - 用户不存在 -> `404`（`auth.js:411-413`）
  - 旧密码不正确 -> `400`（`auth.js:413-415`）
  - 成功 -> `200 {success:true,message:'密码修改成功'}`（`auth.js:415`）
- 测试清理端点 `POST /clear-test-data`（仅测试环境）
  - 成功 -> `200 {success:true,message:'测试数据已清理'}`；异常 -> `500`（`auth.js:344-369`）

### 🧩 单元测试 (Unit) — 文件：`backend/test/models/user.model.test.js`
- `User.create/findBy*`、`updatePasswordByUserId/updateLastLogin` 返回结构与受影响行计数
- `VerificationCode.save/invalidate*/verify*` 的状态流与过期逻辑

### 🚀 E2E — 文件：`backend/test/e2e/auth_flow.e2e.test.js`
- 注册→登录→`GET /me` 校验用户信息与 token 有效期

## /api/trains（车次查询）
- 源码参考：`backend/src/routes/trains.js`

### ✅ 集成测试 — 文件：`backend/test/routes/trains.test.js`
- 必填参数缺失（`from/to/date`）-> `400 {message:'缺少必需参数'}`（`trains.js:311-317`）
- 日期格式错误 -> `400 {message:'日期格式不正确'}`（`trains.js:319-325`）
- 过去日期 -> `400 {message:'不能查询过去的日期'}`（`trains.js:327-333`）
- 正常查询 -> `200 {data:{trains[],pagination}}`（`trains.js:440-450`）
- 过滤与排序：`trainType` 前缀过滤（`trains.js:339-343`）、出发时间段 `hh-hh`（`trains.js:378-385`）、`departure/arrival/duration` 排序（`trains.js:395-401`）
- 分页：`page/pageSize` 计算与总数（`trains.js:403-449`）
- 数据库兜底：DB 报错回退到 `mockTrains`（`trains.js:352-360`）
- 返回结构含 `seatTypes`，价格映射正确（示例：`secondClass=553`、`hardSleeper=156`）（`trains.js:410-419,422-438`）

### 🧩 单元测试 — 文件：`backend/test/routes/trains.utils.test.js`
- `isValidDate/isPastDate` 的边界日期与测试例外日期（`trains.js:282-305`）

### 🚀 E2E — 文件：`backend/test/e2e/train_search_flow.e2e.test.js`
- 综合筛选+排序+分页联动，校验返回 `seatTypes` 价格映射与结构

## /api/orders（订单）
- 源码参考：`backend/src/routes/orders.js`

### ✅ 集成测试 — 文件：`backend/test/routes/orders.test.js`
- 创建订单 `POST /api/orders`
  - 未授权 -> `401`（`orders.js:49-66`）
  - 订单信息不完整/乘客信息不完整 -> `400`（`orders.js:83-99`）
  - 身份证格式错误 -> `400`（`orders.js:100-106`）
  - 余票不足 -> `400 {message:'余票不足'}`（`orders.js:120-125`）
  - 成功 -> `201 {data:{orderId,status:'PENDING_PAYMENT',totalAmount,paymentDeadline}}`（`orders.js:190-198`）
- 查询订单 `GET /api/orders/:orderId`
  - 未授权 -> `401`
  - 订单不存在 -> `404`（`orders.js:211-213`）
  - 非本人访问 -> `403`（`orders.js:214-216`）
  - 成功 -> `200 {data:{...,(status==='PAID'含ticketInfo)}}`（`orders.js:233-237`）
- 取消订单 `POST /api/orders/:orderId/cancel`
  - 未授权/不存在/非本人 -> `401/404/403`
  - 状态不允许 -> `400 {message:'订单状态不允许取消'}`（`orders.js:256-258`）
  - 成功：恢复库存并返回成功（`orders.js:260-281`）
- 退票 `POST /api/orders/:orderId/refund`
  - 未授权/不存在/非本人 -> `401/404/403`
  - 状态不允许 -> `400 {message:'仅支持已支付订单退票'}`（`orders.js:328-330`）
- 成功：恢复库存并标记为 `CANCELLED`（`orders.js:332-351`）
- 用户订单列表：分页与状态过滤（`status/page/pageSize` 联动与统计字段）（`Order.js:82-168`）

### 🧩 单元测试 — 文件：`backend/test/models/order.model.test.js`
- `Order.create/addPassengers/getById/listByUser/updateStatus/setPaid` 的数据结构完整性与联表字段（发/到达时间）

### 🚀 E2E — 文件：`backend/test/e2e/order_to_ticket_flow.e2e.test.js`
- 注册→下单→发起支付→支付回调→查询订单含 `ticketInfo` 全链路验证

## /api/payments（支付）
- 源码参考：`backend/src/routes/payments.js`

### ✅ 集成测试 — 文件：`backend/test/routes/payments.test.js`
- 发起支付 `POST /api/payments/initiate`
  - 未授权 -> `401`（`payments.js:18-34,54-62`）
  - 参数缺失 -> `400 {message:'支付参数错误'}`（`payments.js:58-61`）
  - 不支持的支付方式 -> `400 {message:'不支持的支付方式'}`（`payments.js:63-67`）
  - 订单不存在 -> `404 {message:'订单不存在'}`（`payments.js:78-106` 分支）
  - 非本人订单 -> `401`（`payments.js:112-115`）
- 订单状态不允许或过期 -> `400 {message:'订单状态不允许支付'}`（`payments.js:118-125`）
- 成功 -> `200 {data:{paymentId,(paymentUrl|qrCode)}}`（`payments.js:142-153`）
- 支付方式 `bankcard` 发起成功返回 `paymentUrl`（`payments.js:148-150,190-196`）
- 支付回调 `POST /api/payments/callback`
  - 参数缺失 -> `400 {message:'回调数据验证失败'}`（`payments.js:208-211`）
  - 签名错误 -> `400 {message:'签名验证失败'}`（`payments.js:215-217`）
  - 支付记录不存在 -> `400 {message:'回调数据验证失败'}`（`payments.js:220-223`）
  - 订单ID不匹配或金额不匹配 -> `400`（`payments.js:226-233`）
  - 重复回调 -> `200 {success:true,message:'重复回调'}`（`payments.js:235-238`）
  - 成功 -> 更新支付 `SUCCESS`、订单 `PAID` 并生成 `ticketInfo`，尝试持久化（`payments.js:240-279`）

### 🧩 单元测试 — 文件：`backend/test/routes/payments.crypto.test.js`
- `generateSignature/verifySignature` 正确性与测试签名 `mock_signature` 特判（`payments.js:37-51`）

### 🚀 E2E — 文件：`backend/test/e2e/payment_to_ticket.e2e.test.js`
- 发起→回调→查询订单含电子票，验证幂等回调不改变票据

## /api/passengers（常用乘车人）
- 源码参考：`backend/src/routes/passengers.js`

### ✅ 集成测试 — 文件：`backend/test/routes/passengers.test.js`
- 列表 `GET /api/passengers`
  - 未授权 -> `401`（`passengers.js:6-16,20`）
  - 成功 -> `200 {data:{passengers,total}}`（`passengers.js:22-25`）
- 新增 `POST /api/passengers`
  - 参数缺失 -> `400 {message:'姓名、证件号码、手机号为必填'}`（`passengers.js:31-34`）
  - 身份证格式错误 -> `400 {message:'身份证格式不正确'}`（`passengers.js:34`）
  - 成功 -> `201 {data:{id}}`（`passengers.js:36-38`）
- 更新 `PUT /api/passengers/:id`
  - 参数缺失/身份证格式错误 -> `400`（`passengers.js:44-46`）
  - 未找到记录 -> `404`（`passengers.js:48-50`）
  - 成功 -> `200 {success:true}`（`passengers.js:50-51`）
- 删除 `DELETE /api/passengers/:id`
  - 未找到记录 -> `404`（`passengers.js:57-59`）
  - 成功 -> `200 {success:true}`（`passengers.js:59-60`）
- 设默认 `POST /api/passengers/:id/default`
  - 未找到记录 -> `404`（`passengers.js:66-68`）
  - 成功 -> `200 {success:true}`（`passengers.js:68-69`）

### 🧩 单元测试 — 文件：`backend/test/models/passenger.model.test.js`
- `PassengerModel.list/create/update/delete/setDefault` 的分页与状态流

### 🚀 E2E — 文件：`backend/test/e2e/passenger_crud_flow.e2e.test.js`
- 新增→列表→更新→设默认→删除的完整流程

## 全局与中间件

### ✅ 集成测试 — 覆盖于 `backend/test/routes/trains.test.js`
- 健康检查 `GET /health` -> `200 {status:'ok',timestamp,message}`（`app.js:35-42`）
- 未定义路由 `GET /__unknown__` -> `404 {error:'接口不存在',path,method}`（`app.js:44-51`）

## 目标与覆盖说明
- 每个接口的成功与所有显式错误分支均有断言（状态码与返回结构字段）
- 覆盖模型层的核心读写与聚合，保证路由返回结构可由测试“反推出”当前实现
- 端到端用例串联关键业务（下单→支付→出票、退票→库存恢复），验证跨模块一致性与幂等
