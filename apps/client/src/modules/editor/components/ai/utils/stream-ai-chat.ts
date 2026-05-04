import { BASE_URL } from "@/shared/utils/request";
import type {
  ChatPageContext,
  DraftComponent,
  StreamEventPayload,
} from "../ai-chat-types";
import { parseSSEBlock } from "./parse-sse";

type StreamAiChatArgs = {
  prompt: string;
  current: Array<Record<string, unknown>>;
  page?: ChatPageContext;
  token?: string;
  signal: AbortSignal;
  onDelta: (text: string) => void;
  onResult: (draft: DraftComponent[]) => void;
};

function isJsonDeltaChunk(delta: string) {
  const normalized = delta.trimStart();
  return (
    normalized.startsWith("{") ||
    normalized.startsWith("[") ||
    normalized.includes('"draft"') ||
    normalized.includes('{"draft"')
  );
}

export async function streamAiChat({
  prompt,
  current,
  page,
  token,
  signal,
  onDelta,
  onResult,
}: StreamAiChatArgs) {
  const response = await fetch(`${BASE_URL}/api/ai/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(token ? { Authorization: token } : {}),
    },
    body: JSON.stringify({
      prompt,
      current,
      page,
    }),
    signal,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `请求失败：${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("当前环境不支持流式响应");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let jsonStarted = false;
  let jsonHintShown = false;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const evt = parseSSEBlock(part);
      if (!evt) continue;

      if (evt.event === "delta") {
        let text = evt.data;
        try {
          const payload = JSON.parse(evt.data) as StreamEventPayload;
          text = payload.text ?? evt.data;
        } catch {
          // Keep raw event data when payload is not JSON.
        }

        if (!jsonStarted && isJsonDeltaChunk(text)) {
          jsonStarted = true;
        }

        if (jsonStarted) {
          if (!jsonHintShown) {
            jsonHintShown = true;
            onDelta("\n(结构化结果生成中...)\n");
          }
          continue;
        }

        onDelta(text);
      }

      if (evt.event === "result") {
        const payload = JSON.parse(evt.data) as StreamEventPayload;
        onResult(payload.draft ?? []);
      }

      if (evt.event === "error") {
        const payload = JSON.parse(evt.data) as StreamEventPayload;
        throw new Error(payload.message || "生成失败");
      }
    }
  }
}
