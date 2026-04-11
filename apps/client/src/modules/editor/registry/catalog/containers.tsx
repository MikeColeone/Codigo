import { LayoutOutlined } from "@ant-design/icons";
import { ContainerComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeContainer";
import { TwoColumnComponentProps } from "@/modules/editor/components/LowCodeComponents/LowCodeTwoColumn";
import type { EditorComponentMeta } from "../types";

export const containerEditorComponents: EditorComponentMeta[] = [
  {
    type: "container",
    name: "容器",
    icon: <LayoutOutlined />,
    sectionKey: "container",
    propsEditor: ContainerComponentProps,
  },
  {
    type: "twoColumn",
    name: "双栏布局",
    icon: <LayoutOutlined />,
    sectionKey: "container",
    propsEditor: TwoColumnComponentProps,
  },
];

