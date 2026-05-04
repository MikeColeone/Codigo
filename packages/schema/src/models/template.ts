import type { ComponentEventMap, ComponentMeta, TComponentTypes } from "../schema/components";
import type {
  IEditorPageGroupSchema,
  PageCategory,
  PageGridConfig,
  PageLayoutMode,
  PageShellLayout,
} from "../schema/low-code";

export type TemplateDeviceType = "pc" | "mobile";

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

/**
 * 模板页面预设协议
 * param {string} name: 页面名称
 * param {string} path: 页面路径
 * param {array[object]} components: 页面组件配置
 */
export interface TemplatePagePreset {
  name: string;
  path: string;
  components: TemplateComponent[];
}

/**
 * 模板预设协议
 * key(string): 模板唯一标识
 * name(string): 模板名称
 * desc(string): 模板描述
 * tags(array[string]): 模板标签
 * pageTitle(string): 模板首页标题
 * pageCategory(string): 模板页面分类
 * layoutMode(string): 模板布局模式
 * grid(object): 模板网格配置
 * shellLayout(object): 模板壳布局
 * deviceType(string): 模板设备类型
 * canvasWidth(number): 模板画布宽度
 * canvasHeight(number): 模板画布高度
 * activePagePath(string): 模板默认激活页面路径
 * pageGroups(array[object]): 模板页面分组配置
 * pages(array[object]): 模板页面配置
 */
export interface TemplatePreset {
  key: string;
  name: string;
  desc: string;
  tags: string[];
  pageTitle: string;
  pageCategory: PageCategory;
  layoutMode: PageLayoutMode;
  grid?: PageGridConfig;
  shellLayout?: PageShellLayout;
  deviceType: TemplateDeviceType;
  canvasWidth: number;
  canvasHeight: number;
  activePagePath: string;
  pageGroups?: Pick<IEditorPageGroupSchema, "id" | "name" | "path">[];
  pages: TemplatePagePreset[];
}
