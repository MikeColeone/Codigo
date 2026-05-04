import { useEffect, useMemo, useState } from "react";
import { useTitle } from "ahooks";
import { Button, Empty, Spin, Tag, message } from "antd";
import type {
  AdminBigScreenDistributionItem,
  AdminBigScreenOverviewResponse,
} from "@codigo/schema";
import ReactECharts from "echarts-for-react";
import { ReloadOutlined } from "@ant-design/icons";
import { fetchAdminBigScreenOverview } from "@/modules/admin-console/api/big-screen";
import { BigScreenMetricCard } from "@/modules/admin-console/components/big-screen-metric-card";
import { BigScreenPanel } from "@/modules/admin-console/components/big-screen-panel";

/**
 * 格式化大数字，提升指标卡与榜单可读性。
 */
function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-CN").format(value);
}

/**
 * 将接口时间格式化为适合后台大屏展示的本地时间。
 */
function formatDateTime(value?: string) {
  if (!value) {
    return "--";
  }
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

/**
 * 构建近 7 天发布趋势折线图配置。
 */
function createTrendOption(data: AdminBigScreenOverviewResponse["publishTrend"]) {
  return {
    animationDuration: 400,
    grid: { left: 16, right: 16, top: 28, bottom: 20, containLabel: true },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(6, 18, 40, 0.96)",
      borderColor: "rgba(90, 150, 255, 0.35)",
      textStyle: { color: "#dce7ff" },
      valueFormatter: (value: number) => `${formatNumber(value)} 个`,
    },
    xAxis: {
      type: "category",
      data: data.map((item) => item.label),
      axisLine: { lineStyle: { color: "rgba(159, 184, 255, 0.18)" } },
      axisLabel: { color: "#89a0cb", fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "rgba(159, 184, 255, 0.08)" } },
      axisLabel: { color: "#89a0cb", fontSize: 11 },
    },
    series: [
      {
        name: "每日发布",
        type: "line",
        smooth: true,
        symbolSize: 8,
        data: data.map((item) => item.displayValue),
        lineStyle: { width: 3, color: "#5ac8fa" },
        itemStyle: { color: "#5ac8fa", borderColor: "#c4f0ff", borderWidth: 2 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(90, 200, 250, 0.35)" },
              { offset: 1, color: "rgba(90, 200, 250, 0.02)" },
            ],
          },
        },
      },
    ],
  };
}

/**
 * 构建环形统计图配置。
 */
function createDonutOption(data: AdminBigScreenDistributionItem[]) {
  return {
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(6, 18, 40, 0.96)",
      borderColor: "rgba(90, 150, 255, 0.35)",
      textStyle: { color: "#dce7ff" },
      formatter: "{b}<br/>{c} ({d}%)",
    },
    color: ["#5ac8fa", "#7c6cff", "#30d19c", "#ffb020", "#ff6f91", "#00d1ff"],
    legend: {
      bottom: 0,
      textStyle: { color: "#89a0cb", fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
    },
    series: [
      {
        type: "pie",
        radius: ["58%", "74%"],
        center: ["50%", "42%"],
        avoidLabelOverlap: true,
        label: { color: "#dce7ff", formatter: "{b}\n{c}" },
        labelLine: { lineStyle: { color: "rgba(159, 184, 255, 0.2)" } },
        data,
      },
    ],
  };
}

/**
 * 构建物料使用排行图配置。
 */
function createMaterialOption(data: AdminBigScreenOverviewResponse["componentTypeStats"]) {
  const safeData = [...data].slice(0, 6).reverse();
  return {
    animationDuration: 400,
    grid: { left: 12, right: 16, top: 12, bottom: 12, containLabel: true },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "rgba(6, 18, 40, 0.96)",
      borderColor: "rgba(90, 150, 255, 0.35)",
      textStyle: { color: "#dce7ff" },
      valueFormatter: (value: number) => `${formatNumber(value)} 个`,
    },
    xAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "rgba(159, 184, 255, 0.08)" } },
      axisLabel: { color: "#89a0cb", fontSize: 11 },
    },
    yAxis: {
      type: "category",
      data: safeData.map((item) => item.type),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#c5d7ff", fontSize: 11 },
    },
    series: [
      {
        type: "bar",
        data: safeData.map((item) => item.instanceCount),
        barWidth: 10,
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: "#2de0ff" },
              { offset: 1, color: "#8f7dff" },
            ],
          },
        },
      },
    ],
  };
}

/**
 * 数据大屏页面：展示发布、模板、物料与协作相关统计。
 */
export default function AdminBigScreen() {
  useTitle("Codigo - 数据大屏");
  const [data, setData] = useState<AdminBigScreenOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 加载大屏概览数据。
   */
  const loadData = async () => {
    setLoading(true);
    try {
      const nextData = await fetchAdminBigScreenOverview();
      setData(nextData);
    } catch (error: any) {
      message.error(error?.response?.data?.msg ?? "数据大屏加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const metrics = useMemo(() => {
    if (!data) {
      return [];
    }

    return [
      {
        label: "我的站点",
        value: formatNumber(data.summary.publishedSiteCount),
        detail: `今日新增 ${formatNumber(data.summary.publishedTodayCount)} 个`,
        accent: "linear-gradient(90deg, #2de0ff, #6ba6ff)",
      },
      {
        label: "模板总量",
        value: formatNumber(data.summary.templateCount),
        detail: `已发布模板 ${formatNumber(data.summary.publishedTemplateCount)} 个`,
        accent: "linear-gradient(90deg, #7c6cff, #b889ff)",
      },
      {
        label: "物料类型",
        value: formatNumber(data.summary.materialTypeCount),
        detail: `物料实例 ${formatNumber(data.summary.materialInstanceCount)} 个`,
        accent: "linear-gradient(90deg, #30d19c, #58f2b0)",
      },
      {
        label: "模拟 PV",
        value: formatNumber(data.summary.pageViewCount),
        detail: "当前版本先使用 mock 访问量",
        accent: "linear-gradient(90deg, #ffb020, #ffd36b)",
      },
      {
        label: "模拟 UV",
        value: formatNumber(data.summary.uniqueVisitorCount),
        detail: `协作页面 ${formatNumber(data.summary.collaborationPageCount)} 个`,
        accent: "linear-gradient(90deg, #ff6f91, #ff9d6c)",
      },
      {
        label: "发布版本",
        value: formatNumber(data.summary.versionCount),
        detail: `平均每站 ${data.summary.averageComponentsPerSite} 个组件`,
        accent: "linear-gradient(90deg, #5ac8fa, #30d19c)",
      },
    ];
  }, [data]);

  if (loading && !data) {
    return (
      <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(51,125,255,0.18),transparent_35%),#050b17]">
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(51,125,255,0.18),transparent_35%),#050b17] p-6">
        <Empty
          description={<span className="text-[#c9d7ff]">暂无可展示的大屏数据</span>}
        >
          <Button type="primary" onClick={() => void loadData()}>
            重新加载
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="min-h-full overflow-auto bg-[radial-gradient(circle_at_top,rgba(51,125,255,0.22),transparent_35%),linear-gradient(180deg,#07111f_0%,#040912_100%)] p-4 text-white">
      <div className="mx-auto max-w-[1680px]">
        <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(9,18,36,0.88),rgba(6,13,26,0.96))] p-5 shadow-[0_32px_100px_rgba(0,0,0,0.4)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[12px] uppercase tracking-[0.26em] text-[#76a3ff]">
                Codigo Studio Observatory
              </div>
              <h2 className="mt-2 text-[28px] font-semibold tracking-[0.06em] text-white">
                数据大屏
              </h2>
              <div className="mt-2 max-w-[760px] text-[13px] leading-6 text-[#9cb2d8]">
                聚合当前账号自己的发布站点数据，以及系统模板与物料概览；图表默认展示近
                7 天走势，PV / UV 当前先用 mock 口径补形态，方便演示与截图。
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Tag color="blue">更新时间 {formatDateTime(data.generatedAt)}</Tag>
              {data.mockedSections.length > 0 ? (
                <Tag color="gold">含 mock 区块 {data.mockedSections.length}</Tag>
              ) : (
                <Tag color="green">全部真实数据</Tag>
              )}
              <Button
                icon={<ReloadOutlined />}
                onClick={() => void loadData()}
                loading={loading}
              >
                刷新
              </Button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {metrics.map((item) => (
              <BigScreenMetricCard key={item.label} {...item} />
            ))}
          </div>

          <div className="mt-5 grid grid-cols-12 gap-4">
            <BigScreenPanel
              title="发布趋势"
              subtitle="按天展示当前账号最近 7 天发布站点数量"
              extra={
                <div className="text-[11px] text-[#89a0cb]">
                  发布动作 {formatNumber(data.summary.publishActionCount)} 次
                </div>
              }
              className="col-span-12 xl:col-span-7"
            >
              <ReactECharts option={createTrendOption(data.publishTrend)} style={{ height: 320 }} />
            </BigScreenPanel>

            <BigScreenPanel
              title="站点可见性"
              subtitle="当前账号公开 / 私密 发布结构"
              className="col-span-12 md:col-span-6 xl:col-span-5"
            >
              <ReactECharts
                option={createDonutOption(data.visibilityStats)}
                style={{ height: 320 }}
              />
            </BigScreenPanel>

            <BigScreenPanel
              title="物料使用排行"
              subtitle="按当前账号已发布站点中的实例数量统计"
              className="col-span-12 xl:col-span-6"
            >
              <ReactECharts
                option={createMaterialOption(data.componentTypeStats)}
                style={{ height: 300 }}
              />
            </BigScreenPanel>

            <BigScreenPanel
              title="模板标签分布"
              subtitle="观察当前模板能力的主题覆盖情况"
              className="col-span-12 md:col-span-6 xl:col-span-3"
            >
              <ReactECharts
                option={createDonutOption(data.templateTagStats)}
                style={{ height: 300 }}
              />
            </BigScreenPanel>

            <BigScreenPanel
              title="布局模式"
              subtitle="页面配置结构概览"
              className="col-span-12 md:col-span-6 xl:col-span-3"
            >
              <ReactECharts
                option={createDonutOption(data.layoutModeStats)}
                style={{ height: 300 }}
              />
            </BigScreenPanel>

            <BigScreenPanel
              title="最近发布动态"
              subtitle="展示当前账号最近版本发布记录与可见性"
              className="col-span-12 xl:col-span-8"
            >
              <div className="space-y-3">
                {data.recentReleases.map((item) => (
                  <div
                    key={`${item.pageId}-${item.version}-${item.publishedAt}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-white/8 bg-white/[0.03] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[14px] font-medium text-[#e5eeff]">
                        {item.pageName || `站点 ${item.pageId}`}
                      </div>
                      <div className="mt-1 text-[11px] text-[#8fa8d8]">
                        发布者 {item.ownerName || "未知"} · V{item.version}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#8fa8d8]">
                      <Tag color={item.visibility === "public" ? "green" : "purple"}>
                        {item.visibility === "public" ? "公开" : "私密"}
                      </Tag>
                      <span>{formatDateTime(item.publishedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </BigScreenPanel>

            <BigScreenPanel
              title="运行摘要"
              subtitle="适合答辩截图展示的核心补充指标"
              className="col-span-12 xl:col-span-4"
            >
              <div className="space-y-3">
                {[
                  ["公开站点", data.summary.publicSiteCount],
                  ["私密站点", data.summary.privateSiteCount],
                  ["即将过期", data.summary.expiringSiteCount],
                  ["协作者数量", data.summary.collaboratorCount],
                  ["平均组件密度", data.summary.averageComponentsPerSite],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="rounded-[16px] border border-white/8 bg-white/[0.03] px-4 py-3"
                  >
                    <div className="text-[11px] uppercase tracking-[0.18em] text-[#7f96bf]">
                      {label}
                    </div>
                    <div className="mt-2 text-[24px] font-semibold text-white">
                      {typeof value === "number" ? value : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </BigScreenPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
