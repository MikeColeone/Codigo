import { useTitle } from "ahooks";
import { AuthCardShell } from "@/modules/auth/components/auth-card-shell";
import RegisterOption from "./register-option";

interface IRegisterProps {
  changeState: () => void; // 切换弹窗
}

export default function Register(props: IRegisterProps) {
  useTitle("Codigo低代码平台 - 注册");
  const registerTab = (
    <div className="relative -mb-px rounded-t-md border border-b-0 border-slate-200 bg-white px-3 py-2 text-sm text-[#1f2328]">
      快速注册
    </div>
  );

  return (
    <AuthCardShell
      description="创建账号后进入编辑与发布"
      intro="验证手机号即可完成注册"
      switchActionText="去登录"
      switchPrompt="已有账号？"
      tabBar={registerTab}
      onSwitch={props.changeState}
    >
      <RegisterOption />
    </AuthCardShell>
  );
}










