import type { TemplateComponent, TemplatePagePreset, TemplatePreset } from '@codigo/schema';

const CANVAS_WIDTH = 1440;
const CANVAS_HEIGHT = 1280;

function withStyles(
  component: TemplateComponent,
  styles?: Record<string, unknown>,
): TemplateComponent {
  if (!styles) return component;
  return {
    ...component,
    styles: {
      ...(component.styles ?? {}),
      ...styles,
    },
  };
}

function placeAbs(
  component: TemplateComponent,
  options: {
    left: number;
    top: number;
    width: number | string;
    height: number | string;
  },
): TemplateComponent {
  return withStyles(component, {
    position: 'absolute',
    left: options.left,
    top: options.top,
    width: options.width,
    height: options.height,
  });
}

function createPanel(
  component: TemplateComponent,
  options: {
    left: number;
    top: number;
    width: number | string;
    height: number | string;
  },
): TemplateComponent {
  return placeAbs(
    withStyles(component, {
      backgroundColor: '#111c2d',
      border: '1px solid rgba(76, 162, 255, 0.18)',
      borderRadius: 18,
      boxShadow: '0 20px 45px rgba(6, 10, 20, 0.28)',
      padding: 8,
      boxSizing: 'border-box',
    }),
    options,
  );
}

function createPageShell(page: TemplatePagePreset): TemplatePagePreset {
  return {
    ...page,
    components: [
      placeAbs(
        {
          type: 'container',
          props: {
            title: '',
            showChrome: false,
            backgroundColor: '#07111f',
            borderColor: 'transparent',
            borderRadius: 0,
            padding: 0,
            minHeight: CANVAS_HEIGHT,
          },
          children: page.components,
        },
        {
          left: 0,
          top: 0,
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
        },
      ),
    ],
  };
}

function createOverviewPage(): TemplatePagePreset {
  const trendData = [
    { period: '00:00', value: 38 },
    { period: '04:00', value: 46 },
    { period: '08:00', value: 72 },
    { period: '12:00', value: 88 },
    { period: '16:00', value: 81 },
    { period: '20:00', value: 95 },
    { period: '24:00', value: 69 },
  ];
  const trafficSource = [
    { name: 'App', value: 42 },
    { name: 'Web', value: 28 },
    { name: 'API', value: 18 },
    { name: 'SDK', value: 12 },
  ];
  const loadData = [
    { cluster: '华东一区', value: 78 },
    { cluster: '华北二区', value: 65 },
    { cluster: '华南一区', value: 82 },
    { cluster: '西南节点', value: 54 },
    { cluster: '海外新加坡', value: 48 },
  ];
  const alarmRows = [
    { key: 'alarm-1', level: 'P1', service: '支付网关', status: '处理中', owner: '小黑', time: '10:21' },
    { key: 'alarm-2', level: 'P2', service: '消息中心', status: '已恢复', owner: '平台组', time: '10:08' },
    { key: 'alarm-3', level: 'P2', service: '数据同步', status: '待确认', owner: '数据组', time: '09:46' },
    { key: 'alarm-4', level: 'P3', service: '用户画像', status: '已恢复', owner: '运营组', time: '09:12' },
  ];

  return createPageShell({
    name: '总览大屏',
    path: '/screen/overview',
    components: [
      placeAbs(
        {
          type: 'pageHeader',
          props: {
            title: '运营指挥总览',
            subtitle: '实时监测流量、转化、服务负载与全局异常，适合作为数据大屏首页。',
            tagsText: '大屏,实时,运营',
            extraText: '数据刷新周期 30 秒',
          },
        },
        { left: 24, top: 24, width: 1392, height: 128 },
      ),
      placeAbs(
        {
          type: 'cardGrid',
          props: {
            columns: 4,
            items: [
              { id: 'metric-1', title: '在线用户', subtitle: '当前', value: '28,491', extra: '较 5 分钟前 +3.2%' },
              { id: 'metric-2', title: '支付成功率', subtitle: '今日', value: '99.42%', extra: '异常订单 14' },
              { id: 'metric-3', title: '平均响应', subtitle: 'P95', value: '286ms', extra: '核心接口正常' },
              { id: 'metric-4', title: '活跃应用', subtitle: '工作区', value: '124', extra: '新增 6 个待发布' },
            ],
          },
        },
        { left: 24, top: 176, width: 1392, height: 138 },
      ),
      createPanel(
        {
          type: 'lineChart',
          props: {
            title: '全天流量趋势',
            dataText: JSON.stringify(trendData, null, 2),
            xAxisKey: 'period',
            yAxisKey: 'value',
            nameKey: 'period',
            valueKey: 'value',
            color: '#29b6f6',
            optionText: JSON.stringify(
              {
                grid: { left: 44, right: 18, top: 56, bottom: 26, containLabel: true },
                tooltip: { trigger: 'axis' },
                xAxis: { axisLine: { lineStyle: { color: '#35506d' } }, axisLabel: { color: '#8da3be' } },
                yAxis: {
                  splitLine: { lineStyle: { color: 'rgba(141,163,190,0.16)' } },
                  axisLabel: { color: '#8da3be' },
                },
                series: [{ areaStyle: { color: 'rgba(41,182,246,0.18)' } }],
              },
              null,
              2,
            ),
          },
        },
        { left: 24, top: 338, width: 760, height: 320 },
      ),
      createPanel(
        {
          type: 'pieChart',
          props: {
            title: '流量来源分布',
            dataText: JSON.stringify(trafficSource, null, 2),
            xAxisKey: 'name',
            yAxisKey: 'value',
            nameKey: 'name',
            valueKey: 'value',
            color: '#5b8ff9',
            optionText: JSON.stringify(
              {
                legend: { bottom: 0, textStyle: { color: '#8da3be' } },
                series: [{ radius: ['52%', '76%'], label: { color: '#d9e7f7' } }],
              },
              null,
              2,
            ),
          },
        },
        { left: 808, top: 338, width: 300, height: 320 },
      ),
      createPanel(
        {
          type: 'barChart',
          props: {
            title: '集群负载率',
            dataText: JSON.stringify(loadData, null, 2),
            xAxisKey: 'cluster',
            yAxisKey: 'value',
            nameKey: 'cluster',
            valueKey: 'value',
            color: '#36cfc9',
            optionText: JSON.stringify(
              {
                grid: { left: 44, right: 14, top: 56, bottom: 46, containLabel: true },
                xAxis: { axisLabel: { color: '#8da3be', rotate: 16 } },
                yAxis: {
                  splitLine: { lineStyle: { color: 'rgba(141,163,190,0.16)' } },
                  axisLabel: { color: '#8da3be' },
                },
              },
              null,
              2,
            ),
          },
        },
        { left: 1132, top: 338, width: 284, height: 320 },
      ),
      createPanel(
        {
          type: 'geoMap',
          props: {
            title: '重点区域热力分布',
            subtitle: '按区域标记业务收入和流量峰值，可在编辑器中继续调整标记点与颜色。',
            interactionHint: '点击地图后可调整选中标记位置。',
            backgroundColor: '#111c2d',
            oceanColor: '#081423',
            defaultRegionColor: '#15345a',
            regionBorderColor: '#28588c',
            markerColor: '#3bb8ff',
            showLabels: true,
            showLegend: true,
            optionText: '',
            markers: [
              { id: 'mk-shanghai', name: '上海', longitude: 121.4737, latitude: 31.2304, value: 'GMV 128w', color: '#3bb8ff', size: 18 },
              { id: 'mk-shenzhen', name: '深圳', longitude: 114.0579, latitude: 22.5431, value: '流量峰值', color: '#22c55e', size: 16 },
              { id: 'mk-beijing', name: '北京', longitude: 116.4074, latitude: 39.9042, value: '新增用户 2.8k', color: '#f59e0b', size: 15 },
            ],
            highlightRegions: [
              { id: 'region-east', regionKey: 'china', label: '中国', value: '核心区域', color: '#21466f' },
              { id: 'region-na', regionKey: 'north-america', label: '北美', value: '海外增量', color: '#173a58' },
              { id: 'region-eu', regionKey: 'europe', label: '欧洲', value: '渠道拓展', color: '#1a4469' },
            ],
          },
        },
        { left: 24, top: 682, width: 740, height: 520 },
      ),
      createPanel(
        {
          type: 'dataTable',
          props: {
            title: '实时告警队列',
            size: 'middle',
            bordered: false,
            pagination: false,
            pageSize: 8,
            emptyText: '暂无告警',
            columnsText: JSON.stringify(
              [
                { title: '级别', dataIndex: 'level' },
                { title: '服务', dataIndex: 'service' },
                { title: '状态', dataIndex: 'status' },
                { title: '负责人', dataIndex: 'owner' },
                { title: '时间', dataIndex: 'time' },
              ],
              null,
              2,
            ),
            dataText: JSON.stringify(alarmRows, null, 2),
          },
        },
        { left: 788, top: 682, width: 628, height: 252 },
      ),
      createPanel(
        {
          type: 'list',
          props: {
            items: [
              {
                title: '支付成功率低于阈值',
                description: '建议优先检查支付网关上游依赖与回调链路。',
                avatar: '',
                titleLink: '',
              },
              {
                title: '华南节点流量持续攀升',
                description: '近 30 分钟流量上涨 16%，建议提前扩容。',
                avatar: '',
                titleLink: '',
              },
              {
                title: '广告投放转化恢复正常',
                description: '投放回收率回升至 4.8%，监控继续观察。',
                avatar: '',
                titleLink: '',
              },
            ],
          },
        },
        { left: 788, top: 958, width: 628, height: 244 },
      ),
    ],
  });
}

function createTrafficPage(): TemplatePagePreset {
  const hourlyData = [
    { slot: '00', pv: 12, uv: 9 },
    { slot: '04', pv: 18, uv: 14 },
    { slot: '08', pv: 35, uv: 26 },
    { slot: '12', pv: 41, uv: 32 },
    { slot: '16', pv: 39, uv: 31 },
    { slot: '20', pv: 46, uv: 37 },
    { slot: '24', pv: 28, uv: 21 },
  ];
  const channelData = [
    { name: '自然搜索', value: 38 },
    { name: '广告投放', value: 24 },
    { name: '活动裂变', value: 21 },
    { name: '私域回流', value: 17 },
  ];
  const cityRows = [
    { key: 'city-1', city: '上海', pv: '42.1w', cv: '5.6%', trend: '+8.2%' },
    { key: 'city-2', city: '北京', pv: '35.4w', cv: '4.8%', trend: '+5.1%' },
    { key: 'city-3', city: '深圳', pv: '29.7w', cv: '6.2%', trend: '+10.4%' },
    { key: 'city-4', city: '杭州', pv: '21.3w', cv: '4.3%', trend: '+3.8%' },
  ];

  return createPageShell({
    name: '流量监控',
    path: '/screen/traffic',
    components: [
      placeAbs(
        {
          type: 'pageHeader',
          props: {
            title: '流量监控大屏',
            subtitle: '聚合 PV/UV、渠道构成和城市转化，适合做投放和增长分析。',
            tagsText: '流量,增长,监控',
            extraText: '统计口径 T+0',
          },
        },
        { left: 24, top: 24, width: 1392, height: 128 },
      ),
      placeAbs(
        {
          type: 'cardGrid',
          props: {
            columns: 4,
            items: [
              { id: 'traffic-1', title: '今日 PV', subtitle: '累计', value: '182.4w', extra: '环比 +12.4%' },
              { id: 'traffic-2', title: '今日 UV', subtitle: '累计', value: '64.8w', extra: '新访客占比 38%' },
              { id: 'traffic-3', title: '转化率', subtitle: '整体', value: '5.12%', extra: '投放页最高 8.3%' },
              { id: 'traffic-4', title: '峰值并发', subtitle: '实时', value: '9,286', extra: '已低于容量红线' },
            ],
          },
        },
        { left: 24, top: 176, width: 1392, height: 138 },
      ),
      createPanel(
        {
          type: 'lineChart',
          props: {
            title: 'PV / UV 分时走势',
            dataText: JSON.stringify(hourlyData, null, 2),
            xAxisKey: 'slot',
            yAxisKey: 'pv',
            nameKey: 'slot',
            valueKey: 'pv',
            color: '#5b8ff9',
            optionText: JSON.stringify(
              {
                legend: { top: 10, textStyle: { color: '#8da3be' } },
                grid: { left: 44, right: 18, top: 64, bottom: 26, containLabel: true },
                xAxis: { axisLine: { lineStyle: { color: '#35506d' } }, axisLabel: { color: '#8da3be' } },
                yAxis: {
                  splitLine: { lineStyle: { color: 'rgba(141,163,190,0.16)' } },
                  axisLabel: { color: '#8da3be' },
                },
                series: [
                  { name: 'PV', type: 'line', smooth: true, areaStyle: { color: 'rgba(91,143,249,0.18)' } },
                  { name: 'UV', type: 'line', smooth: true, data: hourlyData.map((item) => item.uv), color: '#36cfc9' },
                ],
              },
              null,
              2,
            ),
          },
        },
        { left: 24, top: 338, width: 900, height: 360 },
      ),
      createPanel(
        {
          type: 'pieChart',
          props: {
            title: '渠道构成占比',
            dataText: JSON.stringify(channelData, null, 2),
            xAxisKey: 'name',
            yAxisKey: 'value',
            nameKey: 'name',
            valueKey: 'value',
            color: '#36cfc9',
            optionText: JSON.stringify(
              {
                legend: { orient: 'vertical', right: 0, top: 'middle', textStyle: { color: '#8da3be' } },
                series: [{ radius: ['44%', '70%'], center: ['38%', '50%'] }],
              },
              null,
              2,
            ),
          },
        },
        { left: 948, top: 338, width: 468, height: 360 },
      ),
      createPanel(
        {
          type: 'dataTable',
          props: {
            title: '城市转化表现',
            size: 'middle',
            bordered: false,
            pagination: false,
            pageSize: 10,
            emptyText: '暂无城市数据',
            columnsText: JSON.stringify(
              [
                { title: '城市', dataIndex: 'city' },
                { title: 'PV', dataIndex: 'pv' },
                { title: '转化率', dataIndex: 'cv' },
                { title: '趋势', dataIndex: 'trend' },
              ],
              null,
              2,
            ),
            dataText: JSON.stringify(cityRows, null, 2),
          },
        },
        { left: 24, top: 722, width: 720, height: 300 },
      ),
      createPanel(
        {
          type: 'richText',
          props: {
            content: `
              <div style="color:#dce9f7;padding:14px 16px 0;">
                <div style="font-size:22px;font-weight:700;color:#ffffff;">投放建议</div>
                <div style="margin-top:18px;font-size:15px;line-height:1.85;color:#9db4cc;">
                  1. 广告投放渠道仍是主要增量来源，建议继续放大高转化时段预算。<br/>
                  2. 深圳与上海转化率领先，可优先复制落地页策略到同类区域。<br/>
                  3. 私域回流占比稳定，可补充会员促活和消息触达能力。<br/>
                  4. 若晚高峰继续上涨，建议临时扩容实时分析链路。
                </div>
              </div>
            `,
          },
        },
        { left: 768, top: 722, width: 648, height: 300 },
      ),
    ],
  });
}

function createAlertsPage(): TemplatePagePreset {
  const severityData = [
    { name: 'P1', value: 3 },
    { name: 'P2', value: 8 },
    { name: 'P3', value: 14 },
    { name: 'P4', value: 26 },
  ];
  const serviceRows = [
    { key: 'svc-1', service: '支付网关', count: 12, owner: '支付组', sla: '92.1%' },
    { key: 'svc-2', service: '用户中心', count: 8, owner: '账号组', sla: '97.8%' },
    { key: 'svc-3', service: '消息中心', count: 5, owner: '中台组', sla: '99.1%' },
    { key: 'svc-4', service: '搜索服务', count: 3, owner: '平台组', sla: '99.4%' },
  ];

  return createPageShell({
    name: '告警中心',
    path: '/screen/alerts',
    components: [
      placeAbs(
        {
          type: 'pageHeader',
          props: {
            title: '告警中心大屏',
            subtitle: '按严重级别、责任服务和处置建议聚合当前异常。',
            tagsText: '告警,异常,值班',
            extraText: '值班人已同步',
          },
        },
        { left: 24, top: 24, width: 1392, height: 128 },
      ),
      placeAbs(
        {
          type: 'cardGrid',
          props: {
            columns: 4,
            items: [
              { id: 'alert-1', title: '当前未恢复', subtitle: '总数', value: '11', extra: 'P1 3 条' },
              { id: 'alert-2', title: '平均恢复时长', subtitle: 'MTTR', value: '18m', extra: '较昨日 -6m' },
              { id: 'alert-3', title: '误报率', subtitle: '近 24h', value: '2.3%', extra: '已低于目标' },
              { id: 'alert-4', title: 'SLA 风险服务', subtitle: '数量', value: '4', extra: '需重点关注' },
            ],
          },
        },
        { left: 24, top: 176, width: 1392, height: 138 },
      ),
      createPanel(
        {
          type: 'barChart',
          props: {
            title: '告警级别分布',
            dataText: JSON.stringify(severityData, null, 2),
            xAxisKey: 'name',
            yAxisKey: 'value',
            nameKey: 'name',
            valueKey: 'value',
            color: '#f97316',
            optionText: JSON.stringify(
              {
                grid: { left: 44, right: 18, top: 56, bottom: 26, containLabel: true },
                xAxis: { axisLabel: { color: '#8da3be' } },
                yAxis: {
                  splitLine: { lineStyle: { color: 'rgba(141,163,190,0.16)' } },
                  axisLabel: { color: '#8da3be' },
                },
              },
              null,
              2,
            ),
          },
        },
        { left: 24, top: 338, width: 420, height: 340 },
      ),
      createPanel(
        {
          type: 'dataTable',
          props: {
            title: '责任服务排行',
            size: 'middle',
            bordered: false,
            pagination: false,
            pageSize: 10,
            emptyText: '暂无服务告警',
            columnsText: JSON.stringify(
              [
                { title: '服务', dataIndex: 'service' },
                { title: '告警数', dataIndex: 'count' },
                { title: '负责人', dataIndex: 'owner' },
                { title: 'SLA', dataIndex: 'sla' },
              ],
              null,
              2,
            ),
            dataText: JSON.stringify(serviceRows, null, 2),
          },
        },
        { left: 468, top: 338, width: 636, height: 340 },
      ),
      createPanel(
        {
          type: 'list',
          props: {
            items: [
              {
                title: '支付网关抖动超过 15 分钟',
                description: '建议切换备用链路，并检查第三方上游返回码。',
                avatar: '',
                titleLink: '',
              },
              {
                title: '用户中心登录异常波动',
                description: '优先核查验证码与风控链路是否存在误伤。',
                avatar: '',
                titleLink: '',
              },
              {
                title: '数据同步任务积压',
                description: '检查消费组 lag 和下游写入速率，再决定是否扩容。',
                avatar: '',
                titleLink: '',
              },
            ],
          },
        },
        { left: 1128, top: 338, width: 288, height: 340 },
      ),
      createPanel(
        {
          type: 'richText',
          props: {
            content: `
              <div style="color:#dce9f7;padding:16px 18px 0;">
                <div style="font-size:22px;font-weight:700;color:#ffffff;">处置看板</div>
                <div style="margin-top:16px;font-size:15px;line-height:1.9;color:#9db4cc;">
                  当前建议按 “支付网关 -> 用户中心 -> 数据同步” 的优先级处理。<br/>
                  对 P1 告警先做隔离和止血，再补业务恢复与复盘任务。<br/>
                  对重复出现的 P2/P3 告警，建议补充降噪规则和自愈动作。
                </div>
              </div>
            `,
          },
        },
        { left: 24, top: 702, width: 680, height: 280 },
      ),
      createPanel(
        {
          type: 'queryFilter',
          props: {
            columns: 4,
            searchText: '搜索',
            resetText: '重置',
            showSearchButton: true,
            showResetButton: true,
            fields: [
              { id: 'alert-field-1', label: '服务名', field: 'service', type: 'input', placeholder: '请输入服务名', optionsText: '' },
              { id: 'alert-field-2', label: '级别', field: 'level', type: 'select', placeholder: '请选择级别', optionsText: '全部,P1,P2,P3,P4' },
              { id: 'alert-field-3', label: '状态', field: 'status', type: 'select', placeholder: '请选择状态', optionsText: '全部,处理中,已恢复,待确认' },
            ],
          },
        },
        { left: 728, top: 702, width: 688, height: 126 },
      ),
      createPanel(
        {
          type: 'dataTable',
          props: {
            title: '最近处置记录',
            size: 'middle',
            bordered: false,
            pagination: false,
            pageSize: 6,
            emptyText: '暂无处置记录',
            columnsText: JSON.stringify(
              [
                { title: '事件', dataIndex: 'event' },
                { title: '处理人', dataIndex: 'owner' },
                { title: '结果', dataIndex: 'result' },
                { title: '时间', dataIndex: 'time' },
              ],
              null,
              2,
            ),
            dataText: JSON.stringify(
              [
                { key: 'op-1', event: '支付回调超时', owner: '值班-张三', result: '切流完成', time: '10:18' },
                { key: 'op-2', event: '登录异常升高', owner: '值班-李四', result: '规则回滚', time: '09:57' },
                { key: 'op-3', event: '同步任务延迟', owner: '值班-王五', result: '扩容恢复', time: '09:23' },
              ],
              null,
              2,
            ),
          },
        },
        { left: 728, top: 852, width: 688, height: 252 },
      ),
    ],
  });
}

export const adminAnalyticsScreenTemplate: TemplatePreset = {
  key: 'admin-analytics-screen',
  name: '数据运营大屏模板',
  desc: '深色数据大屏风格的多页面后台模板，适合快速搭建实时运营、流量分析和告警中心场景。',
  tags: ['admin', 'screen', 'analytics'],
  pageTitle: '数据运营中心',
  pageCategory: 'admin',
  layoutMode: 'absolute',
  shellLayout: 'leftRight',
  deviceType: 'pc',
  canvasWidth: CANVAS_WIDTH,
  canvasHeight: CANVAS_HEIGHT,
  activePagePath: '/screen/overview',
  pageGroups: [
    { id: 'screen-overview', name: '总览大屏', path: '/screen/overview' },
    { id: 'screen-traffic', name: '流量监控', path: '/screen/traffic' },
    { id: 'screen-alerts', name: '告警中心', path: '/screen/alerts' },
  ],
  pages: [createOverviewPage(), createTrafficPage(), createAlertsPage()],
};
