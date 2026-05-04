interface AppManagementHeroProps {
  isLoggedIn: boolean;
}

function AppManagementHero({ isLoggedIn }: AppManagementHeroProps) {
  return (
    <div className="mb-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ide-text)]">
            应用管理
          </h1>
          <p className="mt-1 text-sm text-[var(--ide-text-muted)]">
            {isLoggedIn
              ? "集中管理你的应用草稿、发布版本与页面分析。"
              : "访客模式：浏览公开页面与可用模板。"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AppManagementHero;
