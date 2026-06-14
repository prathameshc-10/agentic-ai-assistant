import type {
  AgentKind,
  AgentStat,
  ChatMessage,
  ChatSession,
  Feature,
  Suggestion,
  UploadedDocument,
} from "../types/agentic-ui";

export const agentLabels: Record<AgentKind, string> = {
  chat: "Smart Chat",
  code: "Code Agent",
  search: "Search Agent",
  rag: "RAG Agent",
};

export const agentAccent: Record<AgentKind, string> = {
  chat: "violet",
  code: "blue",
  search: "green",
  rag: "amber",
};

export const features: Feature[] = [
  {
    title: "Web Search",
    label: "S",
    description: "Research live sources and synthesize concise, cited answers.",
    agent: "search",
  },
  {
    title: "Code Writer",
    label: "C",
    description: "Generate scripts, refactor modules, and explain changes.",
    agent: "code",
  },
  {
    title: "Document Q&A",
    label: "D",
    description: "Ask grounded questions over uploaded PDF and TXT files.",
    agent: "rag",
  },
  {
    title: "Smart Chat",
    label: "A",
    description: "Route every prompt to the right specialist agent.",
    agent: "chat",
  },
];

export const sessions: ChatSession[] = [
  { id: "rag-pipeline", title: "Build RAG pipeline", date: "Today", agent: "rag" },
  { id: "auth-helper", title: "Python auth helper", date: "Today", agent: "code" },
  { id: "model-news", title: "Latest model news", date: "Yesterday", agent: "search" },
  { id: "product-brainstorm", title: "Product brainstorm", date: "Yesterday", agent: "chat" },
];

export const messages: ChatMessage[] = [
  {
    id: "m1",
    author: "user",
    content: "Can you write a Python script that loads PDFs, chunks them, and builds a small RAG chain?",
  },
  {
    id: "m2",
    author: "ai",
    agent: "code",
    content:
      "Absolutely. I will route this through the code agent and keep the retrieval layer simple enough to extend later.",
    code: {
      language: "python",
      lines: [
        "def summarize_pdf(path):",
        "    docs = loader.load(path)",
        "    chunks = splitter.split_documents(docs)",
        "    return rag_agent.ask(chunks)",
      ],
    },
  },
  {
    id: "m3",
    author: "user",
    content: "Nice. Also search for current best practices before we finalize the chunking strategy.",
  },
];

export const documents: UploadedDocument[] = [
  { id: "d1", name: "requirements.pdf", size: "1.8 MB", status: "indexed" },
  { id: "d2", name: "architecture.txt", size: "42 KB", status: "indexed" },
  { id: "d3", name: "research-notes.pdf", size: "2.4 MB", status: "uploading", progress: 68 },
];

export const agentStats: AgentStat[] = [
  { agent: "chat", label: "Chat", count: 8 },
  { agent: "code", label: "Code", count: 6 },
  { agent: "search", label: "Search", count: 7 },
  { agent: "rag", label: "RAG", count: 3 },
];

export const suggestions: Suggestion[] = [
  { id: "s1", label: "Search latest AI news" },
  { id: "s2", label: "Write a Python script" },
  { id: "s3", label: "Explain my document" },
  { id: "s4", label: "Tell me a joke" },
];
