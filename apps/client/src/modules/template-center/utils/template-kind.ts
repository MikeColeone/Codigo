import type { TemplateListItem, TemplatePreset } from "@codigo/schema";

/**
 * 单页面模板只携带一个真实页面，用于覆盖当前正在编辑的页面。
 */
export function isSinglePageTemplatePreset(template: TemplatePreset) {
  return (template.pages?.length ?? 0) <= 1;
}

/**
 * 列表态模板通过页面数推断模板类型，避免额外扩展协议字段。
 */
export function isSinglePageTemplateItem(template: TemplateListItem) {
  return (template.pagesCount ?? 0) <= 1;
}

/**
 * 返回模板类型的人类可读标签。
 */
export function getTemplateKindLabel(isSinglePage: boolean) {
  return isSinglePage ? "单页面模板" : "完整站点模板";
}
