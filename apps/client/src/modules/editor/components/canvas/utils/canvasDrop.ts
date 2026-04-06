import { getComponentContainerMeta } from "@codigo/materials";
import type { ComponentNodeRecord, TComponentTypes } from "@codigo/schema";

export interface CanvasDropResult {
  type: TComponentTypes;
  position: {
    left: number;
    top: number;
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
  currentComponentId,
  getComponentById,
  getAvailableSlots,
}: ResolveCanvasDropResultOptions): CanvasDropResult | null {
  if (!rawType) {
    return null;
  }

  const type = rawType as TComponentTypes;
  const targetElement = document.elementFromPoint(
    clientX,
    clientY,
  ) as HTMLElement | null;
  const slotZone = targetElement?.closest("[data-slot-name]") as HTMLElement | null;

  if (slotZone) {
    const slotRect = slotZone.getBoundingClientRect();
    const parentId = slotZone.dataset.containerId;
    const slot = slotZone.dataset.slotName;
    if (parentId) {
      return {
        type,
        position: {
          left: clientX - slotRect.left,
          top: clientY - slotRect.top,
        },
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
  return {
    type,
    position: {
      left: rect ? clientX - rect.left : 32,
      top: rect ? clientY - rect.top : 24,
    },
  };
}
