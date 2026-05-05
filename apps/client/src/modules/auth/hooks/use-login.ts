import { useRequest } from "ahooks";
import { getLoginWithPassword } from "@/modules/auth/api/user";
import { useAuthSuccess } from "@/modules/auth/hooks/use-auth-success";

export function useLogin() {
  const { handleAuthSuccess } = useAuthSuccess();

  return useRequest(getLoginWithPassword, {
    manual: true,
    onSuccess: async (res) => {
      await handleAuthSuccess(res.data);
    },
  });
}






