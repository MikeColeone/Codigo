import type { ReactNode } from "react";

interface ProjectWorkspaceLayoutProps {
  children: ReactNode;
  footer?: ReactNode;
}

function ProjectWorkspaceLayout({
  children,
  footer,
}: ProjectWorkspaceLayoutProps) {
  return (
    <section className="flex min-h-0 flex-1 overflow-hidden">
      <main className="flex min-h-0 flex-1 overflow-y-auto bg-transparent">
        <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col p-6">
          <section className="flex min-h-0 flex-1 flex-col rounded-md border border-[var(--ide-border)] bg-[color:color-mix(in_oklab,var(--ide-control-bg)_82%,transparent)] p-6 shadow-[var(--ide-panel-shadow)] backdrop-blur">
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          </section>

          {footer ? <div className="mt-auto shrink-0">{footer}</div> : null}
        </div>
      </main>
    </section>
  );
}

export default ProjectWorkspaceLayout;
