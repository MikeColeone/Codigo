import type {
  TemplateComponent,
  TemplatePagePreset,
  TemplatePreset,
} from "../types/templates";

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 900;
const SIDEBAR_WIDTH = 272;

/**
 * 创建文本物料节点，统一后台模板中的文案样式。
 */
function createText(
  title: string,
  size: "xs" | "sm" | "base" | "lg" | "xl" = "base",
): TemplateComponent {
  return {
    type: "titleText",
    props: {
      title,
      size,
    },
  };
}

/**
 * 创建带站内页面跳转的侧边栏按钮。
 */
function createNavButton(
  label: string,
  pagePath: string,
  active: boolean,
): TemplateComponent {
  return {
    type: "button",
    props: {
      text: label,
      size: "large",
      type: active ? "primary" : "default",
      block: true,
      active,
    },
    events: {
      onClick: [{ type: "navigate", path: `page:${pagePath}` }],
    },
  };
}

/**
 * 创建后台模板中的通用容器。
 */
function createPlainContainer(
  children: TemplateComponent[],
  options?: {
    backgroundColor?: string;
    borderColor?: string;
    borderRadius?: number;
    minHeight?: number;
    padding?: number;
    title?: string;
  },
): TemplateComponent {
  return {
    type: "container",
    props: {
      title: options?.title ?? "",
      showChrome: false,
      backgroundColor: options?.backgroundColor ?? "transparent",
      borderColor: options?.borderColor ?? "transparent",
      borderRadius: options?.borderRadius ?? 0,
      padding: options?.padding ?? 0,
      minHeight: options?.minHeight ?? 0,
    },
    children,
  };
}

/**
 * 创建后台模板中的通用双栏布局。
 */
function createPlainTwoColumn(
  leftChildren: TemplateComponent[],
  rightChildren: TemplateComponent[],
  options?: {
    backgroundColor?: string;
    gap?: number;
    leftWidth?: number;
    minHeight?: number;
    styles?: Record<string, unknown>;
    title?: string;
  },
): TemplateComponent {
  return {
    type: "twoColumn",
    props: {
      title: options?.title ?? "",
      showChrome: false,
      leftWidth: options?.leftWidth ?? 320,
      gap: options?.gap ?? 16,
      minHeight: options?.minHeight ?? 120,
      backgroundColor: options?.backgroundColor ?? "transparent",
    },
    styles: options?.styles,
    children: [
      ...leftChildren.map((child) => ({
        ...child,
        slot: "left",
      })),
      ...rightChildren.map((child) => ({
        ...child,
        slot: "right",
      })),
    ],
  };
}

/**
 * 创建后台模板的顶部信息栏。
 */
function createTopBar(sectionTitle: string, sectionHint: string): TemplateComponent {
  return createPlainContainer(
    [
      createPlainTwoColumn(
        [
          createText("Nimbus Console", "lg"),
          createText(sectionHint, "sm"),
        ],
        [
          createPlainTwoColumn(
            [
              {
                type: "avatar",
                props: {
                  name: "MH",
                  size: 48,
                  shape: "circle",
                },
              },
            ],
            [
              createText("Mike He", "base"),
              createText("Super Admin", "sm"),
            ],
            {
              leftWidth: 64,
              gap: 12,
              minHeight: 64,
            },
          ),
        ],
        {
          leftWidth: 820,
          gap: 16,
          minHeight: 72,
        },
      ),
      createText(sectionTitle, "xs"),
    ],
    {
      backgroundColor: "#ffffff",
      borderColor: "#e2e8f0",
      borderRadius: 28,
      padding: 20,
      minHeight: 120,
    },
  );
}

/**
 * 创建后台模板的左侧导航区域。
 */
function createSidebar(activePagePath: string): TemplateComponent {
  return createPlainContainer(
    [
      createText("Codigo Admin", "lg"),
      createText("Workspace Console", "sm"),
      createPlainTwoColumn(
        [
          {
            type: "avatar",
            props: {
              name: "MH",
              size: 56,
              shape: "circle",
            },
          },
        ],
        [
          createText("Mike He", "base"),
          createText("Platform Owner", "sm"),
        ],
        {
          leftWidth: 72,
          gap: 12,
          minHeight: 72,
        },
      ),
      createText("Workspace", "xs"),
      createNavButton("Overview", "home", activePagePath === "home"),
      createNavButton("Project", "project", activePagePath === "project"),
      createNavButton("Auth", "auth", activePagePath === "auth"),
      createNavButton("Setting", "setting", activePagePath === "setting"),
    ],
    {
      backgroundColor: "#0f172a",
      borderColor: "#0f172a",
      borderRadius: 28,
      padding: 20,
      minHeight: 836,
    },
  );
}

/**
 * 创建总览页的内容区组件。
 */
function createOverviewContent(): TemplateComponent[] {
  return [
    {
      type: "breadcrumbBar",
      props: {
        items: [
          { id: "overview-breadcrumb-1", label: "后台系统" },
          { id: "overview-breadcrumb-2", label: "工作台" },
          { id: "overview-breadcrumb-3", label: "总览" },
        ],
        separator: "/",
      },
    },
    {
      type: "pageHeader",
      props: {
        title: "业务总览",
        subtitle: "用于快速查看项目、权限、服务状态和关键指标。",
        tagsText: "后台,总览,工作台",
        extraText: "最近更新时间: 今天 18:00",
      },
    },
    createPlainTwoColumn(
      [
        {
          type: "statCard",
          props: {
            title: "活跃项目",
            value: "128",
            trendText: "较昨日 +9",
            trendDirection: "up",
            description: "本周新增 14 个项目进入开发态",
          },
        },
      ],
      [
        {
          type: "statCard",
          props: {
            title: "在线用户",
            value: "2,184",
            trendText: "较昨日 +12.5%",
            trendDirection: "up",
            description: "活跃时段集中在 09:00 - 17:00",
          },
        },
      ],
      {
        leftWidth: 420,
        gap: 16,
        minHeight: 160,
      },
    ),
    createPlainTwoColumn(
      [
        {
          type: "statCard",
          props: {
            title: "待审批工单",
            value: "23",
            trendText: "较昨日 -4",
            trendDirection: "down",
            description: "建议优先处理高风险权限申请",
          },
        },
      ],
      [
        {
          type: "statCard",
          props: {
            title: "发布成功率",
            value: "99.2",
            suffix: "%",
            trendText: "保持稳定",
            trendDirection: "flat",
            description: "近 30 天发布任务整体表现稳定",
          },
        },
      ],
      {
        leftWidth: 420,
        gap: 16,
        minHeight: 160,
      },
    ),
    {
      type: "cardGrid",
      props: {
        columns: 3,
        items: [
          {
            id: "overview-grid-1",
            title: "项目健康度",
            subtitle: "稳定运行中的项目",
            value: "96%",
            extra: "核心项目本周无阻塞问题",
          },
          {
            id: "overview-grid-2",
            title: "权限审计",
            subtitle: "本周审计完成率",
            value: "82%",
            extra: "剩余 6 项待复核",
          },
          {
            id: "overview-grid-3",
            title: "系统告警",
            subtitle: "未恢复告警数",
            value: "4",
            extra: "均为低优先级告警",
          },
        ],
      },
    },
    {
      type: "dataTable",
      props: {
        title: "近期项目动态",
        size: "middle",
        bordered: true,
        pagination: true,
        pageSize: 5,
        emptyText: "暂无动态",
        columnsText: JSON.stringify(
          [
            { title: "项目名称", dataIndex: "name" },
            { title: "负责人", dataIndex: "owner" },
            { title: "状态", dataIndex: "status" },
            { title: "更新时间", dataIndex: "updatedAt" },
          ],
          null,
          2,
        ),
        dataText: JSON.stringify(
          [
            {
              key: "overview-row-1",
              name: "Workspace Console",
              owner: "Mike He",
              status: "运行中",
              updatedAt: "2026-04-12 18:00",
            },
            {
              key: "overview-row-2",
              name: "Permission Center",
              owner: "Anna",
              status: "待审核",
              updatedAt: "2026-04-12 16:20",
            },
            {
              key: "overview-row-3",
              name: "Release Pipeline",
              owner: "Chris",
              status: "已发布",
              updatedAt: "2026-04-12 15:42",
            },
          ],
          null,
          2,
        ),
      },
    },
  ];
}

/**
 * 创建项目页的内容区组件。
 */
function createProjectContent(): TemplateComponent[] {
  return [
    {
      type: "breadcrumbBar",
      props: {
        items: [
          { id: "project-breadcrumb-1", label: "后台系统" },
          { id: "project-breadcrumb-2", label: "项目管理" },
          { id: "project-breadcrumb-3", label: "项目列表" },
        ],
        separator: "/",
      },
    },
    {
      type: "pageHeader",
      props: {
        title: "项目管理",
        subtitle: "统一查看项目归属、环境状态和最近一次交付结果。",
        tagsText: "后台,项目,检索",
        extraText: "共 32 个项目",
      },
    },
    {
      type: "queryFilter",
      props: {
        columns: 4,
        searchText: "搜索",
        resetText: "重置",
        showSearchButton: true,
        showResetButton: true,
        fields: [
          {
            id: "project-filter-1",
            label: "项目名称",
            field: "keyword",
            type: "input",
            placeholder: "请输入项目名称",
            optionsText: "",
          },
          {
            id: "project-filter-2",
            label: "所属团队",
            field: "team",
            type: "select",
            placeholder: "请选择团队",
            optionsText: "全部,平台组,中台组,业务组",
          },
          {
            id: "project-filter-3",
            label: "当前状态",
            field: "status",
            type: "select",
            placeholder: "请选择状态",
            optionsText: "全部,开发中,待上线,运行中",
          },
        ],
      },
    },
    {
      type: "dataTable",
      props: {
        title: "项目清单",
        size: "middle",
        bordered: true,
        pagination: true,
        pageSize: 8,
        emptyText: "暂无项目数据",
        columnsText: JSON.stringify(
          [
            { title: "项目", dataIndex: "name" },
            { title: "团队", dataIndex: "team" },
            { title: "环境", dataIndex: "env" },
            { title: "状态", dataIndex: "status" },
            { title: "负责人", dataIndex: "owner" },
          ],
          null,
          2,
        ),
        dataText: JSON.stringify(
          [
            {
              key: "project-row-1",
              name: "Workspace Console",
              team: "平台组",
              env: "Production",
              status: "运行中",
              owner: "Mike He",
            },
            {
              key: "project-row-2",
              name: "Auth Portal",
              team: "中台组",
              env: "Staging",
              status: "待上线",
              owner: "Olivia",
            },
            {
              key: "project-row-3",
              name: "Setting Center",
              team: "业务组",
              env: "Production",
              status: "开发中",
              owner: "Kevin",
            },
          ],
          null,
          2,
        ),
      },
    },
  ];
}

/**
 * 创建权限页的内容区组件。
 */
function createAuthContent(): TemplateComponent[] {
  return [
    {
      type: "breadcrumbBar",
      props: {
        items: [
          { id: "auth-breadcrumb-1", label: "后台系统" },
          { id: "auth-breadcrumb-2", label: "权限中心" },
          { id: "auth-breadcrumb-3", label: "角色授权" },
        ],
        separator: "/",
      },
    },
    {
      type: "pageHeader",
      props: {
        title: "权限中心",
        subtitle: "按角色查看权限范围、待处理申请和关键成员分布。",
        tagsText: "后台,权限,角色",
        extraText: "今日新增 5 条申请",
      },
    },
    createPlainTwoColumn(
      [
        {
          type: "list",
          props: {
            items: [
              {
                title: "平台管理员",
                titleLink: "",
                description: "拥有项目、发布、成员、审计的完整权限",
                avatar: "",
              },
              {
                title: "项目管理员",
                titleLink: "",
                description: "管理项目成员、环境配置和发布审批",
                avatar: "",
              },
              {
                title: "审计人员",
                titleLink: "",
                description: "仅查看日志、权限记录和敏感操作结果",
                avatar: "",
              },
            ],
          },
        },
      ],
      [
        {
          type: "cardGrid",
          props: {
            columns: 2,
            items: [
              {
                id: "auth-grid-1",
                title: "待处理申请",
                subtitle: "待审批",
                value: "12",
                extra: "其中高风险 3 条",
              },
              {
                id: "auth-grid-2",
                title: "角色数量",
                subtitle: "当前启用",
                value: "8",
                extra: "覆盖 3 条业务线",
              },
            ],
          },
        },
      ],
      {
        leftWidth: 430,
        gap: 16,
        minHeight: 220,
      },
    ),
    {
      type: "dataTable",
      props: {
        title: "成员授权列表",
        size: "middle",
        bordered: true,
        pagination: true,
        pageSize: 8,
        emptyText: "暂无授权记录",
        columnsText: JSON.stringify(
          [
            { title: "成员", dataIndex: "name" },
            { title: "角色", dataIndex: "role" },
            { title: "范围", dataIndex: "scope" },
            { title: "状态", dataIndex: "status" },
          ],
          null,
          2,
        ),
        dataText: JSON.stringify(
          [
            {
              key: "auth-row-1",
              name: "Mike He",
              role: "平台管理员",
              scope: "全局",
              status: "生效中",
            },
            {
              key: "auth-row-2",
              name: "Anna",
              role: "项目管理员",
              scope: "Workspace Console",
              status: "待复核",
            },
            {
              key: "auth-row-3",
              name: "Kevin",
              role: "审计人员",
              scope: "只读",
              status: "生效中",
            },
          ],
          null,
          2,
        ),
      },
    },
  ];
}

/**
 * 创建设置页的内容区组件。
 */
function createSettingContent(): TemplateComponent[] {
  return [
    {
      type: "breadcrumbBar",
      props: {
        items: [
          { id: "setting-breadcrumb-1", label: "后台系统" },
          { id: "setting-breadcrumb-2", label: "系统设置" },
          { id: "setting-breadcrumb-3", label: "基础配置" },
        ],
        separator: "/",
      },
    },
    {
      type: "pageHeader",
      props: {
        title: "系统设置",
        subtitle: "集中维护平台名称、通知策略和默认发布配置。",
        tagsText: "后台,设置,配置",
        extraText: "设置变更后需重新发布",
      },
    },
    createPlainContainer(
      [
        createText("基础配置", "lg"),
        {
          type: "input",
          props: {
            title: "平台名称",
            placeholder: "请输入平台名称",
            text: "Codigo Admin Console",
          },
        },
        {
          type: "input",
          props: {
            title: "默认域名",
            placeholder: "请输入默认域名",
            text: "admin.codigo.local",
          },
        },
        {
          type: "radio",
          props: {
            title: "默认发布环境",
            defaultRadio: "prod",
            options: [
              { id: "prod", value: "Production" },
              { id: "staging", value: "Staging" },
            ],
          },
        },
        {
          type: "checkbox",
          props: {
            title: "通知方式",
            defaultChecked: ["mail", "bot"],
            options: [
              { id: "mail", value: "邮件通知" },
              { id: "sms", value: "短信提醒" },
              { id: "bot", value: "机器人通知" },
            ],
          },
        },
      ],
      {
        backgroundColor: "#ffffff",
        borderColor: "#e2e8f0",
        borderRadius: 24,
        padding: 20,
        minHeight: 420,
      },
    ),
  ];
}

/**
 * 创建带统一后台壳子的页面模板。
 */
function createShellPage(
  name: string,
  path: string,
  sectionHint: string,
  content: TemplateComponent[],
): TemplatePagePreset {
  return {
    name,
    path,
    components: [
      createPlainTwoColumn(
        [createSidebar(path)],
        [
          createPlainContainer(
            [
              createTopBar(name, sectionHint),
              createPlainContainer(content, {
                backgroundColor: "transparent",
                borderColor: "transparent",
                borderRadius: 0,
                padding: 0,
                minHeight: 680,
              }),
            ],
            {
              backgroundColor: "transparent",
              borderColor: "transparent",
              borderRadius: 0,
              padding: 0,
              minHeight: 836,
            },
          ),
        ],
        {
          leftWidth: SIDEBAR_WIDTH,
          gap: 20,
          minHeight: CANVAS_HEIGHT - 64,
          backgroundColor: "#f8fafc",
          styles: {
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
          },
        },
      ),
    ],
  };
}

/**
 * 创建通用后台多页面模板。
 */
export function createAdminConsoleTemplate(): TemplatePreset {
  return {
    key: "admin-console-workspace",
    name: "通用后台管理模板",
    desc: "提供左侧导航、顶部用户区和多页面内容区的常规后台骨架，适合作为管理系统模板起点。",
    tags: ["后台管理", "多页面", "PC"],
    pageTitle: "Codigo Admin Console",
    pageCategory: "admin",
    layoutMode: "absolute",
    deviceType: "pc",
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    activePagePath: "home",
    pages: [
      createShellPage("Overview", "home", "业务总览与运行概况", createOverviewContent()),
      createShellPage("Project", "project", "项目列表与团队分工", createProjectContent()),
      createShellPage("Auth", "auth", "角色授权与权限审计", createAuthContent()),
      createShellPage("Setting", "setting", "平台配置与发布策略", createSettingContent()),
    ],
  };
}
