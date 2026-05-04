import { toJS } from "mobx";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { getComponentByType } from "@codigo/materials";
import {
  groupChildrenBySlot,
  type ActionConfig,
  type ComponentNode,
  type ComponentEventName,
  type RuntimeStateValue,
} from "@codigo/schema";

interface LegacyRuntimeAction {
  type: "set-state";
  key: string;
  value: RuntimeStateValue;
}

export type RuntimeAction = ActionConfig | LegacyRuntimeAction;

interface ComponentRuntimeState {
  mode: "editor" | "preview";
  pageState: Record<string, RuntimeStateValue>;
  onAction?: (action: RuntimeAction) => void | Promise<void>;
}

function visitNodes(
  nodes: ComponentNode[],
  visitor: (node: ComponentNode) => void,
) {
  for (const node of nodes) {
    visitor(node);
    if (node.children?.length) {
      visitNodes(node.children, visitor);
    }
  }
}

function getLegacyClickActions(node: ComponentNode): ActionConfig[] {
  const props = (node.props ?? {}) as Record<string, unknown>;

  if (props.actionType === "set-state") {
    const key = props.stateKey;
    const value = props.stateValue;

    if (typeof key === "string" && key && value !== undefined) {
      return [{ type: "setState", key, value: value as RuntimeStateValue }];
    }
  }

  if (props.actionType === "open-url" && typeof props.link === "string") {
    if (props.link.startsWith("#")) {
      return [{ type: "scrollTo", targetId: props.link.slice(1) }];
    }

    if (props.link) {
      return [{ type: "openUrl", url: props.link, target: "_blank" }];
    }
  }

  if (
    props.actionType === "scroll-to-id" &&
    typeof props.targetId === "string" &&
    props.targetId
  ) {
    return [{ type: "scrollTo", targetId: props.targetId }];
  }

  return [];
}

/**
 * 返回节点指定事件的动作列表。
 */
function getComponentActions(
  node: ComponentNode,
  eventName: ComponentEventName,
): ActionConfig[] {
  const configuredActions = Array.isArray(node.events?.[eventName])
    ? node.events[eventName]
    : [];

  if (eventName !== "onClick") {
    return [...configuredActions];
  }

  return [...configuredActions, ...getLegacyClickActions(node)];
}

function handleComponentClickActions(
  node: ComponentNode,
  runtime?: ComponentRuntimeState,
) {
  if (runtime?.mode !== "preview") {
    return;
  }
  const actions = getComponentActions(node, "onClick");
  if (!actions.length) {
    return;
  }

  const run = async () => {
    for (const action of actions) {
      await runtime?.onAction?.(action);
    }
  };
  void run().catch(() => {});
}

function shouldRenderComponent(
  conf: ComponentNode,
  runtime?: ComponentRuntimeState,
) {
  if (!runtime || runtime.mode !== "preview") {
    return true;
  }

  const props = (conf.props ?? {}) as Record<string, unknown>;
  const visibleStateKey = props.visibleStateKey;
  const visibleStateValue = props.visibleStateValue;

  if (
    typeof visibleStateKey !== "string" ||
    !visibleStateKey ||
    visibleStateValue === undefined ||
    visibleStateValue === ""
  ) {
    return true;
  }

  return runtime.pageState[visibleStateKey] === visibleStateValue;
}

export function resolveInitialPageState(nodes: ComponentNode[]) {
  const initialState: Record<string, RuntimeStateValue> = {};

  visitNodes(nodes, (node) => {
    for (const action of getComponentActions(node, "onClick")) {
      if (
        action.type === "setState" &&
        action.key &&
        initialState[action.key] === undefined
      ) {
        initialState[action.key] = action.value;
      }
    }
  });

  return initialState;
}

interface RuntimeNodeShellProps {
  conf: ComponentNode;
  runtime?: ComponentRuntimeState;
  shouldStretchWidth: boolean;
  shouldStretchHeight: boolean;
  children: ReactNode;
}

/**
 * 承接运行时通用事件触发逻辑，例如 didMount 和 onClick。
 */
function RuntimeNodeShell({
  conf,
  runtime,
  shouldStretchWidth,
  shouldStretchHeight,
  children,
}: RuntimeNodeShellProps) {
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (runtime?.mode !== "preview" || hasMountedRef.current) {
      return;
    }

    hasMountedRef.current = true;
    const actions = getComponentActions(conf, "didMount");
    if (!actions.length) {
      return;
    }

    const run = async () => {
      for (const action of actions) {
        await runtime?.onAction?.(action);
      }
    };
    void run().catch(() => {});
  }, [conf, runtime]);

  return (
    <div
      data-render-node={conf.id}
      onClick={() => handleComponentClickActions(conf, runtime)}
      className={`${shouldStretchWidth ? "[&>*]:w-full" : ""} ${shouldStretchHeight ? "[&>*]:h-full" : ""}`}
      style={{
        position: "relative",
        width: conf.styles?.width || "100%",
        height: conf.styles?.height || "auto",
        marginTop: conf.styles?.marginTop,
        marginBottom: conf.styles?.marginBottom,
        marginLeft: conf.styles?.marginLeft,
        marginRight: conf.styles?.marginRight,
        paddingTop: conf.styles?.paddingTop,
        paddingBottom: conf.styles?.paddingBottom,
        paddingLeft: conf.styles?.paddingLeft,
        paddingRight: conf.styles?.paddingRight,
        overflow: "visible",
      }}
    >
      {children}
    </div>
  );
}

export function generateComponent(
  conf: ComponentNode,
  echartsTheme?: string,
  children?: ReactNode[],
  runtime?: ComponentRuntimeState,
) {
  if (!shouldRenderComponent(conf, runtime)) {
    return null;
  }

  const Component = getComponentByType(conf.type);
  if (!Component) {
    return null;
  }

  const childMap = new Map<string, ReactNode>();
  if (Array.isArray(children) && children.length) {
    for (const item of children) {
      if (
        typeof item === "object" &&
        item !== null &&
        "key" in item &&
        (item as any).key != null
      ) {
        childMap.set(String((item as any).key), item);
      }
    }
  }

  const slotNodes = groupChildrenBySlot(conf);
  const slots = Object.fromEntries(
    Object.entries(slotNodes).map(([slotName, items]) => {
      const slotItems = Array.isArray(items) ? (items as ComponentNode[]) : [];
      const rendered = slotItems
        .map((child: ComponentNode) => childMap.get(child.id))
        .filter((item): item is ReactNode => item !== undefined);
      return [slotName, rendered];
    }),
  );
  const shouldStretchWidth = conf.styles?.width !== undefined;
  const shouldStretchHeight =
    conf.styles?.height !== undefined && conf.styles?.height !== "auto";

  return (
    <RuntimeNodeShell
      conf={conf}
      runtime={runtime}
      shouldStretchWidth={shouldStretchWidth}
      shouldStretchHeight={shouldStretchHeight}
    >
      <Component
        {...toJS(conf.props)}
        echarts-theme={echartsTheme}
        key={conf.id}
        onAction={runtime?.onAction}
        runtimePageState={runtime?.pageState}
        runtimeWidth={conf.styles?.width}
        runtimeHeight={conf.styles?.height}
        slots={slots}
        editorNodeId={conf.id}
        runtimeEnv={runtime?.mode === "preview" ? "preview" : "editor"}
      />
    </RuntimeNodeShell>
  );
}
