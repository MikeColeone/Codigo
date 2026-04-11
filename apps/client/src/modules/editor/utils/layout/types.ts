import type { ComponentNode } from "@codigo/schema";

export type LayoutPresetNode = ComponentNode & {
  slot?: string;
  children?: LayoutPresetNode[];
};

