import type {
  ComponentNode,
  ComponentNodeRecord,
} from "@codigo/schema";
import { makeAutoObservable } from "mobx";

interface IStoreComponents {
  compConfigs: Record<string, ComponentNodeRecord>;
  sortableCompConfig: string[];
  currentCompConfig: string | null;
  copyedCompConig: ComponentNode | null;
  itemsExpandIndex: number;
}

export function createStoreComponents() {
  return makeAutoObservable<IStoreComponents>({
    compConfigs: {},
    sortableCompConfig: [],
    currentCompConfig: null,
    copyedCompConig: null,
    itemsExpandIndex: 0,
  });
}

export type TStoreComponents = ReturnType<typeof createStoreComponents>;











