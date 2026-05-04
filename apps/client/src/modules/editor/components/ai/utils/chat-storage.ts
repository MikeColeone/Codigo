import { openDB } from "idb";
import { ulid } from "ulid";
import type {
  ChatMessage,
  ChatPreferences,
  ChatSession,
} from "../ai-chat-types";

const DB_NAME = "codigo-ai-chat";
const DB_VERSION = 1;
const SESSION_STORE = "sessions";
const ACTIVE_SESSION_KEY = "codigo_ai_chat_active_session_v2";
const SESSION_FALLBACK_KEY = "codigo_ai_chat_session_cache_v2";
const PREFERENCES_KEY = "codigo_ai_chat_preferences_v2";

const defaultAssistantMessage: ChatMessage = {
  id: ulid(),
  role: "assistant",
  content: "描述你想生成的页面结构，我会把结果同步到当前画布。",
  createdAt: Date.now(),
  status: "done",
  transport: "sse",
};

function readLocalStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeLocalStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Swallow storage errors and keep in-memory chat usable.
  }
}

async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        db.createObjectStore(SESSION_STORE, { keyPath: "id" });
      }
    },
  });
}

export function getDefaultPreferences(): ChatPreferences {
  const stored = readLocalStorage<Partial<ChatPreferences>>(PREFERENCES_KEY);
  return {
    appendMode: stored?.appendMode ?? false,
    markdownEnabled: stored?.markdownEnabled ?? true,
    typewriterEnabled: stored?.typewriterEnabled ?? true,
    autoScroll: stored?.autoScroll ?? true,
    preferredTransport: stored?.preferredTransport ?? "sse",
  };
}

export function buildInitialMessages(): ChatMessage[] {
  return [{ ...defaultAssistantMessage, id: ulid(), createdAt: Date.now() }];
}

export function createSession(
  pageId: string,
  preferences: ChatPreferences,
  messages = buildInitialMessages(),
): ChatSession {
  const now = Date.now();
  return {
    id: ulid(),
    pageId,
    messages,
    createdAt: now,
    updatedAt: now,
    preferences,
  };
}

export function savePreferences(preferences: ChatPreferences) {
  writeLocalStorage(PREFERENCES_KEY, preferences);
}

export async function loadSession(
  pageId: string,
  preferences: ChatPreferences,
): Promise<ChatSession> {
  const activeMap =
    readLocalStorage<Record<string, string>>(ACTIVE_SESSION_KEY) ?? {};
  const fallbackMap =
    readLocalStorage<Record<string, ChatSession>>(SESSION_FALLBACK_KEY) ?? {};
  const activeSessionId = activeMap[pageId];

  try {
    const db = await getDb();
    if (activeSessionId) {
      const stored = await db.get(SESSION_STORE, activeSessionId);
      if (stored && stored.pageId === pageId) {
        return {
          ...stored,
          preferences: {
            ...preferences,
            ...stored.preferences,
          },
        } as ChatSession;
      }
    }
  } catch {
    // Fall back to localStorage cache.
  }

  const fallbackSession = fallbackMap[pageId];
  if (fallbackSession) {
    return {
      ...fallbackSession,
      preferences: {
        ...preferences,
        ...fallbackSession.preferences,
      },
    };
  }

  return createSession(pageId, preferences);
}

export async function persistSession(session: ChatSession) {
  const activeMap =
    readLocalStorage<Record<string, string>>(ACTIVE_SESSION_KEY) ?? {};
  activeMap[session.pageId] = session.id;
  writeLocalStorage(ACTIVE_SESSION_KEY, activeMap);

  const fallbackMap =
    readLocalStorage<Record<string, ChatSession>>(SESSION_FALLBACK_KEY) ?? {};
  fallbackMap[session.pageId] = session;
  writeLocalStorage(SESSION_FALLBACK_KEY, fallbackMap);

  try {
    const db = await getDb();
    await db.put(SESSION_STORE, session);
  } catch {
    // localStorage fallback is already updated.
  }
}
