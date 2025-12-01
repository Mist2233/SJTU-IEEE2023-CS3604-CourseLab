# ==============================================================================
# MODULE: F001 - 导航栏访问
# ==============================================================================
Feature: F001 导航栏访问

  # --- Group: Happy Path ---

  @req:F001-S01 @prio:Low @type:Happy
  Scenario: 导航栏固定顶部可见
    Given 用户在首页
    Then 导航栏固定在页面顶部并随滚动保持可见

  @req:F001-S02 @prio:Low @type:Happy
  Scenario: 未登录显示登录与注册入口
    Given 用户未登录
    Then 导航栏显示 "登录" 与 "注册" 入口

  @req:F001-S03 @prio:Low @type:Happy
  Scenario: 已登录显示用户名与头像
    Given 用户已登录
    Then 导航栏显示用户名与头像

  @req:F001-S04 @prio:Low @type:Happy
  Scenario: 展示主要功能入口
    Given 用户在任意页面
    Then 导航栏显示 "首页" "查询" "个人中心" 入口

  @req:F001-S05 @prio:Low @type:Happy
  Scenario: 点击登录按钮跳转登录页
    Given 用户未登录
    When 点击导航栏 "登录"
    Then 跳转到登录页 P003

  @req:F001-S06 @prio:Low @type:Happy
  Scenario: 点击注册按钮跳转注册页
    Given 用户未登录
    When 点击导航栏 "注册"
    Then 跳转到注册页 P004

  @req:F001-S07 @prio:Low @type:Happy
  Scenario: 点击用户名显示下拉菜单
    Given 用户已登录
    When 点击导航栏用户名
    Then 显示下拉菜单包含 "个人中心" 与 "退出登录"

  @req:F001-S08 @prio:Low @type:Happy
  Scenario: 当前页面入口高亮显示
    Given 用户位于个人中心
    Then 导航栏 "个人中心" 入口高亮

  # --- Group: Sad Path ---

  @req:F001-S09 @prio:Medium @type:Sad
  Scenario: 登录态过期自动跳转登录页
    Given 用户会话过期
    When 用户点击任意受保护入口
    Then 自动跳转登录页 P003 并提示重新登录

  # --- Group: Edge Case ---

  @req:F001-Auto @prio:Low @type:Edge
  Scenario: 刷新后导航状态与高亮保持一致
    Given 用户在查询页刷新浏览器
    Then 导航栏仍显示未登录或已登录的正确状态
    And 查询入口保持高亮

# ==============================================================================
# MODULE: F002 - 快捷入口访问
# ==============================================================================
Feature: F002 快捷入口访问

  # --- Group: Happy Path ---

  @req:F002-S01 @prio:Low @type:Happy
  Scenario: 展示常用功能卡片
    Given 用户在首页
    Then 显示 "车票查询" "订单查询" "改签退票" 功能卡片

  @req:F002-S02 @prio:Low @type:Happy
  Scenario: 已登录用户显示个性化推荐
    Given 用户已登录
    Then 首页显示个性化推荐入口

  @req:F002-S03 @prio:Low @type:Happy
  Scenario: 展示历史查询记录最多5条
    Given 用户有多次历史查询
    Then 首页显示最近5条查询记录

  @req:F002-S04 @prio:Low @type:Happy
  Scenario: 点击车票查询跳转查询页
    When 点击 "车票查询" 卡片
    Then 跳转到查询页 P002

  @req:F002-S05 @prio:Low @type:Happy
  Scenario: 点击订单查询跳转订单管理
    When 点击 "订单查询" 卡片
    Then 跳转到订单管理 P006

  @req:F002-S06 @prio:Low @type:Happy
  Scenario: 点击历史记录自动填充查询条件
    Given 历史记录存在 "北京→上海 2025-12-01"
    When 点击该记录
    Then 查询页自动填充对应条件

  @req:F002-S07 @prio:Low @type:Happy
  Scenario: 清除历史记录需确认
    When 点击 "清除历史"
    Then 弹出确认窗口

  # --- Group: Sad Path ---

  @req:F002-S08 @prio:Medium @type:Sad
  Scenario: 未登录仅显示基础功能
    Given 用户未登录
    Then 首页不显示个性化推荐与历史记录功能

  @req:F002-S09 @prio:Medium @type:Sad
  Scenario: 推荐加载失败降级显示默认入口
    Given 推荐接口返回错误
    Then 页面仅显示默认功能入口

  # --- Group: Edge Case ---

  @req:F002-Auto @prio:Low @type:Edge
  Scenario: 历史记录为空显示占位
    Given 用户无历史查询
    Then 显示占位提示 "暂无历史记录"

# ==============================================================================
# MODULE: F003 - 车票查询
# ==============================================================================
Feature: F003 车票查询

  # --- Group: Happy Path ---

  @req:F003-S12 @req:F003-S16 @req:F003-S17 @prio:High @type:Happy
  Scenario: 查询条件完整成功返回车次与余票
    Given 用户输入出发地 "北京" 和目的地 "上海" 且选择日期 "2025-12-01"
    And 勾选 "仅显示有票"
    When 用户点击 "查询"
    Then 显示包含车次号、发到站、时间、历时的信息
    And 每个车次显示席别余票数量

  @req:F003-S01 @prio:Medium @type:Happy
  Scenario: 站点模糊搜索支持中文与拼音
    Given 用户在出发地输入框中输入 "beij"
    When 下拉建议列表出现
    Then 用户选择 "北京"
    And 目的地输入 "shanghai"
    Then 建议列表显示 "上海"

  @req:F003-S06 @prio:Medium @type:Happy
  Scenario: 快捷日期选择今天明天后天
    Given 用户打开日期选择器
    When 点击 "今天"
    Then 日期设置为当前日期
    When 点击 "明天"
    Then 日期设置为当前日期+1

  @req:F003-S13 @prio:Medium @type:Happy
  Scenario: 查询提交展示加载状态并完成后恢复
    Given 用户填写完整查询条件
    When 点击 "查询"
    Then 按钮显示 "查询中..." 并禁用
    And 查询完成后按钮恢复可点击

  # --- Group: Sad Path (规则反转) ---

  @req:F003-S21 @prio:High @type:Sad
  Scenario: 出发地与目的地相同被拦截
    Given 用户输入出发地 "上海" 和目的地 "上海"
    When 用户点击 "查询"
    Then 系统提示 "出发地与目的地不可相同"
    And 查询未发起

  @req:F003-S05 @prio:High @type:Sad
  Scenario: 选择超出30天范围的日期被拦截
    Given 用户打开日期选择器
    When 选择日期为当前日期+45天
    Then 系统提示 "仅支持30天内日期"
    And 日期选择无效

  @req:F003-S08 @prio:High @type:Sad
  Scenario: 手动输入过去日期被拦截
    Given 用户在日期输入框输入 "2024-01-01"
    When 失去焦点
    Then 显示错误 "日期不能早于今天"

  @req:F003-S09 @prio:Medium @type:Sad
  Scenario: 车次类型选择无效值被拦截
    Given 用户在类型筛选中输入 "X" 类型
    When 应用筛选
    Then 系统提示 "无效类型"

  @req:F003-S10 @prio:Medium @type:Sad
  Scenario: 出发时间段选择无效范围被拦截
    Given 用户选择出发时间段 "25:00-26:00"
    When 应用筛选
    Then 系统提示 "时间范围无效"

  @req:F003-S11 @prio:Medium @type:Sad
  Scenario: 仅显示有票导致无结果的反馈
    Given 用户勾选 "仅显示有票"
    And 当前条件下所有车次已售罄
    When 点击 "查询"
    Then 显示占位提示 "暂无符合条件的车次"

  @req:F003-S12 @prio:High @type:Sad
  Scenario: 必填项不完整被拦截
    Given 用户仅填写出发地 "北京"
    When 点击 "查询"
    Then 显示错误 "请填写出发地、目的地和日期"

  # --- Group: Edge Case ---

  @req:F003-Auto @prio:Medium @type:Edge
  Scenario: 查询接口超时
    Given 用户填写完整查询条件
    When 点击 "查询"
    And 接口响应超过 5000ms
    Then 显示 "网络繁忙" 提示
    And 查询按钮恢复可点击状态

  @req:F003-Auto @prio:Low @type:Edge
  Scenario: 重复点击查询触发防抖
    Given 用户填写完整查询条件
    When 用户连续快速点击 "查询" 3 次
    Then 仅发起一次请求
    And 其余点击被忽略

# ==============================================================================
# MODULE: F004 - 车次筛选
# ==============================================================================
Feature: F004 车次筛选

  # --- Group: Happy Path ---

  @req:F004-S15 @prio:High @type:Happy
  Scenario: 应用筛选实时更新列表
    Given 已加载车次列表
    When 选择类型 "G" 与出发时间段 "上午"
    Then 列表实时过滤仅显示满足条件的车次

  @req:F004-S16 @prio:Medium @type:Happy
  Scenario: 显示筛选结果数量
    Given 应用多项筛选条件
    Then 顶部显示 "共 X 条结果"

  # --- Group: Sad Path (规则反转) ---

  @req:F004-S01 @prio:Medium @type:Sad
  Scenario: 类型筛选输入非法字符被拦截
    Given 在类型筛选输入 "#"
    When 应用筛选
    Then 提示 "无效类型"

  @req:F004-S02 @prio:Medium @type:Sad
  Scenario: 类型筛选传入不存在的类型被拦截
    Given 选择类型 "Z"
    When 应用筛选
    Then 提示 "无效类型"

  @req:F004-S04 @prio:Medium @type:Sad
  Scenario: 时间段选择越界被拦截
    Given 选择时间段 "凌晨-凌晨" 且范围为负
    When 应用筛选
    Then 提示 "时间范围无效"

  @req:F004-S08 @prio:Medium @type:Sad
  Scenario: 席别筛选输入不存在席别被拦截
    Given 选择席别 "VIP"
    When 应用筛选
    Then 提示 "无效席别"

  @req:F004-S10 @prio:Medium @type:Sad
  Scenario: 多站点城市选择无效站点被拦截
    Given 选择出发站 "北京-未知站"
    When 应用筛选
    Then 提示 "站点无效"

  @req:F004-S12 @prio:Medium @type:Sad
  Scenario: 历时范围输入负数被拦截
    Given 设置历时范围为 "-10 至 60 分钟"
    When 应用筛选
    Then 提示 "历时范围无效"

  @req:F004-S13 @prio:Medium @type:Sad
  Scenario: 价格区间下限大于上限被拦截
    Given 设置价格区间 "500-100"
    When 应用筛选
    Then 提示 "价格区间无效"

  @req:F004-S18 @prio:Low @type:Sad
  Scenario: 筛选结果为空的反馈与建议
    Given 应用多个严格筛选条件导致无结果
    Then 显示提示 "请放宽筛选条件"

  # --- Group: Edge Case ---

  @req:F004-Auto @prio:Low @type:Edge
  Scenario: 筛选请求并发触发合并处理
    Given 用户快速切换多项筛选
    When 同时发起多个筛选请求
    Then 系统合并最后一次条件执行

# ==============================================================================
# MODULE: F005 - 车票预订
# ==============================================================================
Feature: F005 车票预订

  # --- Group: Happy Path ---

  @req:F005-S05 @req:F005-S06 @req:F005-S14 @prio:High @type:Happy
  Scenario: 选择席别与乘车人生成订单明细
    Given 用户已登录且选择车次 "G1"
    And 显示可用席别及余票
    When 用户选择 "二等座" 与购票数量 "1"
    And 从常用乘车人列表选择 "张三"
    Then 显示订单明细包含车次、席别、乘车人、总价

  @req:F005-S16 @prio:High @type:Happy
  Scenario: 提交预订锁票成功跳转订单页
    Given 用户同意购票协议
    When 点击 "提交预订"
    Then 锁票成功跳转到订单填写页面

  # --- Group: Sad Path (规则反转) ---

  @req:F005-S01 @prio:High @type:Sad
  Scenario: 未登录被拦截并跳转登录页
    Given 用户未登录
    When 点击 "提交预订"
    Then 系统提示 "请先登录"
    And 自动跳转登录页

  @req:F005-S02 @prio:High @type:Sad
  Scenario: 余票不足被拦截
    Given 显示二等座余票为 "0"
    When 尝试选择二等座
    Then 提示 "余票不足"

  @req:F005-S03 @prio:High @type:Sad
  Scenario: 乘车人信息不完整被拦截
    Given 未选择乘车人
    When 点击 "提交预订"
    Then 提示 "请完善乘车人信息"

  @req:F005-S15 @prio:Medium @type:Sad
  Scenario: 未勾选购票协议提交被拦截
    Given 用户未勾选购票协议
    When 点击 "提交预订"
    Then 提示 "请阅读并同意购票协议"

  # --- Group: Edge Case ---

  @req:F005-S17 @prio:Low @type:Edge
  Scenario: 余票不足提示建议其他席别或车次
    Given 所选席别余票不足
    Then 显示建议选择其他席别或车次

# ==============================================================================
# MODULE: F006 - 中转换乘查询
# ==============================================================================
Feature: F006 中转换乘查询

  # --- Group: Happy Path ---

  @req:F006-S01 @prio:Medium @type:Happy
  Scenario: 直达无结果时自动推荐中转
    Given 直达查询无结果
    When 系统计算中转方案
    Then 展示推荐中转入口

  @req:F006-S02 @prio:Low @type:Happy
  Scenario: 用户主动选择中转方案
    Given 展示多个中转方案
    When 用户选择其中一个方案
    Then 进入该方案的车次列表

  @req:F006-S03 @prio:Low @type:Happy
  Scenario: 显示预计可节省时间与费用
    Given 展示中转方案
    Then 显示方案的预计时间与费用节省值

  @req:F006-S04 @prio:Medium @type:Happy
  Scenario: 查询可用中转站
    Given 用户指定出发与目的地
    When 系统查询枢纽中转站
    Then 返回可用中转站列表

  @req:F006-S05 @prio:Medium @type:Happy
  Scenario: 计算换乘时间在限制范围内
    Given 两个车次换乘
    When 计算换乘时间
    Then 时间不少于30分钟且不超过4小时

  @req:F006-S06 @prio:Medium @type:Happy
  Scenario: 生成最多5个中转方案
    Given 条件允许
    When 系统生成方案
    Then 返回不超过5个方案

  @req:F006-S07 @prio:Low @type:Happy
  Scenario: 按总历时与总价排序
    Given 已生成多个方案
    When 用户选择排序方式
    Then 列表按选择方式排序

  # --- Group: Edge Case ---

  @req:F006-S16 @prio:Low @type:Edge
  Scenario: 换乘时间不足提示用户
    Given 计算结果换乘时间小于30分钟
    Then 显示警告提示并建议更改方案

# ==============================================================================
# MODULE: F007 - 用户登录
# ==============================================================================
Feature: F007 用户登录

  # --- Group: Happy Path ---

  @req:F007-S01 @req:F007-S12 @req:F007-S13 @prio:High @type:Happy
  Scenario: 账号密码登录成功并生成会话
    Given 用户输入用户名 "user001" 与密码 "P@ssw0rd"
    When 点击 "登录"
    Then 后端凭证校验通过
    And 生成会话token并跳转首页

  @req:F007-S03 @prio:Low @type:Happy
  Scenario: 记住密码选项本地加密存储
    Given 用户勾选 "记住密码"
    When 登录成功
    Then 客户端以加密方式本地保存凭证并下次自动填充

  @req:F007-S05 @req:F007-S06 @req:F007-S07 @prio:High @type:Happy
  Scenario: 手机验证码登录与倒计时
    Given 用户输入手机号 "13800138000"
    When 点击 "发送验证码"
    Then 按钮进入 "60s后重试" 且禁用
    When 输入验证码 "123456"
    Then 登录成功跳转首页

  # --- Group: Sad Path (规则反转) ---

  @req:F007-S05 @prio:Medium @type:Sad
  Scenario: 手机号格式错误被拦截
    When 用户输入手机号 "138"
    Then 显示错误 "请输入有效手机号"

  @req:F007-S07 @prio:High @type:Sad
  Scenario: 验证码错误被拦截
    Given 已发送验证码
    When 输入验证码 "000000"
    Then 提示 "验证码错误"

  @req:F007-S08 @prio:High @type:Sad
  Scenario: 验证码过期被拦截
    Given 验证码发送超过 5 分钟
    When 输入正确验证码
    Then 提示 "验证码已过期"

  @req:F007-S04 @prio:Medium @type:Sad
  Scenario: 连续失败3次后要求图形验证码
    Given 用户连续3次输入错误密码
    When 第4次尝试登录
    Then 要求先通过图形验证码

  # --- Group: Edge Case ---

  @req:F007-Auto @prio:Low @type:Edge
  Scenario: 登录接口超时提示重试
    Given 用户输入正确凭证
    When 登录请求超过 5000ms 未返回
    Then 显示 "网络繁忙，请稍后重试"

# ==============================================================================
# MODULE: F008 - 用户注册
# ==============================================================================
Feature: F008 用户注册

  # --- Group: Happy Path ---

  @req:F008-S17 @prio:High @type:Happy
  Scenario: 完整注册流程成功
    Given 用户输入未注册的手机号 "13800138000"
    And 验证码校验通过
    And 密码符合复杂性要求
    When 用户点击 "注册"
    Then 注册成功并自动登录

  @req:F008-S03 @req:F008-S04 @prio:Medium @type:Happy
  Scenario: 获取验证码与倒计时
    Given 用户输入有效手机号
    When 用户点击 "获取验证码"
    Then 按钮变为 "60s后重试" 且进入禁用状态

  @req:F008-S08 @prio:Medium @type:Happy
  Scenario: 密码强度实时反馈
    Given 用户位于密码输入框
    When 输入 "123456"
    Then 强度指示器显示 "弱"
    When 追加输入 "Aa"
    Then 强度指示器显示 "强"

  # --- Group: Sad Path (规则反转) ---

  @req:F008-S01 @prio:Medium @type:Sad
  Scenario: 手机号格式错误
    When 用户输入手机号 "138"
    Then 输入框显示错误 "请输入11位手机号"

  @req:F008-S02 @prio:High @type:Sad
  Scenario: 手机号已注册
    When 用户输入已存在的手机号
    And 点击获取验证码
    Then 系统提示 "该手机号已注册"

  @req:F008-S06 @prio:High @type:Sad
  Scenario: 密码长度不足
    When 用户设置密码 "Abc123" (6位)
    Then 系统提示 "密码需8-20位"

  @req:F008-S07 @prio:High @type:Sad
  Scenario: 密码复杂度不足
    When 用户设置密码 "12345678" (纯数字)
    Then 系统提示 "密码必须包含字母和数字"
    And 提交按钮保持禁用

  @req:F008-S04 @prio:High @type:Sad
  Scenario: 验证码过期
    When 用户输入过期的验证码 "123456"
    Then 系统提示 "验证码已过期"

  @req:F008-S05 @prio:High @type:Sad
  Scenario: 验证码错误
    When 用户输入错误的验证码 "000000"
    Then 系统提示 "验证码错误"

  @req:F008-S09 @prio:Medium @type:Sad
  Scenario: 两次密码不一致
    Given 第一次密码 "Abc12345"
    And 确认密码 "Abc1234X"
    When 点击注册
    Then 显示错误 "两次密码输入不一致"

  # --- Group: Edge Case ---

  @req:F008-Auto @prio:Low @type:Edge
  Scenario: 注册接口超时
    When 用户点击注册
    And 接口响应超过 5000ms
    Then 显示 "网络繁忙" 提示
    And 注册按钮恢复可点击状态

# ==============================================================================
# MODULE: F009 - 订单填写
# ==============================================================================
Feature: F009 订单填写

  # --- Group: Happy Path ---

  @req:F009-S01 @prio:Low @type:Happy
  Scenario: 显示车次信息只读
    Given 用户进入订单填写页
    Then 页面显示车次号、发到站与时间信息且不可编辑

  @req:F009-S02 @prio:Low @type:Happy
  Scenario: 显示席别与数量
    Given 用户进入订单填写页
    Then 页面显示席别与可选数量控件

  @req:F009-S03 @prio:Low @type:Happy
  Scenario: 显示票价明细
    Given 用户进入订单填写页
    Then 页面显示票价明细与合计

  @req:F009-S04 @req:F009-S05 @prio:Medium @type:Happy
  Scenario: 显示订单倒计时与不足5分钟警告
    Given 用户进入订单填写页
    Then 页面显示剩余时间 "15:00"
    When 倒计时小于 "05:00"
    Then 显示红色警告

  @req:F009-S07 @prio:Low @type:Happy
  Scenario: 显示已选乘车人列表
    Given 已在预订步骤选择乘车人
    Then 订单填写页显示已选乘车人列表

  @req:F009-S12 @prio:Low @type:Happy
  Scenario: 票种选择包含成人儿童学生
    Given 用户在订单填写页
    Then 票种选择包含 "成人" "儿童" "学生"

  @req:F009-S15 @prio:Medium @type:Happy
  Scenario: 联系人手机号默认填充当前用户手机号
    Given 用户已登录
    When 进入订单填写页
    Then 联系人手机号显示用户手机号且可编辑

  # --- Group: Sad Path (规则反转) ---

  @req:F009-S06 @prio:High @type:Sad
  Scenario: 超时自动释放座位并提示重新预订
    Given 页面显示剩余时间 "00:00"
    When 用户尝试提交订单
    Then 提示 "订单已超时，请重新预订"

  @req:F009-S15 @prio:Medium @type:Sad
  Scenario: 联系人手机号格式错误被拦截
    Given 联系人手机号输入 "138"
    When 保存联系人信息
    Then 显示错误 "请输入有效手机号"

  # --- Group: Edge Case ---

  @req:F009-S22 @prio:Low @type:Edge
  Scenario: 刷新页面恢复临时草稿
    Given 用户填写部分订单信息后刷新页面
    Then 页面恢复草稿内容

# ==============================================================================
# MODULE: F010 - 提交订单
# ==============================================================================
Feature: F010 提交订单

  # --- Group: Happy Path ---

  @req:F010-S01 @req:F010-S02 @req:F010-S03 @req:F010-S04 @prio:High @type:Happy
  Scenario: 提交前完成完整性与格式校验
    Given 订单所有必填项已完成且证件号格式正确
    And 订单未超时且余票充足
    When 点击 "提交订单"
    Then 前置校验通过进入创建流程

  @req:F010-S05 @prio:High @type:Happy
  Scenario: 计算总价包含保险
    Given 已填写所有订单信息
    When 系统计算总价
    Then 总价包含保险等费用并显示

  @req:F010-S06 @req:F010-S07 @req:F010-S08 @req:F010-S09 @prio:High @type:Happy
  Scenario: 创建订单并锁定座位设置支付超时
    Given 前置校验已通过
    When 系统生成唯一订单号并锁定座位资源
    Then 创建订单记录并设置支付超时时间 "30分钟"

  # --- Group: Sad Path (规则反转) ---

  @req:F010-S01 @prio:High @type:Sad
  Scenario: 必填项不完整被拦截
    Given 订单缺少乘车人信息
    When 点击提交订单
    Then 显示错误 "请完成所有必填项"

  @req:F010-S02 @prio:High @type:Sad
  Scenario: 证件号格式错误被拦截
    Given 乘车人身份证号输入 "1234567890"
    When 点击提交订单
    Then 显示错误 "身份证号格式不正确"

  @req:F010-S03 @prio:High @type:Sad
  Scenario: 订单已超时被拦截
    Given 订单倒计时已结束
    When 点击提交订单
    Then 显示错误 "订单已超时"

  @req:F010-S04 @prio:High @type:Sad
  Scenario: 余票不足被拦截
    Given 目标席别余票为0
    When 点击提交订单
    Then 显示错误 "余票不足"

  @req:F010-S16 @prio:Medium @type:Edge
  Scenario: 重复提交防抖处理
    Given 用户点击提交订单
    When 在2秒内重复点击3次
    Then 仅处理第一次提交其余忽略

# ==============================================================================
# MODULE: F011 - 个人信息管理
# ==============================================================================
Feature: F011 个人信息管理

  # --- Group: Happy Path ---

  @req:F011-S01 @prio:Low @type:Happy
  Scenario: 显示用户名不可修改
    Given 用户在个人中心
    Then 显示用户名为只读不可修改

  @req:F011-S02 @prio:Low @type:Happy
  Scenario: 显示真实姓名
    Given 用户在个人中心
    Then 显示真实姓名字段

  @req:F011-S03 @prio:Low @type:Happy
  Scenario: 身份证号脱敏显示
    Given 用户在个人中心
    Then 身份证号以脱敏格式显示

  @req:F011-S04 @prio:Low @type:Happy
  Scenario: 手机号脱敏显示
    Given 用户在个人中心
    Then 手机号以脱敏格式显示

  @req:F011-S05 @prio:Low @type:Happy
  Scenario: 邮箱脱敏显示
    Given 用户在个人中心
    Then 邮箱以脱敏格式显示

  @req:F011-S06 @prio:Low @type:Happy
  Scenario: 显示账户信息时间
    Given 用户在个人中心
    Then 显示注册时间与最后登录时间

  @req:F011-S07 @prio:Low @type:Happy
  Scenario: 显示账户等级与积分
    Given 用户在个人中心
    Then 显示账户等级与积分

  @req:F011-S08 @prio:Low @type:Happy
  Scenario: 显示实名认证状态
    Given 用户在个人中心
    Then 显示实名认证状态

  @req:F011-S16 @prio:Medium @type:Happy
  Scenario: 修改密码输入旧密码
    Given 用户打开修改密码
    When 输入旧密码
    Then 系统允许继续输入新密码

  @req:F011-S17 @prio:Medium @type:Happy
  Scenario: 输入新密码强度验证并确认
    Given 用户输入新密码 "Abc12345"
    And 再次输入确认密码 "Abc12345"
    Then 显示强度通过并保存成功

# ==============================================================================
# MODULE: F012 - 乘客管理
# ==============================================================================
Feature: F012 乘客管理

  # --- Group: Happy Path ---

  @req:F012-S01 @prio:Low @type:Happy
  Scenario: 显示所有常用乘车人
    Given 用户进入乘客管理
    Then 列表显示所有常用乘车人

  @req:F012-S02 @prio:Low @type:Happy
  Scenario: 乘车人卡片信息展示
    Given 用户进入乘客管理
    Then 卡片显示姓名、证件类型与脱敏号码

  @req:F012-S03 @prio:Low @type:Happy
  Scenario: 显示可选手机号
    Given 用户进入乘客管理
    Then 卡片显示手机号（可选）

  @req:F012-S04 @prio:Low @type:Happy
  Scenario: 显示旅客类型
    Given 用户进入乘客管理
    Then 卡片显示旅客类型（成人/儿童/学生）

  @req:F012-S05 @prio:Low @type:Happy
  Scenario: 设为默认编辑删除按钮可用
    Given 用户进入乘客管理
    Then 每个卡片显示设为默认、编辑、删除按钮

  @req:F012-S06 @prio:Low @type:Happy
  Scenario: 默认乘车人标识显示
    Given 存在默认乘车人
    Then 该卡片显示默认标识

  @req:F012-S08 @req:F012-S09 @req:F012-S10 @prio:Medium @type:Happy
  Scenario: 添加乘车人成功
    Given 用户输入姓名 "李四"，证件类型 "身份证"，号码 "110105199001010034"
    And 可选手机号 "13800138000"
    When 点击 "保存"
    Then 新乘车人显示在列表中

  @req:F012-S14 @prio:Medium @type:Happy
  Scenario: 实时验证反馈
    Given 用户在证件号码输入框中逐步输入
    When 达到规则边界
    Then 即时显示通过或错误提示

  # --- Group: Sad Path (规则反转) ---

  @req:F012-S12 @prio:High @type:Sad
  Scenario: 身份证校验位错误被拦截
    Given 输入身份证号 "110105199001010033" (校验位错误)
    When 点击保存
    Then 显示错误 "身份证号码不合法"

  @req:F012-S13 @prio:Medium @type:Sad
  Scenario: 护照格式错误被拦截
    Given 证件类型选择 "护照" 且号码 "ABC"
    When 点击保存
    Then 显示错误 "护照号码格式不正确"

  # --- Group: Edge Case ---

  @req:F012-Auto @prio:Low @type:Edge
  Scenario: 超长姓名与特殊字符拦截
    Given 输入姓名 "张三张三张三张三张三张三张三张三张三"
    When 点击保存
    Then 显示错误 "姓名长度超限或包含非法字符"

# ==============================================================================
# MODULE: F013 - 订单管理
# ==============================================================================
Feature: F013 订单管理

  # --- Group: Happy Path ---

  @req:F013-S01 @req:F013-S10 @req:F013-S13 @prio:Medium @type:Happy
  Scenario: 订单列表筛选排序与分页
    Given 用户选择订单状态 "待支付"
    Then 列表按创建时间倒序显示
    And 每页显示10条

  @req:F013-S03 @req:F013-S15 @prio:Medium @type:Happy
  Scenario: 搜索订单并查看详情
    Given 用户在搜索框输入 "订单号：202511220001"
    When 点击搜索
    Then 显示匹配订单卡片
    And 点击卡片展开详情

  @req:F013-S04 @prio:Low @type:Happy
  Scenario: 订单号显示在卡片上
    Given 订单列表加载
    Then 每张卡片显示订单号

  @req:F013-S05 @prio:Low @type:Happy
  Scenario: 展示车次信息出发到达
    Given 订单列表加载
    Then 卡片显示出发地到目的地信息

  @req:F013-S06 @prio:Low @type:Happy
  Scenario: 展示出发时间
    Given 订单列表加载
    Then 卡片显示出发时间

  @req:F013-S07 @prio:Low @type:Happy
  Scenario: 展示乘车人姓名数量
    Given 订单列表加载
    Then 卡片显示乘车人姓名以及数量信息

  @req:F013-S08 @prio:Low @type:Happy
  Scenario: 展示订单金额及状态标签
    Given 订单列表加载
    Then 卡片显示订单金额与状态标签

  @req:F013-S09 @prio:Low @type:Happy
  Scenario: 展示操作按钮按状态变化
    Given 订单列表加载
    Then 卡片显示对应状态下的操作按钮

  # --- Group: Sad Path ---

  @req:F013-S24 @prio:Medium @type:Sad
  Scenario: 待支付订单取消需确认
    Given 用户在订单卡片点击 "取消订单"
    When 弹出确认窗口选择取消
    Then 订单状态变更为已取消

  @req:F013-S02 @prio:Low @type:Sad
  Scenario: 自定义时间范围不合法被拦截
    Given 选择时间范围结束早于开始
    When 应用筛选
    Then 提示 "时间范围无效"

  @req:F013-S23 @prio:Medium @type:Sad
  Scenario: 待支付订单立即支付跳转支付页
    Given 用户点击 "立即支付"
    Then 跳转到支付模块 F014

# ==============================================================================
# MODULE: F014 - 订单支付
# ==============================================================================
Feature: F014 订单支付

  # --- Group: Happy Path ---

  @req:F014-S01 @req:F014-S03 @prio:High @type:Happy
  Scenario: 扫码支付流程成功
    Given 用户在PC端选择微信或支付宝扫码支付
    When 显示二维码并在手机完成支付
    Then 支付成功后更新订单状态并显示成功页面

  @req:F014-S02 @req:F014-S04 @prio:High @type:Happy
  Scenario: 移动端APP内支付成功
    Given 用户在移动端选择微信或支付宝APP内支付
    When 调起第三方支付完成支付
    Then 返回成功并更新订单状态

  @req:F014-S05 @req:F014-S06 @prio:Medium @type:Happy
  Scenario: 银行卡快捷与网银支付成功
    Given 用户选择已绑卡快捷支付或添加新卡网银支付
    When 完成支付流程
    Then 更新订单状态为已支付

  @req:F014-S09 @req:F014-S10 @prio:Low @type:Happy
  Scenario: 显示订单号与金额优惠信息
    Given 用户在支付确认页
    Then 显示订单号与订单金额及优惠信息

  @req:F014-S12 @req:F014-S16 @prio:Medium @type:Happy
  Scenario: 支付倒计时与状态轮询
    Given 页面显示支付剩余时间 "30:00"
    When 启动支付状态轮询
    Then 在3分钟内获取到成功状态

  @req:F014-S13 @req:F014-S14 @prio:Medium @type:Happy
  Scenario: 创建支付订单并调起支付接口
    Given 用户点击去支付
    When 创建支付订单
    Then 调起支付接口并跳转第三方支付页面

  @req:F014-S17 @req:F014-S20 @prio:High @type:Happy
  Scenario: 支付成功后更新订单与成功页展示
    Given 第三方支付结果为成功
    When 回调处理订单状态
    Then 显示支付成功页面

  # --- Group: Sad Path ---

  @req:F014-S22 @prio:High @type:Sad
  Scenario: 支付失败显示原因
    Given 第三方返回失败
    When 回调处理
    Then 显示失败原因并允许重新尝试

  @req:F014-S12 @prio:High @type:Sad
  Scenario: 支付倒计时到期取消支付
    Given 支付剩余时间为 "00:00"
    When 用户尝试继续支付
    Then 提示 "支付已超时"

# ==============================================================================
# MODULE: F015 - 车票改签
# ==============================================================================
Feature: F015 车票改签

  # --- Group: Happy Path ---

  @req:F015-S01 @prio:Medium @type:Happy
  Scenario: 验证订单状态可改签
    Given 订单状态为已支付且未使用
    Then 允许进入改签流程

  @req:F015-S02 @prio:Low @type:Happy
  Scenario: 检查车票类型可改签
    Given 选择待改签车票
    Then 显示可改签类型或提示不可改签

  @req:F015-S03 @prio:Low @type:Happy
  Scenario: 检查改签次数限制
    Given 订单改签次数为0
    Then 允许继续改签

  @req:F015-S04 @prio:Low @type:Happy
  Scenario: 检查时间限制开车前30分钟
    Given 距发车时间为40分钟
    Then 允许发起改签

  @req:F015-S05 @prio:Low @type:Happy
  Scenario: 显示改签规则说明
    Given 用户进入改签页
    Then 展示改签规则说明

  @req:F015-S06 @prio:Low @type:Happy
  Scenario: 默认显示同一路线车次
    Given 用户进入改签选择车次
    Then 默认显示同一路线车次

  @req:F015-S07 @prio:Low @type:Happy
  Scenario: 日期范围前后3天筛选
    Given 用户查看改签日期
    Then 可筛选前后3天范围

  @req:F015-S09 @prio:Low @type:Happy
  Scenario: 展示可改签车次与余票信息
    Given 用户选择日期
    Then 列表显示车次及余票信息

  @req:F015-S12 @prio:Medium @type:Happy
  Scenario: 差价计算展示结果
    Given 用户选择新车次
    Then 系统计算补差价/退差价/无需补退并显示

  @req:F015-S15 @prio:Medium @type:Happy
  Scenario: 改签协议确认并提交请求
    Given 用户勾选改签协议
    When 提交改签请求
    Then 进入改签处理流程

  @req:F015-S16 @prio:Medium @type:Happy
  Scenario: 改签成功显示新订单原订单标记改签
    Given 改签处理成功
    Then 显示新订单信息并将原订单标记为已改签

  # --- Group: Edge Case ---

  @req:F015-S18 @prio:Low @type:Edge
  Scenario: 新车次余票不足提示选择其他车次
    Given 新车次余票为0
    Then 显示提示选择其他车次

# ==============================================================================
# MODULE: F016 - 用户登出
# ==============================================================================
Feature: F016 用户登出

  # --- Group: Happy Path ---

  @req:F016-S01 @req:F016-S04 @req:F016-S07 @prio:Medium @type:Happy
  Scenario: 导航栏退出登录成功并清理本地状态
    Given 用户点击导航栏退出登录
    When 清除本地token与用户缓存
    Then 跳转首页并更新导航栏为未登录状态

  @req:F016-S02 @prio:Low @type:Happy
  Scenario: 个人中心安全退出
    Given 用户在个人中心
    When 选择安全退出
    Then 返回首页并更新导航状态

  @req:F016-S03 @prio:Low @type:Happy
  Scenario: 登出确认弹窗
    Given 用户发起退出
    Then 弹出确认弹窗允许取消或确认

  @req:F016-S05 @prio:Low @type:Happy
  Scenario: 清除session与用户缓存信息
    Given 用户确认退出
    Then 清除会话与用户缓存信息

  # --- Group: Sad Path ---

  @req:F016-S06 @prio:Low @type:Sad
  Scenario: 后端失效token记录失败的容错
    Given 后端记录失效token接口返回错误
    When 前端继续清理本地状态
    Then 用户仍被视为登出完成

  # --- Group: Edge Case ---

  @req:F016-S08 @prio:Low @type:Edge
  Scenario: 网络异常下本地强制登出
    Given 触发登出时网络断开
    When 前端无法与后端通信
    Then 本地清理并提示 "已本地登出"