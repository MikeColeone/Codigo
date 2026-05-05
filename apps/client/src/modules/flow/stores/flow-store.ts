import type { ActionConfig, ComponentEventName } from "@codigo/schema";
import { makeAutoObservable } from "mobx";
import {
  createDefaultAction,
  getActionTypeLabel,
} from "@/modules/editor/components/right-panel/action-list-editor";
import { NODE_TYPES } from "../constants";
import type { FlowContext, FlowEdge, FlowNode, NodeType } from "../types";

const START_NODE_ID = "start_1";

function genId(p: string = "e"): string {
  return `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function createStartNode(): FlowNode {
  return {
    id: START_NODE_ID,
    type: "start",
    label: "开始",
    x: 0,
    y: 0,
    props: {},
  };
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

  get selectedNode(): FlowNode | undefined {
    return this.nodes.find((node) => node.id === this.selectedNodeId);
  }

  get selectedEdge(): FlowEdge | undefined {
    return this.edges.find((edge) => edge.id === this.selectedEdgeId);
  }

  get canRemoveSelection(): boolean {
    if (this.selectedEdgeId) {
      return true;
    }
    return Boolean(this.selectedNode && this.selectedNode.type !== "start");
  }

  get actionNodes(): FlowNode[] {
    return this.getOrderedNodeIds()
      .map((nodeId) => this.nodes.find((node) => node.id === nodeId) ?? null)
      .filter((node): node is FlowNode => Boolean(node && node.type !== "start"));
  }

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

  clearContext(): void {
    this.context = null;
    this.eventOptions = [];
    this.pageOptions = [];
    this.pendingInsertSourceId = null;
    this.onActionsChange = null;
    this.resetGraph();
  }

  private getNodeTypeByAction(action: ActionConfig): Exclude<NodeType, "start"> {
    if (action.type === "toast") {
      return "notify";
    }
    if (action.type === "when") {
      return "condition";
    }
    return "process";
  }

  private cloneAction(action: ActionConfig): ActionConfig {
    const cloneList = (actions: ActionConfig[] | undefined) =>
      Array.isArray(actions) ? actions.map((item) => this.cloneAction(item)) : undefined;

    const branches = cloneList(action.branches);
    const branchConfig = branches?.length ? { branches } : {};

    switch (action.type) {
      case "confirm": {
        const { onOk: _onOk, onCancel: _onCancel, ...rest } = action;
        const onOk = cloneList(action.onOk);
        const onCancel = cloneList(action.onCancel);
        return {
          ...rest,
          ...branchConfig,
          ...(onOk?.length ? { onOk } : {}),
          ...(onCancel?.length ? { onCancel } : {}),
        };
      }
      case "when": {
        const { onTrue: _onTrue, onFalse: _onFalse, ...rest } = action;
        const onTrue = cloneList(action.onTrue);
        const onFalse = cloneList(action.onFalse);
        return {
          ...rest,
          ...branchConfig,
          ...(onTrue?.length ? { onTrue } : {}),
          ...(onFalse?.length ? { onFalse } : {}),
        };
      }
      case "request": {
        const { onSuccess: _onSuccess, onError: _onError, ...rest } = action;
        const onSuccess = cloneList(action.onSuccess);
        const onError = cloneList(action.onError);
        return {
          ...rest,
          ...branchConfig,
          ...(onSuccess?.length ? { onSuccess } : {}),
          ...(onError?.length ? { onError } : {}),
        };
      }
      default:
        return {
          ...action,
          ...branchConfig,
        };
    }
  }

  private createFallbackAction(node: FlowNode): ActionConfig {
    if (node.type === "notify") {
      return {
        type: "toast",
        message: String(node.props.message ?? ""),
        variant:
          (node.props.level as "success" | "error" | "info" | "warning" | undefined) ??
          "success",
      };
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

  private createNodeFromAction(action: ActionConfig): FlowNode {
    const type = this.getNodeTypeByAction(action);
    const count = this.nodes.filter((node) => node.type === type).length + 1;
    return {
      id: genId(type),
      type,
      label: `${getActionTypeLabel(action.type)} ${count}`,
      x: 0,
      y: 0,
      props: {},
      action: this.cloneAction(action),
    };
  }

  private getChildEdges(sourceId: string): FlowEdge[] {
    return this.edges.filter((edge) => edge.source === sourceId);
  }

  private getParentEdges(targetId: string): FlowEdge[] {
    return this.edges.filter((edge) => edge.target === targetId);
  }

  private removeEdge(edgeId: string): void {
    const index = this.edges.findIndex((edge) => edge.id === edgeId);
    if (index > -1) {
      this.edges.splice(index, 1);
    }
  }

  private appendActionTree(parentId: string, action: ActionConfig): string {
    const node = this.createNodeFromAction(action);
    this.nodes.push(node);
    this.addEdge(parentId, node.id);
    const branches = Array.isArray(action.branches) ? action.branches : [];
    branches.forEach((branchAction) => {
      this.appendActionTree(node.id, branchAction);
    });
    return node.id;
  }

  private serializeActionTree(nodeId: string): ActionConfig | null {
    const node = this.nodes.find((item) => item.id === nodeId);
    if (!node || node.type === "start") {
      return null;
    }
    const action = this.cloneAction(node.action ?? this.createFallbackAction(node));
    const branches = this.getChildEdges(nodeId)
      .map((edge) => this.serializeActionTree(edge.target))
      .filter((item): item is ActionConfig => Boolean(item));
    if (branches.length) {
      action.branches = branches;
    } else {
      delete action.branches;
    }
    return action;
  }

  private serializeNodeAction(nodeId: string): ActionConfig | null {
    const node = this.nodes.find((item) => item.id === nodeId);
    if (!node || node.type === "start") {
      return null;
    }
    const action = this.cloneAction(node.action ?? this.createFallbackAction(node));
    delete action.branches;
    return action;
  }

  private hasGraphBranches(actions: ActionConfig[]) {
    return actions.some((action) => Array.isArray(action.branches) && action.branches.length > 0);
  }

  private isLinearGraph() {
    const startChildren = this.getChildEdges(START_NODE_ID);
    if (startChildren.length > 1) {
      return false;
    }
    return this.nodes.every((node) => {
      if (node.type === "start") {
        return this.getParentEdges(node.id).length === 0 && this.getChildEdges(node.id).length <= 1;
      }
      return this.getParentEdges(node.id).length <= 1 && this.getChildEdges(node.id).length <= 1;
    });
  }

  private getReachableNodeIds(): Set<string> {
    const reachable = new Set<string>();
    const queue = [START_NODE_ID];

    while (queue.length) {
      const current = queue.shift();
      if (!current || reachable.has(current)) {
        continue;
      }
      reachable.add(current);
      this.getChildEdges(current).forEach((edge) => {
        if (!reachable.has(edge.target)) {
          queue.push(edge.target);
        }
      });
    }

    return reachable;
  }

  private pruneUnreachableNodes() {
    const reachable = this.getReachableNodeIds();
    this.nodes = this.nodes.filter((node) => reachable.has(node.id));
    this.edges = this.edges.filter(
      (edge) => reachable.has(edge.source) && reachable.has(edge.target),
    );

    if (this.selectedNodeId && !reachable.has(this.selectedNodeId)) {
      this.selectedNodeId = "";
    }
    if (this.selectedEdgeId && !this.edges.some((edge) => edge.id === this.selectedEdgeId)) {
      this.selectedEdgeId = null;
    }
  }

  private syncActions(): void {
    if (!this.onActionsChange) {
      return;
    }
    this.onActionsChange(this.serializeActions());
  }

  resetGraph(): void {
    this.nodes = [createStartNode()];
    this.edges = [];
    this.selectedNodeId = "";
    this.selectedEdgeId = null;
    this.layoutGraph();
  }

  loadFromActions(actions: ActionConfig[]): void {
    this.nodes = [createStartNode()];
    this.edges = [];
    this.selectedNodeId = "";
    this.selectedEdgeId = null;

    if (this.hasGraphBranches(actions)) {
      actions.forEach((action) => {
        this.appendActionTree(START_NODE_ID, action);
      });
    } else {
      let cursor = START_NODE_ID;
      actions.forEach((action) => {
        cursor = this.appendActionTree(cursor, action);
      });
    }

    this.layoutGraph();
  }

  serializeActions(): ActionConfig[] {
    if (this.isLinearGraph()) {
      const actions: ActionConfig[] = [];
      let cursor = this.getChildEdges(START_NODE_ID)[0]?.target;
      while (cursor) {
        const action = this.serializeNodeAction(cursor);
        if (action) {
          actions.push(action);
        }
        cursor = this.getChildEdges(cursor)[0]?.target;
      }
      return actions;
    }

    return this.getChildEdges(START_NODE_ID)
      .map((edge) => this.serializeActionTree(edge.target))
      .filter((action): action is ActionConfig => Boolean(action));
  }

  getOrderedNodeIds(): string[] {
    const ordered: string[] = [];
    const visited = new Set<string>();
    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) {
        return;
      }
      visited.add(nodeId);
      ordered.push(nodeId);
      this.getChildEdges(nodeId).forEach((edge) => visit(edge.target));
    };

    visit(START_NODE_ID);
    this.nodes.forEach((node) => {
      if (!visited.has(node.id)) {
        ordered.push(node.id);
      }
    });
    return ordered;
  }

  layoutGraph(): void {
    const positions = new Map<string, { x: number; y: number }>();
    const depthGapX = 420;
    const leafGapY = 240;
    const startX = 80;
    const baseY = 180;
    let leafIndex = 0;

    const place = (nodeId: string, depth: number): number => {
      const childIds = this.getChildEdges(nodeId).map((edge) => edge.target);
      const x = startX + depth * depthGapX;

      if (!childIds.length) {
        const y = baseY + leafIndex * leafGapY;
        leafIndex += 1;
        positions.set(nodeId, { x, y });
        return y;
      }

      const centers = childIds.map((childId) => place(childId, depth + 1));
      const y = centers.reduce((sum, value) => sum + value, 0) / centers.length;
      positions.set(nodeId, { x, y });
      return y;
    };

    place(START_NODE_ID, 0);

    this.nodes.forEach((node) => {
      const position = positions.get(node.id);
      if (!position) {
        return;
      }
      const meta = NODE_TYPES[node.type];
      node.x = position.x;
      node.y = position.y - meta.h / 2;
    });
  }

  insertNodeAfter(sourceId: string, actionType: ActionConfig["type"] = "toast"): void {
    const source = this.nodes.find((node) => node.id === sourceId);
    if (!source) {
      return;
    }

    const newNode = this.createNodeFromAction(createDefaultAction(actionType));
    this.nodes.push(newNode);
    this.addEdge(sourceId, newNode.id);
    this.selectedNodeId = newNode.id;
    this.selectedEdgeId = null;
    this.layoutGraph();
    this.syncActions();
  }

  updateNodePos(id: string, x: number, y: number): void {
    const node = this.nodes.find((item) => item.id === id);
    if (!node) {
      return;
    }
    node.x = Math.max(0, x);
    node.y = Math.max(0, y);
  }

  addEdge(sourceId: string, targetId: string): void {
    if (!sourceId || !targetId || sourceId === targetId) {
      return;
    }
    const exists = this.edges.some(
      (edge) => edge.source === sourceId && edge.target === targetId,
    );
    if (exists) {
      return;
    }
    this.edges.push({
      id: genId(),
      source: sourceId,
      target: targetId,
      label: "",
    });
  }

  updateNodeAction(id: string, nextAction: ActionConfig): void {
    const node = this.nodes.find((item) => item.id === id);
    if (!node || node.type === "start") {
      return;
    }
    node.type = this.getNodeTypeByAction(nextAction);
    node.label = getActionTypeLabel(nextAction.type);
    node.action = this.cloneAction(nextAction);
    this.layoutGraph();
    this.syncActions();
  }

  updateNodeType(id: string, type: Extract<NodeType, "process" | "condition" | "notify">): void {
    const fallbackActionType =
      type === "notify" ? "toast" : type === "condition" ? "when" : "setState";
    this.updateNodeAction(id, createDefaultAction(fallbackActionType));
  }

  removeSelected(): void {
    if (this.selectedNodeId) {
      const selectedNode = this.nodes.find((node) => node.id === this.selectedNodeId);
      if (!selectedNode || selectedNode.type === "start") {
        return;
      }

      const parentIds = this.getParentEdges(this.selectedNodeId).map((edge) => edge.source);
      const childIds = this.getChildEdges(this.selectedNodeId).map((edge) => edge.target);

      this.nodes = this.nodes.filter((node) => node.id !== this.selectedNodeId);
      this.edges = this.edges.filter(
        (edge) =>
          edge.source !== this.selectedNodeId && edge.target !== this.selectedNodeId,
      );

      parentIds.forEach((parentId) => {
        childIds.forEach((childId) => this.addEdge(parentId, childId));
      });

      this.selectedNodeId = "";
      this.pruneUnreachableNodes();
      this.layoutGraph();
      this.syncActions();
      return;
    }

    if (this.selectedEdgeId) {
      this.removeEdge(this.selectedEdgeId);
      this.selectedEdgeId = null;
      this.pruneUnreachableNodes();
      this.layoutGraph();
      this.syncActions();
    }
  }
}

export const flowStore = new FlowStore();




