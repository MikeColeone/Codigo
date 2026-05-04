import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import type { MaterialMeta } from "../home-materials-plaza";

interface MaterialSectionMeta {
  key: string;
  label: string;
}

interface MaterialsListProps {
  materials: MaterialMeta[];
  sections: MaterialSectionMeta[];
  onSelect: (type: string) => void;
}

export function MaterialsList({ materials, onSelect, sections }: MaterialsListProps) {
  const [keyword, setKeyword] = useState("");
  const [activeSectionKey, setActiveSectionKey] = useState<string>("all");

  const sectionSummaries = useMemo(
    () =>
      sections.map((section) => ({
        ...section,
        count: materials.filter((material) => material.sectionKey === section.key).length,
      })),
    [materials, sections],
  );

  useEffect(() => {
    if (
      activeSectionKey !== "all" &&
      !sectionSummaries.some((section) => section.key === activeSectionKey)
    ) {
      setActiveSectionKey("all");
    }
  }, [activeSectionKey, sectionSummaries]);

  const filteredMaterials = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    return materials.filter((material) => {
      const matchSection =
        activeSectionKey === "all" || material.sectionKey === activeSectionKey;
      if (!matchSection) {
        return false;
      }
      if (!normalized) {
        return true;
      }

      const haystack =
        `${material.name} ${material.type} ${material.description ?? ""}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [activeSectionKey, keyword, materials]);

  return (
    <div className="space-y-6">
      <div className="sticky top-[calc(var(--header-height)+12px)] z-10 rounded-md border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-4 shadow-[var(--ide-panel-shadow)] backdrop-blur">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-semibold text-[var(--ide-text)]">
              物料列表
              <span className="ml-2 text-xs font-normal text-[var(--ide-text-muted)]">
                {filteredMaterials.length} / {materials.length}
              </span>
            </div>
            <label className="relative w-full sm:w-[300px]">
              <SearchOutlined className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ide-text-muted)]" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="搜索物料名称 / type"
                className="h-10 w-full rounded-full border border-[var(--ide-control-border)] bg-[var(--ide-control-bg)] pl-9 pr-4 text-sm text-[var(--ide-text)] outline-none transition-colors placeholder:text-[var(--ide-text-muted)] focus:border-[var(--ide-accent)]"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSectionKey("all")}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                activeSectionKey === "all"
                  ? "border-[var(--ide-accent)] bg-[var(--ide-active)] text-[var(--ide-text)]"
                  : "border-[var(--ide-border)] bg-[var(--ide-control-bg)] text-[var(--ide-text-muted)] hover:border-[var(--ide-control-border)] hover:text-[var(--ide-text)]"
              }`}
            >
              全部
            </button>
            {sectionSummaries.map((section) => (
              <button
                key={section.key}
                type="button"
                onClick={() => setActiveSectionKey(section.key)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  activeSectionKey === section.key
                    ? "border-[var(--ide-accent)] bg-[var(--ide-active)] text-[var(--ide-text)]"
                    : "border-[var(--ide-border)] bg-[var(--ide-control-bg)] text-[var(--ide-text-muted)] hover:border-[var(--ide-control-border)] hover:text-[var(--ide-text)]"
                }`}
              >
                {section.label}
                <span className="ml-1.5 text-xs opacity-80">{section.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredMaterials.map((material) => {
          return (
            <button
              key={material.type}
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onSelect(material.type);
              }}
              className="rounded-md border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-4 text-left shadow-[var(--ide-panel-shadow)] transition-colors hover:border-[var(--ide-control-border)] hover:bg-[var(--ide-hover)]"
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
              <div className="mt-3">
                <span className="rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)] px-3 py-1 text-xs text-[var(--ide-text-muted)]">
                  {material.sectionLabel}
                </span>
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

      {!filteredMaterials.length ? (
        <div className="rounded-md border border-dashed border-[var(--ide-border)] bg-[var(--ide-hover)] px-6 py-12 text-center text-sm text-[var(--ide-text-muted)]">
          当前筛选条件下暂无物料
        </div>
      ) : null}
    </div>
  );
}
