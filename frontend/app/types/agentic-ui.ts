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

export type AgentStat = {
  agent: AgentKind;
  label: string;
  count: number;
};

export type Suggestion = {
  id: string;
  label: string;
};
