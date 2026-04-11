import { ulid } from "ulid";
import type { ComponentNode, ComponentNodeRecord, PageCategory, TComponentTypes } from "@codigo/schema";
import type { PageLayoutPresetKey } from "@/modules/editor/registry/components";

const layoutGapX = 380;
const layoutGapY = 200;
const layoutStartX = 32;
const layoutStartY = 24;

export type LayoutPresetNode = ComponentNode & {
  slot?: string;
  children?: LayoutPresetNode[];
};

/**
 * 计算组件的默认宽度。
 */
export function getDefaultWidthByType(
  type: TComponentTypes,
  isFlow = false,
): string {
  if (isFlow) {
    switch (type) {
      case "statCard":
        return "320px";
      case "breadcrumbBar":
      case "pageHeader":
      case "queryFilter":
      case "cardGrid":
      case "dataTable":
        return "100%";
      default:
        return "100%";
    }
  }

  switch (type) {
    case "twoColumn":
      return "960px";
    case "container":
      return "720px";
    case "table":
    case "card":
    case "list":
    case "image":
    case "video":
    case "swiper":
    case "richText":
      return "420px";
    case "input":
    case "button":
    case "textArea":
    case "radio":
    case "checkbox":
    case "statistic":
      return "360px";
    case "split":
      return "520px";
    default:
      return "320px";
  }
}

/**
 * 计算组件在画布中的默认位置。
 */
export function getDefaultPosition(index: number) {
  return {
    left: `${layoutStartX + (index % 3) * layoutGapX}px`,
    top: `${layoutStartY + Math.floor(index / 3) * layoutGapY}px`,
  };
}

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

/**
 * 创建单页面侧栏切换布局的右侧内容容器。
 */
export function createSidebarPanelNode(
  title: string,
  stateKey: string,
  stateValue: string,
): LayoutPresetNode {
  return createContainerNode(title, {
    minHeight: 320,
    slot: "right",
    backgroundColor: "#ffffff",
    borderColor: "#d9d9d9",
    visibleStateKey: stateKey,
    visibleStateValue: stateValue,
    styles: {
      marginBottom: 16,
    },
  });
}

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

/**
 * 按页面分类生成布局预设骨架。
 */
export function createPageLayoutPreset(
  preset: PageLayoutPresetKey,
  pageCategory: PageCategory,
) {
  if (preset === "sidebarLayout") {
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

  if (preset === "dashboardLayout") {
    const summary = createContainerNode("概览区", {
      minHeight: 180,
      backgroundColor: "#f8fafc",
      borderColor: "#bfdbfe",
      styles: { marginBottom: 16 },
    });
    const workspace = createTwoColumnNode("工作台主体", {
      leftWidth: 320,
      minHeight: 420,
      backgroundColor: "#ffffff",
      styles: { marginBottom: 16 },
      children: [
        createContainerNode("左侧导航/筛选", {
          minHeight: 340,
          slot: "left",
          backgroundColor: "#ffffff",
          borderColor: "#d9d9d9",
        }),
        createContainerNode("右侧主内容", {
          minHeight: 340,
          slot: "right",
          backgroundColor: "#ffffff",
          borderColor: "#d9d9d9",
        }),
      ],
    });
    const footer = createContainerNode("底部补充区", {
      minHeight: 160,
      backgroundColor: "#f8fafc",
      borderColor: "#bfdbfe",
    });

    return {
      nodes: [summary, workspace, footer],
      focusId: workspace.id,
    };
  }

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

/**
 * 根据布局模式归一化组件定位信息。
 */
export function normalizeLayout(
  compConfigs: Record<string, ComponentNodeRecord>,
  ids: string[],
  layoutMode: "absolute" | "flow",
) {
  const isFlow = layoutMode === "flow";
  ids.forEach((id, index) => {
    const comp = compConfigs[id];
    if (!comp) return;
    const nextStyles = { ...(comp.styles ?? {}) };
    const hasPosition =
      nextStyles.left !== undefined && nextStyles.top !== undefined;
    const fallbackPosition = getDefaultPosition(index);

    if (isFlow) {
      nextStyles.position = "relative";
      delete nextStyles.left;
      delete nextStyles.top;
      nextStyles.width = nextStyles.width ?? getDefaultWidthByType(comp.type, true);
    } else {
      nextStyles.position = "absolute";
      nextStyles.left = hasPosition ? nextStyles.left : fallbackPosition.left;
      nextStyles.top = hasPosition ? nextStyles.top : fallbackPosition.top;
      nextStyles.width =
        nextStyles.width === "100%" && !hasPosition
          ? getDefaultWidthByType(comp.type)
          : (nextStyles.width ?? getDefaultWidthByType(comp.type));
    }

    comp.styles = nextStyles;
    normalizeLayout(compConfigs, comp.childIds, layoutMode);
  });
}

/**
 * 收集指定节点及其所有子孙节点 ID。
 */
export function gatherSubtreeIds(
  compConfigs: Record<string, ComponentNodeRecord>,
  id: string,
): string[] {
  const current = compConfigs[id];
  if (!current) return [];
  return [
    id,
    ...current.childIds.flatMap((childId) =>
      gatherSubtreeIds(compConfigs, childId),
    ),
  ];
}
