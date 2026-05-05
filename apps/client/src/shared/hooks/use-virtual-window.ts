import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type UIEvent,
} from "react";

interface UseVirtualWindowOptions {
  itemCount: number;
  itemSize: number;
  overscan?: number;
}

/**
 * 监听滚动容器的尺寸与滚动位置，返回当前虚拟渲染窗口。
 */
export function useVirtualWindow({
  itemCount,
  itemSize,
  overscan = 2,
}: UseVirtualWindowOptions) {
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState({ height: 0, width: 0 });
  const [scrollTop, setScrollTop] = useState(0);

  const containerRef = useCallback((element: HTMLDivElement | null) => {
    setContainerEl(element);
  }, []);

  useEffect(() => {
    if (!containerEl) {
      return;
    }

    const updateViewportSize = () => {
      setViewportSize({
        height: containerEl.clientHeight,
        width: containerEl.clientWidth,
      });
    };

    updateViewportSize();

    const observer = new ResizeObserver(() => {
      updateViewportSize();
    });

    observer.observe(containerEl);
    return () => observer.disconnect();
  }, [containerEl]);

  const onScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return useMemo(() => {
    const safeItemSize = Math.max(1, itemSize);
    const visibleCount = Math.max(
      1,
      Math.ceil(viewportSize.height / safeItemSize),
    );
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / safeItemSize) - overscan,
    );
    const endIndex = Math.min(
      itemCount,
      startIndex + visibleCount + overscan * 2,
    );

    return {
      containerRef,
      endIndex,
      offsetY: startIndex * safeItemSize,
      onScroll,
      startIndex,
      totalHeight: itemCount * safeItemSize,
      viewportHeight: viewportSize.height,
      viewportWidth: viewportSize.width,
    };
  }, [
    containerRef,
    itemCount,
    itemSize,
    onScroll,
    overscan,
    scrollTop,
    viewportSize.height,
    viewportSize.width,
  ]);
}
