import type { ReactNode } from "react";
import classNames from "classnames";

/**
 * 统一承载大屏区块的面板容器，保证视觉层级和内边距一致。
 */
export function BigScreenPanel(props: {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={classNames(
        "rounded-[20px] border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-4 shadow-[var(--ide-panel-shadow)]",
        props.className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[13px] font-semibold tracking-[0.18em] text-[var(--ide-text)] uppercase">
            {props.title}
          </div>
          {props.subtitle ? (
            <div className="mt-1 text-[11px] text-[var(--ide-text-muted)]">{props.subtitle}</div>
          ) : null}
        </div>
        {props.extra}
      </div>
      <div className="mt-4">{props.children}</div>
    </section>
  );
}
