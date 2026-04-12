import { Modal, Spin } from "antd";
import type { TemplatePreviewSchema } from "../utils/preview";
import { getPreviewPages, renderSchemaOutline } from "../utils/preview";

interface TemplatePreviewModalProps {
  loading?: boolean;
  onClose: () => void;
  open: boolean;
  schema: TemplatePreviewSchema | null;
  subtitle?: string;
  title?: string;
}

export function TemplatePreviewModal({
  loading = false,
  onClose,
  open,
  schema,
  subtitle,
  title,
}: TemplatePreviewModalProps) {
  return (
    <Modal
      destroyOnClose
      footer={null}
      open={open}
      title={title}
      width={760}
      onCancel={onClose}
    >
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Spin />
        </div>
      ) : schema ? (
        <div className="space-y-5">
          {subtitle ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
              {subtitle}
            </div>
          ) : null}
          {getPreviewPages(schema).map((page) => (
            <section
              key={String(page.id)}
              className="rounded-3xl border border-slate-200 bg-white p-4"
            >
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
                  {page.name}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                  page:{page.path}
                </span>
              </div>
              {renderSchemaOutline({ nodes: page.components })}
            </section>
          ))}
        </div>
      ) : null}
    </Modal>
  );
}
