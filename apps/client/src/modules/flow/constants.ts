import type { NodeType } from "./types";

export interface NodeTypeMeta {
  label: string;
  w: number;
  h: number;
  shape: "pill" | "rect";
}

export interface NodeColorMeta {
  bg: string;
  border: string;
  text: string;
}

export const NODE_TYPES: Record<NodeType, NodeTypeMeta> = {
  start: { label: "开始", w: 112, h: 48, shape: "pill" },
  process: { label: "动作", w: 320, h: 132, shape: "rect" },
  condition: { label: "条件判断", w: 320, h: 132, shape: "rect" },
  notify: { label: "消息提醒", w: 320, h: 188, shape: "rect" },
};

export const NODE_COLORS: Record<NodeType, NodeColorMeta> = {
  start: { bg: "#f0fdf4", border: "#86efac", text: "#15803d" },
  process: { bg: "#eff6ff", border: "#93c5fd", text: "#1d4ed8" },
  condition: { bg: "#faf5ff", border: "#d8b4fe", text: "#7c3aed" },
  notify: { bg: "#ecfeff", border: "#67e8f9", text: "#0e7490" },
};
