import type {
  ComponentEventMap,
  ComponentMeta,
  PageCategory,
  PageLayoutMode,
  TComponentTypes,
} from "@codigo/schema";

export interface TemplateComponent {
  type: TComponentTypes;
  children?: TemplateComponent[];
  events?: ComponentEventMap;
  meta?: ComponentMeta;
  name?: string;
  props?: Record<string, unknown>;
  slot?: string;
  styles?: Record<string, unknown>;
}

export interface TemplatePagePreset {
  name: string;
  path: string;
  components: TemplateComponent[];
}

export interface TemplatePreset {
  key: string;
  name: string;
  desc: string;
  tags: string[];
  pageTitle: string;
  pageCategory: PageCategory;
  layoutMode: PageLayoutMode;
  deviceType: "pc" | "mobile";
  canvasWidth: number;
  canvasHeight: number;
  activePagePath: string;
  pages: TemplatePagePreset[];
}
