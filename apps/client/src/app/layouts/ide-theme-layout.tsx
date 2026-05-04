import { ConfigProvider } from "antd";
import type { ReactNode } from "react";
import studioAntdTheme from "@/shared/utils/theme/layout-theme";

interface IdeThemeLayoutProps {
  children: ReactNode;
  className?: string;
}

export function IdeThemeLayout({ children, className }: IdeThemeLayoutProps) {
  return (
    <ConfigProvider theme={studioAntdTheme}>
      <div
        className={`studio-root studio-theme-light min-h-screen bg-[var(--ide-bg)] text-[var(--ide-text)] font-sans ${className ?? ""}`}
      >
        {children}
      </div>
    </ConfigProvider>
  );
}

