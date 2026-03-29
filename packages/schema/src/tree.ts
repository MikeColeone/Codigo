import type { ComponentNode } from "./components";

export interface FlatComponentNode extends Omit<ComponentNode, "children"> {
  parentId?: string | null;
}

function cloneNode(node: ComponentNode): ComponentNode {
  return {
    ...node,
    props: { ...(node.props ?? {}) },
    styles: node.styles ? { ...node.styles } : undefined,
    meta: node.meta ? { ...node.meta } : undefined,
    children: node.children?.map(cloneNode),
  };
}

export function flattenComponentTree(
  nodes: ComponentNode[],
  parentId: string | null = null,
): FlatComponentNode[] {
  return nodes.flatMap((node) => {
    const current: FlatComponentNode = {
      ...node,
      props: { ...(node.props ?? {}) },
      styles: node.styles ? { ...node.styles } : undefined,
      meta: node.meta ? { ...node.meta } : undefined,
      parentId,
    };
    delete (current as { children?: ComponentNode[] }).children;
    return [
      current,
      ...flattenComponentTree(node.children ?? [], node.id),
    ];
  });
}

export function buildComponentTree(
  nodes: FlatComponentNode[],
  rootIds?: string[],
): ComponentNode[] {
  const nodeMap = new Map<string, ComponentNode>();
  const childrenMap = new Map<string | null, ComponentNode[]>();

  for (const item of nodes) {
    nodeMap.set(item.id, {
      ...item,
      props: { ...(item.props ?? {}) },
      styles: item.styles ? { ...item.styles } : undefined,
      meta: item.meta ? { ...item.meta } : undefined,
      children: [],
    });
  }

  for (const item of nodes) {
    const node = nodeMap.get(item.id);
    if (!node) continue;
    const parentKey = item.parentId ?? null;
    const list = childrenMap.get(parentKey) ?? [];
    list.push(node);
    childrenMap.set(parentKey, list);
  }

  const sortByRoot = (list: ComponentNode[]) => {
    if (!rootIds?.length) return list;
    const orderMap = new Map(rootIds.map((id, index) => [id, index]));
    return [...list].sort((left, right) => {
      const leftIndex = orderMap.get(left.id) ?? Number.MAX_SAFE_INTEGER;
      const rightIndex = orderMap.get(right.id) ?? Number.MAX_SAFE_INTEGER;
      return leftIndex - rightIndex;
    });
  };

  const attachChildren = (node: ComponentNode) => {
    const children = childrenMap.get(node.id) ?? [];
    node.children = children.map((child) => attachChildren(child));
    return node;
  };

  return sortByRoot(childrenMap.get(null) ?? []).map((node) =>
    attachChildren(cloneNode(node)),
  );
}

export function groupChildrenBySlot(
  node: Pick<ComponentNode, "children">,
  defaultSlot = "default",
) {
  return (node.children ?? []).reduce<Record<string, ComponentNode[]>>(
    (acc, child) => {
      const slotName = child.slot || defaultSlot;
      if (!acc[slotName]) {
        acc[slotName] = [];
      }
      acc[slotName].push(child);
      return acc;
    },
    {},
  );
}
