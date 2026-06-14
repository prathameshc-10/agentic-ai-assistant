"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  agentLabels,
  features,
  suggestions,
} from "../data/agentic-ui";
import {
  createChatSession,
  getChatSessions,
  getDocuments,
  getSessionHistory,
  sendChatMessage,
  uploadDocument,
} from "../lib/api";
import type {
  AgentKind,
  AgentStat,
  BackendDocument,
  BackendSession,
  ChatMessage as ChatMessageType,
  ChatSession,
  UploadedDocument,
} from "../types/agentic-ui";
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
  const [backendSessionId, setBackendSessionId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : window.localStorage.getItem("agentic_session_id"),
  );
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : window.localStorage.getItem("agentic_session_id"),
  );
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(() =>
    typeof window === "undefined" ? false : Boolean(window.localStorage.getItem("agentic_session_id")),
  );
  const [isSessionsLoading, setIsSessionsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [routingOpen, setRoutingOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  const activeSession = useMemo(() => {
    return (
      chatSessions.find((session) => session.id === activeSessionId) ?? {
        id: backendSessionId ?? "new",
        title: "New chat",
        date: "Now",
        agent: "chat" as AgentKind,
        agentCounts: { chat: 0, code: 0, rag: 0, search: 0 },
        messageCount: 0,
      }
    );
  }, [activeSessionId, backendSessionId, chatSessions]);

  const liveAgentStats = useMemo(
    () => buildAgentStats(chatMessages, activeSession.agentCounts),
    [activeSession.agentCounts, chatMessages],
  );

  const refreshDocuments = useCallback(async () => {
    try {
      const response = await getDocuments();
      setUploadedDocuments(response.map(mapBackendDocument));
    } catch {
      setUploadedDocuments([]);
    }
  }, []);

  const refreshSessions = useCallback(async () => {
    setIsSessionsLoading(true);

    try {
      const response = await getChatSessions();
      const mappedSessions = response.map(mapBackendSession);
      setChatSessions(mappedSessions);

      if (!backendSessionId && mappedSessions[0]) {
        setBackendSessionId(mappedSessions[0].id);
        setActiveSessionId(mappedSessions[0].id);
        window.localStorage.setItem("agentic_session_id", mappedSessions[0].id);
      }
    } catch (sessionsError: unknown) {
      setError(sessionsError instanceof Error ? sessionsError.message : "Could not load sessions.");
    } finally {
      setIsSessionsLoading(false);
    }
  }, [backendSessionId]);

  useEffect(() => {
    void refreshSessions();
    void refreshDocuments();
  }, [refreshDocuments, refreshSessions]);

  useEffect(() => {
    if (!backendSessionId) {
      return;
    }

    setIsHistoryLoading(true);
    getSessionHistory(backendSessionId)
      .then((history) => {
        setChatMessages(
          history.map((item, index) => ({
            id: `history-${index}`,
            author: item.role === "assistant" ? "ai" : "user",
            agent: item.agent === "none" ? undefined : item.agent,
            content: item.content,
          })),
        );
      })
      .catch((historyError: unknown) => {
        setError(historyError instanceof Error ? historyError.message : "Could not load chat history.");
      })
      .finally(() => setIsHistoryLoading(false));
  }, [backendSessionId]);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatMessages, isSending]);

  async function handleNewChat() {
    setError(null);
    setChatMessages([]);
    setIsHistoryLoading(true);

    try {
      const response = await createChatSession();
      setBackendSessionId(response.session_id);
      setActiveSessionId(response.session_id);
      window.localStorage.setItem("agentic_session_id", response.session_id);
      await refreshSessions();
    } catch (newChatError: unknown) {
      setError(newChatError instanceof Error ? newChatError.message : "Could not create a new chat.");
    } finally {
      setIsHistoryLoading(false);
    }
  }

  function handleSelectSession(sessionId: string) {
    setError(null);
    setActiveSessionId(sessionId);
    setBackendSessionId(sessionId);
    window.localStorage.setItem("agentic_session_id", sessionId);
  }

  async function handleSendMessage(message: string) {
    const userMessage: ChatMessageType = {
      author: "user",
      content: message,
      id: `user-${Date.now()}`,
    };

    setError(null);
    setIsSending(true);
    setChatMessages((current) => [...current, userMessage]);

    try {
      const response = await sendChatMessage({
        message,
        session_id: backendSessionId,
      });

      setBackendSessionId(response.session_id);
      setActiveSessionId(response.session_id);
      window.localStorage.setItem("agentic_session_id", response.session_id);
      setChatMessages((current) => [
        ...current,
        {
          agent: response.agent_used,
          author: "ai",
          content: response.reply,
          id: `assistant-${Date.now()}`,
        },
      ]);
      await refreshSessions();
    } catch (sendError: unknown) {
      const messageText =
        sendError instanceof Error ? sendError.message : "Could not reach the backend server.";
      setError(messageText);
      setChatMessages((current) => [
        ...current,
        {
          agent: "chat",
          author: "ai",
          content: `Error: ${messageText}`,
          id: `error-${Date.now()}`,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  async function handleUploadDocument(file: File) {
    setError(null);
    setIsUploading(true);
    setUploadStatus(`Uploading "${file.name}"...`);

    const pendingDocument: UploadedDocument = {
      id: `upload-${Date.now()}`,
      name: file.name,
      progress: 42,
      size: formatFileSize(file.size),
      status: "uploading",
    };

    setUploadedDocuments((current) => [pendingDocument, ...current]);

    try {
      const response = await uploadDocument(file);
      setUploadStatus(response.message);
      await refreshDocuments();
      setUploadedDocuments((current) =>
        current.map((document) =>
          document.id === pendingDocument.id
            ? { ...document, progress: 100, status: "indexed" }
            : document,
        ),
      );
    } catch (uploadError: unknown) {
      const messageText =
        uploadError instanceof Error ? uploadError.message : "Upload failed.";
      setError(messageText);
      setUploadStatus(messageText);
      setUploadedDocuments((current) =>
        current.filter((document) => document.id !== pendingDocument.id),
      );
    } finally {
      setIsUploading(false);
    }
  }

  if (showLanding) {
    return <LandingHero features={features} onStart={() => setShowLanding(false)} />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0F0F1A] p-4 text-slate-50 sm:p-5">
      <div className="gradient-mesh gradient-mesh-violet" />
      <div className="gradient-mesh gradient-mesh-blue" />

      <div className="relative mx-auto flex h-[calc(100vh-2rem)] max-w-[1480px] gap-5">
        <Sidebar
          activeSessionId={activeSessionId ?? ""}
          onNewChat={() => void handleNewChat()}
          onSelectSession={handleSelectSession}
          sessions={chatSessions}
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
              <p className="text-xs text-slate-600 sm:hidden">
                {backendSessionId ? `Session ${backendSessionId.slice(0, 8)}` : agentLabels[activeSession.agent]}
              </p>
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
                {error ? (
                  <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {error}
                  </div>
                ) : null}
                {isSessionsLoading || isHistoryLoading ? (
                  <ThinkingState label={isSessionsLoading ? "Loading sessions" : "Loading history"} />
                ) : null}
                {!isHistoryLoading && chatMessages.length === 0 ? (
                  <EmptyPrompt onSuggestionClick={(label) => void handleSendMessage(label)} />
                ) : null}
                {chatMessages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isSending ? <ThinkingState /> : null}
                <div ref={scrollAnchorRef} />
              </div>
            </div>
          </div>

          <ChatInput
            disabled={isSending || isHistoryLoading}
            onOpenDrawer={() => setDrawerOpen(true)}
            onSendMessage={handleSendMessage}
            onUploadDocument={handleUploadDocument}
          />
        </section>

        <SessionPanel
          documents={uploadedDocuments}
          isUploading={isUploading}
          onUploadDocument={handleUploadDocument}
          stats={liveAgentStats}
          uploadStatus={uploadStatus}
        />
      </div>

      <button
        className="fixed bottom-24 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-violet-gradient text-2xl font-semibold text-white shadow-violet transition hover:scale-105 xl:hidden"
        onClick={() => setRoutingOpen(true)}
        type="button"
      >
        +
      </button>

      <MobileDrawer
        activeSessionId={activeSessionId ?? ""}
        onClose={() => setDrawerOpen(false)}
        onNewChat={() => void handleNewChat()}
        onSelectSession={handleSelectSession}
        open={drawerOpen}
        sessions={chatSessions}
      />
      <RoutingOverlay open={routingOpen} onClose={() => setRoutingOpen(false)} />
    </main>
  );
}

function EmptyPrompt({ onSuggestionClick }: { onSuggestionClick: (label: string) => void }) {
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
            onClick={() => onSuggestionClick(suggestion.label)}
            type="button"
          >
            {suggestion.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function ThinkingState({ label = "Thinking" }: { label?: string }) {
  return (
    <div className="flex justify-start">
      <div className="ai-bubble flex w-fit items-center gap-3">
        <span className="text-sm font-medium text-slate-400">{label}</span>
        <span className="flex gap-1.5">
          <span className="thinking-dot" />
          <span className="thinking-dot animation-delay-150" />
          <span className="thinking-dot animation-delay-300" />
        </span>
      </div>
    </div>
  );
}

function buildAgentStats(
  messages: ChatMessageType[],
  sessionCounts?: Record<AgentKind, number>,
): AgentStat[] {
  const counts = messages.reduce<Record<AgentKind, number>>(
    (accumulator, message) => {
      if (message.agent) {
        accumulator[message.agent] += 1;
      }

      return accumulator;
    },
    { chat: 0, code: 0, rag: 0, search: 0 },
  );

  const labels: Record<AgentKind, string> = {
    chat: "Chat",
    code: "Code",
    rag: "RAG",
    search: "Search",
  };

  return (Object.keys(labels) as AgentKind[]).map((agent) => ({
    agent,
    count: counts[agent] || sessionCounts?.[agent] || 0,
    label: labels[agent],
  }));
}

function mapBackendSession(session: BackendSession): ChatSession {
  return {
    id: session.session_id,
    title: session.title || "New chat",
    date: formatSessionDate(session.updated_at ?? session.created_at),
    agent: getDominantAgent(session.agent_counts),
    agentCounts: session.agent_counts,
    messageCount: session.message_count,
  };
}

function mapBackendDocument(document: BackendDocument): UploadedDocument {
  return {
    id: document.name,
    name: document.name,
    size: formatFileSize(document.size),
    status: document.status,
  };
}

function getDominantAgent(counts: Record<AgentKind, number>): AgentKind {
  return (Object.entries(counts) as [AgentKind, number][]).reduce(
    (winner, current) => (current[1] > winner[1] ? current : winner),
    ["chat", 0],
  )[0];
}

function formatSessionDate(value: string | null) {
  if (!value) {
    return "Now";
  }

  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
