export const LEFT_PANEL_RAIL_WIDTH = 48;
export const LEFT_PANEL_WIDTH = LEFT_PANEL_RAIL_WIDTH + 340;
export const RIGHT_PANEL_WIDTH = 460;
export const CENTER_MIN_WIDTH = 420;
export const LEFT_PANEL_COLLAPSED_KEY = "codigo:editor:left-panel-collapsed:v1";
export const RIGHT_PANEL_COLLAPSED_KEY =
  "codigo:editor:right-panel-collapsed:v1";

export function readStoredBoolean(key: string, fallback: boolean) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const stored = window.localStorage.getItem(key);
  if (stored === "true") return true;
  if (stored === "false") return false;
  return fallback;
}

export function resolveFixedPanelWidths(viewportWidth: number) {
  const availablePanelWidth = Math.max(0, viewportWidth - CENTER_MIN_WIDTH);
  const preferredTotalWidth = LEFT_PANEL_WIDTH + RIGHT_PANEL_WIDTH;

  if (availablePanelWidth >= preferredTotalWidth) {
    return {
      leftWidth: LEFT_PANEL_WIDTH,
      rightWidth: RIGHT_PANEL_WIDTH,
    };
  }

  const leftRatio = LEFT_PANEL_WIDTH / preferredTotalWidth;
  const leftWidth = Math.max(
    LEFT_PANEL_RAIL_WIDTH,
    Math.round(availablePanelWidth * leftRatio),
  );
  return {
    leftWidth,
    rightWidth: Math.max(0, availablePanelWidth - leftWidth),
  };
}
