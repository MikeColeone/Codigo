import { observer } from "mobx-react-lite";
import { flowStore } from "../stores/flow-store";
import { NODE_TYPES, NODE_COLORS } from "../constants";

function PropsPanel() {
  return (
    <aside className="flex w-[220px] flex-shrink-0 flex-col border-l border-zinc-200 bg-white">
      <div className="flex h-[38px] flex-shrink-0 items-center border-b border-zinc-200 bg-zinc-50 px-[14px] text-[11px] font-semibold uppercase tracking-[0.07em] text-zinc-600">
        属性
      </div>
      {!flowStore.selectedNode && !flowStore.selectedEdge && (
        <div className="px-5 py-12 text-center text-sm text-zinc-500">
          <p>点击节点或连线</p>
          <p className="mt-3">悬浮节点底部小点</p>
          <p>可点击或拖拽新增并发任务</p>
        </div>
      )}
      {flowStore.selectedNode && (
        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-zinc-200 px-[14px] pb-2 pt-3">
            <div
              className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.07em]"
              style={{
                color: NODE_COLORS[flowStore.selectedNode.type].text,
              }}
            >
              {NODE_TYPES[flowStore.selectedNode.type].label}
            </div>
            <div className="mb-2 flex items-center gap-2">
              <label className="min-w-12 flex-shrink-0 whitespace-nowrap text-[11px] text-zinc-600">
                名称
              </label>
              <input
                className="h-8 flex-1 rounded-md border border-zinc-200 px-2 text-xs outline-none focus:border-zinc-400"
                value={flowStore.selectedNode.label}
                onChange={(e) => {
                  if (flowStore.selectedNode) {
                    flowStore.selectedNode.label = e.target.value;
                  }
                }}
              />
            </div>
            {flowStore.selectedNode.type !== "start" ? (
              <div className="mb-2 flex items-center gap-2">
                <label className="min-w-12 flex-shrink-0 whitespace-nowrap text-[11px] text-zinc-600">
                  类型
                </label>
                <select
                  className="h-8 flex-1 rounded-md border border-zinc-200 px-2 text-xs outline-none focus:border-zinc-400"
                  value={flowStore.selectedNode.type}
                  onChange={(e) =>
                    flowStore.updateNodeType(
                      flowStore.selectedNode!.id,
                      e.target.value as "process" | "condition" | "notify",
                    )
                  }
                >
                  <option value="process">动作</option>
                  <option value="condition">条件判断</option>
                  <option value="notify">消息提醒</option>
                </select>
              </div>
            ) : null}
            {flowStore.selectedNode.type === "process" && (
              <div className="mb-2 flex items-center gap-2">
                <label className="min-w-12 flex-shrink-0 whitespace-nowrap text-[11px] text-zinc-600">
                  描述
                </label>
                <input
                  className="h-8 flex-1 rounded-md border border-zinc-200 px-2 text-xs outline-none focus:border-zinc-400"
                  value={
                    (flowStore.selectedNode.props.desc ?? "") as string
                  }
                  placeholder="例如：setState / navigate / openUrl"
                  onChange={(e) => {
                    if (flowStore.selectedNode) {
                      flowStore.selectedNode.props.desc = e.target.value;
                    }
                  }}
                />
              </div>
            )}
            {flowStore.selectedNode.type === "condition" && (
              <div className="mb-2 flex items-center gap-2">
                <label className="min-w-12 flex-shrink-0 whitespace-nowrap text-[11px] text-zinc-600">
                  表达式
                </label>
                <input
                  className="h-8 flex-1 rounded-md border border-zinc-200 px-2 text-xs font-mono outline-none focus:border-zinc-400"
                  value={(flowStore.selectedNode.props.expr ?? "") as string}
                  placeholder="x > 1000"
                  onChange={(e) => {
                    if (flowStore.selectedNode) {
                      flowStore.selectedNode.props.expr = e.target.value;
                    }
                  }}
                />
              </div>
            )}
            {flowStore.selectedNode.type === "notify" && (
              <>
                <div className="mb-2 flex items-center gap-2">
                  <label className="min-w-12 flex-shrink-0 whitespace-nowrap text-[11px] text-zinc-600">
                    级别
                  </label>
                  <select
                    className="h-8 flex-1 rounded-md border border-zinc-200 px-2 text-xs outline-none focus:border-zinc-400"
                    value={(flowStore.selectedNode.props.level ?? "success") as string}
                    onChange={(e) => {
                      if (flowStore.selectedNode) {
                        flowStore.selectedNode.props.level = e.target.value;
                      }
                    }}
                  >
                    <option value="success">成功</option>
                    <option value="info">信息</option>
                    <option value="warning">警告</option>
                    <option value="error">错误</option>
                  </select>
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <label className="min-w-12 flex-shrink-0 whitespace-nowrap text-[11px] text-zinc-600">
                    消息内容
                  </label>
                  <input
                    className="h-8 flex-1 rounded-md border border-zinc-200 px-2 text-xs outline-none focus:border-zinc-400"
                    value={(flowStore.selectedNode.props.message ?? "") as string}
                    onChange={(e) => {
                      if (flowStore.selectedNode) {
                        flowStore.selectedNode.props.message = e.target.value;
                      }
                    }}
                  />
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <label className="min-w-12 flex-shrink-0 whitespace-nowrap text-[11px] text-zinc-600">
                    时长
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="h-8 flex-1 rounded-md border border-zinc-200 px-2 text-xs outline-none focus:border-zinc-400"
                    value={(flowStore.selectedNode.props.duration ?? 3) as number}
                    onChange={(e) => {
                      if (flowStore.selectedNode) {
                        flowStore.selectedNode.props.duration =
                          Number.parseInt(e.target.value || "0", 10) || 1;
                      }
                    }}
                  />
                </div>
              </>
            )}
            <div className="mb-2 flex items-center gap-2">
              <label className="min-w-12 flex-shrink-0 whitespace-nowrap text-[11px] text-zinc-600">
                ID
              </label>
              <span className="text-[10px] text-zinc-400">
                {flowStore.selectedNode.id}
              </span>
            </div>
          </div>
          {flowStore.canRemoveSelection ? (
            <div className="p-[14px]">
              <button
                className="h-8 w-full rounded-md border border-red-200 bg-red-50 px-2.5 text-xs text-red-600 transition-colors hover:bg-red-100"
                onClick={() => flowStore.removeSelected()}
              >
                删除节点
              </button>
            </div>
          ) : null}
        </div>
      )}
      {flowStore.selectedEdge && (
        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-zinc-200 px-[14px] pb-2 pt-3">
            <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-zinc-500">
              连线
            </div>
            <div className="mb-2 flex items-center gap-2">
              <label className="min-w-12 flex-shrink-0 whitespace-nowrap text-[11px] text-zinc-600">
                标签
              </label>
              <input
                className="h-8 flex-1 rounded-md border border-zinc-200 px-2 text-xs outline-none focus:border-zinc-400"
                value={flowStore.selectedEdge.label}
                placeholder="（可选）"
                onChange={(e) => {
                  if (flowStore.selectedEdge) {
                    flowStore.selectedEdge.label = e.target.value;
                  }
                }}
              />
            </div>
            <div className="mb-2 flex items-center gap-2">
              <label className="min-w-12 flex-shrink-0 whitespace-nowrap text-[11px] text-zinc-600">
                来源
              </label>
              <span className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-600">
                {
                  flowStore.nodes.find(
                    (n) => n.id === flowStore.selectedEdge?.source,
                  )?.label
                }
              </span>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <label className="min-w-12 flex-shrink-0 whitespace-nowrap text-[11px] text-zinc-600">
                目标
              </label>
              <span className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-600">
                {
                  flowStore.nodes.find(
                    (n) => n.id === flowStore.selectedEdge?.target,
                  )?.label
                }
              </span>
            </div>
          </div>
          <div className="p-[14px]">
            <button
              className="h-8 w-full rounded-md border border-red-200 bg-red-50 px-2.5 text-xs text-red-600 transition-colors hover:bg-red-100"
              onClick={() => flowStore.removeSelected()}
            >
              删除连线
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

const PropsPanelComponent = observer(PropsPanel);

export { PropsPanelComponent as PropsPanel };
