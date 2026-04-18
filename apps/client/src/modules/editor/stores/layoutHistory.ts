import { makeAutoObservable } from "mobx";
import type { LayoutBlock } from "@codigo/schema";
import { cloneLayoutBlocks } from "@/modules/editor/utils/layoutBlocks";

type LayoutSnapshot = LayoutBlock[];

function ensureStack(map: Map<string, LayoutSnapshot[]>, pageId: string) {
  const existing = map.get(pageId);
  if (existing) return existing;
  const created: LayoutSnapshot[] = [];
  map.set(pageId, created);
  return created;
}

export function createLayoutHistoryStore() {
  return makeAutoObservable({
    maxDepth: 40,
    stacks: new Map<string, LayoutSnapshot[]>(),
    push(pageId: string, snapshot: LayoutSnapshot) {
      if (!pageId) return;
      const stack = ensureStack(this.stacks, pageId);
      stack.push(cloneLayoutBlocks(snapshot));
      const overflow = Math.max(0, stack.length - this.maxDepth);
      if (overflow) {
        stack.splice(0, overflow);
      }
    },
    undo(pageId: string) {
      if (!pageId) return null;
      const stack = ensureStack(this.stacks, pageId);
      const last = stack.pop();
      return last ? cloneLayoutBlocks(last) : null;
    },
    clear(pageId: string) {
      if (!pageId) return;
      const stack = ensureStack(this.stacks, pageId);
      stack.splice(0, stack.length);
    },
    depth(pageId: string) {
      if (!pageId) return 0;
      return ensureStack(this.stacks, pageId).length;
    },
  });
}

export type TLayoutHistoryStore = ReturnType<typeof createLayoutHistoryStore>;

