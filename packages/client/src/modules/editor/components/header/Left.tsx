import {
  ApartmentOutlined,
  CheckOutlined,
  EditOutlined,
  HomeOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { Dropdown, Input, Space } from "antd";
import type { MenuProps } from "antd";
import { useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

import { useStorePage } from "@/shared/hooks/useStorePage";

export default function Left(props: { title: string }) {
  const { setPageTitle } = useStorePage();
  const [isEditState, setIsEditState] = useState(false);
  const navigate = useNavigate();

  function handleEdit(event: ChangeEvent<HTMLInputElement>) {
    setPageTitle(event.target.value);
  }

  const publicProps = {
    className:
      "cursor-pointer text-slate-400 hover:text-emerald-500 transition-colors",
    onClick: () => setIsEditState(!isEditState),
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: "返回首页",
      onClick: () => navigate("/"),
    },
    {
      key: "page",
      icon: <EditOutlined />,
      label: "页面搭建",
      onClick: () => navigate("/editor"),
    },
    {
      key: "flow",
      icon: <ApartmentOutlined />,
      label: "流程设计",
      onClick: () => navigate("/flow"),
    },
    {
      key: "data",
      icon: <LineChartOutlined />,
      label: "后台数据",
      onClick: () => navigate("/dataCount"),
    },
  ];

  if (isEditState) {
    return (
      <Space size={10}>
        <Input
          value={props.title}
          onChange={handleEdit}
          className="w-64 !rounded-xl !border-slate-200 !bg-white !text-slate-900 focus:!border-emerald-500"
        />
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
          onClick={() => setIsEditState(false)}
        >
          <CheckOutlined />
        </div>
      </Space>
    );
  } else {
    return (
      <div className="flex items-center gap-4">
        <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
          <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 shadow-[0_10px_30px_-18px_rgba(16,185,129,0.85)] transition-all hover:-translate-y-0.5 hover:bg-emerald-500 hover:text-white">
            <span className="font-mono text-lg font-bold">C</span>
          </button>
        </Dropdown>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900">
              {props.title}
            </h1>
            <EditOutlined {...publicProps} />
          </div>
        </div>
      </div>
    );
  }
}
