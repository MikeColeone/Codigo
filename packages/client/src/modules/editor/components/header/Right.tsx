import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Space } from "antd";
import type { MenuProps } from "antd";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { useStoreAuth } from "@/shared/hooks";

export default observer(function Right() {
  const navigate = useNavigate();
  const { store: storeAuth, logout } = useStoreAuth();

  const menuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "个人中心",
      onClick: () => navigate("/profile"),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      onClick: () => logout(),
    },
  ];

  const roleLabel =
    storeAuth.details?.global_role === "SUPER_ADMIN"
      ? "超管"
      : storeAuth.details?.global_role === "ADMIN"
        ? "管理员"
        : "协作者";

  return (
    <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={["click"]}>
      <button className="rounded-2xl border border-slate-200/80 bg-white/85 px-3 py-2 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.55)] transition-all hover:border-emerald-200 hover:shadow-[0_16px_36px_-24px_rgba(16,185,129,0.45)]">
        <Space size={10}>
          <Avatar
            src={storeAuth.details?.head_img}
            icon={!storeAuth.details?.head_img && <UserOutlined />}
            className="border border-emerald-500/20"
          />
          <div className="text-left">
            <div className="max-w-[120px] truncate text-sm font-medium text-slate-900">
              {storeAuth.details?.username || "未登录用户"}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span>{roleLabel}</span>
            </div>
          </div>
        </Space>
      </button>
    </Dropdown>
  );
});












