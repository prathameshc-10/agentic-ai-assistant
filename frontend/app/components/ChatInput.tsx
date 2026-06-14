type ChatInputProps = {
  onOpenDrawer: () => void;
};

export function ChatInput({ onOpenDrawer }: ChatInputProps) {
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
        <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg text-slate-400 transition hover:bg-white/10 hover:text-slate-50">
          +
        </button>
        <input
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
          placeholder="Ask me anything..."
        />
        <button className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-violet-gradient font-bold text-white shadow-violet transition hover:scale-105">
          -&gt;
        </button>
      </div>
      <p className="ml-14 mt-2 text-xs text-slate-600">Press Enter to send - Attach PDF or TXT</p>
    </div>
  );
}
