import type { TComponentTypes } from "@codigo/schema";

export type ChatRole = "user" | "assistant";

export type ChatTransport = "sse" | "websocket";

export type ChatMessageStatus = "idle" | "streaming" | "done" | "error";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  status: ChatMessageStatus;
  transport?: ChatTransport;
};

export type DraftComponent = {
  type: TComponentTypes;
  props?: Record<string, unknown>;
  styles?: Record<string, unknown>;
};

export type ChatPageContext = {
  id: string;
  path: string;
  name: string;
};

export type ChatPreferences = {
  appendMode: boolean;
  markdownEnabled: boolean;
  typewriterEnabled: boolean;
  autoScroll: boolean;
  preferredTransport: ChatTransport;
};

export type ChatSession = {
  id: string;
  pageId: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  preferences: ChatPreferences;
};

export type StreamEventPayload = {
  text?: string;
  draft?: DraftComponent[];
  message?: string;
};
