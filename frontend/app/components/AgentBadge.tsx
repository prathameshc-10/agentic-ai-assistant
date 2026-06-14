import { agentAccent, agentLabels } from "../data/agentic-ui";
import type { AgentKind } from "../types/agentic-ui";

type AgentBadgeProps = {
  agent: AgentKind;
  compact?: boolean;
};

export function AgentBadge({ agent, compact = false }: AgentBadgeProps) {
  return (
    <span
      className={`agent-badge agent-badge-${agentAccent[agent]} ${
        compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
      }`}
    >
      {compact ? agentLabels[agent].replace(" Agent", "") : agentLabels[agent]}
    </span>
  );
}
