import "highlight.js/styles/github.css";
import { useEffect, useMemo, useState } from "react";
import hljs from "highlight.js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMarkdownProps {
  content: string;
  enableMarkdown: boolean;
  enableTypewriter: boolean;
  isStreaming: boolean;
}

function useTypewriterText(
  targetText: string,
  enabled: boolean,
  isStreaming: boolean,
) {
  const [displayText, setDisplayText] = useState(targetText);

  useEffect(() => {
    if (!enabled) {
      setDisplayText(targetText);
      return;
    }

    if (isStreaming && targetText.length < displayText.length) {
      setDisplayText(targetText);
      return;
    }

    if (targetText === displayText) return;

    const nextChunk = Math.max(2, Math.ceil((targetText.length - displayText.length) / 10));
    const timer = window.setTimeout(() => {
      setDisplayText(targetText.slice(0, displayText.length + nextChunk));
    }, isStreaming ? 24 : 18);

    return () => {
      window.clearTimeout(timer);
    };
  }, [displayText, enabled, isStreaming, targetText]);

  return displayText;
}

export default function ChatMarkdown({
  content,
  enableMarkdown,
  enableTypewriter,
  isStreaming,
}: ChatMarkdownProps) {
  const displayContent = useTypewriterText(
    content,
    enableTypewriter,
    isStreaming,
  );
  const markdownContent = useMemo(
    () => (displayContent.trim().length > 0 ? displayContent : " "),
    [displayContent],
  );

  if (!enableMarkdown) {
    return (
      <div className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
        {markdownContent}
      </div>
    );
  }

  return (
    <div className="chat-markdown break-words text-[12px] leading-6 [overflow-wrap:anywhere] [&_a]:text-[var(--ide-accent)] [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--ide-accent)] [&_blockquote]:pl-3 [&_blockquote]:text-[var(--ide-text-muted)] [&_code]:rounded-md [&_code]:bg-[rgba(255,255,255,0.08)] [&_code]:px-1.5 [&_code]:py-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-0 [&_p+p]:mt-3 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-[#d0d7de] [&_pre]:bg-[#f6f8fa] [&_pre]:p-3 [&_pre]:text-[#24292f] [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-lg [&_table]:border [&_table]:border-[var(--ide-border)] [&_td]:border [&_td]:border-[var(--ide-border)] [&_td]:px-2 [&_td]:py-1.5 [&_th]:border [&_th]:border-[var(--ide-border)] [&_th]:bg-[var(--ide-active)] [&_th]:px-2 [&_th]:py-1.5 [&_ul]:list-disc [&_ul]:pl-5">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const rawCode = String(children).replace(/\n$/, "");
            const match = /language-(\w+)/.exec(className || "");
            const language = match?.[1];

            if (!className) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }

            const highlighted = language && hljs.getLanguage(language)
              ? hljs.highlight(rawCode, { language }).value
              : hljs.highlightAuto(rawCode).value;

            return (
              <pre>
                <code
                  className={`hljs ${className}`}
                  dangerouslySetInnerHTML={{ __html: highlighted }}
                />
              </pre>
            );
          },
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
}
