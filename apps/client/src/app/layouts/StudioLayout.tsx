import { Outlet } from "react-router-dom";
import { ConfigProvider } from "antd";
import { observer } from "mobx-react-lite";
import EditorHeader from "@/modules/editor/components/header";

export const StudioLayout = observer(() => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#10b981",
          colorBgContainer: "#ffffff",
          colorBorder: "#e2e8f0",
          colorText: "#0f172a",
          colorTextSecondary: "#64748b",
          borderRadius: 12,
        },
        components: {
          Button: {
            primaryShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.39)",
          },
          Layout: {
            bodyBg: "#f8fafc",
            headerBg: "rgba(255, 255, 255, 0.8)",
            siderBg: "rgba(255, 255, 255, 0.5)",
          },
          Tabs: {
            itemColor: "#64748b",
            itemSelectedColor: "#10b981",
            itemHoverColor: "#10b981",
          },
        },
      }}
    >
      <div className="flex flex-col h-full bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans">
        <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]"></div>

        <header className="relative z-20 flex h-12 items-center border-b border-slate-200/80 bg-white/92 px-3 shadow-[0_16px_32px_-32px_rgba(15,23,42,0.55)] backdrop-blur-xl">
          <div className="w-full">
            <EditorHeader />
          </div>
        </header>

        <main className="relative z-10 flex flex-1 overflow-hidden">
          <div className="min-w-0 flex-1 relative bg-transparent">
            <Outlet />
          </div>
        </main>
      </div>
    </ConfigProvider>
  );
});
