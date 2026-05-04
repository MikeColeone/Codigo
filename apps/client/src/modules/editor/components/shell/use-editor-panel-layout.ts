import { useCallback, useEffect, useState } from "react";
import {
  LEFT_PANEL_WIDTH,
  LEFT_PANEL_COLLAPSED_KEY,
  RIGHT_PANEL_COLLAPSED_KEY,
  RIGHT_PANEL_WIDTH,
  readStoredBoolean,
  resolveFixedPanelWidths,
} from "./layout";

export function useEditorPanelLayout() {
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(() =>
    readStoredBoolean(LEFT_PANEL_COLLAPSED_KEY, false),
  );
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(() =>
    readStoredBoolean(RIGHT_PANEL_COLLAPSED_KEY, false),
  );
  const [leftPanelWidth, setLeftPanelWidth] = useState(LEFT_PANEL_WIDTH);
  const [rightPanelWidth, setRightPanelWidth] = useState(RIGHT_PANEL_WIDTH);

  const applyPanelWidths = useCallback(() => {
    const { leftWidth, rightWidth } = resolveFixedPanelWidths(window.innerWidth);
    setLeftPanelWidth(leftWidth);
    setRightPanelWidth(rightWidth);
  }, []);

  const setLeftPanelCollapsed = useCallback((collapsed: boolean) => {
    setIsLeftPanelCollapsed(collapsed);
    window.localStorage.setItem(LEFT_PANEL_COLLAPSED_KEY, String(collapsed));
  }, []);

  const setRightPanelCollapsed = useCallback((collapsed: boolean) => {
    setIsRightPanelCollapsed(collapsed);
    window.localStorage.setItem(RIGHT_PANEL_COLLAPSED_KEY, String(collapsed));
  }, []);

  useEffect(() => {
    applyPanelWidths();
  }, [applyPanelWidths]);

  useEffect(() => {
    window.addEventListener("resize", applyPanelWidths);

    return () => {
      window.removeEventListener("resize", applyPanelWidths);
    };
  }, [applyPanelWidths]);

  return {
    isLeftPanelCollapsed,
    isRightPanelCollapsed,
    setLeftPanelCollapsed,
    setRightPanelCollapsed,
    leftPanelWidth,
    rightPanelWidth,
  };
}
