import type { ReactNode } from "react";
import type {
  ProjectWorkspaceNavItem,
  ProjectWorkspaceTab,
} from "../../types/project-workspace";
import ProjectWorkspaceSidebar from "../navigation/project-workspace-sidebar";

interface ProjectWorkspaceLayoutProps {
  children: ReactNode;
  currentTab: ProjectWorkspaceTab;
  footer?: ReactNode;
  hero: ReactNode;
  items: ProjectWorkspaceNavItem[];
  onChange: (tab: ProjectWorkspaceTab) => void;
}

function ProjectWorkspaceLayout({
  children,
  currentTab,
  footer,
  hero,
  items,
  onChange,
}: ProjectWorkspaceLayoutProps) {
  const currentItem = items.find((item) => item.key === currentTab) ?? items[0];

  return (
    <section className="flex min-h-0 flex-1 overflow-hidden">
      <ProjectWorkspaceSidebar
        currentTab={currentTab}
        items={items}
        onChange={onChange}
      />

      <main className="flex min-h-0 flex-1 overflow-y-auto bg-transparent">
        <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col p-6">
          <div className="shrink-0">{hero}</div>

          <section className="flex min-h-0 flex-1 flex-col rounded-md border border-[var(--ide-border)] bg-[color:color-mix(in_oklab,var(--ide-control-bg)_82%,transparent)] p-6 shadow-[var(--ide-panel-shadow)] backdrop-blur">
            <div className="mb-6 border-b border-[var(--ide-border)] pb-4">
              <span className="inline-flex rounded-full border border-[var(--ide-control-border)] bg-[color:color-mix(in_oklab,var(--ide-hover)_82%,transparent)] px-2.5 py-0.5 text-xs font-medium text-[var(--ide-text-muted)] backdrop-blur">
                {currentItem.label}
              </span>
              <h2 className="mt-2 text-xl font-semibold text-[var(--ide-text)]">
                {currentItem.title}
              </h2>
              <p className="mt-1 text-sm text-[var(--ide-text-muted)]">
                {currentItem.description}
              </p>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          </section>

          {footer ? <div className="mt-auto shrink-0">{footer}</div> : null}
        </div>
      </main>
    </section>
  );
}

export default ProjectWorkspaceLayout;
