import type { AppManagementNavItem, AppManagementTab } from "../../types/app-management";

interface AppManagementSidebarProps {
  currentTab: AppManagementTab;
  items: AppManagementNavItem[];
  onChange: (tab: AppManagementTab) => void;
}

function AppManagementSidebar({
  currentTab,
  items,
  onChange,
}: AppManagementSidebarProps) {
  return (
    <>
      <aside className="hidden w-[64px] shrink-0 border-r border-[var(--ide-border)] bg-[color:color-mix(in_oklab,var(--ide-sidebar-bg)_88%,transparent)] backdrop-blur lg:flex">
        <div className="flex h-full w-full flex-col items-center py-2">
          <div className="flex w-full flex-1 flex-col gap-0.5">
            {items.map((item) => {
              const active = currentTab === item.key;

              return (
                <button
                  key={item.key}
                  className={`group relative flex w-full flex-col items-center justify-center gap-1 py-3 transition-colors ${
                    active
                      ? "bg-[var(--ide-active)] text-[var(--ide-text)]"
                      : "text-[var(--ide-text-muted)] hover:bg-[var(--ide-hover)] hover:text-[var(--ide-text)]"
                  }`}
                  type="button"
                  onClick={() => onChange(item.key)}
                >
                  {active && (
                    <span className="absolute left-0 top-0 h-full w-[2px] bg-[var(--ide-accent)]" />
                  )}
                  <span className="text-[20px] leading-none">{item.icon}</span>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <div className="border-b border-[var(--ide-border)] bg-[color:color-mix(in_oklab,var(--ide-sidebar-bg)_88%,transparent)] p-2 backdrop-blur lg:hidden">
        <div className="flex flex-wrap gap-2">
          {items.map((item) => {
            const active = currentTab === item.key;

            return (
              <button
                key={item.key}
                className={`inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-[var(--ide-active)] text-[var(--ide-text)]"
                    : "border border-[var(--ide-border)] bg-[var(--ide-control-bg)] text-[var(--ide-text-muted)] hover:bg-[var(--ide-hover)]"
                }`}
                type="button"
                onClick={() => onChange(item.key)}
              >
                <span className="text-sm leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default AppManagementSidebar;
