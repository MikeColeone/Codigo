import type { ComponentNodeRecord } from "@codigo/schema";
import type { MouseEvent as ReactMouseEvent, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getPositioningRect,
  resolveMoveTarget,
  type MovingComponentState,
} from "../utils/canvasMove";

interface UseCanvasDragMoveOptions {
  canEditStructure: boolean;
  canvasRef: RefObject<HTMLDivElement | null>;
  getComponentById: (id: string) => ComponentNodeRecord | undefined | null;
  moveExistingNode: (payload: {
    nodeId: string;
    targetParentId: string | null;
    targetSlot: string | null;
    targetIndex: number;
  }) => void;
  setCurrentComponent: (id: string) => void;
  updateComponentPosition: (
    id: string,
    left: number,
    top: number,
    isPreview?: boolean,
  ) => void;
  onDragFinished: () => void;
}

/**
 * 管理画布内组件拖拽移动的状态与事件。
 */
export function useCanvasDragMove({
  canEditStructure,
  canvasRef,
  getComponentById,
  moveExistingNode,
  setCurrentComponent,
  updateComponentPosition,
  onDragFinished,
}: UseCanvasDragMoveOptions) {
  const [movingComponent, setMovingComponent] =
    useState<MovingComponentState | null>(null);
  const dragFrameRef = useRef<number | null>(null);
  const pendingDragPositionRef = useRef<{ left: number; top: number } | null>(
    null,
  );

  /**
   * 启动组件拖拽。
   */
  const handleDragComponentStart = useCallback(
    (event: ReactMouseEvent, id: string) => {
      if (!canEditStructure || event.button !== 0) {
        return;
      }

      const component = getComponentById(id);
      if (!component) {
        return;
      }

      const element = event.currentTarget as HTMLDivElement;
      const rect = element.getBoundingClientRect();
      const positioningRect = getPositioningRect(element, canvasRef.current);

      setCurrentComponent(id);
      setMovingComponent({
        id,
        startX: event.clientX,
        startY: event.clientY,
        origLeft: positioningRect ? rect.left - positioningRect.left : 0,
        origTop: positioningRect ? rect.top - positioningRect.top : 0,
        pointerOffsetX: event.clientX - rect.left,
        pointerOffsetY: event.clientY - rect.top,
      });
      event.preventDefault();
      event.stopPropagation();
    },
    [canEditStructure, canvasRef, getComponentById, setCurrentComponent],
  );

  useEffect(() => {
    if (!movingComponent || !canEditStructure) {
      return;
    }

    /**
     * 持续同步拖拽中的组件坐标预览。
     */
    const onMouseMove = (event: MouseEvent) => {
      const left =
        movingComponent.origLeft + event.clientX - movingComponent.startX;
      const top =
        movingComponent.origTop + event.clientY - movingComponent.startY;
      pendingDragPositionRef.current = { left, top };
      if (dragFrameRef.current !== null) {
        return;
      }

      dragFrameRef.current = window.requestAnimationFrame(() => {
        dragFrameRef.current = null;
        const pendingPosition = pendingDragPositionRef.current;
        if (!pendingPosition) {
          return;
        }

        updateComponentPosition(
          movingComponent.id,
          pendingPosition.left,
          pendingPosition.top,
          true,
        );
      });
    };

    /**
     * 结束拖拽并提交最终位置与容器归属。
     */
    const onMouseUp = (event: MouseEvent) => {
      if (dragFrameRef.current !== null) {
        window.cancelAnimationFrame(dragFrameRef.current);
        dragFrameRef.current = null;
      }
      pendingDragPositionRef.current = null;

      const target = resolveMoveTarget({
        movingId: movingComponent.id,
        clientX: event.clientX,
        clientY: event.clientY,
        canvasElement: canvasRef.current,
        movingComponent,
        getComponentById,
      });

      if (target) {
        moveExistingNode({
          nodeId: movingComponent.id,
          targetParentId: target.parentId,
          targetSlot: target.slot,
          targetIndex: target.index,
        });
        updateComponentPosition(
          movingComponent.id,
          target.left,
          target.top,
          false,
        );
      } else {
        const left =
          movingComponent.origLeft + event.clientX - movingComponent.startX;
        const top =
          movingComponent.origTop + event.clientY - movingComponent.startY;
        updateComponentPosition(movingComponent.id, left, top, false);
      }

      setMovingComponent(null);
      onDragFinished();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      if (dragFrameRef.current !== null) {
        window.cancelAnimationFrame(dragFrameRef.current);
        dragFrameRef.current = null;
      }
      pendingDragPositionRef.current = null;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [
    canEditStructure,
    canvasRef,
    getComponentById,
    moveExistingNode,
    movingComponent,
    onDragFinished,
    updateComponentPosition,
  ]);

  return {
    isDragging: Boolean(movingComponent),
    movingComponentId: movingComponent?.id ?? null,
    handleDragComponentStart,
  };
}
