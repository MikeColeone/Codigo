import { DeleteOutlined, RobotOutlined } from "@ant-design/icons";
import { Avatar } from "antd";
import type { ChatMessage } from "../ai-chat-types";
import ChatMarkdown from "./chat-markdown";

interface ChatMessageListProps {
  messages: ChatMessage[];
  markdownEnabled: boolean;
  typewriterEnabled: boolean;
  onRemoveMessage: (messageId: string) => void;
  userAvatar: string;
  userName: string;
}

function MessageStatusTag({ status }: { status: ChatMessage["status"] }) {
  if (status === "done" || status === "idle") return null;

  const label = status === "streaming" ? "生成中" : "已停止";
  const toneClassName =
    status === "streaming"
      ? "border-[color:var(--ide-accent)] bg-[color:var(--ide-hover)] text-[color:var(--ide-accent)]"
      : "border-[var(--ide-border)] bg-[var(--ide-hover)] text-[var(--ide-text-muted)]";

  return (
    <span
      className={`ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] leading-4 ${toneClassName}`}
    >
      {label}
    </span>
  );
}

export default function ChatMessageList({
  messages,
  markdownEnabled,
  typewriterEnabled,
  onRemoveMessage,
  userAvatar,
  userName,
}: ChatMessageListProps) {
  return (
    <div className="space-y-5 px-1 py-2">
      {messages.map((message) => {
        const isUser = message.role === "user";
        const bubbleStyles = isUser
          ? "border border-[var(--ide-border)] bg-[var(--ide-hover)] text-[var(--ide-text)]"
          : "border border-[var(--ide-border)] bg-[var(--ide-bg)] text-[var(--ide-text)] shadow-sm";

        return (
          <div
            key={message.id}
            className={`group flex w-full min-w-0 items-start gap-3 ${
              isUser ? "justify-end" : "justify-start"
            }`}
          >
            {!isUser ? (
              <div className="pt-0.5">
                <Avatar
                  size={30}
                  icon={<RobotOutlined />}
                  className="shrink-0 border border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] text-[var(--ide-text-muted)]"
                />
              </div>
            ) : null}

            <div className={`min-w-0 ${isUser ? "order-1 max-w-[82%]" : "max-w-[88%] flex-1"}`}>
              <div
                className={`mb-1 flex items-center px-1 text-[10px] text-[var(--ide-text-muted)] ${
                  isUser ? "justify-end" : ""
                }`}
              >
                <span>{isUser ? userName : "AI"}</span>
                {!isUser ? <MessageStatusTag status={message.status} /> : null}
              </div>
              <div className={`flex min-w-0 items-start gap-2 ${isUser ? "justify-end" : ""}`}>
                <div className="inline-block min-w-0 max-w-full">
                  <div
                    className={`rounded-[20px] px-4 py-3 text-[12px] leading-relaxed ${bubbleStyles}`}
                  >
                    {isUser ? (
                      <div className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                        {message.content}
                      </div>
                    ) : (
                      <ChatMarkdown
                        content={message.content}
                        enableMarkdown={markdownEnabled}
                        enableTypewriter={typewriterEnabled}
                        isStreaming={message.status === "streaming"}
                      />
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveMessage(message.id)}
                  aria-label="删除消息"
                  className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--ide-border)] bg-[var(--ide-bg)] text-[var(--ide-text-muted)] opacity-0 shadow-sm transition-opacity hover:text-[var(--ide-text)] group-hover:opacity-100"
                >
                  <DeleteOutlined className="text-[12px]" />
                </button>
              </div>
            </div>

            {isUser ? (
              <div className="order-2 pt-0.5">
                <Avatar
                  size={30}
                  src={userAvatar || undefined}
                  className="shrink-0 border border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] text-[var(--ide-text)]"
                >
                  {(userName || "你").slice(0, 1).toUpperCase()}
                </Avatar>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
