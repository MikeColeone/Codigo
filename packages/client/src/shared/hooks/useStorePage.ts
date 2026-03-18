import { action } from "mobx";
import { createStorePage } from "@/shared/stores";
import type { TStorePage, DeviceType, CodeFramework } from "@/shared/stores";

const storePage = createStorePage();

export function useStorePage() {
  /**
   * 设置页面标题
   * @param title - 页面标题
   */
  const setPageTitle = action((title: string) => {
    storePage.title = title;
  });

  const setDeviceType = action((type: DeviceType) => {
    storePage.deviceType = type;
    if (type === "mobile") {
      storePage.canvasWidth = 380;
      storePage.canvasHeight = 700;
    } else {
      storePage.canvasWidth = 1024; // Default PC width
      storePage.canvasHeight = 768; // Default PC height
    }
  });

  const setCanvasSize = action((width: number, height: number) => {
    storePage.canvasWidth = width;
    storePage.canvasHeight = height;
  });

  const setCodeFramework = action((framework: CodeFramework) => {
    storePage.codeFramework = framework;
  });

  /**
   * 更新页面信息
   * @param page - 部分页面信息
   */
  const updatePage = action((page: Partial<TStorePage>) => {
    if (!page) return;
    for (const [key, value] of Object.entries(page))
      // @ts-ignore
      storePage[key as keyof TStorePage] = value;
  });

  return {
    updatePage,
    setPageTitle,
    setDeviceType,
    setCanvasSize,
    setCodeFramework,
    store: storePage,
  };
}
