import { useMemo } from "react";
import {
  EditOutlined,
  EyeOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import type { ProjectWorkspaceNavItem } from "../types/project-workspace";

export function useProjectWorkspaceViewModel() {
  const navigationItems = useMemo<ProjectWorkspaceNavItem[]>(
    () => [
      {
        key: "developing",
        label: "开发中",
        title: "当前草稿",
        description: "继续处理本地草稿与当前页面工作区，快速回到编辑器迭代。",
        icon: <EditOutlined />,
      },
      {
        key: "published",
        label: "已发布",
        title: "发布结果",
        description: "查看当前页面对外展示的发布内容，确认线上版本状态。",
        icon: <EyeOutlined />,
      },
      {
        key: "versions",
        label: "版本记录",
        title: "版本记录",
        description: "回看历次发布快照，按版本核对页面结构变化。",
        icon: <HistoryOutlined />,
      },
    ],
    [],
  );

  return {
    navigationItems,
  };
}
