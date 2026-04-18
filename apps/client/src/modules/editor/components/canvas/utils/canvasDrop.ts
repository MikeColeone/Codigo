import { getComponentContainerMeta } from "@codigo/materials";
import type { ComponentNodeRecord, LayoutBlock, TComponentTypes } from "@codigo/schema";
import {
  collectSiblingRects,
  getEstimatedRectByType,
  resolveCollisionFreeRect,
} from "./collision";
import { resolveSlotZoneFromPoint } from "./resolveSlotZone";
import { findLayoutBlockAt } from "@/modules/editor/utils/layoutBlocks";

export interface CanvasDropResult {
  type: TComponentTypes;
  position: {
    left: number;
    top: number;
  };
  bounds?: {
    width: number;
    height: number;
  };
  containerTarget?: {
    parentId: string;
    slot: string;
  };
}

interface ResolveCanvasDropResultOptions {
  clientX: number;
  clientY: number;
  rawType: string;
  canvasElement: HTMLDivElement | null;
  layoutBlocks?: LayoutBlock[];
  currentComponentId: string | null;
  getComponentById: (id: string) => ComponentNodeRecord | undefined | null;
  getAvailableSlots: (type: TComponentTypes) => Array<{ name: string }>;
}

/**
 * 解析画布 drop 事件应生成的插入结果。
 */
export function resolveCanvasDropResult({
  clientX,
  clientY,
  rawType,
  canvasElement,
  layoutBlocks,
  currentComponentId,
  getComponentById,
  getAvailableSlots,
}: ResolveCanvasDropResultOptions): CanvasDropResult | null {
  if (!rawType) {
    return null;
  }

  const type = rawType as TComponentTypes;
  /**
   * 根据候选位置和容器上下文计算最终不重叠的插入坐标。
   */
  function resolveSafePosition(
    left: number,
    top: number,
    rect: DOMRect,
    parentId: string | null,
    slot: string | null,
    layoutBlock?: LayoutBlock | null,
  ) {
    if (!layoutBlock) {
      const estimatedRect = getEstimatedRectByType(type, left, top);
      const safeRect = resolveCollisionFreeRect(
        estimatedRect,
        collectSiblingRects(parentId, slot, rect),
        {
          width: rect.width,
          height: Math.max(rect.height, estimatedRect.top + estimatedRect.height + 24),
        },
      );
      return {
        left: safeRect.left,
        top: safeRect.top,
      };
    }

    const localLeft = left - layoutBlock.x;
    const localTop = top - layoutBlock.y;
    const estimatedRect = getEstimatedRectByType(type, localLeft, localTop);
    const siblingRects = collectSiblingRects(parentId, slot, rect)
      .filter((item) => {
        const x1 = item.left;
        const y1 = item.top;
        const x2 = item.left + item.width;
        const y2 = item.top + item.height;
        return !(
          x2 <= layoutBlock.x ||
          x1 >= layoutBlock.x + layoutBlock.width ||
          y2 <= layoutBlock.y ||
          y1 >= layoutBlock.y + layoutBlock.height
        );
      })
      .map((item) => ({
        ...item,
        left: item.left - layoutBlock.x,
        top: item.top - layoutBlock.y,
      }));
    const safeRect = resolveCollisionFreeRect(
      estimatedRect,
      siblingRects,
      {
        width: layoutBlock.width,
        height: Math.max(
          layoutBlock.height,
          estimatedRect.top + estimatedRect.height + 24,
        ),
      },
    );
    return {
      left: safeRect.left + layoutBlock.x,
      top: safeRect.top + layoutBlock.y,
    };
  }
  const slotZone = resolveSlotZoneFromPoint({ clientX, clientY });

  if (slotZone) {
    const slotRect = slotZone.getBoundingClientRect();
    const parentId = slotZone.dataset.containerId;
    const slot = slotZone.dataset.slotName;
    if (parentId) {
      const safePosition = resolveSafePosition(
        clientX - slotRect.left,
        clientY - slotRect.top,
        slotRect,
        parentId,
        slot ?? "default",
      );
      return {
        type,
        position: safePosition,
        bounds: { width: slotRect.width, height: slotRect.height },
        containerTarget: {
          parentId,
          slot: slot ?? "default",
        },
      };
    }
  }

  const current = currentComponentId ? getComponentById(currentComponentId) : null;
  if (current) {
    const meta = getComponentContainerMeta(current.type);
    if (meta.isContainer) {
      if (current.type === "viewGroup") {
        const containers = Array.isArray((current.props as any)?.containers)
          ? ((current.props as any).containers as Array<Record<string, unknown>>)
          : [];
        const ids = containers
          .map((item) => (typeof item?.id === "string" ? (item.id as string) : ""))
          .filter(Boolean);
        const defaultActiveId =
          typeof (current.props as any)?.defaultActiveId === "string"
            ? ((current.props as any).defaultActiveId as string)
            : "";
        const slot = (defaultActiveId && ids.includes(defaultActiveId)
          ? defaultActiveId
          : ids[0]) ?? "default";
        return {
          type,
          position: {
            left: 24,
            top: 24,
          },
          containerTarget: {
            parentId: current.id,
            slot,
          },
        };
      }
      return {
        type,
        position: {
          left: 24,
          top: 24,
        },
        containerTarget: {
          parentId: current.id,
          slot: getAvailableSlots(current.type)[0]?.name ?? "default",
        },
      };
    }
  }

  const rect = canvasElement?.getBoundingClientRect();
  const layoutBlock =
    rect && layoutBlocks?.length
      ? findLayoutBlockAt(layoutBlocks, clientX - rect.left, clientY - rect.top)
      : null;
  const safePosition = rect
    ? resolveSafePosition(
        clientX - rect.left,
        clientY - rect.top,
        rect,
        null,
        null,
        layoutBlock,
      )
    : { left: 32, top: 24 };
  return {
    type,
    position: safePosition,
    bounds: rect ? { width: rect.width, height: rect.height } : undefined,
  };
}
