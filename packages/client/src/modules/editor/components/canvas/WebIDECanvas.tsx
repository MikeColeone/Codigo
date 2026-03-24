import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Descriptions, Empty, Typography } from "antd";
import { observer } from "mobx-react-lite";
import {
  resolveOpenSumiWebIDEBridge,
  type OpenSumiWebIDEBridgeHandle,
} from "@codigo/editor-sandbox";
import { useStorePage, useStorePermission } from "@/shared/hooks";

const { Paragraph, Text } = Typography;

export const WebIDECanvas = observer(() => {
  const {
    store: pageStore,
    setEditorMode,
    setWorkspaceIDEConfig,
    setWorkspaceRuntime,
  } = useStorePage();
  const { can } = useStorePermission();
  const bridge = useMemo(() => resolveOpenSumiWebIDEBridge(), []);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<OpenSumiWebIDEBridgeHandle | null>(null);
  const [useFallback, setUseFallback] = useState(!bridge);
  const workspace = pageStore.workspace;
  const workspaceIDEConfig = pageStore.workspaceIDEConfig;
  const workspaceRuntime = pageStore.workspaceRuntime;
  const workspaceSession = pageStore.workspaceSession;

  useEffect(() => {
    if (!bridge || !containerRef.current || !workspace?.exists) return;

    const handle = bridge.mount({
      container: containerRef.current,
      workspace,
      session: workspaceSession,
      config: workspaceIDEConfig,
      readOnly: !can("edit_structure"),
      onMessage: (message) => {
        if (message.type === "host:preview-change") {
          setWorkspaceRuntime(
            pageStore.workspaceRuntime
              ? {
                  ...pageStore.workspaceRuntime,
                  previewUrl: message.payload.previewUrl,
                  runtimeId:
                    message.payload.runtimeId ??
                    pageStore.workspaceRuntime.runtimeId,
                }
              : null,
          );

          setWorkspaceIDEConfig(
            pageStore.workspaceIDEConfig
              ? {
                  ...pageStore.workspaceIDEConfig,
                  previewUrl: message.payload.previewUrl,
                }
              : null,
          );
        }
      },
    });
    handleRef.current = handle;
    setUseFallback(false);

    return () => {
      handle.dispose();
      handleRef.current = null;
    };
  }, [bridge, can, workspace, workspaceIDEConfig, workspaceSession]);

  useEffect(() => {
    if (!bridge || !handleRef.current || !workspace?.exists) return;
    handleRef.current.updateState({
      workspace,
      session: workspaceSession,
      config: workspaceIDEConfig,
    });
  }, [bridge, workspace, workspaceIDEConfig, workspaceSession]);

  if (!workspace) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <Empty
          description="请先在右侧 WebIDE 面板加载工作区"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  if (!workspace.exists) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Alert
            type="warning"
            showIcon
            message="工作区尚未生成"
            description="请先在右侧点击“同步工作区”，系统会把 packages/template 复制为当前页面的真实源码工作区。"
          />
        </div>
      </div>
    );
  }

  if (!workspaceSession || workspaceSession.status !== "ready") {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Alert
            type="info"
            showIcon
            message="IDE 会话未启动"
            description="请先在右侧 WebIDE 面板启动会话。启动后会得到 IDE 地址、终端目录和预览地址。"
          />
          {workspaceSession ? (
            <Descriptions
              column={1}
              size="small"
              className="mt-4"
              items={[
                {
                  key: "status",
                  label: "会话状态",
                  children: workspaceSession.status,
                },
                {
                  key: "terminalCwd",
                  label: "终端目录",
                  children: workspaceSession.terminalCwd,
                },
                {
                  key: "terminalCommand",
                  label: "推荐命令",
                  children: workspaceSession.terminalCommand,
                },
              ]}
            />
          ) : null}
        </div>
      </div>
    );
  }

  if (!workspaceRuntime || workspaceRuntime.status !== "running") {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Alert
            type="info"
            showIcon
            message="预览运行时未启动"
            description="请先在右侧启动预览。系统会在工作区目录中执行 pnpm dev，并把预览地址映射到这里。"
          />
          <Descriptions
            column={1}
            size="small"
            className="mt-4"
            items={[
              {
                key: "runtimeStatus",
                label: "运行状态",
                children: workspaceRuntime?.status ?? "stopped",
              },
              {
                key: "runtimeCommand",
                label: "运行命令",
                children:
                  workspaceRuntime?.command ??
                  `pnpm --dir ${workspace.workspaceRelativePath} dev`,
              },
              {
                key: "previewUrl",
                label: "预览地址",
                children: workspaceRuntime?.previewUrl ?? "尚未生成",
              },
            ]}
          />
        </div>
      </div>
    );
  }

  if (useFallback) {
    return (
      <div className="h-full overflow-y-auto bg-slate-50 p-6">
        <div className="mx-auto flex h-full max-w-4xl flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Alert
            type="info"
            showIcon
            message="WebIDE 会话已就绪"
            description="当前会话层和桥接协议已打通。如果浏览器侧没有注入更完整的 OpenSumi SDK，就使用默认 iframe 桥接方案加载 IDE 地址。"
          />

          <Descriptions
            column={1}
            size="small"
            items={[
              {
                key: "workspaceName",
                label: "工作区包名",
                children: workspace.workspaceName,
              },
              {
                key: "workspaceRoot",
                label: "工作区根目录",
                children: workspace.workspaceRoot,
              },
              {
                key: "schemaFilePath",
                label: "Schema 文件",
                children: workspace.schemaFilePath,
              },
              {
                key: "entryFilePath",
                label: "入口文件",
                children: workspace.entryFilePath,
              },
              {
                key: "ideUrl",
                label: "IDE 地址",
                children:
                  workspaceIDEConfig?.browserUrl ?? workspaceSession.ideUrl,
              },
              {
                key: "serverUrl",
                label: "OpenSumi 服务",
                children: workspaceIDEConfig?.serverUrl ?? "未配置",
              },
              {
                key: "previewUrl",
                label: "预览地址",
                children:
                  workspaceRuntime.previewUrl ??
                  workspaceSession.previewUrl ??
                  "等待 dev server 启动",
              },
            ]}
          />

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Text className="text-xs uppercase tracking-[0.18em] text-slate-500">
              推荐命令
            </Text>
            <Paragraph copyable className="!mb-2 !mt-2 font-mono text-xs">
              cd {workspace.workspaceRelativePath}
            </Paragraph>
            <Paragraph copyable className="!mb-2 font-mono text-xs">
              {workspace.installCommand}
            </Paragraph>
            <Paragraph copyable className="!mb-0 font-mono text-xs">
              {workspaceRuntime.command}
            </Paragraph>
          </div>

          {workspaceIDEConfig ? (
            <Descriptions
              column={1}
              size="small"
              items={[
                {
                  key: "provider",
                  label: "提供方",
                  children: workspaceIDEConfig.provider,
                },
                {
                  key: "mode",
                  label: "接入模式",
                  children: workspaceIDEConfig.mode,
                },
                {
                  key: "workspacePath",
                  label: "IDE 工作区路径",
                  children: workspaceIDEConfig.workspacePath,
                },
              ]}
            />
          ) : null}

          {workspaceRuntime.previewUrl ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
              <div className="border-b border-slate-800 px-4 py-2">
                <Text className="text-xs uppercase tracking-[0.18em] !text-slate-400">
                  运行预览
                </Text>
              </div>
              <iframe
                title="codigo-runtime-preview"
                src={workspaceRuntime.previewUrl}
                className="h-[360px] w-full border-0 bg-white"
              />
            </div>
          ) : null}

          <div className="flex gap-3">
            <Button type="primary" onClick={() => setEditorMode("code")}>
              返回源码沙箱
            </Button>
            <Button onClick={() => setEditorMode("visual")}>
              返回可视化编辑
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full w-full grid-cols-[minmax(0,1fr)_420px] bg-white">
      <div
        ref={containerRef}
        className="h-full min-w-0 border-r border-slate-200 bg-white"
      />
      <div className="flex h-full min-w-0 flex-col bg-slate-950">
        <div className="border-b border-slate-800 px-4 py-3">
          <Text className="text-xs uppercase tracking-[0.18em] !text-slate-400">
            运行预览
          </Text>
          <Paragraph
            copyable
            className="!mb-0 !mt-1 font-mono text-xs !text-slate-200"
          >
            {workspaceRuntime.previewUrl}
          </Paragraph>
        </div>
        <iframe
          title="codigo-runtime-preview"
          src={workspaceRuntime.previewUrl}
          className="h-full w-full border-0 bg-white"
        />
      </div>
    </div>
  );
});
