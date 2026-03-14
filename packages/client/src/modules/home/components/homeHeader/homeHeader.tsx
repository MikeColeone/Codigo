import { useNavigate } from "react-router-dom";

const menus = ["产品能力", "模板案例", "数据看板", "开发文档"];

export function HomeHeader() {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#07090f]/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-12">
          <button
            className="group flex items-center gap-2 text-left text-xl font-bold tracking-tight text-white"
            onClick={() => navigate("/")}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500 text-white font-mono text-lg font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              C
            </div>
            <span className="font-mono tracking-wider">Codigo</span>
          </button>

          <ul className="hidden items-center gap-8 text-sm font-medium text-gray-400 lg:flex">
            {menus.map((item) => (
              <li
                key={item}
                className="relative cursor-pointer transition-colors hover:text-emerald-400 group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="text-sm font-medium text-gray-400 transition hover:text-white"
            onClick={() => navigate("/login_or_register")}
          >
            登录
          </button>
          <button
            className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
            onClick={() => navigate("/editor")}
          >
            开始搭建
          </button>
        </div>
      </div>
    </nav>
  );
}
