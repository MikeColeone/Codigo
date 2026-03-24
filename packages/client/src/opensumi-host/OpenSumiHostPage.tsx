import { useEffect, useMemo, useState } from "react";
import {
  createOpenSumiHostAdapter,
  type OpenSumiHostBridgeState,
} from "@codigo/editor-sandbox";
import type { WorkspaceExplorerNode } from "@codigo/schema";
import {
  getPageWorkspaceExplorer,
  getPageWorkspaceFile,
} from "@/modules/editor/api/low-code";

function getSearchParams() {
  return new URLSearchParams(window.location.search);
}

function getReferrerOrigin() {
  if (!document.referrer) {
    return "*";
  }

  try {
    return new URL(document.referrer).origin;
  } catch {
    return "*";
  }
}

function flattenFirstFile(
  nodes: WorkspaceExplorerNode[],
  preferredPaths: string[],
): string | null {
  const allFilePaths: string[] = [];

  const walk = (items: WorkspaceExplorerNode[]) => {
    for (const item of items) {
      if (item.type === "file") {
        allFilePaths.push(item.path);
        continue;
      }
      walk(item.children ?? []);
    }
  };

  walk(nodes);

  for (const preferredPath of preferredPaths) {
    if (allFilePaths.includes(preferredPath)) {
      return preferredPath;
    }
  }

  return allFilePaths[0] ?? null;
}

function FileTree({
  nodes,
  selectedPath,
  onSelect,
}: {
  nodes: WorkspaceExplorerNode[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
}) {
  return (
    <div className="space-y-1">
      {nodes.map((node) => {
        if (node.type === "directory") {
          return (
            <details
              key={node.path}
              open
              className="rounded-xl bg-slate-900/60 px-2 py-1"
            >
              <summary className="cursor-pointer list-none py-1 text-sm font-medium text-slate-300">
                {node.name}
              </summary>
              <div className="ml-3 border-l border-slate-800 pl-3">
                <FileTree
                  nodes={node.children ?? []}
                  selectedPath={selectedPath}
                  onSelect={onSelect}
                />
              </div>
            </details>
          );
        }

        const isActive = node.path === selectedPath;
        return (
          <button
            key={node.path}
            className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-sm transition ${
              isActive
                ? "bg-emerald-500/15 text-emerald-300"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
            onClick={() => onSelect(node.path)}
          >
            {node.name}
          </button>
        );
      })}
    </div>
  );
}

export default function OpenSumiHostPage() {
  const initialParams = useMemo(() => getSearchParams(), []);
  const [bridgeState, setBridgeState] =
    useState<OpenSumiHostBridgeState | null>(null);
  const [lastMessageAt, setLastMessageAt] = useState<string | null>(null);
  const [heartbeatAt, setHeartbeatAt] = useState<string | null>(null);
  const [explorerTree, setExplorerTree] = useState<WorkspaceExplorerNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("plaintext");
  const [selectedUpdatedAt, setSelectedUpdatedAt] = useState<string | null>(
    null,
  );
  const [explorerLoading, setExplorerLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [explorerError, setExplorerError] = useState<string | null>(null);

  const channelId =
    initialParams.get("channelId") ?? "codigo-opensumi-fallback";
  const previewUrlFromQuery = initialParams.get("previewUrl");
  const sessionIdFromQuery = initialParams.get("sessionId") ?? "host-session";
  const workspaceName =
    initialParams.get("workspaceName") ?? "Codigo Workspace";
  const workspacePath =
    initialParams.get("workspacePath") ?? "packages/template";
  const pageId = Number(
    initialParams.get("pageId") ?? bridgeState?.workspace.pageId ?? 0,
  );
  const terminalCommand =
    initialParams.get("terminalCommand") ?? "pnpm dev -- --host 0.0.0.0";
  const referrerOrigin = getReferrerOrigin();

  useEffect(() => {
    const adapter = createOpenSumiHostAdapter({
      channelId,
      targetOrigin: referrerOrigin,
      targetWindow: window.parent,
      onStateChange: (state) => {
        setBridgeState(state);
        setLastMessageAt(new Date().toISOString());

        adapter.publishReady(state.session?.sessionId ?? sessionIdFromQuery);

        const previewUrl =
          state.config?.previewUrl ??
          state.session?.previewUrl ??
          previewUrlFromQuery;

        if (previewUrl) {
          adapter.publishPreviewChange(previewUrl, state.config?.runtimeId);
        }
      },
    });

    adapter.publishReady(sessionIdFromQuery);
    if (previewUrlFromQuery) {
      adapter.publishPreviewChange(
        previewUrlFromQuery,
        initialParams.get("runtimeId") ?? undefined,
      );
    }

    const heartbeatTimer = window.setInterval(() => {
      adapter.publishHeartbeat();
      setHeartbeatAt(new Date().toISOString());
    }, 5000);

    return () => {
      window.clearInterval(heartbeatTimer);
      adapter.dispose();
    };
  }, [
    channelId,
    initialParams,
    previewUrlFromQuery,
    referrerOrigin,
    sessionIdFromQuery,
  ]);

  useEffect(() => {
    if (!pageId) {
      return;
    }

    let cancelled = false;

    const loadExplorer = async () => {
      try {
        setExplorerLoading(true);
        setExplorerError(null);
        const response = await getPageWorkspaceExplorer(pageId);
        if (cancelled) {
          return;
        }

        const tree = response.data?.tree ?? [];
        setExplorerTree(tree);

        const nextPath = flattenFirstFile(tree, [
          bridgeState?.workspace.entryFilePath?.replace(
            /^.*packages\/workspace-[^/]+\//,
            "",
          ) ?? "src/main.tsx",
          bridgeState?.workspace.schemaFilePath?.replace(
            /^.*packages\/workspace-[^/]+\//,
            "",
          ) ?? "src/schema.json",
          "src/main.tsx",
          "src/App.tsx",
          "src/schema.json",
        ]);

        if (nextPath) {
          setSelectedPath((current) => current ?? nextPath);
        }
      } catch (error) {
        if (!cancelled) {
          setExplorerError((error as Error).message || "加载工作区文件失败");
        }
      } finally {
        if (!cancelled) {
          setExplorerLoading(false);
        }
      }
    };

    void loadExplorer();

    return () => {
      cancelled = true;
    };
  }, [
    bridgeState?.workspace.entryFilePath,
    bridgeState?.workspace.schemaFilePath,
    pageId,
  ]);

  useEffect(() => {
    if (!pageId || !selectedPath) {
      return;
    }

    let cancelled = false;

    const loadFile = async () => {
      try {
        setFileLoading(true);
        const response = await getPageWorkspaceFile(pageId, selectedPath);
        if (cancelled) {
          return;
        }

        setSelectedContent(response.data?.content ?? "");
        setSelectedLanguage(response.data?.language ?? "plaintext");
        setSelectedUpdatedAt(response.data?.updatedAt ?? null);
      } catch (error) {
        if (!cancelled) {
          setSelectedContent((error as Error).message || "读取文件失败");
          setSelectedLanguage("plaintext");
          setSelectedUpdatedAt(null);
        }
      } finally {
        if (!cancelled) {
          setFileLoading(false);
        }
      }
    };

    void loadFile();

    return () => {
      cancelled = true;
    };
  }, [pageId, selectedPath]);

  const effectivePreviewUrl =
    bridgeState?.config?.previewUrl ??
    bridgeState?.session?.previewUrl ??
    previewUrlFromQuery;

  return (
    <main className="grid min-h-screen grid-cols-[300px_minmax(0,1fr)_420px] bg-slate-950 text-slate-100">
      <aside className="flex min-w-0 flex-col border-r border-slate-800 bg-slate-950/95 p-5">
        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-400">
            Codigo Host
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            OpenSumi Host 页面
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            当前 host 已具备握手、文件浏览、文件内容查看和预览回传能力，可作为
            真实 OpenSumi Browser 容器的落点。
          </p>
        </div>

        <div className="space-y-4 overflow-y-auto text-sm">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
              握手状态
            </div>
            <div className="mt-3 space-y-2">
              <p>
                <span className="text-slate-500">Channel</span>
                <span className="ml-2 break-all text-slate-100">
                  {channelId}
                </span>
              </p>
              <p>
                <span className="text-slate-500">来源</span>
                <span className="ml-2 break-all text-slate-100">
                  {referrerOrigin}
                </span>
              </p>
              <p>
                <span className="text-slate-500">最近同步</span>
                <span className="ml-2 text-slate-100">
                  {lastMessageAt ?? "等待编辑器发起同步"}
                </span>
              </p>
              <p>
                <span className="text-slate-500">Heartbeat</span>
                <span className="ml-2 text-slate-100">
                  {heartbeatAt ?? "尚未发送"}
                </span>
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
              工作区
            </div>
            <div className="mt-3 space-y-2">
              <p className="break-all text-slate-100">
                {bridgeState?.workspace.workspaceName ?? workspaceName}
              </p>
              <p className="break-all text-slate-400">
                {bridgeState?.workspace.workspaceRelativePath ?? workspacePath}
              </p>
              <p className="break-all text-slate-400">
                {bridgeState?.config?.serverUrl ?? "未配置 OpenSumi 服务地址"}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
              终端
            </div>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all rounded-xl bg-slate-950 p-3 text-xs text-emerald-300">
              {bridgeState?.session?.terminalCommand ?? terminalCommand}
            </pre>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
              文件树
            </div>
            <div className="mt-3 max-h-[420px] overflow-y-auto">
              {explorerLoading ? (
                <div className="text-sm text-slate-400">
                  正在加载工作区文件…
                </div>
              ) : explorerError ? (
                <div className="text-sm text-rose-300">{explorerError}</div>
              ) : explorerTree.length > 0 ? (
                <FileTree
                  nodes={explorerTree}
                  selectedPath={selectedPath}
                  onSelect={setSelectedPath}
                />
              ) : (
                <div className="text-sm text-slate-400">
                  当前没有可展示的文件
                </div>
              )}
            </div>
          </section>
        </div>
      </aside>

      <section className="flex min-w-0 flex-col border-r border-slate-800 bg-slate-900/50">
        <div className="border-b border-slate-800 px-5 py-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
            IDE Shell
          </div>
          <div className="mt-2 text-lg font-medium text-white">
            Host 文件浏览与源码查看
          </div>
          <div className="mt-1 text-sm text-slate-400">
            {selectedPath ?? "请选择左侧文件"}
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-5">
          <div className="flex h-full min-h-[480px] flex-col rounded-3xl border border-slate-800 bg-slate-950/70">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Source View
                </div>
                <div className="mt-1 text-sm text-slate-300">
                  {selectedLanguage}
                </div>
              </div>
              <div className="text-xs text-slate-500">
                {selectedUpdatedAt ??
                  (fileLoading ? "正在读取..." : "未选择文件")}
              </div>
            </div>

            <div className="flex-1 overflow-auto px-5 py-4">
              <pre className="whitespace-pre-wrap break-all font-mono text-xs leading-6 text-slate-200">
                {fileLoading
                  ? "正在读取文件内容..."
                  : selectedContent || "请选择文件后查看内容"}
              </pre>
            </div>

            <div className="grid gap-4 border-t border-slate-800 p-5 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Session
                </div>
                <pre className="mt-3 overflow-auto whitespace-pre-wrap break-all text-xs leading-6 text-slate-300">
                  {JSON.stringify(bridgeState?.session ?? null, null, 2)}
                </pre>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Config
                </div>
                <pre className="mt-3 overflow-auto whitespace-pre-wrap break-all text-xs leading-6 text-slate-300">
                  {JSON.stringify(bridgeState?.config ?? null, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="flex min-w-0 flex-col bg-slate-950">
        <div className="border-b border-slate-800 px-5 py-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Preview
          </div>
          <div className="mt-2 break-all text-sm text-slate-200">
            {effectivePreviewUrl ?? "等待预览地址"}
          </div>
        </div>

        <div className="flex-1 p-5">
          {effectivePreviewUrl ? (
            <iframe
              title="codigo-host-preview"
              src={effectivePreviewUrl}
              className="h-full min-h-[480px] w-full rounded-3xl border border-slate-800 bg-white"
            />
          ) : (
            <div className="flex h-full min-h-[480px] items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-900 text-sm text-slate-400">
              等待编辑器或运行时提供预览地址
            </div>
          )}
        </div>
      </aside>
    </main>
  );
}
