export type SiteSettingsDraft = {
  siteName: string;
  siteSlug: string;
  logoUrl: string;
  ownerName: string;
  description: string;
};

const STORAGE_KEY = "codigo.admin-console.site-settings";

/**
 * 将任意文本转换为适合站点地址的 slug。
 */
export function sanitizeSiteSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * 创建基础设置的默认值。
 */
export function createDefaultSiteSettings(ownerName?: string): SiteSettingsDraft {
  return {
    siteName: "我的站点",
    siteSlug: "my-site",
    logoUrl: "",
    ownerName: ownerName?.trim() || "当前创建者",
    description: "",
  };
}

/**
 * 根据站点 slug 生成访问地址预览。
 */
export function buildSiteAccessUrl(siteSlug: string) {
  const normalizedSlug = sanitizeSiteSlug(siteSlug) || "my-site";
  return `https://codigo.local/site/${normalizedSlug}`;
}

/**
 * 读取本地保存的基础设置草稿。
 */
export function loadSiteSettings(ownerName?: string): SiteSettingsDraft {
  const fallback = createDefaultSiteSettings(ownerName);
  if (typeof window === "undefined") {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw) as Partial<SiteSettingsDraft>;
    return {
      siteName: parsed.siteName?.trim() || fallback.siteName,
      siteSlug: sanitizeSiteSlug(parsed.siteSlug || fallback.siteSlug) || fallback.siteSlug,
      logoUrl: parsed.logoUrl?.trim() || "",
      ownerName: parsed.ownerName?.trim() || fallback.ownerName,
      description: parsed.description ?? "",
    };
  } catch {
    return fallback;
  }
}

/**
 * 保存基础设置草稿到本地。
 */
export function saveSiteSettings(value: SiteSettingsDraft) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...value,
      siteSlug: sanitizeSiteSlug(value.siteSlug) || "my-site",
    }),
  );
}

/**
 * 清理本地保存的基础设置草稿。
 */
export function clearSiteSettings() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
}
