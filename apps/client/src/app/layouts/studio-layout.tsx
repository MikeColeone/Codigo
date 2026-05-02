import { Outlet } from "react-router-dom";
import { ConfigProvider} from "antd";
import { observer } from "mobx-react-lite";
import EditorHeader from "@/modules/editor/components/header";
import studioAntdTheme from '@/shared/utils/theme/layout-theme'


function StudioLayout() {
  return (
    <ConfigProvider
      theme={studioAntdTheme}
    >
      <div className="studio-root studio-theme-light flex h-full flex-col overflow-hidden bg-[var(--ide-bg)] text-[var(--ide-text)] font-sans">
        <header className="relative z-20 flex h-[var(--header-height)] items-center border-b border-[var(--ide-border)] bg-[var(--ide-header-bg)] px-2 shadow-sm">
          <div className="w-full">
            <EditorHeader />
          </div>
        </header>
        <main className="relative z-10 flex flex-1 overflow-hidden">
          <div className="min-w-0 flex-1 relative">
            <Outlet />
          </div>
        </main>
      </div>
    </ConfigProvider>
  );
}

const StudioLayoutComponent = observer(StudioLayout);

export { StudioLayoutComponent as StudioLayout };
