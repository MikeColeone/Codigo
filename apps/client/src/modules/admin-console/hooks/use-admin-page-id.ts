import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getLowCodePage } from "@/modules/editor/api/low-code";

/**
 * 统一解析控制台页面上下文，缺少 id 时回退读取当前用户拥有的页面。
 */
export function useAdminPageId() {
  const [searchParams] = useSearchParams();
  const routePageId = parsePageId(searchParams.get("id"));
  const [pageId, setPageId] = useState<number | null>(routePageId);
  const [resolvingPageId, setResolvingPageId] = useState(!routePageId);

  useEffect(() => {
    let cancelled = false;

    const resolvePageId = async () => {
      if (routePageId) {
        setPageId(routePageId);
        setResolvingPageId(false);
        return;
      }

      setResolvingPageId(true);
      try {
        const { data } = await getLowCodePage();
        if (cancelled) {
          return;
        }
        setPageId(parsePageId(String(data?.id ?? "")));
      } catch {
        if (!cancelled) {
          setPageId(null);
        }
      } finally {
        if (!cancelled) {
          setResolvingPageId(false);
        }
      }
    };

    void resolvePageId();

    return () => {
      cancelled = true;
    };
  }, [routePageId]);

  return {
    pageId,
    resolvingPageId,
    hasPageId: Boolean(pageId),
  };
}

/**
 * 解析路由 query 中的页面 id，非法值统一按未携带处理。
 */
function parsePageId(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
