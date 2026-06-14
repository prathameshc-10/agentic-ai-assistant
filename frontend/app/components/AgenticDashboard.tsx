"use client";

import { useMemo, useState } from "react";
import {
  agentLabels,
  agentStats,
  documents,
  features,
  messages,
  sessions,
  suggestions,
} from "../data/agentic-ui";
import { AgentBadge } from "./AgentBadge";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { LandingHero } from "./LandingHero";
import { Logo } from "./Logo";
import { MobileDrawer } from "./MobileDrawer";
import { RoutingOverlay } from "./RoutingOverlay";
import { SessionPanel } from "./SessionPanel";
import { Sidebar } from "./Sidebar";

export function AgenticDashboard() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState(sessions[0].id);
  const [routingOpen, setRoutingOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? sessions[0],
    [activeSessionId],
  );

  if (showLanding) {
    return <LandingHero features={features} onStart={() => setShowLanding(false)} />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0F0F1A] p-4 text-slate-50 sm:p-5">
      <div className="gradient-mesh gradient-mesh-violet" />
      <div className="gradient-mesh gradient-mesh-blue" />

      <div className="relative mx-auto flex h-[calc(100vh-2rem)] max-w-[1480px] gap-5">
        <Sidebar
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
          sessions={sessions}
        />

        <section className="flex min-w-0 flex-1 flex-col gap-5">
          <header className="glass-card flex min-h-[72px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="lg:hidden">
                <Logo compact />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold text-slate-50 sm:text-xl">
                  {activeSession.title}
                </h1>
                <p className="text-xs text-slate-600 sm:hidden">{agentLabels[activeSession.agent]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AgentBadge agent={activeSession.agent} />
              <button
                className="hidden rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 sm:inline-flex"
                onClick={() => setRoutingOpen(true)}
                type="button"
              >
                View routing
              </button>
              <button
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 lg:hidden"
                onClick={() => setDrawerOpen(true)}
                type="button"
              >
                Chats
              </button>
            </div>
          </header>

          <div className="glass-card flex-1 overflow-hidden p-4 sm:p-6">
            <div className="flex h-full flex-col">
              <div className="flex-1 space-y-6 overflow-y-auto pr-1">
                <EmptyPrompt />
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                <ThinkingState />
              </div>
            </div>
          </div>

          <ChatInput onOpenDrawer={() => setDrawerOpen(true)} />
        </section>

        <SessionPanel documents={documents} stats={agentStats} />
      </div>

      <button
        className="fixed bottom-24 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-violet-gradient text-2xl font-semibold text-white shadow-violet transition hover:scale-105 xl:hidden"
        onClick={() => setRoutingOpen(true)}
        type="button"
      >
        +
      </button>

      <MobileDrawer
        activeSessionId={activeSessionId}
        onClose={() => setDrawerOpen(false)}
        onSelectSession={setActiveSessionId}
        open={drawerOpen}
        sessions={sessions}
      />
      <RoutingOverlay open={routingOpen} onClose={() => setRoutingOpen(false)} />
    </main>
  );
}

function EmptyPrompt() {
  return (
    <section className="mx-auto mb-8 max-w-2xl rounded-3xl border border-white/10 bg-white/[0.035] p-6 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-violet-500/15 text-lg font-bold text-violet-200 shadow-violet">
        AI
      </div>
      <h2 className="mt-5 text-xl font-semibold text-slate-50">What should we build today?</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Start with a prompt or attach a document. The router will send the work to the right agent.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {suggestions.map((suggestion) => (
          <button
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-violet-300/30 hover:bg-violet-500/10 hover:text-slate-50"
            key={suggestion.id}
            type="button"
          >
            {suggestion.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function ThinkingState() {
  return (
    <div className="flex justify-start">
      <div className="ai-bubble flex w-fit items-center gap-3">
        <span className="text-sm font-medium text-slate-400">Thinking</span>
        <span className="flex gap-1.5">
          <span className="thinking-dot" />
          <span className="thinking-dot animation-delay-150" />
          <span className="thinking-dot animation-delay-300" />
        </span>
      </div>
    </div>
  );
}
