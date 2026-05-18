# Mars3D 后台管理 API

<p align="center">基于 NestJS + TypeORM + PostgreSQL 的 Mars3D 后台管理系统 API 服务</p>

## 项目介绍

Mars3D 后台管理 API 为三维地理信息展示平台提供后端服务支持，包括用户认证、RBAC 权限管理、图层配置、地图标记、视角书签、操作日志等功能。

## 技术选型

- **框架**: [NestJS](https://nestjs.com/)
- **ORM**: [TypeORM](https://typeorm.io/)
- **数据库**: [PostgreSQL](https://www.postgresql.org/)
- **认证**: JWT (Access Token + Refresh Token)
- **文档**: [Swagger](https://swagger.io/)

## 功能模块

| 模块 | 说明 |
|------|------|
| 认证模块 | 登录/注销/刷新令牌/修改密码 |
| 用户管理 | CRUD + 角色分配 + 状态切换 |
| 角色管理 | CRUD + 权限分配 + 图层权限分配 |
| 权限管理 | 权限树 CRUD（菜单/按钮/API 三种类型） |
| 图层配置 | CRUD + 按用户权限返回可访问图层 + 导出配置 |
| 地图标记 | CRUD + 用户标记管理 + 权限过滤 |
| 视角书签 | CRUD + 用户书签管理 |
| 操作日志 | 自动记录 POST/PUT/DELETE 操作 + 统计查询 |

## 数据库模型

共 11 张表：

- `sys_user` — 用户表
- `sys_role` — 角色表
- `sys_user_role` — 用户-角色关联
- `sys_permission` — 权限表
- `sys_role_permission` — 角色-权限关联
- `map_layer` — 图层配置表（config: JSONB）
- `sys_role_layer` — 角色-图层权限
- `map_marker` — 地图标记表（geometry/style/properties: JSONB）
- `map_bookmark` — 书签表（view: JSONB）
- `sys_log` — 操作日志表
- `sys_refresh_token` — 刷新令牌表

## 快速开始

### 环境要求

- **Node.js**: >= 18.0.0
- **PostgreSQL**: >= 14

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制并修改 `.env` 文件：

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=mars3d
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=2h
PORT=3000
```

### 初始化数据库

确保 PostgreSQL 已启动，创建 `mars3d` 数据库：

```sql
CREATE DATABASE mars3d;
```

### 初始化种子数据

```bash
npm run seed
```

默认创建：
- 管理员账号：`admin` / `admin123`
- 默认角色：admin（超级管理员）、editor（编辑者）、viewer（查看者）
- 31 个权限节点（系统管理 + 地图配置）

### 启动服务

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

服务启动后访问：
- API: http://localhost:3000/api
- Swagger 文档: http://localhost:3000/api/docs

## 项目结构

```
src/
├── main.ts                    # 入口文件
├── app.module.ts              # 根模块
├── common/                    # 公共层
│   ├── decorators/            # 自定义装饰器
│   ├── guards/                # 认证/权限守卫
│   ├── interceptors/          # 响应转换/日志拦截器
│   ├── filters/               # 异常过滤器
│   └── dto/                   # 通用 DTO
├── modules/                   # 业务模块
│   ├── auth/                  # 认证模块
│   ├── user/                  # 用户模块
│   ├── role/                  # 角色模块
│   ├── permission/            # 权限模块
│   ├── layer/                 # 图层配置模块
│   ├── marker/                # 地图标记模块
│   ├── bookmark/              # 书签模块
│   └── log/                   # 日志模块
├── seeds/                     # 种子数据
└── config/                    # 配置文件
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/refresh | 刷新令牌 |
| POST | /api/auth/logout | 注销 |
| GET | /api/auth/profile | 获取当前用户信息 |
| GET | /api/users | 用户列表 |
| POST | /api/users | 创建用户 |
| PUT | /api/users/:id | 更新用户 |
| POST | /api/users/:id/roles | 分配角色 |
| GET | /api/roles | 角色列表 |
| PUT | /api/roles/:id/permissions | 分配权限 |
| PUT | /api/roles/:id/layers | 分配图层权限 |
| GET | /api/permissions/tree | 权限树 |
| GET | /api/map-layers/accessible | 获取可访问图层 |
| GET | /api/map-layers/config/export | 导出图层配置 |
| GET | /api/markers/my | 获取我的标记 |
| GET | /api/bookmarks/my | 获取我的书签 |
| GET | /api/logs | 日志列表 |
| GET | /api/logs/stats | 日志统计 |

完整接口文档请访问 http://localhost:3000/api/docs

## 许可证

Apache-2.0
