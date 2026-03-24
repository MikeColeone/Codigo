import type {
  ILowCode,
  IComponent,
  IComponentData,
  IPageVersion,
  SyncSchemaItem,
} from "..";

export type PostReleaseRequest = Omit<
  ILowCode,
  "id" | "account_id" | "components"
> & { components: Omit<IComponent, "account_id" | "page_id">[] };

export type PostQuestionDataRequest = Pick<IComponentData, "page_id" | "props">;

export type GetReleaseDataResponse = Omit<ILowCode, "components"> & {
  componentIds: string[];
  components: IComponent[];
};

export type getQuestionDataByIdRequest = Pick<IComponent, "id">;

export type GetPageVersionsResponse = Omit<IPageVersion, "schema_data">[];

export type GetPageVersionDetailResponse = IPageVersion;

export interface PageWorkspaceResponse {
  pageId: number;
  pageName: string;
  workspaceId: string;
  workspaceName: string;
  workspaceRoot: string;
  workspaceRelativePath: string;
  templateRoot: string;
  packageJsonPath: string;
  schemaFilePath: string;
  entryFilePath: string;
  packageManager: "pnpm";
  installCommand: string;
  devCommand: string;
  exists: boolean;
  componentCount: number;
  lastSyncedAt?: string;
  schema?: SyncSchemaItem[];
}

export type PageWorkspaceSessionStatus =
  | "workspace_missing"
  | "stopped"
  | "starting"
  | "ready";

export interface PageWorkspaceSessionResponse {
  pageId: number;
  workspaceId: string;
  sessionId: string;
  status: PageWorkspaceSessionStatus;
  bridgeMode: "iframe";
  ideUrl?: string;
  previewUrl?: string;
  previewPort?: number;
  terminalCwd: string;
  terminalCommand: string;
  terminalTitle: string;
  heartbeatAt: string;
}

export type PageWorkspaceRuntimeStatus =
  | "workspace_missing"
  | "stopped"
  | "starting"
  | "running"
  | "error";

export interface PageWorkspaceRuntimeResponse {
  pageId: number;
  workspaceId: string;
  runtimeId: string;
  status: PageWorkspaceRuntimeStatus;
  previewUrl?: string;
  previewPort?: number;
  command: string;
  cwd: string;
  pid?: number;
  startedAt?: string;
  updatedAt: string;
  lastOutput?: string;
  exitCode?: number | null;
}

export interface PageWorkspaceIDEConfigResponse {
  pageId: number;
  workspaceId: string;
  sessionId: string;
  runtimeId?: string;
  provider: "opensumi";
  mode: "external-host";
  channelId: string;
  browserUrl: string;
  serverUrl: string;
  wsUrl?: string;
  hostOrigin: string;
  workspaceDir: string;
  workspacePath: string;
  terminalCwd: string;
  previewUrl?: string;
  launchQuery: Record<string, string>;
  capabilities: {
    fileSystem: boolean;
    terminal: boolean;
    preview: boolean;
  };
  heartbeatAt: string;
}

export interface WorkspaceExplorerNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: WorkspaceExplorerNode[];
}

export interface PageWorkspaceExplorerResponse {
  pageId: number;
  workspaceId: string;
  rootPath: string;
  tree: WorkspaceExplorerNode[];
}

export interface PageWorkspaceFileResponse {
  pageId: number;
  workspaceId: string;
  path: string;
  absolutePath: string;
  language: string;
  content: string;
  updatedAt: string;
}
