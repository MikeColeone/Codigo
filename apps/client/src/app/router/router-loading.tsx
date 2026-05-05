import { Spin } from "antd";

export type RouteLoadingMode = "inline" | "fullscreen";

type RouteLoadingProps = {
  mode?: RouteLoadingMode;
};

export function RouteLoading({ mode = "inline" }: RouteLoadingProps) {
  return (
    <div
      className={
        mode === "fullscreen"
          ? "flex h-screen items-center justify-center bg-[var(--ide-bg)] text-[var(--ide-text)]"
          : "flex h-full min-h-[320px] items-center justify-center"
      }
    >
      <Spin size="large" />
    </div>
  );
}
