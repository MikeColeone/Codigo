import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { createElement, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStoreAuth } from "@/shared/hooks/use-store-auth";
import { buildLoginModalPath } from "@/modules/auth/utils/redirect";

const navigationItems = [
  { label: "模板广场", path: "/?view=templates" },
  { label: "物料广场", path: "/?view=materials" },
  { label: "使用手册", path: "/doc" },
  { label: "我的项目", path: "/console/projects?tab=developing" },
] as const;

export function useHomeNavigation(options?: {
  onOpenProfile?: () => void;
  onOpenLogin?: () => void;
}) {
  const navigate = useNavigate();
  const { isLogin, logout, store } = useStoreAuth();
  const onOpenProfile = options?.onOpenProfile;
  const onOpenLogin = options?.onOpenLogin;

  const userMenuItems = useMemo<MenuProps["items"]>(
    () => [
      {
        key: "profile",
        icon: createElement(UserOutlined),
        label: "个人中心",
        onClick: () => {
          if (onOpenProfile) {
            onOpenProfile();
            return;
          }
          navigate("/?modal=profile");
        },
      },
      {
        key: "logout",
        icon: createElement(LogoutOutlined),
        label: "退出登录",
        onClick: () => {
          logout();
          navigate(buildLoginModalPath());
        },
      },
    ],
    [logout, navigate, onOpenProfile],
  );

  return {
    avatarUrl: store.details?.head_img,
    isLoggedIn: isLogin.get(),
    navigationItems,
    userMenuItems,
    username: store.details?.username,
    openProjects: () => navigate("/console/projects?tab=developing"),
    openDashboard: () => navigate("/console"),
    openHome: () => navigate("/"),
    openLogin: () => {
      if (onOpenLogin) {
        onOpenLogin();
        return;
      }
      navigate(buildLoginModalPath());
    },
    openRoute: (path: string) => navigate(path),
  };
}
