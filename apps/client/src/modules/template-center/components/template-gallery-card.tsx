import { EyeOutlined, RocketOutlined } from "@ant-design/icons";
import { Button } from "antd";
import type { TemplateListItem } from "@codigo/schema";
import {
  getTemplateKindLabel,
  isSinglePageTemplateItem,
} from "../utils/template-kind";

interface TemplateGalleryCardProps {
  alwaysShowActions?: boolean;
  canUseTemplate: boolean;
  isActive: boolean;
  onPreview: (template: TemplateListItem) => void;
  onUse: (template: TemplateListItem) => void;
  template: TemplateListItem;
}

/**
 * 渲染模板卡片，并按场景控制底部操作区是否常显。
 */
export function TemplateGalleryCard({
  alwaysShowActions = false,
  canUseTemplate,
  isActive,
  onPreview,
  onUse,
  template,
}: TemplateGalleryCardProps) {
  const actionsVisible = alwaysShowActions || isActive;
  const isSinglePageTemplate = isSinglePageTemplateItem(template);

  return (
    <article className="flex h-full flex-col rounded-md border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-4 shadow-[var(--ide-panel-shadow)] transition-colors hover:border-[var(--ide-control-border)]">
      <div className="mb-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-[var(--ide-control-border)] bg-[var(--ide-hover)] px-2.5 py-1 text-[11px] font-semibold text-[var(--ide-text)]">
          {getTemplateKindLabel(isSinglePageTemplate)}
        </span>
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
          {isSinglePageTemplate ? "覆盖当前页" : "替换全部页面"}
        </span>
        <span className="rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)] px-3 py-1 text-xs text-[var(--ide-text-muted)]">
          默认页 page:{template.activePagePath}
        </span>
      </div>

      <div
        className={`mt-auto flex min-h-10 gap-3 pt-6 transition-all ${
          actionsVisible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-1 opacity-0"
        }`}
      >
        <Button
          icon={<EyeOutlined />}
          onClick={() => onPreview(template)}
          className="!rounded-sm"
          tabIndex={actionsVisible ? 0 : -1}
        >
          预览模板
        </Button>
        {canUseTemplate && (
          <Button
            icon={<RocketOutlined />}
            type="primary"
            onClick={() => onUse(template)}
            className="!rounded-sm"
            tabIndex={actionsVisible ? 0 : -1}
          >
            使用模板
          </Button>
        )}
      </div>
    </article>
  );
}
