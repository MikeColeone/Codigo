import { type ReactNode, Suspense } from "react";
import { RouteLoading, type RouteLoadingMode } from "@/app/router/router-loading";

type SuspensedRouteElementProps = {
  children: ReactNode;
  loadingMode?: RouteLoadingMode;
};

/** 路由级懒加载包装组件，统一 loading 形态。 */
export default function SuspensedRouteElement({
  children,
  loadingMode = "inline",
}: SuspensedRouteElementProps) {
  return <Suspense fallback={<RouteLoading mode={loadingMode} />}>{children}</Suspense>;
}
