# 🚂 12306 网页复现项目 (AI Agent 协作开发版)

本项目旨在利用 AI Agent 工作流与人工协同，对 12306 购票网站的核心功能与前端界面进行高保真复刻。

---

## 📂 项目结构说明

为保持项目整洁，我们将代码进行了分层管理：

- **`core/`**: **[核心工作区]** 项目的主代码库。
  - `frontend/`: 前端 React 项目源码。
  - `backend/`: 后端服务源码。
  - `Implement/` & `Reference/`: AI Agent 的中间产物和参考资料。
- **`_archive/`**: **[归档区]** 存放历史废弃版本、测试脚本及旧的文档。
- **`scripts/`**: 项目辅助工具（如网页解构爬虫）。

---

## 🚀 如何启动项目 (Quick Start)
### 1. 前端启动 (Frontend)

前端基于 React + Vite + Ant Design 构建。

```bash
# 1. 进入前端目录 (注意：是在 core 目录下)
cd core/frontend

# 2. 安装依赖 (初次运行或 package.json 变更时执行)
npm install

# 3. 启动开发服务器
npm run dev
```

启动成功后，请访问终端提示的地址（通常为 `http://localhost:5173`）。

### 2. 后端启动 (Backend)

后端基于 Node. Js + TypeScript + Prisma 构建。

```bash
# 1. 新开一个终端窗口，进入后端目录
cd core/backend

# 2. 安装依赖
npm install

# 3. 启动后端服务
npm run dev
```

## 测试驱动

### 测试架构

我们遵循 **测试金字塔** 原则，测试文件按 **页面/功能模块** 进行物理隔离（目前我们已完成前端测试案例规范化，后端尚未完成）：

```text
core_1/frontend/test
├── pages/                  # 按页面分类的前端测试
│   ├── P001_Home/
│   │   ├── unit/           # 单元测试 (纯逻辑/工具函数)
│   │   ├── component/      # 组件测试 (UI渲染与交互)
│   │   └── integration/    # 页面级集成测试
│   └── P003_Login/ ...
├── components/                # 通用组件测试
│   └── modules/ ...
└── e2e/                    # 端到端全链路测试(尚未实现，预期后续进行)
```

### 测试运行

请确保你已进入 frontend (前端测试) 或 backend (后端测试) 目录。

🟢 运行全部测试
执行所有单元、组件和集成测试，生成覆盖率报告。

```bash
npm test
```

🎯 运行指定模块 (推荐)
无需等待所有测试跑完，只运行你正在开发的模块。Vitest 支持模糊匹配路径。

```bash
# 场景：只测 P001 首页的所有内容
npm test P001

# 场景：只测登录页的组件
npm test P003_Login/component

# 场景：只测 Header 组件
npm test Header
```

## 📝 常用命令速查

- **查看当前分支**：`git branch`
- **查看状态**（有没有没保存的文件）：`git status`
- **放弃本地修改**（慎用）：`git checkout .`
