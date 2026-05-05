import { HistoryOutlined } from "@ant-design/icons";
import { Avatar, Button, Empty, Spin } from "antd";
import dayjs from "dayjs";
import { useVirtualWindow } from "@/shared/hooks";
import type { PageVersionItem } from "../../types/project-workspace";

interface HistorySectionProps {
  embedded?: boolean;
  loading: boolean;
  onPreview: (version: PageVersionItem) => void | Promise<void>;
  versions: PageVersionItem[];
}

const HISTORY_ROW_HEIGHT = 88;
const HISTORY_VIEWPORT_HEIGHT = "clamp(360px, calc(100vh - 360px), 620px)";
const HISTORY_VIEWPORT_FALLBACK_HEIGHT = 480;

function HistorySection({
  embedded = false,
  loading,
  onPreview,
  versions,
}: HistorySectionProps) {
  const virtualWindow = useVirtualWindow({
    itemCount: versions.length,
    itemSize: HISTORY_ROW_HEIGHT,
    overscan: 2,
  });
  const visibleVersions = versions.slice(
    virtualWindow.startIndex,
    virtualWindow.endIndex,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spin />
      </div>
    );
  }

  if (!versions.length) {
    return (
      <Empty
        description="暂无历史版本记录"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div
      className={
        embedded
          ? "overflow-hidden"
          : "overflow-hidden rounded-md border border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)]"
      }
    >
      <div
        ref={virtualWindow.containerRef}
        className="overflow-y-auto pr-1"
        style={{ height: HISTORY_VIEWPORT_HEIGHT }}
        onScroll={virtualWindow.onScroll}
      >
        <div
          className="relative"
          style={{
            height: Math.max(
              virtualWindow.totalHeight,
              virtualWindow.viewportHeight || HISTORY_VIEWPORT_FALLBACK_HEIGHT,
            ),
          }}
        >
          <div
            className="absolute inset-x-0 top-0"
            style={{ transform: `translateY(${virtualWindow.offsetY}px)` }}
          >
            <div className="space-y-3 p-3">
              {visibleVersions.map((item) => (
                <div
                  key={item.id}
                  className="flex h-[76px] items-center justify-between gap-3 rounded-md border border-[var(--ide-border)] bg-[var(--ide-control-bg)] px-4 py-3 transition-colors hover:bg-[var(--ide-hover)]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      className="bg-[var(--ide-accent)]"
                      icon={<HistoryOutlined />}
                      size="small"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[var(--ide-text)]">
                        v{item.version}
                      </div>
                      <div className="truncate text-xs text-[var(--ide-text-muted)]">
                        {item.desc || "历史版本"} ·{" "}
                        {dayjs(item.created_at).format("YYYY-MM-DD HH:mm")}
                      </div>
                    </div>
                  </div>

                  <Button
                    key={item.id}
                    size="small"
                    type="link"
                    onClick={() => onPreview(item)}
                  >
                    查看
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistorySection;
