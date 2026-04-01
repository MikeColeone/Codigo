import type {
  ComponentMeta,
  ComponentNode,
  TComponentStyles,
  TComponentTypes,
} from "./components";

// 页面表属性类型
export interface ILowCode {
  id: number;
  account_id: number;
  page_name: string;
  components: string[];
  schema_version?: number;
  tdk: string;
  desc: string;
  deviceType?: "mobile" | "pc";
  canvasWidth?: number;
  canvasHeight?: number;
  lockEditing?: boolean; // 编辑锁状态
}

export interface IPageSchema {
  version: number;
  components: ComponentNode[];
}

// 组件表属性类型
export interface IComponent {
  id: number;
  account_id: number;
  page_id: number;
  node_id: string;
  parent_node_id?: string | null;
  type: TComponentTypes;
  options: Record<string, any>;
  styles?: TComponentStyles;
  slot?: string | null;
  name?: string;
  meta?: ComponentMeta;
}

// 组件数据表属性类型
export interface IComponentData {
  id: number;
  user: string;
  page_id: number;
  props: Record<string, any>[];
}

// 页面版本表属性类型
export interface IPageVersion {
  id: string; // uuid
  page_id: number;
  account_id: number;
  version: number;
  desc: string;
  schema_data: Record<string, any>; // 快照数据
  created_at: Date;
}
