import type { ReactNode } from "react";

interface AuthCardShellProps {
  description: string;
  intro: string;
  switchActionText: string;
  switchPrompt: string;
  tabBar: ReactNode;
  children: ReactNode;
  onSwitch: () => void;
}

/**
 * 承接登录与注册页面共用的认证卡片外壳。
 *
 * @param props - 认证卡片壳层配置
 * @returns 统一的认证卡片结构
 */
export function AuthCardShell(props: AuthCardShellProps) {
  const {
    description,
    intro,
    switchActionText,
    switchPrompt,
    tabBar,
    children,
    onSwitch,
  } = props;

  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-[420px] overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#f3f3f3] px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0f6cbd]/10 text-[#0f6cbd] ring-1 ring-inset ring-[#0f6cbd]/20">
              <span className="font-mono text-base font-bold">C</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-[#1f2328]">
                Codigo Studio
              </div>
              <div className="text-xs text-[#57606a]">{description}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="h-2 w-2 rounded-full bg-slate-300" />
          </div>
        </div>

        <div className="border-b border-slate-200 bg-[#f3f3f3] px-3">
          <div className="flex items-end gap-1">{tabBar}</div>
        </div>

        <div className="p-8">
          <p className="mb-6 text-xs text-[#57606a]">{intro}</p>

          <div className="mb-6">{children}</div>

          <div className="mb-6 flex items-center space-x-2">
            <hr className="flex-grow border-slate-200" />
            <span className="text-xs text-slate-400">或者</span>
            <hr className="flex-grow border-slate-200" />
          </div>

          <div className="mt-6 text-center text-sm text-slate-600">
            <span>
              {switchPrompt}
              <span
                onClick={onSwitch}
                className="cursor-pointer text-[#0f6cbd] transition-colors hover:text-[#085694] hover:underline"
              >
                {switchActionText}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
