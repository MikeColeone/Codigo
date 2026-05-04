import { useNavigate } from "react-router-dom";

const faqItems = [
  {
    question: "第一次使用应该先从哪里开始？",
    answer: "建议先从模板广场挑一个后台模板，再进入编辑器改内容。",
    href: "/doc?page=quick-start&section=quick-start-start",
  },
  {
    question: "为什么别人打开我的分享链接会提示无权限？",
    answer: "通常是页面设为私密，或者链接已过期，需要重新配置可见性。",
    href: "/doc?page=collaboration&section=collaboration-share",
  },
  {
    question: "编辑器里误操作了，内容还能恢复吗？",
    answer: "先检查是否已保存或是否有历史版本，再决定回退方式。",
    href: "/doc?page=faq&section=faq-lost",
  },
  {
    question: "想新增页面或子页面，入口在哪里？",
    answer: "在编辑器左上角标题下拉里管理页面和子页面结构。",
    href: "/doc?page=editor&section=editor-pages",
  },
];
export function HomePreviewCard() {
  const navigate = useNavigate();

  return (
    <div className="relative">
      <div className="relative rounded-md border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-6 shadow-[var(--ide-panel-shadow)]">
        <div className="mb-6 flex items-center justify-between border-b border-[var(--ide-border)] pb-3">
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)]" />
            <div className="h-3 w-3 rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)]" />
            <div className="h-3 w-3 rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)]" />
          </div>
          <div className="font-mono text-xs text-[var(--ide-text-muted)]">
            system_status: active
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ide-text-muted)]">
            Frequently Asked Questions
          </div>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--ide-text)]">
            常见问题
          </h3>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <button
              key={item.question}
              type="button"
              onClick={() => navigate(item.href)}
              className="group w-full rounded-sm border border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] p-4 text-left transition-colors hover:bg-[var(--ide-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ide-accent)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[var(--ide-accent)]">
                      0{index + 1}
                    </span>
                    <span className="text-sm font-semibold text-[var(--ide-text)]">
                      {item.question}
                    </span>
                  </div>
                  <p className="mt-2 pl-8 text-sm leading-6 text-[var(--ide-text-muted)]">
                    {item.answer}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
