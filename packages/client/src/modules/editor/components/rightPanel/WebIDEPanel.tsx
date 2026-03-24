import { useEffect } from "react";
import { useRequest } from "ahooks";
import { observer } from "mobx-react-lite";
import { useSearchParams } from "react-router-dom";
import {
  Alert,
  Button,
  Descriptions,
  Empty,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  getPageWorkspace,
  getPageWorkspaceIDEConfig,
  getPageWorkspaceRuntime,
  getPageWorkspaceSession,
  startPageWorkspaceIDEConfig,
  startPageWorkspaceSession,
  startPageWorkspaceRuntime,
  stopPageWorkspaceRuntime,
  syncPageWorkspace,
} from "../../api/low-code";
import { useStorePage } from "@/shared/hooks";

const { Paragraph, Text } = Typography;

export default observer(function WebIDEPanel() {
  const [searchParams] = useSearchParams();
  const pageId = Number(searchParams.get("id"));
  const {
    store: pageStore,
    setEditorMode,
    setWorkspaceIDEConfig,
    setWorkspace,
    setWorkspaceRuntime,
    setWorkspaceSession,
  } = useStorePage();

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
      return response.data ?? null;
    },
    {
      manual: true,
      onSuccess: (workspace) => {
        setWorkspace(workspace);
        setWorkspaceIDEConfig(null);
        setWorkspaceRuntime(null);
        setWorkspaceSession(null);
        setEditorMode("webide");
      },
    },
  );

  const { loading: sessionLoading, run: fetchSession } = useRequest(
    async () => {
      if (!pageId) return null;
      const response = await getPageWorkspaceSession(pageId);
      return response.data ?? null;
    },
    {
      manual: true,
      onSuccess: (session) => {
        setWorkspaceSession(session);
      },
    },
  );

  const { loading: startSessionLoading, run: startSession } = useRequest(
    async () => {
      if (!pageId) return null;
      const response = await startPageWorkspaceSession(pageId);
      return response.data ?? null;
    },
    {
      manual: true,
      onSuccess: (session) => {
        setWorkspaceSession(session);
        setEditorMode("webide");
      },
    },
  );

  const { loading: runtimeLoading, run: fetchRuntime } = useRequest(
    async () => {
      if (!pageId) return null;
      const response = await getPageWorkspaceRuntime(pageId);
      return response.data ?? null;
    },
    {
      manual: true,
      onSuccess: (runtime) => {
        setWorkspaceRuntime(runtime);
      },
    },
  );

  const { loading: startRuntimeLoading, run: startRuntime } = useRequest(
    async () => {
      if (!pageId) return null;
      const response = await startPageWorkspaceRuntime(pageId);
      return response.data ?? null;
    },
    {
      manual: true,
      onSuccess: (runtime) => {
        setWorkspaceRuntime(runtime);
      },
    },
  );

  const { loading: stopRuntimeLoading, run: stopRuntime } = useRequest(
    async () => {
      if (!pageId) return null;
      const response = await stopPageWorkspaceRuntime(pageId);
      return response.data ?? null;
    },
    {
      manual: true,
      onSuccess: (runtime) => {
        setWorkspaceRuntime(runtime);
      },
    },
  );

  const { loading: ideConfigLoading, run: fetchIDEConfig } = useRequest(
    async () => {
      if (!pageId) return null;
      const response = await getPageWorkspaceIDEConfig(pageId);
      return response.data ?? null;
    },
    {
      manual: true,
      onSuccess: (config) => {
        setWorkspaceIDEConfig(config);
      },
    },
  );

  const { loading: startIDEConfigLoading, run: startIDEConfig } = useRequest(
    async () => {
      if (!pageId) return null;
      const response = await startPageWorkspaceIDEConfig(pageId);
      return response.data ?? null;
    },
    {
      manual: true,
      onSuccess: (config) => {
        setWorkspaceIDEConfig(config);
        setEditorMode("webide");
      },
    },
  );

  useEffect(() => {
    if (!pageId) return;
    void fetchWorkspace();
    void fetchSession();
    void fetchRuntime();
    void fetchIDEConfig();
  }, [fetchIDEConfig, fetchRuntime, fetchSession, fetchWorkspace, pageId]);

  const workspace = pageStore.workspace;
  const workspaceIDEConfig = pageStore.workspaceIDEConfig;
  const workspaceRuntime = pageStore.workspaceRuntime;
  const workspaceSession = pageStore.workspaceSession;

  useEffect(() => {
    if (
      workspaceRuntime?.status !== "starting" &&
      workspaceRuntime?.status !== "running"
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      void fetchRuntime();
    }, 2000);

    return () => {
      window.clearInterval(timer);
    };
  }, [fetchRuntime, workspaceRuntime?.status]);

  return (
    <div className="space-y-4">
      <Alert
        type="info"
        showIcon
        message="OpenSumi WebIDE 工作区"
        description="这里负责连接真实源码工作区。当前阶段已打通页面工作区元数据、同步接口和编辑器挂载骨架。"
      />

      <Space.Compact block>
        <Button loading={workspaceLoading} onClick={() => fetchWorkspace()}>
          刷新状态
        </Button>
        <Button loading={sessionLoading} onClick={() => fetchSession()}>
          刷新会话
        </Button>
        <Button loading={runtimeLoading} onClick={() => fetchRuntime()}>
          刷新运行
        </Button>
        <Button loading={ideConfigLoading} onClick={() => fetchIDEConfig()}>
          刷新 IDE
        </Button>
        <Button
          type="primary"
          loading={syncLoading}
          onClick={() => syncWorkspace()}
        >
          同步工作区
        </Button>
        <Button
          type="primary"
          ghost
          loading={startSessionLoading}
          onClick={() => startSession()}
        >
          启动 IDE
        </Button>
        <Button
          type="primary"
          ghost
          loading={startIDEConfigLoading}
          onClick={() => startIDEConfig()}
        >
          生成配置
        </Button>
      </Space.Compact>

      {workspace ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag color={workspace.exists ? "green" : "default"}>
              {workspace.exists ? "已生成" : "未生成"}
            </Tag>
            <Tag color="blue">{workspace.packageManager}</Tag>
            <Text className="text-xs text-slate-500">
              共 {workspace.componentCount} 个组件
            </Text>
            {workspaceSession ? (
              <Tag
                color={
                  workspaceSession.status === "ready"
                    ? "green"
                    : workspaceSession.status === "starting"
                      ? "gold"
                      : workspaceSession.status === "workspace_missing"
                        ? "default"
                        : "blue"
                }
              >
                会话：{workspaceSession.status}
              </Tag>
            ) : null}
            {workspaceRuntime ? (
              <Tag
                color={
                  workspaceRuntime.status === "running"
                    ? "green"
                    : workspaceRuntime.status === "starting"
                      ? "gold"
                      : workspaceRuntime.status === "error"
                        ? "red"
                        : "default"
                }
              >
                运行：{workspaceRuntime.status}
              </Tag>
            ) : null}
            {workspaceIDEConfig ? <Tag color="purple">配置：已生成</Tag> : null}
          </div>

          <Descriptions
            column={1}
            size="small"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
            items={[
              {
                key: "workspaceName",
                label: "工作区包名",
                children: workspace.workspaceName,
              },
              {
                key: "workspacePath",
                label: "工作区路径",
                children: workspace.workspaceRelativePath,
              },
              {
                key: "schemaFile",
                label: "Schema 文件",
                children: workspace.schemaFilePath,
              },
              {
                key: "entryFile",
                label: "入口文件",
                children: workspace.entryFilePath,
              },
            ]}
          />

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <Text className="text-xs uppercase tracking-[0.18em] text-slate-500">
              终端命令
            </Text>
            <Paragraph copyable className="!mb-2 !mt-2 font-mono text-xs">
              {workspace.installCommand}
            </Paragraph>
            <Paragraph copyable className="!mb-0 font-mono text-xs">
              {workspace.devCommand}
            </Paragraph>
          </div>

          {workspaceSession ? (
            <Descriptions
              column={1}
              size="small"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
              items={[
                {
                  key: "sessionId",
                  label: "会话 ID",
                  children: workspaceSession.sessionId,
                },
                {
                  key: "terminalTitle",
                  label: "终端标题",
                  children: workspaceSession.terminalTitle,
                },
                {
                  key: "terminalCwd",
                  label: "终端目录",
                  children: workspaceSession.terminalCwd,
                },
                {
                  key: "ideUrl",
                  label: "IDE 地址",
                  children: workspaceSession.ideUrl ?? "尚未启动",
                },
                {
                  key: "previewUrl",
                  label: "预览地址",
                  children:
                    workspaceSession.previewUrl ?? "等待启动 dev server",
                },
              ]}
            />
          ) : null}

          {workspaceRuntime ? (
            <Descriptions
              column={1}
              size="small"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
              items={[
                {
                  key: "runtimeId",
                  label: "运行时 ID",
                  children: workspaceRuntime.runtimeId,
                },
                {
                  key: "runtimeCommand",
                  label: "运行命令",
                  children: workspaceRuntime.command,
                },
                {
                  key: "runtimePreview",
                  label: "预览地址",
                  children: workspaceRuntime.previewUrl ?? "尚未启动",
                },
              ]}
            />
          ) : null}

          {workspaceIDEConfig ? (
            <Descriptions
              column={1}
              size="small"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
              items={[
                {
                  key: "provider",
                  label: "IDE 提供方",
                  children: workspaceIDEConfig.provider,
                },
                {
                  key: "browserUrl",
                  label: "浏览器入口",
                  children: workspaceIDEConfig.browserUrl,
                },
                {
                  key: "serverUrl",
                  label: "服务端地址",
                  children: workspaceIDEConfig.serverUrl,
                },
                {
                  key: "workspacePath",
                  label: "工作区映射",
                  children: workspaceIDEConfig.workspacePath,
                },
              ]}
            />
          ) : null}

          <Space.Compact block>
            <Button
              type="primary"
              loading={startRuntimeLoading}
              onClick={() => startRuntime()}
              disabled={!workspace.exists}
            >
              启动预览
            </Button>
            <Button
              loading={stopRuntimeLoading}
              onClick={() => stopRuntime()}
              disabled={
                !workspaceRuntime || workspaceRuntime.status === "stopped"
              }
            >
              停止预览
            </Button>
          </Space.Compact>

          {workspaceRuntime?.lastOutput ? (
            <div className="rounded-xl border border-slate-200 bg-slate-950 px-4 py-3">
              <Text className="text-xs uppercase tracking-[0.18em] !text-slate-400">
                运行输出
              </Text>
              <Paragraph className="!mb-0 !mt-2 whitespace-pre-wrap break-all font-mono text-xs !text-slate-200">
                {workspaceRuntime.lastOutput}
              </Paragraph>
            </div>
          ) : null}

          <Button
            block
            type="default"
            onClick={() => setEditorMode("webide")}
            disabled={
              !workspace.exists ||
              workspaceSession?.status !== "ready" ||
              workspaceRuntime?.status !== "running" ||
              !workspaceIDEConfig
            }
          >
            在主区域打开 WebIDE
          </Button>
        </div>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂未获取到工作区信息"
        />
      )}
    </div>
  );
});
