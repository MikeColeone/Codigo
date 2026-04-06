import {
  BarChartOutlined,
  DashboardOutlined,
  LineChartOutlined,
  PieChartOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { ChartComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeChart";
import { StatisticComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeStatistic";
import { TableComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeTable";
import type { EditorComponentMeta } from "../types";

export const reportEditorComponents: EditorComponentMeta[] = [
  {
    type: "statistic",
    name: "统计指标",
    icon: <DashboardOutlined />,
    sectionKey: "report",
    propsEditor: StatisticComponentProps,
  },
  {
    type: "table",
    name: "表格",
    icon: <TableOutlined />,
    sectionKey: "report",
    propsEditor: TableComponentProps,
  },
  {
    type: "barChart",
    name: "柱状图",
    icon: <BarChartOutlined />,
    sectionKey: "report",
    propsEditor: ChartComponentProps,
  },
  {
    type: "lineChart",
    name: "折线图",
    icon: <LineChartOutlined />,
    sectionKey: "report",
    propsEditor: ChartComponentProps,
  },
  {
    type: "pieChart",
    name: "饼图",
    icon: <PieChartOutlined />,
    sectionKey: "report",
    propsEditor: ChartComponentProps,
  },
  {
    type: "radarChart",
    name: "雷达图",
    icon: <PieChartOutlined />,
    sectionKey: "report",
    propsEditor: ChartComponentProps,
    hiddenFromPalette: true,
  },
  {
    type: "funnelChart",
    name: "漏斗图",
    icon: <BarChartOutlined />,
    sectionKey: "report",
    propsEditor: ChartComponentProps,
    hiddenFromPalette: true,
  },
];
