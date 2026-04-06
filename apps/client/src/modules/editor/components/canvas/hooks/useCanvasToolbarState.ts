import { useCallback, useEffect, useRef, useState } from "react";

interface UseCanvasToolbarStateOptions {
  hidden: boolean;
  selectedComponentId: string | null;
}

export function useCanvasToolbarState({
  hidden,
  selectedComponentId,
}: UseCanvasToolbarStateOptions) {
  const [currentComponentRect, setCurrentComponentRect] =
    useState<ClientRect>();
  const [isFirstRender, setIsFirstRender] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [localHidden, setLocalHidden] = useState(false);
  const firstResizeTimerRef = useRef<number | null>(null);

  const getCurrentWrapperElement = useCallback(() => {
    return Array.from(
      document.querySelectorAll<HTMLDivElement>(".component-warpper"),
    ).find((element) => element.dataset.id === selectedComponentId);
  }, [selectedComponentId]);

  const resizeToolbar = useCallback(() => {
    const currentComponent = getCurrentWrapperElement();
    if (!currentComponent) {
      return;
    }

    setCurrentComponentRect({
      top: currentComponent.offsetTop,
      left: currentComponent.offsetLeft,
      right: currentComponent.offsetLeft + currentComponent.offsetWidth,
      bottom: currentComponent.offsetTop + currentComponent.offsetHeight,
      width: currentComponent.offsetWidth,
      height: currentComponent.offsetHeight,
    } as ClientRect);
  }, [getCurrentWrapperElement]);

  useEffect(() => {
    const canvasContainer = document.querySelector(".editor-stage-scroll");
    const currentComponent = getCurrentWrapperElement();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== currentComponent) {
            return;
          }

          setLocalHidden(!entry.isIntersecting);
        });
      },
      {
        threshold: 0.9,
        root: canvasContainer,
      },
    );

    if (currentComponent && canvasContainer) {
      observer.observe(currentComponent);
    }

    return () => {
      observer.disconnect();
    };
  }, [getCurrentWrapperElement, hidden]);

  useEffect(() => {
    if (!isFirstRender) {
      setIsFirstRender(true);
      firstResizeTimerRef.current = window.setTimeout(() => {
        resizeToolbar();
      }, 500);
      return () => {
        if (firstResizeTimerRef.current !== null) {
          window.clearTimeout(firstResizeTimerRef.current);
          firstResizeTimerRef.current = null;
        }
      };
    }

    if (refresh) {
      setRefresh(false);
      return;
    }

    resizeToolbar();
  }, [hidden, isFirstRender, localHidden, refresh, resizeToolbar]);

  return {
    currentComponentRect,
    localHidden,
    setRefresh,
  };
}
