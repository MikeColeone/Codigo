import {
  CloseOutlined,
  HolderOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Button, Tag } from "antd";
import type { EditorRequestRecord } from "./mock-request-data";
import { RequestConfigForm } from "./request-config-form";

interface RequestBottomSheetProps {
  open: boolean;
  requests: EditorRequestRecord[];
  activeRequestId: string | null;
  onClose: () => void;
  onSelect: (requestId: string) => void;
  onReorder: (sourceId: string, targetId: string) => void;
  onChange: (next: EditorRequestRecord) => void;
}

/**
 * 在编辑器底部渲染请求配置台，模拟终端式展开体验。
 */
export function RequestBottomSheet({
  open,
  requests,
  activeRequestId,
  onClose,
  onSelect,
  onReorder,
  onChange,
}: RequestBottomSheetProps) {
  const activeRequest =
    requests.find((item) => item.id === activeRequestId) ?? requests[0] ?? null;

  if (!open || !activeRequest) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[var(--status-bar-height)] z-30 px-4 pb-3">
      <div className="pointer-events-auto overflow-hidden rounded-t-md border border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] shadow-[0_-12px_40px_rgba(15,23,42,0.22)]">
        <div className="flex items-center justify-between border-b border-[var(--ide-border)] px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-[var(--ide-text)]">
              请求配置台
            </span>
            <Tag color="blue" className="!m-0">
              前端 mock
            </Tag>
          </div>
          <div className="flex items-center gap-2">
            <Button size="small" icon={<PlayCircleOutlined />}>
              运行调试
            </Button>
            <Button size="small" type="text" icon={<CloseOutlined />} onClick={onClose}>
              收起
            </Button>
          </div>
        </div>

        <div className="grid h-[340px] grid-cols-[240px_minmax(0,1fr)]">
          <div className="border-r border-[var(--ide-border)] bg-[var(--ide-bg)] p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--ide-text-muted)]">
              请求列表
            </div>
            <div className="space-y-2 overflow-auto">
              {requests.map((request) => {
                const isActive = request.id === activeRequest.id;
                return (
                  <button
                    key={request.id}
                    type="button"
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/plain", request.id);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      const sourceId = event.dataTransfer.getData("text/plain");
                      if (sourceId && sourceId !== request.id) {
                        onReorder(sourceId, request.id);
                      }
                    }}
                    onClick={() => onSelect(request.id)}
                    className={`w-full rounded-sm border px-3 py-2 text-left transition-colors ${
                      isActive
                        ? "border-[var(--ide-accent)] bg-[var(--ide-active)]"
                        : "border-[var(--ide-border)] bg-[var(--ide-control-bg)] hover:bg-[var(--ide-hover)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <HolderOutlined className="text-[12px] text-[var(--ide-text-muted)]" />
                      <span className="truncate text-[12px] font-medium text-[var(--ide-text)]">
                        {request.name}
                      </span>
                    </div>
                    <div className="mt-1 truncate text-[11px] text-[var(--ide-text-muted)]">
                      {request.method} · {request.url}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-w-0 overflow-auto p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-[14px] font-semibold text-[var(--ide-text)]">
                  {activeRequest.name}
                </div>
                <div className="mt-1 text-[12px] text-[var(--ide-text-muted)]">
                  当前为 {activeRequest.type.toUpperCase()} 类型，拖拽左侧列表可调整顺序。
                </div>
              </div>
              <Tag className="!m-0">{activeRequest.statusText}</Tag>
            </div>

            <RequestConfigForm value={activeRequest} onChange={onChange} />
          </div>
        </div>
      </div>
    </div>
  );
}
