export interface OpenSumiEditorBridgeHandle {
  dispose: () => void;
  setValue: (value: string) => void;
}

export interface OpenSumiEditorBridge {
  mount: (options: {
    container: HTMLElement;
    value: string;
    language: string;
    readOnly?: boolean;
    onChange: (value: string) => void;
  }) => OpenSumiEditorBridgeHandle;
}

export interface OpenSumiWebIDEBridgeWorkspace {
  pageId: number;
  pageName: string;
  workspaceId: string;
  workspaceName: string;
  workspaceRoot: string;
  workspaceRelativePath: string;
  schemaFilePath: string;
  entryFilePath: string;
  packageManager: "pnpm";
  installCommand: string;
  devCommand: string;
}

export interface OpenSumiWebIDEBridgeSession {
  pageId: number;
  workspaceId: string;
  sessionId: string;
  status: "workspace_missing" | "stopped" | "starting" | "ready";
  bridgeMode: "iframe";
  ideUrl?: string;
  previewUrl?: string;
  previewPort?: number;
  terminalCwd: string;
  terminalCommand: string;
  terminalTitle: string;
  heartbeatAt: string;
}

export interface OpenSumiWebIDEBridgeConfig {
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

export const OPENSUMI_HOST_CHANNEL = "codigo-opensumi-host";

export type OpenSumiHostClientMessageType = "client:init" | "client:state-sync";
export type OpenSumiHostServerMessageType =
  | "host:ready"
  | "host:preview-change"
  | "host:heartbeat";

export interface OpenSumiHostBridgeState {
  workspace: OpenSumiWebIDEBridgeWorkspace;
  session: OpenSumiWebIDEBridgeSession | null;
  config: OpenSumiWebIDEBridgeConfig | null;
}

export interface OpenSumiHostMessageEnvelope<
  TType extends string = string,
  TPayload = unknown,
> {
  channel: typeof OPENSUMI_HOST_CHANNEL;
  channelId: string;
  type: TType;
  payload: TPayload;
}

export type OpenSumiHostClientMessage = OpenSumiHostMessageEnvelope<
  OpenSumiHostClientMessageType,
  OpenSumiHostBridgeState
>;

export type OpenSumiHostServerMessage =
  | OpenSumiHostMessageEnvelope<"host:ready", { sessionId: string }>
  | OpenSumiHostMessageEnvelope<"host:heartbeat", { at: string }>
  | OpenSumiHostMessageEnvelope<
      "host:preview-change",
      { previewUrl: string; runtimeId?: string }
    >;

export interface OpenSumiHostAdapterOptions {
  channelId: string;
  targetOrigin: string;
  targetWindow: Window;
  onStateChange?: (
    state: OpenSumiHostBridgeState,
    type: OpenSumiHostClientMessageType,
  ) => void;
}

export interface OpenSumiHostAdapter {
  dispose: () => void;
  publishReady: (sessionId: string) => void;
  publishPreviewChange: (previewUrl: string, runtimeId?: string) => void;
  publishHeartbeat: () => void;
}

export function createOpenSumiHostMessage<TType extends string, TPayload>(
  channelId: string,
  type: TType,
  payload: TPayload,
): OpenSumiHostMessageEnvelope<TType, TPayload> {
  return {
    channel: OPENSUMI_HOST_CHANNEL,
    channelId,
    type,
    payload,
  };
}

export function isOpenSumiHostMessage(
  value: unknown,
): value is OpenSumiHostServerMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Partial<OpenSumiHostServerMessage>;
  return (
    message.channel === OPENSUMI_HOST_CHANNEL &&
    typeof message.channelId === "string" &&
    typeof message.type === "string"
  );
}

export function createOpenSumiHostAdapter(
  options: OpenSumiHostAdapterOptions,
): OpenSumiHostAdapter {
  const handleWindowMessage = (
    event: MessageEvent<OpenSumiHostClientMessage>,
  ) => {
    if (options.targetOrigin !== "*" && event.origin !== options.targetOrigin) {
      return;
    }

    const message = event.data;
    if (
      !message ||
      typeof message !== "object" ||
      message.channel !== OPENSUMI_HOST_CHANNEL ||
      message.channelId !== options.channelId
    ) {
      return;
    }

    if (
      message.type === "client:init" ||
      message.type === "client:state-sync"
    ) {
      options.onStateChange?.(message.payload, message.type);
    }
  };

  const publish = <TType extends OpenSumiHostServerMessage["type"]>(
    type: TType,
    payload: Extract<OpenSumiHostServerMessage, { type: TType }>["payload"],
  ) => {
    options.targetWindow.postMessage(
      createOpenSumiHostMessage(options.channelId, type, payload),
      options.targetOrigin,
    );
  };

  window.addEventListener("message", handleWindowMessage);

  return {
    dispose() {
      window.removeEventListener("message", handleWindowMessage);
    },
    publishReady(sessionId: string) {
      publish("host:ready", { sessionId });
    },
    publishPreviewChange(previewUrl: string, runtimeId?: string) {
      publish("host:preview-change", { previewUrl, runtimeId });
    },
    publishHeartbeat() {
      publish("host:heartbeat", { at: new Date().toISOString() });
    },
  };
}

export interface OpenSumiWebIDEBridgeHandle {
  dispose: () => void;
  updateState: (options: {
    workspace: OpenSumiWebIDEBridgeWorkspace;
    session: OpenSumiWebIDEBridgeSession | null;
    config: OpenSumiWebIDEBridgeConfig | null;
  }) => void;
}

export interface OpenSumiWebIDEBridge {
  mount: (options: {
    container: HTMLElement;
    workspace: OpenSumiWebIDEBridgeWorkspace;
    session: OpenSumiWebIDEBridgeSession | null;
    config: OpenSumiWebIDEBridgeConfig | null;
    readOnly?: boolean;
    onMessage?: (message: OpenSumiHostServerMessage) => void;
  }) => OpenSumiWebIDEBridgeHandle;
  var __CODIGO_OPENSUMI_WEBIDE_BRIDGE__: OpenSumiWebIDEBridge | undefined;
}

export function resolveOpenSumiBridge() {
  return globalThis.__CODIGO_OPENSUMI_BRIDGE__;
}

export function resolveOpenSumiWebIDEBridge() {
  return globalThis.__CODIGO_OPENSUMI_WEBIDE_BRIDGE__;
}
