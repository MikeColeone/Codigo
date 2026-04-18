import { makeAutoObservable } from "mobx";
import type {
  PageCategory,
  PageGridConfig,
  PageLayoutMode,
  PageWorkspaceExplorerResponse,
  PageWorkspaceFileResponse,
  PageWorkspaceIDEConfigResponse,
  PageWorkspaceResponse,
  PageWorkspaceRuntimeResponse,
  PageWorkspaceSessionResponse,
} from "@codigo/schema";

export type DeviceType = "mobile" | "pc";
export type CodeFramework = "react" | "vue";
export type EditorMode = "visual" | "code" | "webide";

export type EChartsThemeSetting = "codigoTheme" | "";

export interface WorkspaceFileState {
  file: PageWorkspaceFileResponse;
  isDirty: boolean;
  isSaving: boolean;
}

interface IStorePage {
  title: string;
  description: string;
  tdk: string;
  pageCategory: PageCategory;
  layoutMode: PageLayoutMode;
  grid: PageGridConfig;
  deviceType: DeviceType;
  canvasWidth: number;
  canvasHeight: number;
  codeFramework: CodeFramework;
  editorMode: EditorMode;
  showOutlineTree: boolean;
  showGridDashedLines: boolean;
  chartTheme: EChartsThemeSetting;
  workspace: PageWorkspaceResponse | null;
  workspaceExplorer: PageWorkspaceExplorerResponse | null;
  workspaceSession: PageWorkspaceSessionResponse | null;
  workspaceRuntime: PageWorkspaceRuntimeResponse | null;
  workspaceIDEConfig: PageWorkspaceIDEConfigResponse | null;
  activeWorkspaceFilePath: string | null;
  workspaceOpenFilePaths: string[];
  workspaceFiles: Record<string, WorkspaceFileState>;
}

export function createStorePage() {
  return makeAutoObservable<IStorePage>({
    title: "管理系统页面",
    description: "用于配置管理后台页面的结构与业务说明",
    tdk: "admin dashboard, management system, business console",
    pageCategory: "admin",
    layoutMode: "absolute",
    grid: {
      cols: 12,
      rows: 12,
      gap: 8,
    },
    deviceType: "pc",
    canvasWidth: 1280,
    canvasHeight: 900,
    codeFramework: "react",
    editorMode: "visual",
    showOutlineTree: true,
    showGridDashedLines: true,
    chartTheme: "codigoTheme",
    workspace: null,
    workspaceExplorer: null,
    workspaceSession: null,
    workspaceRuntime: null,
    workspaceIDEConfig: null,
    activeWorkspaceFilePath: null,
    workspaceOpenFilePaths: [],
    workspaceFiles: {},
  });
}

export type TStorePage = ReturnType<typeof createStorePage>;
