import type { PageCategory } from "@codigo/schema";
import { createContainerNode } from "../nodes";

/**
 * 构建通用分区堆叠布局预设。
 */
export function createSectionStackLayoutPreset(pageCategory: PageCategory) {
  const header = createContainerNode(
    pageCategory === "admin" ? "页面头部" : "页面头图",
    {
      minHeight: pageCategory === "admin" ? 160 : 200,
      backgroundColor: "#f8fafc",
      borderColor: "#cbd5e1",
      styles: { marginBottom: 16 },
    },
  );
  const main = createContainerNode(
    pageCategory === "admin" ? "主内容区" : "内容区",
    {
      minHeight: 360,
      backgroundColor: "#ffffff",
      borderColor: "#d9d9d9",
      styles: { marginBottom: 16 },
    },
  );
  const footer = createContainerNode("页脚区域", {
    minHeight: 140,
    backgroundColor: "#f8fafc",
    borderColor: "#cbd5e1",
  });

  return {
    nodes: [header, main, footer],
    focusId: main.id,
  };
}

