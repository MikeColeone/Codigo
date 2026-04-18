import type { PropsWithChildren } from "react";
import { useEffect, useMemo, useState } from "react";
import type { IEditorPageSchema, PageShellLayout } from "@codigo/schema";

type AdminShellPage = Pick<IEditorPageSchema, "id" | "name" | "path">;

interface AdminShellProps extends PropsWithChildren {
  pages: AdminShellPage[];
  activePagePath: string | null;
  onSelectPagePath: (path: string) => void;
  title?: string;
  layout?: PageShellLayout;
  interactive?: boolean;
}

type ShellTreeNode = {
  path: string;
  label: string;
  page?: AdminShellPage;
  children: ShellTreeNode[];
  order: number;
};

function buildShellTree(pages: AdminShellPage[]) {
  const roots = new Map<string, ShellTreeNode>();
  const childrenMap = new Map<string, Map<string, ShellTreeNode>>();

  const getChildren = (path: string) => {
    const existing = childrenMap.get(path);
    if (existing) return existing;
    const created = new Map<string, ShellTreeNode>();
    childrenMap.set(path, created);
    return created;
  };

  const ensureNode = (parent: string, segment: string, fullPath: string, order: number) => {
    const map = parent ? getChildren(parent) : roots;
    const existing = map.get(segment);
    if (existing) {
      existing.order = Math.min(existing.order, order);
      return existing;
    }
    const created: ShellTreeNode = {
      path: fullPath,
      label: segment,
      children: [],
      order,
    };
    map.set(segment, created);
    return created;
  };

  pages.forEach((page, index) => {
    const segments = page.path.split("/").filter(Boolean);
    if (!segments.length) return;
    let parent = "";
    let currentNode: ShellTreeNode | null = null;
    for (let i = 0; i < segments.length; i += 1) {
      const segment = segments[i];
      const fullPath = parent ? `${parent}/${segment}` : segment;
      currentNode = ensureNode(parent, segment, fullPath, index);
      parent = fullPath;
    }
    if (currentNode) {
      currentNode.page = page;
    }
  });

  const materialize = (map: Map<string, ShellTreeNode>): ShellTreeNode[] => {
    const nodes = Array.from(map.values());
    nodes.forEach((node) => {
      const childMap = childrenMap.get(node.path);
      if (childMap) {
        node.children = materialize(childMap);
        if (node.children.length) {
          node.order = Math.min(node.order, node.children[0]?.order ?? node.order);
        }
      }
    });
    return nodes.sort((a, b) =>
      a.order !== b.order ? a.order - b.order : a.path.localeCompare(b.path),
    );
  };

  return materialize(roots);
}

function deriveOpenPaths(activePagePath: string | null) {
  const next = new Set<string>();
  const path = activePagePath?.trim() ?? "";
  if (!path) return next;
  const segments = path.split("/").filter(Boolean);
  let current = "";
  for (let i = 0; i < segments.length - 1; i += 1) {
    current = current ? `${current}/${segments[i]}` : segments[i];
    next.add(current);
  }
  return next;
}

function resolveActiveTopNode(roots: ShellTreeNode[], activePagePath: string | null) {
  const path = activePagePath?.trim() ?? "";
  if (!path) return null;
  const first = path.split("/").filter(Boolean)[0];
  if (!first) return null;
  return roots.find((node) => node.path === first) ?? null;
}

export function AdminShell({
  pages,
  activePagePath,
  onSelectPagePath,
  title = "管理后台",
  layout = "leftRight",
  interactive = true,
  children,
}: AdminShellProps) {
  const treeRoots = useMemo(() => buildShellTree(pages), [pages]);
  const pagePathIndex = useMemo(() => {
    const map = new Map<string, AdminShellPage>();
    pages.forEach((p) => map.set(p.path, p));
    return map;
  }, [pages]);

  const derivedOpenPaths = useMemo(() => deriveOpenPaths(activePagePath), [activePagePath]);
  const [openPaths, setOpenPaths] = useState<Set<string>>(() => derivedOpenPaths);
  useEffect(() => {
    setOpenPaths(derivedOpenPaths);
  }, [derivedOpenPaths]);

  const navInteractiveClass = interactive ? "" : "pointer-events-none select-none";

  const renderSidebarNode = (node: ShellTreeNode, depth: number) => {
    const hasChildren = node.children.length > 0;
    const isActiveLeaf = Boolean(node.page && node.page.path === activePagePath);
    const isActiveGroup = Boolean(
      activePagePath &&
        (activePagePath === node.path || activePagePath.startsWith(`${node.path}/`)),
    );

    if (!hasChildren) {
      const page = node.page;
      if (!page) return null;
      const isActive = page.path === activePagePath;
      return (
        <button
          key={page.id}
          type="button"
          onClick={() => onSelectPagePath(page.path)}
          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
            isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
          }`}
          style={{ paddingLeft: 12 + depth * 12 }}
        >
          {page.name}
        </button>
      );
    }

    const isOpen = openPaths.has(node.path);
    const overviewPage = node.page;
    const childPages = node.children.map((child) => renderSidebarNode(child, depth + 1));

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
        className="group"
      >
        <summary
          className={`list-none flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors cursor-pointer ${
            isActiveGroup ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-100"
          }`}
          style={{ paddingLeft: 12 + depth * 12 }}
        >
          <span className="truncate font-medium">{node.label}</span>
          <span
            className={`ml-2 inline-flex h-5 w-5 items-center justify-center rounded text-xs text-slate-400 transition-transform ${
              isOpen ? "rotate-90" : ""
            }`}
          >
            ›
          </span>
        </summary>
        <div className="mt-1 flex flex-col gap-1">
          {overviewPage ? (
            <button
              type="button"
              onClick={() => onSelectPagePath(overviewPage.path)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                isActiveLeaf
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
              style={{ paddingLeft: 24 + depth * 12 }}
            >
              {overviewPage.name}
            </button>
          ) : null}
          {childPages}
        </div>
      </details>
    );
  };

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
          <span className={`text-xs text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}>
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

  const breadcrumb = useMemo(() => {
    const path = activePagePath?.trim() ?? "";
    if (!path) return [];
    const segments = path.split("/").filter(Boolean);
    const crumbs: { label: string; path: string; canNavigate: boolean }[] = [];
    let current = "";
    for (const segment of segments) {
      current = current ? `${current}/${segment}` : segment;
      const canNavigate = pagePathIndex.has(current);
      crumbs.push({ label: segment, path: current, canNavigate });
    }
    return crumbs;
  }, [activePagePath, pagePathIndex]);

  if (layout === "none") {
    return <>{children}</>;
  }

  const TopBar = (
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
        <nav className="hidden md:flex items-center gap-1">
          {treeRoots.map((node) => renderTopNavItem(node))}
        </nav>
      </div>
      <div className="md:hidden border-t border-slate-200 px-3 py-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {treeRoots.map((node) => renderTopNavItem(node))}
        </div>
      </div>
    </header>
  );

  const BreadcrumbRow =
    layout === "breadcrumb" ? (
      <div className={`shrink-0 border-b border-slate-200 bg-white ${navInteractiveClass}`}>
        <div className="h-11 px-4 flex items-center gap-2 text-sm text-slate-600">
          {breadcrumb.length ? (
            <div className="flex items-center gap-1">
              {breadcrumb.map((item, index) => {
                const isLast = index === breadcrumb.length - 1;
                return (
                  <div key={item.path} className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={!item.canNavigate || isLast}
                      onClick={() => {
                        if (!item.canNavigate || isLast) return;
                        onSelectPagePath(item.path);
                      }}
                      className={`max-w-40 truncate rounded px-2 py-1 transition-colors ${
                        isLast
                          ? "text-slate-900 font-medium"
                          : item.canNavigate
                            ? "hover:bg-slate-100"
                            : "opacity-60"
                      }`}
                    >
                      {item.label}
                    </button>
                    {!isLast ? <span className="text-slate-300">/</span> : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <span className="text-slate-400">未选择页面</span>
          )}
        </div>
      </div>
    ) : null;

  if (layout === "topBottom" || layout === "breadcrumb") {
    return (
      <div className="h-full w-full flex flex-col bg-slate-50">
        {TopBar}
        {BreadcrumbRow}
        <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
      </div>
    );
  }

  if (layout === "topLeft") {
    const activeTop = resolveActiveTopNode(treeRoots, activePagePath);
    const sidebarNodes = activeTop?.children ?? [];
    const overviewPage = activeTop?.page ?? null;
    return (
      <div className="h-full w-full flex flex-col bg-slate-50">
        {TopBar}
        <div className="flex-1 min-h-0 flex">
          <aside className={`h-full w-56 shrink-0 border-r border-slate-200 bg-white flex flex-col ${navInteractiveClass}`}>
            <div className="h-12 px-4 flex items-center border-b border-slate-200 text-sm font-semibold text-slate-900">
              {activeTop?.label ?? "导航"}
            </div>
            <nav className="flex-1 min-h-0 p-2 flex flex-col gap-1 overflow-y-auto">
              {overviewPage ? (
                <button
                  type="button"
                  onClick={() => onSelectPagePath(overviewPage.path)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    overviewPage.path === activePagePath
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {overviewPage.name}
                </button>
              ) : null}
              {sidebarNodes.map((node) => renderSidebarNode(node, 0))}
            </nav>
          </aside>
          <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
        </div>
      </div>
    );
  }

  if (layout === "leftTop") {
    return (
      <div className="h-full w-full flex flex-col bg-slate-50">
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
            <div className="text-[11px] text-slate-500">预览/发布壳布局</div>
          </div>
        </header>
        <div className="flex-1 min-h-0 flex">
          <aside className={`h-full w-56 shrink-0 border-r border-slate-200 bg-white flex flex-col ${navInteractiveClass}`}>
            <nav className="flex-1 min-h-0 p-2 flex flex-col gap-1 overflow-y-auto">
              {treeRoots.map((node) => renderSidebarNode(node, 0))}
            </nav>
          </aside>
          <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex bg-slate-50">
      <aside className={`h-full w-56 shrink-0 border-r border-slate-200 bg-white flex flex-col ${navInteractiveClass}`}>
        <div className="h-14 px-4 flex items-center border-b border-slate-200 font-semibold text-slate-900">
          {title}
        </div>
        <nav className="flex-1 min-h-0 p-2 flex flex-col gap-1 overflow-y-auto">
          {treeRoots.map((node) => renderSidebarNode(node, 0))}
        </nav>
      </aside>
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
    </div>
  );
}

