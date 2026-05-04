import type { TemplateListItem } from "@codigo/schema";
import { useMemo, useState } from "react";
import { useVirtualWindow } from "@/modules/app-management/hooks/use-virtual-window";
import { TemplateGalleryCard } from "./template-gallery-card";

interface TemplateGalleryProps {
  canUseTemplate: boolean;
  onPreview: (template: TemplateListItem) => void;
  onUse: (template: TemplateListItem) => void;
  templates: TemplateListItem[];
  virtualized?: boolean;
}

const TEMPLATE_CARD_HEIGHT = 320;
const TEMPLATE_ROW_GAP = 20;
const TEMPLATE_ROW_SIZE = TEMPLATE_CARD_HEIGHT + TEMPLATE_ROW_GAP;
const TEMPLATE_VIEWPORT_HEIGHT = "clamp(360px, calc(100vh - 360px), 560px)";
const TEMPLATE_VIEWPORT_FALLBACK_HEIGHT = 480;

/**
 * 根据容器宽度推导模板卡片网格列数。
 */
function resolveTemplateColumns(width: number) {
  if (width >= 1280) {
    return 3;
  }

  if (width >= 768) {
    return 2;
  }

  return 1;
}

export function TemplateGallery({
  canUseTemplate,
  onPreview,
  onUse,
  templates,
  virtualized = false,
}: TemplateGalleryProps) {
  const [activeTemplateId, setActiveTemplateId] = useState<number | null>(null);
  const rowWindow = useVirtualWindow({
    itemCount: Math.ceil(templates.length / 3),
    itemSize: TEMPLATE_ROW_SIZE,
    overscan: 1,
  });
  const columnCount = resolveTemplateColumns(rowWindow.viewportWidth);
  const rows = useMemo(() => {
    if (!virtualized) {
      return [];
    }

    const nextRows: TemplateListItem[][] = [];

    for (let index = 0; index < templates.length; index += columnCount) {
      nextRows.push(templates.slice(index, index + columnCount));
    }

    return nextRows;
  }, [columnCount, templates, virtualized]);

  if (virtualized) {
    const virtualizedRowWindow = {
      ...rowWindow,
      endIndex: Math.min(
        rows.length,
        rowWindow.startIndex +
          Math.max(1, Math.ceil(rowWindow.viewportHeight / TEMPLATE_ROW_SIZE)) +
          2,
      ),
      totalHeight: rows.length * TEMPLATE_ROW_SIZE,
    };
    const visibleRows = rows.slice(
      virtualizedRowWindow.startIndex,
      virtualizedRowWindow.endIndex,
    );

    return (
      <div
        ref={virtualizedRowWindow.containerRef}
        className="overflow-y-auto pr-1"
        style={{ height: TEMPLATE_VIEWPORT_HEIGHT }}
        onScroll={virtualizedRowWindow.onScroll}
      >
        <div
          className="relative"
          style={{
            height: Math.max(
              virtualizedRowWindow.totalHeight,
              virtualizedRowWindow.viewportHeight ||
                TEMPLATE_VIEWPORT_FALLBACK_HEIGHT,
            ),
          }}
        >
          <div
            className="absolute inset-x-0 top-0"
            style={{ transform: `translateY(${virtualizedRowWindow.offsetY}px)` }}
          >
            <div className="space-y-5">
              {visibleRows.map((row, rowIndex) => (
                <div
                  key={`row-${virtualizedRowWindow.startIndex + rowIndex}`}
                  className="grid gap-5"
                  style={{
                    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                  }}
                >
                  {row.map((template) => (
                    <div
                      key={template.id}
                      style={{ height: TEMPLATE_CARD_HEIGHT }}
                    >
                      <TemplateGalleryCard
                        alwaysShowActions
                        canUseTemplate={canUseTemplate}
                        isActive
                        template={template}
                        onPreview={onPreview}
                        onUse={onUse}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {templates.map((template) => (
        <div key={template.id} className="relative">
          <div
            onMouseEnter={() => setActiveTemplateId(template.id)}
            onMouseLeave={() =>
              setActiveTemplateId((prev) =>
                prev === template.id ? null : prev,
              )
            }
            onFocus={() => setActiveTemplateId(template.id)}
            onBlur={() =>
              setActiveTemplateId((prev) =>
                prev === template.id ? null : prev,
              )
            }
          >
            <TemplateGalleryCard
              canUseTemplate={canUseTemplate}
              isActive={activeTemplateId === template.id}
              template={template}
              onPreview={onPreview}
              onUse={onUse}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
