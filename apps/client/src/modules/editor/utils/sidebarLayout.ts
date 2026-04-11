import type { ComponentNodeRecord } from "@codigo/schema";
import type { TEditorComponentsStore } from "@/modules/editor/stores";

export interface SidebarLayoutParts {
  buttons: ComponentNodeRecord[];
  layout: ComponentNodeRecord;
  leftContainer: ComponentNodeRecord | null;
  rightNodes: ComponentNodeRecord[];
  stateKey: string;
}

export interface SidebarSectionItem {
  button: ComponentNodeRecord;
  label: string;
  order: number;
  panel: ComponentNodeRecord | null;
  stateValue: string;
}

/**
 * 读取节点指定属性对应的字符串值。
 */
export function getStringProp(
  node: ComponentNodeRecord | undefined,
  key: string,
) {
  const value = (node?.props ?? {})[key];
  return typeof value === "string" ? value : "";
}

/**
 * 获取指定父节点下的直属子节点，并可按 slot 过滤。
 */
export function getChildNodes(
  storeComponents: TEditorComponentsStore,
  parentId: string,
  slot?: string,
) {
  const parent = storeComponents.compConfigs[parentId];
  if (!parent) {
    return [];
  }

  return parent.childIds
    .map((childId) => storeComponents.compConfigs[childId])
    .filter((item): item is ComponentNodeRecord => Boolean(item))
    .filter((item) => {
      if (!slot) {
        return true;
      }

      return (item.slot ?? "default") === slot;
    });
}

/**
 * 生成当前侧栏布局内可用的下一个内容状态值。
 */
export function getNextPanelStateValue(
  panels: ComponentNodeRecord[],
  buttons: ComponentNodeRecord[],
) {
  const existedValues = new Set(
    [...buttons, ...panels]
      .map((item) => {
        return (
          getStringProp(item, "stateValue") || getStringProp(item, "visibleStateValue")
        );
      })
      .filter(Boolean),
  );

  let nextIndex = existedValues.size + 1;
  let nextValue = `panel-${nextIndex}`;

  while (existedValues.has(nextValue)) {
    nextIndex += 1;
    nextValue = `panel-${nextIndex}`;
  }

  return nextValue;
}

/**
 * 解析双栏布局中用于单页面侧栏切换的关键节点。
 */
export function resolveSidebarLayoutParts(
  storeComponents: TEditorComponentsStore,
  layoutId: string,
) {
  const layout = storeComponents.compConfigs[layoutId];
  if (!layout || layout.type !== "twoColumn") {
    return null;
  }

  const leftNodes = getChildNodes(storeComponents, layoutId, "left");
  const rightNodes = getChildNodes(storeComponents, layoutId, "right");
  const leftContainer = leftNodes.find((item) => item.type === "container") ?? null;
  const buttons = leftContainer
    ? getChildNodes(storeComponents, leftContainer.id, "default").filter((item) => {
        return item.type === "button";
      })
    : [];

  const stateKey =
    getStringProp(buttons[0], "stateKey") ||
    getStringProp(rightNodes[0], "visibleStateKey") ||
    "activeSidebarPanel";

  return {
    buttons,
    layout,
    leftContainer,
    rightNodes,
    stateKey,
  } satisfies SidebarLayoutParts;
}

/**
 * 按左侧按钮顺序汇总侧栏布局的导航项与内容区映射。
 */
export function resolveSidebarSections(
  storeComponents: TEditorComponentsStore,
  layoutId: string,
) {
  const parts = resolveSidebarLayoutParts(storeComponents, layoutId);
  if (!parts) {
    return [];
  }

  const panelMap = new Map(
    parts.rightNodes.map((item) => [getStringProp(item, "visibleStateValue"), item]),
  );

  return parts.buttons.map((button, index) => {
    const stateValue = getStringProp(button, "stateValue") || `panel-${index + 1}`;

    return {
      button,
      label: getStringProp(button, "text") || `导航${index + 1}`,
      order: index,
      panel: panelMap.get(stateValue) ?? null,
      stateValue,
    } satisfies SidebarSectionItem;
  });
}
