import type { FC } from "react";
import {
  ContainerComponentProps,
  TwoColumnComponentProps,
  ButtonComponentProps,
  ImageComponentProps,
  SwiperComponentProps,
  VideoComponentProps,
  CardComponentProps,
  ListComponentProps,
  StatisticComponentProps,
  TableComponentProps,
  TextComponentProps,
  SplitComponentProps,
  EmptyComponentProps,
  RichTextComponentProps,
  QrcodeComponentProps,
  AlertComponentProps,
  InputComponentProps,
  CheckboxComponentProps,
  RadioComponentProps,
  ChartComponentProps,
} from "..";
import type { TBasicComponentConfig, TComponentTypes } from "@codigo/schema";

// @ts-ignore
export const componentPropsList: Record<TComponentTypes, FC<any>> = {
  container: ContainerComponentProps,
  twoColumn: TwoColumnComponentProps,
  button: ButtonComponentProps,
  video: VideoComponentProps,
  image: ImageComponentProps,
  swiper: SwiperComponentProps,
  card: CardComponentProps,
  list: ListComponentProps,
  statistic: StatisticComponentProps,
  table: TableComponentProps,
  titleText: TextComponentProps,
  split: SplitComponentProps,
  empty: EmptyComponentProps,
  richText: RichTextComponentProps,
  qrcode: QrcodeComponentProps,
  alert: AlertComponentProps,
  input: InputComponentProps,
  textArea: InputComponentProps,
  radio: RadioComponentProps,
  checkbox: CheckboxComponentProps,
  barChart: ChartComponentProps,
  lineChart: ChartComponentProps,
  pieChart: ChartComponentProps,
};

export function getComponentPropsByType(type: TBasicComponentConfig["type"]) {
  return componentPropsList[type];
}
