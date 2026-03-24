import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { getDefaultValueByConfig } from "..";
import { chartComponentDefaultConfig, type IChartComponentProps } from "./type";
import { getDefaultEChartsTheme } from "../../utils/echartsTheme";

function parseJsonText<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

export default function LineChartComponent(_props: IChartComponentProps) {
  const echartsTheme = _props.echartsTheme ?? getDefaultEChartsTheme();
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(chartComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

  const ds = useMemo(() => {
    return parseJsonText<Record<string, unknown>[]>(props.dataText, []);
  }, [props.dataText]);

  const option = useMemo(() => {
    return {
      title: {
        text: props.title,
        textStyle: { fontSize: 14, fontWeight: 600 },
        top: 10,
        left: 10,
      },
      grid: { left: 40, right: 20, top: 50, bottom: 30, containLabel: true },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: ds.map((r) => r[props.xAxisKey]),
        axisTick: { show: false },
      },
      yAxis: { type: "value" },
      series: [
        {
          type: "line",
          smooth: true,
          data: ds.map((r) => r[props.yAxisKey]),
          itemStyle: { color: props.color },
          lineStyle: { color: props.color, width: 2 },
          symbol: "circle",
          symbolSize: 6,
        },
      ],
    };
  }, [props, ds]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "300px",
        backgroundColor: "#fff",
      }}
    >
      <ReactECharts
        option={option}
        theme={echartsTheme}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}
