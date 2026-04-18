export default function Footer() {
  return (
    <footer className="border-t border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-sm border border-[var(--ide-control-border)] bg-[var(--ide-control-bg)] text-[var(--ide-accent)] font-mono text-xs font-bold">
              C
            </div>
            <p className="text-sm text-[var(--ide-text-muted)]">
              © {new Date().getFullYear()} Codigo System. All rights reserved.
            </p>
          </div>

          <div className="flex gap-6">
            <a
              href="#"
              className="text-sm text-[var(--ide-text-muted)] hover:text-[var(--ide-text)] transition-colors"
            >
              关于我们
            </a>
            <a
              href="#"
              className="text-sm text-[var(--ide-text-muted)] hover:text-[var(--ide-text)] transition-colors"
            >
              联系支持
            </a>
            <a
              href="#"
              className="text-sm text-[var(--ide-text-muted)] hover:text-[var(--ide-text)] transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}











