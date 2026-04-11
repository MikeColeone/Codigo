import type { PageCategory } from "@codigo/schema";
import {
  createContainerNode,
  createSidebarPanelNode,
  createStateButtonNode,
  createTwoColumnNode,
} from "../nodes";

/**
 * 构建侧栏切换布局预设。
 */
export function createSidebarLayoutPreset(pageCategory: PageCategory) {
  const stateKey = "activeSidebarPanel";
  const header = createContainerNode(
    pageCategory === "admin" ? "页面头部" : "页面横幅",
    {
      minHeight: pageCategory === "admin" ? 160 : 200,
      backgroundColor: "#f8fafc",
      borderColor: "#cbd5e1",
      styles: { marginBottom: 16 },
    },
  );
  const main = createTwoColumnNode(
    pageCategory === "admin" ? "主工作区" : "分栏主体",
    {
      leftWidth: pageCategory === "admin" ? 280 : 300,
      minHeight: 420,
      styles: { marginBottom: 16 },
      children: [
        createContainerNode("左侧导航", {
          minHeight: 360,
          slot: "left",
          backgroundColor: "#f8fafc",
          borderColor: "#cbd5e1",
          padding: 16,
          children: [
            createStateButtonNode("概览", stateKey, "overview", {
              slot: "default",
            }),
            createStateButtonNode("详细内容", stateKey, "details", {
              slot: "default",
            }),
            createStateButtonNode("补充信息", stateKey, "extra", {
              slot: "default",
            }),
          ],
        }),
        createSidebarPanelNode("概览内容区", stateKey, "overview"),
        createSidebarPanelNode("详细内容区", stateKey, "details"),
        createSidebarPanelNode("补充信息区", stateKey, "extra"),
      ],
    },
  );
  const footer = createContainerNode(
    pageCategory === "admin" ? "补充操作区" : "页面页脚",
    {
      minHeight: 140,
      backgroundColor: "#f8fafc",
      borderColor: "#cbd5e1",
    },
  );

  return {
    nodes: [header, main, footer],
    focusId: main.id,
  };
}

