import { useRequest } from "ahooks";
import { getRegister } from "@/modules/auth/api/user";
import { useAuthSuccess } from "@/modules/auth/hooks/use-auth-success";

/**
 * 处理注册提交流程，并在结束后刷新图形验证码。
 *
 * @param refreshCaptcha - 刷新图形验证码的方法
 * @returns 注册请求状态与触发方法
 */
export function useRegister(refreshCaptcha: () => void) {
  const { handleAuthSuccess } = useAuthSuccess();

  return useRequest(getRegister, {
    manual: true,
    onSuccess: async (res) => {
      await handleAuthSuccess(res.data);
    },
    onFinally: () => {
      refreshCaptcha();
    },
  });
}




