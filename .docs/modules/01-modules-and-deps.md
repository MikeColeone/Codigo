# 3. 模块级设计思路（职责 / 边界 / 依赖）

本章按“业务域（Domain）+ 技术域（Infrastructure）”拆分模块，明确每个模块的职责边界、对外接口协议与依赖关系。

## 3.1 后端模块（apps/server）

后端为单 NestJS 应用，统一承载 REST 与 WebSocket，API 全局前缀为 `/api`。

- **User 域**
  - 职责：注册、登录、验证码、用户资料、密码修改、JWT 签发与校验。
  - 对外协议：REST（`/api/auth/*`、`/api/users/*`；另有历史兼容 `/api/user/*`）。
  - 关键依赖：MySQL（user 表）、Redis（验证码/缓存）、JWT、短信服务。
- **Flow 域（页面/发布/协作/工作区）**
  - 职责：页面发布、可见性与过期控制、页面版本快照、页面工作区文件系统、协作成员管理、实时协作（Socket.io）。
  - 对外协议：REST（`/api/pages/*`、`/api/pages/:id/workspace/*`、`/api/pages/:id/collaborators`）、WebSocket（`/collaboration` 命名空间）。
  - 关键依赖：MySQL（page/component/page_version/page_collaborator 等）、Redis（可用于锁/缓存扩展）。
- **Template 域**
  - 职责：模板查询/详情/管理、默认模板初始化与版本升级。
  - 对外协议：REST（`/api/templates/*`）。
  - 关键依赖：MySQL（template 表）。
- **Resources 域**
  - 职责：资源上传、资源记录、列表与删除。
  - 对外协议：REST（`/api/resources/*`）。
  - 关键依赖：OSS（对象存储）、MySQL（resources 表）。
- **Admin 域**
  - 职责：后台治理能力（用户管理、页面治理、组件治理）、RBAC 与权限点控制。
  - 对外协议：REST（`/api/admin/*`）。
  - 关键依赖：MySQL（user/page/component/page_version 等）、鉴权守卫链（JWT + Roles + Permission）。

## 3.2 前端模块（apps/client / apps/admin / packages/release / apps/ide）

- **apps/client（编辑器与工作台）**
  - 职责：页面搭建、组件编排、发布/预览、协作者与权限入口、画布渲染与交互。
  - 物料约束：编辑器 `registry/catalog` 需与 `@codigo/materials` 已注册物料保持一一对齐；右侧属性面板按组件类型挂接专属 props editor，事件配置统一走 `onClick -> ActionConfig[]`。
  - 对外协议：REST（对接 `apps/server` 的 `/api/*`）、WebSocket（对接 `/collaboration`）。
  - 关键依赖：`@codigo/schema`（协议与类型）、`@codigo/materials`（运行时物料）、`@codigo/render`、`@codigo/editor-sandbox`。
- **apps/admin（系统管理前端）**
  - 职责：管理员登录、用户与权限治理、页面/组件统计与治理。
  - 对外协议：REST（对接 `/api/admin/*`）。
  - 关键依赖：`@codigo/schema`（GlobalRole 等类型）。
- **packages/release（发布端）**
  - 职责：访问者读取发布数据并渲染；路由以 `id` 为核心。
  - 对外协议：REST（对接 `/api/pages/:id` 等发布读取接口）。
- **apps/ide（WebIDE 外壳）**
  - 职责：加载页面源码工作区、提供编辑能力；通过后端 workspace API 进行文件树/读写/配置获取。
  - 对外协议：REST（对接 `/api/pages/:id/workspace/*`）。

## 3.3 共享包（packages/*）与分层

建议按“协议层 -> 运行时算法层 -> 渲染层/物料层 -> 应用层”分层治理。

```mermaid
flowchart TB
  schema[@codigo/schema<br/>协议与类型]
  runtime[@codigo/runtime-core<br/>纯算法/解析]
  materials[@codigo/materials<br/>物料与 registry]
  render[@codigo/render<br/>生成与桥接]
  sandbox[@codigo/editor-sandbox<br/>沙箱输出]

  client[apps/client]
  admin[apps/admin]
  server[apps/server]
  ide[apps/ide]
  release[packages/release]

  runtime --> schema
  materials --> schema
  render --> schema
  sandbox --> schema

  client --> schema
  client --> materials
  client --> render
  client --> sandbox

  admin --> schema
  server --> schema
  release --> schema
```

## 3.4 模块依赖矩阵（约束 + 现状）

说明：矩阵用于表达“允许依赖”与“禁止依赖”的硬约束；具体细节以各 package.json 的依赖为准。

| From \\ To | packages/* | apps/* |
|---|---|---|
| packages/* | 允许（向下依赖） | 禁止（不得依赖 apps） |
| apps/* | 允许（可依赖 packages） | 禁止跨 app 源码互相依赖（client/server/ide 之间） |

## 3.5 接口边界与解耦原则

- **单一事实源**：跨端类型/协议统一由 `@codigo/schema` 提供，避免“前后端各自维护一套字段/枚举”的双源。
- **物料一致性**：新增/替换物料时，需要同步更新 `@codigo/materials` 注册、`apps/client` 组件目录与 `registry/catalog` 映射；例如 `geoMap` 地图物料同时承载运行时渲染、右侧属性面板与模板预设消费。
- **领域边界清晰**：Admin 域只承接治理能力；编辑器域（client）不承接后台治理业务逻辑。
- **依赖倒置**：
  - 应用层依赖抽象（协议/类型/接口），基础设施实现（DB/Redis/OSS）在后端模块内部封装。
  - 前端对后端只依赖稳定的 REST 合约与错误码，不依赖后端实现细节。
