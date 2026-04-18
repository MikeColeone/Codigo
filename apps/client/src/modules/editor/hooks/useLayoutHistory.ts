import { createLayoutHistoryStore } from "@/modules/editor/stores/layoutHistory";

const layoutHistoryStore = createLayoutHistoryStore();

export function useLayoutHistory() {
  return layoutHistoryStore;
}

