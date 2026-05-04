import { makeAutoObservable, toJS } from "mobx";
import { trackUndo } from "mobx-shallow-undo";
import { NODE_TYPES } from "../constants";
import type { FlowEdge, FlowNode, NodeType } from "../types";

function genId(p: string = "e"): string {
  return `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

class FlowStore {
  // 节点
  nodes: FlowNode[] = [
    {
      id: "start_1",
      type: "start",
      label: "开始",
      x: 0,
      y: 0,
      props: {},
    },
    {
      id: "notify_1",
      type: "notify",
      label: "消息提醒 1",
      x: 0,
      y: 0,
      props: {
        level: "success",
        message: "操作成功",
        duration: 3,
      },
    },
    { id: "end_1", type: "end", label: "结束", x: 0, y: 0, props: {} },
  ];

  // 边
  edges: FlowEdge[] = [
    { id: genId(), source: "start_1", target: "notify_1", label: "" },
    { id: genId(), source: "notify_1", target: "end_1", label: "" },
  ];

  selectedNodeId: string = "";
  selectedEdgeId: string | null = null;

  undoer: any;

  constructor() {
    makeAutoObservable(this);
    this.undoer = trackUndo(
      () => ({ nodes: toJS(this.nodes), edges: toJS(this.edges) }),
      (value) => {
        this.nodes = value.nodes;
        this.edges = value.edges;
      },
    );
    this.layoutSequentialNodes();
  }

  /* 计算属性：选中节点 */
  get selectedNode(): FlowNode | undefined {
    return this.nodes.find((n) => n.id === this.selectedNodeId);
  }

  /* 计算属性：选中边 */
  get selectedEdge(): FlowEdge | undefined {
    return this.edges.find((e) => e.id === this.selectedEdgeId);
  }

  /**
   * 根据节点类型生成默认标签与属性。
   */
  private createDefaultNode(type: NodeType): FlowNode {
    const count = this.nodes.filter((node) => node.type === type).length + 1;
    const defaultPropsByType: Record<NodeType, Record<string, unknown>> = {
      start: {},
      end: {},
      process: {
        desc: "",
      },
      condition: {
        expr: "",
      },
      notify: {
        level: "success",
        message: "",
        duration: 3,
      },
    };

    return {
      id: genId(type),
      type,
      label:
        type === "start" || type === "end"
          ? NODE_TYPES[type].label
          : `${NODE_TYPES[type].label} ${count}`,
      x: 0,
      y: 0,
      props: { ...defaultPropsByType[type] },
    };
  }

  /**
   * 获取主链路的排序节点编号，优先从开始节点向后遍历。
   */
  getOrderedNodeIds(): string[] {
    const ordered: string[] = [];
    const visited = new Set<string>();
    let cursor =
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
  insertNodeAfter(sourceId: string, type: NodeType = "notify"): void {
    const source = this.nodes.find((node) => node.id === sourceId);
    if (!source || source.type === "end") {
      return;
    }

    const nextEdge = this.getNextEdge(sourceId);
    const newNode = this.createDefaultNode(type);
    this.nodes.push(newNode);

    if (nextEdge) {
      this.removeEdge(nextEdge.id);
      this.addEdge(newNode.id, nextEdge.target);
    }

    this.addEdge(sourceId, newNode.id);
    this.selectedNodeId = newNode.id;
    this.selectedEdgeId = null;
    this.layoutSequentialNodes();
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
   * 更新节点类型，并重置为该类型的默认属性。
   */
  updateNodeType(id: string, type: Extract<NodeType, "process" | "condition" | "notify">): void {
    const node = this.nodes.find((item) => item.id === id);
    if (!node || node.type === "start" || node.type === "end") {
      return;
    }

    const next = this.createDefaultNode(type);
    node.type = type;
    node.label = next.label;
    node.props = next.props;
    this.layoutSequentialNodes();
  }

  removeSelected(): void {
    if (this.selectedNodeId) {
      const selectedNode = this.nodes.find((node) => node.id === this.selectedNodeId);
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

      if (
        selectedNode &&
        selectedNode.type !== "start" &&
        selectedNode.type !== "end" &&
        previousEdge &&
        nextEdge
      ) {
        this.addEdge(previousEdge.source, nextEdge.target);
      }

      this.selectedNodeId = "";
      this.layoutSequentialNodes();
    }

    if (this.selectedEdgeId) {
      this.removeEdge(this.selectedEdgeId);
      this.selectedEdgeId = null;
    }
  }
}

export const flowStore = new FlowStore();










