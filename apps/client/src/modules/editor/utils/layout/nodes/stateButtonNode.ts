import { ulid } from "ulid";
import type { LayoutPresetNode } from "../types";

/**
 * 创建用于切换单页面内容区域的导航按钮节点。
 */
export function createStateButtonNode(
  text: string,
  stateKey: string,
  stateValue: string,
  options?: {
    slot?: string;
  },
): LayoutPresetNode {
  return {
    id: ulid(),
    type: "button",
    props: {
      text,
      type: stateValue === "overview" ? "primary" : "default",
      size: "large",
      danger: false,
      active: false,
      block: true,
      actionType: "set-state",
      link: "",
      targetId: "",
      stateKey,
      stateValue,
    },
    styles: {
      width: "100%",
      marginBottom: 12,
    },
    slot: options?.slot,
  };
}

