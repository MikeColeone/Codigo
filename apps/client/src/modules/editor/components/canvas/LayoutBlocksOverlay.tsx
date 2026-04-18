import { observer } from "mobx-react-lite";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LayoutBlock } from "@codigo/schema";
import { createRootLayoutBlock, findLayoutBlockAt } from "@/modules/editor/utils/layoutBlocks";
import { useLayoutManagerUI } from "@/modules/editor/hooks";

type Interval = { start: number; end: number };
type VSeg = { x: number; y1: number; y2: number };
type HSeg = { y: number; x1: number; x2: number };

function mergeIntervals(list: Interval[]) {
  const sorted = list
    .map((item) => ({
      start: Math.min(item.start, item.end),
      end: Math.max(item.start, item.end),
    }))
    .filter((item) => item.end - item.start > 0.5)
    .sort((a, b) => (a.start !== b.start ? a.start - b.start : a.end - b.end));

  const merged: Interval[] = [];
  for (const it of sorted) {
    const last = merged[merged.length - 1];
    if (!last || it.start > last.end + 0.5) {
      merged.push({ ...it });
      continue;
    }
    last.end = Math.max(last.end, it.end);
  }
  return merged;
}

function intersectIntervals(a: Interval[], b: Interval[]) {
  const left = mergeIntervals(a);
  const right = mergeIntervals(b);
  const out: Interval[] = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    const A = left[i]!;
    const B = right[j]!;
    const start = Math.max(A.start, B.start);
    const end = Math.min(A.end, B.end);
    if (end - start > 0.5) out.push({ start, end });
    if (A.end < B.end) i += 1;
    else j += 1;
  }
  return out;
}

function computeInternalSegments(blocks: LayoutBlock[]) {
  const xMap = new Map<number, { left: Interval[]; right: Interval[] }>();
  const yMap = new Map<number, { top: Interval[]; bottom: Interval[] }>();

  function ensureX(x: number) {
    const key = Math.round(x);
    const existing = xMap.get(key);
    if (existing) return existing;
    const created = { left: [] as Interval[], right: [] as Interval[] };
    xMap.set(key, created);
    return created;
  }

  function ensureY(y: number) {
    const key = Math.round(y);
    const existing = yMap.get(key);
    if (existing) return existing;
    const created = { top: [] as Interval[], bottom: [] as Interval[] };
    yMap.set(key, created);
    return created;
  }

  for (const b of blocks) {
    ensureX(b.x).left.push({ start: b.y, end: b.y + b.height });
    ensureX(b.x + b.width).right.push({ start: b.y, end: b.y + b.height });
    ensureY(b.y).top.push({ start: b.x, end: b.x + b.width });
    ensureY(b.y + b.height).bottom.push({ start: b.x, end: b.x + b.width });
  }

  const v: VSeg[] = [];
  for (const [x, entry] of xMap.entries()) {
    const overlaps = intersectIntervals(entry.left, entry.right);
    for (const seg of overlaps) {
      v.push({ x, y1: seg.start, y2: seg.end });
    }
  }

  const h: HSeg[] = [];
  for (const [y, entry] of yMap.entries()) {
    const overlaps = intersectIntervals(entry.top, entry.bottom);
    for (const seg of overlaps) {
      h.push({ y, x1: seg.start, x2: seg.end });
    }
  }

  return { v, h };
}

function alignToDevicePixel(value: number) {
  return Math.round(value) + 0.5;
}

export const LayoutBlocksOverlay = observer(function LayoutBlocksOverlay({
  containerRef,
  canvasWidth,
  canvasHeight,
  layoutBlocks,
  onCommitSplit,
  onSelectBlock,
}: {
  containerRef: RefObject<HTMLElement | null>;
  canvasWidth: number;
  canvasHeight: number;
  layoutBlocks: LayoutBlock[] | undefined;
  onCommitSplit: (args: {
    blockId: string;
    orientation: "vertical" | "horizontal";
    position: number;
  }) => void;
  onSelectBlock: (blockId: string | null) => void;
}) {
  const ui = useLayoutManagerUI();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{
    blockId: string;
    orientation: "vertical" | "horizontal";
    position: number;
  } | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<{ x: number; y: number } | null>(null);

  const blocks = useMemo(() => {
    return layoutBlocks?.length
      ? layoutBlocks
      : [createRootLayoutBlock(canvasWidth, canvasHeight)];
  }, [canvasHeight, canvasWidth, layoutBlocks]);

  const segments = useMemo(() => {
    if (!layoutBlocks?.length) return { v: [] as VSeg[], h: [] as HSeg[] };
    return computeInternalSegments(layoutBlocks);
  }, [layoutBlocks]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const next = entry.contentRect;
      setSize({ width: next.width, height: next.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  useEffect(() => {
    if (!ui.isActive) {
      setHoverId(null);
      setDragging(null);
    }
  }, [ui.isActive]);

  function resolveLocalPoint(event: PointerEvent) {
    const el = containerRef.current;
    const rect = el?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function scheduleHover(x: number, y: number) {
    pendingRef.current = { x, y };
    if (rafRef.current != null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      const pending = pendingRef.current;
      if (!pending) return;
      const hit = findLayoutBlockAt(blocks, pending.x, pending.y);
      setHoverId(hit?.id ?? null);
      if (dragging) {
        setDragging((prev) => (prev ? { ...prev, position: prev.orientation === "vertical" ? pending.x : pending.y } : prev));
      }
    });
  }

  function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    if (!ui.isActive) return;
    const pt = resolveLocalPoint(event.nativeEvent);
    if (!pt) return;
    scheduleHover(pt.x, pt.y);
  }

  function handlePointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    if (!ui.isActive) return;
    const pt = resolveLocalPoint(event.nativeEvent);
    if (!pt) return;
    const hit = findLayoutBlockAt(blocks, pt.x, pt.y);
    const hitId = hit?.id ?? null;
    if (ui.mode === "idle") {
      ui.setSelectedBlockId(hitId);
      onSelectBlock(hitId);
      return;
    }
    if (!hitId) return;
    const orientation = ui.mode === "split-vertical" ? "vertical" : "horizontal";
    ui.setSelectedBlockId(hitId);
    onSelectBlock(hitId);
    setDragging({
      blockId: hitId,
      orientation,
      position: orientation === "vertical" ? pt.x : pt.y,
    });
    (event.currentTarget as Element).setPointerCapture(event.pointerId);
  }

  function handlePointerUp(event: ReactPointerEvent<SVGSVGElement>) {
    if (!ui.isActive) return;
    if (!dragging) return;
    const pt = resolveLocalPoint(event.nativeEvent);
    if (!pt) {
      setDragging(null);
      return;
    }
    const pos = dragging.orientation === "vertical" ? pt.x : pt.y;
    onCommitSplit({
      blockId: dragging.blockId,
      orientation: dragging.orientation,
      position: pos,
    });
    setDragging(null);
  }

  if (!layoutBlocks?.length && !ui.isActive) return null;
  if (size.width <= 1 || size.height <= 1) return null;

  const activeBlock = ui.selectedBlockId
    ? blocks.find((b) => b.id === ui.selectedBlockId) ?? null
    : null;
  const hoverBlock = hoverId ? blocks.find((b) => b.id === hoverId) ?? null : null;

  const preview = (() => {
    if (!dragging) return null;
    const b = blocks.find((it) => it.id === dragging.blockId);
    if (!b) return null;
    if (dragging.orientation === "vertical") {
      const x = Math.max(b.x + 1, Math.min(b.x + b.width - 1, dragging.position));
      return { orientation: "vertical" as const, x, y1: b.y, y2: b.y + b.height };
    }
    const y = Math.max(b.y + 1, Math.min(b.y + b.height - 1, dragging.position));
    return { orientation: "horizontal" as const, y, x1: b.x, x2: b.x + b.width };
  })();

  return (
    <svg
      className={ui.isActive ? "absolute inset-0 z-20" : "pointer-events-none absolute inset-0 z-10"}
      width="100%"
      height="100%"
      viewBox={`0 0 ${Math.max(1, canvasWidth)} ${Math.max(1, canvasHeight)}`}
      preserveAspectRatio="none"
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{ touchAction: "none" }}
    >
      <g shapeRendering="crispEdges">
        {segments.v.map((seg) => (
          <line
            key={`v-${seg.x}-${seg.y1}-${seg.y2}`}
            x1={alignToDevicePixel(seg.x)}
            x2={alignToDevicePixel(seg.x)}
            y1={seg.y1}
            y2={seg.y2}
            stroke="var(--ide-accent)"
            strokeOpacity={0.6}
            strokeWidth={2}
            strokeDasharray="4 2"
          />
        ))}
        {segments.h.map((seg) => (
          <line
            key={`h-${seg.y}-${seg.x1}-${seg.x2}`}
            x1={seg.x1}
            x2={seg.x2}
            y1={alignToDevicePixel(seg.y)}
            y2={alignToDevicePixel(seg.y)}
            stroke="var(--ide-accent)"
            strokeOpacity={0.6}
            strokeWidth={2}
            strokeDasharray="4 2"
          />
        ))}

        {hoverBlock && ui.isActive && (
          <rect
            x={hoverBlock.x + 0.5}
            y={hoverBlock.y + 0.5}
            width={Math.max(0, hoverBlock.width - 1)}
            height={Math.max(0, hoverBlock.height - 1)}
            fill="none"
            stroke="var(--ide-accent)"
            strokeOpacity={0.22}
            strokeWidth={1}
          />
        )}
        {activeBlock && ui.isActive && (
          <rect
            x={activeBlock.x + 0.5}
            y={activeBlock.y + 0.5}
            width={Math.max(0, activeBlock.width - 1)}
            height={Math.max(0, activeBlock.height - 1)}
            fill="none"
            stroke="var(--ide-accent)"
            strokeOpacity={0.45}
            strokeWidth={1.5}
          />
        )}
        {preview && preview.orientation === "vertical" && (
          <line
            x1={alignToDevicePixel(preview.x)}
            x2={alignToDevicePixel(preview.x)}
            y1={preview.y1}
            y2={preview.y2}
            stroke="var(--ide-accent)"
            strokeOpacity={0.9}
            strokeWidth={2}
            strokeDasharray="4 2"
          />
        )}
        {preview && preview.orientation === "horizontal" && (
          <line
            x1={preview.x1}
            x2={preview.x2}
            y1={alignToDevicePixel(preview.y)}
            y2={alignToDevicePixel(preview.y)}
            stroke="var(--ide-accent)"
            strokeOpacity={0.9}
            strokeWidth={2}
            strokeDasharray="4 2"
          />
        )}
      </g>
    </svg>
  );
});
