import type { PageCategory } from "@codigo/schema";
import type { PageLayoutPresetKey } from "@/modules/editor/registry/components";
import { createDashboardLayoutPreset } from "./presets/dashboardLayout";
import { createSectionStackLayoutPreset } from "./presets/sectionStackLayout";
import { createSidebarLayoutPreset } from "./presets/sidebarLayout";

/**
 * 按页面分类生成布局预设骨架。
 */
export function createPageLayoutPreset(
  preset: PageLayoutPresetKey,
  pageCategory: PageCategory,
) {
  if (preset === "sidebarLayout") {
    return createSidebarLayoutPreset(pageCategory);
  }

  if (preset === "dashboardLayout") {
    return createDashboardLayoutPreset();
  }

  return createSectionStackLayoutPreset(pageCategory);
}
