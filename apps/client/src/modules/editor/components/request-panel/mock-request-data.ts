export type RequestModuleType = "http" | "rpc" | "mysql" | "mongodb";

export interface RequestFieldItem {
  id: string;
  key: string;
  value: string;
}

export interface RequestMappingItem {
  id: string;
  source: string;
  target: string;
}

export interface EditorRequestRecord {
  id: string;
  name: string;
  type: RequestModuleType;
  method: "GET" | "POST" | "PUT";
  url: string;
  description: string;
  autoRun: boolean;
  statusText: string;
  headers: RequestFieldItem[];
  inputMappings: RequestMappingItem[];
  outputMappings: RequestMappingItem[];
}

export interface RequestTypeOption {
  key: RequestModuleType;
  label: string;
  category: string;
  description: string;
}

export const REQUEST_TYPE_OPTIONS: RequestTypeOption[] = [
  {
    key: "http",
    label: "HTTP",
    category: "常用",
    description: "适合 REST 接口、第三方 API 和当前站点服务请求。",
  },
  {
    key: "rpc",
    label: "RPC",
    category: "常用",
    description: "先走前端演示链路，默认展示内部服务调用字段。",
  },
  {
    key: "mysql",
    label: "MySQL",
    category: "数据库",
    description: "先写死为查询示例，方便后续替换成真实数据源配置。",
  },
  {
    key: "mongodb",
    label: "MongoDB",
    category: "数据库",
    description: "保留 NoSQL 类型入口，当前同样使用 mock 配置。",
  },
];

/**
 * 根据请求类型生成一份可编辑的前端 mock 请求配置。
 */
export function createMockRequestRecord(
  type: RequestModuleType,
  order: number,
): EditorRequestRecord {
  const name = `${REQUEST_TYPE_LABEL_MAP[type]}${order}`;

  return {
    id: `request-${type}-${Date.now()}-${order}`,
    name,
    type,
    method: type === "http" ? "POST" : "GET",
    url: resolveMockUrl(type),
    description: resolveMockDescription(type),
    autoRun: type === "http",
    statusText: "前端 mock",
    headers: [
      { id: `${name}-header-1`, key: "Content-Type", value: "application/json" },
      { id: `${name}-header-2`, key: "X-Debug-Scene", value: "editor-request-panel" },
    ],
    inputMappings: [
      { id: `${name}-input-1`, source: "page.form.keyword", target: "keyword" },
      { id: `${name}-input-2`, source: "page.pagination.current", target: "page" },
    ],
    outputMappings: [
      { id: `${name}-output-1`, source: "data.list", target: "state.tableRows" },
      { id: `${name}-output-2`, source: "data.total", target: "state.total" },
    ],
  };
}

const REQUEST_TYPE_LABEL_MAP: Record<RequestModuleType, string> = {
  http: "HTTP请求",
  rpc: "RPC请求",
  mysql: "MySQL请求",
  mongodb: "Mongo请求",
};

/**
 * 返回请求类型对应的 mock 地址。
 */
function resolveMockUrl(type: RequestModuleType) {
  switch (type) {
    case "rpc":
      return "rpc://workspace.user-service/listUsers";
    case "mysql":
      return "mysql://workspace/main/query-users";
    case "mongodb":
      return "mongodb://workspace/main/aggregate-dashboard";
    default:
      return "/api/mock/query-list";
  }
}

/**
 * 返回请求类型对应的 mock 说明。
 */
function resolveMockDescription(type: RequestModuleType) {
  switch (type) {
    case "rpc":
      return "模拟站内 RPC 服务调用，先校验入口交互和底部配置台。";
    case "mysql":
      return "模拟数据库查询任务，后续可替换成真实 SQL 配置。";
    case "mongodb":
      return "模拟聚合查询流程，当前仅演示 UI 链路。";
    default:
      return "模拟 HTTP 请求流程，创建后会自动拉起底部配置台。";
  }
}
