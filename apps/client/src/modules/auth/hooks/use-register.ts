import { useStoreAuth } from "@/shared/hooks/use-store-auth";
import { useRequest } from "ahooks";
import { getRegister } from "@/modules/auth/api/user";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resolveSafeRedirect } from "@/modules/auth/utils/redirect";

/**
 * 处理注册提交流程，并在结束后刷新图形验证码。
 *
 * @param refreshCaptcha - 刷新图形验证码的方法
 * @returns 注册请求状态与触发方法
 */
export function useRegister(refreshCaptcha: () => void) {
  const { login } = useStoreAuth();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();

  return useRequest(getRegister, {
    manual: true,
    onSuccess: async (res) => {
      await login(res.data);
      const redirect = resolveSafeRedirect(searchParams.get("redirect"));
      nav(redirect ?? "/");
    },
    onFinally: () => {
      refreshCaptcha();
    },
  });
}





