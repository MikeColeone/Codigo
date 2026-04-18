import { Button, InputNumber, message } from "antd";
import {
  BlockOutlined,
  BorderHorizontalOutlined,
  BorderVerticleOutlined,
  ClearOutlined,
  CodeOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  useEditorComponents,
  useEditorPage,
  useLayoutHistory,
  useLayoutManagerUI,
} from "@/modules/editor/hooks";
import type { LayoutBlock } from "@codigo/schema";
import {
  createRootLayoutBlock,
  exportLayoutBlocksJson,
  splitLayoutBlocks,
  splitLayoutBlocksEvenly,
} from "@/modules/editor/utils/layoutBlocks";

interface EditorLayoutManagerProps {
  embedded?: boolean;
  variant?: "dropdown";
}

function getActiveBlocks(layoutBlocks: LayoutBlock[] | undefined, fallback: LayoutBlock[]) {
  return layoutBlocks?.length ? layoutBlocks : fallback;
}

export default observer(function EditorLayoutManager({
  embedded = true,
  variant = "dropdown",
}: EditorLayoutManagerProps) {
  const { getActivePage, updateEditorPageLayoutBlocks } = useEditorComponents();
  const { store: pageStore } = useEditorPage();
  const ui = useLayoutManagerUI();
  const history = useLayoutHistory();
  const activePage = getActivePage.get();

  const fallbackRoot = useMemo(
    () => [createRootLayoutBlock(pageStore.canvasWidth, pageStore.canvasHeight)],
    [pageStore.canvasHeight, pageStore.canvasWidth],
  );

  const currentBlocks = useMemo(
    () => getActiveBlocks(activePage?.layoutBlocks, fallbackRoot),
    [activePage?.layoutBlocks, fallbackRoot],
  );

  const pageId = activePage?.id ?? "";

  function commit(nextBlocks: LayoutBlock[] | null) {
    if (!pageId) return;
    updateEditorPageLayoutBlocks(pageId, nextBlocks);
  }

  async function copyJson(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      message.success("已复制布局 JSON");
    } catch {
      message.warning("复制失败，请手动复制");
    }
  }

  const containerClassName =
    embedded && variant === "dropdown"
      ? "flex w-[340px] max-h-[560px] min-h-0 flex-col overflow-hidden rounded-md border border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] shadow-[0_14px_40px_-28px_rgba(0,0,0,0.55)]"
      : "flex h-full min-h-0 flex-col overflow-hidden bg-[var(--ide-sidebar-bg)]";

  const presets = useMemo(
    () => [
      {
        key: "leftRight",
        name: "左右布局",
        apply: () => {
          const base = [createRootLayoutBlock(pageStore.canvasWidth, pageStore.canvasHeight)];
          const next = splitLayoutBlocks(base, {
            blockId: "root",
            orientation: "vertical",
            position: 320,
          });
          return next;
        },
      },
      {
        key: "topBottom",
        name: "上下布局",
        apply: () => {
          const base = [createRootLayoutBlock(pageStore.canvasWidth, pageStore.canvasHeight)];
          const next = splitLayoutBlocks(base, {
            blockId: "root",
            orientation: "horizontal",
            position: 96,
          });
          return next;
        },
      },
      {
        key: "topLeft",
        name: "上左布局",
        apply: () => {
          const base = [createRootLayoutBlock(pageStore.canvasWidth, pageStore.canvasHeight)];
          const step1 = splitLayoutBlocks(base, {
            blockId: "root",
            orientation: "horizontal",
            position: 96,
          });
          if (!step1) return null;
          const bottom = step1.find((b) => b.y >= 96);
          if (!bottom) return null;
          const step2 = splitLayoutBlocks(step1, {
            blockId: bottom.id,
            orientation: "vertical",
            position: 320,
          });
          return step2;
        },
      },
      {
        key: "grid3x3",
        name: "3×3 网格",
        apply: () => {
          const base = [createRootLayoutBlock(pageStore.canvasWidth, pageStore.canvasHeight)];
          const step1 = splitLayoutBlocksEvenly(base, {
            blockId: "root",
            orientation: "vertical",
            parts: 3,
          });
          if (!step1) return null;
          const ids = step1.map((b) => b.id);
          let next = step1;
          for (const id of ids) {
            const updated = splitLayoutBlocksEvenly(next, {
              blockId: id,
              orientation: "horizontal",
              parts: 3,
            });
            if (!updated) return null;
            next = updated;
          }
          return next;
        },
      },
      {
        key: "none",
        name: "无布局",
        apply: () => null,
      },
    ],
    [pageStore.canvasHeight, pageStore.canvasWidth],
  );

  return (
    <div className={containerClassName}>
      <div className="flex items-center justify-between border-b border-[var(--ide-border)] px-4 py-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ide-text-muted)]">
          布局管理
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="small"
            icon={<ClearOutlined />}
            onClick={() => {
              if (!pageId) return;
              history.push(pageId, activePage?.layoutBlocks ?? []);
              commit(null);
              ui.setSelectedBlockId(null);
            }}
            className="!rounded-sm !border-[var(--ide-control-border)] !bg-[var(--ide-control-bg)] !text-[var(--ide-text)] hover:!bg-[var(--ide-hover)]"
          >
            清除布局
          </Button>
          <Button
            size="small"
            icon={<UndoOutlined />}
            onClick={() => {
              if (!pageId) return;
              const prev = history.undo(pageId);
              if (!prev) {
                message.warning("没有可撤销的切割");
                return;
              }
              commit(prev);
              ui.setSelectedBlockId(null);
            }}
            className="!rounded-sm !border-[var(--ide-control-border)] !bg-[var(--ide-control-bg)] !text-[var(--ide-text)] hover:!bg-[var(--ide-hover)]"
          >
            撤销切割
          </Button>
          <Button
            size="small"
            icon={<CodeOutlined />}
            onClick={() => {
              const json = exportLayoutBlocksJson(activePage?.layoutBlocks ?? [], { pretty: true });
              copyJson(json);
            }}
            className="!rounded-sm !border-[var(--ide-control-border)] !bg-[var(--ide-control-bg)] !text-[var(--ide-text)] hover:!bg-[var(--ide-hover)]"
          >
            导出布局JSON
          </Button>
        </div>
      </div>

      <div className="border-b border-[var(--ide-border)] px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              size="small"
              icon={<BlockOutlined />}
              type={ui.mode === "idle" ? "primary" : "default"}
              onClick={() => ui.setMode("idle")}
              className="!rounded-sm"
            >
              选择
            </Button>
            <Button
              size="small"
              icon={<BorderVerticleOutlined />}
              type={ui.mode === "split-vertical" ? "primary" : "default"}
              onClick={() => ui.setMode("split-vertical")}
              className="!rounded-sm"
            >
              竖切
            </Button>
            <Button
              size="small"
              icon={<BorderHorizontalOutlined />}
              type={ui.mode === "split-horizontal" ? "primary" : "default"}
              onClick={() => ui.setMode("split-horizontal")}
              className="!rounded-sm"
            >
              横切
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <InputNumber
              size="small"
              min={2}
              max={12}
              value={ui.evenParts}
              onChange={(value) => ui.setEvenParts(Number(value))}
              className="w-16 !bg-[var(--ide-control-bg)] !border-[var(--ide-control-border)] !text-[var(--ide-text)]"
            />
            <Button
              size="small"
              icon={<BorderVerticleOutlined />}
              onClick={() => {
                if (!pageId) return;
                const targetId = ui.selectedBlockId ?? currentBlocks[0]?.id ?? "root";
                history.push(pageId, activePage?.layoutBlocks ?? []);
                const next = splitLayoutBlocksEvenly(currentBlocks, {
                  blockId: targetId,
                  orientation: "vertical",
                  parts: ui.evenParts,
                });
                if (!next) {
                  message.warning("等分失败，请检查区块尺寸");
                  return;
                }
                commit(next);
              }}
              className="!rounded-sm !border-[var(--ide-control-border)] !bg-[var(--ide-control-bg)] !text-[var(--ide-text)] hover:!bg-[var(--ide-hover)]"
            >
              竖向等分
            </Button>
            <Button
              size="small"
              icon={<BorderHorizontalOutlined />}
              onClick={() => {
                if (!pageId) return;
                const targetId = ui.selectedBlockId ?? currentBlocks[0]?.id ?? "root";
                history.push(pageId, activePage?.layoutBlocks ?? []);
                const next = splitLayoutBlocksEvenly(currentBlocks, {
                  blockId: targetId,
                  orientation: "horizontal",
                  parts: ui.evenParts,
                });
                if (!next) {
                  message.warning("等分失败，请检查区块尺寸");
                  return;
                }
                commit(next);
              }}
              className="!rounded-sm !border-[var(--ide-control-border)] !bg-[var(--ide-control-bg)] !text-[var(--ide-text)] hover:!bg-[var(--ide-hover)]"
            >
              横向等分
            </Button>
          </div>
        </div>
        <div className="mt-2 text-[11px] text-[var(--ide-text-muted)]">
          在画布上点击选择区块；切割模式下拖拽生成切割线，实时预览。
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-thumb-[var(--ide-border)] hover:scrollbar-thumb-[var(--ide-text-muted)] scrollbar-track-transparent">
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => {
                if (!pageId) return;
                history.push(pageId, activePage?.layoutBlocks ?? []);
                const next = preset.apply();
                commit(next);
                ui.setSelectedBlockId(null);
                message.success(`已应用：${preset.name}`);
              }}
              className="group rounded-md border border-[var(--ide-border)] bg-[var(--ide-control-bg)] px-3 py-3 text-left transition-colors hover:bg-[var(--ide-hover)]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-[12px] font-medium text-[var(--ide-text)]">
                  {preset.name}
                </div>
                <span className="text-[10px] text-[var(--ide-text-muted)] group-hover:text-[var(--ide-text)]">
                  应用
                </span>
              </div>
              <div className="mt-1 text-[10px] text-[var(--ide-text-muted)]">
                点击即可生成对应切割布局
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
