import { builtinComponentDefinitions } from "@codigo/materials";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getEditorComponentSections } from "@/modules/editor/registry/components";
import { MaterialsList } from "./materials-plaza/materials-list";

export type MaterialMeta = {
  type: string;
  name: string;
  description?: string;
  isContainer?: boolean;
  slots?: { name: string; title?: string; multiple?: boolean }[];
  sectionKey: string;
  sectionLabel: string;
};

export function HomeMaterialsPlaza() {
  const navigate = useNavigate();

  const sections = useMemo(() => {
    return getEditorComponentSections("admin")
      .filter((section) => section.items.length > 0)
      .map((section) => ({
        key: section.key,
        label: section.label,
        types: new Set(section.items.map((item) => item.type)),
      }));
  }, []);

  const materials = useMemo<MaterialMeta[]>(
    () =>
      builtinComponentDefinitions
        .map((item) => ({
          type: String(item.type),
          name: String(item.name),
          description: item.description,
          isContainer: item.isContainer,
          slots: item.slots,
          section:
            sections.find((section) => section.types.has(String(item.type))) ?? null,
        }))
        .filter(
          (
            item,
          ): item is Omit<MaterialMeta, "sectionKey" | "sectionLabel"> & {
            section: (typeof sections)[number];
          } => Boolean(item.section),
        )
        .map((item) => ({
          type: item.type,
          name: item.name,
          description: item.description,
          isContainer: item.isContainer,
          slots: item.slots,
          sectionKey: item.section.key,
          sectionLabel: item.section.label,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [sections],
  );

  const openMaterial = (type: string) => {
    navigate(
      `/doc?page=materials&section=${encodeURIComponent(`materials-${type}`)}`,
    );
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-14 pt-10">
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ide-text-muted)]">
          Materials Plaza
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--ide-text)]">
          物料广场
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-[var(--ide-text-muted)]">
          点击物料将跳转到使用手册的对应条目，查看详细说明与注意事项。
        </p>
      </div>

      <div className="mt-6">
        <MaterialsList
          materials={materials}
          sections={sections.map((section) => ({
            key: section.key,
            label: section.label,
          }))}
          onSelect={openMaterial}
        />
      </div>
    </section>
  );
}
