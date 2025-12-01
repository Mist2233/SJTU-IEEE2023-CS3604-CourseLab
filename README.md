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

请按照以下步骤启动前端和后端服务。

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

---

## 🛠 开发与协作规范 (Git Workflow & Issues)

采用“双线并行”的简化协作模型：`develop` 为实时开发线，`main` 为稳定发布线。所有合并由仓库 owner 直接在命令行完成。

### 🌿 分支模型
- `main`：稳定分支；受保护，仅 owner 可 push；历史保持线性
- `develop`：实时开发分支；日常开发直接提交到该分支
- 可选：临时 `feat/issue-编号-描述` 分支用于较大改动，合并回 `develop` 后删除

### 🔄 工作流概览
1. 开发者在 `develop` 编码并推送；
2. Owner 周期性发版：将 `develop` 直接合并到 `main`，并打标签发布
3. 贡献者本地仅同步分支，不在本地执行任何“把 develop 合到 main”的操作

### 🤝 合并实现（owner）
- 周期发布（develop → main，优先线性历史）：
```bash
# 1) 同步远端引用
git fetch origin

# 2) 切到 main 并确保本地与远端一致
git checkout main
git pull

# 3) 尝试快进到 develop 最新提交（失败说明分叉）
#    首选快进；失败则生成合并提交以保留历史
git merge --ff-only origin/develop || git merge origin/develop

# 4) 推送稳定分支
git push origin main

# 5) 打main版本标签并推送（发布点）
git tag -a v1.0.0 -m "release"
git push origin v1.0.0
```
- 精确对齐到 `develop`（覆盖式，对主线有强约束时使用）：
```bash
git fetch origin
git checkout main
git reset --hard origin/develop
git push origin main
```
- 说明：合并前需确保 `origin/develop` 通过测试；合并后用标签标记发布点。

### ✅ 日常命令（这里只考虑简单同步情况，即每次commit前和远端同步，commit后必定会同步到远端，不会存在本地commit和远端commit不一致的情况）
```bash
# 获取内容
git checkout develop
git pull

# 在 develop 开发后直接提交并推送
git pull # 保证版本的实时一致性
git add .
git commit -m "feat: 首页导航文案调整 (Refs #12)"
git push

# 可选：大改动走 feature 分支并合回 develop
git checkout -b feat/issue-编号-简短描述
# 开发完成后
git checkout develop
git pull
git merge feat/issue-编号-简短描述
git push
git branch -d feat/issue-编号-简短描述

# 获取最新稳定版本
git checkout main
git pull
```

### 📆 课堂周期流程
- 每轮上课前，我们尽力保证 `develop` 稳定并合并到 `main`
- 课程需求与练习 Bug：统一在 `develop` 维护（新一轮迭代在 `develop` 开始）
- PR 规范：所有 PR 必须以 `develop` 为目标分支；针对 `main` 的 PR 将不予受理

### ⚠️ 注意事项
- 禁止非 owner 向 `main` push；PR 请选择 `develop`

-----

## 📝 常用命令速查

- **查看当前分支**：`git branch`
- **查看状态**（有没有没保存的文件）：`git status`
- **放弃本地修改**（慎用）：`git checkout .`
  
