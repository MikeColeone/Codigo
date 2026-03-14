import { Button } from "antd";
import { LineChartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export default function Right() {
  const navigate = useNavigate();
  const toStatistics = () => {
    navigate("/dataCount");
  };

  return (
    <div className="flex items-center">
      <Button onClick={toStatistics} className="flex items-center mr-5">
        后台数据统计
        <LineChartOutlined />
      </Button>
      <div className="w-10">
        <img
          src="https://www.keaitupian.cn/cjpic/frombd/2/253/1465323558/580685714.jpg"
          className="rounded-full border cursor-pointer object-contain"
        />
      </div>
    </div>
  );
}
