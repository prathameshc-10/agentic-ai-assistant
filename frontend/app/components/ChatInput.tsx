"use client";

import { useRef, useState } from "react";

type ChatInputProps = {
  disabled?: boolean;
  onOpenDrawer: () => void;
  onSendMessage: (message: string) => Promise<void> | void;
  onUploadDocument: (file: File) => Promise<void> | void;
};

export function ChatInput({
  disabled = false,
  onOpenDrawer,
  onSendMessage,
  onUploadDocument,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    const trimmed = message.trim();

    if (!trimmed || disabled) {
      return;
    }

    setMessage("");
    await onSendMessage(trimmed);
  }

  return (
    <div className="glass-card p-3">
      <div className="flex items-center gap-3">
        <button
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg text-slate-400 transition hover:bg-white/10 hover:text-slate-50 lg:hidden"
          onClick={onOpenDrawer}
          type="button"
        >
          +
        </button>
        <button
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg text-slate-400 transition hover:bg-white/10 hover:text-slate-50"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          +
        </button>
        <input
          accept=".pdf,.txt"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];

            if (file) {
              await onUploadDocument(file);
              event.target.value = "";
            }
          }}
          ref={fileInputRef}
          type="file"
        />
        <input
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
          disabled={disabled}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void handleSubmit();
            }
          }}
          placeholder="Ask me anything..."
          value={message}
        />
        <button
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-violet-gradient font-bold text-white shadow-violet transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled || !message.trim()}
          onClick={() => void handleSubmit()}
          type="button"
        >
          -&gt;
        </button>
      </div>
      <p className="ml-14 mt-2 text-xs text-slate-600">Press Enter to send - Attach PDF or TXT</p>
    </div>
  );
}
