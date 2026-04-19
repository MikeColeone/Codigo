import type { MaterialMeta } from "../HomeMaterialsPlaza";
import { MATERIALS_VERSION } from "@/modules/home/data/materialDocs";

interface MaterialDocPanelProps {
  material: MaterialMeta | null;
  onBack: () => void;
}

export function MaterialDocPanel({ material, onBack }: MaterialDocPanelProps) {
  return (
    <div className="sticky top-[calc(var(--header-height)+12px)] rounded-md border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-5 shadow-[var(--ide-panel-shadow)]">
      {material ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-lg font-bold text-[var(--ide-text)]">
                {material.name}
              </div>
              <div className="mt-1 font-mono text-[12px] text-[var(--ide-text-muted)]">
                {material.type} · v{MATERIALS_VERSION}
              </div>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="rounded-sm border border-[var(--ide-control-border)] bg-[var(--ide-control-bg)] px-3 py-2 text-sm font-medium text-[var(--ide-text)] transition-colors hover:bg-[var(--ide-hover)]"
            >
              返回列表
            </button>
          </div>

          <div className="rounded-md border border-[var(--ide-border)] bg-[var(--ide-hover)] px-4 py-3 text-sm leading-6 text-[var(--ide-text-muted)]">
            {material.description ?? "暂无描述"}
          </div>

          <div className="grid gap-3 text-sm text-[var(--ide-text)]">
            <div className="flex items-center justify-between gap-3 rounded-md border border-[var(--ide-border)] bg-[var(--ide-control-bg)] px-4 py-3">
              <span className="text-[var(--ide-text-muted)]">容器能力</span>
              <span className="font-semibold">
                {material.isContainer ? "是" : "否"}
              </span>
            </div>

            <div className="rounded-md border border-[var(--ide-border)] bg-[var(--ide-control-bg)] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[var(--ide-text-muted)]">插槽</span>
                <span className="font-semibold">{material.slots?.length ?? 0}</span>
              </div>
              {material.slots?.length ? (
                <div className="mt-3 space-y-2">
                  {material.slots.map((slot) => (
                    <div
                      key={slot.name}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-[var(--ide-border)] bg-[var(--ide-hover)] px-3 py-2 text-xs"
                    >
                      <span className="font-mono text-[12px] text-[var(--ide-text)]">
                        {slot.name}
                      </span>
                      <span className="text-[var(--ide-text-muted)]">
                        {slot.title ?? "未命名插槽"}
                        {slot.multiple ? " · 可多选" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-[var(--ide-text)]">
            选择一个物料
          </div>
          <div className="text-sm leading-6 text-[var(--ide-text-muted)]">
            从左侧列表点击任意物料，即可在这里查看物料说明与描述信息。
          </div>
        </div>
      )}
    </div>
  );
}
