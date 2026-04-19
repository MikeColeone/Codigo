import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { builtinComponentDefinitions } from "@codigo/materials";

type DocBlock =
  | {
      type: "p";
      text: string;
    }
  | {
      type: "callout";
      tone: "info" | "warn";
      title: string;
      text: string;
    }
  | {
      type: "steps";
      items: Array<{ title: string; text?: string; code?: string }>;
    }
  | {
      type: "code";
      title?: string;
      code: string;
    };

type DocSection = {
  key: string;
  title: string;
  blocks: DocBlock[];
};

type DocPage = {
  key: string;
  title: string;
  summary: string;
  sections: DocSection[];
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function CodeBlock({ title, code }: { title?: string; code: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="rounded-lg border border-[var(--ide-border)] bg-[var(--ide-control-bg)] shadow-[var(--ide-panel-shadow)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--ide-border)] px-3 py-2">
        <div className="min-w-0 text-xs font-medium text-[var(--ide-text-muted)]">
          {title ?? "Command"}
        </div>
        <button
          type="button"
          className={cx(
            "shrink-0 rounded-md border px-2 py-1 text-xs transition-colors",
            "border-[var(--ide-control-border)] bg-[var(--ide-control-bg)] text-[var(--ide-text-muted)]",
            "hover:bg-[var(--ide-hover)] hover:text-[var(--ide-text)]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ide-accent)]",
          )}
          onClick={async () => {
            try {
              await navigator.clipboard?.writeText(code);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1200);
            } catch {
              window.prompt("复制命令", code);
            }
          }}
        >
          {copied ? "已复制" : "复制"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 text-[13px] leading-relaxed text-[var(--ide-text)]">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}

function Callout({
  tone,
  title,
  text,
}: {
  tone: "info" | "warn";
  title: string;
  text: string;
}) {
  return (
    <div
      className={cx(
        "rounded-lg border p-4 shadow-[var(--ide-panel-shadow)]",
        tone === "info" &&
          "border-[color:color-mix(in_oklab,var(--ide-accent)_35%,var(--ide-border))] bg-[color:color-mix(in_oklab,var(--ide-accent)_10%,var(--ide-control-bg))]",
        tone === "warn" &&
          "border-[color:color-mix(in_oklab,#f59e0b_40%,var(--ide-border))] bg-[color:color-mix(in_oklab,#f59e0b_10%,var(--ide-control-bg))]",
      )}
    >
      <div className="text-sm font-semibold text-[var(--ide-text)]">{title}</div>
      <div className="mt-1 text-sm text-[var(--ide-text-muted)]">{text}</div>
    </div>
  );
}

function Section({ id, title, blocks }: { id: string; title: string; blocks: DocBlock[] }) {
  return (
    <section id={id} className="scroll-mt-[calc(var(--header-height)+24px)]">
      <h2 className="text-xl font-semibold tracking-tight text-[var(--ide-text)]">
        {title}
      </h2>
      <div className="mt-3 space-y-4">
        {blocks.map((b, idx) => {
          if (b.type === "p") {
            return (
              <p key={idx} className="text-sm leading-7 text-[var(--ide-text-muted)]">
                {b.text}
              </p>
            );
          }

          if (b.type === "callout") {
            return <Callout key={idx} tone={b.tone} title={b.title} text={b.text} />;
          }

          if (b.type === "code") {
            return <CodeBlock key={idx} title={b.title} code={b.code} />;
          }

          return (
            <ol
              key={idx}
              className="grid gap-3 rounded-lg border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-4 shadow-[var(--ide-panel-shadow)]"
            >
              {b.items.map((it, i) => (
                <li key={i} className="grid gap-2">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[var(--ide-control-border)] bg-[var(--ide-control-bg)] text-xs font-semibold text-[var(--ide-text)]">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[var(--ide-text)]">
                        {it.title}
                      </div>
                      {it.text ? (
                        <div className="mt-1 text-sm leading-7 text-[var(--ide-text-muted)]">
                          {it.text}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {it.code ? <CodeBlock code={it.code} /> : null}
                </li>
              ))}
            </ol>
          );
        })}
      </div>
    </section>
  );
}

const DOC_PAGES: DocPage[] = [
  {
    key: "user-guide",
    title: "使用指南",
    summary: "从使用者视角理解：模板、页面、编辑器、发布与后台配置。",
    sections: [
      {
        key: "overview",
        title: "这是什么",
        blocks: [
          {
            type: "p",
            text: "Codigo 面向“后台/管理系统”场景做页面搭建：编辑器负责页面内容与交互能力；后台工作台负责权限、版本与运营类配置；发布端负责对外访问与分享。",
          },
          {
            type: "callout",
            tone: "info",
            title: "推荐入口",
            text: "首次体验建议先从“模板广场”应用模板，再进入编辑器；协作权限从后台工作台的“权限设置”统一管理。",
          },
        ],
      },
      {
        key: "create",
        title: "创建与编辑页面",
        blocks: [
          {
            type: "steps",
            items: [
              {
                title: "从模板开始",
                text: "在模板广场选择一个模板并应用到工作区；模板是多页面集合（pages + activePagePath）。",
              },
              {
                title: "进入编辑器",
                text: "编辑器用于拖拽物料、调整布局、配置样式与事件编排。",
              },
              {
                title: "管理子页面",
                text: "页面入口集中在编辑器头部标题下拉：支持树形展示与子页面层级（a/b/c）。",
              },
            ],
          },
        ],
      },
      {
        key: "publish",
        title: "预览与发布",
        blocks: [
          {
            type: "steps",
            items: [
              {
                title: "预览",
                text: "用于快速检查当前编辑内容的视觉与交互。",
              },
              {
                title: "发布并分享",
                text: "发布后会生成分享链接；公开且未过期时可匿名访问，私密仅发布者可访问。",
              },
              {
                title: "权限设置",
                text: "协作成员与权限在后台工作台“权限设置”统一管理，编辑器头部保留分享入口。",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "dev-guide",
    title: "开发指南",
    summary: "面向仓库贡献：本地启动、调试、质量检查与常见开发约定。",
    sections: [
      {
        key: "workflow",
        title: "本地开发工作流",
        blocks: [
          {
            type: "steps",
            items: [
              {
                title: "安装依赖",
                code: ["pnpm install"].join("\n"),
              },
              {
                title: "按需启动",
                text: "推荐按功能域最小启动：开发 client UI 先跑 client；涉及接口再加 server。",
                code: ["pnpm run run:client", "pnpm run run:server"].join("\n"),
              },
              {
                title: "质量自检",
                code: ["pnpm run lint:apps", "pnpm run typecheck:apps"].join("\n"),
              },
            ],
          },
        ],
      },
      {
        key: "rules",
        title: "边界与协作规则",
        blocks: [
          {
            type: "p",
            text: "强约束：apps 可以依赖 packages；packages 禁止依赖 apps；apps/client、apps/server、apps/ide 之间禁止源码互相依赖。",
          },
          {
            type: "code",
            title: "Rules",
            code: [".trae/rules/BASIC_RULES.md", ".trae/rules/USER_GUIDE.md"].join("\n"),
          },
        ],
      },
    ],
  },
  {
    key: "materials-maintain",
    title: "物料维护",
    summary: "如何新增/修改物料组件：注册、默认配置、渲染与编辑器可用性。",
    sections: [
      {
        key: "where",
        title: "物料在哪里",
        blocks: [
          {
            type: "p",
            text: "物料的单一事实源在 packages/materials（运行时 React 物料与 registry）。编辑器作为消费方，不在 apps/client 里定义物料协议。",
          },
          {
            type: "code",
            title: "Key Paths",
            code: [
              "packages/materials",
              "packages/schema",
              "apps/client/src/modules/editor/registry",
            ].join("\n"),
          },
        ],
      },
      {
        key: "add",
        title: "新增一个物料的最小步骤",
        blocks: [
          {
            type: "steps",
            items: [
              {
                title: "在 materials 中实现组件与默认配置",
                text: "确保定义 type/name/description/defaultConfig/render 等信息，且不耦合 apps/client 的业务代码。",
              },
              {
                title: "注册到物料列表",
                text: "保证能被 runtime/编辑器消费到；如涉及协议字段扩展，优先在 @codigo/schema 定义类型。",
              },
              {
                title: "在物料广场与开发文档补充说明",
                text: "至少补齐：用途、容器能力、插槽、常见搭配与注意事项。",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "templates-maintain",
    title: "模板维护",
    summary: "模板中心（templateCenter）与多页面模板预设的维护方式。",
    sections: [
      {
        key: "concepts",
        title: "模板预设结构",
        blocks: [
          {
            type: "p",
            text: "模板预设是多页面集合：TemplatePreset 使用 pages + activePagePath。应用模板时会替换整个工作区页面集合。",
          },
          {
            type: "callout",
            tone: "warn",
            title: "布局归一化",
            text: "应用模板时需要使用模板的 pageSettings/layoutMode/grid 进行归一化，避免后续 recover/syncLayoutMode 导致重排错乱。",
          },
        ],
      },
      {
        key: "where",
        title: "相关模块",
        blocks: [
          {
            type: "code",
            title: "Key Paths",
            code: [
              "apps/client/src/modules/templateCenter",
              "apps/client/src/modules/editor",
              "packages/materials",
              "packages/render",
            ].join("\n"),
          },
        ],
      },
    ],
  },
  {
    key: "tech-stack",
    title: "技术栈",
    summary: "前后端与工程化的关键技术选择（按模块组织）。",
    sections: [
      {
        key: "frontend",
        title: "前端",
        blocks: [
          {
            type: "steps",
            items: [
              {
                title: "React + React Router",
                text: "应用路由与视图组织。",
              },
              {
                title: "Tailwind CSS",
                text: "基于 IDE 主题变量进行一致的样式表达。",
              },
              {
                title: "Ant Design（局部）",
                text: "管理端/表格类高密度 UI。",
              },
            ],
          },
        ],
      },
      {
        key: "backend",
        title: "后端",
        blocks: [
          {
            type: "steps",
            items: [
              {
                title: "NestJS + TypeORM",
                text: "模块化 API 与数据层。",
              },
              {
                title: "Socket.io",
                text: "协同通信：room_users_update / sync_lock_status / sync_component 等事件流。",
              },
            ],
          },
        ],
      },
      {
        key: "tooling",
        title: "工程化",
        blocks: [
          {
            type: "steps",
            items: [
              { title: "pnpm workspace", text: "Monorepo 包管理。" },
              { title: "turbo", text: "任务编排与缓存。" },
              { title: "TypeScript", text: "类型系统与构建约束。" },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "getting-started",
    title: "快速开始",
    summary: "从零到可用：安装依赖、启动本地服务、进入编辑器。",
    sections: [
      {
        key: "prerequisites",
        title: "前置条件",
        blocks: [
          {
            type: "p",
            text: "本仓库是 pnpm workspace + turbo 的 Monorepo。推荐使用 Node.js LTS，并开启 Corepack 或手动安装 pnpm。",
          },
          {
            type: "callout",
            tone: "info",
            title: "端口约定（默认）",
            text: "Server 默认 3000（可用 PORT 环境变量覆盖）。Client/Admin 默认 Vite 端口（Admin dev 端口为 5174）。",
          },
        ],
      },
      {
        key: "install",
        title: "安装依赖",
        blocks: [
          {
            type: "code",
            title: "Install",
            code: ["pnpm install"].join("\n"),
          },
        ],
      },
      {
        key: "dev",
        title: "本地开发（全量）",
        blocks: [
          {
            type: "steps",
            items: [
              {
                title: "启动全部应用（并行）",
                text: "适合第一次跑通：同时启动 client/admin/server/ide/release。",
                code: ["pnpm run dev"].join("\n"),
              },
              {
                title: "按应用单独启动",
                code: [
                  "pnpm run run:client",
                  "pnpm run run:admin",
                  "pnpm run run:server",
                  "pnpm run run:ide",
                  "pnpm run run:release",
                ].join("\n"),
              },
            ],
          },
        ],
      },
      {
        key: "next",
        title: "下一步",
        blocks: [
          {
            type: "p",
            text: "建议按顺序阅读：架构边界与包职责 → 编辑器/发布端的页面数据流 → 协作与权限模块。",
          },
        ],
      },
    ],
  },
  {
    key: "architecture",
    title: "架构与边界",
    summary: "理解 Monorepo 分层、依赖方向与单一事实源，避免边界漂移。",
    sections: [
      {
        key: "layers",
        title: "仓库分层",
        blocks: [
          {
            type: "p",
            text: "apps/* 为独立运行时应用；packages/* 为跨应用复用能力。packages 禁止反向依赖 apps。",
          },
          {
            type: "callout",
            tone: "info",
            title: "单一事实源",
            text: "协议与跨端类型集中在 @codigo/schema；运行时物料注册与渲染集中在 @codigo/materials。",
          },
        ],
      },
      {
        key: "routing",
        title: "路由入口",
        blocks: [
          {
            type: "code",
            title: "Client Router",
            code: [
              "apps/client/src/app/router/index.tsx",
              "",
              "- /            首页",
              "- /doc         开发文档（本页）",
              "- /editor      编辑器",
              "- /flow        流程编排",
              "- /console/*   后台工作台",
            ].join("\n"),
          },
        ],
      },
    ],
  },
  {
    key: "operations",
    title: "构建与发布",
    summary: "构建、质量检查与最小化发布流程的常用命令。",
    sections: [
      {
        key: "quality",
        title: "质量检查",
        blocks: [
          {
            type: "code",
            title: "Quality",
            code: ["pnpm run lint", "pnpm run typecheck", "pnpm run test"].join("\n"),
          },
        ],
      },
      {
        key: "build",
        title: "构建",
        blocks: [
          {
            type: "code",
            title: "Build All",
            code: ["pnpm run build"].join("\n"),
          },
          {
            type: "code",
            title: "Build Apps Only",
            code: ["pnpm run build:apps"].join("\n"),
          },
        ],
      },
    ],
  },
  {
    key: "collaboration",
    title: "协作与权限",
    summary: "多人协作的通信机制、编辑权限与常见行为约束。",
    sections: [
      {
        key: "overview",
        title: "概览",
        blocks: [
          {
            type: "p",
            text: "协作能力以页面为粒度组织（pageId/room），包含在线成员感知、编辑锁状态同步与画布组件变更同步。",
          },
          {
            type: "callout",
            tone: "warn",
            title: "注意",
            text: "页面协作属于高频变更模块，任何协议/事件名/权限逻辑调整，都需要同步更新本页文档条目。",
          },
        ],
      },
      {
        key: "events",
        title: "Socket 事件与 Room",
        blocks: [
          {
            type: "code",
            title: "Server Gateway",
            code: [
              "apps/server/src/modules/flow/gateway/collaboration.gateway.ts",
              "",
              "- room_users_update     成员在线离线变化",
              "- sync_lock_status      编辑锁状态同步",
              "- sync_component        画布组件更新同步",
            ].join("\n"),
          },
          {
            type: "code",
            title: "Client Socket",
            code: ["apps/client/src/modules/editor (socket.io-client)"].join("\n"),
          },
        ],
      },
      {
        key: "permission",
        title: "权限拦截",
        blocks: [
          {
            type: "p",
            text: "前端在权限 Store/Hook 中维护当前用户对页面的操作许可，并在交互入口处阻止未授权编辑动作。",
          },
          {
            type: "code",
            title: "Permission Store",
            code: ["apps/client/src/modules/editor/stores/permission.ts"].join("\n"),
          },
        ],
      },
    ],
  },
  {
    key: "faq",
    title: "常见问题",
    summary: "快速定位常见的安装、启动与开发问题。",
    sections: [
      {
        key: "install",
        title: "依赖安装失败",
        blocks: [
          {
            type: "p",
            text: "优先确认 pnpm 版本与 lockfile 一致，并确保 Node.js 版本满足依赖要求。",
          },
          {
            type: "code",
            title: "Check",
            code: ["pnpm -v", "node -v"].join("\n"),
          },
        ],
      },
      {
        key: "ports",
        title: "端口冲突",
        blocks: [
          {
            type: "p",
            text: "Server 默认 3000；Admin dev 端口为 5174。若端口占用，可调整 PORT 或 Vite 配置。",
          },
        ],
      },
      {
        key: "monorepo",
        title: "包边界与依赖方向",
        blocks: [
          {
            type: "p",
            text: "apps/* 可以依赖 packages/*；packages/* 禁止依赖 apps/*。出现跨包修改时，优先做依赖方向自检再提交。",
          },
          {
            type: "code",
            title: "Rules",
            code: [".trae/rules/BASIC_RULES.md", ".trae/rules/USER_GUIDE.md"].join(
              "\n",
            ),
          },
        ],
      },
    ],
  },
];

export default function Center({ variant = "page" }: { variant?: "page" | "embedded" }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const isPage = variant === "page";

  const patchSearchParams = (patch: Record<string, string | null | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        next.delete(key);
        return;
      }
      next.set(key, value);
    });
    setSearchParams(next);
  };

  const materialsDocPage = useMemo<DocPage>(() => {
    const sections: DocSection[] = builtinComponentDefinitions
      .map((item) => {
        const type = String(item.type);
        const name = String(item.name);
        const isContainer = Boolean(item.isContainer);
        const slots = item.slots ?? [];
        return {
          key: type,
          title: name,
          blocks: [
            {
              type: "p",
              text: item.description ? String(item.description) : "暂无描述",
            },
            {
              type: "callout",
              tone: "info",
              title: "组件标识（type）",
              text: type,
            },
            {
              type: "callout",
              tone: isContainer ? "info" : "warn",
              title: "容器能力",
              text: isContainer
                ? "该物料支持承载子节点（容器）。"
                : "该物料不承载子节点（非容器）。",
            },
            {
              type: "steps",
              items: [
                {
                  title: "使用方式",
                  text: "在编辑器中从物料面板拖拽到画布；再通过右侧配置区设置样式与事件。",
                },
                {
                  title: "插槽（Slots）",
                  text: slots.length
                    ? `该组件包含 ${slots.length} 个插槽：${slots
                        .map((s) => `${s.title ?? s.name}(${s.name})${s.multiple ? "·multiple" : ""}`)
                        .join("、")}`
                    : "该组件没有插槽。",
                },
              ],
            },
          ],
        };
      })
      .sort((a, b) => a.title.localeCompare(b.title));

    return {
      key: "materials",
      title: "物料参考",
      summary: "内置物料的说明索引。点击物料广场条目会跳转到对应说明。",
      sections,
    };
  }, []);

  const docPages = useMemo(() => {
    return [...DOC_PAGES, materialsDocPage];
  }, [materialsDocPage]);

  const filteredPages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docPages;
    return docPages.filter((p) => p.title.toLowerCase().includes(q));
  }, [docPages, query]);

  const activePageKey = searchParams.get("page") ?? "getting-started";
  const activePage =
    docPages.find((p) => p.key === activePageKey) ?? docPages[0]!;

  const activeSectionKey = searchParams.get("section");
  useEffect(() => {
    if (!activeSectionKey) return;
    const el = document.getElementById(activeSectionKey);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeSectionKey, activePageKey]);

  const toc = useMemo(() => {
    return activePage.sections.map((s) => ({
      id: `${activePage.key}-${s.key}`,
      title: s.title,
    }));
  }, [activePage]);

  return (
    <main
      className={cx(
        "relative w-full bg-[var(--ide-bg)]",
        isPage && "h-full overflow-hidden",
      )}
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(1200px_600px_at_10%_0%,color-mix(in_oklab,var(--ide-accent)_18%,transparent),transparent_60%),radial-gradient(900px_500px_at_90%_10%,color-mix(in_oklab,var(--ide-active)_25%,transparent),transparent_62%)]" />

      <div
        className={cx(
          "relative",
          isPage ? "h-full" : "rounded-2xl border border-[var(--ide-border)] shadow-[var(--ide-panel-shadow)]",
        )}
      >
        <div
          className={cx(
            "mx-auto w-full",
            isPage ? "h-full max-w-7xl px-6" : "max-w-none",
          )}
        >
          <div
            className={cx(
              "grid gap-0",
              "lg:grid-cols-[280px_minmax(0,1fr)_240px]",
              isPage && "h-full",
            )}
          >
            <aside
              className={cx(
                "border-b border-[var(--ide-border)] bg-[var(--ide-control-bg)]/40 py-4 backdrop-blur sm:border-b-0 sm:border-r sm:py-8",
                isPage
                  ? "h-full overflow-y-auto"
                  : "sm:sticky sm:top-[calc(var(--header-height)+18px)] sm:max-h-[calc(100vh-var(--header-height)-36px)] sm:overflow-y-auto",
              )}
            >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold tracking-tight text-[var(--ide-text)]">
                开发文档
              </div>
              <div className="mt-1 text-xs text-[var(--ide-text-muted)]">
                /doc · 面向仓库贡献与本地开发
              </div>
            </div>
            <button
              type="button"
              className={cx(
                "rounded-md border px-2 py-1 text-xs transition-colors",
                "border-[var(--ide-control-border)] bg-[var(--ide-control-bg)] text-[var(--ide-text-muted)]",
                "hover:bg-[var(--ide-hover)] hover:text-[var(--ide-text)]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ide-accent)]",
              )}
              onClick={() => navigate("/editor")}
            >
              打开编辑器
            </button>
          </div>

          <div className="mt-4">
            <label className="sr-only" htmlFor="doc-search">
              搜索文档
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ide-text-muted)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M10.5 19a8.5 8.5 0 1 1 0-17 8.5 8.5 0 0 1 0 17Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M16.8 16.8 21 21"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <input
                id="doc-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索章节…"
                className={cx(
                  "w-full rounded-lg border pl-10 pr-3 py-2 text-sm",
                  "border-[var(--ide-control-border)] bg-[var(--ide-control-bg)] text-[var(--ide-text)]",
                  "placeholder:text-[var(--ide-text-muted)]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ide-accent)]",
                )}
              />
            </div>
          </div>

          <nav className="mt-4 space-y-1">
            {filteredPages.map((p) => {
              const active = p.key === activePage.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  className={cx(
                    "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    active
                      ? "bg-[color:color-mix(in_oklab,var(--ide-accent)_18%,var(--ide-control-bg))] text-[var(--ide-text)]"
                      : "text-[var(--ide-text-muted)] hover:bg-[var(--ide-hover)] hover:text-[var(--ide-text)]",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ide-accent)]",
                  )}
                  onClick={() => {
                    patchSearchParams({ page: p.key, section: null });
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 truncate">{p.title}</div>
                    <div
                      className={cx(
                        "shrink-0 text-xs",
                        active
                          ? "text-[var(--ide-text)]"
                          : "text-[var(--ide-text-muted)]",
                      )}
                    >
                      {p.sections.length}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="mt-6 rounded-lg border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-3 text-xs text-[var(--ide-text-muted)] shadow-[var(--ide-panel-shadow)]">
            本页面为“站内文档体验”版式示例，内容会持续补齐与迭代。
          </div>
            </aside>

            <div
              className={cx(
                "bg-[color:color-mix(in_oklab,var(--ide-bg)_72%,var(--ide-control-bg))] py-6 sm:py-8 lg:px-10",
                isPage ? "h-full overflow-y-auto" : "",
              )}
            >
          <div className="rounded-2xl border border-[var(--ide-border)] bg-[color:color-mix(in_oklab,var(--ide-bg)_70%,var(--ide-control-bg))] p-5 shadow-[var(--ide-panel-shadow)] sm:p-6">
            <div className="text-xs font-medium text-[var(--ide-text-muted)]">
              Codigo / Docs
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--ide-text)] sm:text-3xl">
              {activePage.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--ide-text-muted)]">
              {activePage.summary}
            </p>
          </div>

          <div className="mt-8 space-y-10">
            {activePage.sections.map((s) => (
              <Section
                key={s.key}
                id={`${activePage.key}-${s.key}`}
                title={s.title}
                blocks={s.blocks}
              />
            ))}
          </div>
            </div>

            <aside
              className={cx(
                "hidden border-l border-[var(--ide-border)] bg-[var(--ide-control-bg)]/30 py-8 pl-6 backdrop-blur lg:block",
                isPage ? "h-full overflow-y-auto" : "sticky top-[calc(var(--header-height)+18px)] max-h-[calc(100vh-var(--header-height)-36px)] overflow-y-auto",
              )}
            >
            <div className="text-xs font-semibold tracking-wide text-[var(--ide-text-muted)]">
              本页目录
            </div>
            <div className="mt-3 space-y-1">
              {toc.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={cx(
                    "w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                    "text-[var(--ide-text-muted)] hover:bg-[var(--ide-hover)] hover:text-[var(--ide-text)]",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ide-accent)]",
                  )}
                  onClick={() => {
                    patchSearchParams({ page: activePage.key, section: item.id });
                  }}
                >
                  {item.title}
                </button>
              ))}
            </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}





