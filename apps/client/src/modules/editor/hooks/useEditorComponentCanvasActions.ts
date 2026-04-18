import { action } from "mobx";
import { arrayMove } from "@dnd-kit/sortable";
import { message } from "antd";
import type {
  ComponentNode,
  ComponentNodeRecord,
  PageGridConfig,
  PageLayoutMode,
  TBasicComponentConfig,
} from "@codigo/schema";
import type { TEditorComponentsStore } from "@/modules/editor/stores";
import { gatherSubtreeIds } from "@/modules/editor/utils/pageLayout";
import {
  buildTreeNode,
  duplicateTreeNode,
  normalizeFromFlatComponents,
  offsetNodePosition,
  type CodeSyncNode,
} from "@/modules/editor/utils/pageSchema";

interface EditorComponentCanvasActionsContext {
  storeComponents: TEditorComponentsStore;
  pageStore: {
    layoutMode: PageLayoutMode;
    grid?: PageGridConfig;
  };
  ensurePermission: (permission: any, deniedMessage?: string) => boolean;
  addOperationLog: (action: any, detail: string) => void;
  broadcastNodeChange: (actionType: string, payload: any) => void;
  broadcastReplaceAll: () => void;
  setCurrentComponent: (id: string) => void;
  getCurrentComponent: () => ComponentNodeRecord | null;
  getSiblingIds: (id: string) => string[];
  syncSchema: (keepCurrentId?: string | null) => void;
  insertNodeTree: (
    node: ComponentNode,
    args?: {
      parentId?: string | null;
      slot?: string | null;
      index?: number;
    },
  ) => void;
}

/**
 * 创建 editor 画布级操作能力。
 */
export function createEditorComponentCanvasActions(
  context: EditorComponentCanvasActionsContext,
) {
  const {
    addOperationLog,
    broadcastNodeChange,
    broadcastReplaceAll,
    ensurePermission,
    getCurrentComponent,
    getSiblingIds,
    insertNodeTree,
    pageStore,
    setCurrentComponent,
    storeComponents,
    syncSchema,
  } = context;

  const resolveSelectedRootIds = () => {
    const sourceIds =
      storeComponents.selectedCompIds?.length
        ? storeComponents.selectedCompIds
        : (storeComponents.currentCompConfig ? [storeComponents.currentCompConfig] : []);
    const candidateIds = Array.from(
      new Set(sourceIds.filter((id) => Boolean(id && storeComponents.compConfigs[id]))),
    );
    if (candidateIds.length <= 1) {
      return candidateIds;
    }
    const selectedSet = new Set(candidateIds);
    return candidateIds.filter((id) => {
      let parentId = storeComponents.compConfigs[id]?.parentId ?? null;
      while (parentId) {
        if (selectedSet.has(parentId)) {
          return false;
        }
        parentId = storeComponents.compConfigs[parentId]?.parentId ?? null;
      }
      return true;
    });
  };

  /**
   * 调整当前组件在同级中的顺序。
   */
  const moveComponent = action((pos: { oldIndex: number; newIndex: number }) => {
    if (!ensurePermission("edit_structure", "当前角色不能调整组件顺序")) {
      return;
    }

    const currentId = storeComponents.currentCompConfig;
    if (!currentId) {
      return;
    }

    const siblingIds = getSiblingIds(currentId);
    const nextIds = arrayMove(siblingIds, pos.oldIndex, pos.newIndex);
    const current = storeComponents.compConfigs[currentId];
    if (current?.parentId) {
      const parent = storeComponents.compConfigs[current.parentId];
      if (parent) {
        parent.childIds = nextIds;
      }
    } else {
      storeComponents.sortableCompConfig = nextIds;
    }
    syncSchema(currentId);
    addOperationLog("move_component", `${pos.oldIndex + 1} -> ${pos.newIndex + 1}`);
  });

  /**
   * 上移当前组件。
   */
  const moveUpComponent = action((currentIndex: number) => {
    if (currentIndex !== 0) {
      moveComponent({
        oldIndex: currentIndex,
        newIndex: currentIndex - 1,
      });
      return;
    }

    message.warning("此组件已经是第一个了");
  });

  /**
   * 下移当前组件。
   */
  const moveDownComponent = action((currentIndex: number) => {
    const currentId = storeComponents.currentCompConfig;
    if (!currentId) {
      return;
    }

    if (currentIndex !== getSiblingIds(currentId).length - 1) {
      moveComponent({
        oldIndex: currentIndex,
        newIndex: currentIndex + 1,
      });
      return;
    }

    message.warning("此组件已经是最后一个了");
  });

  /**
   * 复制当前组件树。
   */
  const copyCurrentComponent = action(() => {
    const selectedIds = resolveSelectedRootIds();
    if (!selectedIds.length) {
      return;
    }
    const copiedNodes = selectedIds
      .map((id) => buildTreeNode(storeComponents.compConfigs, id))
      .filter((node): node is ComponentNode => Boolean(node));
    if (!copiedNodes.length) {
      return;
    }
    storeComponents.copyedCompConig = copiedNodes.length === 1 ? copiedNodes[0] : copiedNodes;
  });

  /**
   * 粘贴已复制的组件树。
   */
  const pasteCopyedComponent = action(() => {
    if (!ensurePermission("edit_structure", "当前角色不能粘贴组件")) {
      return;
    }
    if (!storeComponents.copyedCompConig) {
      return;
    }

    const currentId = storeComponents.currentCompConfig;
    const current = currentId ? storeComponents.compConfigs[currentId] : null;
    const siblingIds = currentId ? getSiblingIds(currentId) : storeComponents.sortableCompConfig;
    const anchorId = (() => {
      const selectedIds = storeComponents.selectedCompIds ?? [];
      if (selectedIds.length <= 1) {
        return currentId;
      }
      for (let i = selectedIds.length - 1; i >= 0; i -= 1) {
        const candidate = selectedIds[i];
        if (candidate && siblingIds.includes(candidate)) {
          return candidate;
        }
      }
      return currentId;
    })();
    const anchor = anchorId ? storeComponents.compConfigs[anchorId] : current;
    const parentId = anchor?.parentId ?? null;
    const slot = anchor?.slot ?? null;
    let insertIndex = anchorId ? siblingIds.indexOf(anchorId) + 1 : siblingIds.length;

    if (Array.isArray(storeComponents.copyedCompConig)) {
      let lastInsertedId: string | null = null;
      for (const rawNode of storeComponents.copyedCompConig) {
        const copiedTree = duplicateTreeNode(rawNode);
        offsetNodePosition(copiedTree);
        insertNodeTree(copiedTree, {
          parentId,
          slot,
          index: insertIndex,
        });
        insertIndex += 1;
        lastInsertedId = copiedTree.id;
      }
      if (lastInsertedId) {
        setCurrentComponent(lastInsertedId);
      }
      addOperationLog("add_component", "粘贴组件");
      return;
    }

    const copiedTree = duplicateTreeNode(storeComponents.copyedCompConig);
    offsetNodePosition(copiedTree);
    insertNodeTree(copiedTree, { parentId, slot, index: insertIndex });
    setCurrentComponent(copiedTree.id);
    addOperationLog("add_component", "粘贴组件");
  });

  /**
   * 删除当前组件树。
   */
  const removeCurrentComponent = action(() => {
    if (!ensurePermission("edit_structure", "当前角色不能删除组件")) {
      return;
    }
    const selectedIds = resolveSelectedRootIds();
    if (!selectedIds.length) {
      return;
    }
    const removedIds = new Set<string>();

    for (const rootId of selectedIds) {
      if (!storeComponents.compConfigs[rootId] || removedIds.has(rootId)) {
        continue;
      }
      const currentComponent = storeComponents.compConfigs[rootId];
      const subtreeIds = gatherSubtreeIds(storeComponents.compConfigs, rootId);

      if (currentComponent.parentId) {
        const parent = storeComponents.compConfigs[currentComponent.parentId];
        if (parent) {
          parent.childIds = parent.childIds.filter((id) => id !== rootId);
        }
      } else {
        storeComponents.sortableCompConfig = storeComponents.sortableCompConfig.filter(
          (id) => id !== rootId,
        );
      }

      for (const targetId of subtreeIds) {
        removedIds.add(targetId);
        delete storeComponents.compConfigs[targetId];
      }

      broadcastNodeChange("remove", { id: rootId, subtreeIds });
    }

    const nextId = storeComponents.sortableCompConfig[0] ?? null;
    storeComponents.currentCompConfig = nextId;
    storeComponents.selectedCompIds = nextId ? [nextId] : [];
    addOperationLog("remove_component", `批量删除:${selectedIds.length}项`);
  });

  /**
   * 用代码模式导出的组件结构替换当前画布。
   */
  const replaceByCode = action(
    (
      components: Array<{
        id?: string;
        type: string;
        props?: Record<string, any>;
        styles?: TBasicComponentConfig["styles"];
        slot?: string;
        children?: CodeSyncNode[];
      }>,
    ) => {
      if (!ensurePermission("edit_structure", "当前角色不能覆盖组件结构")) {
        return;
      }

      const currentId = storeComponents.currentCompConfig;
      const normalized = normalizeFromFlatComponents(
        components,
        pageStore.layoutMode,
        pageStore.grid,
      );
      storeComponents.compConfigs = normalized.compConfigs;
      storeComponents.sortableCompConfig = normalized.sortableCompConfig;
      storeComponents.currentCompConfig =
        currentId && normalized.compConfigs[currentId]
          ? currentId
          : (normalized.sortableCompConfig[0] ?? null);
      storeComponents.selectedCompIds = storeComponents.currentCompConfig
        ? [storeComponents.currentCompConfig]
        : [];

      broadcastReplaceAll();
      addOperationLog(
        "ai_replace",
        `共 ${Object.keys(normalized.compConfigs).length} 个组件`,
      );
    },
  );

  return {
    copyCurrentComponent,
    moveComponent,
    moveDownComponent,
    moveUpComponent,
    pasteCopyedComponent,
    removeCurrentComponent,
    replaceByCode,
  };
}
