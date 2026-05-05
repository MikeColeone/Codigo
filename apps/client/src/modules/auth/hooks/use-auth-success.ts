import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStoreAuth } from "@/shared/hooks/use-store-auth";
import { resolveSafeRedirect } from "@/modules/auth/utils/redirect";

/**
 * 统一处理认证成功后的登录态落库与安全回跳。
 *
 * @returns 认证成功后的公共动作
 */
export function useAuthSuccess() {
  const { login } = useStoreAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleAuthSuccess = useCallback(
    async (token: string) => {
      await login(token);
      const redirect = resolveSafeRedirect(searchParams.get("redirect"));
      navigate(redirect ?? "/");
    },
    [login, navigate, searchParams]
  );

  return {
    handleAuthSuccess,
  };
}
