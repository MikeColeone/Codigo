import { EyeOutlined, RocketOutlined } from "@ant-design/icons";
import { Button } from "antd";
import type { TemplateListItem } from "@codigo/schema";
import { useState } from "react";

interface TemplateGalleryProps {
  canUseTemplate: boolean;
  onPreview: (template: TemplateListItem) => void;
  onUse: (template: TemplateListItem) => void;
  templates: TemplateListItem[];
}

export function TemplateGallery({
  canUseTemplate,
  onPreview,
  onUse,
  templates,
}: TemplateGalleryProps) {
  const [activeTemplateId, setActiveTemplateId] = useState<number | null>(null);

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {templates.map((template) => (
        <div key={template.id} className="relative">
          <article
            className="flex h-full flex-col rounded-md border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-4 shadow-[var(--ide-panel-shadow)] transition-colors hover:border-[var(--ide-control-border)]"
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
            <div className="mb-3 flex flex-wrap gap-2">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--ide-control-border)] bg-[var(--ide-hover)] px-2.5 py-1 text-[11px] font-medium text-[var(--ide-accent)]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-base font-semibold text-[var(--ide-text)]">
              {template.name}
            </h3>
            <p className="mt-2 min-h-[72px] text-sm leading-6 text-[var(--ide-text-muted)]">
              {template.desc}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)] px-3 py-1 text-xs text-[var(--ide-text-muted)]">
                画布 {template.canvasWidth} × {template.canvasHeight}
              </span>
              <span className="rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)] px-3 py-1 text-xs text-[var(--ide-text-muted)]">
                {template.pagesCount} 个页面
              </span>
              <span className="rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)] px-3 py-1 text-xs text-[var(--ide-text-muted)]">
                默认页 page:{template.activePagePath}
              </span>
            </div>
            <div
              className={`mt-auto flex min-h-10 gap-3 pt-6 transition-all ${
                activeTemplateId === template.id
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-1 opacity-0"
              }`}
            >
              <Button
                icon={<EyeOutlined />}
                onClick={() => onPreview(template)}
                className="!rounded-sm"
                tabIndex={activeTemplateId === template.id ? 0 : -1}
              >
                预览模板
              </Button>
              {canUseTemplate && (
                <Button
                  icon={<RocketOutlined />}
                  type="primary"
                  onClick={() => onUse(template)}
                  className="!rounded-sm"
                  tabIndex={activeTemplateId === template.id ? 0 : -1}
                >
                  使用模板
                </Button>
              )}
            </div>
          </article>
        </div>
      ))}
    </div>
  );
}
