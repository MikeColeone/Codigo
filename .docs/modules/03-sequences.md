# 5. 核心业务流程时序图（含异常处理）

本章的时序图用于描述“调用链路 + 关键分支 + 异常处理策略”。图稿以 Mermaid 形式嵌入正文，同时建议将相同源码复制到 `.docs/diagrams/` 以便复用与自动渲染。

对应图稿源码索引：
- `.docs/diagrams/seq-login-password.mmd`
- `.docs/diagrams/seq-page-release.mmd`
- `.docs/diagrams/seq-get-release.mmd`
- `.docs/diagrams/seq-workspace-sync-write.mmd`
- `.docs/diagrams/seq-collaboration-socketio.mmd`
- `.docs/diagrams/seq-resources-upload.mmd`
- `.docs/diagrams/seq-template-ensure-defaults.mmd`
- `.docs/diagrams/seq-admin-guard-chain.mmd`

## 5.1 登录（账号密码）

```mermaid
sequenceDiagram
  autonumber
  actor U as 用户
  participant FE as 前端（client/admin）
  participant API as apps/server
  participant Auth as AuthController/AuthService
  participant DB as MySQL(user)

  U->>FE: 输入账号/密码
  FE->>API: POST /api/auth/tokens/password
  API->>Auth: validateCredentials()
  Auth->>DB: SELECT user by phone/username
  DB-->>Auth: user record
  Auth->>Auth: bcrypt compare(password)
  alt 密码正确且用户有效
    Auth-->>API: sign JWT (7d)
    API-->>FE: {code:0,data:{token,...}}
    FE-->>U: 登录成功
  else 密码错误
    Auth-->>API: throw HttpException(400)
    API-->>FE: {code:400,data:null,msg,message,error{...}}
    FE-->>U: 提示“账号或密码错误”
  else 用户被冻结
    Auth-->>API: throw HttpException(403)
    API-->>FE: {code:403,data:null,...}
    FE-->>U: 提示“账号已冻结”
  end
```

## 5.2 发布/更新我的页面（生成版本快照）

```mermaid
sequenceDiagram
  autonumber
  actor U as 发布者
  participant FE as apps/client
  participant API as apps/server
  participant S as PageReleaseService
  participant DB as MySQL(page/component/page_version)

  U->>FE: 点击发布
  FE->>API: PUT /api/pages/me (Authorization)
  API->>API: JwtStrategy.validate()
  API->>S: release(schema)
  S->>DB: BEGIN
  S->>DB: UPSERT page（account_id 等）
  S->>DB: REPLACE components（按 node_id 扁平化）
  S->>DB: INSERT page_version（schema_data 快照）
  S->>DB: COMMIT
  API-->>FE: {code:0,data:{pageId}}
  FE-->>U: 发布成功（生成分享/发布链接）
```

异常处理策略（建议基线）：
- DB 写入失败：回滚事务，返回 `Code.DatabaseError` 或映射为 `500`，并记录操作日志（见 NFR/可观测性）。
- schema 校验失败：返回 `Code.InvalidParams`，前端提示并定位到具体字段（建议补 DTO 校验）。

## 5.3 获取发布页面（匿名访问 + 可见性/过期判断）

```mermaid
sequenceDiagram
  autonumber
  actor V as 访问者
  participant FE as packages/release 或 apps/client
  participant API as apps/server
  participant G as OptionalJwtAuthGuard
  participant S as PageReleaseService
  participant DB as MySQL(page/component)

  V->>FE: 打开 /release/:id
  FE->>API: GET /api/pages/:id (可能无 Authorization)
  API->>G: 可选解析 JWT
  API->>S: assertPageAccessible(id, user?)
  S->>DB: SELECT page by id
  alt page 不存在
    S-->>API: throw 404
    API-->>FE: {code:404,data:null,...}
  else page 为 private 且 user 为空
    S-->>API: throw 401
    API-->>FE: {code:401,data:null,...}
  else page 为 private 且 user 非 owner
    S-->>API: throw 403
    API-->>FE: {code:403,data:null,...}
  else page 已过期
    S-->>API: throw 404/403（按策略）
    API-->>FE: {code:...,data:null,...}
  else 可访问
    S->>DB: SELECT components by page_id
    DB-->>S: components
    S-->>API: releaseData
    API-->>FE: {code:0,data:{...}}
  end
```

## 5.4 WebIDE 工作区同步与文件写入（文件 <-> DB 一致性）

```mermaid
sequenceDiagram
  autonumber
  actor Dev as 开发者
  participant IDE as apps/ide(OpenSumi)
  participant API as apps/server
  participant WS as PageWorkspaceService
  participant FS as Workspace Dir（磁盘目录）
  participant DB as MySQL(page/component)

  Dev->>IDE: 打开某 pageId 工作区
  IDE->>API: POST /api/pages/:id/workspace
  API->>WS: syncWorkspace(pageId)
  alt 工作区不存在（首次）
    WS->>FS: copy template workspace -> page workspace
  end
  WS->>DB: SELECT page schema/components
  WS->>FS: write schema file
  API-->>IDE: {code:0,data:{...}}

  Dev->>IDE: 保存文件（path=...）
  IDE->>API: PUT /api/pages/:id/workspace/file
  API->>WS: writeWorkspaceFile(path, content)
  WS->>FS: write file content
  alt path 是 schema 文件
    WS->>DB: update schema/components（回写 DB）
  end
  API-->>IDE: {code:0,data:null}
```

异常处理策略：
- 文件写入失败：返回 `500` 并携带 `error.details`（不包含敏感路径/内容）。
- schema 回写失败：应回滚到“写前版本”或标记同步失败（建议通过临时文件 + 原子替换保证一致性）。

## 5.5 实时协作（Socket.io：加入房间、组件更新、锁状态同步）

```mermaid
sequenceDiagram
  autonumber
  actor A as 协作者A
  actor B as 协作者B
  participant FE as apps/client
  participant WS as /collaboration Socket.io
  participant S as CollaborationGateway

  A->>FE: 打开编辑器
  FE->>WS: connect + emit join_room(pageId, user)
  WS->>S: handleJoinRoom()
  S-->>WS: broadcast room_users_update
  WS-->>FE: room_users_update(users)

  B->>FE: 打开编辑器
  FE->>WS: join_room(pageId, user)
  WS->>S: handleJoinRoom()
  S-->>WS: broadcast room_users_update

  A->>FE: 拖拽/修改组件
  FE->>WS: emit component_update(diff)
  WS->>S: handleComponentUpdate()
  S-->>WS: broadcast sync_component(diff)
  WS-->>FE: sync_component(diff)（B 接收）

  A->>FE: 锁定编辑
  FE->>WS: emit toggle_lock(isLocked)
  WS->>S: handleToggleLock()
  S-->>WS: broadcast sync_lock_status
  WS-->>FE: sync_lock_status
```

扩展建议：
- 多实例扩容时，Socket.io 需要共享 adapter（如 Redis adapter）以保证跨实例广播。
- 对关键协作事件写入 `operation_log`（已存在实体）以便审计与回放。

## 5.6 资源上传（OSS + 资源表落库）

```mermaid
sequenceDiagram
  autonumber
  actor U as 用户
  participant FE as apps/client
  participant API as apps/server
  participant R as ResourcesService
  participant OSS as Ali OSS
  participant DB as MySQL(resources)

  U->>FE: 选择文件上传
  FE->>API: POST /api/resources/upload (multipart + Authorization)
  API->>API: JwtStrategy.validate()
  API->>R: upload(file, userId)
  R->>OSS: put(file)
  OSS-->>R: url
  R->>DB: INSERT resources(account_id,url,type,name)
  DB-->>R: id
  API-->>FE: {code:0,data:{id,url,...}}
```

异常处理策略：
- OSS 上传失败：返回 `500`，前端提示重试；避免将 OSS 内部错误信息透传给客户端。
- DB 落库失败：返回 `502/500`；如 OSS 已上传成功，建议补偿清理或延迟清理任务（避免孤儿对象）。

## 5.7 模板初始化与管理（默认模板 ensureDefaults）

```mermaid
sequenceDiagram
  autonumber
  participant API as apps/server
  participant M as TemplateModule
  participant S as TemplateService
  participant DB as MySQL(template)

  API->>M: OnModuleInit
  M->>S: ensureDefaults()
  S->>DB: SELECT by key
  alt 不存在或版本落后
    S->>DB: UPSERT template(key,version,preset,...)
  end
  DB-->>S: ok
```

异常处理策略：
- 初始化失败不应导致整个服务不可用（建议降级并报警，避免阻塞启动）。

## 5.8 后台治理权限链（Roles + Permission）

```mermaid
sequenceDiagram
  autonumber
  actor A as 管理员
  participant FE as apps/admin
  participant API as apps/server
  participant JWT as JwtStrategy
  participant RG as RolesGuard
  participant PG as AdminPermissionGuard
  participant S as AdminService
  participant DB as MySQL(user/page/component)

  A->>FE: 打开后台页面
  FE->>API: GET /api/admin/users (Authorization)
  API->>JWT: validate token
  JWT-->>API: request.user
  API->>RG: check global_role
  RG-->>API: allow/deny
  API->>PG: check permission keys
  PG-->>API: allow/deny
  alt 允许
    API->>S: listUsers()
    S->>DB: SELECT users
    DB-->>S: rows
    API-->>FE: {code:0,data:{...}}
  else 拒绝
    API-->>FE: {code:403,data:null,...}
  end
```
