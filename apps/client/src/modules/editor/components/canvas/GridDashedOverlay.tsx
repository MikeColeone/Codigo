import { useEffect, useMemo, useState } from "react";
import type { RefObject } from "react";

type GridDashedOverlayProps = {
  containerRef: RefObject<HTMLElement | null>;
  cols: number;
  rows: number;
  gap: number;
};

type CanvasSize = {
  width: number;
  height: number;
};

function alignToDevicePixel(value: number) {
  return Math.round(value) + 0.5;
}

/**
 * Grid 布局下的画布虚线覆盖层（仅编辑器展示）。
 */
export function GridDashedOverlay({
  containerRef,
  cols,
  rows,
  gap,
}: GridDashedOverlayProps) {
  const [size, setSize] = useState<CanvasSize>({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function update(next: CanvasSize) {
      setSize((prev) => {
        if (
          Math.abs(prev.width - next.width) < 0.5 &&
          Math.abs(prev.height - next.height) < 0.5
        ) {
          return prev;
        }
        return next;
      });
    }

    const rect = el.getBoundingClientRect();
    update({ width: rect.width, height: rect.height });

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const next = entry.contentRect;
      update({ width: next.width, height: next.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  const normalized = useMemo(() => {
    const safeCols = Math.max(1, Number(cols) || 1);
    const safeRows = Math.max(1, Number(rows) || 1);
    const safeGap = Math.max(0, Number(gap) || 0);
    return { cols: safeCols, rows: safeRows, gap: safeGap };
  }, [cols, gap, rows]);

  const lines = useMemo(() => {
    const width = Math.max(0, size.width);
    const height = Math.max(0, size.height);
    const effectiveGapX = (normalized.cols - 1) * normalized.gap;
    const effectiveGapY = (normalized.rows - 1) * normalized.gap;
    const cellWidth =
      normalized.cols > 0 ? Math.max(0, (width - effectiveGapX) / normalized.cols) : 0;
    const cellHeight =
      normalized.rows > 0 ? Math.max(0, (height - effectiveGapY) / normalized.rows) : 0;

    const v: number[] = [];
    const h: number[] = [];

    for (let i = 1; i < normalized.cols; i += 1) {
      const endOfCell = i * cellWidth + (i - 1) * normalized.gap;
      const x = endOfCell + normalized.gap / 2;
      v.push(x);
    }

    for (let i = 1; i < normalized.rows; i += 1) {
      const endOfCell = i * cellHeight + (i - 1) * normalized.gap;
      const y = endOfCell + normalized.gap / 2;
      h.push(y);
    }

    return { v, h, width, height };
  }, [normalized.cols, normalized.gap, normalized.rows, size.height, size.width]);

  if (lines.width <= 1 || lines.height <= 1) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-0"
      width="100%"
      height="100%"
      viewBox={`0 0 ${lines.width} ${lines.height}`}
      preserveAspectRatio="none"
    >
      <g shapeRendering="crispEdges">
        <rect
          x={0.5}
          y={0.5}
          width={Math.max(0, lines.width - 1)}
          height={Math.max(0, lines.height - 1)}
          fill="none"
          stroke="rgba(31, 35, 40, 0.14)"
          strokeWidth={1}
          strokeDasharray="5 4"
        />
        {lines.v.map((x) => (
          <line
            key={`v-${x}`}
            x1={alignToDevicePixel(x)}
            x2={alignToDevicePixel(x)}
            y1={0}
            y2={lines.height}
            stroke="rgba(31, 35, 40, 0.12)"
            strokeWidth={1}
            strokeDasharray="5 4"
          />
        ))}
        {lines.h.map((y) => (
          <line
            key={`h-${y}`}
            x1={0}
            x2={lines.width}
            y1={alignToDevicePixel(y)}
            y2={alignToDevicePixel(y)}
            stroke="rgba(31, 35, 40, 0.12)"
            strokeWidth={1}
            strokeDasharray="5 4"
          />
        ))}
      </g>
    </svg>
  );
}
