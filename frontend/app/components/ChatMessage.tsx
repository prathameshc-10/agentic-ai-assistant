import { AgentBadge } from "./AgentBadge";
import { CodeBlock } from "./CodeBlock";
import type { ChatMessage as ChatMessageType } from "../types/agentic-ui";

type ChatMessageProps = {
  message: ChatMessageType;
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.author === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={isUser ? "max-w-[58%] max-lg:max-w-[76%] max-sm:max-w-full" : "max-w-[62%] max-lg:max-w-[82%] max-sm:max-w-full"}>
        <div className={isUser ? "user-bubble" : "ai-bubble"}>
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-50">{message.content}</p>
          ) : (
            <MarkdownMessage content={message.content} />
          )}
          {message.code ? <CodeBlock language={message.code.language} lines={message.code.lines} /> : null}
        </div>
        {!isUser && message.agent ? (
          <div className="mt-2">
            <AgentBadge agent={message.agent} compact />
          </div>
        ) : null}
      </div>
    </div>
  );
}

type MarkdownSegment =
  | { type: "code"; code: string; language: string }
  | { type: "text"; content: string };

function MarkdownMessage({ content }: { content: string }) {
  const segments = splitMarkdown(content);

  return (
    <div className="space-y-3">
      {segments.map((segment, index) => {
        if (segment.type === "code") {
          return (
            <CodeBlock
              code={segment.code}
              key={`code-${index}`}
              language={segment.language || "text"}
            />
          );
        }

        return <RichTextBlock content={segment.content} key={`text-${index}`} />;
      })}
    </div>
  );
}

function splitMarkdown(content: string): MarkdownSegment[] {
  const segments: MarkdownSegment[] = [];
  const fencePattern = /```([^\n`]*)?\r?\n([\s\S]*?)```/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = fencePattern.exec(content)) !== null) {
    if (match.index > cursor) {
      segments.push({ type: "text", content: content.slice(cursor, match.index) });
    }

    segments.push({
      type: "code",
      language: match[1]?.trim() || "text",
      code: match[2].trimEnd(),
    });
    cursor = match.index + match[0].length;
  }

  if (cursor < content.length) {
    segments.push({ type: "text", content: content.slice(cursor) });
  }

  return segments.filter((segment) =>
    segment.type === "code" ? segment.code.trim() : segment.content.trim(),
  );
}

function RichTextBlock({ content }: { content: string }) {
  return (
    <div className="space-y-2 text-sm leading-6 text-slate-100">
      {content
        .trim()
        .split(/\n{2,}/)
        .map((block, index) => {
          const trimmed = block.trim();

          if (!trimmed) {
            return null;
          }

          if (trimmed.startsWith("### ")) {
            return (
              <h3 className="pt-2 text-base font-bold text-slate-50" key={index}>
                {trimmed.replace(/^###\s+/, "")}
              </h3>
            );
          }

          if (/^(\d+\.|\*|-)\s+/m.test(trimmed)) {
            return (
              <div className="space-y-1" key={index}>
                {trimmed.split("\n").map((line, lineIndex) => (
                  <p className="whitespace-pre-wrap text-slate-200" key={`${line}-${lineIndex}`}>
                    {line}
                  </p>
                ))}
              </div>
            );
          }

          return (
            <p className="whitespace-pre-wrap text-slate-100" key={index}>
              {trimmed}
            </p>
          );
        })}
    </div>
  );
}
