import { CaretLeftOutlined } from "@ant-design/icons";
import { useRequest } from "ahooks";
import { Empty, FloatButton, QRCode, Result, Spin } from "antd";
import type { ComponentNode } from "@codigo/schema";
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPublishedPage } from "@/modules/editor/api/low-code";
import { generateComponent } from "@/modules/editor/components/canvas";

function resolveSchemaFromReleasePayload(
  payload: Record<string, any> | null | undefined,
) {
  if (!payload) {
    return {
      version: 2,
      components: [] as ComponentNode[],
    };
  }

  if (payload.schema?.components?.length) {
    return {
      version: payload.schema.version ?? 2,
      components: payload.schema.components as ComponentNode[],
    };
  }

  const components = Array.isArray(payload.components)
    ? payload.components.map((component: Record<string, any>) => ({
        id: component.node_id ?? String(component.id),
        type: component.type,
        props: component.options ?? {},
        styles: component.styles,
        children: [],
      }))
    : [];

  return {
    version: payload.schema_version ?? 1,
    components,
  };
}

function ReleaseCanvas({ nodes }: { nodes: ComponentNode[] }) {
  if (!nodes.length) {
    return (
      <Empty
        description="当前发布页暂无可展示内容"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div
      className="relative"
      style={{
        minHeight: `${Math.max(700, nodes.length * 220)}px`,
      }}
    >
      {nodes.map(function renderTreeNode(node: ComponentNode) {
        const renderedChildren =
          node.children?.map((child) => renderTreeNode(child)) ?? [];

        return (
          <div
            key={node.id}
            className="absolute"
            style={{
              left: node.styles?.left as string | number | undefined,
              top: node.styles?.top as string | number | undefined,
            }}
          >
            <div className="relative">
              {generateComponent(node, undefined, renderedChildren)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Release() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const pageId = Number(searchParams.get("id"));

  const { data, loading, error } = useRequest(
    async () => {
      const res = await getPublishedPage(pageId);
      return res.data;
    },
    {
      ready: Number.isFinite(pageId) && pageId > 0,
    },
  );

  const schema = useMemo(
    () => resolveSchemaFromReleasePayload(data),
    [data],
  );

  const previewUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return window.location.href;
  }, [pageId]);

  const content = (() => {
    if (!pageId) {
      return (
        <Result
          status="warning"
          title="缺少页面编号"
          subTitle="当前链接没有携带可预览的发布页 id"
        />
      );
    }

    if (loading) {
      return (
        <div className="flex h-full items-center justify-center">
          <Spin size="large" />
        </div>
      );
    }

    if (error) {
      return (
        <Result
          status="error"
          title="发布页加载失败"
          subTitle="未能读取已发布内容，请确认页面已成功发布后重试"
        />
      );
    }

    return <ReleaseCanvas nodes={schema.components} />;
  })();

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
        <section className="order-2 w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:order-1">
          <h1 className="text-xl font-semibold text-slate-900">发布预览</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            发布后会直接读取服务端保存的页面数据，因此这里展示的是线上可访问的内容，而不是本地草稿。
          </p>
          <div className="mt-6 flex justify-center rounded-3xl bg-slate-50 p-5">
            <QRCode value={previewUrl || "about:blank"} />
          </div>
          <p className="mt-4 text-center text-sm text-slate-500">
            扫码后可在当前地址打开发布页
          </p>
          {data?.page_name ? (
            <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <div className="font-medium text-slate-900">{data.page_name}</div>
              <div className="mt-2 leading-6 text-slate-500">
                {data.desc || "当前页面已发布"}
              </div>
            </div>
          ) : null}
        </section>

        <section className="order-1 flex w-full justify-center lg:order-2 lg:flex-1">
          <div className="h-[700px] w-[380px] overflow-y-auto overflow-x-hidden rounded-[30px] border-[8px] border-slate-800 bg-white text-left shadow-2xl">
            {content}
          </div>
        </section>

        <div className="hidden w-full max-w-sm lg:order-3 lg:block" />
      </div>

      <FloatButton icon={<CaretLeftOutlined />} onClick={() => nav(-1)} />
    </div>
  );
}











