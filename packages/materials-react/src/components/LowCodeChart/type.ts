import type {
  TBasicComponentConfig,
  TransformedComponentConfig,
} from "@codigo/schema";

export interface IChartComponentProps {
  title: string;
  dataText: string;
  xAxisKey: string;
  yAxisKey: string;
  nameKey: string;
  valueKey: string;
  color: string;
  echartsTheme?: string;
}

export type TBarChartComponentConfig = TBasicComponentConfig<
  "barChart",
  IChartComponentProps
>;

export type TLineChartComponentConfig = TBasicComponentConfig<
  "lineChart",
  IChartComponentProps
>;

export type TPieChartComponentConfig = TBasicComponentConfig<
  "pieChart",
  IChartComponentProps
>;

export type TChartComponentConfigResult =
  TransformedComponentConfig<IChartComponentProps>;

const defaultData = [
  { name: "A", value: 40 },
  { name: "B", value: 20 },
  { name: "C", value: 30 },
];

export const chartComponentDefaultConfig: TChartComponentConfigResult = {
  title: {
    value: "图表标题",
    defaultValue: "图表标题",
    isHidden: false,
  },
  dataText: {
    value: JSON.stringify(defaultData),
    defaultValue: JSON.stringify(defaultData),
    isHidden: false,
  },
  xAxisKey: {
    value: "name",
    defaultValue: "name",
    isHidden: false,
  },
  yAxisKey: {
    value: "value",
    defaultValue: "value",
    isHidden: false,
  },
  nameKey: {
    value: "name",
    defaultValue: "name",
    isHidden: false,
  },
  valueKey: {
    value: "value",
    defaultValue: "value",
    isHidden: false,
  },
  color: {
    value: "#2563eb",
    defaultValue: "#2563eb",
    isHidden: false,
  },
};
