import type { Feature } from "../types/agentic-ui";
import { FeatureCard } from "./FeatureCard";
import { Logo } from "./Logo";

type LandingHeroProps = {
  features: Feature[];
  onStart: () => void;
};

export function LandingHero({ features, onStart }: LandingHeroProps) {
  return (
    <section className="relative min-h-screen overflow-hidden px-5 py-16 sm:px-8 lg:px-12">
      <div className="gradient-mesh gradient-mesh-violet" />
      <div className="gradient-mesh gradient-mesh-blue" />
      <div className="particle-field" />

      <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl flex-col items-center justify-center">
        <Logo />
        <h1 className="mt-8 text-center text-5xl font-bold tracking-normal text-slate-50 sm:text-7xl">
          Agentic AI
        </h1>
        <p className="mt-5 text-center text-xl text-slate-400 sm:text-2xl">
          One assistant. Four superpowers.
        </p>

        <div className="mt-12 grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard feature={feature} key={feature.title} />
          ))}
        </div>

        <button
          className="mt-12 rounded-full bg-violet-gradient px-8 py-4 text-sm font-bold text-white shadow-violet transition hover:scale-[1.02]"
          onClick={onStart}
          type="button"
        >
          Start Chatting
        </button>
      </div>
    </section>
  );
}
