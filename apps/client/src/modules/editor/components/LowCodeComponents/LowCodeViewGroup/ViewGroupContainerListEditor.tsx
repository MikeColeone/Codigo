import { Button, Input } from "antd";
import { useMemo } from "react";
import { ulid } from "ulid";
import type { ViewGroupContainerItem } from "@codigo/materials";
import { useEditorComponents } from "@/modules/editor/hooks";

function normalizeContainers(value: unknown): ViewGroupContainerItem[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const raw = item as Record<string, unknown>;
      const id = typeof raw.id === "string" ? raw.id : "";
      if (!id) {
        return null;
      }
      return {
        id,
        name: typeof raw.name === "string" && raw.name ? raw.name : id,
      } satisfies ViewGroupContainerItem;
    })
    .filter((item): item is ViewGroupContainerItem => item != null);
}

export default function ViewGroupContainerListEditor() {
  const { getCurrentComponentConfig, moveExistingNode, store, updateCurrentComponent } =
    useEditorComponents();
  const config = getCurrentComponentConfig.get();

  const containers = useMemo(
    () => normalizeContainers((config?.props as any)?.containers),
    [config?.props],
  );
  const defaultActiveId =
    typeof (config?.props as any)?.defaultActiveId === "string"
      ? ((config?.props as any).defaultActiveId as string)
      : "";

  const resolveFallbackId = (removedId: string) => {
    const next = containers.find((item) => item.id !== removedId)?.id ?? "";
    if (next) {
      return next;
    }
    const createdId = ulid();
    updateCurrentComponent({
      containers: [{ id: createdId, name: "视图1" }],
      defaultActiveId: createdId,
    });
    return createdId;
  };

  const moveChildrenToSlot = (fromSlot: string, toSlot: string) => {
    if (!config?.id || !Array.isArray(config.childIds) || !config.childIds.length) {
      return;
    }
    const toMove = config.childIds
      .map((childId) => (childId ? store.compConfigs[childId] : null))
      .filter(Boolean)
      .filter((child) => (child.slot ?? "default") === fromSlot)
      .map((child) => child.id);

    for (const nodeId of toMove) {
      moveExistingNode({
        nodeId,
        targetParentId: config.id,
        targetSlot: toSlot,
      });
    }
  };

  return (
    <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-hover)] p-2">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-[11px] font-bold text-[var(--ide-text)]">容器列表</div>
          {config?.id ? (
            <Button
              size="small"
              onClick={() => {
                void navigator.clipboard?.writeText(config.id);
              }}
            >
              复制 ViewGroupId
            </Button>
          ) : null}
        </div>
        <Button
          size="small"
          type="primary"
          className="ml-auto"
          onClick={() => {
            const newId = ulid();
            const next = [...containers, { id: newId, name: `视图${containers.length + 1}` }];
            updateCurrentComponent({
              containers: next,
              defaultActiveId: defaultActiveId || newId,
            });
          }}
        >
          新增
        </Button>
      </div>

      <div className="space-y-2">
        {containers.length ? (
          containers.map((item) => {
            const isDefault = item.id === defaultActiveId;
            return (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-sm border border-[var(--ide-control-border)] bg-[var(--ide-control-bg)] p-2"
              >
                <Input
                  value={item.name}
                  size="small"
                  onChange={(event) => {
                    const next = containers.map((it) =>
                      it.id === item.id ? { ...it, name: event.target.value } : it,
                    );
                    updateCurrentComponent({ containers: next });
                  }}
                  className="w-full min-w-0"
                  placeholder="视图名称"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="small"
                    onClick={() => {
                      void navigator.clipboard?.writeText(item.id);
                    }}
                  >
                    复制容器Id
                  </Button>
                  <Button
                    size="small"
                    onClick={() => updateCurrentComponent({ defaultActiveId: item.id })}
                    disabled={isDefault}
                  >
                    {isDefault ? "默认" : "设为默认"}
                  </Button>
                  <Button
                    size="small"
                    danger
                    disabled={containers.length <= 1}
                    onClick={() => {
                      const fallbackId = resolveFallbackId(item.id);
                      if (fallbackId && fallbackId !== item.id) {
                        moveChildrenToSlot(item.id, fallbackId);
                      }
                      const next = containers.filter((it) => it.id !== item.id);
                      updateCurrentComponent({
                        containers: next.length ? next : [{ id: fallbackId, name: "视图1" }],
                        defaultActiveId:
                          defaultActiveId === item.id ? fallbackId : defaultActiveId,
                      });
                    }}
                  >
                    删除
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-[11px] text-[var(--ide-text-muted)]">暂无视图，请先新增</div>
        )}
      </div>
    </div>
  );
}
