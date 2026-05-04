import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import type { EditorRequestRecord } from "./mock-request-data";

interface RequestPanelProps {
  requests: EditorRequestRecord[];
  activeRequestId: string | null;
  onAdd: () => void;
  onSelect: (requestId: string) => void;
}

/**
 * 渲染编辑器左侧的请求列表入口。
 */
export function RequestPanel({
  requests,
  activeRequestId,
  onAdd,
  onSelect,
}: RequestPanelProps) {
  return (
    <div className="flex h-full flex-col px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-[13px] font-semibold text-[var(--ide-text)]">
            页面请求
          </div>
          <div className="mt-1 text-[11px] leading-5 text-[var(--ide-text-muted)]">
            点击加号创建请求，请求配置会在画布下方展开。
          </div>
        </div>
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={onAdd}
          className="!rounded-sm"
        />
      </div>

      <div className="mt-4 flex-1 space-y-2 overflow-auto">
        {requests.length ? (
          requests.map((request, index) => {
            const isActive = request.id === activeRequestId;
            return (
              <button
                key={request.id}
                type="button"
                onClick={() => onSelect(request.id)}
                className={`w-full rounded-sm border px-3 py-2 text-left transition-colors ${
                  isActive
                    ? "border-[var(--ide-accent)] bg-[var(--ide-active)]"
                    : "border-[var(--ide-border)] bg-[var(--ide-control-bg)] hover:bg-[var(--ide-hover)]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-medium text-[var(--ide-text)]">
                    {request.name}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-[var(--ide-accent)]">
                    #{index + 1}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-[var(--ide-text-muted)]">
                  {request.method} · {request.url}
                </div>
              </button>
            );
          })
        ) : (
          <div className="rounded-sm border border-dashed border-[var(--ide-border)] bg-[var(--ide-hover)] px-3 py-4 text-[12px] leading-6 text-[var(--ide-text-muted)]">
            还没有页面请求。点击右上角加号，先从固定类型里创建一条 mock 请求。
          </div>
        )}
      </div>
    </div>
  );
}
