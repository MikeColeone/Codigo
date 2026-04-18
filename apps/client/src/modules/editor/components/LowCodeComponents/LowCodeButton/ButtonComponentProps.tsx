import { useMemo } from "react";
import { Input, Segmented, Switch } from "antd";
import type { SegmentedLabeledOption } from "antd/es/segmented";
import {
  type IButtonComponentProps,
  buttonComponentDefaultConfig,
  fillComponentPropsByConfig,
} from "@codigo/materials";
import { FormContainer, FormPropLabel } from "..";

export default function ButtonComponentProps(_props: IButtonComponentProps) {
  const props = useMemo(() => {
    return fillComponentPropsByConfig(_props, buttonComponentDefaultConfig);
  }, [_props]);

  const typeOptions: SegmentedLabeledOption[] = [
    { value: "primary", label: "主按钮" },
    { value: "default", label: "默认" },
    { value: "dashed", label: "虚线" },
    { value: "link", label: "链接" },
    { value: "text", label: "文本" },
  ];

  const sizeOptions: SegmentedLabeledOption[] = [
    { value: "large", label: "大" },
    { value: "middle", label: "中" },
    { value: "small", label: "小" },
  ];

  return (
    <FormContainer config={props}>
      <FormPropLabel name="text" prop={props.text} label="按钮文案：">
        <Input />
      </FormPropLabel>
      <FormPropLabel name="type" prop={props.type} label="按钮类型：">
        <div className="w-full overflow-x-auto">
          <div className="min-w-max">
            <Segmented options={typeOptions} size="small" />
          </div>
        </div>
      </FormPropLabel>
      <FormPropLabel name="size" prop={props.size} label="按钮尺寸：">
        <div className="w-full overflow-x-auto">
          <div className="min-w-max">
            <Segmented options={sizeOptions} size="small" />
          </div>
        </div>
      </FormPropLabel>
      <FormPropLabel
        name="danger"
        prop={props.danger}
        label="危险按钮："
        valuePropName="checked"
      >
        <Switch />
      </FormPropLabel>
      <FormPropLabel
        name="block"
        prop={props.block}
        label="铺满容器："
        valuePropName="checked"
      >
        <Switch />
      </FormPropLabel>
    </FormContainer>
  );
}
