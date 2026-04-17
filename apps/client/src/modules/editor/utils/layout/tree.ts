import type {
  ComponentNodeRecord,
  PageGridConfig,
  PageLayoutMode,
} from "@codigo/schema";
import { getDefaultPosition, getDefaultWidthByType } from "./defaults";

/**
 * 根据布局模式归一化组件定位信息。
 */
export function normalizeLayout(
  compConfigs: Record<string, ComponentNodeRecord>,
  ids: string[],
  options?: {
    layoutMode?: PageLayoutMode;
    grid?: PageGridConfig;
  },
) {
  const layoutMode = options?.layoutMode ?? "absolute";

  if (layoutMode === "grid") {
    const cols = Math.max(1, Math.floor(options?.grid?.cols ?? 12));
    const rows = Math.max(1, Math.floor(options?.grid?.rows ?? 12));

    ids.forEach((id, index) => {
      const comp = compConfigs[id];
      if (!comp) return;
      const nextStyles = { ...(comp.styles ?? {}) };

      const fallbackColumnStart = (index % cols) + 1;
      const fallbackRowStart = (Math.floor(index / cols) % rows) + 1;
      const normalizedColumnStart = Math.max(
        1,
        Math.min(
          cols,
          Math.floor(
            Number(nextStyles.gridColumnStart ?? fallbackColumnStart),
          ),
        ),
      );
      const normalizedRowStart = Math.max(
        1,
        Math.min(
          rows,
          Math.floor(Number(nextStyles.gridRowStart ?? fallbackRowStart)),
        ),
      );
      const normalizedColumnSpan = Math.max(
        1,
        Math.min(cols - normalizedColumnStart + 1, Math.floor(Number(nextStyles.gridColumnSpan ?? 1))),
      );
      const normalizedRowSpan = Math.max(
        1,
        Math.min(rows - normalizedRowStart + 1, Math.floor(Number(nextStyles.gridRowSpan ?? 1))),
      );

      nextStyles.position = "relative";
      nextStyles.gridColumnStart = normalizedColumnStart;
      nextStyles.gridColumnSpan = normalizedColumnSpan;
      nextStyles.gridRowStart = normalizedRowStart;
      nextStyles.gridRowSpan = normalizedRowSpan;
      nextStyles.left = undefined;
      nextStyles.top = undefined;
      nextStyles.width = nextStyles.width ?? "100%";
      nextStyles.height = nextStyles.height ?? "100%";

      comp.styles = nextStyles;
      normalizeLayout(compConfigs, comp.childIds, { layoutMode: "absolute" });
    });
    return;
  }

  ids.forEach((id, index) => {
    const comp = compConfigs[id];
    if (!comp) return;
    const nextStyles = { ...(comp.styles ?? {}) };
    const hasPosition =
      nextStyles.left !== undefined && nextStyles.top !== undefined;
    const fallbackPosition = getDefaultPosition(index);

    nextStyles.position = "absolute";
    nextStyles.left = hasPosition ? nextStyles.left : fallbackPosition.left;
    nextStyles.top = hasPosition ? nextStyles.top : fallbackPosition.top;
    nextStyles.width =
      nextStyles.width === "100%" && !hasPosition
        ? getDefaultWidthByType(comp.type)
        : (nextStyles.width ?? getDefaultWidthByType(comp.type));

    comp.styles = nextStyles;
    normalizeLayout(compConfigs, comp.childIds, { layoutMode: "absolute" });
  });
}

/**
 * 收集指定节点及其所有子孙节点 ID。
 */
export function gatherSubtreeIds(
  compConfigs: Record<string, ComponentNodeRecord>,
  id: string,
): string[] {
  const current = compConfigs[id];
  if (!current) return [];
  return [
    id,
    ...current.childIds.flatMap((childId) =>
      gatherSubtreeIds(compConfigs, childId),
    ),
  ];
}
