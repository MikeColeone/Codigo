import { Outlet } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { HomeHeader } from "@/modules/home/components/layout/home-header";
import AdminSidebar from "./admin-sidebar";

/** 页面管理工作台 Layout：复用 IDE 主题变量，提供顶部导航与侧边栏。 */
export function AdminLayout() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "var(--ide-accent)",
          colorBgContainer: "var(--ide-sidebar-bg)",
          colorBgLayout: "var(--ide-bg)",
          colorBorder: "var(--ide-border)",
          colorText: "var(--ide-text)",
          colorTextSecondary: "var(--ide-text-muted)",
          colorFillSecondary: "var(--ide-hover)",
          borderRadius: 2,
          fontSize: 13,
        },
        components: {
          Button: {
            borderRadius: 2,
            controlHeight: 28,
            defaultBg: "var(--ide-control-bg)",
            defaultBorderColor: "var(--ide-control-border)",
            defaultColor: "var(--ide-text)",
          },
          Layout: {
            bodyBg: "var(--ide-bg)",
            siderBg: "var(--ide-sidebar-bg)",
          },
          Tabs: {
            itemColor: "var(--ide-text-muted)",
            itemSelectedColor: "var(--ide-text)",
            itemHoverColor: "var(--ide-text)",
            cardBg: "var(--ide-header-bg)",
          },
          Input: {
            activeBorderColor: "var(--ide-accent)",
            hoverBorderColor: "var(--ide-accent)",
          },
          InputNumber: {
            activeBorderColor: "var(--ide-accent)",
            hoverBorderColor: "var(--ide-accent)",
          },
          Switch: {
            colorPrimary: "var(--ide-accent)",
            colorPrimaryHover: "var(--ide-accent)",
          },
        },
      }}
    >
      <div className="studio-root studio-theme-light flex h-full flex-col overflow-hidden bg-[var(--ide-bg)] text-[var(--ide-text)] font-sans">
        <HomeHeader />
        <main className="relative z-10 flex flex-1 overflow-hidden pt-[var(--header-height)]">
          <aside className="w-[220px] flex-none border-r border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)]">
            <AdminSidebar />
          </aside>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="h-full overflow-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </ConfigProvider>
  );
}
