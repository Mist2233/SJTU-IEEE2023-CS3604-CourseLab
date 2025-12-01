# 前端项目结构说明文档 (src 目录)

本文档详细说明了 `core/frontend/src` 目录下各个文件及文件夹的具体用途与职责，旨在帮助开发者快速理解项目架构。

## 目录结构概览

```text
src/
├── assets/             # 静态资源目录
├── components/         # 通用组件目录
├── pages/              # 页面组件目录
├── services/           # API 服务目录(链接后端)
├── App.css             # App 组件样式
├── App.jsx             # 根组件与路由配置（通用组件及页面跳转配置位置）
├── index.css           # 全局基础样式
├── main.jsx            # 应用入口文件
└── vite-env.d.ts       # Vite 环境变量类型定义
```
