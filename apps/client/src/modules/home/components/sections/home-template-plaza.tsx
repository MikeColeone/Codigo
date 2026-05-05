import { useRequest } from "ahooks";
import type { TemplateListItem } from "@codigo/schema";
import { message, Spin } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStoreAuth } from "@/shared/hooks";
import {
  fetchTemplateDetail,
  fetchTemplateList,
} from "@/modules/template-center/api/templates";
import { TemplateGallery } from "@/modules/template-center/components/template-gallery";
import { TemplatePreviewModal } from "@/modules/template-center/components/template-preview-modal";
import {
  buildTemplateSchema,
} from "@/modules/template-center/utils/template-draft";
import {
  getTemplateKindLabel,
  isSinglePageTemplatePreset,
} from "@/modules/template-center/utils/template-kind";

type PreviewState = {
  title?: string;
  subtitle?: string;
  schema: ReturnType<typeof buildTemplateSchema> | null;
};

export function HomeTemplatePlaza() {
  const navigate = useNavigate();
  const { store } = useStoreAuth();
  const isLoggedIn = Boolean(store.token);
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);

  const { data: templates = [], loading: templatesLoading } = useRequest(
    fetchTemplateList,
    {
      onError: () => message.error("模板列表加载失败，请稍后重试"),
    },
  );

  const { runAsync: openPreview, loading: previewLoading } = useRequest(
    async (template: TemplateListItem) => {
      const detail = await fetchTemplateDetail(template.id);
      setPreviewState({
        title: detail.preset.name,
        subtitle: `${getTemplateKindLabel(isSinglePageTemplatePreset(detail.preset))} · ${detail.preset.deviceType === "mobile" ? "移动端" : "PC 端"} · ${detail.preset.pages.length} 个页面 · 画布 ${detail.preset.canvasWidth} × ${detail.preset.canvasHeight}`,
        schema: buildTemplateSchema(detail.preset),
      });
    },
    {
      manual: true,
      onError: () => message.error("模板预览加载失败，请稍后重试"),
    },
  );

  const { runAsync: useTemplate, loading: useTemplateLoading } = useRequest(
    async (template: TemplateListItem) => {
      if (!isLoggedIn) {
        message.info("访客仅可查看模板内容，登录后可将模板载入编辑器");
        return;
      }
      navigate(`/editor?templateId=${template.id}`);
    },
    {
      manual: true,
      onError: () => message.error("使用模板失败，请稍后重试"),
    },
  );

  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-14 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ide-text-muted)]">
            Template Plaza
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--ide-text)]">
            模板广场
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-[var(--ide-text-muted)]">
            选择模板快速启动后台页面结构。悬浮卡片即可查看模板或直接使用。
          </p>
        </div>
      </div>

      <div className="mt-8">
        {templatesLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spin />
          </div>
        ) : templates.length ? (
          <TemplateGallery
            canUseTemplate={isLoggedIn}
            templates={templates}
            onPreview={openPreview}
            onUse={useTemplate}
          />
        ) : (
          <div className="rounded-md border border-dashed border-[var(--ide-border)] bg-[var(--ide-control-bg)] px-6 py-10 text-sm text-[var(--ide-text-muted)]">
            暂无可用模板
          </div>
        )}
      </div>

      <TemplatePreviewModal
        loading={previewLoading || useTemplateLoading}
        open={Boolean(previewState)}
        schema={previewState?.schema ?? null}
        subtitle={previewState?.subtitle}
        title={previewState?.title}
        onClose={() => setPreviewState(null)}
      />
    </section>
  );
}
