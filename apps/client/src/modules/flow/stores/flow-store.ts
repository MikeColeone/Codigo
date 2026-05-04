import type { ActionConfig, ComponentEventName } from "@codigo/schema";
import { makeAutoObservable } from "mobx";
import { NODE_TYPES } from "../constants";
import type { FlowContext, FlowEdge, FlowNode, NodeType } from "../types";

function genId(p: string = "e"): string {
  return `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

class FlowStore {
  nodes: FlowNode[] = [];
  edges: FlowEdge[] = [];

  selectedNodeId: string = "";
  selectedEdgeId: string | null = null;

  context: FlowContext | null = null;
  eventOptions: Array<{ name: ComponentEventName; title: string }> = [];
  pageOptions: Array<{ label: string; value: string }> = [];
  pendingInsertSourceId: string | null = null;
  private onActionsChange: ((actions: ActionConfig[]) => void) | null = null;

  constructor() {
    makeAutoObservable(this);
    this.resetGraph();
  }

  /* 计算属性：选中节点 */
  get selectedNode(): FlowNode | undefined {
    return this.nodes.find((n) => n.id === this.selectedNodeId);
  }

  /* 计算属性：选中边 */
  get selectedEdge(): FlowEdge | undefined {
    return this.edges.find((e) => e.id === this.selectedEdgeId);
  }

  /* 计算属性：当前选中内容是否允许删除 */
  get canRemoveSelection(): boolean {
    if (this.selectedEdgeId) {
      return true;
    }
    return Boolean(
      this.selectedNode &&
        this.selectedNode.type !== "start" &&
        this.selectedNode.type !== "end",
    );
  }

  /**
   * 将当前 Flow 绑定到组件事件上下文。
   */
  setContext(options: {
    context: FlowContext;
    eventOptions: Array<{ name: ComponentEventName; title: string }>;
    pageOptions: Array<{ label: string; value: string }>;
    actions: ActionConfig[];
    onActionsChange: (actions: ActionConfig[]) => void;
  }): void {
    this.context = options.context;
    this.eventOptions = options.eventOptions;
    this.pageOptions = options.pageOptions;
    this.onActionsChange = options.onActionsChange;
    this.loadFromActions(options.actions);
  }

  /**
   * 清除当前 Flow 与组件事件的绑定。
   */
  clearContext(): void {
    this.context = null;
    this.eventOptions = [];
    this.pageOptions = [];
    this.pendingInsertSourceId = null;
    this.onActionsChange = null;
    this.resetGraph();
  }

  /**
   * 返回当前动作节点列表。
   */
  get actionNodes(): FlowNode[] {
    return this.getOrderedNodeIds()
      .map((nodeId) => this.nodes.find((node) => node.id === nodeId) ?? null)
      .filter((node): node is FlowNode => Boolean(node && node.type !== "start" && node.type !== "end"));
  }

  /**
   * 根据动作类型返回展示文案。
   */
  private getActionTypeLabel(type: ActionConfig["type"]): string {
    const labelMap: Record<ActionConfig["type"], string> = {
      setState: "设置状态",
      setActiveContainer: "控制组件",
      navigate: "打开页面",
      openUrl: "打开链接",
      scrollTo: "滚动定位",
      toast: "消息提醒",
      confirm: "确认弹窗",
      when: "条件分支",
      request: "调用请求",
    };
    return labelMap[type] ?? type;
  }

  /**
   * 创建指定动作类型的默认配置。
   */
  private createDefaultAction(type: ActionConfig["type"]): ActionConfig {
    switch (type) {
      case "setActiveContainer":
        return { type, viewGroupId: "", containerId: "" };
      case "navigate":
        return { type, path: "page:home" };
      case "openUrl":
        return { type, url: "https://example.com", target: "_blank" };
      case "scrollTo":
        return { type, targetId: "section-overview" };
      case "toast":
        return { type, message: "操作成功", variant: "success" };
      case "confirm":
        return { type, message: "确认执行该操作？" };
      case "when":
        return { type, key: "activePanel", op: "eq", value: "overview" };
      case "request":
        return {
          type,
          method: "GET",
          url: "/api/health",
          saveToStateKey: "lastResponse",
          responsePath: "",
        };
      default:
        return { type: "setState", key: "activePanel", value: "overview" };
    }
  }

  /**
   * 根据动作配置推导节点类型。
   */
  private getNodeTypeByAction(action: ActionConfig): Exclude<NodeType, "start" | "end"> {
    if (action.type === "toast") {
      return "notify";
    }
    if (action.type === "when") {
      return "condition";
    }
    return "process";
  }

  /**
   * 根据动作生成节点。
   */
  private createNodeFromAction(action: ActionConfig): FlowNode {
    const type = this.getNodeTypeByAction(action);
    const count = this.nodes.filter((node) => node.type === type).length + 1;
    return {
      id: genId(type),
      type,
      label: `${this.getActionTypeLabel(action.type)} ${count}`,
      x: 0,
      y: 0,
      props: {},
      action,
    };
  }

  /**
   * 重置为最小事件流。
   */
  resetGraph(): void {
    this.nodes = [
      {
        id: "start_1",
        type: "start",
        label: "开始",
        x: 0,
        y: 0,
        props: {},
      },
      { id: "end_1", type: "end", label: "结束", x: 0, y: 0, props: {} },
    ];
    this.edges = [{ id: genId(), source: "start_1", target: "end_1", label: "" }];
    this.selectedNodeId = "";
    this.selectedEdgeId = null;
    this.layoutSequentialNodes();
  }

  /**
   * 从动作数组构建当前事件流。
   */
  loadFromActions(actions: ActionConfig[]): void {
    const actionNodes = actions.map((action) => this.createNodeFromAction(action));
    this.nodes = [
      {
        id: "start_1",
        type: "start",
        label: "开始",
        x: 0,
        y: 0,
        props: {},
      },
      ...actionNodes,
      { id: "end_1", type: "end", label: "结束", x: 0, y: 0, props: {} },
    ];

    const orderedIds = this.nodes.map((node) => node.id);
    this.edges = orderedIds.slice(0, -1).map((source, index) => ({
      id: genId(),
      source,
      target: orderedIds[index + 1],
      label: "",
    }));
    this.selectedNodeId = "";
    this.selectedEdgeId = null;
    this.layoutSequentialNodes();
  }

  /**
   * 将当前主链路回写为动作数组。
   */
  serializeActions(): ActionConfig[] {
    return this.actionNodes
      .map((node) => node.action)
      .filter((action): action is ActionConfig => Boolean(action));
  }

  /**
   * 将当前节点变化同步到组件事件。
   */
  private syncActions(): void {
    if (!this.onActionsChange) {
      return;
    }
    this.onActionsChange(this.serializeActions());
  }

  /**
   * 获取主链路的排序节点编号，优先从开始节点向后遍历。
   */
  getOrderedNodeIds(): string[] {
    const ordered: string[] = [];
    const visited = new Set<string>();
    let cursor: FlowNode | null =
      this.nodes.find((node) => node.type === "start") ?? this.nodes[0] ?? null;

    while (cursor && !visited.has(cursor.id)) {
      ordered.push(cursor.id);
      visited.add(cursor.id);
      const nextEdge = this.edges.find((edge) => edge.source === cursor?.id);
      cursor = nextEdge
        ? this.nodes.find((node) => node.id === nextEdge.target) ?? null
        : null;
    }

    this.nodes.forEach((node) => {
      if (!visited.has(node.id)) {
        ordered.push(node.id);
      }
    });

    return ordered;
  }

  /**
   * 将当前节点按纵向步骤流自动排布。
   */
  layoutSequentialNodes(): void {
    const laneCenterX = 280;
    const startY = 56;
    const gapY = 40;
    let cursorY = startY;

    this.getOrderedNodeIds().forEach((nodeId) => {
      const node = this.nodes.find((item) => item.id === nodeId);
      if (!node) {
        return;
      }
      const meta = NODE_TYPES[node.type];
      node.x = laneCenterX - meta.w / 2;
      node.y = cursorY;
      cursorY += meta.h + gapY;
    });
  }

  /**
   * 读取指定节点的首条后继连线。
   */
  private getNextEdge(sourceId: string): FlowEdge | undefined {
    return this.edges.find((edge) => edge.source === sourceId);
  }

  /**
   * 读取指定节点的首条前驱连线。
   */
  private getPreviousEdge(targetId: string): FlowEdge | undefined {
    return this.edges.find((edge) => edge.target === targetId);
  }

  /**
   * 删除一条连线。
   */
  private removeEdge(edgeId: string): void {
    const index = this.edges.findIndex((edge) => edge.id === edgeId);
    if (index > -1) {
      this.edges.splice(index, 1);
    }
  }

  addNode(type: NodeType, label: string, x: number, y: number): void {
    const node: FlowNode = {
      id: genId(type),
      type,
      label,
      x,
      y,
      props: {},
    };

    this.nodes.push(node);

    this.selectedNodeId = node.id;
    this.selectedEdgeId = null;
  }

  /**
   * 在指定节点后插入一个默认动作节点，并自动接回原有后继。
   */
  insertNodeAfter(sourceId: string, actionType: ActionConfig["type"] = "toast"): void {
    const source = this.nodes.find((node) => node.id === sourceId);
    if (!source || source.type === "end") {
      return;
    }

    const nextEdge = this.getNextEdge(sourceId);
    const newNode = this.createNodeFromAction(this.createDefaultAction(actionType));
    this.nodes.push(newNode);

    if (nextEdge) {
      this.removeEdge(nextEdge.id);
      this.addEdge(newNode.id, nextEdge.target);
    }

    this.addEdge(sourceId, newNode.id);
    this.selectedNodeId = newNode.id;
    this.selectedEdgeId = null;
    this.layoutSequentialNodes();
    this.syncActions();
  }

  updateNodePos(id: string, x: number, y: number): void {
    const n = this.nodes.find((n) => n.id === id);

    if (n) {
      n.x = Math.max(0, x);
      n.y = Math.max(0, y);
    }
  }

  addEdge(sourceId: string, targetId: string): void {
    const exists = this.edges.some(
      (e) => e.source === sourceId && e.target === targetId,
    );

    if (!exists) {
      this.edges.push({
        id: genId(),
        source: sourceId,
        target: targetId,
        label: "",
      });
    }
  }

  /**
   * 更新当前节点对应的动作配置。
   */
  updateNodeAction(id: string, nextAction: ActionConfig): void {
    const node = this.nodes.find((item) => item.id === id);
    if (!node || node.type === "start" || node.type === "end") {
      return;
    }
    node.type = this.getNodeTypeByAction(nextAction);
    node.label = this.getActionTypeLabel(nextAction.type);
    node.action = nextAction;
    this.layoutSequentialNodes();
    this.syncActions();
  }

  /**
   * 更新节点类型，并重置为该类型的默认属性。
   */
  updateNodeType(id: string, type: Extract<NodeType, "process" | "condition" | "notify">): void {
    const fallbackActionType =
      type === "notify" ? "toast" : type === "condition" ? "when" : "setState";
    this.updateNodeAction(id, this.createDefaultAction(fallbackActionType));
  }

  removeSelected(): void {
    if (this.selectedNodeId) {
      const selectedNode = this.nodes.find((node) => node.id === this.selectedNodeId);
      if (!selectedNode || selectedNode.type === "start" || selectedNode.type === "end") {
        return;
      }
      const previousEdge = this.getPreviousEdge(this.selectedNodeId);
      const nextEdge = this.getNextEdge(this.selectedNodeId);
      const idx = this.nodes.findIndex((n) => n.id === this.selectedNodeId);

      if (idx > -1) {
        this.nodes.splice(idx, 1);
      }

      this.edges = this.edges.filter(
        (edge) =>
          edge.source !== this.selectedNodeId && edge.target !== this.selectedNodeId,
      );

      if (previousEdge && nextEdge) {
        this.addEdge(previousEdge.source, nextEdge.target);
      }

      this.selectedNodeId = "";
      this.layoutSequentialNodes();
      this.syncActions();
    }

    if (this.selectedEdgeId) {
      this.removeEdge(this.selectedEdgeId);
      this.selectedEdgeId = null;
    }
  }
}

export const flowStore = new FlowStore();







