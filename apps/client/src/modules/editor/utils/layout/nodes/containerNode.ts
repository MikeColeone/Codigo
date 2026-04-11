import { ulid } from "ulid";
import type { ComponentNode } from "@codigo/schema";
import type { LayoutPresetNode } from "../types";

/**
 * 创建容器布局节点。
 */
export function createContainerNode(
  title: string,
  options?: {
    minHeight?: number;
    backgroundColor?: string;
    borderColor?: string;
    padding?: number;
    borderRadius?: number;
    styles?: ComponentNode["styles"];
    children?: LayoutPresetNode[];
    slot?: string;
    visibleStateKey?: string;
    visibleStateValue?: string;
  },
): LayoutPresetNode {
  return {
    id: ulid(),
    type: "container",
    props: {
      title,
      minHeight: options?.minHeight ?? 240,
      backgroundColor: options?.backgroundColor ?? "#ffffff",
      borderColor: options?.borderColor ?? "#d9d9d9",
      padding: options?.padding ?? 24,
      borderRadius: options?.borderRadius ?? 16,
      visibleStateKey: options?.visibleStateKey ?? "",
      visibleStateValue: options?.visibleStateValue ?? "",
    },
    styles: {
      width: "100%",
      ...(options?.styles ?? {}),
    },
    slot: options?.slot,
    children: options?.children ?? [],
  };
}

