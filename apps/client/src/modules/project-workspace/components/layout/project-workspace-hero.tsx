function ProjectWorkspaceHero() {
  return (
    <div className="mb-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ide-text)]">
            我的项目
          </h1>
          <p className="mt-1 text-sm text-[var(--ide-text-muted)]">
            集中查看当前草稿、已发布结果与版本记录，减少重复入口切换。
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProjectWorkspaceHero;
