import type {
  TBasicComponentConfig,
  TransformedComponentConfig,
} from "@codigo/schema";

export interface ITextAreaComponentProps {
  title: string;
  text: string;
  placeholder: string;
  rows: number;
  onUpdate?: (value: string) => void;
}

export type TTextAreaComponentConfig = TBasicComponentConfig<
  "textArea",
  ITextAreaComponentProps
>;

export type TTextAreaComponentConfigResult =
  TransformedComponentConfig<ITextAreaComponentProps>;

export const textAreaComponentDefaultConfig: TTextAreaComponentConfigResult = {
  placeholder: {
    value: "请输入详细内容",
    defaultValue: "请输入详细内容",
    isHidden: false,
  },
  text: {
    value: "",
    defaultValue: "",
    isHidden: false,
  },
  title: {
    value: "请输入说明",
    defaultValue: "请输入说明",
    isHidden: false,
  },
  rows: {
    value: 4,
    defaultValue: 4,
    isHidden: false,
  },
  onUpdate: {
    value: undefined,
    defaultValue: undefined,
    isHidden: true,
  },
};
