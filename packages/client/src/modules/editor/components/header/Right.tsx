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
      <Button
        onClick={toStatistics}
        type="text"
        className="flex items-center mr-5 text-gray-400 hover:text-emerald-400 transition-colors"
      >
        后台数据统计
        <LineChartOutlined />
      </Button>
      <div className="w-10 h-10 rounded-full border border-emerald-500/30 p-0.5 cursor-pointer hover:border-emerald-500/80 transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]">
        <img
          src="https://www.keaitupian.cn/cjpic/frombd/2/253/1465323558/580685714.jpg"
          className="w-full h-full rounded-full object-cover"
        />
      </div>
    </div>
  );
}
