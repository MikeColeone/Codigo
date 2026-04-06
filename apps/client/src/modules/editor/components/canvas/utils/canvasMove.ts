import type { ComponentNodeRecord } from "@codigo/schema";

export interface MovingComponentState {
  id: string;
  startX: number;
  startY: number;
  origLeft: number;
  origTop: number;
  pointerOffsetX: number;
  pointerOffsetY: number;
}

export interface CanvasMoveTarget {
  parentId: string | null;
  slot: string | null;
  index: number;
  left: number;
  top: number;
}

interface ResolveMoveTargetOptions {
  movingId: string;
  clientX: number;
  clientY: number;
  canvasElement: HTMLDivElement | null;
  movingComponent: MovingComponentState | null;
  getComponentById: (id: string) => ComponentNodeRecord | undefined | null;
}

/**
 * 获取组件用于定位的参考矩形。
 */
export function getPositioningRect(
  element: HTMLElement,
  fallback: HTMLDivElement | null,
) {
  const offsetParent = element.offsetParent;
  if (offsetParent instanceof HTMLElement) {
    return offsetParent.getBoundingClientRect();
  }
  return fallback?.getBoundingClientRect() ?? null;
}

/**
 * 获取指定父节点和插槽下的同级组件包装元素。
 */
function getWrapperElements(parentId: string | null, slot: string | null) {
  return Array.from(
    document.querySelectorAll<HTMLElement>(".component-warpper"),
  ).filter((element) => {
    const nextParentId = element.dataset.parentId ?? "root";
    const nextSlot = element.dataset.slot ?? "root";
    return nextParentId === (parentId ?? "root") && nextSlot === (slot ?? "root");
  });
}

/**
 * 根据当前指针位置计算插入到同级列表中的目标序号。
 */
function resolveInsertIndex(
  parentId: string | null,
  slot: string | null,
  movingId: string,
  clientX: number,
  clientY: number,
) {
  const siblings = getWrapperElements(parentId, slot)
    .filter((element) => element.dataset.id !== movingId)
    .sort((left, right) => {
      const leftRect = left.getBoundingClientRect();
      const rightRect = right.getBoundingClientRect();
      if (Math.abs(leftRect.top - rightRect.top) > 8) {
        return leftRect.top - rightRect.top;
      }
      return leftRect.left - rightRect.left;
    });

  for (const [index, element] of siblings.entries()) {
    const rect = element.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const centerX = rect.left + rect.width / 2;
    if (clientY < centerY || (Math.abs(clientY - centerY) < 8 && clientX < centerX)) {
      return index;
    }
  }

  return siblings.length;
}

/**
 * 计算移动结束后的父节点、插槽与坐标目标。
 */
export function resolveMoveTarget({
  movingId,
  clientX,
  clientY,
  canvasElement,
  movingComponent,
  getComponentById,
}: ResolveMoveTargetOptions): CanvasMoveTarget | null {
  const targetElement = document.elementFromPoint(
    clientX,
    clientY,
  ) as HTMLElement | null;
  const slotZone = targetElement?.closest("[data-slot-name]") as HTMLElement | null;
  const current = getComponentById(movingId);
  if (!current) {
    return null;
  }

  if (slotZone?.dataset.containerId) {
    const targetParentId = slotZone.dataset.containerId;
    const targetSlot = slotZone.dataset.slotName ?? "default";
    const targetIndex = resolveInsertIndex(
      targetParentId,
      targetSlot,
      movingId,
      clientX,
      clientY,
    );
    const slotRect = slotZone.getBoundingClientRect();
    return {
      parentId: targetParentId,
      slot: targetSlot,
      index: targetIndex,
      left: movingComponent
        ? clientX - slotRect.left - movingComponent.pointerOffsetX
        : clientX - slotRect.left,
      top: movingComponent
        ? clientY - slotRect.top - movingComponent.pointerOffsetY
        : clientY - slotRect.top,
    };
  }

  const canvasRect = canvasElement?.getBoundingClientRect();
  const targetIndex = resolveInsertIndex(null, null, movingId, clientX, clientY);
  return {
    parentId: null,
    slot: null,
    index: targetIndex,
    left: canvasRect && movingComponent
      ? clientX - canvasRect.left - movingComponent.pointerOffsetX
      : canvasRect
        ? clientX - canvasRect.left
        : 0,
    top: canvasRect && movingComponent
      ? clientY - canvasRect.top - movingComponent.pointerOffsetY
      : canvasRect
        ? clientY - canvasRect.top
        : 0,
  };
}
