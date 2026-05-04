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
        "rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(10,20,41,0.92),rgba(7,15,30,0.96))] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.32)] backdrop-blur",
        props.className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[13px] font-semibold tracking-[0.18em] text-[#d8e7ff] uppercase">
            {props.title}
          </div>
          {props.subtitle ? (
            <div className="mt-1 text-[11px] text-[#8fa8d8]">{props.subtitle}</div>
          ) : null}
        </div>
        {props.extra}
      </div>
      <div className="mt-4">{props.children}</div>
    </section>
  );
}
