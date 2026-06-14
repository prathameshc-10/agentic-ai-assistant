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
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-50">{message.content}</p>
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
