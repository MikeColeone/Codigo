import { ColorPicker, Input, InputNumber, Segmented } from "antd";
import { useMemo } from "react";

import type {
  IQrcodeComponentProps,
  TQrcodeComponentConfig,
} from "@codigo/materials";
import {
  fillComponentPropsByConfig,
  qrcodeComponentDefaultConfig,
} from "@codigo/materials";
import { FormContainer, FormPropLabel, UploadEditOrChooiseInput } from "../utils/components";
import { useEditorComponents } from "@/modules/editor/hooks";

type PickerColor = {
  toHex: () => string;
};

export default function QrcodeComponentProps(_props: IQrcodeComponentProps) {
  const { updateCurrentComponent } = useEditorComponents();
  const props = useMemo(() => {
    return fillComponentPropsByConfig(_props, qrcodeComponentDefaultConfig);
  }, [_props]);

  // 判断是改变了二维码颜色和背景颜色的事件
  function handleValuesChangeAfter(
    changedValues: TQrcodeComponentConfig["props"],
  ) {
    if (changedValues["bgColor"] !== undefined) {
      updateCurrentComponent({
        bgColor: `#${(
          changedValues["bgColor"] as unknown as PickerColor
        ).toHex()}`,
      });
    } else if (changedValues["color"] !== undefined) {
      updateCurrentComponent({
        color: `#${(changedValues["color"] as unknown as PickerColor).toHex()}`,
      });
    }
  }

  return (
    <FormContainer config={props} onValuesChangeAfter={handleValuesChangeAfter}>
      <FormPropLabel prop={props.value} name="value" label="二维码内容：">
        <Input />
      </FormPropLabel>
      <FormPropLabel
        prop={props.bgColor}
        name="bgColor"
        label="二维码背景颜色："
      >
        <ColorPicker showText />
      </FormPropLabel>
      <FormPropLabel prop={props.color} name="color" label="二维码颜色：">
        <ColorPicker showText />
      </FormPropLabel>
      <FormPropLabel prop={props.icon} name="icon" label="中心图标：">
        <UploadEditOrChooiseInput propName="icon" type="image" />
      </FormPropLabel>
      <FormPropLabel prop={props.iconSize} name="iconSize" label="图标尺寸：">
        <InputNumber min={8} max={48} className="!w-full" />
      </FormPropLabel>
      <FormPropLabel
        prop={props.errorLevel}
        name="errorLevel"
        label="二维码容错率："
      >
        <Segmented options={["L", "M", "Q", "H"]} />
      </FormPropLabel>
      <FormPropLabel prop={props.size} name="size" label="二维码大小：">
        <Input type="number" max={375} min={80} />
      </FormPropLabel>
    </FormContainer>
  );
}
