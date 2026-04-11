import { message } from "antd";
import { action } from "mobx";
import type { ComponentNode } from "@codigo/schema";
import type { TEditorComponentsStore } from "@/modules/editor/stores";
import {
  createContainerNode,
  createSidebarPanelNode,
  createStateButtonNode,
  gatherSubtreeIds,
} from "@/modules/editor/utils/pageLayout";
import {
  getNextPanelStateValue,
  getStringProp,
  resolveSidebarLayoutParts,
  resolveSidebarSections,
} from "@/modules/editor/utils/sidebarLayout";

interface EditorSidebarLayoutActionsContext {
  storeComponents: TEditorComponentsStore;
  ensurePermission: (permission: any, deniedMessage?: string) => boolean;
  addOperationLog: (action: any, detail: string) => void;
  broadcastReplaceAll: () => void;
  setCurrentComponent: (id: string) => void;
  insertNodeTree: (
    node: ComponentNode,
    args?: {
      parentId?: string | null;
      slot?: string | null;
      index?: number;
    },
  ) => void;
  syncSchema: (keepCurrentId?: string | null) => void;
}

/**
 * 按 slot 重建父节点的子节点顺序。
 */
function replaceSlotChildIds(
  storeComponents: TEditorComponentsStore,
  parentId: string,
  slot: string,
  nextSlotIds: string[],
) {
  const parent = storeComponents.compConfigs[parentId];
  if (!parent) {
    return;
  }

  const childIds = parent.childIds;
  const slotSiblingIds = childIds.filter((childId) => {
    const child = storeComponents.compConfigs[childId];
    return child && (child.slot ?? "default") === slot;
  });

  if (!slotSiblingIds.length) {
    parent.childIds = [...childIds, ...nextSlotIds];
    return;
  }

  const firstIndex = childIds.findIndex((item) => item === slotSiblingIds[0]);
  const lastIndex = childIds.findIndex(
    (item) => item === slotSiblingIds[slotSiblingIds.length - 1],
  );
  const before = childIds.slice(0, firstIndex);
  const after = childIds.slice(lastIndex + 1);
  const middle = childIds
    .slice(firstIndex, lastIndex + 1)
    .filter((item) => {
      const child = storeComponents.compConfigs[item];
      return child && (child.slot ?? "default") !== slot;
    });

  parent.childIds = [...before, ...nextSlotIds, ...middle, ...after];
}

/**
 * 从 store 中删除指定节点及其子树。
 */
function removeNodeSubtree(
  storeComponents: TEditorComponentsStore,
  nodeId: string,
) {
  const node = storeComponents.compConfigs[nodeId];
  if (!node) {
    return;
  }

  if (node.parentId) {
    const parent = storeComponents.compConfigs[node.parentId];
    if (parent) {
      parent.childIds = parent.childIds.filter((id) => id !== nodeId);
    }
  } else {
    storeComponents.sortableCompConfig = storeComponents.sortableCompConfig.filter(
      (id) => id !== nodeId,
    );
  }

  const subtreeIds = gatherSubtreeIds(storeComponents.compConfigs, nodeId);
  subtreeIds.forEach((targetId) => {
    delete storeComponents.compConfigs[targetId];
  });
}

/**
 * 创建 editor 侧栏布局专用的导航项与内容区同步能力。
 */
export function createEditorSidebarLayoutActions(
  context: EditorSidebarLayoutActionsContext,
) {
  const {
    addOperationLog,
    broadcastReplaceAll,
    ensurePermission,
    insertNodeTree,
    setCurrentComponent,
    storeComponents,
    syncSchema,
  } = context;

  /**
   * 获取当前侧栏布局下的导航项与内容区映射。
   */
  const getSidebarSections = action((layoutId: string) => {
    return resolveSidebarSections(storeComponents, layoutId);
  });

  /**
   * 为当前双栏布局追加一个新的导航项和对应内容容器。
   */
  const appendSidebarSection = action((layoutId: string, label?: string) => {
    if (!ensurePermission("edit_structure", "当前角色不能新增导航项")) {
      return false;
    }

    const parts = resolveSidebarLayoutParts(storeComponents, layoutId);
    if (!parts) {
      message.warning("请先选中侧栏布局组件");
      return false;
    }

    const sectionLabel = label?.trim() || `导航${parts.buttons.length + 1}`;
    const stateValue = getNextPanelStateValue(parts.rightNodes, parts.buttons);
    const buttonNode = createStateButtonNode(
      sectionLabel,
      parts.stateKey,
      stateValue,
      {
        slot: "default",
      },
    );
    const panelNode = createSidebarPanelNode(
      `${sectionLabel}内容区`,
      parts.stateKey,
      stateValue,
    );

    if (parts.leftContainer) {
      insertNodeTree(buttonNode, {
        parentId: parts.leftContainer.id,
        slot: "default",
      });
    } else {
      const leftContainerNode = createContainerNode("左侧导航", {
        minHeight: 360,
        slot: "left",
        backgroundColor: "#f8fafc",
        borderColor: "#cbd5e1",
        padding: 16,
        children: [buttonNode],
      });
      insertNodeTree(leftContainerNode, {
        parentId: parts.layout.id,
        slot: "left",
      });
    }

    insertNodeTree(panelNode, {
      parentId: parts.layout.id,
      slot: "right",
    });
    setCurrentComponent(panelNode.id);
    broadcastReplaceAll();
    addOperationLog("add_component", `sidebar-section:${sectionLabel}`);
    message.success(`已新增 ${sectionLabel}`);
    return true;
  });

  /**
   * 更新指定导航项名称，并联动右侧内容区标题。
   */
  const updateSidebarSectionLabel = action(
    (layoutId: string, stateValue: string, label: string) => {
      if (!ensurePermission("edit_content", "当前角色不能修改导航项")) {
        return false;
      }

      const parts = resolveSidebarLayoutParts(storeComponents, layoutId);
      if (!parts) {
        message.warning("请先选中侧栏布局组件");
        return false;
      }

      const nextLabel = label.trim();
      if (!nextLabel) {
        message.warning("导航名称不能为空");
        return false;
      }

      const section = resolveSidebarSections(storeComponents, layoutId).find((item) => {
        return item.stateValue === stateValue;
      });
      if (!section) {
        message.warning("未找到对应导航项");
        return false;
      }

      let changed = false;
      if (getStringProp(section.button, "text") !== nextLabel) {
        section.button.props.text = nextLabel;
        changed = true;
      }

      const nextTitle = `${nextLabel}内容区`;
      if (section.panel && getStringProp(section.panel, "title") !== nextTitle) {
        section.panel.props.title = nextTitle;
        changed = true;
      }

      if (!changed) {
        return true;
      }

      syncSchema(parts.layout.id);
      broadcastReplaceAll();
      addOperationLog("update_component", `sidebar-rename:${stateValue}`);
      return true;
    },
  );

  /**
   * 调整指定导航项及内容区的顺序。
   */
  const moveSidebarSection = action(
    (layoutId: string, stateValue: string, direction: "up" | "down") => {
      if (!ensurePermission("edit_structure", "当前角色不能调整导航顺序")) {
        return false;
      }

      const parts = resolveSidebarLayoutParts(storeComponents, layoutId);
      if (!parts?.leftContainer) {
        message.warning("当前布局还没有左侧导航容器");
        return false;
      }

      const sections = resolveSidebarSections(storeComponents, layoutId);
      const currentIndex = sections.findIndex((item) => item.stateValue === stateValue);
      if (currentIndex < 0) {
        message.warning("未找到对应导航项");
        return false;
      }

      const targetIndex =
        direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= sections.length) {
        return false;
      }

      const nextSections = [...sections];
      const [currentSection] = nextSections.splice(currentIndex, 1);
      nextSections.splice(targetIndex, 0, currentSection);

      replaceSlotChildIds(
        storeComponents,
        parts.leftContainer.id,
        "default",
        nextSections.map((item) => item.button.id),
      );

      const panelIds = nextSections
        .map((item) => item.panel?.id)
        .filter((item): item is string => Boolean(item));
      const orphanPanelIds = parts.rightNodes
        .map((item) => item.id)
        .filter((item) => !panelIds.includes(item));
      if (panelIds.length) {
        replaceSlotChildIds(storeComponents, parts.layout.id, "right", [
          ...panelIds,
          ...orphanPanelIds,
        ]);
      }

      syncSchema(parts.layout.id);
      broadcastReplaceAll();
      addOperationLog("move_component", `sidebar-section:${stateValue}:${direction}`);
      return true;
    },
  );

  /**
   * 删除指定导航项及其对应内容区。
   */
  const removeSidebarSection = action((layoutId: string, stateValue: string) => {
    if (!ensurePermission("edit_structure", "当前角色不能删除导航项")) {
      return false;
    }

    const parts = resolveSidebarLayoutParts(storeComponents, layoutId);
    if (!parts) {
      message.warning("请先选中侧栏布局组件");
      return false;
    }

    const section = resolveSidebarSections(storeComponents, layoutId).find((item) => {
      return item.stateValue === stateValue;
    });
    if (!section) {
      message.warning("未找到对应导航项");
      return false;
    }

    removeNodeSubtree(storeComponents, section.button.id);
    if (section.panel) {
      removeNodeSubtree(storeComponents, section.panel.id);
    }

    if (
      storeComponents.currentCompConfig === section.button.id ||
      storeComponents.currentCompConfig === section.panel?.id
    ) {
      setCurrentComponent(parts.layout.id);
    }

    syncSchema(parts.layout.id);
    broadcastReplaceAll();
    addOperationLog("remove_component", `sidebar-section:${stateValue}`);
    message.success(`已删除 ${section.label}`);
    return true;
  });

  /**
   * 根据左侧导航按钮补齐并同步右侧内容容器标题。
   */
  const syncSidebarPanels = action((layoutId: string) => {
    if (!ensurePermission("edit_structure", "当前角色不能同步侧栏内容")) {
      return false;
    }

    const parts = resolveSidebarLayoutParts(storeComponents, layoutId);
    if (!parts) {
      message.warning("请先选中侧栏布局组件");
      return false;
    }

    if (!parts.buttons.length) {
      message.warning("左侧导航区域还没有按钮，暂时无法同步");
      return false;
    }

    const panelMap = new Map(
      parts.rightNodes.map((item) => [getStringProp(item, "visibleStateValue"), item]),
    );
    let createdCount = 0;
    let updatedCount = 0;

    parts.buttons.forEach((button, index) => {
      const nextLabel = getStringProp(button, "text") || `导航${index + 1}`;
      const stateValue = getStringProp(button, "stateValue") || `panel-${index + 1}`;
      const matchedPanel = panelMap.get(stateValue);
      let changed = false;

      if (getStringProp(button, "stateKey") !== parts.stateKey) {
        button.props.stateKey = parts.stateKey;
        changed = true;
      }

      if (!matchedPanel) {
        const panelNode = createSidebarPanelNode(
          `${nextLabel}内容区`,
          parts.stateKey,
          stateValue,
        );
        insertNodeTree(panelNode, {
          parentId: parts.layout.id,
          slot: "right",
        });
        createdCount += 1;
        return;
      }

      const nextTitle = `${nextLabel}内容区`;

      if (getStringProp(matchedPanel, "title") !== nextTitle) {
        matchedPanel.props.title = nextTitle;
        changed = true;
      }

      if (getStringProp(matchedPanel, "visibleStateKey") !== parts.stateKey) {
        matchedPanel.props.visibleStateKey = parts.stateKey;
        changed = true;
      }

      if (getStringProp(matchedPanel, "visibleStateValue") !== stateValue) {
        matchedPanel.props.visibleStateValue = stateValue;
        changed = true;
      }

      if (changed) {
        updatedCount += 1;
      }
    });

    if (updatedCount) {
      syncSchema(parts.layout.id);
    }

    if (!createdCount && !updatedCount) {
      message.success("右侧内容区已经是最新状态");
      return true;
    }

    broadcastReplaceAll();
    addOperationLog("update_component", "sidebar-layout-sync");
    message.success(`已同步 ${createdCount} 个内容区，更新 ${updatedCount} 个标题`);
    return true;
  });

  return {
    appendSidebarSection,
    getSidebarSections,
    moveSidebarSection,
    removeSidebarSection,
    syncSidebarPanels,
    updateSidebarSectionLabel,
  };
}
