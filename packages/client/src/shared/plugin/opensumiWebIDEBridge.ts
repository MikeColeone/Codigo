import type {
  OpenSumiWebIDEBridge,
  OpenSumiWebIDEBridgeConfig,
  OpenSumiWebIDEBridgeHandle,
  OpenSumiHostBridgeState,
  OpenSumiHostClientMessage,
  OpenSumiHostServerMessage,
  OpenSumiWebIDEBridgeSession,
  OpenSumiWebIDEBridgeWorkspace,
} from "@codigo/editor-sandbox";
import {
  createOpenSumiHostMessage as createHostMessage,
  isOpenSumiHostMessage as isHostMessage,
} from "@codigo/editor-sandbox";

function renderPlaceholder(
  container: HTMLElement,
  workspace: OpenSumiWebIDEBridgeWorkspace,
  session: OpenSumiWebIDEBridgeSession | null,
  config: OpenSumiWebIDEBridgeConfig | null,
) {
  container.innerHTML = `
    <div style="height:100%;display:flex;align-items:center;justify-content:center;background:#f8fafc;padding:24px;box-sizing:border-box;">
      <div style="width:min(760px,100%);background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;font-family:Inter,system-ui,sans-serif;box-shadow:0 10px 30px rgba(15,23,42,0.06);">
        <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#64748b;margin-bottom:8px;">Codigo WebIDE Bridge</div>
        <div style="font-size:24px;font-weight:600;color:#0f172a;margin-bottom:8px;">等待 IDE 地址</div>
        <div style="font-size:14px;line-height:1.7;color:#475569;margin-bottom:16px;">
          当前已经完成 WebIDE 浏览器桥注入，但后端还没有返回可用的 IDE 地址。请先启动会话。
        </div>
        <div style="display:grid;grid-template-columns:140px 1fr;gap:10px 16px;font-size:13px;color:#0f172a;">
          <div style="color:#64748b;">工作区</div>
          <div>${workspace.workspaceName}</div>
          <div style="color:#64748b;">路径</div>
          <div>${workspace.workspaceRelativePath}</div>
          <div style="color:#64748b;">状态</div>
          <div>${session?.status ?? "stopped"}</div>
          <div style="color:#64748b;">服务端地址</div>
          <div>${config?.serverUrl ?? "未配置"}</div>
        </div>
      </div>
    </div>
  `;
}

function renderIFrame(
  container: HTMLElement,
  workspaceId: string,
  browserUrl: string,
) {
  const currentIFrame = container.querySelector("iframe");
  if (
    currentIFrame instanceof HTMLIFrameElement &&
    currentIFrame.src === browserUrl
  ) {
    return currentIFrame;
  }

  container.innerHTML = "";
  const iframe = document.createElement("iframe");
  iframe.src = browserUrl;
  iframe.title = `codigo-webide-${workspaceId}`;
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "0";
  iframe.setAttribute("allow", "clipboard-read; clipboard-write");
  container.appendChild(iframe);
  return iframe;
}

function renderState(
  container: HTMLElement,
  workspace: OpenSumiWebIDEBridgeWorkspace,
  session: OpenSumiWebIDEBridgeSession | null,
  config: OpenSumiWebIDEBridgeConfig | null,
) {
  if (config?.browserUrl) {
    return renderIFrame(container, workspace.workspaceId, config.browserUrl);
  }
  if (session?.ideUrl) {
    return renderIFrame(container, workspace.workspaceId, session.ideUrl);
  }
  renderPlaceholder(container, workspace, session, config);
  return null;
}

function postBridgeState(
  iframe: HTMLIFrameElement | null,
  state: OpenSumiHostBridgeState,
) {
  if (!iframe?.contentWindow || !state.config) {
    return;
  }

  const messageType: OpenSumiHostClientMessage["type"] =
    state.session?.status === "ready" ? "client:init" : "client:state-sync";
  const message = createHostMessage(state.config.channelId, messageType, state);
  iframe.contentWindow.postMessage(message, state.config.hostOrigin);
}

const defaultOpenSumiWebIDEBridge: OpenSumiWebIDEBridge = {
  mount(options): OpenSumiWebIDEBridgeHandle {
    let currentWorkspace = options.workspace;
    let currentSession = options.session;
    let currentConfig = options.config;
    let currentIFrame = renderState(
      options.container,
      currentWorkspace,
      currentSession,
      currentConfig,
    );

    const syncStateToHost = () => {
      postBridgeState(currentIFrame, {
        workspace: currentWorkspace,
        session: currentSession,
        config: currentConfig,
      });
    };

    const handleIFrameLoad = () => {
      syncStateToHost();
    };

    const handleWindowMessage = (
      event: MessageEvent<OpenSumiHostServerMessage>,
    ) => {
      if (!currentConfig || event.origin !== currentConfig.hostOrigin) {
        return;
      }

      if (!isHostMessage(event.data)) {
        return;
      }

      if (event.data.channelId !== currentConfig.channelId) {
        return;
      }

      options.onMessage?.(event.data);

      if (event.data.type === "host:ready") {
        syncStateToHost();
      }
    };

    currentIFrame?.addEventListener("load", handleIFrameLoad);
    window.addEventListener("message", handleWindowMessage);

    return {
      dispose() {
        currentIFrame?.removeEventListener("load", handleIFrameLoad);
        window.removeEventListener("message", handleWindowMessage);
        options.container.innerHTML = "";
      },
      updateState(nextOptions) {
        currentWorkspace = nextOptions.workspace;
        currentSession = nextOptions.session;
        currentConfig = nextOptions.config;
        currentIFrame?.removeEventListener("load", handleIFrameLoad);
        currentIFrame = renderState(
          options.container,
          currentWorkspace,
          currentSession,
          currentConfig,
        );
        currentIFrame?.addEventListener("load", handleIFrameLoad);
        syncStateToHost();
      },
    };
  },
};

if (!globalThis.__CODIGO_OPENSUMI_WEBIDE_BRIDGE__) {
  globalThis.__CODIGO_OPENSUMI_WEBIDE_BRIDGE__ = defaultOpenSumiWebIDEBridge;
}
