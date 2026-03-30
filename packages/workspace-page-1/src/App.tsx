import { Alert, Typography } from "antd";
import type { SyncSchemaItem } from "@codigo/schema";
import pageSchema from "./schema.json";
import { LowCodeRenderer } from "./LowCodeRenderer";

const { Title, Text } = Typography;

const schema = pageSchema as SyncSchemaItem[];

export default function App() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-6 py-8">
        <header className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <Text className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
            Codigo Source Workspace
          </Text>
          <Title level={2} className="!mb-0">
            真实源码模板
          </Title>
          <Text className="text-sm text-slate-600">
            这里是 OpenSumi 加载的真实工作区入口，后续会由服务端把页面 Schema
            写入 schema.json，也可以直接在这个模板里扩展 React 代码。
          </Text>
        </header>

        <Alert
          type="info"
          showIcon
          message="模板已就绪"
          description="后续只需要把工作区复制出来并覆盖 schema.json，就能在 WebIDE 中编辑和运行真实页面。"
        />

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="codigo-page flex min-h-[480px] flex-col gap-4">
            {schema.map((component, index) => (
              <LowCodeRenderer
                key={component.id ?? `${component.type}-${index}`}
                component={component}
              />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
