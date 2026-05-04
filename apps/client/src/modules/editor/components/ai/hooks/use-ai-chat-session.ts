import { toJS } from "mobx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ulid } from "ulid";
import { storeAuth } from "@/shared/hooks/use-store-auth";
import type {
  ChatMessage,
  ChatPageContext,
  ChatPreferences,
  ChatSession,
  DraftComponent,
} from "../ai-chat-types";
import { buildDraftByPrompt } from "../utils/chat-draft";
import {
  createSession,
  getDefaultPreferences,
  loadSession,
  persistSession,
  savePreferences,
} from "../utils/chat-storage";
import { streamAiChat } from "../utils/stream-ai-chat";

type CanvasComponent = {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  styles?: Record<string, unknown>;
};

type UseAiChatSessionArgs = {
  store: {
    activePageId?: string | null;
    pages: Array<{ id: string; path: string; name: string }>;
    sortableCompConfig: string[];
  };
  getComponentById: (id: string) => CanvasComponent | null | undefined;
  replaceByCode: (components: Array<Record<string, unknown>>) => void;
};

const defaultPreferences = getDefaultPreferences();

function createMessage(
  role: ChatMessage["role"],
  content: string,
  status: ChatMessage["status"] = "done",
): ChatMessage {
  return {
    id: ulid(),
    role,
    content,
    createdAt: Date.now(),
    status,
    transport: "sse",
  };
}

export function useAiChatSession({
  store,
  getComponentById,
  replaceByCode,
}: UseAiChatSessionArgs) {
  const pageId = store.activePageId ?? "unknown";
  const [session, setSession] = useState<ChatSession>(() =>
    createSession(pageId, defaultPreferences),
  );
  const [prompt, setPrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const persistTimerRef = useRef<number | null>(null);
  const activePage = useMemo(
    () => store.pages.find((page) => page.id === store.activePageId),
    [store.activePageId, store.pages],
  );
  const pageContext = useMemo<ChatPageContext | undefined>(
    () =>
      activePage
        ? {
            id: activePage.id,
            path: activePage.path,
            name: activePage.name,
          }
        : undefined,
    [activePage],
  );
  const canSubmit = useMemo(() => prompt.trim().length > 0, [prompt]);

  const applySessionPatch = useCallback(
    (updater: (current: ChatSession) => ChatSession) => {
      setSession((current) => {
        const next = updater(current);
        return {
          ...next,
          updatedAt: Date.now(),
        };
      });
    },
    [],
  );

  const updatePreferences = useCallback(
    (patch: Partial<ChatPreferences>) => {
      applySessionPatch((current) => ({
        ...current,
        preferences: {
          ...current.preferences,
          ...patch,
        },
      }));
    },
    [applySessionPatch],
  );

  const removeMessage = useCallback(
    (messageId: string) => {
      applySessionPatch((current) => ({
        ...current,
        messages: current.messages.filter((item) => item.id !== messageId),
      }));
    },
    [applySessionPatch],
  );

  const clearConversation = useCallback(() => {
    const nextSession = createSession(pageId, session.preferences);
    setPrompt("");
    setSession(nextSession);
  }, [pageId, session.preferences]);

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrateSession() {
      const loaded = await loadSession(pageId, session.preferences);
      if (cancelled) return;
      setSession(loaded);
      setHydrated(true);
    }

    setHydrated(false);
    void hydrateSession();

    return () => {
      cancelled = true;
    };
  }, [pageId]);

  useEffect(() => {
    savePreferences(session.preferences);
  }, [session.preferences]);

  useEffect(() => {
    if (!hydrated) return;

    if (persistTimerRef.current) {
      window.clearTimeout(persistTimerRef.current);
    }

    persistTimerRef.current = window.setTimeout(() => {
      void persistSession(session);
    }, 300);

    return () => {
      if (persistTimerRef.current) {
        window.clearTimeout(persistTimerRef.current);
      }
    };
  }, [hydrated, session]);

  useEffect(
    () => () => {
      abortControllerRef.current?.abort();
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    const userPrompt = prompt.trim();
    if (!userPrompt || submitting) return;

    const appendMode = session.preferences.appendMode;
    const current = appendMode
      ? store.sortableCompConfig
          .map((id) => getComponentById(id))
          .filter((item): item is NonNullable<typeof item> => Boolean(item))
          .map((item) => ({
            id: item.id,
            type: item.type,
            props: toJS(item.props),
            styles: toJS(item.styles ?? {}),
          }))
      : [];

    const assistantMessageId = ulid();
    const nextMessages = [
      ...session.messages,
      createMessage("user", userPrompt),
      {
        id: assistantMessageId,
        role: "assistant" as const,
        content: "正在连接 AI 服务...\n",
        createdAt: Date.now(),
        status: "streaming" as const,
        transport: session.preferences.preferredTransport,
      },
    ];

    setSubmitting(true);
    setPrompt("");
    setSession((currentSession) => ({
      ...currentSession,
      messages: nextMessages,
      updatedAt: Date.now(),
    }));

    const controller = new AbortController();
    abortControllerRef.current = controller;
    let draftFromServer: DraftComponent[] | null = null;
    let streamedText = "";

    const updateAssistantMessage = (content: string, status: ChatMessage["status"]) => {
      setSession((currentSession) => ({
        ...currentSession,
        updatedAt: Date.now(),
        messages: currentSession.messages.map((message) =>
          message.id === assistantMessageId
            ? { ...message, content, status }
            : message,
        ),
      }));
    };

    try {
      await streamAiChat({
        prompt: userPrompt,
        current,
        page: pageContext,
        token: storeAuth.token,
        signal: controller.signal,
        onDelta: (delta) => {
          streamedText += delta;
          updateAssistantMessage(streamedText, "streaming");
        },
        onResult: (draft) => {
          draftFromServer = draft;
        },
      });

      const nextDraft = draftFromServer ?? buildDraftByPrompt(userPrompt);
      replaceByCode([...current, ...nextDraft]);
      streamedText += `\n已生成 ${nextDraft.length} 个组件，已同步到画布与源码。`;
      updateAssistantMessage(streamedText, "done");
    } catch (error) {
      if (controller.signal.aborted) {
        const abortedMessage = streamedText.trim()
          ? `${streamedText}\n\n已停止本次生成。`
          : "已停止本次生成。";
        updateAssistantMessage(abortedMessage, "error");
      } else {
        updateAssistantMessage(
          `生成失败：${(error as Error).message}`,
          "error",
        );
      }
    } finally {
      abortControllerRef.current = null;
      setSubmitting(false);
    }
  }, [
    getComponentById,
    pageContext,
    prompt,
    replaceByCode,
    session.messages,
    session.preferences,
    store.sortableCompConfig,
    submitting,
  ]);

  return {
    canSubmit,
    clearConversation,
    hydrated,
    pageContext,
    preferences: session.preferences,
    prompt,
    removeMessage,
    session,
    setPrompt,
    stopStreaming,
    submitting,
    updatePreferences,
    userAvatar: storeAuth.details?.head_img || "",
    userName: storeAuth.details?.username || "你",
    handleSubmit,
  };
}
