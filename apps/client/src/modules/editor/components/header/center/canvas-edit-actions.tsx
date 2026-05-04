import {
  DeleteOutlined,
  RedoOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { Button, Popconfirm } from "antd";
import { observer } from "mobx-react-lite";
import { useEditorComponents, useEditorPage, useEditorPermission } from "@/modules/editor/hooks";

/** 渲染头部左侧可复用的撤销/重做按钮。 */
function CanvasHistoryActions() {
  const {
    hasRedo,
    hasUndo,
    redo,
    undo,
  } = useEditorComponents();
  const { can } = useEditorPermission();

  return (
    <>
      <Button
        type="text"
        className="!h-7 !rounded-lg !px-1.5 !text-[11px] !text-slate-500 hover:!bg-slate-100 hover:!text-slate-900"
        onClick={undo}
        disabled={!hasUndo || !can("edit_content")}
      >
        <UndoOutlined />
      </Button>
      <Button
        type="text"
        className="!h-7 !rounded-lg !px-1.5 !text-[11px] !text-slate-500 hover:!bg-slate-100 hover:!text-slate-900"
        onClick={redo}
        disabled={!hasRedo || !can("edit_content")}
      >
        <RedoOutlined />
      </Button>
    </>
  );
}

/** 渲染画布清空与历史操作集合。 */
function CanvasEditActions() {
  const { store } = useEditorPage();
  const {
    clearActivePageCanvas,
    store: storeComponents,
  } = useEditorComponents();
  const { can } = useEditorPermission();
  const disableClear =
    store.editorMode !== "visual" ||
    !storeComponents.sortableCompConfig.length ||
    !can("edit_structure");

  return (
    <>
      <Popconfirm
        title="确定要清空当前画布吗？"
        description="会移除当前页面中的全部组件，但不会删除页面本身"
        onConfirm={clearActivePageCanvas}
        okText="清空"
        cancelText="取消"
        disabled={disableClear}
      >
        <Button
          danger
          type="text"
          className="!h-7 !rounded-lg !px-2 !text-[11px]"
          disabled={disableClear}
        >
          <DeleteOutlined /> 清空
        </Button>
      </Popconfirm>
    </>
  );
}

const CanvasEditActionsComponent = observer(CanvasEditActions);
const CanvasHistoryActionsComponent = observer(CanvasHistoryActions);

export { CanvasEditActionsComponent as CanvasEditActions };
export { CanvasHistoryActionsComponent as CanvasHistoryActions };
