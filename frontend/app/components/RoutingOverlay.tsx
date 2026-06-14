import { agentAccent, agentLabels } from "../data/agentic-ui";
import type { AgentKind } from "../types/agentic-ui";

type RoutingOverlayProps = {
  open: boolean;
  onClose: () => void;
};

const routeAgents: AgentKind[] = ["chat", "code", "search", "rag"];

export function RoutingOverlay({ open, onClose }: RoutingOverlayProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#0F0F1A]/85 px-4 backdrop-blur-xl">
      <section className="glass-panel relative w-full max-w-5xl p-6 sm:p-8">
        <button
          className="absolute right-5 top-5 rounded-full border border-white/10 px-3 py-1 text-sm text-slate-400 transition hover:bg-white/10 hover:text-slate-50"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
        <div className="max-w-2xl">
          <p className="section-label">LangGraph visualization</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-50 sm:text-3xl">
            Agent Routing Flow
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            The router evaluates the user intent, current files, and tool needs before selecting the
            best specialist for the next step.
          </p>
        </div>

        <div className="mt-10 overflow-x-auto pb-3">
          <div className="relative mx-auto grid min-w-[760px] grid-cols-[180px_180px_1fr] items-center gap-16">
            <GraphNode label="User Input" />
            <div className="graph-edge left-[178px] top-1/2 w-16" />
            <GraphNode label="Router Node" active />
            <div className="graph-edge left-[424px] top-1/2 w-16" />
            <div className="grid grid-cols-2 gap-5">
              {routeAgents.map((agent) => (
                <GraphNode
                  active={agent === "code"}
                  agent={agent}
                  key={agent}
                  label={agentLabels[agent]}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {routeAgents.map((agent) => (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={agent}>
              <span className={`mb-3 block h-2 w-2 rounded-full agent-dot-${agentAccent[agent]}`} />
              <p className="font-semibold text-slate-100">{agentLabels[agent]}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {agent === "chat" && "Conversational reasoning and synthesis."}
                {agent === "code" && "Writes, edits, and explains code."}
                {agent === "search" && "Live web research and citation prep."}
                {agent === "rag" && "Answers grounded in uploaded documents."}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function GraphNode({
  label,
  agent,
  active = false,
}: {
  label: string;
  agent?: AgentKind;
  active?: boolean;
}) {
  const accent = agent ? agentAccent[agent] : "violet";

  return (
    <div
      className={`grid h-24 place-items-center rounded-3xl border px-5 text-center text-sm font-semibold text-slate-50 ${
        active
          ? `border-violet-300/40 bg-violet-500/15 shadow-violet`
          : "border-white/10 bg-white/[0.045]"
      }`}
    >
      <span className={`agent-text-${accent}`}>{label}</span>
    </div>
  );
}
