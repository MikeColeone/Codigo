import { useRequest } from "ahooks";
import { getLoginWithPhone } from "@/modules/auth/api/user";
import { useAuthSuccess } from "@/modules/auth/hooks/use-auth-success";

export function usePhoneLogin() {
  const { handleAuthSuccess } = useAuthSuccess();

  return useRequest(getLoginWithPhone, {
    manual: true,
    onSuccess: async (res) => {
      await handleAuthSuccess(res.data);
    },
  });
}






