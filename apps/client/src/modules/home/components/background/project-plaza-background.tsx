/** 为模板广场、物料广场、使用手册提供更贴近工作台的背景层。 */
export function ProjectPlazaBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--ide-sidebar-bg)_74%,var(--ide-bg))_0%,var(--ide-bg)_38%,color-mix(in_oklab,var(--ide-control-bg)_78%,var(--ide-bg))_100%)]" />
      <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(15,108,189,0.1),transparent_70%)]" />
      <div className="absolute right-[max(1.5rem,calc(50%-36rem))] top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--ide-accent)_14%,transparent),transparent_72%)] blur-3xl" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.08))]" />
    </div>
  );
}

export default ProjectPlazaBackground;
