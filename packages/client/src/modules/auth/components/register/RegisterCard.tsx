import { useTitle } from "ahooks";
import RegisterForm from "./RegisterForm";
import AuthDivider from "../shared/AuthDivider";
import AuthSwitchLink from "../shared/AuthSwitchLink";
import WechatLogin from "../login/WechatLogin";

interface Props {
  onSwitchLogin: () => void;
}

export default function RegisterCard({ onSwitchLogin }: Props) {
  useTitle("Codigo低代码平台 - 注册");

  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-[368px] rounded-lg shadow-lg bg-white p-6 space-y-4 border-gray-200">
        <div className="text-center font-bold">快速注册</div>

        <RegisterForm />

        <AuthDivider />

        <WechatLogin />

        <AuthSwitchLink
          text="已有账号？"
          actionText="去登录"
          onClick={onSwitchLogin}
        />
      </div>
    </div>
  );
}
