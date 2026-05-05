import { useEffect } from "react";
import { message, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useLocation, useNavigate } from "react-router-dom";
import { buildLoginModalPath } from "@/modules/auth/utils/redirect";
import { useStoreAuth } from "@/shared/hooks";

type AdminRouteGuardProps = {
  children: React.ReactNode;
};

/** 页面管理工作台路由守卫：要求登录，必要时拉取用户信息。 */
function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { store: storeAuth, fetchUserInfo } = useStoreAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = `${location.pathname}${location.search}`;

  useEffect(() => {
    if (!storeAuth.token) {
      message.info("请先登录");
      navigate(buildLoginModalPath(redirectTo), { replace: true });
      return;
    }

    if (!storeAuth.details) {
      fetchUserInfo().then((res) => {
        if (!res) {
          navigate(buildLoginModalPath(redirectTo), { replace: true });
        }
      });
    }
  }, [
    fetchUserInfo,
    navigate,
    redirectTo,
    storeAuth.details,
    storeAuth.token,
  ]);

  if (!storeAuth.token || !storeAuth.details) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}

const AdminRouteGuardComponent = observer(AdminRouteGuard);

export { AdminRouteGuardComponent as AdminRouteGuard };
