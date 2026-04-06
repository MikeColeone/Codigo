import type { ComponentNodeRecord, TComponentTypes } from "@codigo/schema";
import type { DragEvent, RefObject } from "react";
import { useCallback } from "react";
import { resolveCanvasDropResult } from "../utils/canvasDrop";

interface UseCanvasDropOptions {
  canEditStructure: boolean;
  canvasRef: RefObject<HTMLDivElement | null>;
  currentComponentId: string | null;
  getComponentById: (id: string) => ComponentNodeRecord | undefined | null;
  getAvailableSlots: (type: TComponentTypes) => Array<{ name: string }>;
  push: (
    type: TComponentTypes,
    position: { left: number; top: number },
    target?: { parentId: string; slot: string },
  ) => void;
}

/**
 * 管理画布内外部物料拖入的 drop 事件。
 */
export function useCanvasDrop({
  canEditStructure,
  canvasRef,
  currentComponentId,
  getComponentById,
  getAvailableSlots,
  push,
}: UseCanvasDropOptions) {
  /**
   * 允许浏览器持续派发 drop 事件。
   */
  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  /**
   * 根据当前落点将物料插入画布或容器插槽。
   */
  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!canEditStructure) {
        return;
      }

      const result = resolveCanvasDropResult({
        clientX: event.clientX,
        clientY: event.clientY,
        rawType: event.dataTransfer.getData("componentType"),
        canvasElement: canvasRef.current,
        currentComponentId,
        getComponentById,
        getAvailableSlots,
      });

      if (!result) {
        return;
      }

      push(result.type, result.position, result.containerTarget);
    },
    [
      canEditStructure,
      canvasRef,
      currentComponentId,
      getAvailableSlots,
      getComponentById,
      push,
    ],
  );

  return {
    handleDragOver,
    handleDrop,
  };
}
