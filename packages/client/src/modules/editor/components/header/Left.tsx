import { CheckOutlined, EditOutlined } from "@ant-design/icons";
import { Input, Space } from "antd";
import { useState } from "react";
import type { ChangeEvent } from "react";

import { useStorePage } from "@/shared/hooks/useStorePage";

export default function Left(props: { title: string }) {
  const { setPageTitle } = useStorePage();
  const [isEditState, setIsEditState] = useState(false);

  // 确认按钮方法
  function handleEdit(event: ChangeEvent<HTMLInputElement>) {
    setPageTitle(event.target.value);
  }

  // 标题的样式和按钮点击方法
  const publicProps = {
    className:
      "cursor-pointer ml-2 text-gray-400 hover:text-emerald-400 transition-colors",
    onClick: () => setIsEditState(!isEditState),
  };

  // 判断是否展示编辑还是显示状态
  if (isEditState) {
    return (
      <Space>
        <Input
          value={props.title}
          onChange={handleEdit}
          className="w-48 !bg-white/5 !border-white/20 !text-white focus:!border-emerald-500"
        />
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
          onClick={() => setIsEditState(false)}
        >
          <CheckOutlined />
        </div>
      </Space>
    );
  } else {
    return (
      <div className="flex items-center group">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mr-3 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
          <span className="font-mono text-lg font-bold">C</span>
        </div>
        <h1 className="text-lg font-bold text-white tracking-tight">
          {props.title}
        </h1>
        <EditOutlined {...publicProps} />
      </div>
    );
  }
}
