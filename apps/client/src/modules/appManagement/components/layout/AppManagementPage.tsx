import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";
import type { MenuProps } from "antd";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { HomeUserEntry } from "@/modules/home/components/layout/HomeUserEntry";

interface AppManagementPageProps {
  avatarUrl?: string;
  children: ReactNode;
  isLoggedIn: boolean;
  openLogin: () => void;
  userMenuItems: MenuProps["items"];
  username?: string;
}

function AppManagementPage({
  avatarUrl,
  children,
  isLoggedIn,
  openLogin,
  userMenuItems,
  username,
}: AppManagementPageProps) {
  const navigate = useNavigate();

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[var(--ide-bg)] text-[var(--ide-text)]">
      <header className="z-20 h-[var(--header-height)] shrink-0 border-b border-[var(--ide-border)] bg-[var(--ide-header-bg)]">
        <div className="flex h-full w-full items-center justify-between px-3">
          <div className="flex items-center gap-6">
            <button
              type="button"
              className="flex items-center gap-2"
              onClick={() => navigate("/")}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-[var(--ide-accent)] font-mono text-[12px] font-bold text-[var(--ide-statusbar-text)] shadow-[var(--ide-panel-shadow)]">
                C
              </div>
              <span className="font-mono text-sm font-semibold tracking-wider text-[var(--ide-text)]">
                Codigo
              </span>
            </button>
            <span className="text-xs font-medium text-[var(--ide-text-muted)]">/</span>
            <span className="text-sm font-medium text-[var(--ide-text-muted)]">应用管理</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="small"
              icon={<ArrowLeftOutlined />}
              className="!rounded-sm"
              onClick={() => navigate("/")}
            >
              返回
            </Button>
            <HomeUserEntry
              avatarUrl={avatarUrl}
              isLoggedIn={isLoggedIn}
              openLogin={openLogin}
              userMenuItems={userMenuItems}
              username={username}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export default AppManagementPage;
