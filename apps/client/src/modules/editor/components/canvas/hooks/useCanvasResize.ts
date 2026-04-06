import type { MouseEvent as ReactMouseEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface ResizeComponentState {
  id: string;
  startX: number;
  startY: number;
  origWidth: number;
  origHeight: number;
}

interface UseCanvasResizeOptions {
  canEditStructure: boolean;
  setCurrentComponent: (id: string) => void;
  updateComponentSize: (
    id: string,
    width: number,
    height: number,
    isPreview?: boolean,
  ) => void;
  onResizeFinished: () => void;
}

/**
 * 管理画布内组件缩放的状态与事件。
 */
export function useCanvasResize({
  canEditStructure,
  setCurrentComponent,
  updateComponentSize,
  onResizeFinished,
}: UseCanvasResizeOptions) {
  const [resizingComponent, setResizingComponent] =
    useState<ResizeComponentState | null>(null);
  const resizeFrameRef = useRef<number | null>(null);
  const pendingResizeSizeRef = useRef<{ width: number; height: number } | null>(
    null,
  );

  /**
   * 启动组件缩放。
   */
  const handleResizeComponentStart = useCallback(
    (event: ReactMouseEvent, id: string) => {
      if (!canEditStructure || event.button !== 0) {
        return;
      }

      const wrapperElement = (event.currentTarget as HTMLElement).closest(
        ".component-warpper",
      ) as HTMLDivElement | null;
      if (!wrapperElement) {
        return;
      }

      const rect = wrapperElement.getBoundingClientRect();
      setCurrentComponent(id);
      setResizingComponent({
        id,
        startX: event.clientX,
        startY: event.clientY,
        origWidth: rect.width,
        origHeight: rect.height,
      });
      event.preventDefault();
      event.stopPropagation();
    },
    [canEditStructure, setCurrentComponent],
  );

  useEffect(() => {
    if (!resizingComponent || !canEditStructure) {
      return;
    }

    /**
     * 持续同步缩放中的尺寸预览。
     */
    const onMouseMove = (event: MouseEvent) => {
      const width =
        resizingComponent.origWidth + event.clientX - resizingComponent.startX;
      const height =
        resizingComponent.origHeight + event.clientY - resizingComponent.startY;
      pendingResizeSizeRef.current = { width, height };
      if (resizeFrameRef.current !== null) {
        return;
      }

      resizeFrameRef.current = window.requestAnimationFrame(() => {
        resizeFrameRef.current = null;
        const pendingSize = pendingResizeSizeRef.current;
        if (!pendingSize) {
          return;
        }

        updateComponentSize(
          resizingComponent.id,
          pendingSize.width,
          pendingSize.height,
          true,
        );
      });
    };

    /**
     * 结束缩放并提交最终尺寸。
     */
    const onMouseUp = (event: MouseEvent) => {
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
        resizeFrameRef.current = null;
      }
      pendingResizeSizeRef.current = null;

      const width =
        resizingComponent.origWidth + event.clientX - resizingComponent.startX;
      const height =
        resizingComponent.origHeight + event.clientY - resizingComponent.startY;
      updateComponentSize(resizingComponent.id, width, height, false);

      setResizingComponent(null);
      onResizeFinished();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
        resizeFrameRef.current = null;
      }
      pendingResizeSizeRef.current = null;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [
    canEditStructure,
    onResizeFinished,
    resizingComponent,
    updateComponentSize,
  ]);

  return {
    handleResizeComponentStart,
    resizingComponentId: resizingComponent?.id ?? null,
  };
}
