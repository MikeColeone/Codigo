export type TComponentTypes =
  | "container"
  | "twoColumn"
  | "button"
  | "statistic"
  | "table"
  | "video"
  | "swiper"
  | "qrcode"
  | "card"
  | "list"
  | "image"
  | "titleText"
  | "split"
  | "richText"
  | "input"
  | "textArea"
  | "radio"
  | "checkbox"
  | "empty"
  | "alert"
  | "barChart"
  | "lineChart"
  | "pieChart";

export interface IComponentPropWarpper<T> {
  value: T;
  defaultValue: T;
  isHidden: boolean;
}

export interface TComponentStyles {
  position?: "absolute" | "relative";
  left?: number | string;
  top?: number | string;
  width?: number | string;
  height?: number | string;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
}

export interface ComponentMeta {
  locked?: boolean;
  hidden?: boolean;
  collapsed?: boolean;
}

export interface TBasicComponentConfig<
  T extends string = TComponentTypes,
  P extends Record<string, any> = object,
> {
  type: T;
  id: string;
  props: Partial<P>;
  styles?: TComponentStyles;
}

export interface ComponentNode<
  T extends string = TComponentTypes,
  P extends Record<string, any> = object,
> extends TBasicComponentConfig<T, P> {
  name?: string;
  slot?: string;
  children?: ComponentNode<T, P>[];
  meta?: ComponentMeta;
}

export interface ComponentNodeRecord<
  T extends string = TComponentTypes,
  P extends Record<string, any> = object,
> extends Omit<ComponentNode<T, P>, "children"> {
  parentId: string | null;
  childIds: string[];
}

// 剔除类型里面的可选
export type TransformedComponentConfig<P extends Record<string, any>> = {
  [key in keyof P]-?: IComponentPropWarpper<P[key]>;
};
