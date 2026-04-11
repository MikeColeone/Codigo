import type { PageCategory, TComponentTypes } from "@codigo/schema";
import type { FC, ReactNode } from "react";

export type EditorComponentSectionKey =
  | "container"
  | "basic"
  | "form"
  | "report";

export interface EditorComponentMeta {
  type: TComponentTypes;
  name: string;
  icon: ReactNode;
  sectionKey: EditorComponentSectionKey;
  propsEditor: FC<any>;
  quickInsert?: boolean;
  hiddenFromPalette?: boolean;
  codeSync?: boolean;
  categories?: PageCategory[];
}

export interface EditorComponentSection {
  key: EditorComponentSectionKey;
  label: string;
  items: EditorComponentMeta[];
}

export type PageLayoutPresetKey =
  | "sectionStack"
  | "sidebarLayout"
  | "dashboardLayout";

export interface PageLayoutPresetMeta {
  key: PageLayoutPresetKey;
  name: string;
  description: string;
  icon: ReactNode;
  categories?: PageCategory[];
}
