import type {
  ComponentMeta,
  ComponentNode,
  TComponentStyles,
  TComponentTypes,
} from "./components";

/**
 * 描述页面所属的业务分类。
 */
export type PageCategory = "admin";

/**
 * 描述页面在画布中的布局模式。
 */
export type PageLayoutMode = "absolute" | "grid";

/**
 * 描述后台壳在预览/发布时的布局形态（不影响画布组件树）。
 */
export type PageShellLayout =
  | "leftRight"
  | "topBottom"
  | "leftTop"
  | "topLeft"
  | "breadcrumb"
  | "none";

export interface PageGridConfig {
  cols: number;
  rows: number;
  gap?: number;
}

/**
 * 描述发布链接的可见范围。
 */
export type ReleaseVisibility = "public" | "private";

/**
 * 低代码页面实体的核心协议。
 *
 * 用于描述页面在存储、编辑、预览与发布链路中的基础元数据，
 * 是跨端共享的页面基础信息结构。
 *
 * 字段说明：
 * - `id: number` 页面唯一标识。
 * - `account_id: number` 页面所属账号 ID。
 * - `page_name: string` 页面名称。
 * - `components: string[]` 页面组件列表，通常存储组件序列化结果。
 * - `schema_version?: number` 页面 schema 版本号。
 * - `tdk: string` 页面 TDK 信息。
 * - `desc: string` 页面描述信息。
 * - `deviceType?: "mobile" | "pc"` 页面目标设备类型。
 * - `canvasWidth?: number` 画布宽度。
 * - `canvasHeight?: number` 画布高度。
 * - `lockEditing?: boolean` 是否锁定编辑。
 * - `pageCategory?: PageCategory` 页面业务分类。
 * - `layoutMode?: PageLayoutMode` 页面布局模式。
 * - `grid?: PageGridConfig` 栅格布局配置。
 * - `shellLayout?: PageShellLayout` 预览或发布时的页面壳布局。
 * - `visibility?: ReleaseVisibility` 发布可见范围。
 * - `expire_at?: string | Date | null` 发布过期时间。
 */
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
  lockEditing?: boolean;
  pageCategory?: PageCategory;
  layoutMode?: PageLayoutMode;
  grid?: PageGridConfig;
  shellLayout?: PageShellLayout;
  visibility?: ReleaseVisibility;
  expire_at?: string | Date | null;
}

/**
 * 描述页面 schema 的版本号和组件树数据。
 */
export interface LayoutBlock {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IEditorPageSchema {
  id: string;
  name: string;
  path: string;
  components: ComponentNode[];
  layoutBlocks?: LayoutBlock[];
}

export interface IEditorPageGroupSchema {
  id: string;
  name: string;
  path: string;
}

export interface IPageSchema {
  version: number;
  components: ComponentNode[];
  pages?: IEditorPageSchema[];
  pageGroups?: IEditorPageGroupSchema[];
  activePageId?: string;
}

/**
 * 描述组件实例在存储层中的结构。
 */
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

/**
 * 描述组件业务数据的存储结构。
 */
export interface IComponentData {
  id: number;
  user: string;
  page_id: number;
  props: Record<string, any>[];
}

/**
 * 描述页面版本快照的存储结构。
 */
export interface IPageVersion {
  id: string; // uuid
  page_id: number;
  account_id: number;
  version: number;
  desc: string;
  schema_data: Record<string, any>; // 快照数据
  created_at: Date;
}
