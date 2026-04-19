import {
  ContainerComponent as LowCodeContainer,
  TwoColumnComponent as LowCodeTwoColumn,
  ViewGroupComponent as LowCodeViewGroup,
  AccordionComponent as LowCodeAccordion,
  ButtonComponent as LowCodeButton,
  BreadcrumbBarComponent as LowCodeBreadcrumbBar,
  PageHeaderComponent as LowCodePageHeader,
  QueryFilterComponent as LowCodeQueryFilter,
  StatCardComponent as LowCodeStatCard,
  CardGridComponent as LowCodeCardGrid,
  DataTableComponent as LowCodeDataTable,
  CardComponent as LowCodeCard,
  ImageComponent as LowCodeImage,
  AvatarComponent as LowCodeAvatar,
  ListComponent as LowCodeList,
  StatisticComponent as LowCodeStatistic,
  SwiperComponent as LowCodeSwiper,
  TableComponent as LowCodeTable,
  VideoComponent as LowCodeVideo,
  TextComponent as LowCodeText,
  SplitComponent as LowCodeSplit,
  EmptyComponent as LowCodeEmpty,
  RichTextComponent as LowCodeRichText,
  QrcodeComponent as LowCodeQrcode,
  AlertComponent as LowCodeAlert,
  GeoMapComponent as LowCodeGeoMap,
  InputComponent as LowCodeInput,
  TextAreaComponent as LowCodeTextArea,
  RadioComponent as LowCodeRadio,
  CheckboxComponent as LowCodeCheckbox,
  BarChartComponent as LowCodeBarChart,
  LineChartComponent as LowCodeLineChart,
  PieChartComponent as LowCodePieChart,
} from ".";
import type { ComponentType } from "react";
import type { TComponentTypes } from "@codigo/schema";
import {
  registerComponent,
  type IComponentPlugin,
} from "@codigo/plugin-system";
import { initBuiltinEChartsThemes } from "../utils/echartsTheme";

type BuiltinComponentDefinition = IComponentPlugin<
  TComponentTypes,
  Record<string, any>,
  ComponentType<any>
>;

export const builtinComponentDefinitions: BuiltinComponentDefinition[] = [
  {
    type: "container",
    name: "Container",
    description: "通用容器，用于承载子组件并进行布局编排。",
    defaultConfig: {} as any,
    render: LowCodeContainer,
    isContainer: true,
    slots: [{ name: "default", title: "默认区域", multiple: true }],
  },
  {
    type: "twoColumn",
    name: "TwoColumn",
    description: "双列布局容器，提供左右两块可编辑区域。",
    defaultConfig: {} as any,
    render: LowCodeTwoColumn,
    isContainer: true,
    slots: [
      { name: "left", title: "左区域", multiple: true },
      { name: "right", title: "右区域", multiple: true },
    ],
  },
  {
    type: "viewGroup",
    name: "ViewGroup",
    description: "分组容器，用于组织内容区块并形成清晰的页面结构。",
    defaultConfig: {} as any,
    render: LowCodeViewGroup,
    isContainer: true,
    slots: [{ name: "default", title: "视图区域", multiple: true }],
  },
  {
    type: "accordion",
    name: "Accordion",
    description: "手风琴折叠面板，用于收纳可展开/收起的内容。",
    defaultConfig: {} as any,
    render: LowCodeAccordion,
  },
  {
    type: "button",
    name: "Button",
    description: "按钮组件，可配合事件编排触发动作链路。",
    defaultConfig: {} as any,
    render: LowCodeButton,
  },
  {
    type: "breadcrumbBar",
    name: "BreadcrumbBar",
    description: "面包屑导航条，用于展示页面层级与返回路径。",
    defaultConfig: {} as any,
    render: LowCodeBreadcrumbBar,
  },
  {
    type: "pageHeader",
    name: "PageHeader",
    description: "页面头部区块，适用于后台页面标题、操作按钮与说明。",
    defaultConfig: {} as any,
    render: LowCodePageHeader,
  },
  {
    type: "queryFilter",
    name: "QueryFilter",
    description: "查询筛选区块，适用于表格/列表前的条件过滤。",
    defaultConfig: {} as any,
    render: LowCodeQueryFilter,
  },
  {
    type: "statCard",
    name: "StatCard",
    description: "指标卡片，用于展示核心统计数据与趋势。",
    defaultConfig: {} as any,
    render: LowCodeStatCard,
  },
  {
    type: "cardGrid",
    name: "CardGrid",
    description: "卡片网格布局，用于统一排布多个信息卡片。",
    defaultConfig: {} as any,
    render: LowCodeCardGrid,
  },
  {
    type: "dataTable",
    name: "DataTable",
    description: "数据表格区块，适用于后台列表展示与基础交互。",
    defaultConfig: {} as any,
    render: LowCodeDataTable,
  },
  {
    type: "video",
    name: "Video",
    description: "视频播放器组件，用于嵌入视频内容。",
    defaultConfig: {} as any,
    render: LowCodeVideo,
  },
  {
    type: "image",
    name: "Image",
    description: "图片组件，用于展示图片资源并支持基础样式配置。",
    defaultConfig: {} as any,
    render: LowCodeImage,
  },
  {
    type: "avatar",
    name: "Avatar",
    description: "头像组件，用于展示用户头像或标识图。",
    defaultConfig: {} as any,
    render: LowCodeAvatar,
  },
  {
    type: "swiper",
    name: "Swiper",
    description: "轮播组件，用于多张图片/内容的切换展示。",
    defaultConfig: {} as any,
    render: LowCodeSwiper,
  },
  {
    type: "card",
    name: "Card",
    description: "卡片容器，用于承载内容并提供统一的视觉边界。",
    defaultConfig: {} as any,
    render: LowCodeCard,
  },
  {
    type: "list",
    name: "List",
    description: "列表组件，用于展示结构化条目内容。",
    defaultConfig: {} as any,
    render: LowCodeList,
  },
  {
    type: "statistic",
    name: "Statistic",
    description: "统计数字组件，适用于关键指标数字展示。",
    defaultConfig: {} as any,
    render: LowCodeStatistic,
  },
  {
    type: "table",
    name: "Table",
    description: "基础表格组件，适用于轻量级表格展示。",
    defaultConfig: {} as any,
    render: LowCodeTable,
  },
  {
    type: "titleText",
    name: "Text",
    description: "文本组件，用于展示标题或正文内容。",
    defaultConfig: {} as any,
    render: LowCodeText,
  },
  {
    type: "split",
    name: "Split",
    description: "分割线组件，用于分隔不同内容区域。",
    defaultConfig: {} as any,
    render: LowCodeSplit,
  },
  {
    type: "empty",
    name: "Empty",
    description: "空状态组件，用于无数据/无结果时的占位提示。",
    defaultConfig: {} as any,
    render: LowCodeEmpty,
  },
  {
    type: "richText",
    name: "RichText",
    description: "富文本组件，用于展示格式化文本内容。",
    defaultConfig: {} as any,
    render: LowCodeRichText,
  },
  {
    type: "qrcode",
    name: "Qrcode",
    description: "二维码组件，用于生成并展示二维码信息。",
    defaultConfig: {} as any,
    render: LowCodeQrcode,
  },
  {
    type: "alert",
    name: "Alert",
    description: "提示/告警组件，用于展示状态说明或风险提示。",
    defaultConfig: {} as any,
    render: LowCodeAlert,
  },
  {
    type: "geoMap",
    name: "GeoMap",
    description: "地图组件，用于展示区域分布、标记点和坐标信息。",
    defaultConfig: {} as any,
    render: LowCodeGeoMap,
  },
  {
    type: "input",
    name: "Input",
    description: "输入框组件，用于录入单行文本。",
    defaultConfig: {} as any,
    render: LowCodeInput,
  },
  {
    type: "textArea",
    name: "TextArea",
    description: "多行文本输入组件，用于录入较长内容。",
    defaultConfig: {} as any,
    render: LowCodeTextArea,
  },
  {
    type: "radio",
    name: "Radio",
    description: "单选组件，用于在多个选项中选择一个。",
    defaultConfig: {} as any,
    render: LowCodeRadio,
  },
  {
    type: "checkbox",
    name: "Checkbox",
    description: "多选组件，用于勾选多个选项。",
    defaultConfig: {} as any,
    render: LowCodeCheckbox,
  },
  {
    type: "barChart",
    name: "BarChart",
    description: "柱状图组件，用于展示分类数据对比。",
    defaultConfig: {} as any,
    render: LowCodeBarChart,
  },
  {
    type: "lineChart",
    name: "LineChart",
    description: "折线图组件，用于展示趋势变化。",
    defaultConfig: {} as any,
    render: LowCodeLineChart,
  },
  {
    type: "pieChart",
    name: "PieChart",
    description: "饼图组件，用于展示占比结构。",
    defaultConfig: {} as any,
    render: LowCodePieChart,
  },
];

let builtinComponentsInitialized = false;

/**
 * 根据物料类型查找对应的内置组件定义，供注册和运行时渲染复用。
 */
export function getBuiltinComponentDefinitionByType(type?: string | null) {
  if (!type) {
    return null;
  }

  return builtinComponentDefinitions.find((item) => item.type === type) ?? null;
}

/**
 * 初始化内置物料与图表主题，并确保组件注册只执行一次。
 */
export function initBuiltinComponents() {
  initBuiltinEChartsThemes();
  if (builtinComponentsInitialized) {
    return;
  }

  builtinComponentsInitialized = true;
  builtinComponentDefinitions.forEach((item) => registerComponent(item));
}
