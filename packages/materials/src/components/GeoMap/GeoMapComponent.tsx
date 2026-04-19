import React, { useCallback, useMemo, useRef } from "react";
import ReactECharts from "echarts-for-react";
import { getDefaultValueByConfig } from "..";
import { deepMerge } from "../../utils/deepMerge";
import { getDefaultEChartsTheme } from "../../utils/echartsTheme";
import {
  GEO_MAP_PICK_EVENT,
  geoMapComponentDefaultConfig,
  type GeoMapRegionKey,
  type IGeoMapComponentProps,
} from ".";

type RuntimeGeoMapProps = IGeoMapComponentProps & {
  runtimeHeight?: string | number;
  runtimeEnv?: "editor" | "preview" | "release";
  editorNodeId?: string;
  echartsTheme?: string;
};

type ChartInstanceLike = {
  convertFromPixel: (
    finder: { xAxisIndex: number; yAxisIndex: number },
    value: [number, number],
  ) => [number, number];
  resize: () => void;
};

type MarkerEntry = {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  value?: string;
  color: string;
  size: number;
};

type RegionEntry = {
  key: GeoMapRegionKey;
  label: string;
  value?: string;
  color: string;
  anchor: [number, number];
  polygons: Array<Array<[number, number]>>;
};

type ChartClickParams = {
  event?: {
    event?: {
      offsetX?: number;
      offsetY?: number;
    };
  };
};

const WORLD_REGIONS: Record<
  GeoMapRegionKey,
  { label: string; anchor: [number, number]; polygons: Array<Array<[number, number]>> }
> = {
  "north-america": {
    label: "North America",
    anchor: [-108, 48],
    polygons: [
      [
        [-168, 16],
        [-158, 52],
        [-142, 70],
        [-118, 74],
        [-88, 68],
        [-62, 50],
        [-78, 16],
        [-112, 8],
      ],
    ],
  },
  "south-america": {
    label: "South America",
    anchor: [-60, -18],
    polygons: [
      [
        [-82, 10],
        [-70, -8],
        [-64, -22],
        [-54, -38],
        [-46, -56],
        [-38, -42],
        [-44, -8],
        [-58, 8],
      ],
    ],
  },
  europe: {
    label: "Europe",
    anchor: [16, 52],
    polygons: [
      [
        [-12, 36],
        [0, 58],
        [22, 66],
        [44, 58],
        [30, 40],
        [8, 36],
      ],
    ],
  },
  africa: {
    label: "Africa",
    anchor: [20, 4],
    polygons: [
      [
        [-18, 34],
        [18, 38],
        [42, 20],
        [48, -22],
        [20, -36],
        [-2, -22],
        [-10, 8],
      ],
    ],
  },
  asia: {
    label: "Asia",
    anchor: [96, 42],
    polygons: [
      [
        [38, 8],
        [58, 42],
        [76, 64],
        [118, 72],
        [154, 58],
        [170, 30],
        [138, 8],
        [92, 0],
        [54, 4],
      ],
    ],
  },
  oceania: {
    label: "Oceania",
    anchor: [132, -24],
    polygons: [
      [
        [112, -12],
        [154, -12],
        [166, -34],
        [126, -44],
        [112, -26],
      ],
    ],
  },
};

/**
 * 将数值约束在地理坐标允许的范围内，避免交互取点写入非法值。
 */
function clampCoordinate(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Number(value.toFixed(4))));
}

/**
 * 安全解析用户配置中的高级 ECharts JSON，失败时回退为空对象。
 */
function parseOptionText(optionText: string) {
  const text = optionText.trim();
  if (!text) {
    return {};
  }

  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

export default function GeoMapComponent(_props: RuntimeGeoMapProps) {
  const chartRef = useRef<ChartInstanceLike | null>(null);
  const props = useMemo(
    () => ({
      ...getDefaultValueByConfig(geoMapComponentDefaultConfig),
      ..._props,
    }),
    [_props],
  );
  const theme = props.echartsTheme ?? getDefaultEChartsTheme();
  const hasRuntimeHeight = props.runtimeHeight !== undefined;

  const markers = useMemo<MarkerEntry[]>(() => {
    const list = Array.isArray(props.markers) ? props.markers : [];
    return list.map((item, index) => ({
      id: item.id || `marker-${index + 1}`,
      name: item.name || `Marker ${index + 1}`,
      longitude: clampCoordinate(Number(item.longitude ?? 0), -180, 180),
      latitude: clampCoordinate(Number(item.latitude ?? 0), -90, 90),
      value: item.value,
      color: item.color || props.markerColor,
      size: Math.max(8, Math.min(28, Number(item.size ?? 14))),
    }));
  }, [props.markerColor, props.markers]);

  const regions = useMemo<RegionEntry[]>(() => {
    const highlightMap = new Map(
      (Array.isArray(props.highlightRegions) ? props.highlightRegions : [])
        .filter((item) => item?.regionKey && WORLD_REGIONS[item.regionKey])
        .map((item) => [
          item.regionKey,
          {
            color: item.color || props.defaultRegionColor,
            value: item.value,
            label: item.label || WORLD_REGIONS[item.regionKey].label,
          },
        ]),
    );

    return Object.entries(WORLD_REGIONS).map(([regionKey, definition]) => {
      const highlighted = highlightMap.get(regionKey as GeoMapRegionKey);
      return {
        key: regionKey as GeoMapRegionKey,
        label: highlighted?.label || definition.label,
        value: highlighted?.value,
        color: highlighted?.color || props.defaultRegionColor,
        anchor: definition.anchor,
        polygons: definition.polygons,
      };
    });
  }, [props.defaultRegionColor, props.highlightRegions]);

  const baseOption = useMemo(() => {
    const legendItems = props.showLegend
      ? [
          ...regions
            .filter((item) =>
              (Array.isArray(props.highlightRegions) ? props.highlightRegions : []).some(
                (highlighted) => highlighted.regionKey === item.key,
              ),
            )
            .map((item, index) => ({
              type: "group",
              left: 18 + index * 160,
              bottom: 10,
              children: [
                {
                  type: "rect",
                  shape: { x: 0, y: 0, width: 10, height: 10, r: 3 },
                  style: { fill: item.color, stroke: props.regionBorderColor, lineWidth: 1 },
                },
                {
                  type: "text",
                  left: 16,
                  top: -2,
                  style: {
                    text: item.value ? `${item.label}  ${item.value}` : item.label,
                    fill: "#556377",
                    fontSize: 11,
                  },
                },
              ],
            })),
          {
            type: "group",
            right: 18,
            bottom: 10,
            children: [
              {
                type: "circle",
                shape: { cx: 5, cy: 5, r: 5 },
                style: { fill: props.markerColor },
              },
              {
                type: "text",
                left: 16,
                top: -2,
                style: {
                  text: `Markers ${markers.length}`,
                  fill: "#556377",
                  fontSize: 11,
                },
              },
            ],
          },
        ]
      : [];

    return {
      backgroundColor: props.backgroundColor,
      animationDuration: 240,
      grid: {
        left: 18,
        right: 18,
        top: 58,
        bottom: props.showLegend ? 46 : 22,
        containLabel: false,
      },
      xAxis: {
        min: -180,
        max: 180,
        show: false,
      },
      yAxis: {
        min: -90,
        max: 90,
        show: false,
      },
      tooltip: {
        trigger: "item",
        formatter(params: { seriesType?: string; name?: string; data?: Record<string, unknown> }) {
          if (params.seriesType === "effectScatter") {
            const markerValue =
              typeof params.data?.displayValue === "string"
                ? `<div style="margin-top:4px;color:#556377;">${params.data.displayValue}</div>`
                : "";
            return `<div style="font-weight:600;">${params.name ?? "Marker"}</div>${markerValue}`;
          }

          const regionValue =
            typeof params.data?.displayValue === "string"
              ? `<div style="margin-top:4px;color:#556377;">${params.data.displayValue}</div>`
              : "";
          return `<div style="font-weight:600;">${params.name ?? "Region"}</div>${regionValue}`;
        },
      },
      graphic: [
        {
          type: "text",
          left: 18,
          top: 16,
          style: {
            text: props.title,
            fontSize: 13,
            fontWeight: 700,
            fill: "#243447",
          },
        },
        {
          type: "text",
          left: 18,
          top: 36,
          style: {
            text: props.subtitle,
            fontSize: 11,
            fill: "#7c889b",
          },
        },
        {
          type: "rect",
          left: 18,
          top: 58,
          shape: { width: "100%", height: "100%" },
          style: {
            fill: props.oceanColor,
          },
          z: -10,
        },
        {
          type: "text",
          right: 18,
          top: 16,
          style: {
            text: props.interactionHint,
            fontSize: 10,
            fill: "#7c889b",
            align: "right",
          },
        },
        ...legendItems,
      ],
      series: [
        {
          type: "custom",
          coordinateSystem: "cartesian2d",
          silent: true,
          data: regions.map((region) => ({
            name: region.label,
            displayValue: region.value,
          })),
          renderItem(params: { dataIndex: number }, api: { coord: (value: [number, number]) => number[] }) {
            const region = regions[params.dataIndex];
            const children = region.polygons.map((polygon) => ({
              type: "polygon",
              shape: {
                points: polygon.map((point) => api.coord(point)),
              },
              style: {
                fill: region.color,
                stroke: props.regionBorderColor,
                lineWidth: 1.2,
                opacity: 1,
              },
            }));

            if (props.showLabels) {
              const [labelX, labelY] = api.coord(region.anchor);
              children.push({
                type: "text",
                style: {
                  text: region.label,
                  fill: "#556377",
                  fontSize: 11,
                  fontWeight: 600,
                },
                x: labelX,
                y: labelY,
                z: 10,
              });
            }

            return {
              type: "group",
              children,
            };
          },
        },
        {
          name: "Markers",
          type: "effectScatter",
          coordinateSystem: "cartesian2d",
          z: 12,
          rippleEffect: {
            scale: 2.4,
            brushType: "stroke",
          },
          data: markers.map((item) => ({
            name: item.name,
            value: [item.longitude, item.latitude, item.size],
            itemStyle: { color: item.color },
            symbolSize: item.size,
            displayValue: item.value,
            label: props.showLabels
              ? {
                  show: true,
                  position: "top",
                  color: "#243447",
                  fontSize: 11,
                  formatter: item.name,
                }
              : { show: false },
          })),
        },
      ],
    };
  }, [
    markers,
    props.backgroundColor,
    props.interactionHint,
    props.markerColor,
    props.oceanColor,
    props.regionBorderColor,
    props.showLabels,
    props.showLegend,
    props.subtitle,
    props.title,
    props.highlightRegions,
    regions,
  ]);

  const option = useMemo(() => {
    return deepMerge(baseOption, parseOptionText(props.optionText));
  }, [baseOption, props.optionText]);

  /**
   * 编辑器态允许直接点击地图拾取坐标，并把结果广播给右侧属性面板。
   */
  const handleChartClick = useCallback(
    (params: ChartClickParams) => {
      if (
        props.runtimeEnv !== "editor" ||
        !props.editorNodeId ||
        typeof window === "undefined" ||
        !chartRef.current
      ) {
        return;
      }

      const offsetX = params.event?.event?.offsetX;
      const offsetY = params.event?.event?.offsetY;
      if (!Number.isFinite(offsetX) || !Number.isFinite(offsetY)) {
        return;
      }

      const [longitude, latitude] = chartRef.current.convertFromPixel(
        { xAxisIndex: 0, yAxisIndex: 0 },
        [offsetX as number, offsetY as number],
      );

      if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
        return;
      }

      window.dispatchEvent(
        new CustomEvent(GEO_MAP_PICK_EVENT, {
          detail: {
            nodeId: props.editorNodeId,
            longitude: clampCoordinate(longitude, -180, 180),
            latitude: clampCoordinate(latitude, -90, 90),
          },
        }),
      );
    },
    [props.editorNodeId, props.runtimeEnv],
  );

  return (
    <div
      style={{
        width: "100%",
        height: hasRuntimeHeight ? "100%" : "320px",
        minHeight: hasRuntimeHeight ? undefined : "320px",
        backgroundColor: props.backgroundColor,
        borderRadius: 18,
        overflow: "hidden",
      }}
    >
      <ReactECharts
        option={option}
        theme={theme}
        style={{ width: "100%", height: "100%" }}
        onEvents={{ click: handleChartClick }}
        onChartReady={(chart) => {
          chartRef.current = chart as unknown as ChartInstanceLike;
          chart.resize();
        }}
      />
    </div>
  );
}
