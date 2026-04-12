import {
  ApartmentOutlined,
  DownOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

const workspaceItems = [
  {
    key: "/editor",
    icon: <EditOutlined />,
    label: "页面编辑",
  },
  {
    key: "/flow",
    icon: <ApartmentOutlined />,
    label: "流程编排",
  },
];

/** 根据当前路径返回激活中的工作区配置。 */
function getActiveWorkspace(pathname: string) {
  return workspaceItems.find((item) => pathname.startsWith(item.key)) ?? workspaceItems[0];
}

/** 渲染 Studio 左上角的工作区切换菜单。 */
export function WorkspaceSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeWorkspace = getActiveWorkspace(location.pathname);

  const menuItems: MenuProps["items"] = workspaceItems.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
    onClick: () => navigate(item.key),
  }));

  return (
    <Dropdown
      menu={{ items: menuItems, selectedKeys: [activeWorkspace.key] }}
      placement="bottomLeft"
      trigger={["click"]}
    >
      <button className="flex h-8 items-center gap-2 rounded-xl border border-slate-200/80 bg-white/85 px-3 text-[13px] font-medium text-slate-700 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.5)] transition-all hover:border-emerald-200 hover:text-emerald-600 hover:shadow-[0_14px_28px_-22px_rgba(16,185,129,0.4)]">
        <span className="text-sm leading-none text-emerald-600">
          {activeWorkspace.icon}
        </span>
        <span>{activeWorkspace.label}</span>
        <DownOutlined className="text-[10px] text-slate-400" />
      </button>
    </Dropdown>
  );
}
