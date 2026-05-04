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
    <article className="relative overflow-hidden rounded-[18px] border border-white/8 bg-[rgba(5,12,28,0.72)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: props.accent }}
      />
      <div className="text-[11px] uppercase tracking-[0.2em] text-[#7f96bf]">
        {props.label}
      </div>
      <div className="mt-3 text-[28px] font-semibold leading-none text-white">
        {props.value}
      </div>
      <div className="mt-2 text-[11px] text-[#8fa8d8]">{props.detail}</div>
    </article>
  );
}
