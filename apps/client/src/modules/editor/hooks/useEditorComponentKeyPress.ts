import { useKeyPress } from "ahooks";
import { message } from "antd";
import { useEditorComponents } from "./useEditorComponents";

export const EDITOR_COMPONENT_SHORTCUTS: Array<{
  keys: string[][];
  label: string;
}> = [
  { keys: [["Ctrl", "A"], ["⌘", "A"]], label: "全选组件" },
  { keys: [["↑"]], label: "上移选中组件" },
  { keys: [["↓"]], label: "下移选中组件" },
  { keys: [["Delete"], ["Backspace"]], label: "删除选中组件" },
  { keys: [["Ctrl", "C"], ["⌘", "C"]], label: "复制选中组件" },
  { keys: [["Ctrl", "V"], ["⌘", "V"]], label: "粘贴组件" },
  { keys: [["Ctrl", "Z"], ["⌘", "Z"]], label: "撤销" },
  { keys: [["Ctrl", "Shift", "Z"], ["⌘", "Shift", "Z"], ["Ctrl", "Y"]], label: "重做" },
];

/**
 * 注册 editor 域内的组件快捷键。
 */
export function useEditorComponentKeyPress() {
  const {
    undo,
    redo,
    moveUpComponent,
    moveDownComponent,
    pasteCopyedComponent,
    copyCurrentComponent,
    removeCurrentComponent,
    getCurrentComponentConfig,
    getCurrentComponentIndex,
    selectAllComponents,
    store,
  } = useEditorComponents();

  /**
   * 判断当前焦点是否允许触发画布快捷键。
   */
  function canTriggerShortcut() {
    const activeElement = document.activeElement;
    if (!activeElement || activeElement === document.body) {
      return true;
    }

    if (!(activeElement instanceof HTMLElement)) {
      return true;
    }

    const isEditing =
      Boolean(
        activeElement.closest(
          'input, textarea, select, option, [contenteditable=""], [contenteditable="true"], [role="textbox"]',
        ),
      ) || activeElement.isContentEditable;
    if (isEditing) {
      return false;
    }

    const isInOverlay = Boolean(
      activeElement.closest(
        ".ant-modal, .ant-dropdown, .ant-popover, .ant-select-dropdown",
      ),
    );
    if (isInOverlay) {
      return false;
    }

    return true;
  }

  /**
   * 校验当前是否存在选中组件。
   */
  function validateComponent() {
    const isActive = canTriggerShortcut();
    const isCompExist =
      (store.selectedCompIds?.length ?? 0) > 0 || getCurrentComponentConfig.get() !== null;

    if (!isActive) {
      return false;
    }

    if (!isCompExist) {
      message.warning("请先选择组件");
      return false;
    }
    return isActive;
  }

  /**
   * 获取当前选中组件在同级中的有效序号。
   */
  function getValidatedComponentIndex() {
    if (!validateComponent()) {
      return null;
    }

    if ((store.selectedCompIds?.length ?? 0) !== 1) {
      return null;
    }
    const currentIndex = getCurrentComponentIndex.get();
    return currentIndex >= 0 ? currentIndex : null;
  }

  useKeyPress("uparrow", (event) => {
    const currentIndex = getValidatedComponentIndex();
    if (currentIndex === null) return;
    event?.preventDefault?.();
    moveUpComponent(currentIndex);
  });

  useKeyPress("downarrow", (event) => {
    const currentIndex = getValidatedComponentIndex();
    if (currentIndex === null) return;
    event?.preventDefault?.();
    moveDownComponent(currentIndex);
  });

  useKeyPress(["delete", "backspace"], (event) => {
    if (!validateComponent()) return;
    event?.preventDefault?.();
    removeCurrentComponent();
  });

  useKeyPress(["ctrl.c", "meta.c"], (event) => {
    if (!validateComponent()) return;
    event?.preventDefault?.();
    copyCurrentComponent();
  });

  useKeyPress(["ctrl.v", "meta.v"], (event) => {
    if (!canTriggerShortcut()) return;
    event?.preventDefault?.();
    pasteCopyedComponent();
  });

  useKeyPress(["ctrl.a", "meta.a"], (event) => {
    if (!canTriggerShortcut()) return;
    event?.preventDefault?.();
    selectAllComponents();
  });

  useKeyPress(["ctrl.shift.z", "meta.shift.z", "ctrl.y"], (event) => {
    if (!canTriggerShortcut()) return;
    event?.preventDefault?.();
    redo();
  });

  useKeyPress(
    ["ctrl.z", "meta.z"],
    (event) => {
      if (!canTriggerShortcut()) return;
      event?.preventDefault?.();
      undo();
    },
    {
      exactMatch: true,
    },
  );
}
