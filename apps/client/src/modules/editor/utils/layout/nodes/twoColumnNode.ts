import { ulid } from "ulid";
import type { ComponentNode } from "@codigo/schema";
import type { LayoutPresetNode } from "../types";

/**
 * 创建双栏布局节点。
 */
export function createTwoColumnNode(
  title: string,
  options?: {
    leftWidth?: number;
    gap?: number;
    minHeight?: number;
    backgroundColor?: string;
    styles?: ComponentNode["styles"];
    children?: LayoutPresetNode[];
  },
): LayoutPresetNode {
  return {
    id: ulid(),
    type: "twoColumn",
    props: {
      title,
      leftWidth: options?.leftWidth ?? 280,
      gap: options?.gap ?? 20,
      minHeight: options?.minHeight ?? 360,
      backgroundColor: options?.backgroundColor ?? "#ffffff",
    },
    styles: {
      width: "100%",
      ...(options?.styles ?? {}),
    },
    children: options?.children ?? [],
  };
}

