import Center from "@/modules/devDocument/components/Center";

export function HomeDevDocSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-14 pt-10">
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ide-text-muted)]">
          Developer Docs
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--ide-text)]">
          开发文档
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-[var(--ide-text-muted)]">
          这里集中展示核心能力说明与常用入口。
        </p>
      </div>

      <div className="mt-8">
        <Center variant="embedded" />
      </div>
    </section>
  );
}
