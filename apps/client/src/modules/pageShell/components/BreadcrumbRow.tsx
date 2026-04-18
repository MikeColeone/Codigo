import { useMemo } from "react";

interface BreadcrumbRowProps {
  activePagePath: string | null;
  pagePathIndex: Map<string, unknown>;
  onSelectPagePath: (path: string) => void;
  interactive?: boolean;
}

export function BreadcrumbRow({
  activePagePath,
  pagePathIndex,
  onSelectPagePath,
  interactive = true,
}: BreadcrumbRowProps) {
  const navInteractiveClass = interactive ? "" : "pointer-events-none select-none";
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

  return (
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
  );
}

