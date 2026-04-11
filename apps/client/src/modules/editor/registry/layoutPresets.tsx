import {
  ApartmentOutlined,
  DashboardOutlined,
  LayoutOutlined,
} from "@ant-design/icons";
import type { PageCategory } from "@codigo/schema";
import type { PageLayoutPresetMeta } from "./types";

export const pageLayoutPresetCatalog: PageLayoutPresetMeta[] = [
  {
    key: "sectionStack",
    name: "分区布局",
    description: "头部、内容、页脚三段式骨架",
    icon: <LayoutOutlined />,
  },
  {
    key: "sidebarLayout",
    name: "侧栏布局",
    description: "单页面左侧导航切换右侧内容容器",
    icon: <ApartmentOutlined />,
  },
  {
    key: "dashboardLayout",
    name: "工作台布局",
    description: "适合后台页的信息总览与操作区",
    icon: <DashboardOutlined />,
    categories: ["admin"],
  },
];

export function getPageLayoutPresets(pageCategory: PageCategory) {
  return pageLayoutPresetCatalog.filter((item) => {
    return !item.categories?.length || item.categories.includes(pageCategory);
  });
}
