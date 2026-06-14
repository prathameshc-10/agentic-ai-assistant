import type { AgentKind } from "../types/agentic-ui";

type ChatRequest = {
  session_id: string | null;
  message: string;
};

type ChatResponse = {
  session_id: string;
  reply: string;
  agent_used: AgentKind;
};

type HistoryItem = {
  role: "user" | "assistant";
  content: string;
  agent: AgentKind | "none";
};

type UploadResponse = {
  message: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;

    try {
      const body = (await response.json()) as { detail?: string };
      detail = body.detail ?? detail;
    } catch {
      // The backend does not always return JSON for unexpected failures.
    }

    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export async function sendChatMessage(payload: ChatRequest) {
  const response = await fetch("/api/chat", {
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  return parseResponse<ChatResponse>(response);
}

export async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    body: formData,
    method: "POST",
  });

  return parseResponse<UploadResponse>(response);
}

export async function getSessionHistory(sessionId: string) {
  const response = await fetch(`/api/history/${sessionId}`);

  return parseResponse<HistoryItem[]>(response);
}
