import { useHomeNavigation } from "../../hooks/use-home-navigation";
import { HomePreviewCard } from "./home-preview-card";

/** 渲染首页首屏营销信息与核心行动按钮。 */
export function HomeHeroSection() {
  const { openProjects, openRoute } = useHomeNavigation();

  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-20 pt-12">
      <div className="grid gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
        <div className="relative">
          <div className="absolute -left-4 top-3 hidden h-28 w-px bg-[linear-gradient(to_bottom,transparent,var(--ide-accent),transparent)] lg:block" />

          <div className="inline-flex items-center rounded-full border border-[var(--ide-control-border)] bg-[color:color-mix(in_oklab,var(--ide-control-bg)_82%,transparent)] px-4 py-1.5 text-[var(--ide-text-muted)] shadow-[var(--ide-panel-shadow)] backdrop-blur">
            <span className="mr-2 flex h-2 w-2 animate-pulse rounded-full bg-[var(--ide-accent)]" />
            <span className="font-mono text-xs font-medium tracking-wider text-[var(--ide-text)]">
              CODIGO SYSTEM v1.0
            </span>
          </div>

          <div className="mt-6 inline-flex items-center gap-2 rounded-sm border border-[var(--ide-border)] bg-[var(--ide-control-bg)] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ide-text-muted)]">
            <span className="text-[var(--ide-accent)]">workflow</span>
            <span>template</span>
            <span className="text-[var(--ide-border)]">/</span>
            <span>editor</span>
            <span className="text-[var(--ide-border)]">/</span>
            <span>publish</span>
          </div>

          <h1 className="mt-7 max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight text-[var(--ide-text)] md:text-6xl">
            <span className="block">让后台页面构建</span>
            <br />
            <span className="block text-[var(--ide-accent)]">
              像搭积木一样简单
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-[15px] leading-7 text-[var(--ide-text-muted)] md:text-base">
            从模板起步、拖拽物料、配置页面到最终发布，Codigo 提供一套统一的可视化后台搭建流程，
            让产品、运营与研发围绕同一份页面结果协作。
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-[var(--ide-text-muted)]">
            <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-control-bg)] px-3 py-1.5 font-mono">
              admin-first
            </div>
            <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-control-bg)] px-3 py-1.5 font-mono">
              low-code workflow
            </div>
            <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-control-bg)] px-3 py-1.5 font-mono">
              team collaboration
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              className="group inline-flex items-center justify-center rounded-sm bg-[var(--ide-accent)] px-6 py-3 text-sm font-semibold text-[var(--ide-statusbar-text)] shadow-[var(--ide-panel-shadow)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--ide-accent)] focus:ring-offset-2 focus:ring-offset-[var(--ide-bg)]"
              onClick={openProjects}
            >
              <span className="mr-2">进入我的项目</span>
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-sm border border-[var(--ide-control-border)] bg-[var(--ide-control-bg)] px-5 py-3 text-sm font-medium text-[var(--ide-text)] shadow-[var(--ide-panel-shadow)] transition-colors hover:bg-[var(--ide-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--ide-accent)] focus:ring-offset-2 focus:ring-offset-[var(--ide-bg)]"
              onClick={() => openRoute("/doc")}
            >
              查看使用手册
            </button>
          </div>

          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            <div className="rounded-sm border border-[var(--ide-border)] bg-[color:color-mix(in_oklab,var(--ide-control-bg)_78%,transparent)] px-4 py-3 shadow-[var(--ide-panel-shadow)]">
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ide-text-muted)]">
                01 Start
              </div>
              <div className="mt-2 text-sm font-semibold text-[var(--ide-text)]">模板起步</div>
            </div>
            <div className="rounded-sm border border-[var(--ide-border)] bg-[color:color-mix(in_oklab,var(--ide-control-bg)_78%,transparent)] px-4 py-3 shadow-[var(--ide-panel-shadow)]">
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ide-text-muted)]">
                02 Build
              </div>
              <div className="mt-2 text-sm font-semibold text-[var(--ide-text)]">编辑配置</div>
            </div>
            <div className="rounded-sm border border-[var(--ide-border)] bg-[color:color-mix(in_oklab,var(--ide-control-bg)_78%,transparent)] px-4 py-3 shadow-[var(--ide-panel-shadow)]">
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ide-text-muted)]">
                03 Ship
              </div>
              <div className="mt-2 text-sm font-semibold text-[var(--ide-text)]">发布协作</div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute -inset-4 rounded-[20px] border border-[color:color-mix(in_oklab,var(--ide-accent)_18%,transparent)] bg-[radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--ide-accent)_14%,transparent),transparent_55%)] blur-xl" />
          <div className="relative">
            <HomePreviewCard />
          </div>
        </div>
      </div>
    </section>
  );
}
