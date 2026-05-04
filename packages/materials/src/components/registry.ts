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
  type IComponentSlotDefinition,
} from "@codigo/plugin-system";
import { initBuiltinEChartsThemes } from "../utils/echarts-theme";

interface BuiltinComponentDefinition {
  type: TComponentTypes;
  name: string;
  description?: string;
  icon?: string;
  component: ComponentType<any>;
  render?: ComponentType<any>;
  defaultProps?: Record<string, any>;
  propsConfig?: Array<Record<string, unknown>>;
  propsPanel?: any;
  isContainer?: boolean;
  slots?: IComponentSlotDefinition[];
}

export const builtinComponentDefinitions: BuiltinComponentDefinition[] = [
  {
    type: "container",
    name: "容器",
    icon: "Container",
    component: LowCodeContainer,
    defaultProps: {
      style: {
        width: "100%",
        minHeight: "100px",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        padding: "16px",
      },
    },
    propsConfig: [
      {
        key: "style.backgroundColor",
        label: "背景颜色",
        type: "color",
      },
      {
        key: "style.padding",
        label: "内边距",
        type: "text",
      },
      {
        key: "style.borderRadius",
        label: "圆角",
        type: "text",
      },
    ],
  },
  {
    type: "twoColumn",
    name: "双栏布局",
    icon: "Layout",
    component: LowCodeTwoColumn,
    defaultProps: {
      sidebarWidth: 280,
      sidebarTitle: "侧边栏",
      showSidebar: true,
      style: {
        height: "100%",
      },
    },
    propsConfig: [
      {
        key: "sidebarWidth",
        label: "侧边栏宽度",
        type: "number",
      },
      {
        key: "sidebarTitle",
        label: "侧边栏标题",    
        type: "text",
      },
      {
        key: "showSidebar",
        label: "显示侧边栏",
        type: "switch",
      },
    ],
  },
  {
    type: "viewGroup",
    name: "视图组",
    icon: "Layers",
    component: LowCodeViewGroup,
    defaultProps: {
      containers: [
        { id: "view-1", label: "视图 1", visible: true },
      ],
      currentViewId: "view-1",
    },
    propsConfig: [
      {
        key: "containers",
        label: "容器列表",
        type: "array",
      },
      {
        key: "currentViewId",
        label: "当前视图",
        type: "text",
      },
    ],
  },
  {
    type: "accordion",
    name: "手风琴",
    icon: "ChevronDown",
    component: LowCodeAccordion,
    defaultProps: {
      title: "折叠面板",
      defaultExpanded: false,
    },
    propsConfig: [
      {
        key: "title",
        label: "标题",
        type: "text",
      },
      {
        key: "defaultExpanded",
        label: "默认展开",
        type: "switch",
      },
    ],
  },
  {
    type: "button",
    name: "按钮",
    icon: "MousePointer",
    component: LowCodeButton,
    defaultProps: {
      text: "按钮",
      type: "primary",
      size: "middle",
    },
    propsConfig: [
      {
        key: "text",
        label: "文本",
        type: "text",
      },
      {
        key: "type",
        label: "类型",
        type: "select",
        options: [
          { label: "主按钮", value: "primary" },
          { label: "次按钮", value: "default" },
          { label: "虚线按钮", value: "dashed" },
          { label: "文字按钮", value: "text" },
          { label: "链接按钮", value: "link" },
        ],
      },
      {
        key: "size",
        label: "尺寸",
        type: "select",
        options: [
          { label: "大", value: "large" },
          { label: "中", value: "middle" },
          { label: "小", value: "small" },
        ],
      },
    ],
  },
  {
    type: "breadcrumbBar",
    name: "面包屑导航",
    icon: "ChevronRight",
    component: LowCodeBreadcrumbBar,
    defaultProps: {
      items: [
        { title: "首页", path: "/" },
        { title: "当前页面", path: "" },
      ],
    },
    propsConfig: [
      {
        key: "items",
        label: "面包屑项",
        type: "array",
      },
    ],
  },
  {
    type: "pageHeader",
    name: "页面头部",
    icon: "PanelTop",
    component: LowCodePageHeader,
    defaultProps: {
      title: "页面标题",
      subtitle: "",
      showBack: true,
    },
    propsConfig: [
      {
        key: "title",
        label: "标题",
        type: "text",
      },
      {
        key: "subtitle",
        label: "副标题",
        type: "text",
      },
      {
        key: "showBack",
        label: "显示返回",
        type: "switch",
      },
    ],
  },
  {
    type: "queryFilter",
    name: "查询筛选",
    icon: "Filter",
    component: LowCodeQueryFilter,
    defaultProps: {
      filters: [],
      submitText: "查询",
      resetText: "重置",
    },
    propsConfig: [
      {
        key: "filters",
        label: "筛选条件",
        type: "array",
      },
      {
        key: "submitText",
        label: "提交按钮文本",
        type: "text",
      },
      {
        key: "resetText",
        label: "重置按钮文本",
        type: "text",
      },
    ],
  },
  {
    type: "statCard",
    name: "统计卡片",
    icon: "BarChart3",
    component: LowCodeStatCard,
    defaultProps: {
      title: "指标",
      value: "0",
      unit: "",
      trend: "up",
      trendValue: "0%",
    },
    propsConfig: [
      {
        key: "title",
        label: "标题",
        type: "text",
      },
      {
        key: "value",
        label: "数值",
        type: "text",
      },
      {
        key: "unit",
        label: "单位",
        type: "text",
      },
      {
        key: "trend",
        label: "趋势",
        type: "select",
        options: [
          { label: "上升", value: "up" },
          { label: "下降", value: "down" },
          { label: "持平", value: "flat" },
        ],
      },
      {
        key: "trendValue",
        label: "趋势值",
        type: "text",
      },
    ],
  },
  {
    type: "cardGrid",
    name: "卡片网格",
    icon: "Grid3X3",
    component: LowCodeCardGrid,
    defaultProps: {
      columns: 3,
      gap: 16,
      cards: [],
    },
    propsConfig: [
      {
        key: "columns",
        label: "列数",
        type: "number",
      },
      {
        key: "gap",
        label: "间距",
        type: "number",
      },
      {
        key: "cards",
        label: "卡片数据",
        type: "array",
      },
    ],
  },
  {
    type: "dataTable",
    name: "数据表格",
    icon: "Table",
    component: LowCodeDataTable,
    defaultProps: {
      columns: [],
      dataSource: [],
      pagination: true,
      pageSize: 10,
    },
    propsConfig: [
      {
        key: "columns",
        label: "列定义",
        type: "array",
      },
      {
        key: "dataSource",
        label: "数据源",
        type: "array",
      },
      {
        key: "pagination",
        label: "分页",
        type: "switch",
      },
      {
        key: "pageSize",
        label: "每页条数",
        type: "number",
      },
    ],
  },
  {
    type: "card",
    name: "卡片",
    icon: "Square",
    component: LowCodeCard,
    defaultProps: {
      title: "卡片标题",
      bordered: true,
      hoverable: false,
    },
    propsConfig: [
      {
        key: "title",
        label: "标题",
        type: "text",
      },
      {
        key: "bordered",
        label: "显示边框",
        type: "switch",
      },
      {
        key: "hoverable",
        label: "悬浮效果",
        type: "switch",
      },
    ],
  },
  {
    type: "image",
    name: "图片",
    icon: "Image",
    component: LowCodeImage,
    defaultProps: {
      src: "",
      alt: "",
      width: "100%",
      height: "auto",
      objectFit: "cover",
    },
    propsConfig: [
      {
        key: "src",
        label: "图片地址",
        type: "text",
      },
      {
        key: "alt",
        label: "替代文本",
        type: "text",
      },
      {
        key: "width",
        label: "宽度",
        type: "text",
      },
      {
        key: "height",
        label: "高度",
        type: "text",
      },
      {
        key: "objectFit",
        label: "填充模式",
        type: "select",
        options: [
          { label: "覆盖", value: "cover" },
          { label: "包含", value: "contain" },
          { label: "填充", value: "fill" },
          { label: "无", value: "none" },
        ],
      },
    ],
  },
  {
    type: "avatar",
    name: "头像",
    icon: "User",
    component: LowCodeAvatar,
    defaultProps: {
      src: "",
      size: 40,
      shape: "circle",
    },
    propsConfig: [
      {
        key: "src",
        label: "头像地址",
        type: "text",
      },
      {
        key: "size",
        label: "尺寸",
        type: "number",
      },
      {
        key: "shape",
        label: "形状",
        type: "select",
        options: [
          { label: "圆形", value: "circle" },
          { label: "方形", value: "square" },
        ],
      },
    ],
  },
  {
    type: "list",
    name: "列表",
    icon: "List",
    component: LowCodeList,
    defaultProps: {
      dataSource: [],
      renderItem: null,
      bordered: false,
    },
    propsConfig: [
      {
        key: "dataSource",
        label: "数据源",
        type: "array",
      },
      {
        key: "bordered",
        label: "显示边框",
        type: "switch",
      },
    ],
  },
  {
    type: "statistic",
    name: "统计",
    icon: "Hash",
    component: LowCodeStatistic,
    defaultProps: {
      title: "统计",
      value: 0,
      precision: 0,
      suffix: "",
      prefix: "",
    },
    propsConfig: [
      {
        key: "title",
        label: "标题",
        type: "text",
      },
      {
        key: "value",
        label: "数值",
        type: "number",
      },
      {
        key: "precision",
        label: "精度",
        type: "number",
      },
      {
        key: "suffix",
        label: "后缀",
        type: "text",
      },
      {
        key: "prefix",
        label: "前缀",
        type: "text",
      },
    ],
  },
  {
    type: "swiper",
    name: "轮播",
    icon: "Slideshow",
    component: LowCodeSwiper,
    defaultProps: {
      slides: [],
      autoplay: true,
      interval: 3000,
    },
    propsConfig: [
      {
        key: "slides",
        label: "幻灯片",
        type: "array",
      },
      {
        key: "autoplay",
        label: "自动播放",
        type: "switch",
      },
      {
        key: "interval",
        label: "间隔(ms)",
        type: "number",
      },
    ],
  },
  {
    type: "table",
    name: "表格",
    icon: "Table2",
    component: LowCodeTable,
    defaultProps: {
      columns: [],
      dataSource: [],
      pagination: false,
    },
    propsConfig: [
      {
        key: "columns",
        label: "列定义",
        type: "array",
      },
      {
        key: "dataSource",
        label: "数据源",
        type: "array",
      },
      {
        key: "pagination",
        label: "分页",
        type: "switch",
      },
    ],
  },
  {
    type: "video",
    name: "视频",
    icon: "Video",
    component: LowCodeVideo,
    defaultProps: {
      src: "",
      poster: "",
      autoplay: false,
      controls: true,
      loop: false,
    },
    propsConfig: [
      {
        key: "src",
        label: "视频地址",
        type: "text",
      },
      {
        key: "poster",
        label: "封面",
        type: "text",
      },
      {
        key: "autoplay",
        label: "自动播放",
        type: "switch",
      },
      {
        key: "controls",
        label: "控制",
        type: "switch",
      },
      {
        key: "loop",
        label: "循环播放",
        type: "switch",
      },
    ],
  },
  {
    type: "titleText",
    name: "文本",
    icon: "Type",
    component: LowCodeText,
    defaultProps: {
      content: "文本内容",
      fontSize: 14,
      color: "#000000",
      align: "left",
    },
    propsConfig: [
      {
        key: "content",
        label: "内容",
        type: "textarea",
      },
      {
        key: "fontSize",
        label: "字体大小",
        type: "number",
      },
      {
        key: "color",
        label: "颜色",
        type: "color",
      },
      {
        key: "align",
        label: "对齐",
        type: "select",
        options: [
          { label: "左对齐", value: "left" },
          { label: "居中", value: "center" },
          { label: "右对齐", value: "right" },
        ],
      },
    ],
  },
  {
    type: "split",
    name: "分割",
    icon: "Minus",
    component: LowCodeSplit,
    defaultProps: {
      direction: "horizontal",
      text: "",
    },
    propsConfig: [
      {
        key: "direction",
        label: "方向",
        type: "select",
        options: [
          { label: "水平", value: "horizontal" },
          { label: "垂直", value: "vertical" },
        ],
      },
      {
        key: "text",
        label: "文本",
        type: "text",
      },
    ],
  },
  {
    type: "empty",
    name: "空状态",
    icon: "Inbox",
    component: LowCodeEmpty,
    defaultProps: {
      description: "暂无数据",
      image: null,
    },
    propsConfig: [
      {
        key: "description",
        label: "描述",
        type: "text",
      },
    ],
  },
  {
    type: "richText",
    name: "富文本",
    icon: "FileText",
    component: LowCodeRichText,
    defaultProps: {
      content: "<p>富文本内容</p>",
    },
    propsConfig: [
      {
        key: "content",
        label: "富文本内容",
        type: "textarea",
      },
    ],
  },
  {
    type: "qrcode",
    name: "二维码",
    icon: "QrCode",
    component: LowCodeQrcode,
    defaultProps: {
      value: "",
      size: 128,
      color: "#000000",
      bgColor: "#ffffff",
    },
    propsConfig: [
      {
        key: "value",
        label: "内容",
        type: "text",
      },
      {
        key: "size",
        label: "尺寸",
        type: "number",
      },
      {
        key: "color",
        label: "前景颜色",
        type: "color",
      },
      {
        key: "bgColor",
        label: "背景颜色",
        type: "color",
      },
    ],
  },
  {
    type: "alert",
    name: "警告提示",
    icon: "AlertCircle",
    component: LowCodeAlert,
    defaultProps: {
      message: "提示信息",
      type: "info",
      showIcon: true,
      closable: false,
    },
    propsConfig: [
      {
        key: "message",
        label: "消息",
        type: "text",
      },
      {
        key: "type",
        label: "类型",
        type: "select",
        options: [
          { label: "信息", value: "info" },
          { label: "成功", value: "success" },
          { label: "警告", value: "warning" },
          { label: "错误", value: "error" },
        ],
      },
      {
        key: "showIcon",
        label: "显示图标",
        type: "switch",
      },
      {
        key: "closable",
        label: "可关闭",
        type: "switch",
      },
    ],
  },
  {
    type: "geoMap",
    name: "地理地图",
    icon: "Map",
    component: LowCodeGeoMap,
    defaultProps: {
      mapType: "china",
      data: [],
      height: 400,
    },
    propsConfig: [
      {
        key: "mapType",
        label: "地图类型",
        type: "select",
        options: [
          { label: "中国", value: "china" },
          { label: "世界", value: "world" },
        ],
      },
      {
        key: "data",
        label: "数据",
        type: "array",
      },
      {
        key: "height",
        label: "高度",
        type: "number",
      },
    ],
  },
  {
    type: "input",
    name: "输入框",
    icon: "FormInput",
    component: LowCodeInput,
    defaultProps: {
      placeholder: "请输入",
      type: "text",
      disabled: false,
      allowClear: true,
    },
    propsConfig: [
      {
        key: "placeholder",
        label: "占位符",
        type: "text",
      },
      {
        key: "type",
        label: "类型",
        type: "select",
        options: [
          { label: "文本", value: "text" },
          { label: "密码", value: "password" },
          { label: "数字", value: "number" },
        ],
      },
      {
        key: "disabled",
        label: "禁用",
        type: "switch",
      },
      {
        key: "allowClear",
        label: "可清除",
        type: "switch",
      },
    ],
  },
  {
    type: "textArea",
    name: "文本域",
    icon: "Text",
    component: LowCodeTextArea,
    defaultProps: {
      placeholder: "请输入",
      rows: 4,
      maxLength: null,
      showCount: false,
    },
    propsConfig: [
      {
        key: "placeholder",
        label: "占位符",
        type: "text",
      },
      {
        key: "rows",
        label: "行数",
        type: "number",
      },
      {
        key: "maxLength",
        label: "最大长度",
        type: "number",
      },
      {
        key: "showCount",
        label: "显示计数",
        type: "switch",
      },
    ],
  },
  {
    type: "radio",
    name: "单选框",
    icon: "CircleDot",
    component: LowCodeRadio,
    defaultProps: {
      options: [
        { label: "选项1", value: "1" },
        { label: "选项2", value: "2" },
      ],
      direction: "horizontal",
    },
    propsConfig: [
      {
        key: "options",
        label: "选项",
        type: "array",
      },
      {
        key: "direction",
        label: "方向",
        type: "select",
        options: [
          { label: "水平", value: "horizontal" },
          { label: "垂直", value: "vertical" },
        ],
      },
    ],
  },
  {
    type: "checkbox",
    name: "复选框",
    icon: "CheckSquare",
    component: LowCodeCheckbox,
    defaultProps: {
      options: [
        { label: "选项1", value: "1" },
        { label: "选项2", value: "2" },
      ],
    },
    propsConfig: [
      {
        key: "options",
        label: "选项",
        type: "array",
      },
    ],
  },
  {
    type: "barChart",
    name: "柱状图",
    icon: "BarChart",
    component: LowCodeBarChart,
    defaultProps: {
      title: "",
      xAxis: [],
      series: [],
      height: 300,
    },
    propsConfig: [
      {
        key: "title",
        label: "标题",
        type: "text",
      },
      {
        key: "xAxis",
        label: "X轴数据",
        type: "array",
      },
      {
        key: "series",
        label: "系列数据",
        type: "array",
      },
      {
        key: "height",
        label: "高度",
        type: "number",
      },
    ],
  },
  {
    type: "lineChart",
    name: "折线图",
    icon: "LineChart",
    component: LowCodeLineChart,
    defaultProps: {
      title: "",
      xAxis: [],
      series: [],
      height: 300,
      smooth: true,
    },
    propsConfig: [
      {
        key: "title",
        label: "标题",
        type: "text",
      },
      {
        key: "xAxis",
        label: "X轴数据",
        type: "array",
      },
      {
        key: "series",
        label: "系列数据",
        type: "array",
      },
      {
        key: "height",
        label: "高度",
        type: "number",
      },
      {
        key: "smooth",
        label: "平滑曲线",
        type: "switch",
      },
    ],
  },
  {
    type: "pieChart",
    name: "饼图",
    icon: "PieChart",
    component: LowCodePieChart,
    defaultProps: {
      title: "",
      data: [],
      height: 300,
      donut: false,
    },
    propsConfig: [
      {
        key: "title",
        label: "标题",
        type: "text",
      },
      {
        key: "data",
        label: "数据",
        type: "array",
      },
      {
        key: "height",
        label: "高度",
        type: "number",
      },
      {
        key: "donut",
        label: "环形图",
        type: "switch",
      },
    ],
  },
];

function createRegisteredPluginDefinition(
  definition: BuiltinComponentDefinition,
): IComponentPlugin<TComponentTypes, Record<string, any>, ComponentType<any>> {
  return {
    type: definition.type,
    name: definition.name,
    description: definition.description,
    render: definition.render ?? definition.component,
    defaultConfig: {
      id: `builtin:${definition.type}`,
      type: definition.type,
      props: { ...(definition.defaultProps ?? {}) },
    },
    propsPanel: definition.propsPanel,
    isContainer: definition.isContainer,
    slots: definition.slots,
  };
}

export function initBuiltinComponents() {
  initBuiltinEChartsThemes();

  for (const definition of builtinComponentDefinitions) {
    registerComponent(createRegisteredPluginDefinition(definition));
  }
}

export function getBuiltinComponentDefinitionByType(type: TComponentTypes) {
  return builtinComponentDefinitions.find((d) => d.type === type);
}
