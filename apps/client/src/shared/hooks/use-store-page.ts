import { action } from "mobx";
import { createStorePage } from "@/shared/stores";
import type {
  TStorePage,
  DeviceType,
  CodeFramework,
  EditorMode,
} from "@/shared/stores";
import { setDefaultEChartsTheme } from "@codigo/materials";
import type {
  PageCategory,
  PageLayoutMode,
  PageShellLayout,
  PageWorkspaceIDEConfigResponse,
  PageWorkspaceExplorerResponse,
  PageWorkspaceFileResponse,
  PageWorkspaceResponse,
  PageWorkspaceRuntimeResponse,
  PageWorkspaceSessionResponse,
} from "@codigo/schema";

const storePage = createStorePage();
const GRID_DASHED_LINES_STORAGE_KEY = "editor:grid-dashed-lines";

setDefaultEChartsTheme(storePage.chartTheme || undefined);

function getGridDashedLinesStorageKey(pageId: number) {
  return `${GRID_DASHED_LINES_STORAGE_KEY}:${pageId}`;
}

/**
 * 兼容旧草稿中的流式布局配置，并统一收口到自由布局。
 */
function normalizePageLayoutMode(mode?: unknown): PageLayoutMode {
  return mode === "grid" || mode === "absolute" ? mode : "absolute";
}

function normalizePageShellLayout(layout?: unknown): PageShellLayout {
  return layout === "leftRight" ||
    layout === "topBottom" ||
    layout === "leftTop" ||
    layout === "topLeft" ||
    layout === "breadcrumb" ||
    layout === "none"
    ? layout
    : "leftRight";
}

export function useStorePage() {
  const syncPageCategoryDefaults = action((category: PageCategory) => {
    if (category === "admin") {
      storePage.deviceType = "pc";
      storePage.canvasWidth = 1280;
      storePage.canvasHeight = 900;
    }
  });

  /**
   * 设置页面标题
   * @param title - 页面标题
   */
  const setPageTitle = action((title: string) => {
    storePage.title = title;
  });

  const setDeviceType = action((type: DeviceType) => {
    storePage.deviceType = type;
    if (type === "mobile") {
      storePage.canvasWidth = 380;
      storePage.canvasHeight = 700;
    } else {
      storePage.canvasWidth = 1280;
      storePage.canvasHeight = 900;
    }
  });

  const setCanvasSize = action((width: number, height: number) => {
    storePage.canvasWidth = width;
    storePage.canvasHeight = height;
  });

  const setCodeFramework = action((framework: CodeFramework) => {
    storePage.codeFramework = framework;
  });

  const setPageCategory = action((category: PageCategory) => {
    storePage.pageCategory = category;
    syncPageCategoryDefaults(category);
  });

  const setLayoutMode = action((mode: PageLayoutMode) => {
    storePage.layoutMode = normalizePageLayoutMode(mode);
  });

  const setEditorMode = action((mode: EditorMode) => {
    storePage.editorMode = mode;
  });

  /**
   * 设置栅格布局下画布虚线显隐（仅编辑器偏好，本地持久化）。
   * @param visible - 是否显示虚线
   * @param pageId - 页面 id
   */
  const setGridDashedLinesVisible = action(
    (visible: boolean, pageId?: number) => {
      storePage.showGridDashedLines = visible;

      if (pageId && Number.isFinite(pageId) && pageId > 0) {
        localStorage.setItem(getGridDashedLinesStorageKey(pageId), String(visible));
      }
    },
  );

  const hydrateGridDashedLinesVisible = action((pageId?: number | null) => {
    if (!pageId || !Number.isFinite(pageId) || pageId <= 0) {
      storePage.showGridDashedLines = true;
      return;
    }

    const savedValue = localStorage.getItem(getGridDashedLinesStorageKey(pageId));
    storePage.showGridDashedLines = savedValue ? savedValue === "true" : true;
  });

  const setWorkspace = action((workspace: PageWorkspaceResponse | null) => {
    storePage.workspace = workspace;
  });

  const setWorkspaceExplorer = action(
    (workspaceExplorer: PageWorkspaceExplorerResponse | null) => {
      storePage.workspaceExplorer = workspaceExplorer;
    },
  );

  const setWorkspaceSession = action(
    (workspaceSession: PageWorkspaceSessionResponse | null) => {
      storePage.workspaceSession = workspaceSession;
    },
  );

  const setWorkspaceRuntime = action(
    (workspaceRuntime: PageWorkspaceRuntimeResponse | null) => {
      storePage.workspaceRuntime = workspaceRuntime;
    },
  );

  const setWorkspaceIDEConfig = action(
    (workspaceIDEConfig: PageWorkspaceIDEConfigResponse | null) => {
      storePage.workspaceIDEConfig = workspaceIDEConfig;
    },
  );

  const setActiveWorkspaceFilePath = action((path: string | null) => {
    storePage.activeWorkspaceFilePath = path;
  });

  const upsertWorkspaceFile = action((file: PageWorkspaceFileResponse) => {
    const currentFileState = storePage.workspaceFiles[file.path];

    storePage.workspaceFiles[file.path] = {
      file,
      isDirty: currentFileState?.isDirty ?? false,
      isSaving: false,
    };

    if (!storePage.workspaceOpenFilePaths.includes(file.path)) {
      storePage.workspaceOpenFilePaths.push(file.path);
    }

    storePage.activeWorkspaceFilePath = file.path;
  });

  const updateWorkspaceFileContent = action((path: string, content: string) => {
    const currentFileState = storePage.workspaceFiles[path];
    if (!currentFileState) return;

    currentFileState.file = {
      ...currentFileState.file,
      content,
    };
    currentFileState.isDirty = true;
  });

  const setWorkspaceFileSaving = action((path: string, isSaving: boolean) => {
    const currentFileState = storePage.workspaceFiles[path];
    if (!currentFileState) return;

    currentFileState.isSaving = isSaving;
  });

  const markWorkspaceFileSaved = action((file: PageWorkspaceFileResponse) => {
    storePage.workspaceFiles[file.path] = {
      file,
      isDirty: false,
      isSaving: false,
    };

    if (!storePage.workspaceOpenFilePaths.includes(file.path)) {
      storePage.workspaceOpenFilePaths.push(file.path);
    }

    storePage.activeWorkspaceFilePath = file.path;
  });

  const resetWorkspaceFiles = action(() => {
    storePage.workspaceExplorer = null;
    storePage.activeWorkspaceFilePath = null;
    storePage.workspaceOpenFilePaths = [];
    storePage.workspaceFiles = {};
  });

  /**
   * 批量同步页面字段到 store。
   * @param page - 需要合并的页面字段
   */
  const syncPageFields = (page: Partial<TStorePage>) => {
    Object.assign(storePage, page);
  };

  /**
   * 归一化需要兼容旧数据的页面字段。
   * @param page - 待归一化的页面字段
   */
  const applyNormalizations = (page: Partial<TStorePage>) => {
    if (Object.prototype.hasOwnProperty.call(page, "layoutMode")) {
      storePage.layoutMode = normalizePageLayoutMode(page.layoutMode);
    }

    if (Object.prototype.hasOwnProperty.call(page, "shellLayout")) {
      storePage.shellLayout = normalizePageShellLayout(
        (page as { shellLayout?: unknown }).shellLayout,
      );
    }
  };

  /**
   * 补齐后台页面的默认画布配置。
   * @param page - 当前更新的页面字段
   */
  const applyAdminDefaults = (page: Partial<TStorePage>) => {
    if (page.pageCategory !== "admin") {
      return;
    }

    storePage.deviceType = page.deviceType ?? "pc";
    storePage.canvasWidth = page.canvasWidth ?? 1280;
    storePage.canvasHeight = page.canvasHeight ?? 900;
  };

  /**
   * 处理页面更新后的联动副作用。
   * @param page - 当前更新的页面字段
   */
  const applyEffects = (page: Partial<TStorePage>) => {
    if (Object.prototype.hasOwnProperty.call(page, "chartTheme")) {
      setDefaultEChartsTheme(storePage.chartTheme || undefined);
    }
  };

  /**
   * 更新页面信息
   * @param page - 部分页面信息
   */
  const updatePage = action((page: Partial<TStorePage>) => {
    if (!page) return;

    syncPageFields(page);
    applyNormalizations(page);
    applyAdminDefaults(page);
    applyEffects(page);
  });

  return {
    updatePage,
    setPageTitle,
    setPageCategory,
    setLayoutMode,
    setDeviceType,
    setCanvasSize,
    setCodeFramework,
    setEditorMode,
    setGridDashedLinesVisible,
    hydrateGridDashedLinesVisible,
    setWorkspace,
    setWorkspaceExplorer,
    setWorkspaceSession,
    setWorkspaceRuntime,
    setWorkspaceIDEConfig,
    setActiveWorkspaceFilePath,
    upsertWorkspaceFile,
    updateWorkspaceFileContent,
    setWorkspaceFileSaving,
    markWorkspaceFileSaved,
    resetWorkspaceFiles,
    store: storePage,
  };
}
