/**
 * 为后台工作台内部跳转补齐当前页面 id，避免在设置页之间切换时丢失页面上下文。
 */
export function withPageId(path: string, pageId?: number | null) {
  if (!pageId) {
    return path;
  }

  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}id=${pageId}`;
}
