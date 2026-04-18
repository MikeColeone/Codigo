import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

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

export default function Center() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");

  const filteredPages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DOC_PAGES;
    return DOC_PAGES.filter((p) => p.title.toLowerCase().includes(q));
  }, [query]);

  const activePageKey = searchParams.get("page") ?? "getting-started";
  const activePage =
    DOC_PAGES.find((p) => p.key === activePageKey) ?? DOC_PAGES[0]!;

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
    <main className="relative w-full bg-[var(--ide-bg)]">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(1200px_600px_at_10%_0%,color-mix(in_oklab,var(--ide-accent)_18%,transparent),transparent_60%),radial-gradient(900px_500px_at_90%_10%,color-mix(in_oklab,var(--ide-active)_25%,transparent),transparent_62%)]" />

      <div className="relative grid grid-cols-12 gap-0">
        <aside className="col-span-12 border-b border-[var(--ide-border)] py-4 sm:col-span-4 sm:border-b-0 sm:border-r sm:py-8 lg:col-span-3">
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
                    setSearchParams({ page: p.key });
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

        <div className="col-span-12 py-6 sm:col-span-8 sm:py-8 lg:col-span-7 lg:px-10">
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

        <aside className="hidden border-l border-[var(--ide-border)] py-8 pl-6 lg:col-span-2 lg:block">
          <div className="sticky top-[calc(var(--header-height)+24px)]">
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
                    setSearchParams({ page: activePage.key, section: item.id });
                  }}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}







