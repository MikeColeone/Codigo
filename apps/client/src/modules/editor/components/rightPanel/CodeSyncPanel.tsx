import { useEffect, useRef } from "react";
import { useRequest } from "ahooks";
import { observer } from "mobx-react-lite";
import { useSearchParams } from "react-router-dom";
import { Alert, Descriptions, Tag, Typography } from "antd";
import { useStorePage } from "@/shared/hooks";
import {
  getPageWorkspace,
  startPageWorkspaceIDEConfig,
  syncPageWorkspace,
} from "../../api/low-code";

const { Paragraph, Text } = Typography;

export default observer(function CodeSyncPanel() {
  const [searchParams] = useSearchParams();
  const pageId = Number(searchParams.get("id"));
  const {
    store: pageStore,
    resetWorkspaceFiles,
    setEditorMode,
    setWorkspace,
    setWorkspaceIDEConfig,
    setWorkspaceRuntime,
    setWorkspaceSession,
  } = useStorePage();
  const autoEnterRef = useRef<number | null>(null);

  const { loading: workspaceLoading, run: fetchWorkspace } = useRequest(
    async () => {
      if (!pageId) return null;
      const response = await getPageWorkspace(pageId);
      return response.data ?? null;
    },
    {
      manual: true,
      onSuccess: (workspace) => {
        setWorkspace(workspace);
      },
    },
  );

  const { loading: syncLoading, run: syncWorkspace } = useRequest(
    async () => {
      if (!pageId) return null;
      const response = await syncPageWorkspace(pageId);
      const workspace = response.data ?? null;
      if (!workspace) {
        return null;
      }

      const ideConfigResponse = await startPageWorkspaceIDEConfig(pageId);
      return {
        workspace,
        workspaceIDEConfig: ideConfigResponse.data ?? null,
      };
    },
    {
      manual: true,
      onSuccess: (payload) => {
        setWorkspace(payload?.workspace ?? null);
        resetWorkspaceFiles();
        setWorkspaceIDEConfig(payload?.workspaceIDEConfig ?? null);
        setWorkspaceRuntime(null);
        setWorkspaceSession(null);
        setEditorMode("webide");
      },
    },
  );

  const { loading: ideConfigLoading, run: enterIDE } = useRequest(
    async () => {
      if (!pageId) return null;
      const response = await startPageWorkspaceIDEConfig(pageId);
      return response.data ?? null;
    },
    {
      manual: true,
      onSuccess: (workspaceIDEConfig) => {
        setWorkspaceIDEConfig(workspaceIDEConfig);
        setEditorMode("webide");
      },
    },
  );

  useEffect(() => {
    if (!pageId) return;
    void fetchWorkspace();
  }, [fetchWorkspace, pageId]);

  useEffect(() => {
    if (!pageId || autoEnterRef.current === pageId) return;

    autoEnterRef.current = pageId;

    if (
      pageStore.workspaceIDEConfig?.browserUrl &&
      pageStore.workspace?.exists
    ) {
      setEditorMode("webide");
      return;
    }

    if (pageStore.workspace?.exists) {
      void enterIDE();
      return;
    }

    void syncWorkspace();
  }, [
    enterIDE,
    pageId,
    pageStore.workspace?.exists,
    pageStore.workspaceIDEConfig?.browserUrl,
    setEditorMode,
    syncWorkspace,
  ]);

  const workspace = pageStore.workspace;
  const isEntering = syncLoading || ideConfigLoading;

  return (
    <div className="space-y-3">
      {workspace ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag color={workspace.exists ? "green" : "default"}>
              {workspace.exists ? "工作区已生成" : "工作区未生成"}
            </Tag>
            <Tag color="blue">{workspace.pageName}</Tag>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {isEntering
              ? "正在同步源码并启动 OpenSumi iframe..."
              : workspace.exists
                ? "已切换到 OpenSumi iframe，可直接开始编辑源码。"
                : "正在准备工作区，请稍候自动进入 OpenSumi。"}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          {workspaceLoading || isEntering
            ? "正在同步源码并准备 OpenSumi iframe..."
            : "正在读取页面工作区状态..."}
        </div>
      )}
    </div>
  );
});
