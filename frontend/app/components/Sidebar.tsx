import { agentAccent } from "../data/agentic-ui";
import type { ChatSession } from "../types/agentic-ui";
import { Logo } from "./Logo";

type SidebarProps = {
  sessions: ChatSession[];
  activeSessionId: string;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
};

export function Sidebar({ sessions, activeSessionId, onNewChat, onSelectSession }: SidebarProps) {
  return (
    <aside className="glass-panel flex h-full w-[260px] shrink-0 flex-col p-6 max-lg:hidden">
      <Logo />

      <button
        className="mt-8 h-11 rounded-full bg-violet-gradient text-sm font-semibold text-white shadow-violet transition hover:scale-[1.01]"
        onClick={onNewChat}
        type="button"
      >
        New Chat
      </button>

      <div className="mt-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
          Recent chats
        </p>
        <nav className="space-y-2">
          {sessions.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-4 text-sm text-slate-500">
              No recent chats yet.
            </p>
          ) : null}
          {sessions.map((session) => {
            const active = session.id === activeSessionId;

            return (
              <button
                className={`group relative flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                  active
                    ? "border-violet-400/20 bg-violet-500/15"
                    : "border-white/0 bg-white/[0.025] hover:border-white/10 hover:bg-white/[0.055]"
                }`}
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                type="button"
              >
                {active ? <span className="absolute left-0 h-8 w-0.5 rounded-full bg-violet-400" /> : null}
                <span className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-bold agent-orb-${agentAccent[session.agent]}`}>
                  {session.title.charAt(0)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-100">
                    {session.title}
                  </span>
                  <span className="block text-xs text-slate-600">{session.date}</span>
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto flex items-center gap-3 border-t border-white/10 pt-5">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-violet-gradient text-xs font-bold text-white">
          PC
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-100">Prathamesh</p>
          <p className="text-xs text-slate-600">Workspace owner</p>
        </div>
        <button className="ml-auto rounded-full p-2 text-slate-500 transition hover:bg-white/10 hover:text-slate-100">
          Settings
        </button>
      </div>
    </aside>
  );
}
