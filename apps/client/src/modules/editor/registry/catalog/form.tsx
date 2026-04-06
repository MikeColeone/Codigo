import {
  CheckCircleOutlined,
  CheckSquareOutlined,
  EditOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { CheckboxComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeCheckbox";
import { InputComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeInput";
import { RadioComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeRadio";
import type { EditorComponentMeta } from "../types";

export const formEditorComponents: EditorComponentMeta[] = [
  {
    type: "input",
    name: "输入框",
    icon: <EditOutlined />,
    sectionKey: "form",
    propsEditor: InputComponentProps,
  },
  {
    type: "textArea",
    name: "文本域",
    icon: <FormOutlined />,
    sectionKey: "form",
    propsEditor: InputComponentProps,
  },
  {
    type: "radio",
    name: "单选框",
    icon: <CheckCircleOutlined />,
    sectionKey: "form",
    propsEditor: RadioComponentProps,
  },
  {
    type: "checkbox",
    name: "多选框",
    icon: <CheckSquareOutlined />,
    sectionKey: "form",
    propsEditor: CheckboxComponentProps,
  },
];
