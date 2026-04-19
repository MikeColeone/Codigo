import { Input, InputNumber } from "antd";
import { useMemo } from "react";
import {
  fillComponentPropsByConfig,
  textAreaComponentDefaultConfig,
  type ITextAreaComponentProps,
} from "@codigo/materials";
import { FormContainer, FormPropLabel } from "..";

export default function TextAreaComponentProps(_props: ITextAreaComponentProps) {
  const props = useMemo(() => {
    return fillComponentPropsByConfig(_props, textAreaComponentDefaultConfig);
  }, [_props]);

  return (
    <FormContainer layout="vertical" config={props}>
      <FormPropLabel prop={props.title} name="title" label="标题：">
        <Input />
      </FormPropLabel>
      <FormPropLabel prop={props.text} name="text" label="默认内容：">
        <Input.TextArea autoSize={{ minRows: 3, maxRows: 8 }} />
      </FormPropLabel>
      <FormPropLabel
        prop={props.placeholder}
        name="placeholder"
        label="占位符："
      >
        <Input />
      </FormPropLabel>
      <FormPropLabel prop={props.rows} name="rows" label="显示行数：">
        <InputNumber min={2} max={12} className="!w-full" />
      </FormPropLabel>
    </FormContainer>
  );
}
