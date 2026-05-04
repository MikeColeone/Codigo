import { useTitle } from "ahooks";
import { useState } from "react";
import Account from "./account";
import Captcha from "./captcha";

interface ILoginProps {
  changeState: () => void;
}
export default function Login(props: ILoginProps) {
  useTitle("Codigo低代码平台 - 登录");
  const [activeKey, setActiveKey] = useState(1);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-[420px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#f3f3f3] px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0f6cbd]/10 text-[#0f6cbd] ring-1 ring-inset ring-[#0f6cbd]/20">
              <span className="font-mono text-base font-bold">C</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-[#1f2328]">Codigo Studio</div>
              <div className="text-xs text-[#57606a]">登录后进入编辑与发布</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="h-2 w-2 rounded-full bg-slate-300" />
          </div>
        </div>

        <div className="border-b border-slate-200 bg-[#f3f3f3] px-3">
          <div className="flex items-end gap-1">
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
          </div>
        </div>

        <div className="p-8">
          <p className="mb-6 text-xs text-[#57606a]">
            登录即表示你同意我们的使用条款与隐私政策
          </p>

        {/* 账号密码登录输入框 */}
          <div className="mb-6">
            {activeKey === 1 && <Account />}
            {activeKey === 0 && <Captcha />}
          </div>

          <div className="mb-6 flex items-center space-x-2">
            <hr className="flex-grow border-slate-200" />
            <span className="text-xs text-slate-400" data-id="14">
              或者
            </span>
            <hr className="flex-grow border-slate-200" />
          </div>

          <div className="mt-6 text-center text-sm text-slate-600">
            <span>
              还没账号？
              <span
                onClick={props.changeState}
                className="cursor-pointer text-[#0f6cbd] transition-colors hover:text-[#085694] hover:underline"
              >
                去注册
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}










