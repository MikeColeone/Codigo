import { useHomeNavigation } from "../../hooks/useHomeNavigation";
import { HomePreviewCard } from "./HomePreviewCard";

/** 渲染首页首屏营销信息与核心行动按钮。 */
export function HomeHeroSection() {
  const { openAppManagement } = useHomeNavigation();

  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-20 pt-10">
      <div className="grid gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <div className="inline-flex items-center rounded-full border border-[var(--ide-control-border)] bg-[var(--ide-control-bg)] px-4 py-1.5 text-[var(--ide-text-muted)] shadow-[var(--ide-panel-shadow)]">
            <span className="mr-2 flex h-2 w-2 animate-pulse rounded-full bg-[var(--ide-accent)]" />
            <span className="font-mono text-xs font-medium tracking-wider text-[var(--ide-text)]">
              CODIGO SYSTEM v1.0
            </span>
          </div>

          <h1 className="mt-8 text-4xl font-bold leading-tight tracking-tight text-[var(--ide-text)] md:text-6xl">
            <span>让业务页面构建</span>
            <br />
            <span className="text-[var(--ide-accent)]">
              像搭积木一样简单
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--ide-text-muted)]">
            从页面搭建、组件配置、数据统计到最终发布，Codigo
            提供统一的可视化平台，帮助团队更快验证想法并持续优化业务转化。
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <button
              className="group inline-flex items-center justify-center rounded-sm bg-[var(--ide-accent)] px-6 py-3 text-sm font-semibold text-[var(--ide-statusbar-text)] shadow-[var(--ide-panel-shadow)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--ide-accent)] focus:ring-offset-2 focus:ring-offset-[var(--ide-bg)]"
              onClick={openAppManagement}
            >
              <span className="mr-2">进入应用管理</span>
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>

        <HomePreviewCard />
      </div>
    </section>
  );
}
