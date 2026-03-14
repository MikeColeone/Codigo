import {
  CheckCircleOutlined,
  CheckSquareOutlined,
  CreditCardOutlined,
  EditOutlined,
  ExpandOutlined,
  FontColorsOutlined,
  FontSizeOutlined,
  FormOutlined,
  FundViewOutlined,
  MinusOutlined,
  PlaySquareOutlined,
  SplitCellsOutlined,
  UnorderedListOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Divider } from "antd";
import type { FC, ReactNode } from "react";
import { useStoreComponents } from "@/shared/hooks";

// 不同组件配置数组
export const components = [
  {
    type: "video",
    name: "视频组件",
    icon: <PlaySquareOutlined />,
  },
  {
    type: "swiper",
    name: "轮播组件",
    icon: <SplitCellsOutlined />,
  },
  {
    type: "card",
    name: "卡片组件",
    icon: <CreditCardOutlined />,
  },
  {
    type: "list",
    name: "列表组件",
    icon: <UnorderedListOutlined />,
  },
  {
    type: "image",
    name: "图片组件",
    icon: <FundViewOutlined />,
  },
  {
    type: "titleText",
    name: "文本组件",
    icon: <FontSizeOutlined />,
  },
  {
    type: "split",
    name: "分割组件",
    icon: <MinusOutlined />,
  },
  {
    type: "richText",
    name: "富文本组件",
    icon: <FontColorsOutlined />,
  },
  {
    type: "empty",
    name: "空状态组件",
    icon: <ExpandOutlined />,
  },
  {
    type: "alert",
    name: "警告信息组件",
    icon: <WarningOutlined />,
  },
];

// 不同输入型组件配置数组
const componentByUserInput = [
  {
    type: "input",
    name: "输入框组件",
    icon: <EditOutlined />,
  },
  {
    type: "textArea",
    name: "文本域组件",
    icon: <FormOutlined />,
  },
  {
    type: "radio",
    name: "单选框组件",
    icon: <CheckCircleOutlined />,
  },
  {
    type: "checkbox",
    name: "多选框组件",
    icon: <CheckSquareOutlined />,
  },
];

interface ComponentProps {
  name: string;
  icon: ReactNode;
  type: string;
}

// 公共样式组件
const EditorComponent: FC<ComponentProps> = ({ icon, name, type }) => {
  const store = useStoreComponents();
  // 将要展示的组件类型告诉 store
  function handleClick() {
    // @ts-ignore
    store.push(type);
  }
  return (
    <div
      onClick={handleClick}
      className="group relative flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 p-4 text-xs text-gray-400 cursor-pointer select-none transition-all hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:-translate-y-1"
    >
      <div className="text-xl text-emerald-500/70 group-hover:text-emerald-400 transition-colors">
        {icon}
      </div>
      <span className="font-medium">{name}</span>
    </div>
  );
};

// 不同组件列表
export default function ComponentList() {
  return (
    <div>
      <div className="mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider pl-1">
        基础组件
      </div>
      <div className="grid grid-cols-2 gap-3">
        {components.map((item, index) => (
          <EditorComponent {...item} key={index} />
        ))}
      </div>

      <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      <div className="mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider pl-1">
        表单组件
      </div>
      <div className="grid grid-cols-2 gap-3">
        {componentByUserInput.map((item, index) => (
          <EditorComponent {...item} key={index} />
        ))}
      </div>
    </div>
  );
}
