# 仓库目录与职责（单一事实源）

当出现以下变更时，必须同步更新本文件：
- workspace 结构调整（pnpm-workspace / turbo / 包增删 / 包重命名）
- 应用与包的职责边界发生变化
- 关键目录（缓存、任务日志、上下文）位置或使用方式变化

## 本地协作目录（不参与生产构建）
- `.cache/codigo/workspaces/pages/*`：页面源码工作区缓存目录。首次打开 WebIDE 时由 `packages/template` 复制生成；后续 OpenSumi 编辑与文件读写落在这里，不属于业务源码。
- `.trae/docs/TASK_LOG.md`：研发任务日志规范文档（字段要求、复现标准、使用方式）。
- `.trae/task-logs/*`：任务日志归档目录（每次任务结束生成一份 Markdown 日志与索引）。
- `.trae/context/*`：跨会话上下文资产目录（handoff、项目事实、决策、启动提示词）。
- `.trae/retros/BAD_CASES.md`：逻辑错误、架构违规、代码回退的复盘主文件。
- `.trae/rules/PAPER/*`：论文写作相关规则提示词（润色/翻译/红线审查/架构图规范）。

## 协议与核心边界（关键单一事实源）
- `packages/schema/src/schema/low-code.ts`：低代码页面协议单一事实源；多页面结构中 `pages` 表示真实页面，`pageGroups` 表示仅用于导航分组的页面集，二者职责分离。

## 前端关键模块（入口与职责）
- `apps/client/src/modules/editor/components/pageManager/*`：编辑器页面管理入口；负责页面/页面集创建、树形展示与当前页面元数据维护；普通页面不应直接充当页面集父节点。
- `apps/client/src/modules/pageShell/*`：预览/发布导航壳层；统一消费 `pages + pageGroups` 构建导航树，兼容旧页面路径层级并避免把父页面误显示为路径占位节点。
