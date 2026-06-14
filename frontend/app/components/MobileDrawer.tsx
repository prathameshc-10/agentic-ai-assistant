import { agentAccent } from "../data/agentic-ui";
import type { ChatSession } from "../types/agentic-ui";

type MobileDrawerProps = {
  open: boolean;
  sessions: ChatSession[];
  activeSessionId: string;
  onClose: () => void;
  onSelectSession: (id: string) => void;
};

export function MobileDrawer({
  open,
  sessions,
  activeSessionId,
  onClose,
  onSelectSession,
}: MobileDrawerProps) {
  return (
    <div
      className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition lg:hidden ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
    >
      <aside
        className={`absolute inset-x-0 bottom-0 rounded-t-[28px] border border-white/10 bg-[#16213E]/95 p-5 shadow-2xl transition duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto h-1 w-14 rounded-full bg-white/20" />
        <div className="mt-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-50">Recent chats</h2>
          <button className="rounded-full px-3 py-1 text-sm text-slate-400" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {sessions.map((session) => {
            const active = activeSessionId === session.id;

            return (
              <button
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${
                  active ? "border-violet-400/30 bg-violet-500/15" : "border-white/10 bg-white/[0.035]"
                }`}
                key={session.id}
                onClick={() => {
                  onSelectSession(session.id);
                  onClose();
                }}
                type="button"
              >
                <span className={`grid h-9 w-9 place-items-center rounded-xl text-xs font-bold agent-orb-${agentAccent[session.agent]}`}>
                  {session.title.charAt(0)}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-100">{session.title}</span>
                  <span className="block text-xs text-slate-600">{session.date}</span>
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
