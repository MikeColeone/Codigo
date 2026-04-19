import { useMemo, useState } from "react";
import type { MaterialMeta } from "../HomeMaterialsPlaza";

interface MaterialsListProps {
  materials: MaterialMeta[];
  selectedType: string | null;
  onSelect: (type: string) => void;
}

export function MaterialsList({
  materials,
  onSelect,
  selectedType,
}: MaterialsListProps) {
  const [keyword, setKeyword] = useState("");

  const filteredMaterials = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) {
      return materials;
    }

    return materials.filter((material) => {
      const haystack = `${material.name} ${material.type} ${material.description ?? ""}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [keyword, materials]);

  return (
    <div>
      <div className="sticky top-[calc(var(--header-height)+12px)] z-10 rounded-md border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-4 shadow-[var(--ide-panel-shadow)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-[var(--ide-text)]">
            物料列表
            <span className="ml-2 text-xs font-normal text-[var(--ide-text-muted)]">
              {filteredMaterials.length} / {materials.length}
            </span>
          </div>
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索物料名称 / type"
            className="h-9 w-full rounded-sm border border-[var(--ide-control-border)] bg-[var(--ide-control-bg)] px-3 text-sm text-[var(--ide-text)] outline-none transition-colors placeholder:text-[var(--ide-text-muted)] focus:border-[var(--ide-accent)] sm:w-[260px]"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {filteredMaterials.map((material) => {
          const isActive = material.type === selectedType;
          return (
            <button
              key={material.type}
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onSelect(material.type);
              }}
              className={`rounded-md border bg-[var(--ide-control-bg)] p-4 text-left shadow-[var(--ide-panel-shadow)] transition-colors ${
                isActive
                  ? "border-[var(--ide-accent)]"
                  : "border-[var(--ide-border)] hover:border-[var(--ide-control-border)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-[var(--ide-text)]">
                    {material.name}
                  </div>
                  <div className="font-mono text-[12px] text-[var(--ide-text-muted)]">
                    {material.type}
                  </div>
                </div>
                {material.isContainer ? (
                  <span className="rounded-full border border-[var(--ide-control-border)] bg-[var(--ide-hover)] px-2.5 py-1 text-[11px] font-semibold text-[var(--ide-accent)]">
                    容器
                  </span>
                ) : null}
              </div>
              <div className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--ide-text-muted)]">
                {material.description ?? "暂无描述"}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--ide-text-muted)]">
                {material.slots?.length ? (
                  <span className="rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)] px-3 py-1">
                    {material.slots.length} 个插槽
                  </span>
                ) : (
                  <span className="rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)] px-3 py-1">
                    无插槽
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
