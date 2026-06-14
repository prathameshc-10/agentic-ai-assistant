import { agentAccent } from "../data/agentic-ui";
import type { Feature } from "../types/agentic-ui";

type FeatureCardProps = {
  feature: Feature;
};

export function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <article className="glass-card group min-h-44 p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20">
      <div
        className={`mb-5 grid h-12 w-12 place-items-center rounded-2xl text-sm font-bold agent-orb-${
          agentAccent[feature.agent]
        }`}
      >
        {feature.label}
      </div>
      <h3 className="text-lg font-semibold text-slate-50">{feature.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{feature.description}</p>
    </article>
  );
}
