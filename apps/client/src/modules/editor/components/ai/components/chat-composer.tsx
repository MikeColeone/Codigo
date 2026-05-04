import { PauseCircleOutlined, SendOutlined } from "@ant-design/icons";
import { Input } from "antd";

interface ChatComposerProps {
  appendMode: boolean;
  canSubmit: boolean;
  onStop: () => void;
  onSubmit: () => void;
  prompt: string;
  suggestionLabel?: string;
  setPrompt: (value: string) => void;
  submitting: boolean;
  onAppendModeChange: (checked: boolean) => void;
}

export default function ChatComposer({
  appendMode,
  canSubmit,
  onStop,
  onSubmit,
  prompt,
  setPrompt,
  submitting,
  onAppendModeChange,
}: ChatComposerProps) {
  const actionIcon = submitting ? <PauseCircleOutlined /> : <SendOutlined />;
  const actionTitle = submitting ? "停止生成" : "发送消息";

  return (
    <div className="shrink-0 border-t border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] px-3 py-3">
      <div className="rounded-[18px] border border-[color:color-mix(in_srgb,var(--ide-accent)_35%,var(--ide-border))] bg-[var(--ide-bg)] px-3 py-2.5 shadow-[0_10px_24px_rgba(194,120,255,0.14)]">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-[var(--ide-text-muted)]">AI 输入</div>
            <div className="mt-0.5 truncate text-[11px] text-[var(--ide-text-muted)]">
              {appendMode
                  ? "当前会在现有画布基础上继续补充内容。"
                  : "当前会按新结果覆盖当前画布内容。"}
            </div>
          </div>
        </div>

        <Input.TextArea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          autoSize={{ minRows: 2, maxRows: 5 }}
          variant="borderless"
          className="mt-2 !bg-transparent !px-0 !py-0 text-[13px] [&_textarea]:!bg-transparent [&_textarea]:!px-0 [&_textarea]:!py-1 [&_textarea]:!text-[var(--ide-text)] [&_textarea]:!shadow-none [&_textarea]::placeholder:!text-[var(--ide-text-muted)]"
          placeholder="你可以这样提问：用户登录注册流程。"
          onPressEnter={(event) => {
            if (event.shiftKey) return;
            event.preventDefault();
            void onSubmit();
          }}
        />

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={appendMode ? "关闭追加模式" : "开启追加模式"}
              onClick={() => onAppendModeChange(!appendMode)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-[11px] transition-colors ${
                appendMode
                  ? "border-[color:var(--ide-accent)] bg-[color:var(--ide-hover)] text-[color:var(--ide-accent)]"
                  : "border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]"
              }`}
            >
              <PauseCircleOutlined className="text-[12px]" />
              <span>追加</span>
            </button>
            <span className="rounded-xl border border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] px-2.5 py-1 text-[11px] text-[var(--ide-text-muted)]">
              推荐场景
            </span>
          </div>

          <button
            type="button"
            aria-label={actionTitle}
            onClick={() => {
              if (submitting) {
                onStop();
                return;
              }
              void onSubmit();
            }}
            disabled={!submitting && !canSubmit}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all ${
              submitting
                ? "border-[color:var(--ide-accent)] bg-[color:var(--ide-hover)] text-[color:var(--ide-accent)]"
                : canSubmit
                  ? "border-[color:var(--ide-accent)] bg-[color:var(--ide-accent)] text-white shadow-[0_10px_24px_rgba(167,85,255,0.26)]"
                  : "border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] text-[var(--ide-text-muted)]"
            }`}
          >
            {actionIcon}
          </button>
        </div>
      </div>
    </div>
  );
}
