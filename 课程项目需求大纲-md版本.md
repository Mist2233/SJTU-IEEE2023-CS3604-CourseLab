# 课程项目说明

1.  如下展示的是课程项目基本需求的范围划定，包括：
    *   主要界面布局
    *   核心组件 (红框标出)
    *   核心功能模块

    需要自行围绕这些功能，探索原网站，编写具体的功能点、边界场景，例如“密码错误，请重试”。

2.  对于给出的界面和功能模块中的子功能尽可能还原，未提及的界面和功能无需考虑或从简，如支付功能可简单弹出表单“一键支付”。

3.  对于后台数据，例如车票、机票，可编写一系列后台数据写入数据库 (MySQL, SQLite) 或其他存储方式。考虑一些快捷编写方式，如：
    *   编写程序在给定的范围内随机填写各个字段，生成车票信息写入文件或数据库；
    *   使用 AI 生成一系列数据库插入语句；

---

# 项目一、铁路 12306 

## 界面需求（首页/查询页）

*   顶部导航栏 (登录/注册入口、个人中心入口)
*   车票查询表单 (出发地/目的地输入框、日期选择器、查询按钮)
*   常用功能快捷入口 (个人中心、车票查询页入口)

![铁路12306首页截图](https://storage.googleapis.com/generativeai-downloads/images/d3782b5e7d589d97.png)

## 界面需求（登录/注册页）

*   登录表单 (用户名/手机号、密码、验证码)
*   注册入口 (手机号注册、邮箱注册选项)

![铁路12306登录页截图](https://storage.googleapis.com/generativeai-downloads/images/4b1fc7e4b971165a.png)

![铁路12306注册页截图](https://storage.googleapis.com/generativeai-downloads/images/5f33f81e33053723.png)

## 界面需求（车次列表页）

*   查询条件展示区 (出发地、目的地、日期)
*   筛选条件展示区 (车次类型、车站、席别)
*   车次列表 (车次详细信息、排序选项)

![铁路12306车次列表页截图](https://storage.googleapis.com/generativeai-downloads/images/64f1d43eb43e147e.png)

## 界面需求（订单填写页）

*   列车信息
*   乘客信息 (选择乘车人)
*   购票信息 (票种、席别、姓名等)
*   提交订单按钮

![铁路12306订单填写页截图](https://storage.googleapis.com/generativeai-downloads/images/4c37574b6c310b90.png)

## 界面需求（个人中心）

*   用户基本信息 (姓名、身份证号等)
*   乘客管理 (添加、编辑、删除)
*   订单管理 (历史订单)

![铁路12306个人中心-基本信息截图](https://storage.googleapis.com/generativeai-downloads/images/1301bb261d7eb65e.png)

![铁路12306个人中心-乘客管理截图](https://storage.googleapis.com/generativeai-downloads/images/b02c0c7a5f64b3cd.png)

![铁路12306个人中心-订单管理截图](https://storage.googleapis.com/generativeai-downloads/images/7efd2e966847847c.png)

## 核心功能模块

**1. 登录与注册**
*   首页进入登录与注册页面
*   填写必要信息注册
*   通过账号密码登录

**2. 车票查询与筛选**
*   首页车票查询卡片
    *   仅考虑单程、普通票
    *   输入出发地、到达地、出发日期查询
*   车次列表页的查询、筛选功能
    *   筛选可精简类别，如只考虑[高铁，动车，直达], [一等座, 二等座, 软卧, 硬卧]

**3. 订单管理**
*   通过车次列表页预订车票
*   进入订单填写页完成订单
*   进入订单管理页支付/取消订单

**4. 乘客管理**
*   一个账号可以关联多个乘客
*   可以为关联的乘客购买车票
*   乘客管理页增删乘客

**5. 个人信息管理**
*   个人中心页修改个人信息

---

# 项目二、携程旅行

## 界面需求（首页）

*   顶部导航栏 (登录、注册入口，个人中心入口)
*   侧边栏 (提供机票相关功能的快捷入口，其余部分实现前端组件即可，不需要实现点击逻辑)
*   机票功能选项卡-国内、国际/港澳台 (机票功能选项卡中的搜索表单，搜索历史)

![携程旅行首页截图](https://storage.googleapis.com/generativeai-downloads/images/3d74c207e2de15c7.png)

## 界面需求（登录/注册页）

*   登录表单 (账号密码、验证码登录)
*   注册流程

![携程旅行登录页截图](https://storage.googleapis.com/generativeai-downloads/images/e775a40a2327c4bd.png)

![携程旅行注册流程1截图](https://storage.googleapis.com/generativeai-downloads/images/e8c8191925b42661.png)

![携程旅行注册流程2截图](https://storage.googleapis.com/generativeai-downloads/images/223b9d9c9b19e2f4.png)

## 界面需求（航班列表页）

*   日期选择栏
*   条件筛选栏
*   搜索/筛选结果列表

![携程旅行航班列表页截图](https://storage.googleapis.com/generativeai-downloads/images/735c05d7621c168f.png)

## 界面需求（订单填写页）

*   订票进度图
*   添加乘机人
*   机票基本信息

![携程旅行订单填写页截图](https://storage.googleapis.com/generativeai-downloads/images/a5e0d4a2b9d9b626.png)

## 界面需求（个人中心）

*   基本信息与编辑
*   订单列表 (忽略“待点评”)
*   订单详情
*   常用旅客信息

![携程旅行个人中心-个人信息设置截图](https://storage.googleapis.com/generativeai-downloads/images/5c2c7b508d0e527d.png)

![携程旅行个人中心-订单列表截图](https://storage.googleapis.com/generativeai-downloads/images/e4a13e6181b5c401.png)

![携程旅行个人中心-订单详情截图](https://storage.googleapis.com/generativeai-downloads/images/d38104c97973d937.png)

![携程旅行个人中心-常用旅客信息截图](https://storage.googleapis.com/generativeai-downloads/images/81b23838bb892550.png)

## 核心功能模块

**1. 登录与注册**
*   首页进入登录与注册页面
*   注册遵循注册流程
*   登录通过账号密码、验证码登录

**2. 机票的查询与筛选**
*   首页机票搜索栏
*   航班列表页展示搜索结果
*   根据条件筛选航班

**3. 订单管理**
*   通过航班列表页预订机票
*   进入订单填写页完成订单
*   进入订单管理页取消订单
*   进入订单详情页查看、支付订单

**4. 旅客管理**
*   一个账号可以关联多个旅客
*   订票时可选择已关联旅客
*   常用旅客信息页查询、新增、编辑、删除

**5. 个人信息管理**
*   个人中心页修改个人基本信息