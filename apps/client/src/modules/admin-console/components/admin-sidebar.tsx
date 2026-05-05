import {
  AppstoreOutlined,
  AreaChartOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import { useAdminPageId } from "../hooks/use-admin-page-id";
import { withPageId } from "../utils/page-id-route";

type AdminNavItem = {
  key: string;
  label: string;
  to: string;
  icon: React.ReactNode;
};

const items: AdminNavItem[] = [
  { key: "projects", label: "我的站点", to: "/console/projects", icon: <AppstoreOutlined /> },
  { key: "settings", label: "基础设置", to: "/console/settings", icon: <SettingOutlined /> },
  {
    key: "permissions",
    label: "权限设置",
    to: "/console/permissions",
    icon: <SafetyCertificateOutlined />,
  },
  { key: "big-screen", label: "数据大屏", to: "/console/big-screen", icon: <AreaChartOutlined /> },
];

export default function AdminSidebar() {
  const { pageId } = useAdminPageId();

  return (
    <div className="flex h-full flex-col">
      <div className="px-2 py-2">
        <div className="text-[11px] font-medium tracking-wide text-[var(--ide-text-muted)]">
          工作台
        </div>
      </div>
      <nav className="flex-1 overflow-auto px-2 pb-2">
        <div className="flex flex-col gap-0.5">
          {items.map((item) => (
            <NavLink
              key={item.key}
              to={withPageId(item.to, pageId)}
              end={item.to === "/console"}
              className={({ isActive }) =>
                [
                  "flex items-center gap-2 rounded-sm px-2 py-1.5 text-[12px] transition-colors",
                  isActive
                    ? "bg-[var(--ide-active)] text-[var(--ide-text)]"
                    : "text-[var(--ide-text-muted)] hover:bg-[var(--ide-hover)] hover:text-[var(--ide-text)]",
                ].join(" ")
              }
            >
              <span className="text-[13px] text-[var(--ide-text-muted)]">
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
