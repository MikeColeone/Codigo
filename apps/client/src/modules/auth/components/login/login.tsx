import { useTitle } from "ahooks";
import { useState } from "react";
import { AuthCardShell } from "@/modules/auth/components/auth-card-shell";
import Account from "./account";
import Captcha from "./captcha";

interface ILoginProps {
  changeState: () => void;
}
export default function Login(props: ILoginProps) {
  useTitle("Codigo低代码平台 - 登录");
  const [activeKey, setActiveKey] = useState(1);
  const loginTabs = (
    <>
      <button
        type="button"
        onClick={() => setActiveKey(1)}
        aria-selected={activeKey === 1}
        className={`relative -mb-px rounded-t-md border border-b-0 px-3 py-2 text-sm transition-colors ${
          activeKey === 1
            ? "border-slate-200 bg-white text-[#1f2328]"
            : "border-transparent bg-transparent text-[#57606a] hover:text-[#1f2328]"
        }`}
      >
        密码登录
      </button>
      <button
        type="button"
        onClick={() => setActiveKey(0)}
        aria-selected={activeKey === 0}
        className={`relative -mb-px rounded-t-md border border-b-0 px-3 py-2 text-sm transition-colors ${
          activeKey === 0
            ? "border-slate-200 bg-white text-[#1f2328]"
            : "border-transparent bg-transparent text-[#57606a] hover:text-[#1f2328]"
        }`}
      >
        验证码登录
      </button>
    </>
  );

  return (
    <AuthCardShell
      description="登录后进入编辑与发布"
      intro="登录即表示你同意我们的使用条款与隐私政策"
      switchActionText="去注册"
      switchPrompt="还没账号？"
      tabBar={loginTabs}
      onSwitch={props.changeState}
    >
      {activeKey === 1 ? <Account /> : <Captcha />}
    </AuthCardShell>
  );
}









