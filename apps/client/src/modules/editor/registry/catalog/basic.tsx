import {
  ApartmentOutlined,
  BarsOutlined,
  BorderOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  ExpandOutlined,
  FilterOutlined,
  FontColorsOutlined,
  FontSizeOutlined,
  FundViewOutlined,
  MinusOutlined,
  PlayCircleOutlined,
  QrcodeOutlined,
  SplitCellsOutlined,
  TableOutlined,
  UnorderedListOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { AccordionComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeAccordion";
import { AlertComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeAlert";
import { AvatarComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeAvatar";
import { BreadcrumbBarComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeBreadcrumbBar";
import { ButtonComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeButton";
import { CardComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeCard";
import { CardGridComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeCardGrid";
import { DataTableComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeDataTable";
import { EmptyComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeEmpty";
import { ImageComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeImage";
import { ListComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeList";
import { PageHeaderComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodePageHeader";
import { QueryFilterComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeQueryFilter";
import { QrcodeComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeQrcode";
import { RichTextComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeRichText";
import { SplitComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeSplit";
import { StatCardComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeStatCard";
import { SwiperComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeSwiper";
import { TextComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeText";
import { VideoComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeVideo";
import type { EditorComponentMeta } from "../types";

export const basicEditorComponents: EditorComponentMeta[] = [
  {
    type: "accordion",
    name: "手风琴",
    icon: <BarsOutlined />,
    sectionKey: "basic",
    propsEditor: AccordionComponentProps,
  },
  {
    type: "breadcrumbBar",
    name: "面包屑",
    icon: <ApartmentOutlined />,
    sectionKey: "basic",
    propsEditor: BreadcrumbBarComponentProps,
  },
  {
    type: "pageHeader",
    name: "页面头",
    icon: <BarsOutlined />,
    sectionKey: "basic",
    propsEditor: PageHeaderComponentProps,
  },
  {
    type: "queryFilter",
    name: "搜索区",
    icon: <FilterOutlined />,
    sectionKey: "basic",
    propsEditor: QueryFilterComponentProps,
  },
  {
    type: "statCard",
    name: "统计卡片",
    icon: <DashboardOutlined />,
    sectionKey: "basic",
    propsEditor: StatCardComponentProps,
  },
  {
    type: "cardGrid",
    name: "卡片网格",
    icon: <CreditCardOutlined />,
    sectionKey: "basic",
    propsEditor: CardGridComponentProps,
  },
  {
    type: "dataTable",
    name: "数据表格",
    icon: <TableOutlined />,
    sectionKey: "basic",
    propsEditor: DataTableComponentProps,
  },
  {
    type: "button",
    name: "按钮",
    icon: <BorderOutlined />,
    sectionKey: "basic",
    propsEditor: ButtonComponentProps,
    quickInsert: true,
  },
  {
    type: "swiper",
    name: "轮播",
    icon: <SplitCellsOutlined />,
    sectionKey: "basic",
    propsEditor: SwiperComponentProps,
  },
  {
    type: "card",
    name: "卡片",
    icon: <CreditCardOutlined />,
    sectionKey: "basic",
    propsEditor: CardComponentProps,
  },
  {
    type: "list",
    name: "列表",
    icon: <UnorderedListOutlined />,
    sectionKey: "basic",
    propsEditor: ListComponentProps,
  },
  {
    type: "image",
    name: "图片",
    icon: <FundViewOutlined />,
    sectionKey: "basic",
    propsEditor: ImageComponentProps,
    quickInsert: true,
  },
  {
    type: "video",
    name: "视频",
    icon: <PlayCircleOutlined />,
    sectionKey: "basic",
    propsEditor: VideoComponentProps,
  },
  {
    type: "avatar",
    name: "头像",
    icon: <UserOutlined />,
    sectionKey: "basic",
    propsEditor: AvatarComponentProps,
    quickInsert: true,
  },
  {
    type: "titleText",
    name: "文本",
    icon: <FontSizeOutlined />,
    sectionKey: "basic",
    propsEditor: TextComponentProps,
    quickInsert: true,
  },
  {
    type: "split",
    name: "分割",
    icon: <MinusOutlined />,
    sectionKey: "basic",
    propsEditor: SplitComponentProps,
  },
  {
    type: "richText",
    name: "富文本",
    icon: <FontColorsOutlined />,
    sectionKey: "basic",
    propsEditor: RichTextComponentProps,
  },
  {
    type: "qrcode",
    name: "二维码",
    icon: <QrcodeOutlined />,
    sectionKey: "basic",
    propsEditor: QrcodeComponentProps,
  },
  {
    type: "empty",
    name: "空状态",
    icon: <ExpandOutlined />,
    sectionKey: "basic",
    propsEditor: EmptyComponentProps,
  },
  {
    type: "alert",
    name: "警告",
    icon: <WarningOutlined />,
    sectionKey: "basic",
    propsEditor: AlertComponentProps,
  },
];
