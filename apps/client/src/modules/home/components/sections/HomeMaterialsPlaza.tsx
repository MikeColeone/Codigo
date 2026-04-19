import { builtinComponentDefinitions } from "@codigo/materials";
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MaterialDocPanel } from "./materialsPlaza/MaterialDocPanel";
import { MaterialsList } from "./materialsPlaza/MaterialsList";

export type MaterialMeta = {
  type: string;
  name: string;
  description?: string;
  isContainer?: boolean;
  slots?: { name: string; title?: string; multiple?: boolean }[];
};

export function HomeMaterialsPlaza() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedType = searchParams.get("type");

  const materials = useMemo<MaterialMeta[]>(
    () =>
      builtinComponentDefinitions
        .map((item) => ({
          type: String(item.type),
          name: String(item.name),
          description: item.description,
          isContainer: item.isContainer,
          slots: item.slots,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const selectedMaterial = useMemo(() => {
    if (!selectedType) {
      return null;
    }
    return materials.find((item) => item.type === selectedType) ?? null;
  }, [materials, selectedType]);

  const openMaterial = (type: string) => {
    navigate(
      `/doc?page=materials&section=${encodeURIComponent(`materials-${type}`)}`,
    );
  };

  const clearSelection = () => {
    const next = new URLSearchParams(searchParams);
    next.set("view", "materials");
    next.delete("type");
    setSearchParams(next);
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
          点击物料将跳转到开发文档的对应条目，查看详细说明。
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <MaterialsList
            materials={materials}
            selectedType={selectedType}
            onSelect={openMaterial}
          />
        </div>
        <div className="lg:col-span-5">
          <MaterialDocPanel material={selectedMaterial} onBack={clearSelection} />
        </div>
      </div>
    </section>
  );
}
