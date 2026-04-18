import { makeAutoObservable } from "mobx";

export type LayoutEditMode = "idle" | "split-vertical" | "split-horizontal";

const layoutManagerUIStore = makeAutoObservable({
  isActive: false,
  mode: "idle" as LayoutEditMode,
  evenParts: 2,
  selectedBlockId: null as string | null,
  setActive(next: boolean) {
    this.isActive = next;
    if (!next) {
      this.mode = "idle";
      this.selectedBlockId = null;
    }
  },
  setMode(next: LayoutEditMode) {
    this.mode = next;
  },
  setEvenParts(next: number) {
    this.evenParts = Math.min(60, Math.max(2, Math.round(next || 2)));
  },
  setSelectedBlockId(id: string | null) {
    this.selectedBlockId = id;
  },
});

export function useLayoutManagerUI() {
  return layoutManagerUIStore;
}

