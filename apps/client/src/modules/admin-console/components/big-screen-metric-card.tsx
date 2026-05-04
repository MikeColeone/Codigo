/**
 * 渲染数据大屏顶部核心指标卡。
 */
export function BigScreenMetricCard(props: {
  label: string;
  value: string;
  detail: string;
  accent: string;
}) {
  return (
    <article className="relative overflow-hidden rounded-[18px] border border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] p-4 shadow-[var(--ide-panel-shadow)]">
      <div
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: props.accent }}
      />
      <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--ide-text-muted)]">
        {props.label}
      </div>
      <div className="mt-3 text-[28px] font-semibold leading-none text-[var(--ide-text)]">
        {props.value}
      </div>
      <div className="mt-2 text-[11px] text-[var(--ide-text-muted)]">{props.detail}</div>
    </article>
  );
}
