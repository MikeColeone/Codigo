import { observer } from "mobx-react-lite";
import { Select } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { flowStore } from "../stores/flow-store";

function Toolbar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const context = flowStore.context;

  function handleBackToEditor() {
    const next = new URLSearchParams(searchParams);
    next.set("panel", "events");
    if (context?.componentId) {
      next.set("componentId", context.componentId);
    }
    if (context?.eventName) {
      next.set("eventName", context.eventName);
    }
    navigate({
      pathname: "/editor",
      search: next.toString(),
    });
  }

  function handleEventChange(eventName: string) {
    const next = new URLSearchParams(searchParams);
    next.set("eventName", eventName);
    navigate(
      {
        pathname: "/flow",
        search: next.toString(),
      },
      { replace: true },
    );
  }

  return (
    <div className="flex min-h-12 items-center justify-between gap-3 border-b border-slate-200 bg-white/60 backdrop-blur-md px-4 py-2 relative z-10">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={handleBackToEditor}
          className="rounded-md border border-slate-200 bg-white px-3 py-1 text-[12px] text-slate-700 transition-colors hover:bg-slate-50"
        >
          返回画布
        </button>
        <span className="h-4 w-px bg-zinc-200" />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-900">
            {context ? `${context.componentLabel} / ${context.eventName}` : "事件编排"}
          </div>
          <div className="text-[11px] text-zinc-500">
            {flowStore.nodes.length} 节点 · {flowStore.edges.length} 连线
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {flowStore.eventOptions.length ? (
          <Select
            size="small"
            value={context?.eventName}
            options={flowStore.eventOptions.map((item) => ({
              label: `${item.title} (${item.name})`,
              value: item.name,
            }))}
            onChange={handleEventChange}
            className="min-w-[220px]"
          />
        ) : null}
        <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] text-indigo-600">
          返回时会保留当前组件与事件
        </span>
        <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] text-indigo-600">
          悬浮节点底部小点可创建下一步
        </span>
        <span className="text-[11px] text-zinc-500">
          {flowStore.nodes.length} 节点 · {flowStore.edges.length} 连线
        </span>
        {flowStore.canRemoveSelection && (
          <button
            className="h-7 rounded-md border border-red-200 bg-red-50 px-2.5 text-xs text-red-600 transition-colors hover:bg-red-100"
            onClick={() => flowStore.removeSelected()}
          >
            删除
          </button>
        )}
      </div>
    </div>
  );
}

const ToolbarComponent = observer(Toolbar);

export { ToolbarComponent as Toolbar };
