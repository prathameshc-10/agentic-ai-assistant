export type AgentKind = "chat" | "code" | "search" | "rag";

export type Feature = {
  title: string;
  label: string;
  description: string;
  agent: AgentKind;
};

export type ChatSession = {
  id: string;
  title: string;
  date: string;
  agent: AgentKind;
  agentCounts?: Record<AgentKind, number>;
  messageCount?: number;
};

export type ChatMessage = {
  id: string;
  author: "user" | "ai";
  content: string;
  agent?: AgentKind;
  code?: {
    language: string;
    lines: string[];
  };
};

export type UploadedDocument = {
  id: string;
  name: string;
  size: string;
  status: "indexed" | "uploading";
  progress?: number;
};

export type BackendSession = {
  session_id: string;
  title: string;
  created_at: string | null;
  updated_at: string | null;
  message_count: number;
  agent_counts: Record<AgentKind, number>;
};

export type BackendDocument = {
  name: string;
  size: number;
  status: "indexed";
};

export type AgentStat = {
  agent: AgentKind;
  label: string;
  count: number;
};

export type Suggestion = {
  id: string;
  label: string;
};
