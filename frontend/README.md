# Frontend Module

- 说明：前端代码（React + TS）独立成 frontend 目录/仓库。
- 结构：frontend/hjzdm-frontend（现有前端应用结构）或迁移后的统一入口结构
- 构建：npm install | npm run build
- 启动：npm start（开发环境代理指向后端 9090）
- 代理：setupProxy.js 将 API 请求代理到后端（9090）
