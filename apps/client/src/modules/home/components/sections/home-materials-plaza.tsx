import { builtinComponentDefinitions } from "@codigo/materials";
import { useMemo } from "react";
import type { TComponentTypes } from "@codigo/schema";
import { useNavigate } from "react-router-dom";
import { getEditorComponentSections } from "@/modules/editor/registry/components";
import { MaterialsList } from "./materials-plaza/materials-list";

export type MaterialMeta = {
  type: TComponentTypes;
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
        types: new Set<TComponentTypes>(section.items.map((item) => item.type)),
      }));
  }, []);

  const materials = useMemo<MaterialMeta[]>(
    () => {
      const result = builtinComponentDefinitions.reduce<MaterialMeta[]>(
        (list, item) => {
          const section = sections.find((candidate) =>
            candidate.types.has(item.type),
          );
          if (!section) {
            return list;
          }
          list.push({
            type: item.type,
            name: item.name,
            description: item.description,
            isContainer: item.isContainer,
            slots: item.slots,
            sectionKey: section.key,
            sectionLabel: section.label,
          });
          return list;
        },
        [],
      );
      return result.sort((a, b) => a.name.localeCompare(b.name));
    },
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
