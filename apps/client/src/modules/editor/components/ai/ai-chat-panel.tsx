import { ClearOutlined, DatabaseOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import { useEditorComponents } from "@/modules/editor/hooks";
import ChatComposer from "./components/chat-composer";
import ChatMessageList from "./components/chat-message-list";
import { useAiChatSession } from "./hooks/use-ai-chat-session";

const PROMPT_LIST = [
  {
    title: "用户、角色、权限的类图",
    content:
      "请帮我设计一个后台管理系统里的用户、角色、权限类图。需要包含用户、角色、权限点、角色权限关联、用户角色关联这几个核心实体，并说明它们之间的关系。请尽量体现后台场景中的菜单权限、按钮权限和数据范围授权，输出适合直接生成类图的结构化描述。",
  },
  {
    title: "工单处理过程的状态流转",
    content:
      "请帮我梳理一个工单处理流程的状态流转。需要覆盖工单创建、待分配、处理中、待确认、已完成、已关闭这些状态，并补充每个状态下常见的操作人、可执行动作、流转条件和异常回退场景。输出结果请适合直接生成流程图。",
  },
  {
    title: "电商下单到支付成功的流程",
    content:
      "请描述一个电商系统从用户下单到支付成功的完整流程。需要包含商品确认、库存校验、订单创建、优惠计算、支付发起、支付回调、订单状态更新这些环节，并说明用户端、订单服务、库存服务、支付服务之间的交互关系。输出尽量结构化，方便直接生成流程图。",
  },
];

function getTimeGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour < 5) return "深夜好";
  if (hour < 11) return "上午好";
  if (hour < 13) return "中午好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

function AIChatPanel() {
  const { store, getComponentById, replaceByCode } = useEditorComponents();
  const {
    canSubmit,
    clearConversation,
    hydrated,
    pageContext,
    preferences,
    prompt,
    removeMessage,
    session,
    setPrompt,
    stopStreaming,
    submitting,
    updatePreferences,
    userAvatar,
    userName,
    handleSubmit,
  } = useAiChatSession({
    store,
    getComponentById,
    replaceByCode,
  });
  const messagesViewportRef = useRef<HTMLDivElement | null>(null);
  const [timeGreeting, setTimeGreeting] = useState(() => getTimeGreeting());
  const hasConversation = useMemo(
    () =>
      session.messages.some((message, index) => message.role === "user" || index > 0),
    [session.messages],
  );
  const hasAiReply = useMemo(
    () =>
      session.messages.some(
        (message, index) => index > 0 && message.role === "assistant",
      ),
    [session.messages],
  );
  const lastMessageSignature = useMemo(() => {
    const lastMessage = session.messages.at(-1);
    return `${lastMessage?.id ?? "empty"}:${lastMessage?.content.length ?? 0}`;
  }, [session.messages]);

  useEffect(() => {
    const viewport = messagesViewportRef.current;
    if (!viewport) return;
    viewport.scrollTop = viewport.scrollHeight;
  }, [lastMessageSignature]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeGreeting(getTimeGreeting());
    }, 60_000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="flex h-full w-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[linear-gradient(180deg,var(--ide-sidebar-bg)_0%,color-mix(in_srgb,var(--ide-hover)_40%,transparent)_100%)]">
      <div className="border-b border-[var(--ide-border)] px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ide-text-muted)]">
              AI Workspace
            </div>
            <div className="mt-1 text-[12px] text-[var(--ide-text)]">
              {pageContext?.name ?? "当前页面"} · {pageContext?.path ?? "未绑定路径"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)] px-2.5 py-1 text-[10px] leading-none text-[var(--ide-text-muted)]">
              <ThunderboltOutlined />
              <span>{preferences.preferredTransport.toUpperCase()}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)] px-2.5 py-1 text-[10px] leading-none text-[var(--ide-text-muted)]">
              <DatabaseOutlined />
              <span>{hydrated ? "IndexedDB" : "载入中"}</span>
            </span>
            {hasAiReply ? (
              <Button
                type="text"
                size="small"
                icon={<ClearOutlined />}
                onClick={clearConversation}
                className="!h-8 !w-8 !min-w-8 !rounded-xl !border !border-[var(--ide-border)] !bg-[var(--ide-bg)] !text-[var(--ide-text-muted)] hover:!text-[var(--ide-text)]"
              />
            ) : null}
          </div>
        </div>
      </div>

      <div
        ref={messagesViewportRef}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 scrollbar-thin scrollbar-thumb-[var(--ide-border)] hover:scrollbar-thumb-[var(--ide-text-muted)] scrollbar-track-transparent"
      >
        {hasConversation ? (
          <div className="mx-auto w-full max-w-[640px]">
            <ChatMessageList
              messages={session.messages}
              markdownEnabled
              typewriterEnabled
              onRemoveMessage={removeMessage}
              userAvatar={userAvatar}
              userName={userName}
            />
          </div>
        ) : (
          <div className="mx-auto flex h-full min-h-[500px] w-full max-w-[640px] flex-col justify-center px-4 py-6 text-center">
            <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
              <div className="absolute h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(214,158,255,0.32),rgba(214,158,255,0)_72%)] blur-md" />
              <div className="absolute left-6 top-4 h-10 w-10 rotate-12 rounded-[14px] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(231,182,255,0.96)_40%,rgba(205,126,255,0.92)_75%,rgba(255,255,255,0.98))] shadow-[0_10px_28px_rgba(194,120,255,0.2)] [clip-path:polygon(50%_0%,64%_34%,100%_50%,64%_66%,50%_100%,36%_66%,0%_50%,36%_34%)]" />
              <div className="absolute left-[60px] top-12 h-5 w-5 rounded-[8px] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(233,190,255,0.96)_42%,rgba(205,126,255,0.9)_78%,rgba(255,255,255,0.98))] shadow-[0_8px_18px_rgba(194,120,255,0.18)] [clip-path:polygon(50%_0%,64%_34%,100%_50%,64%_66%,50%_100%,36%_66%,0%_50%,36%_34%)]" />
            </div>

            <div className="mx-auto mt-5 max-w-[500px]">
              <h3 className="text-[26px] font-semibold leading-[1.35] tracking-tight text-[var(--ide-text)]">
                {timeGreeting}，今天想用 AI 做点什么呢
              </h3>
            </div>

            <div className="mx-auto mt-16 flex w-full max-w-[360px] flex-col items-start gap-3 text-left">
              {PROMPT_LIST.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setPrompt(item.content)}
                  className="rounded-2xl bg-white px-4 py-3 text-[13px] text-[var(--ide-text)] shadow-[0_4px_18px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                >
                  <span className="mr-2 text-[color:var(--ide-accent)]">✧</span>
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <ChatComposer
        appendMode={preferences.appendMode}
        canSubmit={canSubmit}
        onStop={stopStreaming}
        onSubmit={handleSubmit}
        onAppendModeChange={(checked) => {
          updatePreferences({ appendMode: checked });
        }}
        prompt={prompt}
        setPrompt={setPrompt}
        submitting={submitting}
      />
    </div>
  );
}

const AIChatPanelComponent = observer(AIChatPanel);

export default AIChatPanelComponent;
