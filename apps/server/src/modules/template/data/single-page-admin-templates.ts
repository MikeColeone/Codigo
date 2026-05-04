/* eslint-disable prettier/prettier */
import type { TemplateComponent, TemplatePagePreset, TemplatePreset } from '@codigo/schema';

const CANVAS_WIDTH = 1440;
const CANVAS_HEIGHT = 1320;

type Position = {
  left: number;
  top: number;
  width: number | string;
  height?: number | string;
};

/**
 * 合并组件样式，避免在模板定义里重复展开对象。
 */
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

/**
 * 统一为单页面模板组件追加绝对定位。
 */
function place(component: TemplateComponent, position: Position): TemplateComponent {
  return withStyles(component, {
    position: 'absolute',
    left: position.left,
    top: position.top,
    width: position.width,
    ...(position.height !== undefined ? { height: position.height } : {}),
  });
}

/**
 * 生成带统一面板视觉的组件块。
 */
function createPanel(
  component: TemplateComponent,
  position: Position,
  styles?: Record<string, unknown>,
): TemplateComponent {
  return place(
    withStyles(component, {
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 18,
      padding: 16,
      boxShadow: '0 18px 40px rgba(15, 23, 42, 0.06)',
      ...styles,
    }),
    position,
  );
}

/**
 * 生成页面顶部面包屑。
 */
function createBreadcrumb(label: string): TemplateComponent {
  return place(
    {
      type: 'breadcrumbBar',
      props: {
        items: [
          { id: `bc-home-${label}`, label: '后台模板' },
          { id: `bc-page-${label}`, label },
        ],
        separator: '/',
      },
    },
    { left: 24, top: 24, width: 1392, height: 40 },
  );
}

/**
 * 生成模板通用页头。
 */
function createHeader(options: {
  title: string;
  subtitle: string;
  tagsText: string;
  extraText: string;
}): TemplateComponent {
  return place(
    {
      type: 'pageHeader',
      props: {
        title: options.title,
        subtitle: options.subtitle,
        tagsText: options.tagsText,
        extraText: options.extraText,
      },
    },
    { left: 24, top: 76, width: 1392, height: 112 },
  );
}

/**
 * 生成单页面模板常用指标卡。
 */
function createMetricGrid(
  items: Array<{ id: string; title: string; subtitle: string; value: string; extra: string }>,
  top = 208,
): TemplateComponent {
  return createPanel(
    {
      type: 'cardGrid',
      props: {
        columns: 4,
        items,
      },
    },
    { left: 24, top, width: 1392, height: 132 },
  );
}

/**
 * 生成列表组件面板。
 */
function createListPanel(
  items: Array<{ title: string; description: string }>,
  position: Position,
): TemplateComponent {
  return createPanel(
    {
      type: 'list',
      props: {
        items: items.map((item) => ({
          ...item,
          avatar: '',
          titleLink: '',
        })),
      },
    },
    position,
  );
}

/**
 * 生成富文本面板。
 */
function createRichTextPanel(content: string, position: Position): TemplateComponent {
  return createPanel(
    {
      type: 'richText',
      props: {
        content,
      },
    },
    position,
  );
}

/**
 * 生成查询筛选面板。
 */
function createQueryFilterPanel(
  fields: Array<{
    id: string;
    label: string;
    field: string;
    type: 'input' | 'select';
    placeholder: string;
    optionsText?: string;
  }>,
  position: Position,
): TemplateComponent {
  return createPanel(
    {
      type: 'queryFilter',
      props: {
        columns: 4,
        searchText: '搜索',
        resetText: '重置',
        showSearchButton: true,
        showResetButton: true,
        fields: fields.map((field) => ({
          ...field,
          optionsText: field.optionsText ?? '',
        })),
      },
    },
    position,
  );
}

/**
 * 生成数据表格面板。
 */
function createTablePanel(options: {
  title: string;
  columns: Array<{ title: string; dataIndex: string }>;
  rows: Record<string, unknown>[];
  position: Position;
  pagination?: boolean;
}): TemplateComponent {
  return createPanel(
    {
      type: 'dataTable',
      props: {
        title: options.title,
        pagination: options.pagination ?? false,
        pageSize: 8,
        bordered: true,
        size: 'middle',
        emptyText: '暂无数据',
        columnsText: JSON.stringify(options.columns, null, 2),
        dataText: JSON.stringify(options.rows, null, 2),
      },
    },
    options.position,
  );
}

/**
 * 生成折线图面板。
 */
function createLineChartPanel(options: {
  title: string;
  data: Record<string, unknown>[];
  xAxisKey: string;
  valueKey: string;
  color: string;
  position: Position;
}): TemplateComponent {
  return createPanel(
    {
      type: 'lineChart',
      props: {
        title: options.title,
        dataText: JSON.stringify(options.data, null, 2),
        xAxisKey: options.xAxisKey,
        yAxisKey: options.valueKey,
        nameKey: options.xAxisKey,
        valueKey: options.valueKey,
        color: options.color,
        optionText: JSON.stringify(
          {
            grid: { left: 44, right: 18, top: 56, bottom: 30, containLabel: true },
            yAxis: { splitLine: { lineStyle: { color: '#eef2f7' } } },
          },
          null,
          2,
        ),
      },
    },
    options.position,
  );
}

/**
 * 生成柱状图面板。
 */
function createBarChartPanel(options: {
  title: string;
  data: Record<string, unknown>[];
  xAxisKey: string;
  valueKey: string;
  color: string;
  position: Position;
}): TemplateComponent {
  return createPanel(
    {
      type: 'barChart',
      props: {
        title: options.title,
        dataText: JSON.stringify(options.data, null, 2),
        xAxisKey: options.xAxisKey,
        yAxisKey: options.valueKey,
        nameKey: options.xAxisKey,
        valueKey: options.valueKey,
        color: options.color,
        optionText: JSON.stringify(
          {
            grid: { left: 44, right: 18, top: 56, bottom: 30, containLabel: true },
            yAxis: { splitLine: { lineStyle: { color: '#eef2f7' } } },
          },
          null,
          2,
        ),
      },
    },
    options.position,
  );
}

/**
 * 生成饼图面板。
 */
function createPieChartPanel(options: {
  title: string;
  data: Record<string, unknown>[];
  nameKey: string;
  valueKey: string;
  color: string;
  position: Position;
}): TemplateComponent {
  return createPanel(
    {
      type: 'pieChart',
      props: {
        title: options.title,
        dataText: JSON.stringify(options.data, null, 2),
        xAxisKey: options.nameKey,
        yAxisKey: options.valueKey,
        nameKey: options.nameKey,
        valueKey: options.valueKey,
        color: options.color,
      },
    },
    options.position,
  );
}

/**
 * 生成单页面模板预设。
 */
function createSinglePageTemplate(options: {
  key: string;
  name: string;
  desc: string;
  tags: string[];
  pageTitle: string;
  path: string;
  headerTitle: string;
  headerSubtitle: string;
  headerTags: string;
  headerExtra: string;
  components: TemplateComponent[];
}): TemplatePreset {
  const page: TemplatePagePreset = {
    name: options.name,
    path: options.path,
    components: [
      createBreadcrumb(options.name),
      createHeader({
        title: options.headerTitle,
        subtitle: options.headerSubtitle,
        tagsText: options.headerTags,
        extraText: options.headerExtra,
      }),
      ...options.components,
    ],
  };

  return {
    key: options.key,
    name: options.name,
    desc: options.desc,
    tags: options.tags,
    pageTitle: options.pageTitle,
    pageCategory: 'admin',
    layoutMode: 'absolute',
    shellLayout: 'none',
    deviceType: 'pc',
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    activePagePath: options.path,
    pages: [page],
  };
}

/**
 * 生成 AI 对话工作台模板。
 */
function createAiChatCopilotTemplate(): TemplatePreset {
  return createSinglePageTemplate({
    key: 'ai-chat-copilot-single',
    name: 'AI 对话工作台',
    desc: '面向客服与运营的单页面 AI 对话模板，包含会话概览、提示词推荐和最近会话列表。',
    tags: ['admin', 'ai', 'chat'],
    pageTitle: 'AI 对话工作台',
    path: '/ai-chat',
    headerTitle: 'AI 对话工作台',
    headerSubtitle: '在一页内聚合会话状态、回复建议和上下文摘要，适合快速搭建 Copilot 类后台。',
    headerTags: 'AI,对话,单页面',
    headerExtra: '最近同步：今天 10:28',
    components: [
      createMetricGrid(
        [
          { id: 'chat-kpi-1', title: '今日会话', subtitle: '全部渠道', value: '1,284', extra: '人工转接 92' },
          { id: 'chat-kpi-2', title: '自动解决率', subtitle: 'AI 回复', value: '78.6%', extra: '较昨日 +4.2%' },
          { id: 'chat-kpi-3', title: '平均首响', subtitle: '本日', value: '7s', extra: 'SLA 正常' },
          { id: 'chat-kpi-4', title: 'Token 成本', subtitle: '今日', value: '￥312', extra: '预算占比 46%' },
        ],
      ),
      createRichTextPanel(
        `
          <div style="padding:4px 2px;color:#0f172a;">
            <div style="font-size:18px;font-weight:700;">示例对话</div>
            <div style="margin-top:18px;display:flex;flex-direction:column;gap:12px;">
              <div style="align-self:flex-start;max-width:78%;padding:12px 14px;border-radius:16px;background:#e2e8f0;color:#0f172a;">
                用户：为什么昨晚 9 点开始支付成功率下降？
              </div>
              <div style="align-self:flex-end;max-width:82%;padding:12px 14px;border-radius:16px;background:#dbeafe;color:#1e3a8a;">
                AI：已定位到华东支付网关回调延迟抖动，建议先检查第三方支付上游状态，再核对重试队列积压。当前关联工单 6 条，我已提炼出排查步骤。
              </div>
              <div style="align-self:flex-start;max-width:78%;padding:12px 14px;border-radius:16px;background:#e2e8f0;color:#0f172a;">
                用户：帮我输出一版给值班同学的同步说明。
              </div>
              <div style="align-self:flex-end;max-width:82%;padding:12px 14px;border-radius:16px;background:#dbeafe;color:#1e3a8a;">
                AI：已生成同步说明，建议包含影响时间段、当前兜底策略、预计恢复时间和责任分工。
              </div>
            </div>
          </div>
        `,
        { left: 24, top: 364, width: 696, height: 372 },
      ),
      createListPanel(
        [
          { title: '生成根因分析', description: '基于最近 30 分钟告警与日志摘要生成排障说明。' },
          { title: '输出值班播报', description: '自动整理面向群聊的简版同步消息。' },
          { title: '总结高频问题', description: '提取本周重复咨询并生成 FAQ 建议。' },
          { title: '补全工单备注', description: '根据对话上下文自动补全处理结果。' },
        ],
        { left: 744, top: 364, width: 320, height: 372 },
      ),
      createTablePanel({
        title: '最近会话',
        columns: [
          { title: '会话 ID', dataIndex: 'sessionId' },
          { title: '用户', dataIndex: 'user' },
          { title: '主题', dataIndex: 'topic' },
          { title: '状态', dataIndex: 'status' },
          { title: '更新时间', dataIndex: 'updatedAt' },
        ],
        rows: [
          { key: 'chat-1', sessionId: 'S-240501', user: '财务-王敏', topic: '对账异常说明', status: '进行中', updatedAt: '10:22' },
          { key: 'chat-2', sessionId: 'S-240498', user: '客服-刘畅', topic: '退款流程问答', status: '已解决', updatedAt: '10:08' },
          { key: 'chat-3', sessionId: 'S-240492', user: '运营-赵琪', topic: '活动复盘摘要', status: '待确认', updatedAt: '09:43' },
          { key: 'chat-4', sessionId: 'S-240481', user: '售后-周昊', topic: '投诉升级建议', status: '人工接管', updatedAt: '09:16' },
        ],
        position: { left: 1088, top: 364, width: 328, height: 372 },
      }),
      createRichTextPanel(
        `
          <div style="padding:6px 4px;color:#334155;">
            <div style="font-size:18px;font-weight:700;color:#0f172a;">交接摘要</div>
            <div style="margin-top:14px;line-height:1.85;">
              1. 支付网关相关问题占比最高，建议保留“根因分析”和“播报同步”两个快捷动作。<br/>
              2. 晚高峰对话量明显上升，可在模板基础上继续叠加知识库召回与会话标签。<br/>
              3. 若需要更强的工单闭环，可在右侧表格下方扩展审批或指派动作按钮。
            </div>
          </div>
        `,
        { left: 24, top: 760, width: 1392, height: 220 },
      ),
    ],
  });
}

/**
 * 生成数据集工作台模板。
 */
function createDatasetGeneratorTemplate(): TemplatePreset {
  return createSinglePageTemplate({
    key: 'ai-dataset-generator-single',
    name: '数据生成工坊',
    desc: '面向 AI 训练与数据运营的单页面模板，聚合数据生成任务、样本统计和生成规则说明。',
    tags: ['admin', 'ai', 'dataset'],
    pageTitle: '数据生成工坊',
    path: '/dataset-generator',
    headerTitle: '数据生成工坊',
    headerSubtitle: '适合搭建问答对、指令数据、标注样本等生成后台。',
    headerTags: 'AI,数据生成,单页面',
    headerExtra: '任务队列：12 个执行中',
    components: [
      createMetricGrid(
        [
          { id: 'data-kpi-1', title: '今日产出', subtitle: '样本数', value: '48,200', extra: '合格率 92%' },
          { id: 'data-kpi-2', title: '运行任务', subtitle: '队列', value: '12', extra: '失败重试 2' },
          { id: 'data-kpi-3', title: '平均耗时', subtitle: '单任务', value: '3m 18s', extra: '较昨日 -14%' },
          { id: 'data-kpi-4', title: '预算消耗', subtitle: '今日', value: '￥1,268', extra: '剩余 38%' },
        ],
      ),
      createQueryFilterPanel(
        [
          { id: 'dataset-scene', label: '场景', field: 'scene', type: 'select', placeholder: '请选择场景', optionsText: '全部,客服问答,营销文案,SQL 生成,摘要改写' },
          { id: 'dataset-model', label: '模型', field: 'model', type: 'select', placeholder: '请选择模型', optionsText: '全部,gpt-4.1,deepseek-v3,qwen-max' },
          { id: 'dataset-owner', label: '负责人', field: 'owner', type: 'input', placeholder: '请输入负责人' },
        ],
        { left: 24, top: 364, width: 1392, height: 116 },
      ),
      createTablePanel({
        title: '生成任务列表',
        columns: [
          { title: '任务名', dataIndex: 'name' },
          { title: '模板', dataIndex: 'template' },
          { title: '目标数', dataIndex: 'target' },
          { title: '完成度', dataIndex: 'progress' },
          { title: '状态', dataIndex: 'status' },
        ],
        rows: [
          { key: 'dataset-1', name: '客服退款问答扩写', template: 'refund-faq-v2', target: '8,000', progress: '76%', status: '运行中' },
          { key: 'dataset-2', name: '营销标题生成', template: 'campaign-title-v4', target: '12,000', progress: '100%', status: '已完成' },
          { key: 'dataset-3', name: 'SQL 纠错数据', template: 'sql-repair-v1', target: '5,000', progress: '42%', status: '运行中' },
          { key: 'dataset-4', name: '质检摘要对齐', template: 'summary-align-v3', target: '3,500', progress: '13%', status: '待审核' },
        ],
        position: { left: 24, top: 504, width: 860, height: 404 },
        pagination: true,
      }),
      createRichTextPanel(
        `
          <div style="padding:4px;color:#334155;">
            <div style="font-size:18px;font-weight:700;color:#0f172a;">生成规范</div>
            <div style="margin-top:14px;line-height:1.85;">
              1. 样本字段需包含场景、输入、输出、审核结论四类核心信息。<br/>
              2. 对于高风险任务，应先抽样 100 条走人工确认再全量生成。<br/>
              3. 产出文本默认去除敏感人名、真实手机号与身份证号。<br/>
              4. 如需联动知识库，可在此模板基础上追加召回来源字段和命中率统计。
            </div>
          </div>
        `,
        { left: 908, top: 504, width: 508, height: 196 },
      ),
      createListPanel(
        [
          { title: '问答对扩写', description: '适合沉淀售后 FAQ、客服 SOP、知识库问答。' },
          { title: '多轮对话构造', description: '支持角色设定与多回合上下文拼接。' },
          { title: '结构化字段补齐', description: '对标题、标签、摘要等字段统一生成。' },
          { title: '低质样本清洗', description: '自动检测重复样本、空字段和脏词。' },
        ],
        { left: 908, top: 724, width: 508, height: 184 },
      ),
    ],
  });
}

/**
 * 生成 Agent 流程调度模板。
 */
function createAgentWorkflowTemplate(): TemplatePreset {
  return createSinglePageTemplate({
    key: 'agent-workflow-center-single',
    name: 'Agent 流程调度台',
    desc: '聚合 Agent 任务吞吐、执行链路和待处理节点的单页面编排模板。',
    tags: ['admin', 'agent', 'workflow'],
    pageTitle: 'Agent 流程调度台',
    path: '/agent-workflow',
    headerTitle: 'Agent 流程调度台',
    headerSubtitle: '适合作为多 Agent 编排、工具调用和结果回传的统一观测页。',
    headerTags: 'Agent,流程编排,单页面',
    headerExtra: '最近编排变更：今天 09:58',
    components: [
      createMetricGrid(
        [
          { id: 'agent-kpi-1', title: '执行成功率', subtitle: '今日', value: '96.2%', extra: '重试 18 次' },
          { id: 'agent-kpi-2', title: '平均耗时', subtitle: '单链路', value: '42s', extra: '长任务 9 个' },
          { id: 'agent-kpi-3', title: '工具调用', subtitle: '累计', value: '5,641', extra: '最高峰 11:00' },
          { id: 'agent-kpi-4', title: '待人工确认', subtitle: '当前', value: '7', extra: '高优先级 2' },
        ],
      ),
      createLineChartPanel({
        title: '任务吞吐趋势',
        data: [
          { slot: '08:00', count: 42 },
          { slot: '10:00', count: 88 },
          { slot: '12:00', count: 75 },
          { slot: '14:00', count: 96 },
          { slot: '16:00', count: 104 },
          { slot: '18:00', count: 79 },
        ],
        xAxisKey: 'slot',
        valueKey: 'count',
        color: '#4f46e5',
        position: { left: 24, top: 364, width: 696, height: 340 },
      }),
      createTablePanel({
        title: '运行中的任务',
        columns: [
          { title: '任务', dataIndex: 'task' },
          { title: '当前节点', dataIndex: 'node' },
          { title: '负责人', dataIndex: 'owner' },
          { title: '耗时', dataIndex: 'duration' },
          { title: '状态', dataIndex: 'status' },
        ],
        rows: [
          { key: 'agent-1', task: '合同摘要生成', node: '知识召回', owner: '法务 Agent', duration: '26s', status: '执行中' },
          { key: 'agent-2', task: '活动复盘报告', node: '图表生成', owner: '运营 Agent', duration: '54s', status: '等待工具' },
          { key: 'agent-3', task: '工单智能分单', node: '规则校验', owner: '客服 Agent', duration: '18s', status: '待人工确认' },
          { key: 'agent-4', task: '商机线索清洗', node: '字段归一化', owner: '销售 Agent', duration: '37s', status: '执行中' },
        ],
        position: { left: 744, top: 364, width: 672, height: 340 },
      }),
      createListPanel(
        [
          { title: '检索 -> 规划 -> 执行 -> 总结', description: '适合文档问答、工单处理等具备明确阶段的任务。' },
          { title: '触发人工兜底', description: '对于高风险步骤可在模板中预留人工确认节点。' },
          { title: '保存中间产物', description: '建议记录工具返回值和结构化草稿，便于排错。' },
          { title: '链路可追溯', description: '保留任务 ID、输入版本和模型版本，便于审计。' },
        ],
        { left: 24, top: 728, width: 520, height: 252 },
      ),
      createRichTextPanel(
        `
          <div style="padding:4px;color:#334155;">
            <div style="font-size:18px;font-weight:700;color:#0f172a;">编排建议</div>
            <div style="margin-top:14px;line-height:1.9;">
              当前模板更适合面向后台“事件编排”场景：先接输入，再走步骤链，最后输出结构化结果。<br/>
              如果你后续需要审批/节点流，可在此页继续扩展动作步骤表、失败回滚和重试策略说明区。<br/>
              右侧任务表适合替换成你自己的执行记录，左下则可以切成步骤详情或错误日志面板。
            </div>
          </div>
        `,
        { left: 568, top: 728, width: 848, height: 252 },
      ),
    ],
  });
}

/**
 * 生成营销文案工作台模板。
 */
function createMarketingCopyTemplate(): TemplatePreset {
  return createSinglePageTemplate({
    key: 'marketing-copy-studio-single',
    name: '营销文案工作台',
    desc: '适合运营团队快速管理活动 Brief、AI 文案变体和渠道投放建议的单页面模板。',
    tags: ['admin', 'marketing', 'copy'],
    pageTitle: '营销文案工作台',
    path: '/marketing-copy',
    headerTitle: '营销文案工作台',
    headerSubtitle: '把活动 Brief、生成结果和投放建议放在同一页，适合内容团队直接二次编辑。',
    headerTags: '营销,文案,AI 生成',
    headerExtra: '本周活动：618 预热',
    components: [
      createMetricGrid(
        [
          { id: 'copy-kpi-1', title: '已生成文案', subtitle: '本周', value: '432', extra: '可用率 84%' },
          { id: 'copy-kpi-2', title: '渠道覆盖', subtitle: '全部', value: '9', extra: '新增小红书' },
          { id: 'copy-kpi-3', title: '点击提升', subtitle: 'A/B 实验', value: '+16.8%', extra: '最佳标题组 B' },
          { id: 'copy-kpi-4', title: '待审核', subtitle: '当前', value: '27', extra: '高优 5' },
        ],
      ),
      createRichTextPanel(
        `
          <div style="padding:4px;color:#334155;">
            <div style="font-size:18px;font-weight:700;color:#0f172a;">活动 Brief</div>
            <div style="margin-top:14px;line-height:1.9;">
              目标：为“618 智能办公专场”生成站内 Banner、Push 和短信文案。<br/>
              人群：中小企业采购、团队协作负责人、老客复购用户。<br/>
              风格：强调效率提升、限时折扣、场景化办公。<br/>
              禁用：避免虚假稀缺、避免夸张疗效或绝对化表述。
            </div>
          </div>
        `,
        { left: 24, top: 364, width: 456, height: 296 },
      ),
      createTablePanel({
        title: '生成变体',
        columns: [
          { title: '渠道', dataIndex: 'channel' },
          { title: '标题', dataIndex: 'title' },
          { title: '卖点', dataIndex: 'point' },
          { title: '状态', dataIndex: 'status' },
        ],
        rows: [
          { key: 'copy-1', channel: '站内 Banner', title: '企业协作焕新季，限时立省 38%', point: '突出效率与折扣', status: '已通过' },
          { key: 'copy-2', channel: 'Push', title: '今天下单，团队办公立减 500', point: '强调即时转化', status: '待审核' },
          { key: 'copy-3', channel: '短信', title: '618 办公专场开启，热门套装低至 6 折', point: '强调活动时效', status: '待优化' },
          { key: 'copy-4', channel: '小红书', title: '预算不变，办公室升级 3 件套', point: '偏种草风格', status: '已通过' },
        ],
        position: { left: 504, top: 364, width: 912, height: 296 },
      }),
      createListPanel(
        [
          { title: '高转化标题提示词', description: '适合快速拉出 20 条标题候选并做筛选。' },
          { title: '短信压缩改写', description: '控制字数同时保留利益点和动作指令。' },
          { title: '卖点差异化重写', description: '根据渠道调性切换“理性型”与“情绪型”表达。' },
          { title: '合规性自检', description: '检查是否出现绝对化、夸大和违规词。' },
        ],
        { left: 24, top: 684, width: 456, height: 264 },
      ),
      createRichTextPanel(
        `
          <div style="padding:4px;color:#334155;">
            <div style="font-size:18px;font-weight:700;color:#0f172a;">投放建议</div>
            <div style="margin-top:14px;line-height:1.9;">
              Banner 建议突出“效率升级 + 成本节省”，更适合承接高意向流量。<br/>
              Push 建议在午间和晚间发送，标题长度控制在 18 字内。<br/>
              对于短信内容，优先保留优惠力度、截止时间和一条明确 CTA。<br/>
              小红书可继续补充“办公桌改造”场景词，增强种草表达。
            </div>
          </div>
        `,
        { left: 504, top: 684, width: 912, height: 264 },
      ),
    ],
  });
}

/**
 * 生成知识库问答模板。
 */
function createKnowledgeQaTemplate(): TemplatePreset {
  return createSinglePageTemplate({
    key: 'knowledge-qa-single',
    name: '知识库问答台',
    desc: '适合知识库管理、召回结果预览和答案生成说明的单页面问答模板。',
    tags: ['admin', 'knowledge', 'qa'],
    pageTitle: '知识库问答台',
    path: '/knowledge-qa',
    headerTitle: '知识库问答台',
    headerSubtitle: '把知识库规模、文档命中和生成答案聚合在一页，便于做问答系统后台。',
    headerTags: '知识库,RAG,问答',
    headerExtra: '索引更新时间：今天 07:40',
    components: [
      createMetricGrid(
        [
          { id: 'qa-kpi-1', title: '文档总量', subtitle: '已入库', value: '12,480', extra: '增量 126' },
          { id: 'qa-kpi-2', title: '命中率', subtitle: '今日', value: '83.4%', extra: '高于均线' },
          { id: 'qa-kpi-3', title: '平均召回', subtitle: 'TopK', value: '6.2', extra: '建议阈值 0.72' },
          { id: 'qa-kpi-4', title: '待复核回答', subtitle: '当前', value: '19', extra: '高风险 3' },
        ],
      ),
      createQueryFilterPanel(
        [
          { id: 'qa-keyword', label: '问题关键词', field: 'keyword', type: 'input', placeholder: '请输入问题关键词' },
          { id: 'qa-space', label: '知识空间', field: 'space', type: 'select', placeholder: '请选择空间', optionsText: '全部,产品文档,售后 SOP,财务制度,研发规范' },
          { id: 'qa-status', label: '审核状态', field: 'status', type: 'select', placeholder: '请选择状态', optionsText: '全部,已发布,待复核,已下线' },
        ],
        { left: 24, top: 364, width: 1392, height: 116 },
      ),
      createTablePanel({
        title: '命中文档',
        columns: [
          { title: '文档标题', dataIndex: 'title' },
          { title: '空间', dataIndex: 'space' },
          { title: '命中分', dataIndex: 'score' },
          { title: '更新时间', dataIndex: 'updatedAt' },
        ],
        rows: [
          { key: 'qa-1', title: '退款审批流程说明', space: '售后 SOP', score: '0.91', updatedAt: '2026-05-04' },
          { key: 'qa-2', title: '支付异常值班手册', space: '产品文档', score: '0.88', updatedAt: '2026-05-02' },
          { key: 'qa-3', title: '客服升级工单规则', space: '售后 SOP', score: '0.84', updatedAt: '2026-04-30' },
          { key: 'qa-4', title: '补单申请处理指引', space: '财务制度', score: '0.77', updatedAt: '2026-04-28' },
        ],
        position: { left: 24, top: 504, width: 760, height: 404 },
      }),
      createRichTextPanel(
        `
          <div style="padding:4px;color:#334155;">
            <div style="font-size:18px;font-weight:700;color:#0f172a;">答案预览</div>
            <div style="margin-top:14px;line-height:1.9;">
              根据当前召回结果，退款审批需先校验支付状态与业务单号，再由值班同学确认是否触发自动退款。<br/>
              若订单已进入对账阶段，应先走人工复核流程，避免出现重复退款。<br/>
              推荐附带引用来源：<strong>退款审批流程说明</strong>、<strong>客服升级工单规则</strong>。
            </div>
          </div>
        `,
        { left: 808, top: 504, width: 608, height: 188 },
      ),
      createListPanel(
        [
          { title: '回答缺少引用', description: '优先检查召回阈值与切片长度配置。' },
          { title: '命中内容过旧', description: '建议给产品规范和制度文档增加更新时间展示。' },
          { title: '多空间冲突', description: '可引入权重规则，优先选择当前业务线文档。' },
          { title: '高风险回答', description: '对财务、法务类问题保留人工复核出口。' },
        ],
        { left: 808, top: 716, width: 608, height: 192 },
      ),
    ],
  });
}

/**
 * 生成销售线索评分模板。
 */
function createLeadScoringTemplate(): TemplatePreset {
  return createSinglePageTemplate({
    key: 'lead-scoring-center-single',
    name: '销售线索评分台',
    desc: '适合销售团队管理线索评分、来源表现和待跟进商机的单页面模板。',
    tags: ['admin', 'sales', 'lead'],
    pageTitle: '销售线索评分台',
    path: '/lead-scoring',
    headerTitle: '销售线索评分台',
    headerSubtitle: '从来源分布、评分结果到待跟进名单，一页承接商机识别流程。',
    headerTags: '销售,线索,评分',
    headerExtra: '本周新增：186 条',
    components: [
      createMetricGrid(
        [
          { id: 'lead-kpi-1', title: '高分线索', subtitle: 'A 级', value: '48', extra: '今日新增 7' },
          { id: 'lead-kpi-2', title: '待跟进', subtitle: '当前', value: '32', extra: '超时 4' },
          { id: 'lead-kpi-3', title: '预约演示', subtitle: '本周', value: '19', extra: '转化率 21%' },
          { id: 'lead-kpi-4', title: '平均客单价', subtitle: '预测', value: '￥18,400', extra: '较上月 +8%' },
        ],
      ),
      createBarChartPanel({
        title: '渠道评分分布',
        data: [
          { channel: '官网试用', score: 88 },
          { channel: '内容投放', score: 63 },
          { channel: '渠道合作', score: 74 },
          { channel: '老客转介绍', score: 92 },
        ],
        xAxisKey: 'channel',
        valueKey: 'score',
        color: '#0f766e',
        position: { left: 24, top: 364, width: 520, height: 352 },
      }),
      createTablePanel({
        title: '待跟进名单',
        columns: [
          { title: '公司', dataIndex: 'company' },
          { title: '联系人', dataIndex: 'contact' },
          { title: '来源', dataIndex: 'source' },
          { title: '评分', dataIndex: 'score' },
          { title: '阶段', dataIndex: 'stage' },
        ],
        rows: [
          { key: 'lead-1', company: '青禾科技', contact: '陈涛', source: '官网试用', score: '92', stage: '待演示' },
          { key: 'lead-2', company: '方舟物流', contact: '李娜', source: '内容投放', score: '76', stage: '需求确认' },
          { key: 'lead-3', company: '北极星教育', contact: '王薇', source: '转介绍', score: '89', stage: '报价中' },
          { key: 'lead-4', company: '山海制造', contact: '郑凯', source: '渠道合作', score: '71', stage: '首次触达' },
        ],
        position: { left: 568, top: 364, width: 848, height: 352 },
      }),
      createQueryFilterPanel(
        [
          { id: 'lead-owner', label: '负责人', field: 'owner', type: 'input', placeholder: '请输入销售姓名' },
          { id: 'lead-source', label: '来源', field: 'source', type: 'select', placeholder: '请选择来源', optionsText: '全部,官网试用,内容投放,渠道合作,转介绍' },
          { id: 'lead-stage', label: '阶段', field: 'stage', type: 'select', placeholder: '请选择阶段', optionsText: '全部,首次触达,需求确认,待演示,报价中,已赢单' },
        ],
        { left: 24, top: 740, width: 1392, height: 116 },
      ),
      createRichTextPanel(
        `
          <div style="padding:4px;color:#334155;">
            <div style="font-size:18px;font-weight:700;color:#0f172a;">跟进建议</div>
            <div style="margin-top:14px;line-height:1.9;">
              A 级线索建议优先安排 24 小时内跟进，并补充预算、团队规模与决策链信息。<br/>
              来自官网试用的用户更关注产品体验，可在模板上加一列“最近活跃行为”。<br/>
              对于转介绍商机，建议单独展示推荐人关系和历史成交记录，方便判断优先级。
            </div>
          </div>
        `,
        { left: 24, top: 880, width: 1392, height: 176 },
      ),
    ],
  });
}

/**
 * 生成财务对账模板。
 */
function createFinanceReconciliationTemplate(): TemplatePreset {
  return createSinglePageTemplate({
    key: 'finance-reconciliation-single',
    name: '财务对账中心',
    desc: '适合财务团队查看结算状态、异常占比和待处理账单的单页面模板。',
    tags: ['admin', 'finance', 'reconciliation'],
    pageTitle: '财务对账中心',
    path: '/finance-reconciliation',
    headerTitle: '财务对账中心',
    headerSubtitle: '一页覆盖对账结果、异常账单和处理建议，适合结算与退款场景。',
    headerTags: '财务,对账,单页面',
    headerExtra: '结算周期：T+1',
    components: [
      createMetricGrid(
        [
          { id: 'fin-kpi-1', title: '待对账订单', subtitle: '当前', value: '1,248', extra: '较昨日 -12%' },
          { id: 'fin-kpi-2', title: '异常金额', subtitle: '今日', value: '￥36,820', extra: '异常单 19' },
          { id: 'fin-kpi-3', title: '已结清', subtitle: '本周', value: '￥428w', extra: '完成率 94%' },
          { id: 'fin-kpi-4', title: '退款待核', subtitle: '当前', value: '14', extra: '高优先级 3' },
        ],
      ),
      createPieChartPanel({
        title: '异常类型分布',
        data: [
          { name: '金额不一致', value: 9 },
          { name: '支付回调缺失', value: 5 },
          { name: '重复退款', value: 3 },
          { name: '手续费偏差', value: 2 },
        ],
        nameKey: 'name',
        valueKey: 'value',
        color: '#dc2626',
        position: { left: 24, top: 364, width: 420, height: 356 },
      }),
      createTablePanel({
        title: '异常账单',
        columns: [
          { title: '订单号', dataIndex: 'orderNo' },
          { title: '渠道', dataIndex: 'channel' },
          { title: '问题', dataIndex: 'issue' },
          { title: '差额', dataIndex: 'diff' },
          { title: '状态', dataIndex: 'status' },
        ],
        rows: [
          { key: 'fin-1', orderNo: 'PO24050128', channel: '支付宝', issue: '金额不一致', diff: '￥320', status: '待核查' },
          { key: 'fin-2', orderNo: 'PO24050117', channel: '微信支付', issue: '回调缺失', diff: '￥1,280', status: '处理中' },
          { key: 'fin-3', orderNo: 'PO24050098', channel: '银行卡', issue: '手续费偏差', diff: '￥85', status: '待补记' },
          { key: 'fin-4', orderNo: 'PO24050076', channel: '支付宝', issue: '重复退款', diff: '￥560', status: '已拦截' },
        ],
        position: { left: 468, top: 364, width: 948, height: 356 },
      }),
      createRichTextPanel(
        `
          <div style="padding:4px;color:#334155;">
            <div style="font-size:18px;font-weight:700;color:#0f172a;">处理建议</div>
            <div style="margin-top:14px;line-height:1.9;">
              1. 对金额不一致的账单，先核验商品金额、券后实付与渠道回传金额。<br/>
              2. 回调缺失通常需要联动支付网关与补单日志，建议补充“回调重放”按钮。<br/>
              3. 重复退款风险较高，建议在正式系统里增加二次确认和权限校验。<br/>
              4. 如果你需要完整结算台，可在此模板下方继续扩展日历、批次和导出能力。
            </div>
          </div>
        `,
        { left: 24, top: 744, width: 1392, height: 220 },
      ),
    ],
  });
}

/**
 * 生成设备监控模板。
 */
function createDeviceMonitorTemplate(): TemplatePreset {
  return createSinglePageTemplate({
    key: 'iot-device-monitor-single',
    name: '设备监控中心',
    desc: '适合物联网、硬件运维和门店设备监控的单页面模板。',
    tags: ['admin', 'iot', 'monitor'],
    pageTitle: '设备监控中心',
    path: '/device-monitor',
    headerTitle: '设备监控中心',
    headerSubtitle: '在一页内查看设备在线率、告警走势与待处理终端列表。',
    headerTags: 'IOT,监控,设备',
    headerExtra: '在线率：98.2%',
    components: [
      createMetricGrid(
        [
          { id: 'iot-kpi-1', title: '在线设备', subtitle: '当前', value: '2,184', extra: '离线 41' },
          { id: 'iot-kpi-2', title: '活跃门店', subtitle: '今日', value: '312', extra: '异常门店 7' },
          { id: 'iot-kpi-3', title: '今日告警', subtitle: '全部级别', value: '68', extra: 'P1 告警 2' },
          { id: 'iot-kpi-4', title: '平均恢复', subtitle: '耗时', value: '14m', extra: '较昨日 -3m' },
        ],
      ),
      createLineChartPanel({
        title: '24 小时告警趋势',
        data: [
          { hour: '00', count: 4 },
          { hour: '04', count: 6 },
          { hour: '08', count: 11 },
          { hour: '12', count: 14 },
          { hour: '16', count: 18 },
          { hour: '20', count: 15 },
        ],
        xAxisKey: 'hour',
        valueKey: 'count',
        color: '#0284c7',
        position: { left: 24, top: 364, width: 612, height: 352 },
      }),
      createTablePanel({
        title: '异常设备',
        columns: [
          { title: '设备 ID', dataIndex: 'deviceId' },
          { title: '门店', dataIndex: 'store' },
          { title: '问题', dataIndex: 'issue' },
          { title: '最近心跳', dataIndex: 'heartbeat' },
          { title: '状态', dataIndex: 'status' },
        ],
        rows: [
          { key: 'iot-1', deviceId: 'POS-1028', store: '上海静安店', issue: '离线超 15 分钟', heartbeat: '09:42', status: '待处理' },
          { key: 'iot-2', deviceId: 'CAM-2204', store: '杭州滨江店', issue: '视频流抖动', heartbeat: '10:16', status: '处理中' },
          { key: 'iot-3', deviceId: 'LOCK-0083', store: '深圳南山店', issue: '电量过低', heartbeat: '10:20', status: '待更换' },
          { key: 'iot-4', deviceId: 'POS-1041', store: '北京国贸店', issue: '打印机缺纸', heartbeat: '10:23', status: '已派单' },
        ],
        position: { left: 660, top: 364, width: 756, height: 352 },
      }),
      createListPanel(
        [
          { title: '高频离线门店优先排查网络', description: '建议增加门店网络状态和最近工单数量。' },
          { title: '耗材类问题适合自动派单', description: '如打印纸、低电量等低风险问题可自动分配。' },
          { title: '保留维修历史', description: '对于反复告警的设备，需要展示近 30 天维护记录。' },
          { title: '建立设备画像', description: '按型号、厂商和批次分析故障集中度。' },
        ],
        { left: 24, top: 740, width: 520, height: 240 },
      ),
      createRichTextPanel(
        `
          <div style="padding:4px;color:#334155;">
            <div style="font-size:18px;font-weight:700;color:#0f172a;">值班提示</div>
            <div style="margin-top:14px;line-height:1.9;">
              当前模板默认适合“总部设备运维台”。如果你要面向门店经理使用，可以把右上异常设备表替换成门店视角列表。<br/>
              左侧折线图可进一步细分为离线、低电量、网络波动等多条趋势线，方便观察异常结构变化。
            </div>
          </div>
        `,
        { left: 568, top: 740, width: 848, height: 240 },
      ),
    ],
  });
}

/**
 * 生成客服质检模板。
 */
function createSupportQualityTemplate(): TemplatePreset {
  return createSinglePageTemplate({
    key: 'support-quality-review-single',
    name: '客服质检中心',
    desc: '面向客服团队的单页面质检模板，聚合评分分布、待复核会话和评审标准。',
    tags: ['admin', 'support', 'quality'],
    pageTitle: '客服质检中心',
    path: '/support-quality',
    headerTitle: '客服质检中心',
    headerSubtitle: '适合搭建录音抽检、会话质检与标准回放场景。',
    headerTags: '客服,质检,单页面',
    headerExtra: '今日抽检：86 通',
    components: [
      createMetricGrid(
        [
          { id: 'quality-kpi-1', title: '平均评分', subtitle: '今日', value: '91.4', extra: '低于目标 1.6' },
          { id: 'quality-kpi-2', title: '待复核', subtitle: '当前', value: '18', extra: '高优 4' },
          { id: 'quality-kpi-3', title: '命中违规', subtitle: '本周', value: '7', extra: '主要为承诺过度' },
          { id: 'quality-kpi-4', title: '优秀案例', subtitle: '本月', value: '26', extra: '可用于培训' },
        ],
      ),
      createBarChartPanel({
        title: '评分区间分布',
        data: [
          { level: '95-100', count: 22 },
          { level: '90-94', count: 31 },
          { level: '80-89', count: 18 },
          { level: '<80', count: 7 },
        ],
        xAxisKey: 'level',
        valueKey: 'count',
        color: '#9333ea',
        position: { left: 24, top: 364, width: 484, height: 340 },
      }),
      createTablePanel({
        title: '待复核会话',
        columns: [
          { title: '坐席', dataIndex: 'agent' },
          { title: '主题', dataIndex: 'topic' },
          { title: '风险点', dataIndex: 'risk' },
          { title: '评分', dataIndex: 'score' },
          { title: '状态', dataIndex: 'status' },
        ],
        rows: [
          { key: 'quality-1', agent: '林悦', topic: '退款投诉', risk: '承诺时效不清', score: '78', status: '待复核' },
          { key: 'quality-2', agent: '周洋', topic: '物流延迟', risk: '情绪安抚不足', score: '82', status: '待辅导' },
          { key: 'quality-3', agent: '黄婷', topic: '改签申请', risk: '流程说明缺失', score: '84', status: '待复核' },
          { key: 'quality-4', agent: '李凯', topic: '发票补开', risk: '用语不规范', score: '79', status: '待复核' },
        ],
        position: { left: 532, top: 364, width: 884, height: 340 },
      }),
      createRichTextPanel(
        `
          <div style="padding:4px;color:#334155;">
            <div style="font-size:18px;font-weight:700;color:#0f172a;">评审标准</div>
            <div style="margin-top:14px;line-height:1.9;">
              1. 首次响应是否及时，并主动确认用户核心诉求。<br/>
              2. 是否给出清晰、可执行的处理路径与时间承诺。<br/>
              3. 遇到高风险场景时，是否及时升级并避免过度承诺。<br/>
              4. 结束语是否完成复述确认，避免用户二次来访。
            </div>
          </div>
        `,
        { left: 24, top: 728, width: 1392, height: 220 },
      ),
    ],
  });
}

/**
 * 生成招聘筛选模板。
 */
function createRecruitmentScreeningTemplate(): TemplatePreset {
  return createSinglePageTemplate({
    key: 'recruitment-screening-single',
    name: '招聘筛选台',
    desc: '适合招聘团队管理候选人筛选、岗位匹配和评估摘要的单页面模板。',
    tags: ['admin', 'recruitment', 'screening'],
    pageTitle: '招聘筛选台',
    path: '/recruitment-screening',
    headerTitle: '招聘筛选台',
    headerSubtitle: '把岗位筛选、候选人列表和评估摘要放进一页，便于招聘协同。',
    headerTags: '招聘,候选人,单页面',
    headerExtra: '本周新增简历：238 份',
    components: [
      createMetricGrid(
        [
          { id: 'hire-kpi-1', title: '待初筛', subtitle: '当前', value: '64', extra: '推荐优先 12' },
          { id: 'hire-kpi-2', title: '进入面试', subtitle: '本周', value: '18', extra: '通过率 28%' },
          { id: 'hire-kpi-3', title: '高匹配度', subtitle: '评分 85+', value: '21', extra: '技术岗为主' },
          { id: 'hire-kpi-4', title: 'Offer 中', subtitle: '当前', value: '6', extra: '待确认 2' },
        ],
      ),
      createQueryFilterPanel(
        [
          { id: 'hire-job', label: '岗位', field: 'job', type: 'select', placeholder: '请选择岗位', optionsText: '全部,前端工程师,产品经理,数据分析师,客服主管' },
          { id: 'hire-stage', label: '阶段', field: 'stage', type: 'select', placeholder: '请选择阶段', optionsText: '全部,待初筛,一面,二面,Offer 中' },
          { id: 'hire-keyword', label: '关键词', field: 'keyword', type: 'input', placeholder: '学校/公司/技能关键词' },
        ],
        { left: 24, top: 364, width: 1392, height: 116 },
      ),
      createTablePanel({
        title: '候选人列表',
        columns: [
          { title: '候选人', dataIndex: 'name' },
          { title: '岗位', dataIndex: 'job' },
          { title: '年限', dataIndex: 'years' },
          { title: '匹配度', dataIndex: 'score' },
          { title: '阶段', dataIndex: 'stage' },
        ],
        rows: [
          { key: 'hire-1', name: '周子轩', job: '前端工程师', years: '5 年', score: '91', stage: '一面' },
          { key: 'hire-2', name: '宋清', job: '数据分析师', years: '3 年', score: '87', stage: '待初筛' },
          { key: 'hire-3', name: '陈茜', job: '产品经理', years: '6 年', score: '89', stage: '二面' },
          { key: 'hire-4', name: '韩沫', job: '客服主管', years: '4 年', score: '84', stage: 'Offer 中' },
        ],
        position: { left: 24, top: 504, width: 880, height: 392 },
        pagination: true,
      }),
      createRichTextPanel(
        `
          <div style="padding:4px;color:#334155;">
            <div style="font-size:18px;font-weight:700;color:#0f172a;">评估摘要</div>
            <div style="margin-top:14px;line-height:1.9;">
              当前高匹配候选人主要集中在前端与产品岗位。建议把“项目复杂度”“跨团队协作”“业务理解”作为统一评估标签。<br/>
              如果要对接 AI 简历分析，可在此页继续补充技能关键词命中、项目摘要生成和面试问答建议模块。
            </div>
          </div>
        `,
        { left: 928, top: 504, width: 488, height: 188 },
      ),
      createListPanel(
        [
          { title: '优先跟进推荐', description: '对 85 分以上且薪资预期可接受的候选人优先推进。' },
          { title: '统一面试问题库', description: '按岗位输出结构化面试提纲，减少评价口径不一致。' },
          { title: '风险标签沉淀', description: '对频繁跳槽、表达偏差等问题建立标签规则。' },
          { title: '面试反馈摘要', description: '可在模板上接入 AI 自动汇总面试纪要。' },
        ],
        { left: 928, top: 716, width: 488, height: 180 },
      ),
    ],
  });
}

/**
 * 生成内容排期模板。
 */
function createContentCalendarTemplate(): TemplatePreset {
  return createSinglePageTemplate({
    key: 'content-calendar-single',
    name: '内容排期中心',
    desc: '适合新媒体和内容团队管理选题、排期和发布状态的单页面模板。',
    tags: ['admin', 'content', 'calendar'],
    pageTitle: '内容排期中心',
    path: '/content-calendar',
    headerTitle: '内容排期中心',
    headerSubtitle: '把选题进度、发布排期和执行提示集中在一页，适合运营内容团队协作。',
    headerTags: '内容,排期,单页面',
    headerExtra: '本周待发布：14 条',
    components: [
      createMetricGrid(
        [
          { id: 'content-kpi-1', title: '待发布', subtitle: '本周', value: '14', extra: '重点 5 条' },
          { id: 'content-kpi-2', title: '已完成', subtitle: '本月', value: '42', extra: '完成率 88%' },
          { id: 'content-kpi-3', title: '跨渠道复用', subtitle: '内容数', value: '19', extra: '节省 26% 人力' },
          { id: 'content-kpi-4', title: '待审核', subtitle: '当前', value: '11', extra: '法务审核 3' },
        ],
      ),
      createListPanel(
        [
          { title: '5 月品牌升级专题', description: '主推官网改版、工作台模板和智能运营案例。' },
          { title: '618 活动预热脚本', description: '重点承接短视频、直播和私域消息联动。' },
          { title: 'AI 功能发布说明', description: '同步准备 FAQ、图文教程和更新公告。' },
          { title: '客户案例访谈', description: '结合垂类管理后台场景，突出提效价值。' },
        ],
        { left: 24, top: 364, width: 428, height: 404 },
      ),
      createTablePanel({
        title: '发布排期',
        columns: [
          { title: '日期', dataIndex: 'date' },
          { title: '渠道', dataIndex: 'channel' },
          { title: '主题', dataIndex: 'topic' },
          { title: '负责人', dataIndex: 'owner' },
          { title: '状态', dataIndex: 'status' },
        ],
        rows: [
          { key: 'content-1', date: '05-06', channel: '公众号', topic: 'AI 对话工作台上线', owner: '内容-婉晴', status: '待审核' },
          { key: 'content-2', date: '05-07', channel: '视频号', topic: '618 预热短片', owner: '视频-小北', status: '制作中' },
          { key: 'content-3', date: '05-08', channel: '小红书', topic: '后台模板合集', owner: '运营-冉冉', status: '待发布' },
          { key: 'content-4', date: '05-09', channel: '官网博客', topic: '数据生成模板实践', owner: '增长-阿诚', status: '已排期' },
        ],
        position: { left: 476, top: 364, width: 940, height: 404 },
      }),
      createRichTextPanel(
        `
          <div style="padding:4px;color:#334155;">
            <div style="font-size:18px;font-weight:700;color:#0f172a;">执行提醒</div>
            <div style="margin-top:14px;line-height:1.9;">
              建议把“选题池”“已排期”“已发布”做成统一状态流，避免各渠道各管一份。<br/>
              如果你需要更强的日历视图，可在此模板基础上扩展真正的月历组件或拖拽排期能力。<br/>
              当前版本更适合做内容后台 MVP，先把选题、日期、负责人和状态跑通。
            </div>
          </div>
        `,
        { left: 24, top: 792, width: 1392, height: 196 },
      ),
    ],
  });
}

/**
 * 生成数据分析概览模板。
 */
function createDataAnalyticsTemplate(): TemplatePreset {
  return createSinglePageTemplate({
    key: 'data-analytics-overview-single',
    name: '数据分析概览',
    desc: '适合业务分析、运营监控和老板驾驶舱的单页面模板。',
    tags: ['admin', 'analytics', 'dashboard'],
    pageTitle: '数据分析概览',
    path: '/data-analytics',
    headerTitle: '数据分析概览',
    headerSubtitle: '聚合核心指标、趋势和重点异常，适合作为任意后台系统的默认首页。',
    headerTags: '数据分析,概览,单页面',
    headerExtra: '数据刷新：每 10 分钟',
    components: [
      createMetricGrid(
        [
          { id: 'analytics-kpi-1', title: 'GMV', subtitle: '今日', value: '￥126w', extra: '环比 +12%' },
          { id: 'analytics-kpi-2', title: '新增用户', subtitle: '今日', value: '2,384', extra: '转化率 6.1%' },
          { id: 'analytics-kpi-3', title: '活跃商家', subtitle: '当前', value: '842', extra: '新增 28' },
          { id: 'analytics-kpi-4', title: '异常订单', subtitle: '当前', value: '17', extra: '待处理 5' },
        ],
      ),
      createLineChartPanel({
        title: '近 7 日收入趋势',
        data: [
          { day: '周一', value: 82 },
          { day: '周二', value: 76 },
          { day: '周三', value: 91 },
          { day: '周四', value: 88 },
          { day: '周五', value: 106 },
          { day: '周六', value: 118 },
          { day: '周日', value: 126 },
        ],
        xAxisKey: 'day',
        valueKey: 'value',
        color: '#2563eb',
        position: { left: 24, top: 364, width: 760, height: 352 },
      }),
      createPieChartPanel({
        title: '订单来源',
        data: [
          { name: '站内推荐', value: 46 },
          { name: '搜索', value: 21 },
          { name: '活动会场', value: 18 },
          { name: '外部投放', value: 15 },
        ],
        nameKey: 'name',
        valueKey: 'value',
        color: '#16a34a',
        position: { left: 808, top: 364, width: 280, height: 352 },
      }),
      createTablePanel({
        title: '重点异常',
        columns: [
          { title: '模块', dataIndex: 'module' },
          { title: '问题', dataIndex: 'issue' },
          { title: '影响', dataIndex: 'impact' },
          { title: '负责人', dataIndex: 'owner' },
        ],
        rows: [
          { key: 'analytics-1', module: '支付', issue: '回调延迟升高', impact: '影响成功率 0.4%', owner: '支付组' },
          { key: 'analytics-2', module: '推荐', issue: 'CTR 下滑', impact: '影响流量转化', owner: '算法组' },
          { key: 'analytics-3', module: '发货', issue: '履约积压', impact: '超时订单 14 笔', owner: '供应链' },
          { key: 'analytics-4', module: '客服', issue: '咨询峰值上涨', impact: '接通率下降 2%', owner: '客服组' },
        ],
        position: { left: 1112, top: 364, width: 304, height: 352 },
      }),
      createRichTextPanel(
        `
          <div style="padding:4px;color:#334155;">
            <div style="font-size:18px;font-weight:700;color:#0f172a;">经营提示</div>
            <div style="margin-top:14px;line-height:1.9;">
              周末收入增长明显，建议继续加大活动会场和高转化渠道的预算。<br/>
              当前支付与履约是两个主要风险点，可将表格联动到工单或告警模块。<br/>
              如果你后续要做老板驾驶舱，大概率只需要在这个模板基础上替换数据源和品牌视觉。
            </div>
          </div>
        `,
        { left: 24, top: 740, width: 1392, height: 204 },
      ),
    ],
  });
}

export const singlePageAdminTemplatePresets: TemplatePreset[] = [
  createAiChatCopilotTemplate(),
  createDatasetGeneratorTemplate(),
  createAgentWorkflowTemplate(),
  createMarketingCopyTemplate(),
  createKnowledgeQaTemplate(),
  createLeadScoringTemplate(),
  createFinanceReconciliationTemplate(),
  createDeviceMonitorTemplate(),
  createSupportQualityTemplate(),
  createRecruitmentScreeningTemplate(),
  createContentCalendarTemplate(),
  createDataAnalyticsTemplate(),
];
