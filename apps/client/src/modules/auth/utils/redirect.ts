export function resolveSafeRedirect(value: string | null) {
  if (!value) {
    return null;
  }
  const target = value.trim();
  if (!target.startsWith("/")) {
    return null;
  }
  if (target.startsWith("//")) {
    return null;
  }
  if (target.includes("://")) {
    return null;
  }
  return target;
}

/**
 * 生成带登录弹窗参数的查询串，按需附带安全回跳地址。
 *
 * @param currentParams - 当前查询参数
 * @param redirect - 登录后回跳目标
 * @returns 新的查询参数
 */
export function buildLoginModalSearchParams(
  currentParams?: URLSearchParams,
  redirect?: string | null
) {
  const nextParams = new URLSearchParams(currentParams);
  nextParams.set("modal", "login");

  const safeRedirect = resolveSafeRedirect(redirect ?? null);
  if (safeRedirect) {
    nextParams.set("redirect", safeRedirect);
  } else {
    nextParams.delete("redirect");
  }

  return nextParams;
}

/**
 * 构造登录弹窗路由地址。
 *
 * @param redirect - 登录后回跳目标
 * @returns 登录弹窗地址
 */
export function buildLoginModalPath(redirect?: string | null) {
  const searchParams = buildLoginModalSearchParams(undefined, redirect);
  return `/?${searchParams.toString()}`;
}
