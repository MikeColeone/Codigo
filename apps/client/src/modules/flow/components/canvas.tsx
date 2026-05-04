import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import type { ActionConfig } from "@codigo/schema";
import {
  ActionConfigFields,
  ActionTypeOptions,
} from "@/modules/editor/components/right-panel/action-list-editor";
import { NODE_COLORS, NODE_TYPES } from "../constants";
import { flowStore } from "../stores/flow-store";
import type { FlowEdge, FlowNode } from "../types";

interface HandleInteractionState {
  sourceId: string;
  startClientX: number;
  startClientY: number;
  curX: number;
  curY: number;
  isDragging: boolean;
}

interface NodeDragState {
  nodeId: string;
  offsetX: number;
  offsetY: number;
}

interface ActionMenuState {
  sourceId: string;
  x: number;
  y: number;
}

/**
 * 读取节点顶部中心点，用于绘制纵向连线。
 */
function getNodeTop(node: FlowNode) {
  const meta = NODE_TYPES[node.type];
  return {
    x: node.x + meta.w / 2,
    y: node.y,
  };
}

/**
 * 读取节点底部中心点，用于绘制纵向连线。
 */
function getNodeBottom(node: FlowNode) {
  const meta = NODE_TYPES[node.type];
  return {
    x: node.x + meta.w / 2,
    y: node.y + meta.h,
  };
}

/**
 * 根据起止点生成平滑曲线路径。
 */
function buildCurvePath(
  start: { x: number; y: number },
  end: { x: number; y: number },
) {
  const controlOffset = Math.max(36, Math.abs(end.y - start.y) * 0.4);
  return `M${start.x},${start.y} C${start.x},${start.y + controlOffset} ${end.x},${end.y - controlOffset} ${end.x},${end.y}`;
}

function Canvas() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [handleState, setHandleState] = useState<HandleInteractionState | null>(
    null,
  );
  const [dragState, setDragState] = useState<NodeDragState | null>(null);
  const [actionMenuState, setActionMenuState] = useState<ActionMenuState | null>(
    null,
  );

  /**
   * 将鼠标坐标转换为画布内坐标。
   */
  function toCanvasPoint(clientX: number, clientY: number) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) {
      return { x: 0, y: 0 };
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  /**
   * 开始从节点尾部连接点创建下一步。
   */
  function startCreateNext(e: React.MouseEvent, nodeId: string) {
    e.stopPropagation();
    const point = toCanvasPoint(e.clientX, e.clientY);
    flowStore.selectedNodeId = nodeId;
    flowStore.selectedEdgeId = null;
    setHandleState({
      sourceId: nodeId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      curX: point.x,
      curY: point.y,
      isDragging: false,
    });
  }

  /**
   * 更新节点展示字段。
   */
  function createFallbackAction(node: FlowNode): ActionConfig {
    if (node.type === "notify") {
      return {
        type: "toast",
        message: String(node.props.message ?? ""),
        variant: (node.props.level as ActionConfig["type"]) ? undefined : "success",
      } as ActionConfig;
    }
    if (node.type === "condition") {
      return {
        type: "when",
        key: String(node.props.key ?? "activePanel"),
        op: "eq",
        value: node.props.expr ?? "",
      };
    }
    return {
      type: "setState",
      key: String(node.props.key ?? "activePanel"),
      value: node.props.desc ?? "overview",
    };
  }

  /**
   * 开始拖拽节点。
   */
  function startNodeDrag(event: React.MouseEvent, node: FlowNode) {
    event.stopPropagation();
    const point = toCanvasPoint(event.clientX, event.clientY);
    flowStore.selectedNodeId = node.id;
    flowStore.selectedEdgeId = null;
    setDragState({
      nodeId: node.id,
      offsetX: point.x - node.x,
      offsetY: point.y - node.y,
    });
  }

  /**
   * 渲染动作节点的配置表单。
   */
  function renderActionBody(node: FlowNode) {
    const action = node.action ?? createFallbackAction(node);
    return (
      <ActionConfigFields
        action={action}
        onChange={(nextAction) => flowStore.updateNodeAction(node.id, nextAction)}
        pageOptions={flowStore.pageOptions}
      />
    );
  }

  /**
   * 渲染单个节点卡片。
   */
  function renderNode(node: FlowNode, index: number) {
    const meta = NODE_TYPES[node.type];
    const color = NODE_COLORS[node.type];
    const isSelected = flowStore.selectedNodeId === node.id;
    const isTerminal = node.type === "end";
    const isActionNode = node.type !== "start" && node.type !== "end";

    return (
      <div
        key={node.id}
        className="group absolute z-10"
        style={{
          left: node.x,
          top: node.y,
          width: meta.w,
          height: meta.h,
        }}
      >
        <div
          className={`relative h-full w-full transition-all ${
            meta.shape === "pill"
              ? "flex items-center justify-center rounded-full border text-sm font-semibold shadow-sm"
              : "rounded-2xl border bg-white shadow-[0_18px_48px_rgba(15,23,42,0.08)]"
          } ${isSelected ? "shadow-[0_0_0_4px_rgba(99,102,241,0.12)]" : ""}`}
          style={{
            background: meta.shape === "pill" ? color.bg : "#ffffff",
            borderColor: isSelected ? "#6366f1" : color.border,
            color: color.text,
          }}
          onClick={(e) => {
            e.stopPropagation();
            flowStore.selectedNodeId = node.id;
            flowStore.selectedEdgeId = null;
          }}
          onMouseDown={
            isActionNode
              ? undefined
              : (event) => startNodeDrag(event, node)
          }
        >
          {isActionNode ? (
            <div className="flex h-full flex-col">
              <div
                className="flex cursor-move items-center justify-between border-b border-zinc-100 px-4 py-3"
                onMouseDown={(event) => startNodeDrag(event, node)}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-100 px-1 text-[10px] font-semibold text-zinc-500">
                    {index}
                  </span>
                  <input
                    value={node.label}
                    className="min-w-0 bg-transparent text-[14px] font-semibold text-zinc-800 outline-none"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      flowStore.selectedNodeId = node.id;
                      flowStore.selectedEdgeId = null;
                      node.label = e.target.value;
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    flowStore.selectedNodeId = node.id;
                    flowStore.selectedEdgeId = null;
                    flowStore.removeSelected();
                  }}
                  aria-label="删除节点"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 space-y-3 px-4 py-4">
                {renderActionBody(node)}
              </div>
            </div>
          ) : (
            <span>{node.label}</span>
          )}
        </div>

        {!isTerminal ? (
          <div className="pointer-events-none absolute bottom-[-32px] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1">
            <span className="text-[11px] text-zinc-400 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              下一步
            </span>
            <button
              type="button"
              className="pointer-events-auto flex h-6 w-6 items-center justify-center rounded-full border border-white bg-indigo-500 text-sm text-white opacity-0 shadow-lg transition-all duration-150 group-hover:opacity-100 hover:scale-110"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => startCreateNext(e, node.id)}
              title="点击或拖拽新建下一步"
            >
              +
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  useEffect(() => {
    if (!handleState) {
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      const point = toCanvasPoint(e.clientX, e.clientY);
      const distance = Math.hypot(
        e.clientX - handleState.startClientX,
        e.clientY - handleState.startClientY,
      );

      setHandleState((current) =>
        current
          ? {
              ...current,
              curX: point.x,
              curY: point.y,
              isDragging: current.isDragging || distance > 6,
            }
          : current,
      );
    };

    const onMouseUp = () => {
      setActionMenuState({
        sourceId: handleState.sourceId,
        x: handleState.curX,
        y: handleState.curY,
      });
      setHandleState(null);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [handleState]);

  useEffect(() => {
    if (!dragState) {
      return;
    }

    const onMouseMove = (event: MouseEvent) => {
      const point = toCanvasPoint(event.clientX, event.clientY);
      flowStore.updateNodePos(
        dragState.nodeId,
        point.x - dragState.offsetX,
        point.y - dragState.offsetY,
      );
    };

    const onMouseUp = () => {
      setDragState(null);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragState]);

  return (
    <div className="relative flex flex-1 overflow-auto bg-slate-100/60 p-8">
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
      <div className="absolute left-1/2 top-12 h-[480px] w-[420px] -translate-x-1/2 rounded-full bg-indigo-400/10 blur-3xl" />
      <div className="relative z-10 min-h-[720px] min-w-[720px] flex-1 rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div
          className="relative h-full w-full overflow-auto rounded-2xl"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(148,163,184,0.22) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
          onClick={() => {
            flowStore.selectedNodeId = "";
            flowStore.selectedEdgeId = null;
            setActionMenuState(null);
          }}
        >
          <svg
            ref={svgRef}
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            <defs>
              <marker
                id="flow-arr"
                viewBox="0 0 8 8"
                refX="4"
                refY="4"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M 0 0 L 8 4 L 0 8 z" fill="#cbd5e1" />
              </marker>
              <marker
                id="flow-arr-sel"
                viewBox="0 0 8 8"
                refX="4"
                refY="4"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M 0 0 L 8 4 L 0 8 z" fill="#6366f1" />
              </marker>
            </defs>

            {flowStore.edges.map((edge: FlowEdge) => {
              const source = flowStore.nodes.find((node) => node.id === edge.source);
              const target = flowStore.nodes.find((node) => node.id === edge.target);
              if (!source || !target) {
                return null;
              }
              const start = getNodeBottom(source);
              const end = getNodeTop(target);
              const path = buildCurvePath(start, end);
              const selected = flowStore.selectedEdgeId === edge.id;
              return (
                <g
                  key={edge.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    flowStore.selectedEdgeId = edge.id;
                    flowStore.selectedNodeId = "";
                  }}
                >
                  <path
                    d={path}
                    fill="none"
                    stroke={selected ? "#6366f1" : "#cbd5e1"}
                    strokeWidth={selected ? "2" : "1.5"}
                    markerEnd={selected ? "url(#flow-arr-sel)" : "url(#flow-arr)"}
                    style={{ cursor: "pointer" }}
                  />
                  <path
                    d={path}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="12"
                    style={{ cursor: "pointer" }}
                  />
                </g>
              );
            })}

            {handleState ? (
              <path
                d={buildCurvePath(
                  getNodeBottom(
                    flowStore.nodes.find((node) => node.id === handleState.sourceId)!,
                  ),
                  { x: handleState.curX, y: handleState.curY },
                )}
                fill="none"
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
            ) : null}
          </svg>

          <div className="relative min-h-[920px]">
            {flowStore.getOrderedNodeIds().map((nodeId, index) => {
              const node = flowStore.nodes.find((item) => item.id === nodeId);
              return node ? renderNode(node, index) : null;
            })}
            {actionMenuState ? (
              <div
                className="absolute z-30 w-[220px] rounded-xl border border-slate-200 bg-white p-2 shadow-2xl"
                style={{
                  left: Math.max(24, actionMenuState.x + 12),
                  top: Math.max(24, actionMenuState.y - 12),
                }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-500">
                  选择下一步动作
                </div>
                <div className="mt-1 space-y-1">
                  {ActionTypeOptions.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-[12px] text-slate-700 transition-colors hover:bg-slate-50"
                      onClick={() => {
                        flowStore.insertNodeAfter(actionMenuState.sourceId, item.value);
                        setActionMenuState(null);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

const CanvasComponent = observer(Canvas);

export { CanvasComponent as Canvas };
