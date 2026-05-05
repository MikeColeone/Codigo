import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { builtinComponentDefinitions } from "@codigo/materials";

type DocBlock =
  | {
      type: "p";
      text: string;
    }
  | {
      type: "shot";
      title: string;
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

type DocBlockInput =
  | {
      type: "p";
      text: string;
    }
  | {
      type: "shot";
      title: string;
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

type DocSectionInput = {
  key: string;
  title: string;
  blocks: DocBlockInput[];
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

          if (b.type === "shot") {
            return (
              <div key={idx} className="space-y-2">
                <div className="rounded-xl border border-[var(--ide-border)] bg-[var(--ide-control-bg)] shadow-[var(--ide-panel-shadow)]">
                  <div className="flex items-center justify-between gap-3 border-b border-[var(--ide-border)] px-4 py-2">
                    <div className="text-xs font-semibold tracking-wide text-[var(--ide-text-muted)]">
                      界面截图
                    </div>
                    <div className="text-xs text-[var(--ide-text-muted)]">
                      {b.title}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="relative overflow-hidden rounded-lg border border-[var(--ide-control-border)] bg-[radial-gradient(800px_400px_at_10%_0%,color-mix(in_oklab,var(--ide-accent)_18%,transparent),transparent_60%),radial-gradient(600px_360px_at_90%_10%,color-mix(in_oklab,var(--ide-active)_22%,transparent),transparent_62%)]">
                      <div className="aspect-video" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-md border border-[var(--ide-control-border)] bg-[color:color-mix(in_oklab,var(--ide-control-bg)_70%,transparent)] px-3 py-2 text-center text-sm text-[var(--ide-text-muted)] backdrop-blur">
                          {b.title}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

const DOC_PAGES: { key: string; title: string; summary: string; sections: DocSectionInput[] }[] = [
  {
    key: "overview",
    title: "产品概述",
    summary: "先搞清楚：这是什么产品、适用于哪些场景、能解决什么问题。",
    sections: [
      {
        key: "positioning",
        title: "产品定位与适用场景",
        blocks: [
          {
            type: "p",
            text: "Codigo 是一套面向“后台/管理系统”场景的页面搭建与发布工具。你无需编程即可通过模板和物料拼装出页面，并通过预览/发布得到可分享的访问链接。",
          },
          {
            type: "shot",
            title: "首页 / 导航入口",
          },
          {
            type: "callout",
            tone: "info",
            title: "适用场景",
            text: "企业后台管理、运营配置页、数据看板页面、表单采集页、列表/详情页等。",
          },
          {
            type: "callout",
            tone: "warn",
            title: "不适用场景",
            text: "对复杂交互与高定制视觉有强依赖的官网/品牌营销页，建议使用专业前端开发流程。",
          },
        ],
      },
      {
        key: "roles",
        title: "谁会用到它",
        blocks: [
          {
            type: "steps",
            items: [
              {
                title: "运营/产品同学",
                text: "用模板快速生成页面，按业务需要配置内容与样式。",
              },
              {
                title: "设计/内容同学",
                text: "负责页面视觉与文案内容的落地与调整。",
              },
              {
                title: "管理员/负责人",
                text: "在后台工作台进行权限设置、版本管理、协作管理与发布管控。",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "quick-start",
    title: "快速上手",
    summary: "按步骤完成一次完整流程：从模板创建 → 编辑 → 预览 → 发布与分享。",
    sections: [
      {
        key: "start",
        title: "开始之前",
        blocks: [
          {
            type: "p",
            text: "准备一个账号并登录（或联系管理员开通）。建议首次从模板开始，避免从空白页面搭建。",
          },
          {
            type: "callout",
            tone: "info",
            title: "操作路径",
            text: "首页 → 模板广场 → 选择模板 → 使用模板 → 进入编辑器",
          },
        ],
      },
      {
        key: "apply-template",
        title: "从模板创建",
        blocks: [
          {
            type: "shot",
            title: "模板广场 / 模板卡片",
          },
          {
            type: "steps",
            items: [
              {
                title: "打开模板广场",
                text: "在首页导航进入“模板广场”。",
              },
              {
                title: "预览模板（可选）",
                text: "先预览模板效果，确认符合你的业务布局。",
              },
              {
                title: "使用模板",
                text: "点击“使用模板”，系统会为你创建一个可编辑的工作区并进入编辑器。",
              },
            ],
          },
          {
            type: "callout",
            tone: "warn",
            title: "注意事项",
            text: "使用模板会替换当前工作区的页面集合；若已有内容，请先确认是否需要备份或另建工作区。",
          },
        ],
      },
      {
        key: "edit",
        title: "编辑页面内容",
        blocks: [
          {
            type: "shot",
            title: "编辑器 / 画布与右侧配置区",
          },
          {
            type: "steps",
            items: [
              {
                title: "拖拽物料到画布",
                text: "从物料面板选择组件拖拽到画布，完成页面结构搭建。",
              },
              {
                title: "设置样式与内容",
                text: "选中组件后，在右侧配置区调整文本、颜色、间距等。",
              },
              {
                title: "保存",
                text: "编辑过程中建议频繁保存，避免误操作导致内容丢失。",
              },
            ],
          },
        ],
      },
      {
        key: "publish",
        title: "预览、发布与分享",
        blocks: [
          {
            type: "shot",
            title: "预览 / 发布 / 分享链接",
          },
          {
            type: "steps",
            items: [
              {
                title: "预览",
                text: "先预览页面，确认布局与交互无误。",
              },
              {
                title: "发布",
                text: "发布后会生成分享链接，可对外访问。",
              },
              {
                title: "选择可见性与有效期（如有）",
                text: "公开可匿名访问；私密仅特定人员可访问。若设置了有效期，到期后链接将失效。",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "templates",
    title: "模板广场",
    summary: "如何选择、预览与使用模板，快速创建符合后台场景的页面结构。",
    sections: [
      {
        key: "what",
        title: "模板是什么",
        blocks: [
          {
            type: "p",
            text: "模板是一组预先搭建好的页面结构与布局。通过模板，你可以快速获得一个可用的后台页面骨架，再在编辑器里做内容与样式调整。",
          },
          {
            type: "callout",
            tone: "info",
            title: "适合谁",
            text: "首次使用、需要快速上线、或希望统一视觉结构的团队。",
          },
        ],
      },
      {
        key: "how",
        title: "如何使用模板",
        blocks: [
          {
            type: "steps",
            items: [
              { title: "进入模板广场", text: "首页 → 模板广场" },
              { title: "预览模板", text: "点击“预览模板”查看效果。" },
              { title: "使用模板", text: "点击“使用模板”进入编辑器开始编辑。" },
            ],
          },
          {
            type: "callout",
            tone: "warn",
            title: "常见误区",
            text: "不要把模板当成最终成品。模板是起点，仍需要根据你的业务内容进行调整与校对。",
          },
        ],
      },
    ],
  },
  {
    key: "materials",
    title: "物料广场",
    summary: "物料是页面的“零件”。你可以查阅每个物料的用途、容器能力与插槽信息。",
    sections: [
      {
        key: "how-to-open",
        title: "如何查看某个物料的详细说明",
        blocks: [
          {
            type: "shot",
            title: "物料广场 / 物料列表",
          },
          {
            type: "steps",
            items: [
              { title: "进入物料广场", text: "首页 → 物料广场" },
              {
                title: "点击物料",
                text: "点击任意物料后，会跳转到本手册的“物料参考”对应条目。",
              },
              {
                title: "回到列表",
                text: "使用浏览器后退，或从左侧导航进入其它章节。",
              },
            ],
          },
          {
            type: "callout",
            tone: "info",
            title: "说明",
            text: "物料说明用于帮助你选择合适组件与了解容器/插槽能力，普通使用不需要了解任何技术细节。",
          },
        ],
      },
    ],
  },
  {
    key: "editor",
    title: "编辑器使用说明",
    summary: "从进入编辑器到完成页面搭建：布局、物料、页面管理与常见操作。",
    sections: [
      {
        key: "enter",
        title: "进入编辑器",
        blocks: [
          {
            type: "p",
            text: "你可以从模板广场应用模板后进入编辑器，也可以从工作台入口进入。",
          },
          {
            type: "callout",
            tone: "info",
            title: "操作路径",
            text: "模板广场 → 使用模板 → 编辑器",
          },
        ],
      },
      {
        key: "place-components",
        title: "添加组件到页面",
        blocks: [
          {
            type: "shot",
            title: "编辑器 / 物料面板与画布",
          },
          {
            type: "steps",
            items: [
              { title: "选择物料", text: "在物料面板搜索或浏览组件。" },
              { title: "拖拽到画布", text: "拖拽组件到画布合适位置。" },
              { title: "配置内容与样式", text: "选中组件后在右侧面板设置文本、颜色、间距等。" },
            ],
          },
          {
            type: "callout",
            tone: "warn",
            title: "注意事项",
            text: "若组件是“容器”，可以承载子组件；否则无法放入子内容。",
          },
        ],
      },
      {
        key: "pages",
        title: "页面与子页面管理",
        blocks: [
          {
            type: "shot",
            title: "编辑器 / 页面管理下拉",
          },
          {
            type: "steps",
            items: [
              { title: "打开页面列表", text: "编辑器左上角标题处打开页面下拉。" },
              { title: "新增页面/子页面", text: "按提示创建新页面并命名。" },
              { title: "切换页面", text: "在列表中选择页面进行编辑。" },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "collaboration",
    title: "分享、协作与权限",
    summary: "如何分享页面、邀请协作者、配置权限，以及常见问题处理。",
    sections: [
      {
        key: "share",
        title: "分享链接",
        blocks: [
          {
            type: "p",
            text: "发布后可获得分享链接。你可以选择公开或私密模式，并根据需要设置有效期。",
          },
          {
            type: "callout",
            tone: "warn",
            title: "访问失败怎么办",
            text: "如果链接提示无权限或已过期，请联系发布者重新设置可见性/有效期，或重新发布获取新链接。",
          },
        ],
      },
      {
        key: "permissions",
        title: "权限设置入口",
        blocks: [
          {
            type: "shot",
            title: "后台工作台 / 权限设置",
          },
          {
            type: "callout",
            tone: "info",
            title: "操作路径",
            text: "后台管理（工作台） → 权限设置",
          },
          {
            type: "steps",
            items: [
              { title: "打开权限设置", text: "进入后台工作台并打开“权限设置”。" },
              { title: "添加协作者", text: "按提示添加协作者账号。" },
              { title: "配置权限", text: "为协作者选择允许的操作范围。" },
              { title: "保存并生效", text: "保存后立即生效，返回编辑器刷新即可。" },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "faq",
    title: "常见问题（FAQ）",
    summary: "使用过程中最常见的问题与处理建议。",
    sections: [
      {
        key: "cannot-open",
        title: "打不开页面/一直转圈",
        blocks: [
          {
            type: "steps",
            items: [
              { title: "刷新页面", text: "优先尝试刷新浏览器页面。" },
              { title: "确认网络", text: "确认网络环境与账号状态正常。" },
              { title: "联系管理员", text: "若仍无法恢复，请联系管理员或技术支持提供复现步骤。" },
            ],
          },
        ],
      },
      {
        key: "lost",
        title: "内容丢失/误操作",
        blocks: [
          {
            type: "p",
            text: "建议在编辑过程中频繁保存，并使用版本管理（若已开启）回退到历史版本。",
          },
        ],
      },
      {
        key: "permissions",
        title: "提示无权限",
        blocks: [
          {
            type: "p",
            text: "私密页面需要登录且具备访问权限；请联系发布者或管理员在权限设置中为你授权。",
          },
        ],
      },
    ],
  },
  {
    key: "appendix",
    title: "附录（给技术支持/管理员）",
    summary: "不影响普通用户操作的补充信息；普通用户可跳过。",
    sections: [
      {
        key: "support",
        title: "提交问题时提供什么信息",
        blocks: [
          {
            type: "steps",
            items: [
              { title: "你做了什么", text: "按顺序描述你的操作步骤与期望结果。" },
              { title: "实际发生了什么", text: "描述错误现象或提示文案。" },
              { title: "截图", text: "尽量附上关键界面截图与 URL（若包含敏感信息请先打码）。" },
            ],
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
    
    const sections = builtinComponentDefinitions
      .map((item) => {
        const type = String(item.type);
        const name = String(item.name);
        const isContainer = Boolean(item.isContainer);
        const slots = item.slots ?? [];
        const slotSummary = slots.length
          ? slots
              .map((s) => (s.title ?? s.name) + (s.multiple ? "（可放多个）" : ""))
              .join("、")
          : "";
        const blocks: DocBlock[] = [
          {
            type: "shot",
            title: `${name}（示例）`,
          },
          {
            type: "p",
            text: item.description ? String(item.description) : "暂无描述",
          },
          {
            type: "callout",
            tone: isContainer ? "info" : "warn",
            title: "容器能力",
            text: isContainer
              ? "该物料可以放入其它组件作为内容（容器）。"
              : "该物料主要用于展示自身内容，不用于承载子内容（非容器）。",
          },
          {
            type: "steps",
            items: [
              {
                title: "使用方式",
                text: "编辑器 → 物料面板 → 搜索并找到该物料 → 拖拽到画布 → 右侧配置区调整内容与样式。",
              },
              {
                title: "可放内容的位置（插槽）",
                text: slots.length
                  ? `该物料包含 ${slots.length} 个可放内容的位置：${slotSummary}。`
                  : "该物料没有可放内容的位置。",
              },
            ],
          },
        ];
        return {
          key: type,
          title: name,
          blocks,
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

  const activePageKey = searchParams.get("page") ?? "overview";
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
        "relative w-full",
        !isPage && "bg-transparent",
        isPage && "h-full overflow-hidden",
      )}
    >
      <div
        className={cx(
          "relative",
          isPage
            ? "h-full"
            : "rounded-none border-0 shadow-none",
        )}
      >
        <div
          className={cx(
            "w-full",
            isPage ? "h-full" : "mx-auto max-w-none",
          )}
        >
          <div
            className={cx(
              "grid gap-0",
              isPage
                ? "h-full lg:grid-cols-[minmax(0,1fr)_minmax(0,860px)_minmax(0,1fr)]"
                : "lg:grid-cols-[280px_minmax(0,1fr)_240px]",
              isPage && "h-full",
            )}
          >
            <aside
              className={cx(
                "border-b border-[var(--ide-border)] bg-[var(--ide-control-bg)]/40 py-4 backdrop-blur sm:border-b-0 sm:border-r sm:py-8",
                isPage
                  ? "h-full overflow-y-auto px-6 lg:justify-self-start lg:w-[280px] lg:border-r lg:border-[var(--ide-border)]"
                  : "sm:sticky sm:top-[calc(var(--header-height)+18px)] sm:max-h-[calc(100vh-var(--header-height)-36px)] sm:overflow-y-auto",
              )}
            >
          <div className={cx("mt-4", !isPage && "px-4")}>
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

          <nav className={cx("mt-4 space-y-1", !isPage && "px-4")}>
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
            </aside>
            <div
              className={cx(
                "min-w-0 px-6 py-6 sm:py-8 lg:px-10",
                isPage ? "h-full overflow-y-auto lg:px-12" : "",
              )}
            >
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ide-text-muted)]">
              User Manual
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--ide-text)] sm:text-3xl">
              {activePage.title}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-[var(--ide-text-muted)]">
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
                "hidden border-l border-[var(--ide-border)] bg-[var(--ide-control-bg)]/30 py-8 backdrop-blur lg:block",
                isPage
                  ? "h-full overflow-y-auto px-6 lg:justify-self-end lg:w-[240px] lg:border-l lg:border-[var(--ide-border)]"
                  : "sticky top-[calc(var(--header-height)+18px)] max-h-[calc(100vh-var(--header-height)-36px)] overflow-y-auto pl-6",
              )}
            >
            <div className="text-right text-xs font-semibold tracking-wide text-[var(--ide-text-muted)]">
              本页目录
            </div>
            <div className="mt-3 space-y-1">
              {toc.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={cx(
                    "w-full rounded-md px-2 py-1.5 text-right text-sm transition-colors",
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
