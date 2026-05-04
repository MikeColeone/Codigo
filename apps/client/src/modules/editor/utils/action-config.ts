import type { ActionConfig } from "@codigo/schema";

export const actionTypeOptions = [
  { label: "设置状态", value: "setState" },
  { label: "切换视图", value: "setActiveContainer" },
  { label: "页面跳转", value: "navigate" },
  { label: "打开链接", value: "openUrl" },
  { label: "滚动定位", value: "scrollTo" },
  { label: "提示消息", value: "toast" },
  { label: "确认弹窗", value: "confirm" },
  { label: "条件判断", value: "when" },
  { label: "请求接口", value: "request" },
] as const;

/**
 * 创建指定动作类型的默认配置。
 */
export function createDefaultAction(
  type: ActionConfig["type"],
): ActionConfig {
  switch (type) {
    case "setActiveContainer":
      return { type, viewGroupId: "", containerId: "" };
    case "navigate":
      return { type, path: "page:home" };
    case "openUrl":
      return { type, url: "https://example.com", target: "_blank" };
    case "scrollTo":
      return { type, targetId: "section-overview" };
    case "toast":
      return { type, message: "操作成功", variant: "success" };
    case "confirm":
      return { type, message: "确认执行该操作？" };
    case "when":
      return { type, key: "activePanel", op: "eq", value: "overview" };
    case "request":
      return {
        type,
        method: "GET",
        url: "/api/health",
        saveToStateKey: "lastResponse",
        responsePath: "",
      };
    default:
      return { type: "setState", key: "activePanel", value: "overview" };
  }
}

/**
 * 返回动作类型对应的展示文案。
 */
export function getActionTypeLabel(type: ActionConfig["type"]) {
  return actionTypeOptions.find((item) => item.value === type)?.label ?? type;
}
