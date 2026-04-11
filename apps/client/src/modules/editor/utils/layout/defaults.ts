import type { TComponentTypes } from "@codigo/schema";

const layoutGapX = 380;
const layoutGapY = 200;
const layoutStartX = 32;
const layoutStartY = 24;

/**
 * 计算组件的默认宽度。
 */
export function getDefaultWidthByType(
  type: TComponentTypes,
  isFlow = false,
): string {
  if (isFlow) {
    switch (type) {
      case "statCard":
        return "320px";
      case "breadcrumbBar":
      case "pageHeader":
      case "queryFilter":
      case "cardGrid":
      case "dataTable":
        return "100%";
      default:
        return "100%";
    }
  }

  switch (type) {
    case "twoColumn":
      return "960px";
    case "container":
      return "720px";
    case "table":
    case "card":
    case "list":
    case "image":
    case "video":
    case "swiper":
    case "richText":
      return "420px";
    case "input":
    case "button":
    case "textArea":
    case "radio":
    case "checkbox":
    case "statistic":
      return "360px";
    case "split":
      return "520px";
    default:
      return "320px";
  }
}

/**
 * 计算组件在画布中的默认位置。
 */
export function getDefaultPosition(index: number) {
  return {
    left: `${layoutStartX + (index % 3) * layoutGapX}px`,
    top: `${layoutStartY + Math.floor(index / 3) * layoutGapY}px`,
  };
}

