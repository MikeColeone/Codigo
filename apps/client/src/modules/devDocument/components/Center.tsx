import { useNavigate } from "react-router-dom";
import { Button, Card } from "antd";

const features = [
  {
    title: "可视化编辑器",
    desc: "所见即所得的拖拽式编辑体验，支持组件自由布局与样式配置。",
    icon: (
      <svg
        className="h-6 w-6 text-[var(--ide-accent)]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      </svg>
    ),
  },
  {
    title: "组件属性配置",
    desc: "灵活的属性面板，支持基础属性、样式、事件交互的精细化控制。",
    icon: (
      <svg
        className="h-6 w-6 text-[var(--ide-accent)]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
        />
      </svg>
    ),
  },
  {
    title: "实时预览发布",
    desc: "一键预览页面效果，支持生成代码与发布上线，无缝衔接生产环境。",
    icon: (
      <svg
        className="h-6 w-6 text-[var(--ide-accent)]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    ),
  },
  {
    title: "数据源绑定",
    desc: "支持静态数据与API数据源绑定，实现动态数据展示与交互。",
    icon: (
      <svg
        className="h-6 w-6 text-[var(--ide-accent)]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
        />
      </svg>
    ),
  },
];

const techStack = [
  { name: "React 18", type: "Core", color: "blue" },
  { name: "TypeScript", type: "Language", color: "blue" },
  { name: "Vite", type: "Build Tool", color: "purple" },
  { name: "Ant Design", type: "UI Library", color: "red" },
  { name: "Tailwind CSS", type: "Styling", color: "cyan" },
  { name: "MobX", type: "State Management", color: "orange" },
  { name: "DnD Kit", type: "Drag & Drop", color: "green" },
];

const highlights = [
  {
    title: "高性能架构",
    desc: "基于 React 18 与 Vite 构建，秒级启动，流畅的拖拽体验，优化的渲染机制。",
  },
  {
    title: "极致扩展性",
    desc: "组件、插件、物料均可扩展，满足不同业务场景的定制化需求。",
  },
  {
    title: "源码级交付",
    desc: "生成的代码清晰可读，无冗余运行时，支持二次开发与独立部署。",
  },
];

export default function Center() {
  const navigate = useNavigate();

  return (
    <main className="flex-1 bg-[var(--ide-bg)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[var(--ide-bg)] py-16 sm:py-24">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--ide-grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--ide-grid-line)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(180deg,var(--ide-bg),rgba(0,0,0,0))]" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--ide-text)] sm:text-5xl md:text-6xl">
            Codigo <span className="text-[var(--ide-accent)]">Low-Code</span>{" "}
            Platform
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--ide-text-muted)]">
            专为开发者打造的低代码开发平台。
            <br />
            以极简的拖拽操作，构建复杂的企业级应用，释放生产力。
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button
              type="primary"
              size="large"
              className="!h-10 !rounded-sm !px-6 !text-sm"
              onClick={() => navigate("/editor")}
            >
              开始体验
            </Button>
            <Button
              size="large"
              className="!h-10 !rounded-sm !px-6 !text-sm"
              onClick={() =>
                document
                  .getElementById("architecture")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              了解架构
            </Button>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--ide-text)]">
              技术架构
            </h2>
            <p className="mt-4 text-lg text-[var(--ide-text-muted)]">
              采用现代前端技术栈，构建稳健、高效的低代码引擎
            </p>
          </div>
          <div className="mt-16 flex flex-wrap justify-center gap-4">
            {techStack.map((tech) => (
              <Card
                key={tech.name}
                className="min-w-[160px] cursor-default text-center shadow-[var(--ide-panel-shadow)]"
              >
                <div className="text-xl font-bold text-[var(--ide-text)]">
                  {tech.name}
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)] px-2.5 py-0.5 text-xs text-[var(--ide-text-muted)]">
                    {tech.type}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Functions Section */}
      <section className="bg-[var(--ide-sidebar-bg)] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--ide-text)]">
              核心功能
            </h2>
            <p className="mt-4 text-lg text-[var(--ide-text-muted)]">
              全流程覆盖，从设计到发布的一站式体验
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="relative rounded-md border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-6 shadow-[var(--ide-panel-shadow)] transition-colors hover:bg-[var(--ide-hover)]"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-sm border border-[var(--ide-control-border)] bg-[var(--ide-control-bg)]">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-[var(--ide-text)]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--ide-text-muted)]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--ide-text)]">
              技术亮点
            </h2>
            <p className="mt-4 text-lg text-[var(--ide-text-muted)]">
              不仅仅是快，更是对质量的极致追求
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {highlights.map((highlight, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-md border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-6 shadow-[var(--ide-panel-shadow)] transition-colors hover:bg-[var(--ide-hover)]"
              >
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[var(--ide-active)] blur-2xl transition-opacity group-hover:opacity-70" />
                <h3 className="relative z-10 text-lg font-semibold text-[var(--ide-text)]">
                  {highlight.title}
                </h3>
                <p className="relative z-10 mt-3 text-sm text-[var(--ide-text-muted)]">
                  {highlight.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}











