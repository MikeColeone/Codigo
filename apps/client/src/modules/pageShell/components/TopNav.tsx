import type { Dispatch, SetStateAction } from "react";
import type { ShellTreeNode } from "../utils/tree";

interface TopNavProps {
  title: string;
  roots: ShellTreeNode[];
  activePagePath: string | null;
  openPaths: Set<string>;
  setOpenPaths: Dispatch<SetStateAction<Set<string>>>;
  onSelectPagePath: (path: string) => void;
  interactive?: boolean;
}

export function TopNav({
  title,
  roots,
  activePagePath,
  openPaths,
  setOpenPaths,
  onSelectPagePath,
  interactive = true,
}: TopNavProps) {
  const navInteractiveClass = interactive ? "" : "pointer-events-none select-none";

  const renderTopNavItem = (node: ShellTreeNode) => {
    const hasChildren = node.children.length > 0;
    const isActive = Boolean(
      activePagePath &&
        (activePagePath === node.path || activePagePath.startsWith(`${node.path}/`)),
    );

    if (!hasChildren) {
      const page = node.page;
      if (!page) return null;
      return (
        <button
          key={node.path}
          type="button"
          onClick={() => onSelectPagePath(page.path)}
          className={`h-9 px-3 rounded-md text-sm transition-colors ${
            page.path === activePagePath
              ? "bg-slate-900 text-white"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          {page.name}
        </button>
      );
    }

    const isOpen = openPaths.has(node.path);

    const renderDropdownNode = (child: ShellTreeNode, depth: number) => {
      if (!child.children.length) {
        const page = child.page;
        if (!page) return null;
        const active = page.path === activePagePath;
        return (
          <button
            key={page.id}
            type="button"
            onClick={() => onSelectPagePath(page.path)}
            className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
              active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
            }`}
            style={{ paddingLeft: 12 + depth * 12 }}
          >
            {page.name}
          </button>
        );
      }

      const activeGroup = Boolean(
        activePagePath &&
          (activePagePath === child.path || activePagePath.startsWith(`${child.path}/`)),
      );
      const overview = child.page;
      return (
        <div key={child.path} className="flex flex-col gap-1">
          <div
            className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-wider ${
              activeGroup ? "text-slate-900" : "text-slate-500"
            }`}
            style={{ paddingLeft: 12 + depth * 12 }}
          >
            {child.label}
          </div>
          {overview ? (
            <button
              type="button"
              onClick={() => onSelectPagePath(overview.path)}
              className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
                overview.path === activePagePath
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
              style={{ paddingLeft: 24 + depth * 12 }}
            >
              {overview.name}
            </button>
          ) : null}
          {child.children.map((grand) => renderDropdownNode(grand, depth + 1))}
        </div>
      );
    };

    return (
      <details
        key={node.path}
        open={isOpen}
        onToggle={(event) => {
          const target = event.currentTarget;
          setOpenPaths((prev) => {
            const next = new Set(prev);
            if (target.open) {
              next.add(node.path);
            } else {
              next.delete(node.path);
            }
            return next;
          });
        }}
        className="relative"
      >
        <summary
          className={`list-none h-9 px-3 rounded-md text-sm transition-colors cursor-pointer flex items-center gap-2 ${
            isActive ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <span className="truncate">{node.label}</span>
          <span
            className={`text-xs text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </summary>
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
          {node.page ? (
            <button
              type="button"
              onClick={() => onSelectPagePath(node.page!.path)}
              className={`mb-1 w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
                node.page!.path === activePagePath
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {node.page!.name}
            </button>
          ) : null}
          <div className="max-h-[320px] overflow-y-auto">
            <div className="flex flex-col gap-1">
              {node.children.map((child) => renderDropdownNode(child, 0))}
            </div>
          </div>
        </div>
      </details>
    );
  };

  return (
    <header className={`h-14 shrink-0 border-b border-slate-200 bg-white ${navInteractiveClass}`}>
      <div className="h-full px-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex items-center gap-3">
          <div className="shrink-0 h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-semibold">
            C
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">{title}</div>
            <div className="truncate text-[11px] text-slate-500">Workspace</div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-1">{roots.map(renderTopNavItem)}</nav>
      </div>
      <div className="md:hidden border-t border-slate-200 px-3 py-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {roots.map(renderTopNavItem)}
        </div>
      </div>
    </header>
  );
}

