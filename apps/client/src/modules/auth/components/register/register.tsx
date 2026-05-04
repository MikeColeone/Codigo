import { useTitle } from "ahooks";
import RegisterOption from "./register-option";

interface IRegisterProps {
  changeState: () => void; // 切换弹窗
}

export default function Register(props: IRegisterProps) {
  useTitle("Codigo低代码平台 - 注册");
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
              <div className="text-xs text-[#57606a]">创建账号后进入编辑与发布</div>
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
            <div className="relative -mb-px rounded-t-md border border-b-0 border-slate-200 bg-white px-3 py-2 text-sm text-[#1f2328]">
              快速注册
            </div>
          </div>
        </div>

        <div className="p-8">
          <p className="mb-6 text-xs text-[#57606a]">
            验证手机号即可完成注册
          </p>

        {/* 注册输入框 */}
          <div className="mb-6">
            <RegisterOption />
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
              已有账号？
              <span
                onClick={props.changeState}
                className="cursor-pointer text-[#0f6cbd] transition-colors hover:text-[#085694] hover:underline"
              >
                去登录
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}











